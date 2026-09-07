"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const rules=require(path.join(root,"encounter-tuning-data.js"));
function validationContext() {
  const context=vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(root,"tuner-current.js"),"utf8"),context);
  vm.runInContext('currentBounds.set("expMul",{min:.1,max:5});currentBounds.set("encounterChestUpgradeChance",{min:0,max:1});',context);
  return context;
}
test("current draft validation accepts defaults without rewriting them",()=>{
  const context=validationContext(),candidate={...rules.encounterDefaults,expMul:1};
  const before=JSON.stringify(candidate);
  assert.equal(context.validateCurrentDraft(candidate),"");
  assert.equal(JSON.stringify(candidate),before);
});
test("current draft rejects invalid values, reversed ranges and impossible reward weights",()=>{
  const context=validationContext(),defaults={...rules.encounterDefaults,expMul:1};
  for(const invalid of [null,[],{...defaults,expMul:"2"},{...defaults,expMul:NaN},{...defaults,expMul:-1},
    {...defaults,encounterChestUpgradeChance:20},{...defaults,encounterRtpTargetMin:1.1},
    {...defaults,encounterChest1Min:1},{...defaults,encounterChest1Max:1.81},
    {...defaults,encounterBossChestMin:3,encounterBossChestMax:1},
    {...defaults,band_1_countMin:30,band_1_countMax:20},
    {...defaults,encounterBossSmallWeight:0,encounterBossMediumWeight:0,encounterBossLargeWeight:0}]) {
    assert.notEqual(context.validateCurrentDraft(invalid),"");
  }
});
test("current and legacy tuning surfaces remain separate",()=>{
  const html=fs.readFileSync(path.join(root,"tuner.html"),"utf8");
  const archive=fs.readFileSync(path.join(root,"tuner-legacy.html"),"utf8");
  const expected=["encounter","combat","chests","boss","monsters","heroes","towers","upgrades","exp","json"];
  assert.deepEqual([...html.matchAll(/data-tab="([^"]+)"/g)].map(match=>match[1]),expected);
  for(const old of ["poolEntryRtp","rewardRtpTotal","bossRtpTotal","waveTableBody","logicActualRtp"]){
    assert(!html.includes(`id="${old}"`));assert(archive.includes(`id="${old}"`));
  }
  assert(html.includes('data-tuner-mode="current"'));
  assert(archive.includes('data-tuner-mode="legacy"'));
  assert(!archive.includes('id="encounterTab"'));
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size);
});
test("editable matrices align related controls and retain validation bounds",()=>{
  const calls=[];
  const context=vm.createContext({
    escapeHtml:value=>String(value??""),parameterLogic:key=>`formula:${key}`,
    inputCell:(key,min,max,step)=>{calls.push({key,min,max,step});return `<input data-key="${key}">`;}
  });
  vm.runInContext(fs.readFileSync(path.join(root,"tuner-current.js"),"utf8"),context);
  const metadata=new Map([
    ["encounterChest1Min",["encounterChest1Min","普通下限","倍",.01,20,.01,"整波下限"]],
    ["encounterChest1Max",["encounterChest1Max","普通上限","倍",.01,20,.01,"整波上限"]]
  ]);
  const html=context.currentMatrixSection("獎金倍率",["寶箱","下限","上限"],[["普通","encounterChest1Min","encounterChest1Max"]],metadata);
  assert(html.includes('<th scope="row">普通</th><td><input data-key="encounterChest1Min"></td><td><input data-key="encounterChest1Max"></td>'));
  assert.deepEqual(calls.map(item=>item.key),["encounterChest1Min","encounterChest1Max"]);
  assert.equal(vm.runInContext('currentBounds.get("encounterChest1Min").min',context),.01);
  assert(html.includes('class="table-notes"'));
  assert(!html.includes("open="));
});
