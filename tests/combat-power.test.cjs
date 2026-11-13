"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
function fixture(){
  const sandbox={URLSearchParams,performance,console,setTimeout:()=>0,clearTimeout(){}};
  Object.assign(sandbox,{self:sandbox,location:{search:"?headless=1"},addEventListener(){},removeEventListener(){}});
  const context=vm.createContext(sandbox),run=code=>vm.runInContext(code,context);
  const worker=fs.readFileSync(path.join(root,"simulator-worker.js"),"utf8");
  run(worker.slice(0,worker.indexOf('importScripts("simulator-core.js')));
  run(fs.readFileSync(path.join(root,"game.js"),"utf8"));run(fs.readFileSync(path.join(root,"combat-power.js"),"utf8"));
  run(`__tdHeadless.setParams({});__tdHeadless.setSeed(185);__tdHeadless.resetRun(10000,3);
    const boss={boss:true,attr:"fire",wave:10,enemyCount:6,forcedElites:1,bossDifficulty:{hpMul:1,atkMul:1,speedMul:1}};`);
  return code=>JSON.parse(JSON.stringify(run(code)));
}
test("empty team is zero and all default units have finite positive power",()=>{
  const run=fixture();assert.equal(run("TDCombatPower.summary().total"),0);
  const units=run("[...HEROES,...TOWERS].map(t=>TDCombatPower.summary([t]).units[0].base)");
  assert.equal(units.length,15);assert.ok(units.every(n=>Number.isFinite(n)&&n>0));
});
test("displayed power reconciles unit totals and actual same-attribute hero amplification",()=>{
  const run=fixture(),r=run(`(()=>{addHero(HEROES[0]);addTower(TOWERS[1]);const same=TDCombatPower.summary();
    addHero(HEROES[1]);const other=TDCombatPower.summary();return {same,other,bonus:params.heroSameAttrBonusPct};})()`);
  assert.equal(r.same.base+r.same.link,r.same.total);
  assert.equal(r.same.total,r.same.units.reduce((s,u)=>s+u.total,0));
  const same=r.same.units.find(u=>u.id==="grenade"),other=r.other.units.find(u=>u.id==="grenade");
  assert.ok(same.link>0);assert.equal(other.link,0);
  assert.ok(Math.abs(same.total-same.base*(1+r.bonus/100))<=2);
});
test("damage and attack speed upgrades increase the displayed power",()=>{
  const run=fixture(),values=run(`(()=>{addHero(HEROES[4]);addTower(TOWERS[2]);
    const t=state.towers[0],values=[TDCombatPower.summary().total];t.damageMul=1.5;values.push(TDCombatPower.summary().total);
    t.rate*=1.5;values.push(TDCombatPower.summary().total);return values;})()`);
  assert.ok(values[1]>values[0]);assert.ok(values[2]>values[1]);
});
test("default gas is not a poison synergy provider until poison is actually unlocked",()=>{
  const run=fixture(),r=run(`(()=>{addHero(HEROES[4]);addTower(TOWERS[0]);addTower(TOWERS[6]);
    state.towers[0].poisonTargetDamagePct=20;const before=TDCombatPower.summary().units.find(u=>u.id==="flame").link;
    state.towers[1].toxicZone=true;const after=TDCombatPower.summary().units.find(u=>u.id==="flame").link;return {before,after};})()`);
  assert.equal(r.before,0);assert.ok(r.after>r.before);
});
test("all ten core unlocks make a visible contribution to team power",()=>{
  const run=fixture(),results=run(`TOWERS.map((definition,index)=>{
    state.hero=null;state.towers=[];addTower(definition);const before=TDCombatPower.summary().total;
    const data=UPGRADE_ROWS[3][index];applyUpgrade(state.towers[0],{name:data[0],desc:data[1],effect:data[2],dimension:data[3],rowIndex:3});
    return {id:definition.id,before,after:TDCombatPower.summary().total};
  })`);
  for(const item of results)assert.ok(item.after>item.before,JSON.stringify(item));
});
test("conditional synergy needs a real unlocked provider and freeze does not amplify boss-only damage",()=>{
  const run=fixture(),r=run(`(()=>{addHero(HEROES[4]);addTower(TOWERS[0]);const t=state.towers[0];
    t.frozenTargetDamagePct=45;const absent=TDCombatPower.summary().units.find(u=>u.id==="flame").link;
    addTower(TOWERS[3]);const present=TDCombatPower.summary().units.find(u=>u.id==="flame").link;
    const withFreeze=TDCombatPower.bossReport({...boss,enemyCount:0,forcedElites:0}).effective;
    t.frozenTargetDamagePct=0;const withoutFreeze=TDCombatPower.bossReport({...boss,enemyCount:0,forcedElites:0}).effective;
    return {absent,present,withFreeze,withoutFreeze};})()`);
  assert.equal(r.absent,0);assert.ok(r.present>r.absent);assert.equal(r.withFreeze,r.withoutFreeze);
});
test("attribute and low base HP are reflected before battle without changing enemy power",()=>{
  const run=fixture(),r=run(`(()=>{addHero(HEROES[1]);addTower(TOWERS[2]);
    const good=TDCombatPower.bossReport({...boss,enemyCount:0,forcedElites:0});
    const bad=TDCombatPower.bossReport({...boss,attr:"ice",enemyCount:0,forcedElites:0});
    state.hp=100;const injured=TDCombatPower.bossReport({...boss,enemyCount:0,forcedElites:0});
    return {good,bad,injured};})()`);
  assert.ok(r.good.attribute>1);assert.ok(r.bad.attribute<1);assert.ok(r.good.effective>r.bad.effective);
  assert.equal(r.good.enemy,r.injured.enemy);assert.ok(r.injured.effective<r.good.effective);
});
test("boss power is independent of team composition and grows with guards and ordinal",()=>{
  const run=fixture(),r=run(`(()=>{addHero(HEROES[0]);const first=TDCombatPower.bossReport(boss,1);
    addTower(TOWERS[4]);const added=TDCombatPower.bossReport(boss,1);
    const guards=TDCombatPower.bossReport({...boss,enemyCount:12},1);
    const last=TDCombatPower.bossReport(boss,5);return {first,added,guards,last};})()`);
  assert.equal(r.first.enemy,r.added.enemy);assert.ok(r.added.effective>r.first.effective);
  assert.ok(r.guards.enemy>r.added.enemy);assert.ok(r.last.enemy>r.first.enemy);
});
test("power estimates do not mutate state, parameters, or the gameplay random stream",()=>{
  const run=fixture(),r=run(`(()=>{addHero(HEROES[0]);addTower(TOWERS[1]);
    __tdHeadless.setSeed(921);const expected=gameplayRandom();__tdHeadless.setSeed(921);
    const before=JSON.stringify(state),settings=JSON.stringify(params);
    for(let i=0;i<20;i++){TDCombatPower.summary();TDCombatPower.bossReport(boss);}
    return {sameState:before===JSON.stringify(state),sameParams:settings===JSON.stringify(params),expected,actual:gameplayRandom()};})()`);
  assert.ok(r.sameState);assert.ok(r.sameParams);assert.equal(r.actual,r.expected);
});
