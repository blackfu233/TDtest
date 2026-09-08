"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const project = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(project, "game.js"), "utf8");
const worker = fs.readFileSync(path.join(project, "simulator-worker.js"), "utf8");
const tuningRules = require("../encounter-tuning-data.js");
const tuningView = require("../tuner-encounter.js");

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

test("encounter tuner fixed-rule snapshot matches the actual game source", () => {
  assert.deepEqual(tuningRules, require("../tools/export-encounter-tuning.cjs").readRules());
  for (const probabilities of Object.values(tuningRules.formationProbabilities))
    assert.ok(Math.abs(Object.values(probabilities).reduce((a,b)=>a+b,0)-1)<1e-12);
});

test("encounter tuner payout ranges, clear money and EXP agree with game reward rolls", () => {
  const run=fixture();
  for(const candidate of [{}, {encounterRewardScale:.5,moneyMul:1.2,expMul:2}, {encounterEconomyEnabled:0}]) {
    const params=run(`__tdHeadless.setParams(${JSON.stringify(candidate)}); __tdHeadless.params()`);
    const preview=tuningView.calculate(params,{bet:100,multiplier:2});
    for(const chest of preview.chests) {
      const rewards=run(`Array.from({length:20},()=>rollEncounterWaveReward({reward:${chest.tier},boss:${chest.id==="boss"}},100))`);
      for(const reward of rewards) {
        assert.ok(reward.budget>=chest.coinMin && reward.budget<=chest.coinMax);
        assert.equal(reward.clearExp,chest.clearExp);
        assert.equal(reward.clearBonus,Math.round(reward.budget*chest.clearShare));
        assert.equal(reward.budget,reward.remaining+reward.clearBonus);
      }
    }
  }
  const preview=tuningView.calculate(run("__tdHeadless.setParams({}); __tdHeadless.params()"));
  assert.ok(Math.abs(preview.chests[0].meanPot-84.87)<1e-10);
  assert.deepEqual(preview.chests.map(c=>c.clearExp),[0,0,0,0,0]);
  assert.deepEqual(preview.experience.map(c=>c.killExpFactor),[.8,1.05,1.42,1.9]);
});

test("encounter tuner composition preview uses current wave and combat parameters", () => {
  const run=fixture();
  for(const wave of [1,4,12,40,70]) {
    const params=run("__tdHeadless.params()");
    for(const row of tuningView.calculate(params,{wave}).formations) {
      const actual=run(`encounterCombatProfile(ENCOUNTER_FORMATIONS.find(f=>f.id===${JSON.stringify(row.id)}),ENCOUNTER_LANES.find(l=>l.id===${JSON.stringify(row.lane)}),${wave})`);
      assert.equal(row.hp,actual.hpMul);
      assert.equal(row.atk,actual.atkMul);
      assert.equal(row.speed,actual.speedMul);
      assert.equal(row.gap,params.spawnInterval*Math.max(.25,actual.spawnGapMul));
      const counts=run(`tunedBand(bandFor(${wave}),${wave}).count`).map(count=>Math.max(row.id==="elite"?2:4,Math.round(count*actual.countMul)));
      assert.deepEqual(row.counts,counts);
    }
  }
});

test("259 retains broad prize ranges and a rising chest hierarchy", () => {
  const run=fixture(),preview=tuningView.calculate(run("__tdHeadless.params()"),{bet:100});
  const samples=run(`[1,2,3,4].map(tier=>{
    const amounts=Array.from({length:2000},(_,i)=>{
      Math.random=()=>(i+.5)/2000;state.rewardRoundingCarry=.5;
      return rollEncounterWaveReward({reward:tier,boss:false},100).budget;
    });
    return {mean:amounts.reduce((a,b)=>a+b,0)/amounts.length,
      profit:amounts.filter(v=>v>100).length/amounts.length,min:Math.min(...amounts),max:Math.max(...amounts)};
  })`);
  samples.forEach((sample,i)=>{
    assert.ok(sample.min<100 && sample.max>100);
    assert.ok(Math.abs(sample.mean-preview.chests[i].meanPot)<.025,JSON.stringify({sample,preview:preview.chests[i]}));
    assert.ok(Math.abs(sample.profit-preview.chests[i].profitChance)<.006);
    if(i) assert.ok(sample.mean>samples[i-1].mean);
  });
  assert.deepEqual(preview.chests.slice(0,4).map(c=>[Math.round(c.potLow),Math.round(c.potHigh)]),[[25,145],[29,148],[54,156],[57,164]]);
});

test("chest upgrades change only money, never kill EXP or clear EXP", () => {
  const run=fixture();
  const values=run(`ENCOUNTER_LANES.map(lane=>{
    const formation=ENCOUNTER_FORMATIONS[0];
    params.encounterChestUpgradeChance=0;const base=encounterContract(lane,formation);
    params.encounterChestUpgradeChance=1;const promoted=encounterContract(lane,formation);
    const reward=rollEncounterWaveReward(promoted,100);
    return {base,promoted,clearExp:reward.clearExp};
  })`);
  values.forEach(({base,promoted,clearExp})=>{
    assert.equal(promoted.reward,base.reward+1);
    assert.equal(promoted.expMul,base.expMul);
    assert.equal(clearExp,0);
  });
});

test("BOSS chest awards multiplier only; escorts keep money and clear adds neither money nor EXP", () => {
  const run=fixture();
  const result=run(`(()=>{
    setup();const selected=buildBossEncounterChoices(7)[0];startWave(selected);
    for(let step=0;step<500 && state.spawn;step++) {
      updateSpawn(1);
      state.monsters.filter(m=>!m.boss).forEach(kill);
      state.monsters=state.monsters.filter(m=>m.boss);
    }
    if(state.spawn) throw new Error("BOSS fixture did not finish spawning");
    const boss=state.monsters.find(m=>m.boss);
    state.monsters.filter(m=>!m.boss).forEach(kill);
    const afterEscorts=state.pot;kill(boss);
    const afterBoss={pot:state.pot,exp:state.exp,add:state.bossAdd};
    kill(boss);state.monsters=[];checkWaveClear();
    const afterClear={pot:state.pot,exp:state.exp,add:state.bossAdd};
    checkWaveClear();
    return {afterEscorts,afterBoss,afterClear,finalPot:state.pot,reward:state.waveReward};
  })()`);
  assert.equal(result.afterEscorts,result.reward.budget);
  assert.equal(result.reward.id,"boss-escorts");
  assert.equal(result.reward.clearBonus,0);
  assert.equal(result.reward.claimedBonus,0);
  assert.equal(result.afterBoss.pot,result.afterEscorts);
  assert.ok(result.afterBoss.add>0);
  assert.deepEqual(result.afterClear,result.afterBoss);
  assert.equal(result.finalPot,result.afterClear.pot);
});

test("259 preset migration is shared, scoped, idempotent and preserves custom prize groups", () => {
  const run=fixture(),defaults=run("__tdHeadless.params()");
  const tuner=fs.readFileSync(path.join(project,"tuner.js"),"utf8");
  const extract=text=>text.slice(text.indexOf("function migrateEncounterRewardParams("),text.indexOf("function migrateBossParams("));
  assert.equal(extract(tuner),extract(source));
  const old={...defaults,encounterRewardRevision:0,baseHp:888,encounterRewardScale:.46,
    encounterChest1Min:.3,encounterChest1Max:.42,encounterChest2Min:.5,encounterChest2Max:.7,
    encounterChest3Min:.9,encounterChest3Max:1.2,encounterChest4Min:1.8,encounterChest4Max:2.4,
    encounterBossChestMin:.6,encounterBossChestMax:1,
    encounterBossSmallMin:.1,encounterBossSmallMax:.2,encounterBossMediumMin:.3,encounterBossMediumMax:.5,
    encounterBossLargeMin:1.8,encounterBossLargeMax:3.2};
  const migrate=input=>run(`migrateEncounterRewardParams(${JSON.stringify(input)})`);
  const current=migrate(old);
  assert.equal(current.baseHp,888);
  for(const key of Object.keys(tuningRules.encounterDefaults)) assert.equal(current[key],defaults[key],key);
  assert.deepEqual(migrate(current),current);
  const custom=migrate({...old,encounterChest2Max:1.7,encounterBossMediumMax:.95});
  assert.equal(custom.encounterRewardScale,.46);
  assert.equal(custom.encounterChest1Max,.42);
  assert.equal(custom.encounterChest2Max,1.7);
  assert.equal(custom.encounterBossMediumMax,.95);
  assert.equal(custom.encounterBossLargeMax,3.2);
  assert.ok(Math.abs(custom.encounterBossChestMax-.6)<1e-12);
  const preset251={...defaults,encounterRewardRevision:251,
    encounterGrade1HpMul:1.45,encounterGrade2HpMul:.85,encounterGrade3HpMul:.72,
    encounterGrade1AtkMul:10,encounterGrade2AtkMul:14,encounterGrade3AtkMul:11.5,encounterBaseHitCap:300,
    encounterChest1Min:.10,encounterChest1Max:1.20,encounterChest2Min:.20,encounterChest2Max:1.60,
    encounterChest3Min:.40,encounterChest3Max:2.20,encounterChest4Min:.80,encounterChest4Max:3.20};
  assert.deepEqual(migrate(preset251),defaults);
  const custom251=migrate({...preset251,encounterChest2Max:1.73,encounterGrade2AtkMul:8});
  assert.equal(custom251.encounterChest1Max,1.20);
  assert.equal(custom251.encounterChest2Max,1.73);
  assert.equal(custom251.encounterGrade2AtkMul,8);
  assert.equal(custom251.encounterGrade3AtkMul,defaults.encounterGrade3AtkMul);
  const preset252=migrate({...defaults,encounterRewardRevision:252,encounterRewardScale:1});
  assert.deepEqual(preset252,defaults);
  const custom252=migrate({...defaults,encounterRewardRevision:252,encounterRewardScale:.97});
  assert.equal(custom252.encounterRewardScale,.97);
  assert.equal(custom252.encounterRewardRevision,259);
  const preset253=migrate({...defaults,encounterRewardRevision:253,encounterRewardScale:1.04,
    hero_ice_damage:160,hero_ice_rate:.58,hero_ice_secondaryMul:.68,hero_neutral_damage:60});
  assert.deepEqual(preset253,defaults);
  const custom253=migrate({...preset253,encounterRewardRevision:253,encounterRewardScale:.96,hero_ice_damage:205});
  assert.equal(custom253.encounterRewardScale,.96);
  assert.equal(custom253.hero_ice_damage,205);
  assert.equal(custom253.encounterRewardRevision,259);
  const preset254=migrate({...defaults,encounterRewardRevision:254,
    encounterBossSmallWeight:88,encounterBossMediumWeight:11,encounterBossLargeWeight:1,
    encounterBossSmallMin:.10,encounterBossSmallMax:.40,encounterBossMediumMin:.50,encounterBossMediumMax:1,
    encounterBossLargeMin:1.10,encounterBossLargeMax:1.80,encounterBossDepthGrowth:.10});
  assert.deepEqual(preset254,defaults);
  const custom254=migrate({...preset254,encounterRewardRevision:254,encounterBossMediumMax:1.25});
  assert.equal(custom254.encounterBossMediumMax,1.25);
  assert.equal(custom254.encounterBossSmallMax,defaults.encounterBossSmallMax);
  assert.equal(custom254.encounterRewardRevision,259);
  const preset255={...defaults,encounterRewardRevision:255,
    encounterRewardScale:.99,encounterHpDepthGrowth:.13,encounterHpDepthCap:3,encounterGrade2HpMul:1.05,encounterGrade3HpMul:1,
    encounterBossSmallWeight:70,encounterBossMediumWeight:23,encounterBossLargeWeight:7,
    encounterBossSmallMin:.25,encounterBossSmallMax:.65,encounterBossMediumMin:1,encounterBossMediumMax:1.8,
    encounterBossLargeMin:2.5,encounterBossLargeMax:5,encounterBossDepthGrowth:.4};
  delete preset255.encounterMinionBaseHitLimit;
  assert.deepEqual(migrate(preset255),defaults);
  const custom255=migrate({...preset255,encounterGrade2HpMul:1.01});
  assert.equal(custom255.encounterGrade2HpMul,1.01);
  assert.equal(custom255.encounterHpDepthGrowth,defaults.encounterHpDepthGrowth);
  assert.equal(custom255.encounterMinionBaseHitLimit,1);
  assert.equal(custom255.encounterRewardRevision,259);
  const preset256={...defaults,encounterRewardRevision:256,
    encounterRewardScale:.93,encounterHpDepthGrowth:.075,encounterHpDepthCap:2,
    encounterGrade2HpMul:.95,encounterGrade3HpMul:.82,
    encounterChest1Min:.20,encounterChest1Max:1.70,encounterChest2Min:.40,encounterChest2Max:1.80,
    encounterChest3Min:.55,encounterChest3Max:1.90,encounterChest4Min:.70,encounterChest4Max:2.10};
  assert.deepEqual(migrate(preset256),defaults);
  const custom256=migrate({...preset256,encounterChest3Max:2.20});
  assert.equal(custom256.encounterChest3Max,2.20);
  assert.equal(custom256.encounterGrade3HpMul,defaults.encounterGrade3HpMul);
  assert.equal(custom256.encounterRewardRevision,259);
  const preset257={...defaults,encounterRewardRevision:257,encounterRewardScale:.96,
    encounterChest1Min:.25,encounterChest1Max:1.75,encounterChest3Min:.60,encounterChest3Max:1.90};
  assert.deepEqual(migrate(preset257),defaults);
  const custom257=migrate({...preset257,encounterChest1Max:1.79});
  assert.equal(custom257.encounterChest1Max,1.79);
  assert.equal(custom257.encounterChest3Min,defaults.encounterChest3Min);
  assert.equal(custom257.encounterRewardRevision,259);
  const preset258={...defaults,encounterRewardRevision:258,encounterRewardScale:.94,
    encounterBossSmallWeight:90,encounterBossMediumWeight:9,encounterBossLargeWeight:1,
    encounterBossSmallMin:.10,encounterBossSmallMax:.18,encounterBossMediumMin:.30,encounterBossMediumMax:.60,
    encounterBossLargeMin:1.20,encounterBossLargeMax:2.20,encounterBossDepthGrowth:.08};
  assert.deepEqual(migrate(preset258),defaults);
  const custom258=migrate({...preset258,encounterBossMediumMax:.75});
  assert.equal(custom258.encounterBossMediumMax,.75);
  assert.equal(custom258.encounterBossSmallMin,defaults.encounterBossSmallMin);
  assert.equal(custom258.encounterRewardRevision,259);
});

test("regular enemies breach once without a kill reward while BOSS attacks remain persistent", () => {
  const run=fixture();
  const result=run(`(()=>{
    setup();state.waveActive=true;state.waveSummary={startHp:state.hp,startPot:state.pot,pot:0,damage:0,damageTaken:0,damageHits:0,repair:0,clearExp:0};
    const regular={hp:100,maxHp:100,y:FIELD.attackLineY,x:FIELD.pathX,range:0,atk:25,interval:1,atkCd:0,
      boss:false,elite:false,size:14,speed:0,freezeTime:0,stunTime:0,slowTime:0,burnTime:0,poisonTime:0,toxicTime:0,vulnerable:0,
      bossBreakTime:0,focusMarkTime:0,electricVulnerableTime:0,flameBurstCd:0,poisonBurstCd:0,rewardClaimed:false};
    state.monsters=[regular];updateEnemies(1/60);
    const afterRegular={hp:state.hp,count:state.monsters.length,hits:state.waveSummary.damageHits,pot:state.pot,rewardClaimed:regular.rewardClaimed};
    const boss={...regular,hp:100,maxHp:100,boss:true,rewardClaimed:false,atkCd:0,bossAttackWindup:0,bossAttackPause:0};
    state.monsters=[boss];updateEnemies(1/60);
    const afterBoss={hp:state.hp,count:state.monsters.length,rewardClaimed:boss.rewardClaimed};
    return {afterRegular,afterBoss};
  })()`);
  assert.deepEqual(result.afterRegular,{hp:975,count:0,hits:1,pot:0,rewardClaimed:true});
  assert.equal(result.afterBoss.count,1);
  assert.equal(result.afterBoss.rewardClaimed,false);
});

test("BOSS schedule preview follows the actual random 7-14 encounter rule", () => {
  const run=fixture(),preview=tuningView.calculate(run("__tdHeadless.params()"));
  assert.deepEqual(run(`(()=>{Math.random=()=>0;const min=rollPrototypeBossEncounter();Math.random=()=>.999999;return [min,rollPrototypeBossEncounter()]})()`),[7,14]);
  assert.deepEqual(preview.bossSchedule.map(b=>[b.min,b.max]),[[7,14],[14,28],[21,42],[28,56],[35,70]]);
  assert.equal(preview.bossHazard[0].probability,1/8);
  assert.equal(preview.bossHazard.at(-1).probability,1);
  assert.deepEqual(run(`(()=>{
    setup();state.biomeBossAt=9;state.biomeWave=7;state.nextBossWave=0;
    const before=consumeBossPreview(8,waveInfo());state.biomeWave=8;
    return [before,consumeBossPreview(9,waveInfo())];
  })()`),[false,true]);
});

test("BOSS increment tiers separate common, meaningful and jackpot outcomes", () => {
  const run=fixture();
  const configured=run("[params.encounterBossSmallWeight,params.encounterBossMediumWeight,params.encounterBossLargeWeight,params.encounterBossDepthGrowth]");
  const values=run(`["Small","Medium","Large"].map(part=>{
    for(const key of ["Small","Medium","Large"]) params["encounterBoss"+key+"Weight"]=key===part?1:0;
    const draws=Array.from({length:1001},(_,i)=>{Math.random=()=>i/1001;return rollEncounterBossAdd(1)});
    return [...new Set(draws)].sort((a,b)=>a-b);
  })`);
  assert.deepEqual(values.map(v=>[v[0],v.at(-1),v.length]),[[.8,1,3],[1.3,2,8],[2,3,11]]);
  assert.deepEqual(configured,[85,13,2,.10]);
});

test("prototype has a distinct economic identity; legacy math remains available outside prototype", () => {
  const run = fixture();
  assert.equal(run("certifiedMathEnabled()"), false);
  assert.equal(run("__tdHeadless.params().mathModelEnabled"), 0);
  assert.equal(run("__tdHeadless.snapshot().economyMode"), "encounter-rtp-candidate-259");
  assert.deepEqual(run("[params.encounterRtpTargetMin, params.encounterRtpTargetMax]"), [.96, 1]);
  const legacy = fixture(true);
  assert.equal(legacy("certifiedMathEnabled()"), true);
  assert.equal(legacy("DEFAULT_PARAMS.mathTargetRtp"), .95);
});

test("encounter tuning defaults match the game and external updates wait until the next run", () => {
  const tuner = fs.readFileSync(path.join(project, "tuner.js"), "utf8");
  const block = tuner.match(/const ENCOUNTER_PARAM_DEFAULTS = (\{[\s\S]*?\});/);
  assert.ok(block);
  const tunerDefaults = JSON.parse(JSON.stringify(vm.runInNewContext(`(${block[1]})`)));
  const run = fixture();
  assert.deepEqual(run("ENCOUNTER_PARAM_DEFAULTS"), tunerDefaults);
  const result = run(`(() => {
    setup();
    const before = {...params};
    applyExternalParams({...params, encounterRewardScale:.42, baseHp:800});
    const current = [params.encounterRewardScale, params.baseHp, state.hp];
    reset();
    return {before:[before.encounterRewardScale,before.baseHp,1000],current,
      next:[params.encounterRewardScale,params.baseHp,state.hp],pending:pendingExternalParams};
  })()`);
  assert.deepEqual(result.current,result.before);
  assert.deepEqual(result.next,[.42,800,800]);
  assert.equal(result.pending,null);
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

test("all regular grades can upgrade their chest once without changing combat or using BOSS art", () => {
  const run = fixture();
  const data = run(`(() => {
    setup();
    const formation = ENCOUNTER_FORMATIONS.find(item => item.id === "rush");
    return ENCOUNTER_LANES.map(lane => {
      Math.random = () => 0;
      const upgraded = encounterContract(lane, formation);
      Math.random = () => params.encounterChestUpgradeChance;
      const normal = encounterContract(lane, formation);
      const art = ATTRIBUTE_KEYS.map(attr => compositeEncounterCardArt({...upgraded, attr, boss:false}));
      params.encounterChestUpgradeChance = 0;
      Math.random = () => 0;
      const disabled = encounterContract(lane, formation);
      params.encounterChestUpgradeChance = 1;
      Math.random = () => .999999;
      const guaranteed = encounterContract(lane, formation);
      params.encounterChestUpgradeChance = .10;
      return {lane, upgraded, normal, disabled, guaranteed, art};
    });
  })()`);
  for (const row of data) {
    assert.equal(row.upgraded.reward, row.lane.reward + 1);
    assert.equal(row.normal.reward, row.lane.reward);
    assert.equal(row.disabled.reward, row.lane.reward);
    assert.equal(row.guaranteed.reward, row.lane.reward + 1);
    assert.equal(row.upgraded.threat, row.normal.threat);
    assert.equal(row.upgraded.pressureFactor, row.normal.pressureFactor);
    assert.equal(row.upgraded.estimatedClear, null);
    for (const art of row.art) {
      assert.ok(!art.includes("boss-card"));
      assert.ok(fs.existsSync(path.join(project, art)), `Missing upgraded chest card: ${art}`);
    }
  }
  assert.deepEqual(run("[-1,2].map(encounterChestUpgradeChance => cleanParams({encounterChestUpgradeChance}).encounterChestUpgradeChance)"), [0,1]);
});

test("regular chest promotion follows the configured chance for every grade", () => {
  const run = fixture();
  const counts = run(`(() => {
    setup(2442026);
    const formation = ENCOUNTER_FORMATIONS[0];
    return ENCOUNTER_LANES.map(lane => {
      let upgraded = 0;
      for (let i=0; i<10000; i++) upgraded += encounterContract(lane, formation).reward > lane.reward;
      return upgraded;
    });
  })()`);
  for (const count of counts) assert.ok(count >= 880 && count <= 1120, `Unexpected promotion count: ${count}/10000`);
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

test("higher threat raises durability and arrival pressure without requiring larger single hits", () => {
  const run = fixture();
  for (const formation of ["swarm", "rush", "armor", "siege", "elite"]) {
    const stats = ["steady", "tactical", "greedy"].map(lane => run(`(() => {
      setup(); startWave(card(${JSON.stringify(lane)}, ${JSON.stringify(formation)})); updateSpawn(1/60);
      return { hp:state.monsters[0].maxHp, atk:state.monsters[0].atk, every:state.spawn.every,
        attackMultiplier:state.currentEncounter.atkMul };
    })()`));
    assert.ok(stats[0].hp < stats[1].hp && stats[1].hp < stats[2].hp);
    // v252 shifts danger toward contact frequency and durability, avoiding abrupt single-hit deaths.
    assert.ok(stats.every(item => item.atk > 0 && item.attackMultiplier > 0));
    assert.ok(stats[0].every > stats[1].every && stats[1].every > stats[2].every);
  }
});

test("opening grade ramp stops at wave four when additional depth growth is disabled", () => {
  const run = fixture();
  const data = run(`(() => {
    params.encounterHpDepthGrowth = 0;
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

test("additional regular-wave growth is bounded and independent of player state", () => {
  const run = fixture();
  const data = run(`(() => {
    const formation=ENCOUNTER_FORMATIONS[0],lane=ENCOUNTER_LANES[2];
    const before=[4,12,17,40].map(wave=>encounterCombatProfile(formation,lane,wave));
    state.hp=1;state.pot=999999;state.bossAdd=999;addTower(TOWERS[0]);
    const after=[4,12,17,40].map(wave=>encounterCombatProfile(formation,lane,wave));
    return {before,after};
  })()`);
  assert.deepEqual(data.before,data.after);
  assert.ok(data.before[0].hpMul < data.before[1].hpMul);
  assert.ok(data.before[1].hpMul < data.before[2].hpMul);
  assert.equal(data.before[2].hpMul,data.before[3].hpMul);
});

test("v259 retains the selected card-grade HP and attack hierarchy", () => {
  const run=fixture();
  const result=run(`(() => {
    setup();
    const formation=ENCOUNTER_FORMATIONS.find(f=>f.id==="armor");
    const current=ENCOUNTER_LANES.map(l=>encounterCombatProfile(formation,l,12));
    params.encounterGrade1HpMul=1.45;params.encounterGrade2HpMul=.85;params.encounterGrade3HpMul=.72;
    params.encounterGrade1AtkMul=10;params.encounterGrade2AtkMul=14;params.encounterGrade3AtkMul=11.5;
    const previous=ENCOUNTER_LANES.map(l=>encounterCombatProfile(formation,l,12));
    return {current,previous};
  })()`);
  const hpRatios=[1,.98/.85,.90/.72],atkRatios=[6/10,4.5/14,3.5/11.5];
  result.current.forEach((profile,index)=>{
    assert.ok(Math.abs(profile.hpMul/result.previous[index].hpMul-hpRatios[index])<1e-12);
    assert.ok(Math.abs(profile.atkMul/result.previous[index].atkMul-atkRatios[index])<1e-12);
    for(const key of ["countMul","speedMul","spawnGapMul","eliteCount"])
      assert.equal(profile[key],result.previous[index][key]);
  });
});

test("base injury records actual positive HP loss, including the lethal hit", () => {
  const run=fixture();
  const data=run(`(() => {
    setup();startWave(card("greedy","elite"));
    applyBaseDamage({atk:0});
    const untouched={...state.waveSummary};
    applyBaseDamage({atk:100});applyBaseDamage({atk:2000});defeatRun();
    return {untouched,receipt:state.waveSummary,hp:state.hp,over:state.over};
  })()`);
  assert.equal(data.untouched.damageHits,0);
  assert.equal(data.untouched.damageTaken,0);
  assert.equal(data.receipt.damageHits,2);
  assert.equal(data.receipt.damageTaken,1000);
  assert.equal(data.hp,0);
  assert.equal(data.over,true);
});

test("regular-wave per-hit ceiling applies to elite enemies but not legacy combat", () => {
  for(const legacy of [false,true]) {
    const run=fixture(legacy);
    const atk=run(`(() => {
      setup();params.eliteAtkMul=100;
      startWave(card("greedy","elite","fire"));updateSpawn(1/60);
      return state.monsters.find(monster=>monster.elite).atk;
    })()`);
    if(legacy)assert.ok(atk>100);else assert.equal(atk,100);
  }
});

test("chest bounds rise by tier while overlapping; payout survives upgrades and settles exactly once", () => {
  const run = fixture();
  let previous = [-1,-1];
  for (let tier=1; tier<=4; tier+=1) {
    const bounds = run(`(() => {
      setup(); Math.random = () => 0;
      const minimum = rollEncounterWaveReward({reward:${tier}}, 100).budget;
      state.rewardRoundingCarry = .5; Math.random = () => .999999;
      const maximum = rollEncounterWaveReward({reward:${tier}}, 100).budget;
      return [minimum, maximum];
    })()`);
    assert.ok(bounds[0] > previous[0] && bounds[1] > previous[1]);
    if(tier>1) assert.ok(bounds[0]<previous[1]);
    assert.ok(bounds[0]<100 && bounds[1]>100);
    previous = bounds;
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

test("single-target towers use their armored-target damage against tanks, without changing legacy rules", () => {
  for (const legacy of [false, true]) {
    const run = fixture(legacy);
    const result = run(`(() => {
      const m = {kind:"tank", elite:false, boss:false};
      return ["cryo", "laser", "grenade"].map(id => targetClassMultiplier(TOWERS.find(t => t.id === id), m));
    })()`);
    assert.deepEqual(result, legacy ? [.25, .28, 1.76] : [1.50 * 1.35, 1.55 * 1.35, 1.76 * .60]);
  }
});

test("unupgraded traps actually slow enemies and rush speed respects its cap", () => {
  const run = fixture();
  const result = run(`(() => {
    setup(); startWave(card("greedy", "rush", "electric")); updateSpawn(1/60);
    addTower(TOWERS.find(t => t.id === "trap"));
    const tower = state.towers[0], monster = state.monsters[0];
    trap(tower, [{m:monster, distance:1}]);
    return {speed:monster.speed, zones:state.zones.map(z => ({slow:z.slow, slowPct:z.slowPct}))};
  })()`);
  assert.ok(result.speed <= 78);
  assert.ok(result.zones.length > 0);
  assert.ok(result.zones.every(z => z.slow > 0 && z.slowPct >= .35));
});

test("dead-run cleanup and duplicate kills cannot award POT, XP or BOSS multipliers", () => {
  const run = fixture();
  const data = run(`(() => {
    setup(); startWave(card("greedy", "rush")); updateSpawn(1/60);
    const monster = state.monsters[0];
    kill(monster); const first = {pot:state.pot, exp:state.exp}; kill(monster);
    const second = {pot:state.pot, exp:state.exp};
    defeatRun();
    kill({...monster, rewardClaimed:false});
    kill({...monster, rewardClaimed:false, boss:true});
    return {first,second,pot:state.pot,payout:payout(),bosses:state.bossSeen};
  })()`);
  assert.deepEqual(data.first, data.second);
  assert.equal(data.pot, 0);
  assert.equal(data.payout, 0);
  assert.equal(data.bosses, 0);
});

test("BOSS increments stay positive, have a larger tail, and ignore player history", () => {
  const run = fixture();
  const data = run(`(() => {
    setup(); Math.random=()=>0;
    const minimum=rollEncounterBossAdd(1);
    Math.random=()=>.999999;
    const firstLarge=rollEncounterBossAdd(1), fifthLarge=rollEncounterBossAdd(5);
    __tdHeadless.setSeed(8132); const a=rollEncounterBossAdd(3);
    state.pot=100000; state.hp=1; addTower(TOWERS[0]);
    __tdHeadless.setSeed(8132); const b=rollEncounterBossAdd(3);
    return {minimum,firstLarge,fifthLarge,a,b};
  })()`);
  assert.equal(data.minimum, .8);
  assert.equal(data.firstLarge, 3);
  assert.ok(data.fifthLarge > data.firstLarge);
  assert.equal(data.a, data.b);
});

test("card advice reacts to visible loadout and HP without changing cards or consuming RNG", () => {
  const run = fixture();
  const result = run(`(() => {
    setup(); addHero(HEROES.find(h=>h.id==="fire"));
    const choice={attr:"poison",role:"area",threat:3};
    __tdHeadless.setSeed(421); const expected=Math.random();
    __tdHeadless.setSeed(421); const good=encounterAdvisory(choice); const actual=Math.random();
    const bad=encounterAdvisory({attr:"fire",role:"control",threat:3});
    state.hp=100; const low=encounterAdvisory(choice);
    return {good:good.tone,bad:bad.tone,low:low.reasons,expected,actual,choice};
  })()`);
  assert.equal(result.good, "advantage");
  assert.equal(result.bad, "danger");
  assert.ok(result.low.some(reason => reason.text === "基地瀕危"));
  assert.equal(result.expected, result.actual);
  assert.deepEqual(result.choice, {attr:"poison",role:"area",threat:3});
});
