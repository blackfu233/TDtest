const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
const BUILD_VERSION = "rtp-balance1";
const MAX_EFFECTS = 240;
const UI_FRAME_MS = 1000 / 30;
const DEBUG_FRAME_MS = 250;

const ui = {
  wallet: document.getElementById("walletText"),
  pot: document.getElementById("potText"),
  potChip: document.querySelector(".pot-chip"),
  wave: document.getElementById("waveText"),
  waveChip: document.getElementById("waveText").closest(".hud-chip"),
  hp: document.getElementById("hpText"),
  level: document.getElementById("levelText"),
  exp: document.getElementById("expText"),
  expFill: document.getElementById("expFill"),
  bossMult: document.getElementById("bossMultText"),
  message: document.getElementById("messageText"),
  slots: document.getElementById("towerSlots"),
  betMinus: document.getElementById("betMinusBtn"),
  betPlus: document.getElementById("betPlusBtn"),
  betText: document.getElementById("betText"),
  waveBet: document.getElementById("waveBetText"),
  bet: document.getElementById("betBtn"),
  collect: document.getElementById("collectBtn"),
  collectText: document.getElementById("collectText"),
  reset: document.getElementById("resetBtn"),
  speed: document.getElementById("speedBtn"),
  choiceOverlay: document.getElementById("choiceOverlay"),
  choiceTitle: document.getElementById("choiceTitle"),
  choiceHint: document.getElementById("choiceHint"),
  choiceList: document.getElementById("choiceList"),
  resultOverlay: document.getElementById("resultOverlay"),
  resultTitle: document.getElementById("resultTitle"),
  resultBody: document.getElementById("resultBody"),
  newRun: document.getElementById("newRunBtn"),
};

const BET_STEPS = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
const SPEED_STEPS = [1, 2, 3];
const FIELD = { w: 350, h: 760, pathX: 175, spawnY: -18, baseY: 720, attackLineY: 720 };
const TOWER_SLOTS = [{ x: 62, y: 700 }, { x: 175, y: 678 }, { x: 288, y: 700 }];
const EXP_TABLE = [60,80,100,120,140,170,200,230,260,300,340,390,440,500,570,650,740,840,950,1070,1200,1340,1490,1650,1820,2000,2190,2390,2600,2820,3050,3290,3540,3800,4070,4350,4640,4940,5250];

const TOWERS = [
  { id:"flame", name:"噴火槍", attr:"火", damage:66, range:460, rate:4.00, mode:"flame", color:"#ff5c2d", desc:"1.5秒持續噴灑，擅長壓制小怪群。" },
  { id:"grenade", name:"榴彈", attr:"火", damage:250, range:700, rate:0.55, mode:"grenade", color:"#ff9b35", splash:48, desc:"拋物線爆炸，穩定清理密集小怪。" },
  { id:"cryo", name:"急凍狙擊", attr:"冰", damage:410, range:900, rate:0.45, mode:"cryo", color:"#67c5ff", pierce:2, desc:"高傷穿透單發，專門點殺菁英與 BOSS。" },
  { id:"frostbomb", name:"冰晶炸彈", attr:"冰", damage:220, range:720, rate:0.45, mode:"frostbomb", color:"#9fe7ff", splash:52, freeze:0.32, desc:"指定地點爆炸並減速，重點是群體減壓。" },
  { id:"laser", name:"雷射光線", attr:"電", damage:105, range:860, rate:3.50, mode:"laser", color:"#ffe066", lockTime:3.0, desc:"持續鎖定高血量目標，對菁英與 BOSS 強。" },
  { id:"chain", name:"閃電鎖鏈", attr:"電", damage:105, range:760, rate:0.75, mode:"chain", color:"#b67cff", chains:4, desc:"瞬間連鎖多目標，清群穩定但打王較弱。" },
  { id:"gas", name:"毒氣彈", attr:"毒", damage:100, range:740, rate:0.38, mode:"gas", color:"#55d65a", splash:42, zoneTime:2.4, desc:"定點毒霧，以持續範圍傷害封鎖路線。" },
  { id:"needle", name:"毒針彈", attr:"毒", damage:285, range:700, rate:0.65, mode:"needle", color:"#41d08a", splash:30, desc:"中高單體傷害兼小範圍爆裂，偏菁英戰。" },
  { id:"blade", name:"旋刃", attr:"無", damage:320, range:680, rate:0.85, mode:"blade", color:"#d5dde8", splash:28, desc:"高頻泛用輸出，不依賴屬性相剋。" },
  { id:"trap", name:"陷阱", attr:"無", damage:120, range:700, rate:0.40, mode:"trap", color:"#9aa3b6", splash:52, desc:"定點控場與聚怪，輸出不是主要價值。" },
];

const UPGRADE_REQUIREMENTS = {
  "燃燒強化": "燃料附著",
  "延時燃燒": "燃料附著",
  "燃燒加劇": "凝固汽油彈",
  "延燒區域": "凝固汽油彈",
  "冷卻延長": "寒氣附著",
  "極凍禁制": "寒氣附著",
  "冰痕延長": "冰痕",
  "冰痕強化": "冰痕",
  "聚焦強化": "過載聚焦",
  "持續灼穿": "過載聚焦",
  "麻痺擴散": "電磁殘留",
  "路徑強化": "傳導增幅",
  "腐蝕加深": "腐蝕毒霧",
  "毒傷強化": "神經毒素",
  "延效毒素": "神經毒素",
  "迴旋增幅": "迴旋飛刃",
  "追加飛刃": "迴旋飛刃",
  "封鎖延長": "戰術封鎖",
};

const UPGRADE_ROWS = [
  [["燃壓提升","傷害+","傷害+35%"],["強力裝藥","傷害+","傷害+35%"],["冰核強化","傷害+","傷害+35%"],["冰晶加壓","傷害+","傷害+30%"],["聚焦增幅","傷害+","每段傷害+30%"],["高壓電芯","傷害+","傷害+35%"],["腐蝕升級","傷害+","每段傷害+35%"],["毒針強化","傷害+","傷害+30%"],["鋒刃加固","傷害+","傷害+40%"],["戰術強化","傷害+","傷害+30%"]],
  [["高效供油","時間+","持續時間+50%"],["巨型彈體","範圍+","範圍+25%"],["精準校正","攻速+","攻速+25%"],["擴散凍爆","範圍+","範圍+25%"],["超頻發射","攻速+","Tick速度+25%"],["額外鏈接","額外攻擊","額外閃電鏈+1"],["擴散氣囊","範圍+","範圍+25%"],["疾速連射","攻速+","攻速+25%"],["高速驅動","攻速+","攻速+25%"],["觸發增幅","範圍+","範圍+25%"]],
  [["擴散噴口","範圍+","範圍+25%"],["快速裝填","額外爆炸","爆點+1"],["多重槍管","子彈+1","額外子彈+1"],["急速投擲","攻速+","攻速+20%"],["延伸透鏡","持續時間+","持續時間+50%"],["彈跳目標","彈跳目標+","彈掉目標+3"],["快速裝填","攻速+","攻速+20%"],["擴散爆裂","範圍+","爆炸範圍+25%"],["巨大鋒刃","範圍+","攻擊範圍+25%"],["快速部署","攻速+","布置速度+20%"]],
  [["雙重火流","額外火焰","額外火焰+1"],["雙重裝彈","攻速+","攻速+20%"],["貫穿彈芯","穿透+","穿透敵人+1"],["多重冰爆","額外炸彈+","額外炸彈+1"],["折射光束","額外光束","在主目標折射一個光束對另一目標造成傷害"],["傳導增幅","路徑傷害","對聯鎖路徑上敵人造成50傷害"],["雙重罐體","額外毒霧","額外毒氣彈+1"],["追加毒針","額外毒針","額外毒針+1"],["光速連斬","額外斬擊","額外斬擊+1"],["追加模組","額外陷阱","額外陷阱+1"]],
  [["燃料附著","解鎖燃燒","命中後每秒造成燃燒傷害，持續2S"],["凝固汽油彈","爆炸後留下燃燒區域","燃燒區域持續2秒，每秒造成30傷害"],["寒氣附著","解鎖緩速","命中後緩速25%，持續2S"],["冰痕","爆炸後留下冰痕","爆炸後留下冰痕區域，敵人移速-15%，持續2S"],["過載聚焦","持續增傷","持續照射同一目標1S後，後續傷害+20%"],["電磁殘留","麻痺攻擊目標","被擊中的敵人麻痺0.3S"],["腐蝕毒霧","毒霧中的敵人受到額外傷害","毒霧中的敵人受到傷害+15%"],["神經毒素","命中後造成中毒","命中後造成中毒，每0.5S25傷害，持續2S"],["迴旋飛刃","命中後有機率發射額外迴旋刃","命中後機率向隨機方向發射一道回旋刃，造成50%傷害"],["戰術封鎖","陷阱造成定身","陷阱觸發後造成定身0.5S"]],
  [["燃燒強化","燃燒傷害+","燃燒傷害+100%"],["燃燒加劇","燃燒傷害+","燃燒傷害+100%"],["冷卻延長","緩速時間+","緩速時間+50%"],["冰痕延長","冰痕持續時間+","冰痕持續時間+50%"],["聚焦強化","聚焦效果+","加成效果提升50%"],["麻痺擴散","麻痺時間+","麻痺時間+50%"],["腐蝕加深","易傷效果+","增傷效果+50%"],["毒傷強化","中毒傷害+","中毒傷害+100%"],["迴旋增幅","迴旋飛刃傷害+","飛刃傷害+100%"],["封鎖延長","定身時間+","定身時間+50%"]],
  [["延時燃燒","燃燒時間+","燃燒持續時間+50%"],["延燒區域","燃燒時間+","燃燒持續時間+50%"],["極凍禁制","對第一個目標凍結","對第一個目標造成凍結效果，持續1S"],["冰痕強化","冰痕緩速+","冰痕緩速效果+15%"],["持續灼穿","聚焦時間-","持續照射需要時間-50%"],["路徑強化","路徑傷害+","路徑上造成的傷害+100%"],["延時滯留","毒霧持續時間+","毒霧持續時間+50%"],["延效毒素","中毒時間+","中毒持續時間+50%"],["追加飛刃","迴旋刃+1","額外迴旋刃+1"],["牽引模組","牽引強度+","陷阱觸發後將目標拉向中心"]],
];

const MONSTERS = {
  normal: { name:"普通怪", hp:300, speed:60, range:0, atk:20, interval:1.5, exp:10, money:[1,3], color:"#6d7a91", size:14, shape:"square" },
  fast: { name:"快速怪", hp:180, speed:95, range:0, atk:15, interval:1.2, exp:8, money:[1,2], color:"#2f91d1", size:12, shape:"diamond" },
  tank: { name:"厚血怪", hp:650, speed:45, range:0, atk:35, interval:1.8, exp:18, money:[4,8], color:"#9a7038", size:21, shape:"square" },
  ranged: { name:"遠程怪", hp:260, speed:55, range:100, atk:20, interval:1.8, exp:12, money:[1,3], color:"#8b66d9", size:16, shape:"triangle" },
  special: { name:"特殊行為怪", hp:260, speed:75, range:0, atk:18, interval:1.4, exp:12, money:[1,3], color:"#d05d85", size:17, shape:"diamond", special:true },
};

const ELITES = [
  { name:"巨型菁英", hp:1800, speed:40, range:0, atk:60, interval:2.0, exp:50, money:[15,25], color:"#c78940", size:28, shape:"square" },
  { name:"狂奔菁英", hp:1200, speed:95, range:0, atk:40, interval:1.2, exp:45, money:[12,22], color:"#33a9e3", size:24, shape:"diamond" },
  { name:"遠程菁英", hp:1500, speed:50, range:150, atk:45, interval:2.0, exp:55, money:[14,24], color:"#9f78ff", size:26, shape:"triangle" },
];

const BOSSES = [
  { name:"標準 Boss", hp:9000, speed:30, range:0, atk:140, interval:2.2, color:"#d6453d" },
  { name:"衝鋒 Boss", hp:7500, speed:38, range:0, atk:155, interval:1.8, color:"#e86832" },
  { name:"遠程 Boss", hp:8200, speed:26, range:180, atk:90, interval:1.6, color:"#cc63d9" },
  { name:"干擾 Boss", hp:8500, speed:28, range:0, atk:120, interval:2.5, color:"#6981ff" },
  { name:"坦克 Boss", hp:13000, speed:24, range:0, atk:130, interval:2.4, color:"#b58b4b" },
];

const WAVE = [
  [1,.72,0,0,0,0,0,0,2],[2,.82,0,0,0,0,0,0,2],[3,.95,2,1,0,0,0,0,2],[4,1.10,4,1,0,0,0,0,2],[5,1.28,6,1,0,0,1,1,2],
  [6,1.48,8,.9,.1,0,2,1,2],[7,1.70,10,.85,.15,0,3,2,2],[8,1.95,11,.8,.2,0,4,2,2],[9,2.22,12,.75,.25,0,5,2,2],[10,2.52,13,.7,.3,0,6,3,2],
  [11,2.86,14,.65,.3,.05,7,3,2],[12,3.24,15,.65,.3,.05,8,3,2],[13,3.66,16,.6,.35,.05,9,3,2],[14,4.12,17,.6,.35,.05,10,4,2],[15,4.62,18,.55,.4,.05,11,4,2],
  [16,5.16,19,.5,.4,.1,12,4,2],[17,5.75,20,.5,.4,.1,13,4,2],[18,6.40,21,.45,.45,.1,14,5,2],[19,7.10,22,.45,.45,.1,15,5,2],[20,7.85,24,.45,.45,.1,16,5,2],
  [21,8.45,25,.4,.45,.15,17,5,2],[22,9.10,26,.4,.44,.16,18,6,2],[23,9.80,27,.4,.43,.17,19,6,2],[24,10.55,28,.4,.42,.18,20,6,2],[25,11.35,29,.4,.41,.19,21,6,2],
  [26,12.20,30,.3,.45,.25,22,7,2],[27,13.10,31,.3,.44,.26,23,7,2],[28,14.05,32,.3,.43,.27,24,7,2],[29,15.05,33,.3,.42,.28,25,7,2],[30,16.10,35,.3,.41,.29,26,8,2],
].map(r => ({ wave:r[0], hpMul:r[1], eliteWeight:r[2], e1:r[3], e2:r[4], e3:r[5], bossBase:r[6], bossInc:r[7], bossCd:r[8] }));

const BANDS = [
  { from:1, to:2, count:[16,24], drop:{normal:.7,fast:.4,tank:1,ranged:.5,special:.5}, templates:{standard:700,fast:300} },
  { from:3, to:5, count:[20,30], drop:{normal:.65,fast:.35,tank:1,ranged:.45,special:.45}, templates:{standard:400,tank:250,ranged:200,disrupt:150} },
  { from:6, to:10, count:[28,40], drop:{normal:.55,fast:.3,tank:1,ranged:.4,special:.4}, templates:{standard:250,fast:200,tank:200,ranged:150,disrupt:200} },
  { from:11, to:20, count:[34,50], drop:{normal:.45,fast:.2,tank:1,ranged:.3,special:.3}, templates:{standard:200,fast:150,tank:200,ranged:150,disrupt:150,mixed:150} },
  { from:21, to:30, count:[42,62], drop:{normal:.4,fast:.15,tank:1,ranged:.25,special:.25}, templates:{standard:100,fast:150,tank:200,ranged:150,disrupt:150,mixed:250} },
];

const TEMPLATE = {
  standard:{normal:450,fast:200,tank:150,ranged:100,special:100},
  fast:{normal:250,fast:450,tank:100,ranged:100,special:100},
  tank:{normal:250,fast:150,tank:400,ranged:100,special:100},
  ranged:{normal:200,fast:150,tank:150,ranged:300,special:200},
  disrupt:{normal:200,fast:200,tank:100,ranged:150,special:350},
  mixed:{normal:180,fast:240,tank:200,ranged:180,special:200},
};

const TOWER_ATTR = {
  flame:"fire", grenade:"fire",
  cryo:"ice", frostbomb:"ice",
  laser:"electric", chain:"electric",
  gas:"poison", needle:"poison",
  blade:"neutral", trap:"neutral",
};
const ATTRIBUTE_KEYS = ["fire", "ice", "electric", "poison", "neutral"];
const ATTRIBUTE_DISPLAY = {
  fire:{ label:"火", color:"#ff6b3d" },
  ice:{ label:"冰", color:"#72d4ff" },
  electric:{ label:"電", color:"#d89cff" },
  poison:{ label:"毒", color:"#66d86f" },
  neutral:{ label:"無", color:"#d5dde8" },
};
const ENEMY_ATTRIBUTE_DEFAULTS = {
  normal:  { fire:1,    ice:1,    electric:1,    poison:1,    neutral:1.25 },
  fast:    { fire:1,    ice:1.35, electric:1,    poison:.80,  neutral:1 },
  tank:    { fire:1.35, ice:1,    electric:.80,  poison:1,    neutral:1 },
  ranged:  { fire:.80,  ice:1,    electric:1.35, poison:1,    neutral:1 },
  special: { fire:1,    ice:.80,  electric:1,    poison:1.35, neutral:1 },
  elite_1: { fire:1.35, ice:.80,  electric:1,    poison:1,    neutral:1 },
  elite_2: { fire:1,    ice:1.35, electric:1,    poison:.80,  neutral:1 },
  elite_3: { fire:.80,  ice:1,    electric:1.35, poison:1,    neutral:1 },
  boss_1:  { fire:1,    ice:1,    electric:1,    poison:1,    neutral:1.25 },
  boss_2:  { fire:1,    ice:1.35, electric:1,    poison:.80,  neutral:1 },
  boss_3:  { fire:.80,  ice:1,    electric:1.35, poison:1,    neutral:1 },
  boss_4:  { fire:1,    ice:1,    electric:.80,  poison:1.35, neutral:1 },
  boss_5:  { fire:1.35, ice:.80,  electric:1,    poison:1,    neutral:1 },
};
const PARAM_STORAGE_KEY = "towerDefenseTuningParams.v3";
const PARAM_CHANNEL = "tower-defense-param-sync";
const TOWER_PARAM_IDS = ["flame","grenade","cryo","frostbomb","laser","chain","gas","needle","blade","trap"];
const TOWER_BASE_PARAMS = {
  flame: { damage:66, rate:4.00, range:460, splash:0, duration:1.5, cooldown:2.4, tick:0.5, minionMul:1.15, eliteMul:.85, bossMul:.65 },
  grenade: { damage:250, rate:.55, range:700, splash:48, duration:0, cooldown:0, tick:.5, minionMul:1.20, eliteMul:.80, bossMul:.55 },
  cryo: { damage:410, rate:.45, range:900, splash:0, duration:0, cooldown:0, tick:.5, minionMul:.80, eliteMul:1.25, bossMul:1.55 },
  frostbomb: { damage:220, rate:.45, range:720, splash:52, duration:0, cooldown:0, tick:.5, minionMul:1.15, eliteMul:.75, bossMul:.50 },
  laser: { damage:105, rate:3.50, range:860, splash:0, duration:3.0, cooldown:2.8, tick:.5, minionMul:.80, eliteMul:1.25, bossMul:1.55 },
  chain: { damage:105, rate:.75, range:760, splash:0, duration:0, cooldown:0, tick:.5, minionMul:1.20, eliteMul:.75, bossMul:.50 },
  gas: { damage:100, rate:.38, range:740, splash:42, duration:2.4, cooldown:0, tick:.5, minionMul:1.15, eliteMul:.90, bossMul:.70 },
  needle: { damage:285, rate:.65, range:700, splash:30, duration:0, cooldown:0, tick:.5, minionMul:.90, eliteMul:1.15, bossMul:1.30 },
  blade: { damage:320, rate:.85, range:680, splash:28, duration:0, cooldown:0, tick:.5, minionMul:1.00, eliteMul:1.00, bossMul:.95 },
  trap: { damage:120, rate:.40, range:700, splash:52, duration:1.5, cooldown:0, tick:.5, minionMul:.95, eliteMul:.75, bossMul:.45 },
};

function towerDefaultParams() {
  const result = {};
  TOWER_PARAM_IDS.forEach(id => {
    const base = TOWER_BASE_PARAMS[id];
    result[`tower_${id}_damage`] = base.damage;
    result[`tower_${id}_rate`] = base.rate;
    result[`tower_${id}_range`] = base.range;
    result[`tower_${id}_splash`] = base.splash;
    result[`tower_${id}_duration`] = base.duration;
    result[`tower_${id}_cooldown`] = base.cooldown;
    result[`tower_${id}_tick`] = base.tick;
    result[`tower_${id}_minionMul`] = base.minionMul;
    result[`tower_${id}_eliteMul`] = base.eliteMul;
    result[`tower_${id}_bossMul`] = base.bossMul;
  });
  return result;
}

function monsterDefaultParams() {
  const result = {};
  const add = (id, base) => {
    result[`monster_${id}_hp`] = base.hp;
    result[`monster_${id}_speed`] = base.speed;
    result[`monster_${id}_range`] = base.range;
    result[`monster_${id}_atk`] = base.atk;
    result[`monster_${id}_interval`] = base.interval;
    result[`monster_${id}_exp`] = base.exp || 120;
    const attributes = ENEMY_ATTRIBUTE_DEFAULTS[id] || {};
    ATTRIBUTE_KEYS.forEach(attr => result[`monster_${id}_${attr}Mul`] = attributes[attr] ?? 1);
    if (base.money) {
      result[`monster_${id}_moneyMin`] = base.money[0];
      result[`monster_${id}_moneyMax`] = base.money[1];
    }
  };
  Object.entries(MONSTERS).forEach(([id, base]) => add(id, base));
  ELITES.forEach((base, index) => add(`elite_${index + 1}`, base));
  BOSSES.forEach((base, index) => add(`boss_${index + 1}`, { ...base, exp:120 }));
  return result;
}

function templateDefaultParams() {
  const result = {};
  Object.entries(TEMPLATE).forEach(([templateId, weights]) => {
    Object.entries(weights).forEach(([monsterId, value]) => {
      result[`template_${templateId}_${monsterId}`] = value;
    });
  });
  BANDS.forEach((band, index) => {
    const bandId = index + 1;
    result[`band_${bandId}_countMin`] = band.count[0];
    result[`band_${bandId}_countMax`] = band.count[1];
    Object.entries(band.drop).forEach(([monsterId, value]) => result[`band_${bandId}_drop_${monsterId}`] = value);
    Object.entries(band.templates).forEach(([templateId, value]) => result[`band_${bandId}_template_${templateId}`] = value);
  });
  return result;
}

function waveDefaultParams() {
  const result = {};
  WAVE.forEach(row => {
    result[`wave_${row.wave}_hpMul`] = row.hpMul;
    result[`wave_${row.wave}_eliteWeight`] = row.eliteWeight;
    result[`wave_${row.wave}_e1`] = row.e1;
    result[`wave_${row.wave}_e2`] = row.e2;
    result[`wave_${row.wave}_e3`] = row.e3;
    result[`wave_${row.wave}_bossBase`] = row.bossBase;
    result[`wave_${row.wave}_bossInc`] = row.bossInc;
    result[`wave_${row.wave}_bossCd`] = row.bossCd;
  });
  return result;
}

function expDefaultParams() {
  const result = {};
  EXP_TABLE.forEach((value, index) => result[`exp_${index + 1}`] = value);
  return result;
}

function upgradeDefaultParams() {
  return {
    upgradeDamage40: 1.4,
    upgradeDamage35: 1.35,
    upgradeDamage30: 1.3,
    upgradeRate25: 1.25,
    upgradeRate20: 1.2,
    upgradeRange25: 1.25,
    upgradeDuration50: 1.5,
    upgradeDotDamage100: 2,
    upgradeExtraChain: 3,
    upgradePathDamage: 50,
    upgradeVulnerable15: .15,
    upgradeSlow25: .25,
  };
}

const UPGRADE_VALUE_DEFS = {
  flame: [
    [{ key:"damagePct", value:35 }],
    [{ key:"durationPct", value:50 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"extraShots", value:1 }],
    [{ key:"burnDps", value:18 }, { key:"burnTime", value:2 }],
    [{ key:"dotDamagePct", value:100 }],
    [{ key:"burnDurationPct", value:50 }],
  ],
  grenade: [
    [{ key:"damagePct", value:35 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"extraAreas", value:1 }],
    [{ key:"ratePct", value:20 }],
    [{ key:"burnAreaDps", value:30 }, { key:"burnAreaTime", value:2 }],
    [{ key:"dotDamagePct", value:100 }],
    [{ key:"burnDurationPct", value:50 }],
  ],
  cryo: [
    [{ key:"damagePct", value:35 }],
    [{ key:"ratePct", value:25 }],
    [{ key:"extraProjectiles", value:1 }],
    [{ key:"extraPierce", value:1 }],
    [{ key:"slowPct", value:25 }, { key:"slowTime", value:2 }],
    [{ key:"slowDurationPct", value:50 }],
    [{ key:"freezeTime", value:1 }],
  ],
  frostbomb: [
    [{ key:"damagePct", value:30 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"ratePct", value:20 }],
    [{ key:"extraShots", value:1 }],
    [{ key:"iceTrailSlowPct", value:15 }, { key:"iceTrailTime", value:2 }],
    [{ key:"iceTrailDurationPct", value:50 }],
    [{ key:"iceTrailSlowBonusPct", value:15 }],
  ],
  laser: [
    [{ key:"damagePct", value:30 }],
    [{ key:"ratePct", value:25 }],
    [{ key:"durationPct", value:50 }],
    [{ key:"refractDamagePct", value:55 }],
    [{ key:"focusDelay", value:1 }, { key:"focusDamagePct", value:20 }],
    [{ key:"focusDamageBonusPct", value:50 }],
    [{ key:"focusDelayReducePct", value:50 }],
  ],
  chain: [
    [{ key:"damagePct", value:35 }],
    [{ key:"extraChainCasts", value:1 }],
    [{ key:"extraChains", value:3 }],
    [{ key:"pathDamage", value:50 }],
    [{ key:"stunTime", value:.3 }],
    [{ key:"stunDurationPct", value:50 }],
    [{ key:"pathDamagePct", value:100 }],
  ],
  gas: [
    [{ key:"damagePct", value:35 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"ratePct", value:20 }],
    [{ key:"extraShots", value:1 }],
    [{ key:"vulnerablePct", value:15 }],
    [{ key:"vulnerableBonusPct", value:50 }],
    [{ key:"zoneDurationPct", value:50 }],
  ],
  needle: [
    [{ key:"damagePct", value:30 }],
    [{ key:"ratePct", value:25 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"extraShots", value:1 }],
    [{ key:"poisonTick", value:.5 }, { key:"poisonDps", value:25 }, { key:"poisonTime", value:2 }],
    [{ key:"dotDamagePct", value:100 }],
    [{ key:"poisonDurationPct", value:50 }],
  ],
  blade: [
    [{ key:"damagePct", value:40 }],
    [{ key:"ratePct", value:25 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"extraShots", value:1 }],
    [{ key:"ricochetChancePct", value:45 }, { key:"ricochetDamagePct", value:50 }],
    [{ key:"ricochetDamageBonusPct", value:100 }],
    [{ key:"ricochetExtra", value:1 }],
  ],
  trap: [
    [{ key:"damagePct", value:30 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"ratePct", value:20 }],
    [{ key:"extraShots", value:1 }],
    [{ key:"rootTime", value:.5 }],
    [{ key:"rootDurationPct", value:50 }],
    [{ key:"pullStrengthPct", value:75 }],
  ],
};

function upgradeValueDefaultParams() {
  const result = {};
  TOWER_PARAM_IDS.forEach(towerId => {
    (UPGRADE_VALUE_DEFS[towerId] || []).forEach((row, rowIndex) => {
      row.forEach(spec => result[upgradeValueParamKey(towerId, rowIndex, spec.key)] = spec.value);
    });
  });
  return result;
}

function upgradeValueParamKey(towerId, rowIndex, key) {
  return `upgradeVal_${towerId}_${(rowIndex % UPGRADE_ROWS.length) + 1}_${key}`;
}

function upgradeOptionParamKey(towerId, rowIndex) {
  return `upgradeLegacy_${towerId}_${(rowIndex % UPGRADE_ROWS.length) + 1}`;
}

function upgradeEffectSpecs(towerId, rowIndex) {
  return UPGRADE_VALUE_DEFS[towerId]?.[rowIndex % UPGRADE_ROWS.length] || [];
}

function upgradeEffectValue(towerId, rowIndex, key, fallback=0) {
  const value = Number(params[upgradeValueParamKey(towerId, rowIndex, key)]);
  return Number.isFinite(value) ? value : fallback;
}

const DEFAULT_PARAMS = {
  bossLowWeight: 30,
  bossMidWeight: 50,
  bossHighWeight: 20,
  bossLowMin: 1.0,
  bossLowMax: 1.8,
  bossMidMin: 2.2,
  bossMidMax: 3.8,
  bossHighMin: 4.0,
  bossHighMax: 8.0,
  bossChanceMul: 1.0,
  bossChanceCap: 70,
  minionHpMul: 1.0,
  minionAtkMul: 1.0,
  minionSpeedMul: 1.0,
  eliteHpMul: 1.0,
  eliteAtkMul: 1.0,
  bossHpMul: 1.25,
  bossAtkMul: 1.0,
  bossSpeedMul: 1.0,
  moneyMul: 1.2,
  eliteMoneyMul: 1.0,
  dropChanceMul: 1.0,
  expMul: 1.0,
  towerDamageMul: 1.0,
  betMidMul: 1.5,
  betDeepMul: 2.0,
  baseHp: 1000,
  ...towerDefaultParams(),
  ...monsterDefaultParams(),
  ...templateDefaultParams(),
  ...waveDefaultParams(),
  ...expDefaultParams(),
  ...upgradeDefaultParams(),
  ...upgradeValueDefaultParams()
};

function cleanParams(input={}) {
  const next = { ...DEFAULT_PARAMS };
  Object.keys(DEFAULT_PARAMS).forEach(key => {
    const value = Number(input[key]);
    if (Number.isFinite(value)) next[key] = value;
  });
  next.bossLowWeight = Math.max(0, next.bossLowWeight);
  next.bossMidWeight = Math.max(0, next.bossMidWeight);
  next.bossHighWeight = Math.max(0, next.bossHighWeight);
  next.bossChanceCap = Math.max(0, Math.min(100, next.bossChanceCap));
  next.baseHp = Math.max(1, Math.round(next.baseHp));
  if (next.tower_gas_duration <= 0) next.tower_gas_duration = DEFAULT_PARAMS.tower_gas_duration;
  if (next.tower_trap_duration <= 0) next.tower_trap_duration = DEFAULT_PARAMS.tower_trap_duration;
  if (next.tower_gas_tick <= 0) next.tower_gas_tick = DEFAULT_PARAMS.tower_gas_tick;
  if (next.tower_trap_tick <= 0) next.tower_trap_tick = DEFAULT_PARAMS.tower_trap_tick;
  return next;
}

function loadParams() {
  try {
    return cleanParams(JSON.parse(localStorage.getItem(PARAM_STORAGE_KEY) || "{}"));
  } catch {
    return cleanParams();
  }
}

let params = loadParams();

function applyExternalParams(next) {
  params = cleanParams(next);
  if (state) {
    state.hp = Math.min(state.hp, params.baseHp);
    updateUi();
  }
}

try {
  const paramChannel = new BroadcastChannel(PARAM_CHANNEL);
  paramChannel.onmessage = event => {
    if (event.data && event.data.type === "towerDefenseParams") applyExternalParams(event.data.params);
  };
} catch {}

window.addEventListener("storage", event => {
  if (event.key === PARAM_STORAGE_KEY && event.newValue) applyExternalParams(loadParams());
});

let state;
let last = performance.now();
let speedIndex = 0;
let lastUiFrame = 0;
let lastDebugFrame = 0;
let lastDebugSnapshot = "";
const slotViews = [];

function reset() {
  state = {
    wallet: 10000, baseBetIndex: 3, started: false, over: false, wave: 0, hp: params.baseHp, pot: 0, exp: 0, level: 1,
    towers: [], monsters: [], projectiles: [], effects: [], zones: [], choicesOpen: false, waveActive: false, upgradeRepeatLocks: {},
    spawn: null, bossWeight: 0, bossCd: 0, bossAdd: 0, bossSeen: 0, bossRoll: null, nextBoss: false, nextBossWave: 0, selectedTemplate: "standard",
  };
  hideChoices();
  hideResult();
  updateUi();
}

const rand = (a,b) => Math.floor(a + Math.random() * (b - a + 1));
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const pick = arr => arr[rand(0, arr.length - 1)];
function pickWeighted(obj) {
  const entries = Object.entries(obj).filter(([,w]) => w > 0);
  const total = entries.reduce((s, [,w]) => s + Number(w), 0);
  let r = Math.random() * total;
  for (const [k,w] of entries) { r -= Number(w); if (r <= 0) return k; }
  return entries[0][0];
}
function paramNumber(key, fallback) {
  const value = Number(params[key]);
  return Number.isFinite(value) ? value : fallback;
}
function bandFor(wave) { return BANDS.find(b => wave >= b.from && wave <= b.to) || BANDS[BANDS.length - 1]; }
function waveInfoFor(wave) {
  const base = WAVE[Math.max(0, Math.min(29, wave - 1))] || WAVE[0];
  return {
    ...base,
    hpMul: paramNumber(`wave_${base.wave}_hpMul`, base.hpMul),
    eliteWeight: paramNumber(`wave_${base.wave}_eliteWeight`, base.eliteWeight),
    e1: paramNumber(`wave_${base.wave}_e1`, base.e1),
    e2: paramNumber(`wave_${base.wave}_e2`, base.e2),
    e3: paramNumber(`wave_${base.wave}_e3`, base.e3),
    bossBase: paramNumber(`wave_${base.wave}_bossBase`, base.bossBase),
    bossInc: paramNumber(`wave_${base.wave}_bossInc`, base.bossInc),
    bossCd: paramNumber(`wave_${base.wave}_bossCd`, base.bossCd),
  };
}
function waveInfo() { return waveInfoFor(state.wave); }
function bandIndexFor(wave) {
  const index = BANDS.findIndex(b => wave >= b.from && wave <= b.to);
  return index >= 0 ? index + 1 : BANDS.length;
}
function tunedBand(base, wave) {
  const bandId = bandIndexFor(wave);
  const drop = {};
  Object.keys(base.drop).forEach(monsterId => drop[monsterId] = paramNumber(`band_${bandId}_drop_${monsterId}`, base.drop[monsterId]));
  const templates = {};
  Object.keys(base.templates).forEach(templateId => templates[templateId] = paramNumber(`band_${bandId}_template_${templateId}`, base.templates[templateId]));
  return {
    ...base,
    count: [
      Math.round(paramNumber(`band_${bandId}_countMin`, base.count[0])),
      Math.round(paramNumber(`band_${bandId}_countMax`, base.count[1])),
    ],
    drop,
    templates,
  };
}
function tunedTemplate(templateId) {
  const base = TEMPLATE[templateId] || TEMPLATE.standard;
  const weights = {};
  Object.keys(base).forEach(monsterId => weights[monsterId] = paramNumber(`template_${templateId}_${monsterId}`, base[monsterId]));
  return weights;
}
function currentBet() {
  const base = BET_STEPS[state.baseBetIndex];
  if (state.wave + 1 >= 21) return Math.round(base * params.betDeepMul);
  if (state.wave + 1 >= 11) return Math.round(base * params.betMidMul);
  return base;
}
function payout() { return Math.floor(state.pot * (1 + state.bossAdd)); }

function prepareNextBossPreview() {
  const nextWave = state.wave + 1;
  if (nextWave > 30 || state.nextBossWave === nextWave) return;
  state.nextBoss = rollBossForWave(nextWave, waveInfoFor(nextWave));
  state.nextBossWave = nextWave;
}

function consumeBossPreview(wave, info) {
  if (state.nextBossWave === wave) {
    const planned = state.nextBoss;
    state.nextBoss = false;
    state.nextBossWave = 0;
    return planned;
  }
  return rollBossForWave(wave, info);
}

function rollBossForWave(wave, info) {
  if (wave < 5 || state.bossCd > 0) {
    if (state.bossCd > 0) state.bossCd -= 1;
    return false;
  }
  state.bossWeight += info.bossBase + info.bossInc;
  const ok = Math.random() * 100 < Math.min(params.bossChanceCap, state.bossWeight * params.bossChanceMul);
  if (ok) {
    state.bossWeight = 0;
    state.bossCd = info.bossCd;
  }
  return ok;
}

function rarityLabel(rarity) {
  return {
    common: "普通",
    tower: "特色",
    deepen: "深化",
    synergy: "解鎖",
    newTower: "新砲台",
  }[rarity] || "普通";
}

function showChoices(title, hint, choices) {
  state.choicesOpen = true;
  ui.choiceTitle.textContent = title;
  ui.choiceHint.textContent = hint;
  ui.choiceList.innerHTML = "";
  choices.forEach(choice => {
    const btn = document.createElement("button");
    const rarity = choice.rarity || "common";
    btn.className = `choice-card rarity-${rarity}`;
    btn.type = "button";
    btn.innerHTML = `<div class="choice-top"><span class="choice-name">${choice.title}</span><span class="rarity-badge">${choice.rarityLabel || rarityLabel(rarity)}</span></div><div class="choice-sub">${choice.tag || ""}</div><p>${choice.desc}</p>`;
    btn.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      if (btn.disabled) return;
      btn.disabled = true;
      try {
        choice.onPick();
      } catch (error) {
        console.error(error);
        btn.disabled = false;
        state.message = `升級套用失敗：${error.message || error}`;
        updateUi();
      }
    });
    ui.choiceList.appendChild(btn);
  });
  ui.choiceOverlay.classList.remove("hidden");
  updateUi();
}
function hideChoices() {
  state.choicesOpen = false;
  ui.choiceOverlay.classList.add("hidden");
  ui.choiceList.innerHTML = "";
}
function showResult(title, body) {
  state.over = true;
  ui.resultTitle.textContent = title;
  ui.resultBody.textContent = body;
  ui.resultOverlay.classList.remove("hidden");
}
function hideResult() { ui.resultOverlay.classList.add("hidden"); }

function startBet() {
  if (state.over || state.choicesOpen || state.waveActive || state.monsters.length) return;
  const bet = currentBet();
  if (state.wallet < bet) { showResult("錢包不足", "沒有足夠餘額下注。"); return; }
  if (!state.started) {
    state.wallet -= bet;
    showStartingTowerDraft();
    return;
  }
  state.wallet -= bet;
  startWave();
}

function showStartingTowerDraft() {
  const choices = randomTowerChoices(3).map(t => towerChoice(t, () => {
    addTower(t);
    hideChoices();
    state.started = true;
    startWave();
  }));
  showChoices("選擇起始砲台", "三選一，選完後開始第一波。", choices);
}

function randomTowerChoices(n, excluded = new Set()) {
  const owned = new Set(state.towers.map(t => t.id));
  const pool = TOWERS.filter(t => !owned.has(t.id) && !excluded.has(t.id));
  const picks = [];
  while (picks.length < n && picks.length < pool.length) {
    const t = pool[rand(0, pool.length - 1)];
    if (!picks.includes(t)) picks.push(t);
  }
  return picks;
}

function towerChoice(t, onPick) {
  return { title: t.name, tag: `${t.attr} / ${t.mode}`, towerId:t.id, rarity:"newTower", desc: `傷害 ${t.damage}，射程 ${t.range}，攻速 ${t.rate}/秒。${t.desc}`, onPick };
}

function addTower(def) {
  if (state.towers.length >= 3) return;
  state.towers.push({
    ...JSON.parse(JSON.stringify(def)),
    slot: state.towers.length, x: TOWER_SLOTS[state.towers.length].x, y: TOWER_SLOTS[state.towers.length].y,
    cd: 0, channel: null, lock: null, upgrades: [], level: 1, extraShots: 0, extraAreas: 0, dotMul: 1, slowMul: 1, stunMul: 1,
    burnDurationMul: 1, poisonDurationMul: 1, slowDurationMul: 1, zoneDurationMul: 1, iceTrailDurationMul: 1,
    durationMul: 1, focusMul: 1, vulnerable: 0, burnArea: false, poison: false, stun: false, freeze: false,
  });
}

function startWave() {
  state.wave += 1;
  if (state.wave > 30) {
    showResult("30 波結算", `清到第 30 波。可收金額 ${payout()}。`);
    return;
  }
  const info = waveInfo();
  const band = tunedBand(bandFor(state.wave), state.wave);
  const template = pickWeighted(band.templates);
  state.selectedTemplate = template;
  const count = rand(band.count[0], band.count[1]);
  const boss = consumeBossPreview(state.wave, info);
  const elites = eliteCount(info);
  state.spawn = { remain: count, timer: 0, every: 0.34, template, hpMul: info.hpMul, band, elites, boss };
  state.waveActive = true;
  state.message = `第 ${state.wave} 波開始：${count} 隻怪${elites ? `，菁英 ${elites}` : ""}${boss ? "，Boss 接近" : ""}`;
  updateUi();
}

function shouldBoss(info) {
  return rollBossForWave(state.wave, info);
}

function eliteCount(info) {
  if (Math.random() * 100 > info.eliteWeight) return 0;
  const r = Math.random();
  if (r < info.e1) return 1;
  if (r < info.e1 + info.e2) return 2;
  return info.e3 > 0 ? 3 : 1;
}

function spawnMonster(kind, hpMul, band) {
  const base = MONSTERS[kind];
  const lane = base.special ? rand(-68, 68) : pick([-70, -35, 0, 35, 70]) + rand(-4, 4);
  const x = FIELD.pathX + lane;
  const curve = base.special ? rand(30, 54) * pick([-1, 1]) : 0;
  state.monsters.push(makeEnemy(base, hpMul, x, curve, kind, band.drop[kind], false, false, base.special ? "sway" : "straight"));
}
function spawnElite(hpMul) {
  const index = rand(0, ELITES.length - 1);
  const base = ELITES[index];
  state.monsters.push(makeEnemy(base, hpMul, FIELD.pathX + pick([-54, -18, 18, 54]) + rand(-4, 4), 0, "elite", 1, true, false, "straight", `elite_${index + 1}`));
}
function spawnBoss(hpMul) {
  const index = rand(0, BOSSES.length - 1);
  const base = BOSSES[index];
  state.monsters.push(makeEnemy(base, hpMul, FIELD.pathX, 0, "boss", 0, false, true, "straight", `boss_${index + 1}`));
}
function makeEnemy(base, hpMul, x, curve, kind, dropChance, elite=false, boss=false, pathType="straight", tuneId=kind) {
  const tunedBase = {
    ...base,
    hp: paramNumber(`monster_${tuneId}_hp`, base.hp),
    speed: paramNumber(`monster_${tuneId}_speed`, base.speed),
    range: paramNumber(`monster_${tuneId}_range`, base.range),
    atk: paramNumber(`monster_${tuneId}_atk`, base.atk),
    interval: paramNumber(`monster_${tuneId}_interval`, base.interval),
    exp: paramNumber(`monster_${tuneId}_exp`, base.exp || 120),
  };
  if (base.money) {
    tunedBase.money = [
      paramNumber(`monster_${tuneId}_moneyMin`, base.money[0]),
      paramNumber(`monster_${tuneId}_moneyMax`, base.money[1]),
    ];
  }
  const classHpMul = boss ? params.bossHpMul : elite ? params.eliteHpMul : params.minionHpMul;
  const classAtkMul = boss ? params.bossAtkMul : elite ? params.eliteAtkMul : params.minionAtkMul;
  const classSpeedMul = boss ? params.bossSpeedMul : elite ? 1 : params.minionSpeedMul;
  const hp = Math.round(tunedBase.hp * hpMul * classHpMul);
  const minionAtkMul = { normal:.25, fast:.27, tank:.28, ranged:.30, special:.33 };
  const atk = elite || boss ? Math.round(tunedBase.atk * classAtkMul) : Math.max(1, Math.round(tunedBase.atk * (minionAtkMul[kind] || .3) * classAtkMul));
  const minionSpeedMul = { normal:.72, fast:.76, tank:.68, ranged:.72, special:.74 };
  const speed = elite || boss ? Math.max(1, Math.round(tunedBase.speed * classSpeedMul)) : Math.max(1, Math.round(tunedBase.speed * (minionSpeedMul[kind] || .72) * classSpeedMul));
  const attributeDefaults = ENEMY_ATTRIBUTE_DEFAULTS[tuneId] || {};
  const attrMultipliers = Object.fromEntries(ATTRIBUTE_KEYS.map(attr => [
    attr,
    paramNumber(`monster_${tuneId}_${attr}Mul`, attributeDefaults[attr] ?? 1)
  ]));
  return { ...tunedBase, kind, elite, boss, pathType, x, y: FIELD.spawnY, sx:x, curve, hp, maxHp:hp, atk, speed, atkCd:0, stopped:false,
    tuneId, attrMultipliers, burn:0, burnTime:0, poison:0, poisonTime:0, slowTime:0, stunTime:0, freezeTime:0, vulnerable:0, vulnerableAmount:0, dropChance };
}

function update(dt) {
  if (state.over || state.choicesOpen) return;
  updateSpawn(dt);
  updateZones(dt);
  updateTowers(dt);
  updateProjectiles(dt);
  updateEnemies(dt);
  checkWaveClear();
  state.effects = state.effects.map(e => ({ ...e, t:e.t-dt })).filter(e => e.t > 0);
  state.monsters.forEach(m => { if (m.damageTextCd > 0) m.damageTextCd -= dt; });
  updateBossRoll(dt);
}

function updateSpawn(dt) {
  if (!state.spawn) return;
  const s = state.spawn;
  s.timer -= dt;
  if (s.timer <= 0 && s.remain > 0) {
    spawnMonster(pickWeighted(tunedTemplate(s.template)), s.hpMul, s.band);
    s.remain -= 1;
    s.timer = s.every;
  }
  if (s.remain <= 0 && s.elites > 0) { spawnElite(s.hpMul); s.elites -= 1; }
  if (s.remain <= 0 && s.elites <= 0 && s.boss) { spawnBoss(s.hpMul); s.boss = false; }
  if (s.remain <= 0 && s.elites <= 0 && !s.boss) state.spawn = null;
}

function updateZones(dt) {
  const zoneControls = new Map();
  for (const z of state.zones) {
    z.time -= dt;
    const tick = Math.max(0.05, z.tick || 0.5);
    z.tickTimer = (z.tickTimer ?? 0) - dt;
    const tickCount = z.tickTimer <= 0 ? 1 + Math.floor(Math.abs(z.tickTimer) / tick) : 0;
    for (const m of state.monsters) {
      if (dist(z, m) <= z.radius) {
        if (tickCount > 0 && z.damage) damageEnemy(m, z.damage * tick * tickCount, z.tower);
        if (z.slow) m.slowTime = Math.max(m.slowTime, z.slow);
        if (z.root && !z.hardControlHits.has(m)) {
          const control = zoneControls.get(m) || { root:0, rootZones:[], pull:0, pullZone:null };
          if (z.root > control.root) control.root = z.root;
          control.rootZones.push(z);
          zoneControls.set(m, control);
        }
        if (z.vulnerable) { m.vulnerable = Math.max(m.vulnerable, 1); m.vulnerableAmount = Math.max(m.vulnerableAmount || 0, z.vulnerable); }
        if (z.pull) {
          const control = zoneControls.get(m) || { root:0, rootZones:[], pull:0, pullZone:null };
          if (z.pull > control.pull) {
            control.pull = z.pull;
            control.pullZone = z;
          }
          zoneControls.set(m, control);
        }
        if (tickCount > 0 && z.burn) applyBurn(m, z.burn, 1, z.tower);
        if (tickCount > 0 && z.poison) applyPoison(m, z.poison, 1, z.tower, z.tower?.poisonTick || .5);
      }
    }
    if (tickCount > 0) z.tickTimer += tick * tickCount;
  }
  zoneControls.forEach((control, m) => {
    if (control.root > 0) {
      applyHardControl(m, "stunTime", control.root);
      control.rootZones.forEach(z => z.hardControlHits.add(m));
    }
    if (control.pull > 0 && control.pullZone) {
      const z = control.pullZone;
      m.x += (z.x - m.x) * control.pull * dt;
      m.y += (z.y - m.y) * control.pull * dt;
    }
  });
  state.zones = state.zones.filter(z => z.time > 0);
}

function updateTowers(dt) {
  state.towers.forEach(t => {
    if (t.channel) {
      updateChannel(t, dt);
      return;
    }
    t.cd -= dt;
    if (t.cd <= 0) attack(t);
  });
}

function findTargets(t) {
  const origin = fireOrigin();
  return state.monsters.map(m => ({ m, d: dist(origin,m) })).filter(o => o.d <= scaledRange(t)).sort((a,b) => b.m.y - a.m.y);
}

function attack(t) {
  const targets = findTargets(t);
  if (!targets.length) return;
  const primary = targets[0].m;
  if (t.mode === "flame" || t.mode === "laser") startChannel(t, primary);
  else if (t.mode === "grenade") launchProjectileCluster(t, targets, "grenade", 1 + (t.extraAreas || 0), scaledSplash(t, t.splash || 54));
  else if (t.mode === "cryo") launchProjectileSpread(t, primary, "cryo", 1 + (t.extraProjectiles || 0), 28);
  else if (t.mode === "frostbomb") frostbomb(t, targets);
  else if (t.mode === "laser") laser(t, primary, targets);
  else if (t.mode === "chain") chain(t, targets);
  else if (t.mode === "gas") gas(t, targets);
  else if (t.mode === "needle") launchProjectileSpread(t, primary, "needle", 1 + (t.extraShots || 0), 26);
  else if (t.mode === "blade") launchProjectileSpread(t, primary, "blade", 1 + (t.extraShots || 0), 30);
  else if (t.mode === "trap") trap(t, targets);
  t.cd = attackCooldown(t);
}

function towerParam(t, key, fallback) {
  const value = Number(params[`tower_${t.id}_${key}`]);
  return Number.isFinite(value) ? value : fallback;
}
function towerUpgradeRatio(t, key) {
  const base = TOWER_BASE_PARAMS[t.id]?.[key];
  return base ? (t[key] || base) / base : 1;
}
function scaledDamage(t) { return towerParam(t, "damage", t.damage) * (t.damageMul || 1) * params.towerDamageMul; }
function towerBurnDps(t) { return (t.burnDps || 18) * (t.dotMul || 1); }
function towerBurnTime(t) { return (t.burnTime || 2) * (t.burnDurationMul || 1); }
function towerBurnAreaDps(t) { return (t.burnAreaDps || 30) * (t.dotMul || 1); }
function towerBurnAreaTime(t) { return (t.burnAreaTime || 2) * (t.burnDurationMul || 1); }
function towerPoisonDps(t) { return (t.poisonDps || 25) * (t.dotMul || 1); }
function towerPoisonTime(t) { return (t.poisonTime || 2) * (t.poisonDurationMul || 1); }
function towerSlowTime(t) { return (t.slowTime || 2) * (t.slowDurationMul || 1); }
function towerFreezeTime(t) { return (t.freezeTimeValue || 1) * (t.durationMul || 1); }
function towerStunTime(t) { return (t.stunTimeValue || .3) * (t.stunMul || 1); }
function towerRootTime(t) { return (t.rootTimeValue || .5) * (t.stunMul || 1); }
function attackCooldown(t) {
  const directCooldown = towerParam(t, "cooldown", 0);
  if (directCooldown > 0 && t.mode !== "flame" && t.mode !== "laser") return directCooldown;
  return 1 / Math.max(0.05, towerParam(t, "rate", t.rate) * towerUpgradeRatio(t, "rate"));
}
function channelDuration(t) {
  const fallback = t.mode === "flame" ? 1.5 : t.mode === "laser" ? 3.0 : 0;
  return towerParam(t, "duration", fallback) * t.durationMul;
}
function channelCooldown(t) {
  const fallback = t.mode === "flame" ? 2.0 : t.mode === "laser" ? 2.5 : attackCooldown(t);
  return towerParam(t, "cooldown", fallback);
}
function zoneDuration(t, fallback) {
  return Math.max(0, towerParam(t, "duration", fallback)) * (t.zoneDurationMul || t.durationMul || 1);
}
function zoneTick(t) {
  return Math.max(0.05, towerParam(t, "tick", 0.5));
}
function scaledRange(t) { return Math.min(towerParam(t, "range", t.range) * 0.62 * (t.rangeMul || 1), 720); }
function scaledSplash(t, base) { return towerParam(t, "splash", base) * (t.splashMul || 1); }
function fireOrigin() { return { x: FIELD.pathX, y: FIELD.h - 8 }; }

function startChannel(t, primary) {
  const origin = fireOrigin();
  t.channel = {
    time: channelDuration(t),
    tick: 0,
    target: primary,
    lockElapsed: 0,
    aimAngle: Math.atan2(primary.y - origin.y, primary.x - origin.x)
  };
  t.cd = 0;
}

function updateChannel(t, dt) {
  const c = t.channel;
  c.time -= dt;
  c.tick -= dt;
  while (c.tick <= 0 && c.time > 0) {
    const targets = findTargets(t);
    if (t.mode === "flame") {
      flame(t, targets, c);
    } else if (t.mode === "laser") {
      if (!targets.length) break;
      const target = c.target && c.target.hp > 0 && dist(fireOrigin(), c.target) <= scaledRange(t)
        ? c.target
        : targets[0].m;
      if (target !== c.target) c.lockElapsed = 0;
      c.target = target;
      laser(t, target, targets, c);
      c.lockElapsed += attackCooldown(t);
    }
    c.tick += attackCooldown(t);
  }
  if (c.time <= 0) {
    t.channel = null;
    t.cd = channelCooldown(t);
  }
}

function flame(t, targets, channel) {
  const dmg = scaledDamage(t);
  const origin = fireOrigin();
  const reach = Math.min(scaledRange(t), 310);
  const baseAngle = channel?.aimAngle ?? -Math.PI / 2;
  spreadOffsets(1 + (t.extraShots || 0), Math.PI / 10).forEach(angleOffset => {
    const angle = baseAngle + angleOffset;
    const direction = { x: Math.cos(angle), y: Math.sin(angle) };
    const center = { x: origin.x + direction.x * reach, y: origin.y + direction.y * reach };
    targets.forEach(o => {
      const dx = o.m.x - origin.x;
      const dy = o.m.y - origin.y;
      const forward = dx * direction.x + dy * direction.y;
      if (forward < 0 || forward > reach) return;
      const width = 34 + (forward / reach) * 46;
      const lateral = Math.abs(-dx * direction.y + dy * direction.x);
      if (lateral <= width) {
        damageEnemy(o.m, dmg, t);
        if (t.burnArea) addZone(o.m.x, o.m.y, 42, towerBurnAreaTime(t), 24*t.dotMul, t, { burn:towerBurnDps(t) });
      }
    });
    effect("cone", { ...origin, color:t.color }, center, { radius:70, width:80 });
  });
}
function areaHit(t, primary, type, radius, splashMul, opts={}) {
  damageEnemy(primary, scaledDamage(t), t);
  state.monsters.forEach(m => {
    if (m !== primary && dist(m,primary) <= radius) damageEnemy(m, scaledDamage(t)*splashMul, t);
    if (dist(m,primary) <= radius) {
      if (opts.freeze) m.freezeTime = Math.max(m.freezeTime, opts.freeze*t.durationMul);
      if (opts.slow) m.slowTime = Math.max(m.slowTime, opts.slow*t.slowMul);
      if (opts.poison) applyPoison(m, opts.poison*t.dotMul, towerPoisonTime(t), t, t.poisonTick || .5);
    }
  });
  if (t.burnArea) addZone(primary.x, primary.y, radius, towerBurnAreaTime(t), towerBurnAreaDps(t), t, { burn:towerBurnDps(t) });
  effect(type, t, primary, { radius });
}
function pierce(t, targets, type, from = fireOrigin(), showEffect = true) {
  targets.forEach((o,i) => { damageEnemy(o.m, scaledDamage(t)*(i?0.72:1), t); if (t.slow) o.m.slowTime=Math.max(o.m.slowTime,towerSlowTime(t)); if (t.freeze && i === 0) applyHardControl(o.m, "freezeTime", towerFreezeTime(t)); });
  if (showEffect) effect(type, { ...from, color:t.color }, targets[0].m, { chain: targets.slice(1).map(o=>o.m) });
}
function laser(t, primary, targets, channel=null) {
  const focusDelay = (t.focusDelay || 1) * (t.focusDelayMul || 1);
  const focused = t.focus && channel && channel.lockElapsed >= focusDelay;
  const bonus = focused ? 1 + ((t.focusDamagePct || 20) / 100)*t.focusMul : 1;
  damageEnemy(primary, scaledDamage(t)*bonus, t);
  if (t.refract) {
    const next = targets.find(o => o.m !== primary)?.m;
    if (next) {
      damageEnemy(next, scaledDamage(t)*((t.refractDamagePct || 55) / 100), t);
      effect("laser", { x:primary.x, y:primary.y, color:t.color }, next, { life:.18 });
    }
  }
  effect("laser", { ...fireOrigin(), color:t.color }, primary);
}
function chain(t, targets) {
  const count = (t.chains || 4) + (t.extraChains || 0);
  const casts = 1 + (t.extraChainCasts || 0);
  const usedRoots = new Set();
  const roots = targets.map(o => o.m).filter(m => m.hp > 0).slice(0, casts);
  roots.forEach(root => {
    if (usedRoots.has(root)) return;
    usedRoots.add(root);
    const hit = [root];
    const pool = state.monsters.filter(m => m !== root && m.hp > 0);
    while (hit.length < count && pool.length) {
      const from = hit[hit.length - 1];
      let bestIndex = 0;
      let bestDistance = Infinity;
      pool.forEach((m, index) => {
        const d = dist(from, m);
        if (d < bestDistance) {
          bestDistance = d;
          bestIndex = index;
        }
      });
      hit.push(pool.splice(bestIndex, 1)[0]);
    }
    hit.forEach((m,i) => { damageEnemy(m, scaledDamage(t)*(i?0.58:1), t); if (t.stun) applyHardControl(m, "stunTime", towerStunTime(t)); });
    if (t.pathDamage) damageChainPath(t, hit);
    effect("chain", { ...fireOrigin(), color:t.color }, hit[0], { chain: hit.slice(1) });
  });
}
function damageChainPath(t, hit) {
  const points = [fireOrigin(), ...hit];
  const pathWidth = 18;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    enemiesNearLine(a.x, a.y, b.x, b.y, pathWidth).forEach(m => {
      if (!hit.includes(m)) damageEnemy(m, t.pathDamage * (t.pathDamageMul || 1), t);
    });
  }
}
function gas(t, targets) {
  const radius = scaledSplash(t, t.splash || 58);
  areaTargetPoints(targets, 1 + (t.extraShots || 0), radius).forEach(center => {
    addZone(center.x, center.y, radius, zoneDuration(t, t.zoneTime || 2.5), scaledDamage(t), t, { poison:t.poison ? towerPoisonDps(t) : 0, slow:t.slow ? towerSlowTime(t) : 0, vulnerable:t.vulnerable || 0 });
    effect("gas", t, center, { radius });
  });
}
function frostbomb(t, targets) {
  const radius = scaledSplash(t, t.splash || 62);
  areaTargetPoints(targets, 1 + (t.extraShots || 0), radius).forEach(center => {
    areaAtPoint(t, center, "frost", radius, scaledDamage(t), .5, { freeze:t.freeze || .6, slow:.25 });
    if (t.iceTrail) addZone(center.x, center.y, radius * .85, (t.iceTrailTime || 2)*t.iceTrailDurationMul, 0, t, { slow:t.iceSlow || .15 });
  });
}
function blade(t, primary) {
  damageEnemy(primary, scaledDamage(t), t);
  state.monsters.forEach(m => { if (m !== primary && dist(m,primary) < scaledSplash(t,36)) damageEnemy(m, scaledDamage(t)*.42, t); });
  if (t.poison) applyPoison(primary, towerPoisonDps(t), towerPoisonTime(t), t, t.poisonTick || .5);
  if (t.ricochet && Math.random() < ((t.ricochetChancePct || 45) / 100)) {
    const hits = state.monsters
      .filter(m => m !== primary && m.hp > 0)
      .sort((a,b) => dist(primary,a)-dist(primary,b))
      .slice(0, 1 + (t.ricochetExtra || 0));
    hits.forEach(m => {
      damageEnemy(m, scaledDamage(t) * ((t.ricochetDamagePct || 50) / 100) * (t.ricochetMul || 1), t);
      effect("blade", { x:primary.x, y:primary.y, color:t.color }, m, { radius: scaledSplash(t,24) });
    });
  }
  effect("blade", t, primary, { radius: scaledSplash(t,36) });
}
function trap(t, targets) {
  const radius = scaledSplash(t, t.splash || 62);
  areaTargetPoints(targets, 1 + (t.extraShots || 0), radius).forEach(center => {
    addZone(center.x, center.y, radius, zoneDuration(t, 1.25), scaledDamage(t), t, { slow:.45*t.slowMul, root:t.root ? towerRootTime(t) : 0, pull:t.pull ? ((t.pullStrengthPct || 75) / 100)*(t.pullMul || 1) : 0, burn:t.burn ? towerBurnDps(t) : 0, poison:t.poison ? towerPoisonDps(t) : 0 });
    effect("trap", t, center, { radius });
  });
}

function launchProjectile(t, target, type) {
  launchProjectileAt(t, target, type, 0);
}

function launchProjectileSpread(t, target, type, count, gap = 28) {
  const offsets = spreadOffsets(count, gap);
  offsets.forEach(offset => launchProjectileAt(t, target, type, offset));
}

function launchProjectileCluster(t, targets, type, count, radius = 44) {
  areaTargetPoints(targets, count, radius).forEach(point => launchProjectileAt(t, point, type, 0));
}

function spreadOffsets(count, gap) {
  if (count <= 1) return [0];
  const center = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => (i - center) * gap);
}

function clusterPoints(target, count, gap = 44) {
  const pattern = [
    [0, 0],
    [0, -1],
    [-.85, -.55],
    [.85, -.55],
    [0, .7],
    [-1.1, .2],
    [1.1, .2],
  ];
  return Array.from({ length: count }, (_, i) => {
    const p = pattern[i % pattern.length];
    return {
      x: clamp(target.x + p[0] * gap, 12, FIELD.w - 12),
      y: clamp(target.y + p[1] * gap, 20, FIELD.baseY - 28)
    };
  });
}

function areaClusterPoints(target, count, radius) {
  if (count <= 1) return [{ x: target.x, y: target.y }];
  const gap = Math.max(radius * 2.05, 76);
  const pattern = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, -.82],
    [0, .82],
    [1.05, -.34],
    [-1.05, -.34],
  ];
  return Array.from({ length: count }, (_, i) => {
    const p = pattern[i % pattern.length];
    return {
      x: clamp(target.x + p[0] * gap, 16 + radius * .35, FIELD.w - 16 - radius * .35),
      y: clamp(target.y + p[1] * gap, 104 + radius * .35, FIELD.baseY - 54 - radius * .35)
    };
  });
}

function areaTargetPoints(targets, count, radius) {
  const monsters = targets.map(o => o.m).filter(m => m && m.hp > 0);
  if (!monsters.length) return [];
  const picked = [];
  const minGap = Math.max(radius * .9, 44);
  monsters.forEach(m => {
    if (picked.length >= count) return;
    if (picked.every(p => dist(p, m) >= minGap)) picked.push(m);
  });
  monsters.forEach(m => {
    if (picked.length >= count) return;
    if (!picked.includes(m)) picked.push(m);
  });
  if (picked.length >= count) return picked.slice(0, count).map(m => ({ x: m.x, y: m.y }));
  return areaClusterPoints(picked[0], count, radius).map((point, index) => {
    const locked = picked[index];
    return locked ? { x: locked.x, y: locked.y } : point;
  });
}

function targetPoints(target, count, gap = 34) {
  return spreadOffsets(count, gap).map(offset => ({
    x: clamp(target.x + offset, 12, FIELD.w - 12),
    y: target.y
  }));
}

function launchProjectileAt(t, target, type, targetOffsetX) {
  const origin = fireOrigin();
  const speed = type === "grenade" ? 520 : type === "blade" ? 760 : 900;
  const aim = { x: clamp(target.x + targetOffsetX, 12, FIELD.w - 12), y: target.y };
  const end = type === "grenade" ? aim : projectileEdgePoint(origin.x, origin.y, aim.x, aim.y);
  const travel = clamp(dist(origin, end) / speed, .12, .72);
  state.projectiles.push({
    type,
    tower: t,
    x: origin.x,
    y: origin.y,
    sx: origin.x,
    sy: origin.y,
    tx: end.x,
    ty: end.y,
    fullTx: end.x,
    fullTy: end.y,
    hit: false,
    offsetX: targetOffsetX,
    time: travel,
    total: travel,
    spin: 0,
  });
}

function projectileEdgePoint(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const options = [];
  if (dx < 0) options.push((12 - x1) / dx);
  if (dx > 0) options.push((FIELD.w - 12 - x1) / dx);
  if (dy < 0) options.push((12 - y1) / dy);
  if (dy > 0) options.push((FIELD.h - 12 - y1) / dy);
  const scale = options.filter(v => v > 1).sort((a,b) => a-b)[0] || 1.35;
  return {
    x: clamp(x1 + dx * scale, 12, FIELD.w - 12),
    y: clamp(y1 + dy * scale, 12, FIELD.h - 12)
  };
}

function projectileHit(p) {
  const t = p.tower;
  const center = { x: p.tx, y: p.ty };
  if (p.type === "grenade") {
    areaAtPoint(t, center, "grenade", scaledSplash(t, t.splash || 54), scaledDamage(t), .65);
    if (t.burnArea) addZone(center.x, center.y, scaledSplash(t, t.splash || 54), towerBurnAreaTime(t), towerBurnAreaDps(t), t, { burn:towerBurnDps(t) });
  } else if (p.type === "needle") {
    areaAtPoint(t, center, "needle", scaledSplash(t, t.splash || 36), scaledDamage(t), .75, { poison:t.poison ? towerPoisonDps(t) : 0 });
  } else if (p.type === "blade") {
    const target = nearestEnemy(center, 36);
    if (target) blade(t, target);
    else effect("blade", t, center, { radius: scaledSplash(t, 36) });
  } else if (p.type === "cryo") {
    const lineTargets = enemiesNearLine(p.sx, p.sy, p.fullTx || p.tx, p.fullTy || p.ty, 20).sort((a,b) => b.y - a.y).slice(0, (t.pierce || 2) + (t.extraPierce || 0));
    if (lineTargets.length) pierce(t, lineTargets.map(m => ({ m })), "cryo", { x:p.sx, y:p.sy }, false);
    effect("spark", { x:center.x, y:center.y, color:t.color }, center, { life: .18 });
  }
}

function areaAtPoint(t, center, type, radius, mainDamage, splashMul, opts={}) {
  const targets = state.monsters.filter(m => dist(m, center) <= radius);
  targets.forEach((m, idx) => {
    damageEnemy(m, idx === 0 ? mainDamage : mainDamage * splashMul, t);
    if (opts.freeze) applyHardControl(m, "freezeTime", opts.freeze*t.durationMul);
    if (opts.slow) m.slowTime = Math.max(m.slowTime, opts.slow*t.slowMul);
    if (opts.poison) applyPoison(m, opts.poison, towerPoisonTime(t), t, t.poisonTick || .5);
  });
  effect(type, t, center, { radius });
}

function addZone(x,y,radius,time,damage,tower,extra={}) {
  const tick = Math.max(0.05, extra.tick || zoneTick(tower));
  state.zones.push({ x,y,radius,time,damage,tower,tick,tickTimer:0,hardControlHits:new Set(),...extra });
}
function applyHardControl(m, key, time) {
  if (m.boss) return;
  const duration = Math.min(time, m.elite ? 0.18 : 0.28);
  m[key] = Math.max(m[key], duration);
}
function damageEnemy(m, amount, t) {
  const dealt = resolveDamage(m, amount, t);
  if (t.burn) applyBurn(m, towerBurnDps(t), towerBurnTime(t), t);
  if (t.poison) applyPoison(m, towerPoisonDps(t), towerPoisonTime(t), t, t.poisonTick || .5);
  return dealt;
}
function resolveDamage(m, amount, t) {
  const vuln = m.vulnerable > 0 ? 1 + (m.vulnerableAmount || 0) : 1;
  const attrMul = attributeMultiplier(t, m);
  const classMul = targetClassMultiplier(t, m);
  const dealt = amount * vuln * attrMul * classMul;
  m.hp -= dealt;
  const attrState = attrMul > 1.001 ? 1 : attrMul < .999 ? -1 : 0;
  showDamageNumber(m, dealt, t, attrState);
  return dealt;
}
function towerAttr(t) { return TOWER_ATTR[t.id] || t.attrKey || "neutral"; }
function attributeMultiplier(t, m) {
  const value = Number(m.attrMultipliers?.[towerAttr(t)]);
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}
function targetClassMultiplier(t, m) {
  const key = m.boss ? "bossMul" : m.elite ? "eliteMul" : "minionMul";
  const fallback = TOWER_BASE_PARAMS[t.id]?.[key] ?? 1;
  return Math.max(0, towerParam(t, key, fallback));
}
function applyBurn(m,dps,time,tower=null) {
  if (dps >= (m.burn || 0)) {
    m.burn = dps;
    m.burnTower = tower;
  }
  m.burnTime = Math.max(m.burnTime,time);
}
function applyPoison(m, damage, time, tower=null, tick=.5) {
  if (damage >= (m.poison || 0)) {
    m.poison = damage;
    m.poisonTick = Math.max(.05, tick || .5);
    m.poisonTower = tower;
  }
  m.poisonTime = Math.max(m.poisonTime, time);
  if (!Number.isFinite(m.poisonTickTimer)) m.poisonTickTimer = m.poisonTick || .5;
}

function showDamageNumber(m, amount, t, attrState=0) {
  if (!amount) return;
  if (amount < 30) {
    m.pendingDamageText = (m.pendingDamageText || 0) + amount;
    if ((m.damageTextCd || 0) > 0 || m.pendingDamageText < 3) return;
    amount = m.pendingDamageText;
    m.pendingDamageText = 0;
  }
  m.damageTextCd = amount < 30 ? .28 : .08;
  const color = attrState > 0 ? "#ffe66a" : attrState < 0 ? "#aeb8ca" : (t.color || "#fff");
  effect("damageText", { x:m.x + rand(-8, 8), y:m.y - 8, color }, m, { life:.55, text:Math.max(1, Math.round(amount)).toString(), weak:attrState > 0, resisted:attrState < 0 });
}
function nearestEnemy(point, radius = Infinity) {
  let best = null;
  let bestD = radius;
  for (const m of state.monsters) {
    const d = dist(point, m);
    if (d <= bestD) { best = m; bestD = d; }
  }
  return best;
}
function enemiesNearLine(x1, y1, x2, y2, width) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx*dx + dy*dy || 1;
  return state.monsters.filter(m => {
    const t = clamp(((m.x-x1)*dx + (m.y-y1)*dy) / len2, 0, 1);
    const px = x1 + dx*t;
    const py = y1 + dy*t;
    return Math.hypot(m.x-px, m.y-py) <= width;
  });
}

function updateProjectiles(dt) {
  const alive = [];
  for (const p of state.projectiles) {
    const prev = { x: p.x, y: p.y };
    p.time -= dt;
    p.spin += dt * 12;
    const done = p.time <= 0;
    const progress = clamp(1 - p.time / p.total, 0, 1);
    p.x = p.sx + (p.tx - p.sx) * progress;
    p.y = p.sy + (p.ty - p.sy) * progress;
    if (p.type === "grenade") p.arc = Math.sin(progress * Math.PI) * 72;
    const hit = projectileCollision(p, prev, { x:p.x, y:p.y });
    if (hit) {
      p.hitX = hit.x;
      p.hitY = hit.y;
      p.tx = hit.x;
      p.ty = hit.y;
      projectileHit(p);
    } else if (done) projectileHit(p);
    else alive.push(p);
  }
  state.projectiles = alive;
}

function projectileCollision(p, from, to) {
  if (p.type !== "needle" && p.type !== "blade" && p.type !== "cryo") return null;
  const width = p.type === "blade" ? 18 : p.type === "cryo" ? 11 : 10;
  const hit = enemiesNearLine(from.x, from.y, to.x, to.y, width)
    .sort((a,b) => dist(from, a) - dist(from, b))[0];
  return hit || null;
}
function updateEnemies(dt) {
  for (const m of state.monsters) {
    if (m.burnTime > 0) {
      resolveDamage(m, m.burn * dt, m.burnTower || { color:"#ff6b35", attrKey:"fire" });
      m.burnTime -= dt;
    }
    if (m.poisonTime > 0) {
      const tick = Math.max(.05, m.poisonTick || .5);
      m.poisonTickTimer = (m.poisonTickTimer ?? tick) - dt;
      while (m.poisonTickTimer <= 0 && m.poisonTime > 0) {
        resolveDamage(m, m.poison, m.poisonTower || { color:"#41d08a", attrKey:"poison" });
        m.poisonTickTimer += tick;
      }
      m.poisonTime -= dt;
    }
    if (m.vulnerable > 0) m.vulnerable -= dt;
    else m.vulnerableAmount = 0;
    if (m.freezeTime > 0) { m.freezeTime -= dt; }
    else if (m.stunTime > 0) { m.stunTime -= dt; }
    else {
      const inRange = (FIELD.baseY - m.y) <= m.range || m.y >= FIELD.baseY;
      if (inRange) {
        m.stopped = true;
        m.atkCd -= dt;
        if (m.atkCd <= 0) {
          state.hp -= m.atk;
          m.atkCd = m.interval;
          effect("hitBase", {x:m.x,y:m.y,color:"#ff5d4f"}, {x:FIELD.pathX,y:FIELD.baseY});
        }
      } else {
        const slow = m.slowTime > 0 ? .55 : 1;
        if (m.slowTime > 0) m.slowTime -= dt;
        m.y += m.speed * slow * dt;
        if (m.pathType === "sway") m.x = m.sx + Math.sin(m.y / 82) * m.curve;
      }
    }
  }
  const alive = [];
  for (const m of state.monsters) {
    if (m.hp <= 0) kill(m);
    else alive.push(m);
  }
  state.monsters = alive;
  if (state.hp <= 0) {
    state.hp = 0;
    state.pot = 0;
    showResult("防線突破", "基地 HP 歸零，本局失敗，POT 歸零。");
  }
}

function kill(m) {
  if (m.boss) {
    const add = bossMultiplier();
    state.bossSeen += 1;
    state.exp += (m.exp || 120) * params.expMul;
    showBossReward(add);
    return;
  }
  state.exp += (m.exp || 0) * params.expMul;
  if (Math.random() < clamp((m.dropChance ?? 1) * params.dropChanceMul, 0, 1)) {
    const moneyMul = params.moneyMul * (m.elite ? params.eliteMoneyMul : 1);
    const amount = Math.max(1, Math.round(rand(m.money[0], m.money[1]) * moneyMul));
    state.pot += amount;
    showMoneyReward(m, amount);
  }
}

function showMoneyReward(m, amount) {
  const elite = !!m.elite;
  effect(elite ? "eliteCoin" : "coin", {x:m.x,y:m.y,color: elite ? "#fff1a6" : "#f0bc4f"}, m, {
    text: `+${amount}`,
    amount,
    radius: elite ? 25 : 14,
    life: elite ? 1.08 : .72
  });
  if (elite) pulsePotMoney();
}

function pulsePotMoney() {
  ui.potChip.classList.remove("money-pop");
  void ui.potChip.offsetWidth;
  ui.potChip.classList.add("money-pop");
}

function showBossReward(add) {
  const from = 1 + state.bossAdd;
  const to = 1 + state.bossAdd + add;
  state.bossRoll = { time:0, duration:1.35, add, from, to, value:from };
  effect("bossReward", {x:FIELD.w / 2,y:88,color:"#f0bc4f"}, {x:FIELD.w / 2,y:154}, { text:`x${to.toFixed(1)}`, life:1.55 });
  ui.potChip.classList.remove("boss-pop");
  void ui.potChip.offsetWidth;
  ui.potChip.classList.add("boss-pop");
}

function updateBossRoll(dt) {
  const roll = state.bossRoll;
  if (!roll) return;
  roll.time += dt;
  const t = clamp(roll.time / roll.duration, 0, 1);
  if (t < .78) {
    const min = Math.max(2, roll.to - 3.5);
    const max = Math.min(10, roll.to + 3.5);
    roll.value = Math.round((min + Math.random() * (max - min)) * 10) / 10;
  } else {
    const settle = (t - .78) / .22;
    roll.value = roll.value + (roll.to - roll.value) * Math.min(.38, settle);
  }
  if (t >= 1) {
    state.bossAdd += roll.add;
    state.bossRoll = null;
    ui.potChip.classList.remove("boss-pop");
    void ui.potChip.offsetWidth;
    ui.potChip.classList.add("boss-pop");
  }
}
function bossMultiplier() {
  const weights = [
    Math.max(0, params.bossLowWeight),
    Math.max(0, params.bossMidWeight),
    Math.max(0, params.bossHighWeight)
  ];
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  let r = Math.random() * total;
  let min = params.bossLowMin;
  let max = params.bossLowMax;
  if ((r -= weights[0]) > 0) {
    min = params.bossMidMin;
    max = params.bossMidMax;
    if ((r -= weights[1]) > 0) {
      min = params.bossHighMin;
      max = params.bossHighMax;
    }
  }
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const v = lo + Math.random() * (hi - lo);
  return Math.round(clamp(v, 0, 20) * 10) / 10;
}

function checkWaveClear() {
  if (state.bossRoll) return;
  if (!state.spawn && !state.monsters.length && state.waveActive) {
    state.waveActive = false;
    prepareNextBossPreview();
    if (state.wave >= 30) showResult("30 波完成", `本局可結算 ${payout()}，後續可再擴充更深波次。`);
    else if (canLevelUp()) showUpgradeChoices();
    else state.message = "場上無怪，可以 Collect 或繼續 BET。";
  } else if (canLevelUp() && !state.choicesOpen) {
    showUpgradeChoices();
  }
}
function expRequired(level) { return paramNumber(`exp_${level}`, EXP_TABLE[level - 1] || 999999); }
function canLevelUp() { return state.exp >= expRequired(state.level); }
function showUpgradeChoices() {
  decayUpgradeRepeatLocks();
  state.exp -= expRequired(state.level);
  state.level += 1;
  const choices = [];
  const newTowerIds = new Set();
  const addNewTowerChoices = (count) => {
    randomTowerChoices(count, newTowerIds).forEach(t => {
      newTowerIds.add(t.id);
      choices.push(towerChoice(t, () => { addTower(t); hideChoices(); }));
    });
  };
  if (state.towers.length < 3) addNewTowerChoices(1);
  const candidates = collectUpgradeCandidates();
  const pickedCandidates = selectUpgradeCandidates(candidates, choices, 3 - choices.length);
  if (state.towers.length < 3 && pickedCandidates.length < 3 - choices.length) {
    const openTowerSlots = 3 - state.towers.length - newTowerIds.size;
    const openChoiceSlots = 3 - choices.length - pickedCandidates.length;
    addNewTowerChoices(Math.min(openTowerSlots, openChoiceSlots));
  }
  state.lastUpgradeDebug = {
    towers: state.towers.map(t => ({ name:t.name, upgrades:t.upgrades.slice() })),
    candidates: candidates.map(c => ({ tower:c.tower.name, name:c.up.name, taken:c.takenCount, lock:c.lock || 0, weight:Math.round(c.weight) })),
    picked: pickedCandidates.map(c => ({ tower:c.tower.name, name:c.up.name, taken:c.takenCount }))
  };
  pickedCandidates.forEach(picked => {
    const repeatNote = picked.takenCount > 0 ? `｜已拿 ${picked.takenCount} 次，權重降低` : "";
    choices.push({
      title: picked.up.name,
      tag: picked.tower.name,
      rarity: picked.rarity,
      repeatTaken: picked.takenCount > 0,
      desc: `${picked.up.desc}｜${picked.up.effect}${repeatNote}`,
      onPick: () => { applyUpgrade(picked.tower, picked.up); hideChoices(); }
    });
  });
  if (choices.length < 3 && state.towers.length < 3) addNewTowerChoices(3 - choices.length);
  showChoices("升級選項", "三選一：已有砲台升級，或隨機新砲台。", choices);
}
function nextUpgrade(tower, offset = 0) {
  const idx = TOWERS.findIndex(t => t.id === tower.id);
  const taken = tower.upgrades.length + offset;
  const row = UPGRADE_ROWS[taken % UPGRADE_ROWS.length];
  const data = row[idx];
  if (!data) return null;
  const up = { name:data[0], desc:data[1], effect:data[2], rowIndex:taken };
  if (!upgradeAvailable(tower, up)) return null;
  return up;
}
function collectUpgradeCandidates() {
  const candidates = [];
  state.towers.forEach(tower => {
    const idx = TOWERS.findIndex(t => t.id === tower.id);
    const normalDepth = tower.upgrades.length + 3;
    UPGRADE_ROWS.forEach((row, rowIndex) => {
      const data = row[idx];
      if (!data) return;
      const up = { name:data[0], desc:data[1], effect:data[2], rowIndex };
      const hasRequirement = !!UPGRADE_REQUIREMENTS[up.name];
      if (rowIndex > normalDepth && !hasRequirement) return;
      if (!upgradeAvailable(tower, up)) return;
      const rarity = upgradeRarity(up);
      const repeat = upgradeRepeatability(tower, up);
      const takenCount = upgradeTakenCount(tower, up.name);
      const lock = upgradeRepeatLock(tower, up.name);
      candidates.push({ tower, up, rarity, repeat, takenCount, lock, weight: upgradeChoiceWeight(rarity, repeat, takenCount, rowIndex, lock) });
    });
  });
  return candidates.sort((a,b) => b.weight - a.weight || a.up.rowIndex - b.up.rowIndex);
}
function upgradeRarity(up) {
  const text = upgradeText(up);
  const hasRequirement = !!UPGRADE_REQUIREMENTS[up.name] || text.includes("需解鎖") || text.includes("解鎖");
  if (hasRequirement) return "synergy";
  if (up.rowIndex >= 5) return "deepen";
  if (up.rowIndex >= 4) return "tower";
  return "common";
}
function rarityPriority(rarity) {
  return { synergy:3, deepen:2, tower:1, common:0, newTower:0 }[rarity] || 0;
}
function upgradeChoiceWeight(rarity, repeat, takenCount, rowIndex, recentLock = 0) {
  const base = { synergy:140, deepen:112, tower:106, common:92, newTower:90 }[rarity] || 90;
  const depthBonus = Math.max(0, 5 - Math.abs(rowIndex - Math.min(state.level, 6))) * 3;
  let weight = base + depthBonus;
  if (repeat.repeatable && takenCount > 0) weight *= Math.pow(0.22, takenCount);
  if (recentLock > 0) weight *= Math.pow(0.35, recentLock);
  const floor = takenCount > 0 ? 3 : 12;
  return Math.max(floor, weight);
}
function weightedUpgradeCandidateIndex(candidates, choices) {
  const hasRepeatChoice = choices.some(choice => choice.repeatTaken);
  const hasFreshCandidate = candidates.some(c => c.takenCount <= 0 && !choices.some(choice => choice.title === c.up.name && choice.tag === c.tower.name));
  const representedTowers = new Set(choices.map(choice => choice.tag));
  const pool = candidates
    .map((candidate, index) => ({ candidate, index }))
    .filter(item => !choices.some(choice => choice.title === item.candidate.up.name && choice.tag === item.candidate.tower.name))
    .filter(item => !(hasFreshCandidate && item.candidate.takenCount > 0));
  const diversePool = pool.filter(item => !representedTowers.has(item.candidate.tower.name));
  const usable = diversePool.length ? diversePool : pool.length ? pool : candidates.map((candidate, index) => ({ candidate, index }));
  const total = usable.reduce((sum, item) => sum + Math.max(1, item.candidate.weight || 1), 0);
  let roll = Math.random() * total;
  for (const item of usable) {
    roll -= Math.max(1, item.candidate.weight || 1);
    if (roll <= 0) return item.index;
  }
  return usable[usable.length - 1]?.index || 0;
}
function selectUpgradeCandidates(candidates, existingChoices, slots) {
  const selected = [];
  const usedKeys = new Set(existingChoices.map(choice => `${choice.tag}:${choice.title}`));
  const representedTowers = new Set(existingChoices.map(choice => choice.tag));
  pickUpgradeCandidatesFromPool(candidates, selected, usedKeys, representedTowers, slots);
  return selected;
}
function pickUpgradeCandidatesFromPool(pool, selected, usedKeys, representedTowers, slots) {
  while (selected.length < slots) {
    const usable = pool.filter(candidate => {
      const key = `${candidate.tower.name}:${candidate.up.name}`;
      if (usedKeys.has(key)) return false;
      return true;
    });
    if (!usable.length) return;
    const weightedUsable = usable.map(candidate => ({
      ...candidate,
      weight: candidate.weight * (representedTowers.has(candidate.tower.name) ? 0.82 : 1)
    }));
    const picked = weightedPickCandidate(weightedUsable);
    const key = `${picked.tower.name}:${picked.up.name}`;
    usedKeys.add(key);
    representedTowers.add(picked.tower.name);
    selected.push(picked);
  }
}
function weightedPickCandidate(pool) {
  const total = pool.reduce((sum, candidate) => sum + Math.max(1, candidate.weight || 1), 0);
  let roll = Math.random() * total;
  for (const candidate of pool) {
    roll -= Math.max(1, candidate.weight || 1);
    if (roll <= 0) return candidate;
  }
  return pool[pool.length - 1];
}
function upgradeText(up) {
  return `${up.name || ""} ${up.desc || ""} ${up.effect || ""}`;
}
const REPEATABLE_UPGRADE_KEYS = new Set([
  "damagePct", "ratePct", "rangePct", "durationPct",
  "burnDurationPct", "poisonDurationPct", "slowDurationPct", "zoneDurationPct", "iceTrailDurationPct", "stunDurationPct", "rootDurationPct",
  "dotDamagePct", "pathDamagePct", "focusDamageBonusPct", "focusDelayReducePct", "vulnerableBonusPct", "iceTrailSlowBonusPct", "ricochetDamageBonusPct",
  "extraShots", "extraAreas", "extraProjectiles", "extraPierce", "extraChainCasts", "extraChains", "ricochetExtra"
]);
const ONE_TIME_UPGRADE_KEYS = new Set([
  "burnDps", "burnTime", "burnAreaDps", "burnAreaTime",
  "poisonTick", "poisonDps", "poisonTime",
  "slowPct", "slowTime", "freezeTime", "iceTrailSlowPct", "iceTrailTime",
  "stunTime", "rootTime", "pullStrengthPct",
  "focusDelay", "focusDamagePct", "refractDamagePct",
  "ricochetChancePct", "ricochetDamagePct",
  "pathDamage", "vulnerablePct"
]);
function upgradeTakenCount(tower, name) {
  return tower.upgrades.filter(item => item === name).length;
}
function upgradeChoiceKey(tower, name) {
  return `${tower.id}:${name}`;
}
function upgradeRepeatLock(tower, name) {
  return state.upgradeRepeatLocks?.[upgradeChoiceKey(tower, name)] || 0;
}
function decayUpgradeRepeatLocks() {
  if (!state.upgradeRepeatLocks) state.upgradeRepeatLocks = {};
  Object.keys(state.upgradeRepeatLocks).forEach(key => {
    state.upgradeRepeatLocks[key] -= 1;
    if (state.upgradeRepeatLocks[key] <= 0) delete state.upgradeRepeatLocks[key];
  });
}
function markUpgradeRepeatLock(tower, up) {
  if (!state.upgradeRepeatLocks) state.upgradeRepeatLocks = {};
  state.upgradeRepeatLocks[upgradeChoiceKey(tower, up.name)] = 3;
}
function upgradeRepeatability(tower, up) {
  const specs = upgradeEffectSpecs(tower.id, up.rowIndex || 0);
  if (specs.some(spec => ONE_TIME_UPGRADE_KEYS.has(spec.key))) return { repeatable:false, limit:1, label:"一次性" };
  if (specs.length && specs.every(spec => REPEATABLE_UPGRADE_KEYS.has(spec.key))) return { repeatable:true, limit:99, label:"可重複" };
  return { repeatable: up.rowIndex <= 3, limit: up.rowIndex <= 3 ? 99 : 1, label: up.rowIndex <= 3 ? "可重複" : "一次性" };
}
function isRepeatableUpgrade(tower, up) {
  return upgradeRepeatability(tower, up).repeatable;
}
function upgradeAvailable(tower, up) {
  const repeat = upgradeRepeatability(tower, up);
  if (upgradeTakenCount(tower, up.name) >= repeat.limit) return false;
  const required = UPGRADE_REQUIREMENTS[up.name];
  if (required && !hasOwnedUpgrade(required)) return false;
  const text = upgradeText(up);
  if (text.includes("路徑傷害+") && !hasOwnedUpgrade("傳導增幅")) return false;
  return true;
}
function hasOwnedUpgrade(name) {
  return state.towers.some(tower => tower.upgrades.includes(name));
}
function applyUpgrade(t, up) {
  t.upgrades.push(up.name);
  markUpgradeRepeatLock(t, up);
  t.level += 1;
  const s = upgradeText(up);
  if (s.includes("傷害+40")) t.damageMul = (t.damageMul || 1) * 1.4;
  else if (s.includes("傷害+35") || s.includes("每段傷害+35")) t.damageMul = (t.damageMul || 1) * 1.35;
  else if (s.includes("傷害+30") || s.includes("每段傷害+30")) t.damageMul = (t.damageMul || 1) * 1.3;
  if (s.includes("攻速+25") || s.includes("Tick速度+25")) t.rate *= 1.25;
  if (s.includes("攻速+20") || s.includes("布置速度+20")) t.rate *= 1.2;
  if (s.includes("範圍+25") || s.includes("攻擊範圍+25") || s.includes("爆炸範圍+25")) { t.rangeMul = (t.rangeMul || 1) * 1.25; t.splashMul = (t.splashMul || 1) * 1.25; }
  if (s.includes("持續時間+50")) t.durationMul *= 1.5;
  if (s.includes("額外子彈")) t.extraProjectiles = (t.extraProjectiles || 0) + 1;
  if (s.includes("額外火焰") || s.includes("額外炸彈") || s.includes("額外毒霧") || s.includes("額外毒氣彈") || s.includes("額外毒針") || s.includes("額外斬擊") || s.includes("額外陷阱")) t.extraShots += 1;
  if (s.includes("爆點+1")) t.extraAreas = (t.extraAreas || 0) + 1;
  if (s.includes("穿透敵人+1")) t.extraPierce = (t.extraPierce || 0) + 1;
  if (s.includes("額外閃電鏈+1")) t.extraChainCasts = (t.extraChainCasts || 0) + 1;
  if (s.includes("彈跳目標+") || s.includes("彈掉目標+3")) t.extraChains = (t.extraChains || 0) + 3;
  if (s.includes("對聯鎖路徑上敵人造成50傷害")) t.pathDamage = 50;
  if (s.includes("路徑上造成的傷害+100")) t.pathDamageMul = (t.pathDamageMul || 1) * 2;
  if (s.includes("解鎖燃燒") || s.includes("命中後每秒造成燃燒傷害")) t.burn = true;
  if (s.includes("命中後造成中毒")) t.poison = true;
  if (s.includes("緩速")) t.slow = Math.max(t.slow || 0, .25);
  if (s.includes("凍結")) t.freeze = true;
  if (s.includes("冰痕")) t.iceTrail = true;
  if (s.includes("冰痕緩速效果+15")) t.iceSlow = (t.iceSlow || .15) + .15;
  if (s.includes("麻痺")) t.stun = true;
  if (s.includes("定身")) t.root = true;
  if (s.includes("聚焦")) t.focus = true;
  if (s.includes("加成效果提升50")) t.focusMul *= 1.5;
  if (s.includes("持續照射需要時間-50")) t.focusDelayMul = (t.focusDelayMul || 1) * .5;
  if (s.includes("折射")) t.refract = true;
  if (s.includes("受到傷害+15")) t.vulnerable = (t.vulnerable || 0) + .15;
  if (s.includes("增傷效果+50")) t.vulnerable = (t.vulnerable || .15) * 1.5;
  if (s.includes("燃燒區域")) t.burnArea = true;
  if (s.includes("毒霧")) t.poisonArea = true;
  if (s.includes("迴旋飛刃")) t.ricochet = true;
  if (s.includes("飛刃傷害+100")) t.ricochetMul = (t.ricochetMul || 1) * 2;
  if (s.includes("額外迴旋刃+1")) t.ricochetExtra = (t.ricochetExtra || 0) + 1;
  if (s.includes("牽引")) t.pull = true;
  if (s.includes("牽引強度+")) t.pullMul = (t.pullMul || 1) * 1.5;
  if (s.includes("燃燒傷害+100") || s.includes("中毒傷害+100")) t.dotMul *= 2;
  if (s.includes("燃燒持續時間+50")) t.burnDurationMul *= 1.5;
  if (s.includes("毒霧持續時間+50")) t.zoneDurationMul *= 1.5;
  if (s.includes("中毒持續時間+50")) t.poisonDurationMul *= 1.5;
  if (s.includes("冰痕持續時間+50")) t.iceTrailDurationMul *= 1.5;
  if (s.includes("緩速時間+50")) t.slowDurationMul *= 1.5;
  if (s.includes("凍結持續時間+50") || s.includes("麻痺時間+50") || s.includes("定身時間+50")) t.stunMul *= 1.5;
}

const applyUpgradeBase = applyUpgrade;
applyUpgrade = function(t, up) {
  const before = snapshotUpgradeStats(t);
  applyUpgradeBase(t, up);
  tuneAppliedUpgrade(t, before);
  tuneUpgradeEffectValues(t, up, before);
};

function snapshotUpgradeStats(t) {
  return {
    damageMul: t.damageMul || 1,
    rate: t.rate,
    rangeMul: t.rangeMul || 1,
    splashMul: t.splashMul || 1,
    durationMul: t.durationMul || 1,
    burnDurationMul: t.burnDurationMul || 1,
    poisonDurationMul: t.poisonDurationMul || 1,
    slowDurationMul: t.slowDurationMul || 1,
    zoneDurationMul: t.zoneDurationMul || 1,
    iceTrailDurationMul: t.iceTrailDurationMul || 1,
    stunMul: t.stunMul || 1,
    dotMul: t.dotMul || 1,
    focusMul: t.focusMul || 1,
    focusDelayMul: t.focusDelayMul || 1,
    pathDamageMul: t.pathDamageMul || 1,
    ricochetMul: t.ricochetMul || 1,
    pullMul: t.pullMul || 1,
    iceSlow: t.iceSlow || 0,
    extraProjectiles: t.extraProjectiles || 0,
    extraShots: t.extraShots || 0,
    extraAreas: t.extraAreas || 0,
    extraPierce: t.extraPierce || 0,
    extraChainCasts: t.extraChainCasts || 0,
    extraChains: t.extraChains || 0,
    ricochetExtra: t.ricochetExtra || 0,
    pathDamage: t.pathDamage || 0,
    vulnerable: t.vulnerable || 0,
    slow: t.slow || 0,
  };
}

function tuneAppliedUpgrade(t, before) {
  tuneRatio(t, "damageMul", before.damageMul, 1.4, params.upgradeDamage40);
  tuneRatio(t, "damageMul", before.damageMul, 1.35, params.upgradeDamage35);
  tuneRatio(t, "damageMul", before.damageMul, 1.3, params.upgradeDamage30);
  tuneRatio(t, "rate", before.rate, 1.25, params.upgradeRate25);
  tuneRatio(t, "rate", before.rate, 1.2, params.upgradeRate20);
  tuneRatio(t, "rangeMul", before.rangeMul, 1.25, params.upgradeRange25);
  tuneRatio(t, "splashMul", before.splashMul, 1.25, params.upgradeRange25);
  ["durationMul","burnDurationMul","poisonDurationMul","slowDurationMul","zoneDurationMul","iceTrailDurationMul","stunMul"].forEach(key => {
    tuneRatio(t, key, before[key], 1.5, params.upgradeDuration50);
  });
  tuneRatio(t, "dotMul", before.dotMul, 2, params.upgradeDotDamage100);
  if ((t.extraChains || 0) - before.extraChains === 3) t.extraChains = before.extraChains + params.upgradeExtraChain;
  if ((t.pathDamage || 0) === 50 && before.pathDamage !== 50) t.pathDamage = params.upgradePathDamage;
  if (Math.abs((t.vulnerable || 0) - before.vulnerable - .15) < 0.001) t.vulnerable = before.vulnerable + params.upgradeVulnerable15;
  if ((t.slow || 0) === .25 && before.slow !== .25) t.slow = params.upgradeSlow25;
}

function tuneSingleUpgradeOption(t, up, before) {
  const scale = upgradeOptionScale(t.id, up.rowIndex || 0);
  if (Math.abs(scale - 1) < 0.001) return;
  const discrete = new Set(["extraProjectiles","extraShots","extraAreas","extraPierce","extraChainCasts","extraChains","ricochetExtra"]);
  [
    "damageMul","rate","rangeMul","splashMul","durationMul","burnDurationMul","poisonDurationMul","slowDurationMul",
    "zoneDurationMul","iceTrailDurationMul","stunMul","dotMul","focusMul","focusDelayMul","pathDamageMul","ricochetMul",
    "pullMul","iceSlow","extraProjectiles","extraShots","extraAreas","extraPierce","extraChainCasts","extraChains",
    "ricochetExtra","pathDamage","vulnerable","slow"
  ].forEach(key => tuneDelta(t, key, before[key], scale, discrete.has(key)));

  const text = upgradeText(up);
  if ((text.includes("燃燒") || text.includes("中毒")) && Math.abs((t.dotMul || 1) - before.dotMul) < 0.0001) {
    t.dotMul = Math.max(0, (t.dotMul || 1) * scale);
  }
  if ((text.includes("麻痺") || text.includes("凍結") || text.includes("定身")) && Math.abs((t.stunMul || 1) - before.stunMul) < 0.0001) {
    t.stunMul = Math.max(0, (t.stunMul || 1) * scale);
  }
  if (text.includes("牽引") && Math.abs((t.pullMul || 1) - before.pullMul) < 0.0001) {
    t.pullMul = Math.max(0, (t.pullMul || 1) * scale);
  }
}

function upgradeOptionScale(towerId, rowIndex) {
  const value = Number(params[upgradeOptionParamKey(towerId, rowIndex)]);
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

function tuneDelta(target, key, beforeValue, scale, discrete=false) {
  const afterValue = target[key];
  if (!Number.isFinite(afterValue) || !Number.isFinite(beforeValue)) return;
  const delta = afterValue - beforeValue;
  if (Math.abs(delta) < 0.0001) return;
  const tuned = beforeValue + delta * scale;
  target[key] = discrete ? Math.max(0, Math.round(tuned)) : tuned;
}

function tuneUpgradeEffectValues(t, up, before) {
  const rowIndex = up.rowIndex || 0;
  const specs = upgradeEffectSpecs(t.id, rowIndex);
  if (!specs.length) return;
  const has = key => specs.some(spec => spec.key === key);
  const val = key => {
    const spec = specs.find(item => item.key === key);
    return upgradeEffectValue(t.id, rowIndex, key, spec ? spec.value : 0);
  };
  const pctRatio = key => 1 + Math.max(0, val(key)) / 100;

  if (has("damagePct")) t.damageMul = before.damageMul * pctRatio("damagePct");
  if (has("ratePct")) t.rate = before.rate * pctRatio("ratePct");
  if (has("rangePct")) {
    t.rangeMul = before.rangeMul * pctRatio("rangePct");
    t.splashMul = before.splashMul * pctRatio("rangePct");
  }
  if (has("durationPct")) t.durationMul = before.durationMul * pctRatio("durationPct");
  if (has("burnDurationPct")) t.burnDurationMul = before.burnDurationMul * pctRatio("burnDurationPct");
  if (has("poisonDurationPct")) t.poisonDurationMul = before.poisonDurationMul * pctRatio("poisonDurationPct");
  if (has("slowDurationPct")) t.slowDurationMul = before.slowDurationMul * pctRatio("slowDurationPct");
  if (has("zoneDurationPct")) t.zoneDurationMul = before.zoneDurationMul * pctRatio("zoneDurationPct");
  if (has("iceTrailDurationPct")) t.iceTrailDurationMul = before.iceTrailDurationMul * pctRatio("iceTrailDurationPct");
  if (has("stunDurationPct") || has("rootDurationPct")) t.stunMul = before.stunMul * (has("stunDurationPct") ? pctRatio("stunDurationPct") : pctRatio("rootDurationPct"));
  if (has("dotDamagePct")) t.dotMul = before.dotMul * pctRatio("dotDamagePct");
  if (has("pathDamagePct")) t.pathDamageMul = before.pathDamageMul * pctRatio("pathDamagePct");
  if (has("focusDamageBonusPct")) t.focusMul = before.focusMul * pctRatio("focusDamageBonusPct");
  if (has("focusDelayReducePct")) t.focusDelayMul = before.focusDelayMul * Math.max(0, 1 - val("focusDelayReducePct") / 100);
  if (has("vulnerableBonusPct")) t.vulnerable = before.vulnerable * pctRatio("vulnerableBonusPct");
  if (has("iceTrailSlowBonusPct")) t.iceSlow = before.iceSlow + val("iceTrailSlowBonusPct") / 100;
  if (has("ricochetDamageBonusPct")) t.ricochetMul = before.ricochetMul * pctRatio("ricochetDamageBonusPct");

  if (has("extraShots")) t.extraShots = before.extraShots + Math.max(0, Math.round(val("extraShots")));
  if (has("extraAreas")) t.extraAreas = before.extraAreas + Math.max(0, Math.round(val("extraAreas")));
  if (has("extraProjectiles")) t.extraProjectiles = before.extraProjectiles + Math.max(0, Math.round(val("extraProjectiles")));
  if (has("extraPierce")) t.extraPierce = before.extraPierce + Math.max(0, Math.round(val("extraPierce")));
  if (has("extraChainCasts")) t.extraChainCasts = before.extraChainCasts + Math.max(0, Math.round(val("extraChainCasts")));
  if (has("extraChains")) t.extraChains = before.extraChains + Math.max(0, Math.round(val("extraChains")));
  if (has("ricochetExtra")) t.ricochetExtra = before.ricochetExtra + Math.max(0, Math.round(val("ricochetExtra")));

  if (has("pathDamage")) t.pathDamage = val("pathDamage");
  if (has("vulnerablePct")) t.vulnerable = before.vulnerable + val("vulnerablePct") / 100;
  if (has("slowPct")) t.slow = val("slowPct") / 100;
  if (has("burnDps")) t.burnDps = val("burnDps");
  if (has("burnTime")) t.burnTime = val("burnTime");
  if (has("burnAreaDps")) t.burnAreaDps = val("burnAreaDps");
  if (has("burnAreaTime")) t.burnAreaTime = val("burnAreaTime");
  if (has("poisonTick")) t.poisonTick = val("poisonTick");
  if (has("poisonDps")) t.poisonDps = val("poisonDps");
  if (has("poisonTime")) t.poisonTime = val("poisonTime");
  if (has("slowTime")) t.slowTime = val("slowTime");
  if (has("freezeTime")) t.freezeTimeValue = val("freezeTime");
  if (has("iceTrailTime")) t.iceTrailTime = val("iceTrailTime");
  if (has("iceTrailSlowPct")) t.iceSlow = val("iceTrailSlowPct") / 100;
  if (has("stunTime")) t.stunTimeValue = val("stunTime");
  if (has("rootTime")) t.rootTimeValue = val("rootTime");
  if (has("pullStrengthPct")) t.pullStrengthPct = val("pullStrengthPct");
  if (has("focusDelay")) t.focusDelay = val("focusDelay");
  if (has("focusDamagePct")) t.focusDamagePct = val("focusDamagePct");
  if (has("refractDamagePct")) t.refractDamagePct = val("refractDamagePct");
  if (has("ricochetChancePct")) t.ricochetChancePct = val("ricochetChancePct");
  if (has("ricochetDamagePct")) t.ricochetDamagePct = val("ricochetDamagePct");
}

function tuneRatio(target, key, beforeValue, defaultRatio, tunedRatio) {
  const afterValue = target[key];
  if (!Number.isFinite(afterValue) || !Number.isFinite(beforeValue) || beforeValue === 0) return;
  if (Math.abs(afterValue / beforeValue - defaultRatio) < 0.001) target[key] = beforeValue * tunedRatio;
}

function collect() {
  if (!canCollect()) return;
  const win = payout();
  state.wallet += win;
  showResult("Collect", `帶走 ${win}。錢包餘額 ${state.wallet}。`);
}
function canCollect() { return state.started && !state.over && !state.waveActive && !state.monsters.length && !state.spawn && !state.choicesOpen && state.pot > 0; }

function effect(type, from, to, opts={}) {
  const areaFlashLife = ["grenade","frost","needle","blade","impact"].includes(type) ? .24 : .35;
  const life = opts.life || areaFlashLife;
  if (state.effects.length >= MAX_EFFECTS) {
    state.effects.splice(0, state.effects.length - MAX_EFFECTS + 1);
  }
  state.effects.push({ type, x:from.x, y:from.y, tx:to.x, ty:to.y, color:from.color || "#fff", t:life, life, radius:opts.radius || 0, width:opts.width || 40, amount:opts.amount || 0, weak:!!opts.weak, chain: opts.chain ? opts.chain.map(m => ({x:m.x,y:m.y})) : [], text: opts.text });
}
function dist(a,b) { return Math.hypot(a.x-b.x, a.y-b.y); }

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawField();
  state.zones.forEach(drawZone);
  state.projectiles.forEach(drawProjectile);
  state.effects.forEach(drawEffect);
  state.monsters.forEach(drawEnemy);
}

let fieldLayer = null;

function drawField() {
  if (!fieldLayer) fieldLayer = buildFieldLayer();
  ctx.drawImage(fieldLayer, 0, 0);
  drawBaseHpBar();
}

function buildFieldLayer() {
  const layer = document.createElement("canvas");
  layer.width = canvas.width;
  layer.height = canvas.height;
  const g = layer.getContext("2d", { alpha: false });
  const sky = g.createLinearGradient(0, 0, 0, layer.height);
  sky.addColorStop(0, "#18222c");
  sky.addColorStop(.45, "#171b20");
  sky.addColorStop(1, "#14171d");
  g.fillStyle = sky;
  g.fillRect(0, 0, layer.width, layer.height);

  g.strokeStyle = "#5a5149";
  g.lineCap = "round";
  g.lineJoin = "round";
  g.lineWidth = 326;
  g.beginPath();
  g.moveTo(FIELD.pathX, -20);
  g.lineTo(FIELD.pathX, FIELD.baseY);
  g.stroke();
  g.strokeStyle = "#2d2b2a";
  g.lineWidth = 286;
  g.stroke();
  g.strokeStyle = "rgba(255,255,255,.10)";
  g.lineWidth = 2;
  [-116, -58, 0, 58, 116].forEach(offset => {
    g.beginPath();
    g.moveTo(FIELD.pathX + offset, -20);
    g.lineTo(FIELD.pathX + offset, FIELD.baseY - 28);
    g.stroke();
  });
  for (let y=26; y<FIELD.baseY-34; y+=46) {
    const x = FIELD.pathX;
    g.beginPath();
    g.moveTo(x - 12, y);
    g.lineTo(x + 12, y - 5);
    g.stroke();
  }

  g.fillStyle = "#171e28";
  g.fillRect(34, FIELD.baseY-12, 282, 46);
  g.fillStyle = "#252f3d";
  g.fillRect(46, FIELD.baseY-4, 258, 14);
  g.strokeStyle = "rgba(255,255,255,.38)";
  g.lineWidth = 2;
  g.strokeRect(34, FIELD.baseY-12, 282, 46);
  g.fillStyle = "#f6f8ff";
  g.font = "bold 13px Microsoft JhengHei";
  g.fillText("基地防線", 144, FIELD.baseY-20);
  return layer;
}
function drawBaseHpBar() {
  const maxHp = Math.max(1, Math.round(params.baseHp));
  const pct = clamp(state.hp / maxHp, 0, 1);
  const x = 42;
  const y = FIELD.baseY + 20;
  const w = 266;
  const cleanH = 16;
  const cleanHpLabel = `HP ${Math.ceil(state.hp)} / ${maxHp}`;
  ctx.save();
  ctx.fillStyle = "rgba(6, 9, 14, .92)";
  ctx.fillRect(x, y, w, cleanH);
  ctx.strokeStyle = "rgba(255,255,255,.62)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, cleanH);
  ctx.fillStyle = pct > .45 ? "#39d06d" : pct > .2 ? "#ffd45a" : "#ff554d";
  ctx.fillRect(x + 2, y + 2, Math.max(0, (w - 4) * pct), cleanH - 4);
  ctx.font = "bold 11px Microsoft JhengHei";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,.82)";
  ctx.fillStyle = "#ffffff";
  ctx.strokeText(cleanHpLabel, x + w / 2, y + cleanH / 2 + .5);
  ctx.fillText(cleanHpLabel, x + w / 2, y + cleanH / 2 + .5);
  ctx.restore();
}
function drawEnemy(m) {
  const size = m.boss ? 34 : m.elite ? 27 : m.size;
  ctx.fillStyle = m.color;
  ctx.beginPath();
  if (m.shape === "triangle") { ctx.moveTo(m.x,m.y-size/2); ctx.lineTo(m.x+size/2,m.y+size/2); ctx.lineTo(m.x-size/2,m.y+size/2); ctx.closePath(); ctx.fill(); }
  else if (m.shape === "diamond") { ctx.moveTo(m.x,m.y-size/2); ctx.lineTo(m.x+size/2,m.y); ctx.lineTo(m.x,m.y+size/2); ctx.lineTo(m.x-size/2,m.y); ctx.closePath(); ctx.fill(); }
  else ctx.fillRect(m.x-size/2,m.y-size/2,size,size);
  drawEnemyAttributeMarker(m, size);
  const bw = m.boss ? 58 : m.elite ? 46 : 32;
  if (m.boss) {
    const hpPct = Math.max(0, m.hp / m.maxHp);
    const barW = 78;
    const barH = 7;
    const barX = m.x - barW / 2;
    const barY = Math.max(20, m.y - size / 2 - 15);
    const hpLabel = `${Math.ceil(m.hp)} / ${Math.ceil(m.maxHp)}`;
    ctx.save();
    ctx.fillStyle = "rgba(8, 10, 16, .82)";
    ctx.fillRect(barX - 3, barY - 18, barW + 6, 29);
    ctx.strokeStyle = "rgba(255,255,255,.42)";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX - 3, barY - 18, barW + 6, 29);
    ctx.fillStyle = "#fff";
    ctx.font = "900 10px Arial";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,.72)";
    ctx.strokeText(`BOSS ${hpLabel}`, m.x, barY - 6);
    ctx.fillText(`BOSS ${hpLabel}`, m.x, barY - 6);
    ctx.fillStyle = "#281015";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = "#ff4d42";
    ctx.fillRect(barX, barY, barW * hpPct, barH);
    ctx.strokeStyle = "#ffd4cf";
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.restore();
    return;
  }
  ctx.fillStyle = "#dfe6ef"; ctx.fillRect(m.x-bw/2,m.y-size/2-9,bw,4);
  ctx.fillStyle = m.elite ? "#f0bc4f" : "#2fc45a";
  ctx.fillRect(m.x-bw/2,m.y-size/2-9,bw*Math.max(0,m.hp/m.maxHp),4);
}

function drawEnemyAttributeMarker(m, size) {
  const entries = Object.entries(m.attrMultipliers || {});
  const weak = entries.reduce((best, entry) => !best || entry[1] > best[1] ? entry : best, null);
  if (!weak || weak[1] <= 1.001) return;
  const display = ATTRIBUTE_DISPLAY[weak[0]] || ATTRIBUTE_DISPLAY.neutral;
  const radius = m.boss ? 9 : m.elite ? 8 : 7;
  const x = m.x - size / 2 - radius + 1;
  const y = m.y;
  ctx.save();
  ctx.fillStyle = "rgba(8, 12, 18, .88)";
  ctx.strokeStyle = display.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = display.color;
  ctx.font = `900 ${m.boss ? 10 : 8}px Microsoft JhengHei`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(display.label, x, y + .5);
  ctx.restore();
}

function drawProjectile(p) {
  const y = p.y - (p.arc || 0);
  ctx.save();
  ctx.fillStyle = p.tower.color;
  ctx.strokeStyle = p.tower.color;
  if (p.type === "grenade") {
    ctx.beginPath();
    ctx.arc(p.x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = .28;
    ctx.beginPath();
    ctx.moveTo(p.sx, p.sy);
    ctx.quadraticCurveTo((p.sx+p.tx)/2, Math.min(p.sy,p.ty)-72, p.tx, p.ty);
    ctx.stroke();
  } else if (p.type === "cryo") {
    const angle = Math.atan2(p.ty - p.sy, p.tx - p.sx);
    ctx.translate(p.x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = .22;
    ctx.beginPath();
    ctx.ellipse(-5, 0, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#d9f7ff";
    ctx.strokeStyle = p.tower.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(3, -1, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === "needle") {
    ctx.beginPath();
    ctx.moveTo(p.x, y - 8);
    ctx.lineTo(p.x + 5, y + 7);
    ctx.lineTo(p.x - 5, y + 7);
    ctx.closePath();
    ctx.fill();
  } else if (p.type === "blade") {
    ctx.translate(p.x, y);
    ctx.rotate(p.spin);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 11, .3, Math.PI * 1.55);
    ctx.stroke();
  }
  ctx.restore();
}
function drawZone(z) {
  ctx.globalAlpha = .18;
  ctx.fillStyle = z.tower.color;
  ctx.beginPath(); ctx.arc(z.x,z.y,z.radius,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function drawEffect(e) {
  const p = Math.max(0, e.t/e.life);
  ctx.save(); ctx.globalAlpha = Math.max(.15,p); ctx.strokeStyle=e.color; ctx.fillStyle=e.color;
  if (e.type==="bossReward") {
    const grow = 1 + (1 - p) * .35;
    const y = e.ty - (1 - p) * 34;
    const rollText = state.bossRoll ? `x${state.bossRoll.value.toFixed(1)}` : e.text;
    const labelText = state.bossRoll ? "MULTIPLIER ROLL" : "BOSS BONUS";
    ctx.globalAlpha = Math.min(1, p * 1.3);
    ctx.translate(e.tx, y);
    ctx.scale(grow, grow);
    ctx.fillStyle = `rgba(10, 12, 18, ${.72 * p})`;
    ctx.strokeStyle = `rgba(240, 188, 79, ${p})`;
    ctx.lineWidth = 3;
    roundRect(-88, -44, 176, 82, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff4c6";
    ctx.font = "900 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(labelText, 0, -18);
    ctx.fillStyle = "#f0bc4f";
    ctx.font = "900 40px Arial";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(0,0,0,.72)";
    ctx.strokeText(rollText, 0, 24);
    ctx.fillText(rollText, 0, 24);
    ctx.rotate((1 - p) * .5);
    ctx.strokeStyle = `rgba(255, 242, 201, ${.45 * p})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i += 1) {
      const a = i * Math.PI / 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 100, Math.sin(a) * 55);
      ctx.lineTo(Math.cos(a) * 125, Math.sin(a) * 72);
      ctx.stroke();
    }
  }
  else if (e.type==="coin" || e.type==="eliteCoin") {
    const elite = e.type === "eliteCoin";
    const rise = (1 - p) * (elite ? 46 : 30);
    const pop = 1 + Math.sin((1 - p) * Math.PI) * (elite ? .28 : .16);
    ctx.globalAlpha = Math.min(1, p * 1.35);
    ctx.translate(e.tx, e.ty - rise);
    ctx.scale(pop, pop);
    ctx.fillStyle = elite ? `rgba(255, 216, 92, ${.22 * p})` : `rgba(240, 188, 79, ${.15 * p})`;
    ctx.beginPath();
    ctx.arc(0, 0, elite ? 28 : 17, 0, Math.PI * 2);
    ctx.fill();
    if (elite) {
      ctx.strokeStyle = `rgba(255, 244, 198, ${.62 * p})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i += 1) {
        const a = i * Math.PI / 5 + (1 - p) * .4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
        ctx.lineTo(Math.cos(a) * 34, Math.sin(a) * 34);
        ctx.stroke();
      }
    }
    ctx.fillStyle = elite ? "#ffd85c" : "#f0bc4f";
    ctx.strokeStyle = elite ? "#fff6bd" : "#ffe090";
    ctx.lineWidth = elite ? 3 : 2;
    ctx.beginPath();
    ctx.arc(0, 0, elite ? 13 : 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(80, 48, 0, .72)";
    ctx.font = elite ? "900 15px Arial" : "900 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", 0, elite ? 1 : 0);
    ctx.textBaseline = "alphabetic";
    ctx.font = elite ? "900 23px Arial" : "900 15px Arial";
    ctx.lineWidth = elite ? 5 : 4;
    ctx.strokeStyle = "rgba(0,0,0,.76)";
    ctx.fillStyle = elite ? "#fff1a6" : "#ffd86f";
    const textY = elite ? -24 : -16;
    ctx.strokeText(e.text, 0, textY);
    ctx.fillText(e.text, 0, textY);
  }
  else if (e.type==="damageText") {
    const rise = (1 - p) * 26;
    ctx.globalAlpha = p;
    ctx.font = e.weak ? "900 15px Arial" : "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.lineWidth = e.weak ? 4 : 3;
    ctx.strokeStyle = "rgba(0,0,0,.72)";
    ctx.fillStyle = e.color || "#fff";
    ctx.strokeText(e.text, e.x, e.y - rise);
    ctx.fillText(e.text, e.x, e.y - rise);
  }
  else if (e.type==="cone") {
    const dx = e.tx - e.x;
    const dy = e.ty - e.y;
    const length = Math.hypot(dx, dy) || 1;
    const px = -dy / length * e.width;
    const py = dx / length * e.width;
    ctx.fillStyle=`rgba(255,92,45,${.24*p})`;
    ctx.beginPath();
    ctx.moveTo(e.x,e.y);
    ctx.lineTo(e.tx + px,e.ty + py);
    ctx.lineTo(e.tx - px,e.ty - py);
    ctx.closePath();
    ctx.fill();
  }
  else if (["grenade","frost","gas","trap","needle","blade","impact"].includes(e.type)) { ctx.beginPath(); ctx.arc(e.tx,e.ty,(e.radius || 18)*(1.1-p*.2),0,Math.PI*2); ctx.fillStyle=e.type==="gas"?`rgba(85,214,90,${.2*p})`:e.type==="frost"||e.type==="impact"?`rgba(159,231,255,${.2*p})`:`rgba(255,155,53,${.2*p})`; ctx.fill(); ctx.stroke(); }
  else if (e.type==="spark") {
    ctx.lineWidth = 2;
    [[-7,-4,-15,-9],[7,4,15,9],[-5,5,-12,13],[5,-5,12,-13]].forEach(s => {
      ctx.beginPath();
      ctx.moveTo(e.tx + s[0] * p, e.ty + s[1] * p);
      ctx.lineTo(e.tx + s[2] * p, e.ty + s[3] * p);
      ctx.stroke();
    });
  }
  else if (e.type==="chain") { let from={x:e.x,y:e.y}; [ {x:e.tx,y:e.ty}, ...e.chain ].forEach(to=>{ jag(from,to); from=to; }); }
  else { ctx.lineWidth=e.type==="laser"?6:3; ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.tx,e.ty); ctx.stroke(); }
  if (e.text && !["damageText","coin","eliteCoin","bossReward"].includes(e.type)) { ctx.fillStyle="#fff3bf"; ctx.font="bold 18px Arial"; ctx.fillText(e.text,e.tx-24,e.ty-20); }
  ctx.restore();
}
function jag(a,b) {
  ctx.beginPath(); ctx.moveTo(a.x,a.y);
  for (let i=1;i<5;i++) { const t=i/5; ctx.lineTo(a.x+(b.x-a.x)*t+rand(-7,7), a.y+(b.y-a.y)*t+rand(-7,7)); }
  ctx.lineTo(b.x,b.y); ctx.stroke();
}

function updateUi() {
  ui.wallet.textContent = Math.floor(state.wallet);
  ui.pot.textContent = Math.floor(state.pot);
  ui.wave.textContent = state.wave;
  ui.hp.textContent = Math.floor(state.hp);
  const nextExp = expRequired(state.level);
  const expPct = clamp(state.exp / nextExp, 0, 1);
  ui.level.textContent = state.level;
  ui.exp.textContent = `${Math.floor(state.exp)}/${nextExp}`;
  ui.expFill.style.width = `${Math.round(expPct * 100)}%`;
  ui.betText.textContent = BET_STEPS[state.baseBetIndex];
  ui.waveBet.textContent = currentBet();
  ui.speed.classList.toggle("fast", speedMultiplier() > 1);
  SPEED_STEPS.forEach(step => ui.speed.classList.toggle(`speed-${step}`, speedMultiplier() === step));
  const bossWarning = !!state.nextBoss && state.started && !state.waveActive && !state.choicesOpen && !state.over;
  ui.waveChip.classList.toggle("boss-next", bossWarning);
  const rollingMult = state.bossRoll ? state.bossRoll.value : null;
  ui.bossMult.textContent = rollingMult
    ? `x${rollingMult.toFixed(1)}`
    : state.bossSeen
      ? `x${(1 + state.bossAdd).toFixed(1)}`
      : "";
  ui.bossMult.classList.toggle("empty", !state.bossSeen && !state.bossRoll);
  ui.bossMult.classList.toggle("rolling", !!state.bossRoll);
  ui.collectText.textContent = payout();
  ui.message.textContent = canCollect()
    ? (bossWarning ? "危險：下一波 BOSS，可以 Collect 或繼續 BET 挑戰。" : "場上無怪，可以 Collect 或繼續 BET。")
    : state.choicesOpen
      ? "請選擇一個項目。"
      : state.waveActive
        ? (state.message || "戰鬥中。")
        : state.started
          ? (bossWarning ? "危險：下一波 BOSS。" : "場上無怪，可以繼續 BET。")
          : "調整 BET 後按下 BET 開始。";
  ui.bet.disabled = state.over || state.choicesOpen || state.waveActive || state.monsters.length || state.wallet < currentBet();
  ui.collect.disabled = !canCollect();
  ui.betMinus.disabled = state.started || state.baseBetIndex <= 0;
  ui.betPlus.disabled = state.started || state.baseBetIndex >= BET_STEPS.length-1;
  renderSlots();
  updateDebugSnapshot();
}

function renderSlots() {
  if (!slotViews.length) {
    for (let i=0; i<3; i++) {
      const root = document.createElement("div");
      const name = document.createElement("div");
      const info = document.createElement("small");
      const cooldown = document.createElement("div");
      const fill = document.createElement("div");
      name.className = "slot-name";
      cooldown.className = "slot-cd";
      fill.className = "slot-cd-fill";
      cooldown.appendChild(fill);
      root.append(name, info, cooldown);
      ui.slots.appendChild(root);
      slotViews.push({ root, name, info, cooldown, fill });
    }
  }

  for (let i=0;i<3;i++) {
    const t = state.towers[i];
    const view = slotViews[i];
    view.root.className = "slot" + (t ? "" : " empty");
    if (t) {
      const ready = Math.round(cooldownProgress(t) * 100);
      view.name.textContent = t.name;
      view.info.textContent = `${t.attr} Lv.${t.level}`;
      view.info.hidden = false;
      view.cooldown.hidden = false;
      view.fill.style.width = `${ready}%`;
    } else {
      view.name.textContent = `砲塔槽 ${i+1}`;
      view.info.hidden = true;
      view.cooldown.hidden = true;
    }
  }
}

function updateDebugSnapshot(now = performance.now()) {
  if (now - lastDebugFrame < DEBUG_FRAME_MS) return;
  lastDebugFrame = now;
  const snapshot = JSON.stringify({ build:BUILD_VERSION, wave:state.wave, hp:state.hp, pot:state.pot, monsters:state.monsters.length, spawn:!!state.spawn, towers:state.towers.length, collect:canCollect(), upgrade:state.lastUpgradeDebug || null });
  if (snapshot === lastDebugSnapshot) return;
  lastDebugSnapshot = snapshot;
  document.body.dataset.debug = snapshot;
}

function cooldownProgress(t) {
  if (t.channel) return 1;
  const maxCd = t.mode === "flame" || t.mode === "laser" ? channelCooldown(t) : attackCooldown(t);
  return clamp(1 - Math.max(0, t.cd || 0) / Math.max(.1, maxCd), 0, 1);
}

function loop(now) {
  const dt = Math.min(.08, (now-last)/1000);
  last = now;
  for (let i = 0; i < speedMultiplier(); i += 1) update(dt);
  if (now - lastUiFrame >= UI_FRAME_MS) {
    updateUi();
    lastUiFrame = now;
  }
  draw();
  requestAnimationFrame(loop);
}

function speedMultiplier() {
  return SPEED_STEPS[speedIndex] || 1;
}

function toggleSpeed() {
  speedIndex = (speedIndex + 1) % SPEED_STEPS.length;
  updateUi();
}

ui.betMinus.onclick = () => { if (!state.started) state.baseBetIndex = Math.max(0,state.baseBetIndex-1); updateUi(); };
ui.betPlus.onclick = () => { if (!state.started) state.baseBetIndex = Math.min(BET_STEPS.length-1,state.baseBetIndex+1); updateUi(); };
ui.bet.onclick = startBet;
ui.collect.onclick = collect;
ui.reset.onclick = reset;
ui.speed.onclick = toggleSpeed;
ui.newRun.onclick = reset;

document.body.dataset.build = BUILD_VERSION;
let viewportSyncFrame = 0;
function syncViewportHeight() {
  viewportSyncFrame = 0;
  const height = Math.round(window.visualViewport?.height || window.innerHeight);
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}
function queueViewportSync() {
  if (viewportSyncFrame) return;
  viewportSyncFrame = requestAnimationFrame(syncViewportHeight);
}
syncViewportHeight();
window.addEventListener("resize", queueViewportSync, { passive:true });
window.addEventListener("orientationchange", queueViewportSync, { passive:true });
window.visualViewport?.addEventListener("resize", queueViewportSync, { passive:true });
document.addEventListener("visibilitychange", () => { last = performance.now(); });
document.addEventListener("dblclick", event => event.preventDefault(), { passive:false });
document.addEventListener("gesturestart", event => event.preventDefault(), { passive:false });
document.addEventListener("touchstart", event => {
  if (event.touches.length > 1) event.preventDefault();
}, { passive:false });
document.addEventListener("touchmove", event => {
  if (event.touches.length > 1) event.preventDefault();
}, { passive:false });

reset();
requestAnimationFrame(loop);
