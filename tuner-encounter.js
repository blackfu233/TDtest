"use strict";
(function(root) {
  const rules = root.TD_ENCOUNTER_TUNING;
  const tierNames = {1:"第 1 級 / 普通",2:"第 2 級 / 進階",3:"第 3 級 / 稀有",4:"第 4 級 / 傳說"};
  const gradeNames = {1:"普通",2:"進階",3:"危險"};
  const attrs = ["neutral","fire","ice","electric","poison"];
  const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
  const n = (value,fallback=0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const fmt = (value,digits=2) => n(value).toLocaleString("zh-TW",{maximumFractionDigits:digits});
  const pct = value => `${fmt(value*100)}%`;
  const range = (low,high) => `${fmt(low)} – ${fmt(high)}`;

  function calculate(input,view={}) {
    const params = {...rules.encounterDefaults,moneyMul:1,expMul:1,spawnInterval:.26,...input};
    const bet = clamp(n(view.bet,100),1,1000000);
    const multiplier = clamp(n(view.multiplier,1),1,10000);
    const wave = Math.round(clamp(n(view.wave,1),1,70));
    const balanced = params.encounterEconomyEnabled >= .5;
    const scale = Math.max(0,n(params.moneyMul,1)) * (balanced ? params.encounterRewardScale : 1);
    const expScale = Math.max(0,n(params.expMul,1));
    const promotion = clamp(n(params.encounterChestUpgradeChance),0,1);
    const chests = [1,2,3,4,"boss"].map(id => {
      const tier = id === "boss" ? 4 : id;
      const prefix = id === "boss" ? "encounterBossChest" : `encounterChest${tier}`;
      const [low,high] = id === "boss" || balanced ? [params[`${prefix}Min`],params[`${prefix}Max`]] : rules.unbalancedBands[tier];
      const potLow = bet*low*scale, potHigh = bet*high*scale;
      const epsilon=Number.EPSILON*Math.max(1,Math.abs(potLow),Math.abs(potHigh))*4;
      const coinMin = Math.max(0,Math.floor(potLow+epsilon)), coinMax = Math.max(0,Math.ceil(potHigh-epsilon));
      const clearShare=id==="boss"?0:rules.clearShare;
      return {id,tier,low,high,potLow,potHigh,meanPot:(potLow+potHigh)/2,clearShare,
        coinMin,coinMax,clearMin:Math.round(coinMin*clearShare),clearMax:Math.round(coinMax*clearShare),
        valueLow:potLow*multiplier,valueHigh:potHigh*multiplier,
        profitChance:potHigh===potLow ? Number(potLow*multiplier>bet) : clamp((potHigh-bet/multiplier)/(potHigh-potLow),0,1),
        clearExp:Math.round(rules.clearExp[tier]*expScale)};
    });
    const laneRewards = rules.lanes.map(lane => {
      const base = chests[lane.reward-1], upgraded = chests[Math.min(4,lane.reward+1)-1];
      return {lane:lane.id,grade:lane.threat,tier:lane.reward,upgraded:upgraded.tier,promotion,
        meanPot:base.meanPot*(1-promotion)+upgraded.meanPot*promotion,
        clearExp:base.clearExp*(1-promotion)+upgraded.clearExp*promotion};
    });
    const band = rules.bands.find(item=>wave>=item.from&&wave<=item.to) || rules.bands.at(-1);
    const baseCount = ["Min","Max"].map((part,i)=>Math.round(n(params[`band_${band.id}_count${part}`],band.count[i])));
    const opening = clamp(.85+(wave-1)*.05,.85,1);
    const ramp = value => value>1 ? 1+(value-1)*opening : value;
    const depth = Math.min(params.encounterHpDepthCap,1+Math.max(0,wave-1)*params.encounterHpDepthGrowth);
    const formations = rules.lanes.flatMap(lane => lane.formations.map(id => {
      const f = rules.formations.find(item=>item.id===id);
      return {lane:lane.id,grade:lane.threat,id,label:f.label,
        probability:rules.formationProbabilities[lane.id][id] || 0,
        counts:baseCount.map(count=>Math.max(id==="elite"?2:4,Math.round(count*f.countMul*lane.countMul))),
        elites:f.eliteCount,batch:f.batchSize,gap:params.spawnInterval*Math.max(.25,f.spawnGapMul*lane.spawnGapMul),
        hp:f.hpMul*ramp(lane.hpMul)*params[`encounterGrade${lane.threat}HpMul`]*depth,
        atk:f.atkMul*ramp(lane.atkMul)*params[`encounterGrade${lane.threat}AtkMul`],
        speed:f.speedMul*lane.speedMul,range:f.range};
    }));
    const bossWeights = ["Small","Medium","Large"].map(part=>Math.max(0,n(params[`encounterBoss${part}Weight`])));
    const totalBossWeight = bossWeights.reduce((a,b)=>a+b,0);
    return {bet,multiplier,wave,scale,expScale,balanced,chests,laneRewards,formations,
      experience:[1,2,3,4].map(grade=>({grade,killExpFactor:rules.killExpFactors[grade]*expScale})),
      bossSchedule:Array.from({length:rules.boss.total},(_,i)=>({ordinal:i+1,min:(i+1)*rules.boss.min,max:(i+1)*rules.boss.max})),
      bossHazard:Array.from({length:rules.boss.max-rules.boss.min+1},(_,i)=>({wave:rules.boss.min+i,probability:1/(rules.boss.max-rules.boss.min-i+1)})),
      bossTiers:["Small","Medium","Large"].map((part,i)=>({part,weight:bossWeights[i],
        probability:totalBossWeight ? bossWeights[i]/totalBossWeight : null,
        low:params[`encounterBoss${part}Min`],high:params[`encounterBoss${part}Max`]}))};
  }

  function render(params) {
    const doc = root.document;
    if (!doc?.getElementById("encounterRewardReferenceBody")) return;
    const current=doc.body?.dataset?.tunerMode==="current";
    const data = calculate(params,{
      bet:doc.getElementById("encounterPreviewBet").value,
      multiplier:doc.getElementById("encounterPreviewMultiplier").value,
      wave:doc.getElementById("encounterPreviewWave").value});
    const table = (id,rows) => {const target=doc.getElementById(id);if(target) target.innerHTML=rows.join("");};
    const tr = (cells,grade="") => `<tr${grade?` data-grade="${grade}"`:""}>${cells.map(cell=>`<td>${cell}</td>`).join("")}</tr>`;
    doc.getElementById("encounterSourceBuild").textContent=rules.build;
    doc.getElementById("encounterRewardBasis").textContent =
      `當波 BET ${fmt(data.bet)}；全波 POT = BET × 區間抽籤 × 金錢係數 ${fmt(params.moneyMul)}${data.balanced?` × 寶箱係數 ${fmt(params.encounterRewardScale)}`:"（未校準玩法規則）"}。經驗係數 ${fmt(data.expScale)}。`;
    table("encounterRewardReferenceBody",data.chests.filter(c=>!current||c.id!=="boss").map(c=>tr(current?[
      c.id==="boss"?"BOSS 專屬":tierNames[c.tier],range(c.potLow,c.potHigh),fmt(c.meanPot),range(c.clearMin,c.clearMax),range(c.valueLow,c.valueHigh)
    ]:[
      c.id==="boss"?"BOSS 專屬":tierNames[c.tier],range(c.low,c.high)+"x",
      range(c.potLow,c.potHigh),fmt(c.meanPot),range(c.clearMin,c.clearMax),range(c.valueLow,c.valueHigh),
      fmt(c.clearExp),fmt(c.killExpFactor)+"x"],c.id)));
    if(current) {
      table("currentExperienceBody",data.experience.map(e=>tr([
        e.grade===4?"BOSS 與護衛":gradeNames[e.grade],fmt(e.killExpFactor)+" 倍","0"
      ],e.grade)));
      table("currentWaveProfitBody",data.chests.filter(c=>c.id!=="boss").map(c=>tr([
        tierNames[c.tier],range(c.valueLow,c.valueHigh),range(c.valueLow-data.bet,c.valueHigh-data.bet),pct(c.profitChance)
      ],c.id)));
      table("currentBossScheduleBody",data.bossSchedule.map(b=>tr([`第 ${b.ordinal} 隻`,range(b.min,b.max)])));
      table("currentBossHazardBody",data.bossHazard.map(b=>tr([`戰區第 ${b.wave} 波`,pct(b.probability)])));
      const escort=calculate(params,{bet:100}).chests.find(c=>c.id==="boss");
      table("currentBossEscortBody",[tr(["護衛擊殺",range(escort.potLow,escort.potHigh),fmt(escort.meanPot)]),tr(["BOSS 寶箱","只開倍率","金錢 0 / EXP 0"])]);
      const round=value=>Math.max(.1,Math.round(value*10)/10);
      table("currentBossIncrementBody",data.bossSchedule.map(b=>tr([
        `第 ${b.ordinal} 隻`,...data.bossTiers.map(t=>{const growth=1+(b.ordinal-1)*params.encounterBossDepthGrowth;return data.balanced?`+${range(round(t.low*growth),round(t.high*growth))}`:"未啟用";})
      ])));
    }
    const laneRewards=current?calculate(params,{bet:100}).laneRewards:data.laneRewards;
    table("encounterLaneRewardBody",laneRewards.map(l=>tr(current?[
      gradeNames[l.grade],tierNames[l.tier]+` (${pct(1-l.promotion)})`,tierNames[l.upgraded],pct(l.promotion),fmt(l.meanPot)
    ]:[
      gradeNames[l.grade],tierNames[l.tier]+` (${pct(1-l.promotion)})`,tierNames[l.upgraded],pct(l.promotion),fmt(l.meanPot),fmt(l.clearExp)
    ],l.grade)));
    table("encounterDrawReferenceBody",rules.lanes.map((l,i)=>tr([
      i+1,gradeNames[l.threat],1,...rules.formations.map(f=>{
        const probability=rules.formationProbabilities[l.id][f.id]||0;
        return probability ? pct(probability) : "不出現";
      })],l.threat)));
    table("encounterAttributeReferenceBody",attrs.map(attr=>{
      const weights=rules.attributeWeights[attr],sum=Object.values(weights).reduce((a,b)=>a+b,0);
      return tr([rules.attributeMarks[attr],...attrs.map(key=>pct(weights[key]/sum))]);
    }));
    table("encounterFormationReferenceBody",data.formations.map(f=>tr([
      gradeNames[f.grade],f.label,pct(f.probability),range(...f.counts),f.elites,f.batch,fmt(f.gap,3),fmt(f.hp,3),fmt(f.atk,3),fmt(f.speed,3),f.range
    ],f.grade)));
    doc.getElementById("encounterBossReference").textContent =
      `每戰區在第 ${rules.boss.min}–${rules.boss.max} 個遭遇中等機率選定 BOSS 時點（含 BOSS 波）。每個時點 ${pct(1/(rules.boss.max-rules.boss.min+1))}；尚未出王時的條件機率會逐步提高。五種戰區隨機不重複，打完 ${rules.boss.total} 隻 BOSS 結束。BOSS 固定為戰區屬性，只有一張大卡；共用專屬框與寶箱，不抽普通波寶箱升級。`;
    table("encounterBossArchetypeBody",rules.boss.archetypes.map(a=>tr([
      a.label,pct(1/rules.boss.archetypes.length),a.hpMul,a.atkMul,a.speedMul,a.preludeMul,a.eliteCount,"BOSS 專屬 / 不給 EXP"
    ])));
    table("encounterBossRewardBody",!data.balanced ? ["<tr><td colspan=\"5\">未校準玩法模式：以下候選 BOSS 增幅權重不生效，沿用該模式的 BOSS 倍率規則。</td></tr>"] : data.bossTiers.map((b,i)=>tr([
      ["小增幅","中增幅","大增幅"][i],b.weight,b.probability===null?"無效：權重皆零":pct(b.probability),
      `+${range(b.low,b.high)}`,current?`每往後一隻，多加首王增幅的 ${pct(params.encounterBossDepthGrowth)}；最少 +0.1`:`增幅 × [1 + (序號 − 1) × ${fmt(params.encounterBossDepthGrowth)}]，四捨五入至 0.1，至少 +0.1`
    ])));
  }

  function bind(getParams) {
    for (const id of ["encounterPreviewBet","encounterPreviewMultiplier","encounterPreviewWave"]) {
      const input=root.document?.getElementById(id);
      if (!input || input.dataset.bound==="1") continue;
      input.dataset.bound="1";
      input.addEventListener("input",()=>render(getParams()));
    }
  }
  root.TD_ENCOUNTER_VIEW={calculate,render,bind};
  if(typeof module!=="undefined") module.exports=root.TD_ENCOUNTER_VIEW;
})(globalThis);
