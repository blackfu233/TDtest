(function (root) {
  "use strict";

  const BET_STEPS = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  const TOWER_INFO = {
    flame:{name:"噴火槍",role:"area"}, grenade:{name:"榴彈",role:"area"}, cryo:{name:"急凍狙擊",role:"single"},
    frostbomb:{name:"冰晶炸彈",role:"control"}, laser:{name:"雷射光線",role:"single"}, chain:{name:"閃電鎖鏈",role:"area"},
    gas:{name:"毒氣彈",role:"area"}, needle:{name:"毒針彈",role:"single"}, blade:{name:"旋刃",role:"general"}, trap:{name:"陷阱",role:"control"},
  };

  const HERO_SAMPLE_ORDER = ["fire", "ice", "electric", "poison", "neutral"];

  function seededRandom(seed) {
    let state = (seed >>> 0) || 1;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let mixed = state;
      mixed = Math.imul(mixed ^ mixed >>> 15, mixed | 1);
      mixed ^= mixed + Math.imul(mixed ^ mixed >>> 7, mixed | 61);
      return ((mixed ^ mixed >>> 14) >>> 0) / 4294967296;
    };
  }

  function choiceScore(choice, strategy, state) {
    const rarity = { synergy:145, heroBuff:138, core:132, deepen:118, heroUpgrade:106, hero:100, common:82, newTower:92 }[choice.rarity] || 80;
    const info = TOWER_INFO[choice.towerId] || {role:"general"};
    const ownedRoles = new Set((state.towers || []).map(tower => TOWER_INFO[tower.id]?.role));
    let score = rarity;
    if (choice.rarity === "hero") {
      const attrPreference = {
        single:{ neutral:28, ice:25, fire:12, electric:10, poison:8 },
        area:{ fire:28, electric:25, poison:22, ice:12, neutral:8 },
        control:{ ice:28, poison:23, electric:18, fire:10, neutral:6 },
        balanced:{ neutral:20, electric:19, fire:18, ice:18, poison:17 },
        greedy:{ fire:23, electric:22, poison:20, neutral:16, ice:14 },
      }[strategy] || {};
      score += attrPreference[choice.attrKey] || 0;
    }
    if (choice.rarity === "newTower") {
      if (!ownedRoles.has(info.role)) score += info.role === "single" || info.role === "area" ? 30 : 24;
      if (state.towers.length >= 3) score -= strategy === "balanced" ? 35 : 18;
    }
    if (strategy === "single") {
      score += info.role === "single" ? 52 : info.role === "control" ? 25 : -8;
      if (choice.rarity === "newTower" && state.towers.length >= 1 && !ownedRoles.has("control") && info.role === "control") score += 45;
      if (choice.rarity === "newTower" && state.towers.length >= 1 && !ownedRoles.has("area") && info.role === "area") score += 70;
    }
    if (strategy === "area") {
      score += info.role === "area" ? 52 : info.role === "control" ? 24 : info.role === "single" ? 18 : -8;
      if (choice.rarity === "newTower" && state.towers.length >= 1 && !ownedRoles.has("single") && info.role === "single") score += 55;
    }
    if (strategy === "control") {
      score += info.role === "control" ? 52 : ["frostbomb","chain","gas"].includes(choice.towerId) ? 24 : 10;
      if (choice.rarity === "newTower" && !ownedRoles.has("single") && info.role === "single") score += 50;
      if (choice.rarity === "newTower" && !ownedRoles.has("single") && !ownedRoles.has("area") && info.role === "area") score += 40;
    }
    if (strategy === "balanced") {
      if (!ownedRoles.has("single") && info.role === "single") score += 30;
      if (!ownedRoles.has("area") && info.role === "area") score += 30;
      if (ownedRoles.has("single") && ownedRoles.has("area") && !ownedRoles.has("control") && info.role === "control") score += 20;
    }
    if (strategy === "greedy") score += choice.rarity === "synergy" ? 38 : choice.rarity === "core" ? 28 : 0;
    if (choice.repeatTaken) score -= 34;
    return score;
  }

  function chooseCard(engine, config, state, rng, forcedHeroId="") {
    const choices = engine.choices();
    if (forcedHeroId && choices.length && choices.every(choice => choice.rarity === "hero")) {
      const forcedIndex = choices.findIndex(choice => choice.attrKey === forcedHeroId || choice.heroId === forcedHeroId);
      if (forcedIndex >= 0) return forcedIndex;
    }
    if (!choices.length) throw new Error("三選一開啟但沒有可選項目");
    if (config.strategy === "random" || rng() > config.accuracy) return Math.floor(rng() * choices.length);
    let bestIndex = 0;
    let bestScore = -Infinity;
    choices.forEach((choice,index) => {
      const score = choiceScore(choice, config.strategy, state) + rng() * 2;
      if (score > bestScore) { bestScore = score; bestIndex = index; }
    });
    return bestIndex;
  }

  function humanCollectProbability(policy, state, totalBet, baseHp, context={}) {
    const returnRatio = state.payout / Math.max(1, totalBet);
    const hpRatio = state.hp / Math.max(1, baseHp);
    const tables = {
      humanConservative:[.06,.13,.24,.46,.66,.84,.93,.975,.992],
      humanBalanced:[.03,.07,.14,.31,.49,.70,.84,.93,.98],
      humanChaser:[.012,.03,.07,.16,.30,.50,.69,.84,.95],
      humanGreedyChaser:[.003,.008,.02,.05,.10,.18,.30,.52,.82],
    };
    const table = tables[policy] || tables.humanBalanced;
    const tier = returnRatio < .5 ? 0
      : returnRatio < .8 ? 1
      : returnRatio < 1 ? 2
      : returnRatio < 1.2 ? 3
      : returnRatio < 1.5 ? 4
      : returnRatio < 2 ? 5
      : returnRatio < 3 ? 6
      : returnRatio < 5 ? 7 : 8;
    let probability = table[tier];

    const greedyChaser = policy === "humanGreedyChaser";
    if (hpRatio <= .25) probability += greedyChaser ? .18 : .28;
    else if (hpRatio <= .4) probability += greedyChaser ? .10 : .18;
    else if (hpRatio <= .6) probability += greedyChaser ? .03 : .07;

    if (context.bossJustKilled) probability += policy === "humanConservative" ? .16
      : greedyChaser ? .04
      : policy === "humanChaser" ? .08 : .12;
    const bossDanger = Math.max(0, Math.min(3, Number(state.bossDanger) || 0));
    if (bossDanger > 0 && hpRatio > .45) {
      const response = policy === "humanConservative" ? .08
        : greedyChaser ? .28
        : policy === "humanChaser" ? .24 : .16;
      probability -= response * [0,.5,.8,1.1][bossDanger];
    }
    if (state.wave >= 10) probability += greedyChaser ? .01 : policy === "humanChaser" ? .02 : .04;
    if (state.wave >= 20) probability += greedyChaser ? .06 : policy === "humanConservative" ? .10 : policy === "humanChaser" ? .04 : .07;
    return Math.max(.01, Math.min(.995, probability));
  }

  function shouldCollect(config, state, totalBet, baseHp, rng=Math.random, context={}) {
    if (state.wave >= config.maxWave) return true;
    if (config.collectPolicy === "boss1") return state.bossSeen >= 1;
    if (config.collectPolicy === "boss2") return state.bossSeen >= 2;
    if (config.collectPolicy === "preboss") return (Number(state.bossDanger) || 0) >= 2 && state.wave > 0;
    if (config.collectPolicy === "wave5") return state.wave >= 5;
    if (config.collectPolicy === "wave10") return state.wave >= 10;
    if (config.collectPolicy === "wave20") return state.wave >= 20;
    if (config.collectPolicy === "profit") return state.payout > totalBet;
    if (config.collectPolicy === "adaptive") {
      const hpRatio = state.hp / Math.max(1, baseHp);
      const returnRatio = state.payout / Math.max(1, totalBet);
      return hpRatio <= .35 || (state.bossSeen >= 1 && returnRatio >= 1.45) || ((Number(state.bossDanger) || 0) >= 2 && hpRatio < .62 && returnRatio >= .85);
    }
    if (["humanConservative","humanBalanced","humanChaser","humanGreedyChaser"].includes(config.collectPolicy)) {
      return rng() < humanCollectProbability(config.collectPolicy,state,totalBet,baseHp,context);
    }
    return false;
  }

  function finalizeWaveRecord(record, state, cleared) {
    if (!record || record.finished) return;
    record.finished = true;
    record.cleared = !!cleared;
    record.hp = Math.max(0, state.hp);
    record.pot = state.pot;
    record.payout = cleared ? state.payout : 0;
    record.basePayout = cleared ? Math.min(state.payout,state.pot) : 0;
    record.bossPayout = Math.max(0,record.payout-record.basePayout);
    record.marginalPayout = record.payout - (Number(record.beforePayout) || 0);
    record.bossSeen = state.bossSeen;
  }

  function runOne(engine, config, playerWallet, seed) {
    const betIndex = Math.max(0, BET_STEPS.indexOf(config.baseBet));
    const rng = seededRandom(seed ^ 0x9e3779b9);
    const forcedHeroId = config.forcedHeroId || HERO_SAMPLE_ORDER[(seed >>> 0) % HERO_SAMPLE_ORDER.length];
    engine.setSeed(seed);
    engine.resetRun(playerWallet, betIndex);
    const fullSnapshot = () => engine.snapshot();
    const liteSnapshot = () => engine.snapshotLite ? engine.snapshotLite() : engine.snapshot();
    const frameBatch = engine.stepFrames ? 240 : 1;
    const startingState = fullSnapshot();
    let totalBet = 0;
    let activeWave = 0;
    let activeWaveRecord = null;
    let previousBossSpawned = 0;
    let previousBossSeen = 0;
    let previousBossAdd = 0;
    let lastBossKillWave = -1;
    let pendingBossKill = null;
    let pendingWaveBet = null;
    let collected = false;
    let completed = false;
    let decisionOutcome = null;
    const waveRecords = [];
    const bossEvents = [];
    const copy = value => JSON.parse(JSON.stringify(value));
    const finish = payload => {
      const requestedPayout = Math.max(0,Number(payload.payout)||0);
      if (payload.mathPoolAtDecision && engine.restoreMathPool) {
        engine.restoreMathPool(payload.mathPoolAtDecision,payload.alreadySettled ? 0 : requestedPayout);
      }
      const paid = payload.alreadySettled
        ? requestedPayout
        : engine.settleSimulatedPayout
        ? Math.max(0,Number(engine.settleSimulatedPayout(requestedPayout, payload.bets))||0)
        : requestedPayout;
      const basePayout = Math.min(paid,Math.max(0,Number(payload.pot)||0));
      const finalState = liteSnapshot();
      const { mathPoolAtDecision, alreadySettled, ...publicPayload } = payload;
      return {
        ...publicPayload,payout:paid,displayedPayout:requestedPayout,
        payoutMismatch:paid-requestedPayout,
        endingWallet:Math.max(0,(Number(payload.endingWallet)||0)-requestedPayout+paid),
        basePayout,bossPayout:Math.max(0,paid-basePayout),strategy:config.strategy,
        mathPoolContribution:Math.max(0,Number(payload.mathPoolContribution ?? finalState.mathPoolContribution)||0),
        mathPoolCapHits:Math.max(0,Number(payload.mathPoolCapHits)||0),
        mathPoolRecycled:Math.max(0,Number(payload.mathPoolRecycled ?? finalState.mathPoolRecycled)||0),
        mathPoolInvariantError:Number(finalState.mathPool?.invariantError)||0,
        mathPoolSeed:Math.max(0,Number(finalState.mathPool?.seed)||0),
        mathPoolAvailable:Number(finalState.mathPool?.available)||0,
        mathPoolReserved:Math.max(0,Number(finalState.mathPool?.reserved)||0),
        mathPoolContributed:Math.max(0,Number(finalState.mathPool?.contributed)||0),
        mathPoolPaid:Math.max(0,Number(finalState.mathPool?.paid)||0),
        mathPoolGeneralContributed:Math.max(0,Number(finalState.mathPool?.generalContributed)||0),
        mathPoolBossContributed:Math.max(0,Number(finalState.mathPool?.bossContributed)||0),
        mathPoolBossAvailable:Math.max(0,Number(finalState.mathPool?.bossAvailable)||0),
        mathPoolBossMatured:Math.max(0,Number(finalState.mathPool?.bossMatured)||0),
        mathPoolBossPaid:Math.max(0,Number(finalState.mathPool?.bossPaid)||0),
        mathPoolOperatorAdvance:Math.max(0,Number(finalState.mathPool?.operatorAdvance)||0),
        rerollSpent:Math.max(0,Number(finalState.rerollSpent)||0),
      };
    };
    const captureDecision = (state, isCompleted=false) => {
      if (decisionOutcome) return;
      const fullState = fullSnapshot();
      const payout = Math.max(0,Number(state.payout) || 0);
      decisionOutcome = {
        payout,
        bets:totalBet,
        wave:state.wave,
        hp:state.hp,
        pot:state.pot,
        endingWallet:Math.max(0,Number(state.wallet) || 0) + payout,
        collected:true,
        completed:!!isCompleted,
        alreadySettled:!!isCompleted,
        mathPoolAtDecision:copy(fullState.mathPool || null),
        mathPoolCapHits:Math.max(0,Number(fullState.mathPoolCapHits)||0),
        mathPoolRecycled:Math.max(0,Number(fullState.mathPoolRecycled)||0),
        mathPoolContribution:Math.max(0,Number(fullState.mathPoolContribution)||0),
        bossEvents:copy(bossEvents),
        hero:copy(fullState.hero || null),
        towers:copy(fullState.towers || []),
      };
    };
    const finishTrajectory = fallback => {
      const selected = decisionOutcome || fallback;
      return finish({
        ...selected,
        waveRecords,
        bossEvents:selected.bossEvents || bossEvents,
      });
    };

    const placeBet = () => {
      const state = liteSnapshot();
      const bet = state.currentBet;
      if (state.wallet < bet) return false;
      const beforePayout = Math.max(0,Number(state.payout) || 0);
      const beforeBasePayout = Math.min(beforePayout,Math.max(0,Number(state.pot) || 0));
      pendingWaveBet = {bet,beforePayout,beforeBasePayout,beforeBossPayout:Math.max(0,beforePayout-beforeBasePayout)};
      totalBet += bet;
      engine.startBet();
      return true;
    };

    if (!placeBet()) {
      return finish({ payout:0, bets:0, wave:0, hp:startingState.hp, pot:0, endingWallet:playerWallet, collected:false, completed:false, waveRecords, bossEvents, hero:null, towers:[] });
    }

    let steps = 0;
    let loopIterations = 0;
    let consecutiveChoiceIterations = 0;
    const runStartedAt = Date.now();
    let lastDiagnosticAt = runStartedAt;
    while (steps < 320000) {
      loopIterations += 1;
      if (loopIterations > 1000000) {
        const stalled = liteSnapshot();
        throw new Error(`模擬控制流程停滯：seed ${seed}，wave ${stalled.wave}，choices ${!!stalled.choicesOpen}，idle ${!stalled.waveActive && !stalled.spawning && stalled.monsters === 0}`);
      }
      let state = liteSnapshot();
      const diagnosticNow = Date.now();
      if (diagnosticNow - runStartedAt > 5000 && diagnosticNow - lastDiagnosticAt > 5000) {
        lastDiagnosticAt = diagnosticNow;
        const diagnostic = {seed,wave:state.wave,steps,choices:!!state.choicesOpen,active:!!state.waveActive,
          spawning:!!state.spawning,monsters:state.monsters,projectiles:state.projectiles ?? -1,
          zones:state.zones ?? -1,hp:state.hp,elapsedMs:diagnosticNow-runStartedAt};
        if (typeof root.__tdSimDiagnostic === "function") root.__tdSimDiagnostic(diagnostic);
        else console.error(`[sim-stall] ${JSON.stringify(diagnostic)}`);
      }

      if (state.wave > activeWave) {
        activeWave = state.wave;
        const boss = !!state.spawnBoss;
        const waveStartState = fullSnapshot();
        activeWaveRecord = {
          wave:activeWave,boss,cumulativeBet:totalBet,waveBet:pendingWaveBet?.bet || state.currentBet,
          beforePayout:pendingWaveBet?.beforePayout || 0,beforeBasePayout:pendingWaveBet?.beforeBasePayout || 0,
          beforeBossPayout:pendingWaveBet?.beforeBossPayout || 0,
          modelClearChance:Number(waveStartState.mathTicket?.clearChance) || 0,
          modelPricingChance:Number(waveStartState.mathTicket?.pricingClearChance) || Number(waveStartState.mathTicket?.clearChance) || 0,
          modelBuildPower:Number(waveStartState.mathTicket?.buildPower) || 0,
          modelAttributePower:Number(waveStartState.mathTicket?.attributePower) || 1,
          waveAttribute:waveStartState.mathTicket?.waveAttribute || "neutral",
          modelHpRatio:Number(waveStartState.mathTicket?.hpRatio) || 0,
          modelFairValue:Number(waveStartState.mathTicket?.fairValue) || 0,
          modelConditionalPayout:Number(waveStartState.mathTicket?.conditionalPayoutExact) || 0,
          bossOrdinal:Number(waveStartState.mathTicket?.bossOrdinal) || 0,
          bossDifficulty:waveStartState.mathTicket?.bossDifficulty || null,
          modelSingleShare:Number(waveStartState.mathTicket?.singleShare) || 0,
          modelAreaShare:Number(waveStartState.mathTicket?.areaShare) || 0,
          modelControlShare:Number(waveStartState.mathTicket?.controlShare) || 0,
          finished:false,cleared:false,hp:0,pot:0,payout:0,basePayout:0,bossPayout:0,marginalPayout:0,
        };
        pendingWaveBet = null;
        waveRecords.push(activeWaveRecord);
      }

      while (state.bossSpawned > previousBossSpawned) {
        previousBossSpawned += 1;
        bossEvents.push({
          order:previousBossSpawned,
          wave:state.wave,
          killed:false,
          add:0,
          modelClearChance:activeWaveRecord?.modelClearChance || 0,
          modelPricingChance:activeWaveRecord?.modelPricingChance || 0,
          modelBuildPower:activeWaveRecord?.modelBuildPower || 0,
          modelAttributePower:activeWaveRecord?.modelAttributePower || 1,
          waveAttribute:activeWaveRecord?.waveAttribute || "neutral",
          modelHpRatio:activeWaveRecord?.modelHpRatio || 0,
          modelFairValue:activeWaveRecord?.modelFairValue || 0,
          modelConditionalPayout:activeWaveRecord?.modelConditionalPayout || 0,
          difficulty:activeWaveRecord?.bossDifficulty || null,
          singleShare:activeWaveRecord?.modelSingleShare || 0,
          areaShare:activeWaveRecord?.modelAreaShare || 0,
          controlShare:activeWaveRecord?.modelControlShare || 0,
        });
      }

      if (state.bossSeen > previousBossSeen) {
        pendingBossKill = { order:state.bossSeen, beforeAdd:previousBossAdd };
        lastBossKillWave = state.wave;
        previousBossSeen = state.bossSeen;
      }
      if (pendingBossKill && !state.bossRolling) {
        const event = bossEvents.find(item => item.order === pendingBossKill.order);
        if (event) { event.killed = true; event.add = Math.max(0, state.bossAdd - pendingBossKill.beforeAdd); }
        previousBossAdd = state.bossAdd;
        pendingBossKill = null;
      }

      if (state.choicesOpen) {
        consecutiveChoiceIterations += 1;
        if (consecutiveChoiceIterations > 2048) {
          throw new Error(`升級選擇流程停滯：seed ${seed}，wave ${state.wave}`);
        }
        const choiceState = fullSnapshot();
        const choices = engine.choices();
        const isUpgradeChoice = choices.length > 0 && choices.some(choice => choice.rarity !== "hero");
        const shouldReroll = isUpgradeChoice && !choiceState.choiceRerollUsed
          && choiceState.wallet >= choiceState.currentBet
          && rng() < Math.max(0,Math.min(1,Number(config.rerollChance) || 0));
        if (shouldReroll) {
          const beforeSpent = Math.max(0,Number(choiceState.rerollSpent) || 0);
          engine.rerollUpgradeChoices();
          const afterReroll = liteSnapshot();
          const spent = Math.max(0,(Number(afterReroll.rerollSpent) || 0) - beforeSpent);
          if (spent > 0) {
            totalBet += spent;
            if (activeWaveRecord && !activeWaveRecord.finished) {
              activeWaveRecord.waveBet += spent;
              activeWaveRecord.cumulativeBet = totalBet;
            } else if (pendingWaveBet) {
              pendingWaveBet.bet += spent;
            }
          }
          continue;
        }
        engine.pickChoice(chooseCard(engine, config, choiceState, rng, forcedHeroId));
        continue;
      }
      consecutiveChoiceIterations = 0;

      if (activeWaveRecord && !activeWaveRecord.finished && !state.waveActive && !state.spawning && state.monsters === 0 && state.hp > 0) {
        finalizeWaveRecord(activeWaveRecord, state, true);
      }

      if (state.over) {
        if (activeWaveRecord && !activeWaveRecord.finished) finalizeWaveRecord(activeWaveRecord, state, state.wave >= 30 && state.hp > 0);
        completed = state.wave >= 30 && state.hp > 0;
        state = fullSnapshot();
        if (completed && !decisionOutcome) captureDecision(state,true);
        return finishTrajectory({
          payout:0,bets:totalBet,wave:state.wave,hp:state.hp,pot:state.pot,endingWallet:state.wallet,
          collected:false,completed:false,bossEvents,hero:state.hero || null,towers:state.towers || [],
        });
      }

      const idle = !state.waveActive && !state.spawning && state.monsters === 0;
      if (idle) {
        const canCollect = engine.canCollect();
        const noNextBet = state.wallet < state.currentBet;
        if (!decisionOutcome && canCollect && (noNextBet || shouldCollect(
          config,state,totalBet,config.baseHp || 1000,rng,{bossJustKilled:lastBossKillWave === state.wave}
        ))) {
          captureDecision(state,state.wave >= 30);
          collected = true;
        }
        if (decisionOutcome && config.stopAtCollectDecision) {
          return finishTrajectory({
            payout:0,bets:totalBet,wave:state.wave,hp:state.hp,pot:state.pot,endingWallet:state.wallet,
            collected:false,completed:false,bossEvents,hero:state.hero || null,towers:state.towers || [],
          });
        }
        if (state.wave >= config.maxWave) {
          if (!decisionOutcome && canCollect) captureDecision(state,state.wave >= 30);
          state = fullSnapshot();
          return finishTrajectory({
            payout:0,bets:totalBet,wave:state.wave,hp:state.hp,pot:state.pot,endingWallet:state.wallet,
            collected:false,completed:false,bossEvents,hero:state.hero || null,towers:state.towers || [],
          });
        }
        if (noNextBet) {
          state = fullSnapshot();
          return finishTrajectory({
            payout:0,bets:totalBet,wave:state.wave,hp:state.hp,pot:state.pot,endingWallet:state.wallet,
            collected:false,completed:false,bossEvents,hero:state.hero || null,towers:state.towers || [],
          });
        }
        if (!placeBet()) {
          if (!decisionOutcome && canCollect) captureDecision(state,state.wave >= 30);
          state = fullSnapshot();
          return finishTrajectory({
            payout:0,bets:totalBet,wave:state.wave,hp:state.hp,pot:state.pot,endingWallet:state.wallet,
            collected:false,completed:false,bossEvents,hero:state.hero || null,towers:state.towers || [],
          });
        }
        continue;
      }

      const advanced = engine.stepFrames ? engine.stepFrames(frameBatch) : (engine.update(1 / 60),1);
      steps += Math.max(1,Number(advanced) || frameBatch);
    }
    throw new Error(`模擬停滯：seed ${seed}，wave ${engine.snapshot().wave}`);
  }

  root.TDSimCore = Object.freeze({ BET_STEPS, TOWER_INFO, runOne });
})(typeof self !== "undefined" ? self : window);
