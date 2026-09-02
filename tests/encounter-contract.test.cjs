"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const project = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(project, "game.js"), "utf8");
const worker = fs.readFileSync(path.join(project, "simulator-worker.js"), "utf8");

function fixture(legacy=false) {
  const sandbox = { URLSearchParams, performance, console, setTimeout:() => 0, clearTimeout() {} };
  Object.assign(sandbox, { self:sandbox, location:{ search:"?headless=1" }, addEventListener() {}, removeEventListener() {} });
  const context = vm.createContext(sandbox);
  const run = code => vm.runInContext(code, context);
  run(worker.slice(0, worker.indexOf('importScripts("simulator-core.js')));
  run(legacy ? source.replace("const ENCOUNTER_DRAFT_PROTOTYPE = true;", "const ENCOUNTER_DRAFT_PROTOTYPE = false;") : source);
  run(`
    function setup(seed=751) {
      __tdHeadless.setParams({});
      __tdHeadless.setSeed(seed);
      __tdHeadless.resetMathPool(100);
      __tdHeadless.resetRun(10000, 3);
      addHero(HEROES[0]);
      state.started = true;
    }
    function card(laneId, formationId, attr="neutral") {
      const lane = ENCOUNTER_LANES.find(item => item.id === laneId);
      const formation = ENCOUNTER_FORMATIONS.find(item => item.id === formationId);
      const combat = encounterCombatProfile(formation, lane, 1);
      return {
        ...combat, id:"test", wave:1, boss:false, formation:formationId, formationLabel:formation.label,
        lane:laneId, attr, threat:lane.threat, reward:lane.reward, enemyCount:12,
        forcedElites:formation.eliteCount,
        expMul:1, rewardFactor:ENCOUNTER_REWARD_FACTORS[lane.reward], art:encounterArtFor(attr, formation),
      };
    }
    setup();
  `);
  return code => JSON.parse(JSON.stringify(run(code)));
}

test("prototype has a distinct economic identity; legacy math remains available outside prototype", () => {
  const run = fixture();
  assert.equal(run("certifiedMathEnabled()"), false);
  assert.equal(run("__tdHeadless.params().mathModelEnabled"), 0);
  assert.equal(run("__tdHeadless.snapshot().economyMode"), "encounter-playtest-unbalanced");
  const legacy = fixture(true);
  assert.equal(legacy("certifiedMathEnabled()"), true);
  assert.equal(legacy("DEFAULT_PARAMS.mathTargetRtp"), .95);
});

test("offers have three distinct formations; grades and rewards do not depend on player's build or HP", () => {
  const run = fixture();
  for (let seed=1; seed<=50; seed+=1) {
    const offers = run(`(() => {
      setup(${seed});
      __tdHeadless.setSeed(${seed});
      const before = buildRegularEncounterChoices(1);
      state.hp = 10;
      ["laser", "cryo", "needle"].forEach(id => addTower(TOWERS.find(t => t.id === id)));
      __tdHeadless.setSeed(${seed});
      const after = buildRegularEncounterChoices(1);
      const strip = choices => choices.map(({matchup, ...rest}) => rest);
      return [strip(before), strip(after)];
    })()`);
    assert.deepEqual(offers[0], offers[1]);
    assert.equal(new Set(offers[0].map(x => x.formation)).size, 3);
    assert.deepEqual(offers[0].map(x => x.threat).sort(), [1, 2, 3]);
    assert.ok(offers[0].every(x => x.estimatedClear === null));
  }
});

test("card portrait, monster roster, range and batch rhythm agree across all attributes", () => {
  const run = fixture();
  for (const attr of ["neutral", "fire", "ice", "electric", "poison"]) {
    for (const formation of ["swarm", "rush", "armor", "siege", "elite"]) {
      const data = run(`(() => {
        setup();
        const selected = card("tactical", ${JSON.stringify(formation)}, ${JSON.stringify(attr)});
        startWave(selected);
        const kinds = state.spawn.normalQueue.map(entry => entry.kind);
        const expected = encounterNormalKind(selected);
        updateSpawn(1/60);
        const initial = state.monsters.map(m => ({ id:m.tuneId, elite:m.elite, range:m.range, speed:m.speed }));
        const ids = new Set(initial.map(m => m.id));
        while (state.spawn) {
          updateSpawn(1);
          state.monsters.forEach(m => ids.add(m.tuneId));
        }
        return { kinds, expected, initial, portrait:selected.art.id, ids:[...ids],
          count:state.monsters.length, advertised:selected.enemyCount + selected.forcedElites,
          batch:selected.batchSize, range:selected.range };
      })()`);
      assert.ok(data.kinds.every(kind => kind === data.expected));
      assert.equal(data.count, data.advertised);
      assert.ok(data.ids.includes(data.portrait));
      assert.equal(data.initial.length, data.batch + (formation === "elite" ? 1 : 0));
      if (formation === "elite") assert.equal(data.initial[0].elite, true);
      else assert.ok(data.initial.every(m => m.range === data.range));
    }
  }
});

test("higher threat produces stronger enemies for the same formation and element", () => {
  const run = fixture();
  for (const formation of ["swarm", "rush", "armor", "siege", "elite"]) {
    const stats = ["steady", "tactical", "greedy"].map(lane => run(`(() => {
      setup(); startWave(card(${JSON.stringify(lane)}, ${JSON.stringify(formation)})); updateSpawn(1/60);
      return { hp:state.monsters[0].maxHp, atk:state.monsters[0].atk, every:state.spawn.every,
        attackMultiplier:state.currentEncounter.atkMul };
    })()`));
    assert.ok(stats[0].hp < stats[1].hp && stats[1].hp < stats[2].hp);
    // Small integer attack values may tie after rounding; configured pressure must still increase.
    assert.ok(stats[0].atk <= stats[1].atk && stats[1].atk <= stats[2].atk);
    assert.ok(stats[0].attackMultiplier < stats[1].attackMultiplier && stats[1].attackMultiplier < stats[2].attackMultiplier);
    assert.ok(stats[0].every > stats[1].every && stats[1].every > stats[2].every);
  }
});

test("opening pressure ramps by wave only and stops increasing at wave four", () => {
  const run = fixture();
  const data = run(`(() => {
    const formation = ENCOUNTER_FORMATIONS.find(item => item.id === "armor");
    const lane = ENCOUNTER_LANES.find(item => item.id === "greedy");
    const profiles = [1,2,3,4,7].map(wave => encounterCombatProfile(formation, lane, wave));
    state.hp = 1; addTower(TOWERS[0]);
    const damaged = encounterCombatProfile(formation, lane, 1);
    return {profiles, damaged};
  })()`);
  assert.deepEqual(data.profiles[0], data.damaged);
  assert.deepEqual(data.profiles[3], data.profiles[4]);
  for (let index=1; index<4; index+=1) {
    assert.ok(data.profiles[index].hpMul > data.profiles[index-1].hpMul);
    assert.ok(data.profiles[index].atkMul > data.profiles[index-1].atkMul);
  }
  assert.ok(data.profiles[3].hpMul <= 3.81);
});

test("chest ranges do not overlap at equal BET; payout survives upgrades and settles exactly once", () => {
  const run = fixture();
  let previousMaximum = -1;
  for (let tier=1; tier<=4; tier+=1) {
    const bounds = run(`(() => {
      setup(); Math.random = () => 0;
      const minimum = rollEncounterWaveReward({reward:${tier}}, 100).budget;
      state.rewardRoundingCarry = .5; Math.random = () => .999999;
      const maximum = rollEncounterWaveReward({reward:${tier}}, 100).budget;
      return [minimum, maximum];
    })()`);
    assert.ok(bounds[0] > previousMaximum);
    previousMaximum = bounds[1];
    const result = run(`(() => {
      setup(); state.wallet -= 100; state.pot = 37; state.bossAdd = 2;
      const selected = card("tactical", "swarm"); selected.reward = ${tier};
      startWave(selected);
      const budget = state.waveReward.budget;
      const bonus = state.waveReward.clearBonus;
      const before = JSON.stringify(state.waveReward);
      addTower(TOWERS[0]); repriceActiveMathTicket("upgrade");
      const unchanged = before === JSON.stringify(state.waveReward);
      while (state.spawn) updateSpawn(1);
      state.monsters.forEach(kill);
      const killPot = state.pot;
      state.monsters = []; checkWaveClear();
      const fullPot = state.pot, award = payout();
      checkWaveClear();
      const duplicate = state.pot;
      collect(); const wallet = state.wallet; collect();
      return { budget, bonus, unchanged, killPot, fullPot, award, duplicate, wallet, secondWallet:state.wallet };
    })()`);
    assert.ok(result.unchanged);
    assert.equal(result.killPot, 37 + result.budget - result.bonus);
    assert.equal(result.fullPot, 37 + result.budget);
    assert.equal(result.award, result.fullPot * 3);
    assert.equal(result.duplicate, result.fullPot);
    assert.equal(result.wallet, 9900 + result.award);
    assert.equal(result.secondWallet, result.wallet);
  }
});

test("death grants no clear chest and respects the existing at-risk POT loss rule", () => {
  const run = fixture();
  const result = run(`(() => {
    setup(); state.wallet -= 100; startWave(card("greedy", "rush"));
    updateSpawn(1/60); kill(state.monsters[0]);
    defeatRun(); state.monsters = []; state.spawn = null; checkWaveClear();
    return { wallet:state.wallet, pot:state.pot, payout:payout(), claimed:state.waveReward.claimedBonus };
  })()`);
  assert.deepEqual(result, { wallet:9900, pot:0, payout:0, claimed:0 });
});

test("enemies killed this frame cannot attack the base before being removed", () => {
  const run = fixture();
  const result = run(`(() => {
    setup(); startWave(card("greedy", "rush")); updateSpawn(1/60);
    const m = state.monsters[0]; m.hp = 0; m.y = FIELD.attackLineY; m.atkCd = 0; m.atk = 9999;
    updateEnemies(1/60);
    return { hp:state.hp, over:state.over };
  })()`);
  assert.deepEqual(result, { hp:1000, over:false });
});

test("all bosses retain their exclusive chest and card, regardless of matchup", () => {
  const run = fixture();
  for (const attr of ["neutral", "fire", "ice", "electric", "poison"]) {
    const result = run(`(() => {
      setup(); state.biomeOrder = [${JSON.stringify(attr)}];
      const selected = buildBossEncounterChoices(8)[0];
      return { reward:selected.reward, art:compositeEncounterCardArt(selected), boss:selected.boss };
    })()`);
    assert.equal(result.reward, 4);
    assert.equal(result.art, `assets/ui/encounter/boss-card-${attr}.png`);
    assert.equal(result.boss, true);
  }
});

test("campaign BOSS HP follows its ordinal, not the random arrival wave or player health", () => {
  const run = fixture();
  const data = run(`(() => {
    const stats = [];
    for (let ordinal=1; ordinal<=5; ordinal+=1) {
      const pair = [7, 14].map(arrival => {
        setup(); state.wave = arrival; state.hp = arrival === 7 ? 1000 : 50;
        return makeEnemy(BOSS_VARIANTS.neutral, waveInfo().hpMul, 175, 0, "boss", 0,
          false, true, "straight", BOSS_VARIANTS.neutral.id, "neutral", ordinal, 0,
          {hpMul:1, atkMul:1, speedMul:1}).maxHp;
      });
      stats.push(pair);
    }
    return stats;
  })()`);
  data.forEach(pair => assert.equal(pair[0], pair[1]));
  for (let index=1; index<data.length; index+=1) assert.ok(data[index][0] > data[index-1][0]);
});

test("clear XP and wave receipt settle once; BOSS repair is bounded and never changes POT", () => {
  const run = fixture();
  const data = run(`(() => {
    setup(); state.hp = 760; state.pot = 100;
    const selected = card("greedy", "elite"); selected.boss = true;
    startWave(selected); state.bossSeen = 1;
    state.hp = 140; state.pot += state.waveReward.budget - state.waveReward.clearBonus;
    state.spawn = null; state.monsters = [];
    const budget = state.waveReward.budget, exp = state.waveReward.clearExp;
    checkWaveClear();
    const first = {hp:state.hp, pot:state.pot, exp:state.exp, summary:{...state.waveSummary}};
    checkWaveClear();
    return {first, second:{hp:state.hp,pot:state.pot,exp:state.exp}, budget, exp};
  })()`);
  assert.equal(data.first.hp, 490);
  assert.equal(data.first.pot, 100 + data.budget);
  assert.equal(data.first.exp, data.exp);
  assert.equal(data.first.summary.damage, 620);
  assert.equal(data.first.summary.repair, 350);
  assert.equal(data.first.summary.pot, data.budget);
  assert.deepEqual(data.second, {hp:data.first.hp,pot:data.first.pot,exp:data.first.exp});
  assert.equal(run(`(() => { setup(); state.hp=980; state.bossSeen=1; advancePrototypeBiome(); return state.hp; })()`), 1000);
});

test("default prototype stake can fund the longest five-zone route without rerolls", () => {
  const run = fixture();
  const result = run(`(() => {
    __tdHeadless.resetRun();
    let cost=0;
    for(let wave=1;wave<=70;wave+=1) cost+=betForWave(wave,Math.floor((wave-1)/14));
    return {bet:BET_STEPS[state.baseBetIndex],wallet:state.wallet,cost};
  })()`);
  assert.equal(result.bet, 50);
  assert.ok(result.cost <= result.wallet);
});
