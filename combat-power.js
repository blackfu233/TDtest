/* Display-only estimates. Never write combat state or consume gameplay RNG. */
(function(root) {
  "use strict";
  const sum = items => items.reduce((a,b) => a+b,0);
  const bounded = (value,low,high) => Math.max(low,Math.min(high,value));
  const number = value => Math.round(value).toLocaleString("zh-TW");
  const compact = value => value >= 10000 ? `${(value/10000).toFixed(1)}萬` : String(Math.round(value));
  const participants = () => [state.hero,...state.towers].filter(Boolean);

  function profile(source) {
    const hero = !!source.isHero || HEROES.includes(source);
    const t = {durationMul:1,focusMul:1,...source,isHero:hero};
    if (hero && !t.heroId) t.heroId = t.attrKey;
    const mode = hero ? heroAttackMode(t) : t.mode;
    const damage = hero ? heroDamage(t) : scaledDamage(t);
    let rate = 1 / (hero ? heroAttackCooldown(t) : attackCooldown(t));
    if (!hero && ["flame","laser"].includes(mode)) rate *= channelDuration(t) / (channelDuration(t)+channelCooldown(t));
    const extra = t.extraShots || 0;
    let single = 1+extra, group = single;
    if (hero) {
      if (mode === "burst") single = group = heroTargetCount(t)+extra;
      else if (mode === "chain") {single=1;group=(1+Math.min(2,heroTargetCount(t)-1)*heroSecondaryMultiplier(t))*(1+extra);}
      else if (mode === "pierce") group *= 1+Math.min(2,heroTargetCount(t)-1)*heroSecondaryMultiplier(t);
      else group *= 1+2*heroSecondaryMultiplier(t);
    } else {
      if (mode === "flame") group *= 3;
      else if (mode === "chain") {single=1;group=(1+Math.min(2,(t.chains||4)+(t.extraChains||0)-1)*.58)*(1+(t.extraChainCasts||0));}
      else if (mode === "cryo") group *= 1+Math.min(2,(t.pierce||2)+(t.extraPierce||0)-1)*.72;
      else if (mode === "laser") group += (t.extraLaserTargets||0)*(t.refractDamagePct||55)/100;
      else group *= (1+2*({grenade:.65,frostbomb:.5,needle:.75,blade:.42,gas:1,trap:1}[mode]||0))*(1+(t.extraAreas||0));
    }
    if (t.extraProjectiles) single *= 1+t.extraProjectiles;
    if (t.extraProjectiles) group *= 1+t.extraProjectiles;
    if (t.ricochet) group += (t.ricochetChancePct||45)/100*Math.min(2,1+(t.ricochetExtra||0))*(t.ricochetDamagePct||50)/100*(t.ricochetMul||1);
    if (t.focus && mode==="laser") {
      const uptime=bounded((channelDuration(t)-(t.focusDelay||1)*(t.focusDelayMul||1))/channelDuration(t),0,1);
      const focus=1+(t.focusDamagePct||20)/100*(t.focusMul||1)*uptime;single*=focus;group*=focus;
    }
    const range = hero ? heroParam(t,"range",t.range) : mode==="flame" ? Math.min(310,scaledRange(t)) : scaledRange(t);
    const reach = .6+.4*bounded(range/FIELD.attackLineY,0,1);
    let dot = 0;
    if (t.burn) dot += towerBurnDps(t)*Math.min(1,rate*towerBurnTime(t));
    if (t.burnArea) dot += towerBurnAreaDps(t)*Math.min(1,rate*towerBurnAreaTime(t));
    if (t.poison) dot += towerPoisonDps(t)/(t.poisonTick||.5)*Math.min(1,rate*towerPoisonTime(t));
    if (hero && mode === "blast") dot += heroParam(t,"status",t.status||0)*Math.min(1,rate*heroParam(t,"statusTime",t.statusTime||0));
    if (hero && mode === "cloud") dot += heroParam(t,"status",t.status||0)/.5*Math.min(1,rate*heroParam(t,"statusTime",t.statusTime||0));
    if (!hero && mode === "gas") dot += damage/zoneTick(t)*Math.min(1,rate*zoneDuration(t,2.7));
    const slow = hero && mode === "pierce" ? heroParam(t,"status",t.status||0) : t.slow || t.zoneSlowPct/100 || (mode==="frostbomb"?params.encounterFrostSlowPct:0);
    const hard=(t.freeze||mode==="frostbomb" ? Math.min(.28,t.freeze||.6) : 0)
      +(t.stun ? Math.min(.28,towerStunTime(t)) : 0)+(t.root ? Math.min(.28,towerRootTime(t)) : 0);
    const trail=t.iceTrail?(t.iceSlow||.15)*Math.min(1,rate*(t.iceTrailTime||2)):0;
    const control = bounded(slow*Math.min(1,rate*(t.slowTime||1))+Math.min(.6,rate*hard)+trail,0,.6);
    const singleDps = (damage*rate*single+dot)*reach;
    const groupDps = (damage*rate*group+dot*3)*reach*(1+control);
    const bossClass = targetClassMultiplier(t,{boss:true});
    const groupClass = targetClassMultiplier(t,{boss:false,kind:"normal"});
    return {source:t,id:hero?`hero_${t.heroId}`:t.id,name:t.name,attr:towerAttr(t),
      role:hero?"角色":TOWER_ROLE_DISPLAY[TOWER_ROLE[t.id]]||"泛用",single:singleDps*bossClass,group:groupDps*groupClass,
      burn:!!(t.burn||t.burnArea||(t.id==="blade"&&t.burnDps)||(hero&&mode==="blast")),
      poison:!!(t.poison||t.zonePoisonDps||(t.id==="blade"&&t.poisonDps)||t.toxicZone||(hero&&mode==="cloud")),
      freeze:!!(t.freeze||mode==="frostbomb")};
  }

  function linkFactor(p,profiles,boss) {
    const t=p.source,hero=state.hero;
    const resonance = hero && !t.isHero && p.attr===hero.attrKey
      ? 1+(params.heroSameAttrBonusPct+(hero.sameAttrBonus||0))/100 : 1+(hero?.allTowerBonus||0)/100;
    let conditional=1;
    if (t.poisonTargetDamagePct && profiles.some(p=>p.poison)) conditional *= 1+t.poisonTargetDamagePct/200;
    if (t.burningTargetDamagePct && profiles.some(p=>p.burn)) conditional *= 1+t.burningTargetDamagePct/200;
    if (!boss && t.frozenTargetDamagePct && profiles.some(p=>p.freeze)) conditional *= 1+t.frozenTargetDamagePct/200;
    const vulnerable = Math.max(0,...profiles.map(p=>p.source.vulnerable||0));
    const electric = p.attr==="electric" ? Math.max(0,...profiles.map(p=>p.source.electricVulnerablePct||0))/100 : 0;
    return resonance*conditional*(1+vulnerable*.5)*(1+electric*.5);
  }

  function summary(sources=participants()) {
    const profiles=sources.map(profile);
    const units=profiles.map(p=>{
      const base=Math.max(1,Math.round((p.single+p.group)/2));
      const total=Math.max(1,Math.round((p.single*linkFactor(p,profiles,true)+p.group*linkFactor(p,profiles,false))/2));
      return {...p,base,total,link:total-base};
    });
    return {units,base:sum(units.map(p=>p.base)),link:sum(units.map(p=>p.link)),total:sum(units.map(p=>p.total))};
  }

  function bossReport(choice,ordinal=state.bossSeen+1) {
    const team=summary(),base=BOSS_VARIANTS[choice.attr]||BOSS_VARIANTS.neutral,d=choice.bossDifficulty||{};
    const tune=(key,fallback)=>paramNumber(`monster_${base.id}_${key}`,fallback);
    const hp=Math.round(tune("hp",base.hp)*PROTOTYPE_BOSS_HP[bounded(ordinal-1,0,4)]*(d.hpMul||1));
    const shield=3*bounded(params.bossShieldHpPct/100,0,1)*(1-bounded(params.bossShieldDamageMul,0,1));
    const bossHp=hp*(1+shield);
    const wave=choice.wave||state.wave+1;
    const growth=wave>4?Math.min(5.5,1.26+(wave-4)*.105):waveInfoFor(wave).hpMul;
    const meanHp=variants=>sum(variants.map(v=>paramNumber(`monster_${v.id}_hp`,v.hp)))/variants.length;
    const escortHp=growth*(meanHp(MINION_VARIANTS[choice.attr]||MINION_VARIANTS.neutral)*params.minionHpMul*(choice.enemyCount||0)
      +meanHp(ELITE_VARIANTS[choice.attr]||ELITE_VARIANTS.neutral)*params.eliteHpMul*(choice.forcedElites||0));
    const totalHp=bossHp+escortHp;
    const speed=Math.max(1,Math.round(Math.min(tune("speed",base.speed)*params.bossSpeedMul*(d.speedMul||1),choice.attr==="electric"?34:30)));
    const attack=Math.max(1,Math.round(tune("atk",base.atk)*params.bossAtkMul*(d.atkMul||1)*(ordinal===1?params.bossFirstAtkMul:1)));
    const bossDps=attack/(tune("interval",base.interval)+params.bossAttackWindup);
    const approach=Math.max(0,FIELD.attackLineY-tune("range",base.range))/speed;
    const referenceTime=approach+params.baseHp/Math.max(1,bossDps);
    const health=state.hp<=0?0:(approach+state.hp/Math.max(1,bossDps))/Math.max(1,referenceTime);
    const attrProfile=Object.fromEntries(ATTRIBUTE_KEYS.map(attr=>[attr,paramNumber(`monster_${base.id}_${attr}Mul`,enemyAttributeProfile(choice.attr)[attr])]));
    const dps=withAttr=>{
      const single=sum(team.units.map(p=>p.single*linkFactor(p,team.units,true)*(withAttr?attributeMultiplier(p.source,{attrMultipliers:attrProfile}):1)));
      const group=sum(team.units.map(p=>p.group*linkFactor(p,team.units,false)*(withAttr?attributeMultiplier(p.source,{attrMultipliers:attrProfile}):1)));
      return totalHp/Math.max(.001,bossHp/Math.max(1,single)+escortHp/Math.max(1,group));
    };
    const neutral=dps(false),matched=dps(true);
    const effective=team.total?Math.max(0,Math.round(matched*health)):0;
    const enemy=Math.max(1,Math.round(totalHp/Math.max(1,referenceTime)));
    const ratio=effective/enemy;
    return {team:team.total,effective,enemy,attribute:neutral?matched/neutral:1,
      fit:team.total?neutral/team.total:1,health,ratio,
      tone:ratio>=1.2?"advantage":ratio<.85?"danger":"mixed",label:ratio>=1.2?"火力較足":ratio<.85?"火力不足":"戰力接近"};
  }

  let previousRun=null,lastChange=null;
  function renderTeam() {
    if (previousRun!==state) {previousRun=state;lastChange=null;}
    const team=summary(),button=document.getElementById("powerSummaryBtn");
    document.getElementById("teamPowerText").textContent=compact(team.total);
    button.disabled=!team.units.length;
    button.title=`戰力估算 ${number(team.total)}；單位合計 ${number(team.base)}，連動 ${team.link>=0?"+":""}${number(team.link)}。點擊查看明細`;
    const change=document.getElementById("powerChangeText");
    change.textContent=lastChange&&performance.now()-lastChange.time<5000?`${lastChange.delta>0?"+":""}${compact(lastChange.delta)}`:"";
    slotViews.forEach((view,i)=>{
      if (!view.power) {view.power=document.createElement("span");view.power.className="slot-power";view.root.appendChild(view.power);}
      const unit=team.units.find(p=>p.id===(i===0?`hero_${state.hero?.heroId}`:state.towers[i-1]?.id));
      view.power.hidden=!unit;
      if (unit) {view.power.textContent=`戰力 ${compact(unit.base)}`;view.root.title=`${unit.name}・${unit.role}・單位戰力 ${number(unit.base)}・連動 ${unit.link>=0?"+":""}${number(unit.link)}`;}
    });
  }

  function renderDetails() {
    const team=summary();
    document.getElementById("powerBaseText").textContent=number(team.base);
    document.getElementById("powerLinkText").textContent=`${team.link>=0?"+":""}${number(team.link)}`;
    document.getElementById("powerTotalText").textContent=number(team.total);
    document.getElementById("powerLastChangeText").textContent=lastChange?`上次選擇：${number(lastChange.before)} → ${number(lastChange.after)}（${lastChange.delta>0?"+":""}${number(lastChange.delta)}）`:"";
    const list=document.getElementById("powerUnitList");list.replaceChildren();
    team.units.forEach(p=>{
      const row=document.createElement("li"),name=document.createElement("span"),value=document.createElement("strong");
      name.textContent=`${p.name}・${p.role}`;value.textContent=`${number(p.base)} ${p.link>=0?"+":"−"} ${number(Math.abs(p.link))} = ${number(p.total)}`;
      row.append(name,value);list.appendChild(row);
    });
  }
  function openDetails() {
    renderDetails();document.getElementById("powerDialog").showModal();
  }

  function renderChoices(choices) {
    document.querySelectorAll("#choiceList .choice-card").forEach((button,i)=>{
      const choice=choices[i];
      const source=choice.towerId?(state.towers.find(t=>t.id===choice.towerId)||TOWERS.find(t=>t.id===choice.towerId))
        :choice.heroId?(state.hero||HEROES.find(h=>h.id===choice.heroId)):null;
      if (!source) return;
      const unit=summary([source]).units[0];
      const text=document.createElement("span");text.className="choice-power";
      text.textContent=`${choice.rarity==="newTower"||choice.rarity==="hero"?"單位戰力":"目前戰力"} ${number(unit.base)}`;
      button.querySelector(".choice-copy").appendChild(text);
    });
  }

  function renderEncounter(choices,boss) {
    document.getElementById("bossPowerReadout")?.remove();
    if (!boss) return;
    const report=bossReport(choices[0]),panel=document.createElement("section");
    panel.id="bossPowerReadout";panel.className=`boss-power tone-${report.tone}`;
    const row=document.createElement("div");row.className="boss-power-comparison";
    [["我方有效戰力",report.effective],["王與護衛",report.enemy]].forEach(([label,value])=>{
      const side=document.createElement("div"),caption=document.createElement("span"),score=document.createElement("strong");
      caption.textContent=label;score.textContent=compact(value);side.append(caption,score);row.appendChild(side);
    });
    const verdict=document.createElement("b");verdict.className="power-verdict";verdict.textContent=report.label;row.insertBefore(verdict,row.lastChild);
    const details=document.createElement("details"),title=document.createElement("summary"),body=document.createElement("p");
    title.textContent=`戰力估算・${report.attribute<.95?"屬性不利":report.attribute>1.05?"屬性有利":"屬性均衡"}・查看修正`;
    body.textContent=`隊伍 ${number(report.team)} × 對王配置 ${report.fit.toFixed(2)} × 屬性 ${report.attribute.toFixed(2)} × 基地狀態 ${report.health.toFixed(2)} ≈ ${number(report.effective)}。王方依血量、護甲、護衛與攻擊節奏估算；不是勝率或必勝門檻。`;
    const inspect=document.createElement("button");inspect.type="button";inspect.className="boss-power-team";
    inspect.textContent=`查看隊伍 ${number(report.team)} 與連動明細`;inspect.addEventListener("click",openDetails);
    details.append(title,body);panel.append(row,inspect,details);ui.encounterWager.after(panel);
    const metric=ui.encounterList.querySelector(".encounter-clear");
    if (metric) {metric.querySelector("small").textContent="戰力比較";metric.querySelector("strong").textContent=report.label;metric.className=`encounter-metric encounter-clear tone-${report.tone==="danger"?"danger":report.tone==="advantage"?"safe":"risk"}`;}
    ui.encounterList.querySelector(".boss-card")?.setAttribute("aria-label",`${choices[0].formationLabel} BOSS，我方有效戰力 ${number(report.effective)}，王與護衛 ${number(report.enemy)}，${report.label}。戰力為估算，不保證勝利。`);
  }

  function recordChange(before) {
    const after=summary().total,delta=after-before;
    if (Number.isFinite(before)&&delta) lastChange={before,after,delta,time:performance.now()};
    renderTeam();
  }
  root.TDCombatPower=Object.freeze({profile,summary,bossReport,renderTeam,renderChoices,renderEncounter,recordChange});
  if (HEADLESS_SIM) return;
  document.getElementById("powerSummaryBtn").addEventListener("click",openDetails);
  updateUi();
})(typeof window!=="undefined"?window:self);
