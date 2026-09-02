"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),crypto=require("node:crypto");
const project=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(project,"game.js"),"utf8");
const worker=fs.readFileSync(path.join(project,"simulator-worker.js"),"utf8");
const sandbox={URLSearchParams,console,performance,setTimeout:()=>0,clearTimeout(){},addEventListener(){},removeEventListener(){}};
sandbox.self=sandbox;sandbox.location={search:"?headless=1"};
const context=vm.createContext(sandbox),run=code=>vm.runInContext(code,context);
run(worker.slice(0,worker.indexOf('importScripts("simulator-core.js')));run(source);
run(`
  let campaignPolicy="safe";
  const originalAutoChoice=encounterAutoChoice;
  encounterAutoChoice=choices=>{
    if(choices[0].boss) return choices[0];
    if(campaignPolicy==="safe") return choices.find(c=>c.lane==="steady");
    if(campaignPolicy==="greedy") return choices.find(c=>c.lane==="greedy");
    const hp=state.hp/params.baseHp;
    return choices.slice().sort((a,b)=>score(b)-score(a))[0];
    function score(c) {
      const attrs=[state.hero.attrKey,...state.towers.map(towerAttr)];
      const power=attrs.reduce((s,a)=>s+(enemyAttributeProfile(c.attr)[a]||1),0)/attrs.length;
      const roles=state.towers.filter(t=>TOWER_ROLE[t.id]===c.role).length;
      return (power-1)*9 + Math.min(2,roles)*1.2 + c.reward*.7 - c.threat*(hp<.4?2.4:hp<.7?1.5:.8);
    }
  };
  function pickCampaignUpgrade() {
    const scored=currentChoices.map((c,i)=>{
      let value=0;
      if(c.dimension==="newTower") value+=20;
      if(c.attrKey===state.hero.attrKey) value+=3;
      if(c.rarity==="heroBuff"||c.dimension==="core"||c.dimension==="synergy") value+=6;
      if(c.dimension==="hero") value+=2;
      if(c.dimension==="damage"||c.dimension==="speed"||c.dimension==="quantity") value+=2;
      if(c.dimension==="newTower") {
        const role=TOWER_ROLE[c.towerId];
        if(!state.towers.some(t=>TOWER_ROLE[t.id]===role)) value+=3;
      }
      return {i,value};
    });
    scored.sort((a,b)=>b.value-a.value||a.i-b.i);
    currentChoices[scored[0].i].onPick();
  }
  function campaign(seed,hero,policy,betIndex) {
    campaignPolicy=policy;__tdHeadless.setParams({});__tdHeadless.setSeed(seed);__tdHeadless.resetRun(10000,betIndex);
    addHero(HEROES.find(h=>h.id===hero));
    const waves=[];let frames=0,upgrades=0,priorWave=0,startHp=1000,startFrames=0,entry=null;
    while(!state.over&&frames<60*60*50&&state.wave<=70) {
      if(state.choicesOpen) {pickCampaignUpgrade();upgrades++;continue;}
      if(!state.waveActive&&!state.bossRoll) {
        if(priorWave) {waves.push({...entry,clear:true,endHp:Math.max(0,state.hp),receipt:{...state.waveSummary},seconds:(frames-startFrames)/60});priorWave=0;}
        startHp=state.hp;startFrames=frames;startBet();
        if(state.over) break;
      }
      if(state.waveActive&&state.wave!==priorWave) {
        priorWave=state.wave;
        const c=state.currentEncounter;
        entry={wave:state.wave,boss:!!c?.boss,lane:c?.lane,formation:c?.formation,attr:c?.attr,startHp,bet:betForWave(state.wave),
          level:state.level,heroLevel:state.hero.level,towers:state.towers.map(t=>({id:t.id,level:t.level}))};
      }
      update(1/60);frames++;
    }
    if(priorWave) waves.push({...entry,clear:state.hp>0&&state.bossSeen>=5,endHp:Math.max(0,state.hp),receipt:{...state.waveSummary},seconds:(frames-startFrames)/60});
    return {seed,hero,policy,wave:state.wave,bosses:state.bossSeen,hp:Math.max(0,state.hp),level:state.level,upgrades,
      seconds:frames/60,result:state.bossSeen>=5?"complete":state.hp<=0?"defeat":state.wallet<currentBet()?"bankroll":"timeout",waves};
  }
`);
const rows=[],samples=Number(process.env.CAMPAIGN_SAMPLES||4),seed=Number(process.env.CAMPAIGN_SEED||621000);
const betIndex=Number(process.env.CAMPAIGN_BET_INDEX||2);
for(const policy of ["safe","match","greedy"]) for(const hero of ["neutral","fire","ice","electric","poison"]) for(let n=0;n<samples;n++) {
  rows.push(run(`campaign(${seed+n*173},"${hero}","${policy}",${betIndex})`));
}
const summary=["safe","match","greedy"].map(policy=>{
  const g=rows.filter(r=>r.policy===policy);
  const cleared=g.flatMap(r=>r.waves).filter(w=>w.clear&&!w.boss);
  return {policy,n:g.length,complete:g.filter(r=>r.result==="complete").length,firstBoss:g.filter(r=>r.bosses>=1).length,
    bosses:g.reduce((s,r)=>s+r.bosses,0)/g.length,meanWave:g.reduce((s,r)=>s+r.wave,0)/g.length,
    clearedRegular:cleared.length,meanClearedPotPerBet:cleared.reduce((s,w)=>s+w.receipt.pot/w.bet,0)/Math.max(1,cleared.length),
    meanClearedDamage:cleared.reduce((s,w)=>s+w.receipt.damage,0)/Math.max(1,cleared.length),
    meanSeconds:g.reduce((s,r)=>s+r.seconds,0)/g.length,results:Object.fromEntries(["complete","defeat","bankroll","timeout"].map(k=>[k,g.filter(r=>r.result===k).length]))};
});
const result={build:run("BUILD_VERSION"),sha256:crypto.createHash("sha256").update(source).digest("hex"),
  bet:run(`BET_STEPS[${betIndex}]`),
  scope:"Continuous campaigns, 10000 wallet, five heroes; only in-game repair, no external HP reset or oracle choices. Shared visible-info upgrade policy. Three illustrative encounter policies, not a human model or RTP validation. Matched initial seeds; gameplay RNG may diverge between policies.",rows,summary};
const output=process.argv[2];if(!output)throw Error("Supply an output JSON path");
fs.writeFileSync(output,JSON.stringify(result,null,2));console.log(JSON.stringify({output,summary},null,2));
