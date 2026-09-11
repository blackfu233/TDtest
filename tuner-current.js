"use strict";
let currentSavedParams = null;
const currentBounds = new Map();

function currentParamSection(title, rows) {
  const body = rows.map(([key,label,unit,min,max,step,note]) => {
    currentBounds.set(key,{min,max});
    const shownUnit = unit === "比例" ? "%" : unit;
    return `<tr><td><strong>${escapeHtml(label)}</strong><details class="field-detail"><summary>詳細</summary><code>${escapeHtml(key)}</code><p>${escapeHtml(parameterLogic(key))}</p><span>允許範圍：${unit === "比例" ? min*100 : min}–${unit === "比例" ? max*100 : max} ${escapeHtml(shownUnit)}</span></details></td><td>${inputCell(key,min,max,step,false)}</td><td>${escapeHtml(shownUnit)}</td><td>${escapeHtml(note)}</td></tr>`;
  }).join("");
  return `<section class="current-section"><h3>${escapeHtml(title)}</h3><div class="table-scroll"><table class="settings-table"><thead><tr><th>設定</th><th>數值</th><th>單位</th><th>影響</th></tr></thead><tbody>${body}</tbody></table></div></section>`;
}

function currentMatrixSection(title, headers, rows, metadata, note="", id="") {
  const used=new Set();
  const body=rows.map(row=>`<tr>${row.map((cell,index)=>{
    const meta=typeof cell==="string"?metadata.get(cell):null;
    if(meta) {
      const [key,, ,min,max,step]=meta;
      used.add(key); currentBounds.set(key,{min,max});
      return `<td>${inputCell(key,min,max,step,false)}</td>`;
    }
    return `<${index===0?"th scope=\"row\"":"td"}>${cell?.html??escapeHtml(cell)}<\/${index===0?"th":"td"}>`;
  }).join("")}</tr>`).join("");
  const reference=[...used].map(key=>{
    const [,label,unit,min,max,,note]=metadata.get(key);
    const scale=unit==="比例"?100:1;
    return `<tr><td>${escapeHtml(label)}</td><td>${min*scale}–${max*scale} ${unit==="比例"?"%":escapeHtml(unit)}</td><td>${escapeHtml(note)}</td><td><code>${escapeHtml(key)}</code><p>${escapeHtml(parameterLogic(key))}</p></td></tr>`;
  }).join("");
  return `<section class="current-section"${id?` id="${id}"`:""}><h3>${escapeHtml(title)}</h3>${note?`<p class="page-note">${escapeHtml(note)}</p>`:""}<div class="table-scroll"><table class="data-table matrix-table" data-columns="${headers.length}"><thead><tr>${headers.map(header=>`<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div><details class="table-notes"><summary>參數說明與範圍</summary><div class="table-scroll"><table class="data-table parameter-reference"><thead><tr><th>參數</th><th>範圍</th><th>影響</th><th>公式與欄位</th></tr></thead><tbody>${reference}</tbody></table></div></details></section>`;
}

function buildCurrentTuner() {
  if (!currentSavedParams) currentSavedParams={...params};
  currentBounds.clear();
  const encounterRows=ENCOUNTER_PARAM_GROUPS.flatMap(group=>group[2]);
  const commonRows=PARAM_GROUPS.flatMap(group=>group[2]);
  const rowsFor=keys=>keys.map(key=>encounterRows.find(row=>row[0]===key)||commonRows.find(row=>row[0]===key));
  const put=(id,html)=>document.getElementById(id).innerHTML=html;
  const section=(title,keys)=>currentParamSection(title,rowsFor(keys));
  const bossDifficultyRows=BOSS_DIFFICULTY_TIERS.slice(1).flatMap(([,label,,hp,atk,speed])=>[
      [hp,`${label}血量`,"倍",.1,10,.01,"首王固定使用中段難度，再套首王難度壓縮；後王中段與高段各一半。型態係數另外相乘。"],
      [atk,`${label}攻擊`,"倍",.1,10,.01,"與首王修正、BOSS 型態和全域攻擊係數一起作用。"],
      [speed,`${label}移速`,"倍",.1,3,.01,"與型態和全域移速係數一起作用，仍受 BOSS 移速上限限制。"]]);
  const metadata=new Map([...commonRows,...encounterRows,...bossDifficultyRows,...HERO_GLOBAL_ROWS[0][2]].map(row=>[row[0],row]));
  const matrix=(title,headers,rows,note="",id="")=>currentMatrixSection(title,headers,rows,metadata,note,id);
  const advanced=(title,content,id)=>`<details class="technical-details advanced-settings" id="${id}"><summary>${escapeHtml(title)}</summary>${content}</details>`;
  const bossParts=[["Small","小增幅"],["Medium","中增幅"],["Large","大增幅"],["Jackpot","頭獎增幅"]];
  put("combatSettings",
    matrix("卡牌難度倍率",["危險度","血量修正 ×","攻擊修正 ×"],[1,2,3].map((grade)=>[
      ["普通","進階","危險"][grade-1],`encounterGrade${grade}HpMul`,`encounterGrade${grade}AtkMul`]),"修正會乘上卡牌原本的基礎值，並不是完整難度或固定通關率。","combatGradeMatrix")+
    matrix("基地血量",["設定","最大 HP"],[["每局起始血量","baseHp"]])+
    advanced("進階戰鬥設定",
      matrix("怪物共用倍率",["對象","血量 ×","攻擊 ×","移速 ×"],[
        ["一般小怪","minionHpMul","minionAtkMul","minionSpeedMul"],["菁英","eliteHpMul","eliteAtkMul","固定"],
        ["第一波小怪額外修正","不追加","wave1MinionAtkMul","不追加"]])+
      matrix("坦克承傷倍率",["攻擊來源","傷害修正 ×"],[["單體砲塔","encounterTankSingleDamageMul"],["群攻砲塔","encounterTankAreaDamageMul"]])+
      matrix("控場強度與時間",["來源","緩速 %","持續秒數"],[["基礎陷阱","encounterTrapSlowPct","encounterTrapSlowTime"],["冰爆","encounterFrostSlowPct","encounterFrostSlowTime"]])+
      matrix("波次血量成長",["每波增加 %","成長上限 ×"],[["encounterHpDepthGrowth","encounterHpDepthCap"]])+
      section("出怪節奏與保護上限",["spawnInterval","encounterRushSpeedCap","encounterBaseHitCap"]),"combatAdvanced"));
  put("chestSettings",
    matrix("寶箱升級機率",["適用卡牌","升一級機率 %"],[["普通、進階、危險","encounterChestUpgradeChance"]],"每張牌各抽一次，只升一級；不增加怪物難度，也不會變成 BOSS 寶箱。","chestChanceMatrix")+
    matrix("各級獎金倍率",["寶箱等級","下限 × BET","上限 × BET"],[1,2,3,4].map(tier=>[
      ["普通","進階","稀有","傳說"][tier-1],`encounterChest${tier}Min`,`encounterChest${tier}Max`]),"這是整波獎金的抽取區間，還要乘整體金錢係數；不是開箱單獨給的金額。","chestRangeMatrix")+
    matrix("整波獎金縮放",["設定","金額倍率 ×"],[["整波獎金係數","encounterRewardScale"]])+
    advanced("進階金錢設定",
      matrix("額外全域倍率",["設定","金額倍率 ×"],[["全部金錢再乘","moneyMul"]],"與整波獎金係數相乘；保持 1 就不追加調整。")+
      matrix("王後 POT 入場",["設定","換算強度 %"],[["依當下累積倍率折算","encounterPotEntryPower"]],"0% 會完整重複放大後續 BET；100% 完全按當下倍率換算。V273 使用 100%，BET 變大仍會提高實得金額。"),"chestAdvanced"));
  put("bossSettings",
    matrix("倍率抽取權重",["增幅類型","抽取權重","實際機率"],bossParts.map(([key,label])=>[
      label,`encounterBoss${key}Weight`,{html:`<span class="probability-value" data-boss-probability="${key}">--</span>`}]),"機率由各組權重除以權重總和換算，不需要加總成 100。","bossWeightMatrix")+
    matrix("倍率增加區間",["增幅類型","最少增加（倍）","最多增加（倍）"],bossParts.map(([key,label])=>[
      label,`encounterBoss${key}Min`,`encounterBoss${key}Max`]),"這是第一隻 BOSS 的增幅；每次至少 +0.1，最後四捨五入到 0.1。","bossIncrementMatrix")+
    matrix("後續 BOSS 倍率成長",["設定","每隻成長 %","最多放大 ×"],[["每往後一隻","encounterBossDepthGrowth","encounterBossDepthGrowthCap"]],"成長上限只限制後續王的序號加成，不限制頭獎區間。")+
    matrix("護衛小怪獎金",["來源","下限 × BET","上限 × BET"],[["護衛擊殺","encounterBossChestMin","encounterBossChestMax"]],"只分給護衛小怪。BOSS 專屬寶箱只開倍率，沒有通關金錢，也不給經驗。")+
    advanced("進階 BOSS 戰鬥設定",
      matrix("BOSS 難度倍率",["基礎難度","血量 ×","攻擊 ×","移速 ×"],BOSS_DIFFICULTY_TIERS.slice(1).map(([,label,,hp,atk,speed])=>[label,hp,atk,speed]))+
      section("全域與首王修正",["bossAtkMul","bossSpeedMul","bossFirstAtkMul","bossFirstDifficultyCompression","bossPreludeCountMul"])+
      section("護盾與狂暴比例",["bossShieldHpPct","bossEnrageHpPct","bossAttackIntervalJitterPct"])+
      section("承傷與攻速倍率",["bossShieldDamageMul","bossBreakDamageMul","bossEnrageAttackSpeedMul"])+
      section("動作時間",["bossBreakDuration","bossBreakAttackPause","bossAttackWindup"]),"bossAdvanced")+
    advanced("進階下注設定",matrix("下注成長倍率",["時機","下注倍率 ×"],[["每擊殺一隻 BOSS","bossBetStepMul"],["11–20 波最低","betMidMul"],["21 波起最低","betDeepMul"]],"王後階梯與深追最低倍率取較高者，不互相相乘。"),"betAdvanced"));
  put("experienceSettings",currentParamSection("經驗獲得",[["expMul","打怪經驗倍率","倍",.1,5,.05,"只影響擊殺怪物取得的經驗；寶箱與通關均不另給經驗。"]]));
  put("versionSettings",currentParamSection("目前採用規則",rowsFor(["encounterEconomyEnabled","encounterRtpTargetMin","encounterRtpTargetMax"])));
  put("currentHeroSettings",advanced("進階角色共用設定",
    matrix("角色傷害倍率",["設定","倍率 ×"],[["全部角色傷害","heroDamageMul"]])+
    matrix("砲塔加成比例",["來源","加成 %"],[["同屬性砲塔","heroSameAttrBonusPct"],["共鳴升級","heroResonanceBonusPct"],["全塔型 BUFF","heroAllTowerBonusPct"]])+
    matrix("角色升級成長",["設定","傷害增加 %","攻速增加 %"],[["普通角色升等","heroDamageUpgradePct","heroRateUpgradePct"]])+
    currentParamSection("彈體數量與週期",HERO_GLOBAL_ROWS[0][2].filter(row=>["heroFirstUpgradeQuantity","heroQuantityUpgrade","heroQuantityEveryLevels"].includes(row[0]))),"heroAdvanced"));
  put("currentWaveSettings",currentParamSection("前四波的血量係數",[1,2,3,4].map(wave=>[
    `wave_${wave}_hpMul`,`第 ${wave} 波血量`,"倍",0,100,.01,"只影響一般怪與菁英；BOSS 使用獨立成長。"] )));
  put("currentCountBody",BAND_BASE.map(([label],i)=>`<tr><td>${i===4?"21 波起":label+" 波"}</td><td>${inputCell(`band_${i+1}_countMin`,0,200,1,false)}</td><td>${inputCell(`band_${i+1}_countMax`,0,200,1,false)}</td></tr>`).join(""));
  put("currentBossEliteBody",WAVE_BASE.filter(row=>row[0]>=7).map(row=>`<tr><td>第 ${row[0]} 波${row[0]===30?"起":""}</td><td>${inputCell(`wave_${row[0]}_eliteWeight`,0,100,.1,false)}</td></tr>`).join(""));
  const boss=TD_ENCOUNTER_TUNING.boss;
  document.getElementById("currentBossGrowth").textContent=`第 1–5 隻 BOSS 的固定血量係數：${boss.hpByOrdinal.join(" / ")}。擊殺後修復基地最大血量的 ${boss.repair*100}%（不超過最大血量）。`;
  buildCurrentMonsters();
  buildHeroTable();
  // Current pages omit historical heuristic scores, but retain actual editable values.
  ui.heroBody.closest("table").querySelectorAll("tr").forEach(row=>{
    row.lastElementChild?.remove(); row.lastElementChild?.remove();
  });
  buildTowerTable();
  buildExpTable();
  buildCurrentUpgrades();
  buildTemplateTables();
  // Count ranges have their own current controls; random template weights are unused here.
  ui.bandBody.closest("table").querySelectorAll("tr").forEach(row=>{
    [...row.children].forEach((cell,index)=>{if(index===1||index===2||index>=8) cell.hidden=true;});
  });
  ui.bandBody.querySelectorAll('input[data-key*="_template_"]').forEach(input=>input.disabled=true);
  bindInputs(document);
  TD_ENCOUNTER_VIEW.bind(()=>params);
  document.querySelectorAll("input[data-key]:not(:disabled)").forEach(input=>{
    const scale=Number(input.dataset.scale)||1;
    if(!currentBounds.has(input.dataset.key)) currentBounds.set(input.dataset.key,{min:Number(input.min)*scale,max:Number(input.max)*scale});
    input.setAttribute("aria-label",metadata.get(input.dataset.key)?.[1]||input.closest("label")?.querySelector("span")?.textContent||input.closest("tr")?.firstElementChild?.querySelector("strong")?.textContent||input.dataset.key);
  });
  updateEvaluation();
}

function buildCurrentMonsters() {
  const fields=MONSTER_FIELDS.filter(([key])=>!key.startsWith("money"));
  const groups=[["小怪",MONSTER_TYPES],["菁英",ELITE_TYPES],["BOSS",BOSS_TYPES]];
  const headers=fields.map(([key,label])=>`<th>${key==="interval"?"攻擊間隔 / 秒":key==="exp"?"擊殺經驗":label}</th>`).join("");
  ui.monsterBody.closest("table").querySelector("thead").innerHTML=`<tr><th>怪物</th>${headers}</tr>`;
  const rows=groups.map(([title,monsters])=>`<tr class="group-row"><td colspan="7">${title}</td></tr>`+monsters.map(([id,label])=>`<tr><td>${label}</td>${fields.map(([key,,min,max,step])=>`<td>${title==="小怪"&&key==="range"?"依卡牌":inputCell(`monster_${id}_${key}`,min,max,step,false)}</td>`).join("")}</tr>`).join("")).join("");
  ui.monsterBody.innerHTML=rows;
  document.getElementById("currentAttributeBody").innerHTML=groups.flatMap(([,monsters])=>monsters).map(([id,label])=>`<tr><td>${label}</td>${MONSTER_ATTRIBUTE_FIELDS.map(([key,,min,max,step])=>`<td>${inputCell(`monster_${id}_${key}`,min,max,step,false)}</td>`).join("")}</tr>`).join("");
}

function buildCurrentUpgrades() {
  ui.upgradeOptions.innerHTML=TOWER_TUNING.map(([towerId,name],towerIndex)=>{
    const rows=UPGRADE_GRID.map((grid,rowIndex)=>{
      const [upgradeName,category,fallback]=grid[towerIndex];
      const requirement=UPGRADE_REQUIREMENT_LABELS[upgradeName];
      const trigger=requirement?`需 ${requirement} / ${category}`:category;
      const specs=upgradeEffectSpecs(towerId,rowIndex);
      const repeat=upgradeRepeatabilityForScore(towerId,rowIndex,specs);
      return `<tr><td>${escapeHtml(upgradeName)}</td><td>${escapeHtml(repeat.label)}</td><td>${specs.map(spec=>upgradeEffectInput(towerId,rowIndex,spec)).join("")||"固定效果"}</td><td>${escapeHtml(trigger)}</td><td data-effect-for="${towerId}_${rowIndex}">${escapeHtml(upgradeEffectDescription(towerId,towerIndex,rowIndex,fallback))}</td></tr>`;
    });
    return `<section class="current-section"><h3>${name}</h3><div class="table-scroll"><table class="data-table current-upgrades"><thead><tr><th>升級</th><th>可否重複</th><th>效果數值</th><th>類型 / 解鎖條件</th><th>效果</th></tr></thead><tbody>${rows.join("")}</tbody></table></div></section>`;
  }).join("");
  bindInputs(ui.upgradeOptions);
}

function refreshCurrentState() {
  document.getElementById("currentRtpTarget").textContent=`${(params.encounterRtpTargetMin*100).toFixed(1)}–${(params.encounterRtpTargetMax*100).toFixed(1)}%`;
  const count=Object.keys(params).filter(key=>params[key]!==currentSavedParams?.[key]).length;
  const element=document.getElementById("currentDraftState");
  element.textContent=count?`${count} 項草稿變更，尚未套用`:"設定無未套用變更";
  element.classList.toggle("is-dirty",count>0);
  const total=["Small","Medium","Large","Jackpot"].reduce((sum,key)=>sum+Math.max(0,Number(params[`encounterBoss${key}Weight`])||0),0);
  document.querySelectorAll("[data-boss-probability]").forEach(cell=>{
    const weight=Math.max(0,Number(params[`encounterBoss${cell.dataset.bossProbability}Weight`])||0);
    cell.textContent=params.encounterEconomyEnabled<.5?"未啟用":total?`${(weight/total*100).toFixed(2)}%`:"權重不可全為 0";
  });
  const inactive=params.encounterEconomyEnabled<.5;
  document.getElementById("currentBossModeNote").hidden=!inactive;
}

function currentImportNeedsRewardMigration(imported,currentRevision) {
  if(!imported||typeof imported!=="object"||Array.isArray(imported)) return false;
  const hasKnownVersion=Object.hasOwn(imported,"encounterRewardRevision")||Object.hasOwn(imported,"balanceRevision");
  return hasKnownVersion&&(Number(imported.encounterRewardRevision)||0)<Math.max(0,Number(currentRevision)||0);
}

function validateCurrentDraft(candidate) {
  if(!candidate||typeof candidate!=="object"||Array.isArray(candidate)) return "設定必須是 JSON 物件。";
  for(const [key,value] of Object.entries(candidate)) {
    if(typeof value!=="number"||!Number.isFinite(value)) return `${key} 必須是有效數字。`;
    const bounds=currentBounds.get(key);
    if(bounds&&(value<bounds.min||value>bounds.max)) return `${key} 超出允許範圍 ${bounds.min}–${bounds.max}。`;
  }
  const pairs=[...Array.from({length:4},(_,i)=>[`encounterChest${i+1}Min`,`encounterChest${i+1}Max`]),
    ["encounterBossChestMin","encounterBossChestMax"],["encounterRtpTargetMin","encounterRtpTargetMax"],
    ...["Small","Medium","Large","Jackpot"].map(tier=>[`encounterBoss${tier}Min`,`encounterBoss${tier}Max`]),
    ...[1,2,3,4,5].map(band=>[`band_${band}_countMin`,`band_${band}_countMax`])];
  for(const [min,max] of pairs) if(candidate[min]>candidate[max]) return `${min} 不可大於上限。`;
  if(["Small","Medium","Large","Jackpot"].every(tier=>candidate[`encounterBoss${tier}Weight`]===0)) return "BOSS 四組倍率權重不可全部為零。";
  if([1,2,3].some(tier=>["Min","Max"].some(part=>candidate[`encounterChest${tier}${part}`]>=candidate[`encounterChest${tier+1}${part}`]))) return "高級寶箱的上下限須逐級提高；區間可以重疊。";
  return "";
}
