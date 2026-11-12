"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
function fixture() {
  const sandbox={URLSearchParams,performance,console,setTimeout:()=>0,clearTimeout(){}};
  Object.assign(sandbox,{self:sandbox,location:{search:"?headless=1"},addEventListener(){},removeEventListener(){}});
  const context=vm.createContext(sandbox),run=code=>vm.runInContext(code,context);
  const worker=fs.readFileSync(path.join(root,"simulator-worker.js"),"utf8");
  run(worker.slice(0,worker.indexOf('importScripts("simulator-core.js')));
  run(fs.readFileSync(path.join(root,"simulator-core.js"),"utf8"));
  run(fs.readFileSync(path.join(root,"game.js"),"utf8"));
  run(`__tdHeadless.setParams({});__tdHeadless.setSeed(185);__tdHeadless.resetRun(10000,3);addHero(HEROES[0]);state.started=true;
    function clearedBoss(order,pot,add,stake=100) {
      state.wave=order*10;state.bossSeen=order;state.biomeIndex=order-1;state.currentEncounter={boss:true};
      state.pot=pot;state.bossAdd=add;state.zoneStake=stake;state.totalStake+=stake;state.wallet-=stake;
      state.spawn=null;state.monsters=[];state.waveActive=true;state.bossRoll=null;
      state.waveReward=null;state.waveSummary={startPot:pot,startHp:state.hp};checkWaveClear();
    }
  `);
  return code=>JSON.parse(JSON.stringify(run(code)));
}
test("a cleared zone pays once, resets only at-risk rewards and keeps the build",()=>{
  const run=fixture(),r=run(`(()=>{addTower(TOWERS[0]);state.hero.level=3;clearedBoss(1,200,1.5,1000);
    const first=__tdHeadless.snapshot();checkWaveClear();settleEncounterMilestone();
    return {first,again:__tdHeadless.snapshot()};})()`);
  assert.equal(r.first.wallet,9500);assert.equal(r.first.bankedPayout,500);assert.equal(r.first.pot,0);
  assert.equal(r.first.bossAdd,0);assert.equal(r.first.biomeIndex,1);assert.equal(r.first.towers.length,1);
  assert.equal(r.first.hero.level,3);assert.equal(r.first.lastMilestone.multiplier,2.5);
  assert.equal(r.first.lastMilestone.net,-500);assert.equal(r.again.wallet,r.first.wallet);
});
test("a later defeat cannot revoke paid milestone rewards",()=>{
  const run=fixture(),r=run(`(()=>{clearedBoss(1,200,2,100);const paid=state.wallet;
    state.wallet-=100;state.pot=150;defeatRun();kill({boss:true});checkWaveClear();
    return {paid,wallet:state.wallet,banked:state.bankedPayout,pot:state.pot};})()`);
  assert.deepEqual(r,{paid:10500,wallet:10400,banked:600,pot:0});
});
test("killing the boss is not a zone clear while escorts or multiplier animation remain",()=>{
  const run=fixture(),r=run(`(()=>{state.bossSeen=1;state.currentEncounter={boss:true};state.pot=200;state.bossAdd=2;
    state.waveActive=true;state.monsters=[{hp:10}];checkWaveClear();const guards=state.wallet;
    state.monsters=[];state.bossRoll={};checkWaveClear();const rolling=state.wallet;
    state.bossRoll=null;state.hp=0;defeatRun();checkWaveClear();return {guards,rolling,paid:state.bankedPayout};})()`);
  assert.deepEqual(r,{guards:10000,rolling:10000,paid:0});
});
test("mid-zone collect and post-milestone exit never repay an earlier milestone",()=>{
  const run=fixture(),r=run(`(()=>{clearedBoss(1,100,1);const canExit=canCollect();state.pot=50;
    const before=state.wallet;collect();const after=state.wallet;collect();completeRun();
    return {canExit,before,after,again:state.wallet,banked:state.bankedPayout};})()`);
  assert.deepEqual(r,{canExit:true,before:10100,after:10150,again:10150,banked:200});
});
test("five milestone payments complete without a second final payout",()=>{
  const run=fixture(),r=run(`(()=>{for(let i=1;i<=5;i++)clearedBoss(i,100,i);const wallet=state.wallet;
    completeRun();collect();return {wallet,again:state.wallet,paid:state.bankedPayout,over:state.over,receipts:state.milestones.length};})()`);
  assert.deepEqual(r,{wallet:11500,again:11500,paid:2000,over:true,receipts:5});
});
test("every zone retains a jackpot and later zones shift weight toward both tails",()=>{
  const run=fixture(),tiers=run(`Array.from({length:5},(_,i)=>encounterBossTiers(i+1))`);
  const p=(items,index)=>items[index].weight/items.reduce((sum,t)=>sum+t.weight,0);
  assert.ok(tiers.every(items=>p(items,3)>0));
  assert.ok(p(tiers[4],3)>p(tiers[0],3));assert.ok(p(tiers[4],1)<p(tiers[0],1));
});

test("simulator counts already-paid zones on later defeat and final completion",()=>{
  for(const [defeat,continueAfterCollect] of [[true,false],[false,false],[false,true]]) {
    const run=fixture(),r=run(`(()=>{
      const values={baseHp:100000};for(const key of Object.keys(DEFAULT_PARAMS))if(/^monster_.*_hp$/.test(key))values[key]=1;
      __tdHeadless.setParams(values);
      const engine={...__tdHeadless,
        resetRun(...args){__tdHeadless.resetRun(...args);state.biomeBossAt=1;},
        stepFrames(count){const steps=__tdHeadless.stepFrames(count);if(state.biomeWave===0)state.biomeBossAt=1;
          if(${defeat} && state.biomeIndex===1 && state.wave>=2 && !state.over)defeatRun();return steps;}
      };
      return TDSimCore.runOne(engine,{baseBet:100,baseHp:100000,startWallet:10000,maxWave:70,
        strategy:"balanced",encounterPolicy:"adaptive",collectPolicy:"${continueAfterCollect?"boss1":"never"}",
        stopAtCollectDecision:${!continueAfterCollect},rerollChance:0,walletMode:"independent"},10000,812);
    })()`);
    assert.equal(r.reason,defeat?"defeat":continueAfterCollect?"collect":"complete");
    assert.equal(r.milestones.length,defeat||continueAfterCollect?1:5);
    assert.ok(r.payout>0);assert.equal(r.payout,r.milestones.reduce((sum,m)=>sum+m.amount,0));
    assert.equal(r.endingWallet,10000-r.bets+r.payout);assert.equal(r.payoutMismatch,0);
    assert.equal(r.basePayout+r.bossPayout,r.payout);assert.ok(r.bossEvents[0].add>0);
  }
});

test("default gameplay reconciles wagers and rewards across seeds and cashout policies",()=>{
  const baseline={"9/boss1":[1300,856,12],"9/never":[1750,856,15],"185/boss1":[1450,3633,13],
    "185/never":[4150,5304,25],"812/boss1":[1450,1028,13],"812/never":[3750,2333,25]};
  for(const seed of [9,185,812])for(const policy of ["boss1","never"]){
    const run=fixture(),r=run(`TDSimCore.runOne(__tdHeadless,{baseBet:100,baseHp:1000,startWallet:10000,maxWave:25,
      strategy:"balanced",encounterPolicy:"adaptive",collectPolicy:"${policy}",rerollChance:.05,
      walletMode:"independent"},10000,${seed})`);
    assert.equal(r.endingWallet,10000-r.bets+r.payout);assert.equal(r.payoutMismatch,0);
    assert.equal(r.basePayout+r.bossPayout,r.payout);
    assert.deepEqual([r.bets,r.payout,r.wave],baseline[`${seed}/${policy}`]);
    assert.ok(r.payout>=r.milestones.reduce((sum,m)=>sum+m.amount,0));
  }
});

test("tuner probabilities and multiplier ranges match every milestone ordinal",()=>{
  const run=fixture(),rules=require("../encounter-tuning-data.js"),view=require("../tuner-encounter.js");
  const data=view.calculate(rules.defaultParams);
  for(let i=0;i<5;i++){
    const actual=run(`encounterBossTiers(${i+1})`),total=actual.reduce((sum,t)=>sum+t.weight,0);
    actual.forEach((t,j)=>{assert.equal(t.low,data.bossByOrdinal[i][j].low);assert.equal(t.high,data.bossByOrdinal[i][j].high);
      assert.ok(Math.abs(t.weight/total-data.bossByOrdinal[i][j].probability)<1e-12);});
  }
});

test("V285 tuning is isolated from the preserved V284 game",()=>{
  const read=file=>fs.readFileSync(path.join(root,file),"utf8");
  const key=source=>source.match(/const PARAM_STORAGE_KEY = "([^"]+)"/)[1];
  const channel=source=>source.match(/const PARAM_CHANNEL = "([^"]+)"/)[1];
  for(const extract of [key,channel]){
    assert.equal(extract(read("game.js")),extract(read("tuner.js")));
    assert.equal(extract(read("game.js")),extract(read("simulator.js")));
    assert.notEqual(extract(read("game.js")),extract(read("game-v284.js")));
  }
});

test("chase analysis distinguishes death from zero payout after a paid milestone",()=>{
  const source=fs.readFileSync(path.join(root,"simulator.js"),"utf8"),sandbox={};
  vm.runInNewContext(source.slice(source.indexOf("function buildChaseAnalysis"),source.indexOf("function mergeChaseReports")),sandbox);
  const records=[{wave:6,finished:true,cleared:true,cumulativeBet:600,payout:1800},
    {wave:7,finished:true,cleared:false,cumulativeBet:700,payout:1800}];
  const report=sandbox.buildChaseAnalysis([{wave:7,bets:700,payout:1800,reason:"defeat",waveRecords:records}],10);
  assert.equal(report.summary.diedAfter2xRate,1);assert.equal(report.summary.wave6FinalDeathRate,1);
  assert.equal(report.summary.lostPeakPayout,0);assert.equal(report.waves[5].diedAfter2x,1);
});
