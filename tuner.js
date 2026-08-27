const PARAM_STORAGE_KEY = "towerDefenseTuningParams.v3";
const PARAM_CHANNEL = "tower-defense-param-sync";

const MONSTER_TYPES = [
  ["neutral_scout", "無｜偵察蛛機", { hp:315, speed:34.2, range:0, atk:4.1, interval:1.5, exp:10, moneyMin:1, moneyMax:3 }],
  ["neutral_gunner", "無｜浮游砲機", { hp:273, speed:31.5, range:110, atk:4.1, interval:1.7, exp:12, moneyMin:1, moneyMax:3 }],
  ["neutral_guard", "無｜重盾履帶", { hp:682.5, speed:26.1, range:0, atk:7.38, interval:1.8, exp:18, moneyMin:4, moneyMax:8 }],
  ["fire_charger", "火｜燼火輪獸", { hp:241.5, speed:40.5, range:0, atk:9.02, interval:1.15, exp:10, moneyMin:1, moneyMax:3 }],
  ["fire_ray", "火｜熔火飛魟", { hp:262.5, speed:35.1, range:115, atk:8.2, interval:1.25, exp:12, moneyMin:1, moneyMax:3 }],
  ["fire_tortoise", "火｜岩漿甲龜", { hp:525, speed:27.9, range:0, atk:12.3, interval:1.55, exp:18, moneyMin:4, moneyMax:8 }],
  ["ice_crab", "冰｜冰盾蟹", { hp:451.5, speed:27.9, range:0, atk:4.1, interval:1.6, exp:10, moneyMin:1, moneyMax:3 }],
  ["ice_jelly", "冰｜冰晶水母", { hp:378, speed:27, range:125, atk:4.1, interval:1.8, exp:12, moneyMin:1, moneyMax:3 }],
  ["ice_rhino", "冰｜冰河巨犀", { hp:861, speed:23.4, range:0, atk:7.38, interval:1.9, exp:20, moneyMin:4, moneyMax:8 }],
  ["electric_runner", "電｜電弧疾蜥", { hp:178.5, speed:51.3, range:0, atk:5.74, interval:.95, exp:8, moneyMin:1, moneyMax:2 }],
  ["electric_pulse", "電｜脈衝飛梭", { hp:199.5, speed:46.8, range:105, atk:4.92, interval:.9, exp:10, moneyMin:1, moneyMax:3 }],
  ["electric_beetle", "電｜電容甲蟲", { hp:346.5, speed:40.5, range:0, atk:7.38, interval:1, exp:14, moneyMin:2, moneyMax:5 }],
  ["poison_slug", "毒｜孢囊菌蛞", { hp:336, speed:27.9, range:75, atk:4.92, interval:1.05, exp:10, moneyMin:1, moneyMax:3 }],
  ["poison_squid", "毒｜毒針浮魷", { hp:294, speed:31.5, range:135, atk:5.74, interval:1, exp:12, moneyMin:1, moneyMax:3 }],
  ["poison_snail", "毒｜腐蝕罐蝸", { hp:640.5, speed:24.3, range:90, atk:7.38, interval:1.15, exp:18, moneyMin:4, moneyMax:8 }],
];
const ELITE_TYPES = [
  ["neutral_elite_shield", "無｜戰術盾衛", { hp:1942.5, speed:27, range:0, atk:44.1, interval:1.8, exp:50, moneyMin:15, moneyMax:25 }],
  ["neutral_elite_siege", "無｜六足攻城砲", { hp:1627.5, speed:23, range:150, atk:39.9, interval:1.9, exp:55, moneyMin:14, moneyMax:24 }],
  ["fire_elite_blade", "火｜炎刃統領", { hp:1522.5, speed:36, range:0, atk:59.85, interval:1.25, exp:48, moneyMin:14, moneyMax:24 }],
  ["fire_elite_furnace", "火｜熔爐巨兵", { hp:2310, speed:22, range:0, atk:71.4, interval:1.75, exp:58, moneyMin:16, moneyMax:27 }],
  ["ice_elite_executioner", "冰｜凍原處刑者", { hp:2782.5, speed:20, range:0, atk:50.4, interval:1.8, exp:58, moneyMin:16, moneyMax:27 }],
  ["ice_elite_wall", "冰｜行進冰壁", { hp:3517.5, speed:16, range:0, atk:44.1, interval:2, exp:62, moneyMin:18, moneyMax:30 }],
  ["electric_elite_panther", "電｜雷襲獵豹", { hp:1260, speed:48, range:0, atk:45.15, interval:.9, exp:46, moneyMin:13, moneyMax:23 }],
  ["electric_elite_overload", "電｜過載球體", { hp:1785, speed:35, range:115, atk:39.9, interval:1, exp:52, moneyMin:14, moneyMax:25 }],
  ["poison_elite_witch", "毒｜瘴氣巫株", { hp:1732.5, speed:25, range:155, atk:37.8, interval:1.05, exp:52, moneyMin:14, moneyMax:25 }],
  ["poison_elite_centipede", "毒｜毒甲蜈蚣", { hp:2362.5, speed:28, range:85, atk:44.1, interval:1, exp:58, moneyMin:16, moneyMax:27 }],
];
const BOSS_TYPES = [
  ["neutral_boss_fortress", "無｜鋼鐵堡壘", { hp:22325, speed:19, range:0, atk:130, interval:2.1, exp:120 }],
  ["fire_boss_tyrant", "火｜煉獄暴君", { hp:19270, speed:24, range:0, atk:170, interval:1.65, exp:120 }],
  ["ice_boss_frostbeast", "冰｜永凍巨獸", { hp:32900, speed:15, range:0, atk:120, interval:2.25, exp:120 }],
  ["electric_boss_stormcore", "電｜風暴核心", { hp:16920, speed:30, range:80, atk:145, interval:1.35, exp:120 }],
  ["poison_boss_plaguemother", "毒｜疫病母體", { hp:24910, speed:17, range:165, atk:92, interval:1.15, exp:120 }],
];
const MONSTER_FIELDS = [
  ["hp", "血量", 1, 100000, .1], ["speed", "速度", 1, 100, .1], ["range", "攻擊距離", 0, 500, 1],
  ["atk", "攻擊力", 0, 500, .01], ["interval", "攻擊頻率", .1, 10, .05], ["exp", "EXP", 0, 500, 1],
  ["moneyMin", "金錢下限", 0, 500, 1], ["moneyMax", "金錢上限", 0, 1000, 1],
];
const MONSTER_ATTRIBUTE_FIELDS = [
  ["fireMul", "火傷倍率", 0, 3, .05],
  ["iceMul", "冰傷倍率", 0, 3, .05],
  ["electricMul", "電傷倍率", 0, 3, .05],
  ["poisonMul", "毒傷倍率", 0, 3, .05],
  ["neutralMul", "無屬性倍率", 0, 3, .05],
];
const MONSTER_ALL_FIELDS = [...MONSTER_FIELDS, ...MONSTER_ATTRIBUTE_FIELDS];
const MONSTER_ATTRIBUTE_BASE = {};
const ATTRIBUTE_COUNTER_FIELD = { fire:"iceMul", ice:"fireMul", electric:"poisonMul", poison:"electricMul" };
[...MONSTER_TYPES, ...ELITE_TYPES, ...BOSS_TYPES].forEach(([id]) => {
  const attr = id.split("_")[0];
  const profile = { fireMul:1, iceMul:1, electricMul:1, poisonMul:1, neutralMul:1 };
  if (attr !== "neutral") {
    profile[`${attr}Mul`] = .35;
    profile[ATTRIBUTE_COUNTER_FIELD[attr]] = 2.00;
  }
  MONSTER_ATTRIBUTE_BASE[id] = profile;
});

const TEMPLATE_IDS = [["standard","標準"],["fast","快速"],["tank","厚血"],["ranged","遠程"],["disrupt","干擾"],["mixed","混壓"]];
const MONSTER_WEIGHT_IDS = [["normal","普通怪"],["fast","快速怪"],["tank","厚血怪"],["ranged","遠程怪"],["special","特殊怪"]];
const TEMPLATE_BASE = {
  standard:{normal:450,fast:200,tank:150,ranged:100,special:100},
  fast:{normal:250,fast:450,tank:100,ranged:100,special:100},
  tank:{normal:250,fast:150,tank:400,ranged:100,special:100},
  ranged:{normal:200,fast:150,tank:150,ranged:300,special:200},
  disrupt:{normal:200,fast:200,tank:100,ranged:150,special:350},
  mixed:{normal:180,fast:240,tank:200,ranged:180,special:200},
};
const BAND_BASE = [
  ["1-2", { countMin:16, countMax:24, drop:{normal:.63,fast:.36,tank:.9,ranged:.45,special:.45}, templates:{standard:700,fast:300} }],
  ["3-5", { countMin:20, countMax:30, drop:{normal:.585,fast:.315,tank:.9,ranged:.405,special:.405}, templates:{standard:400,tank:250,ranged:200,disrupt:150} }],
  ["6-10", { countMin:28, countMax:40, drop:{normal:.44,fast:.24,tank:.8,ranged:.32,special:.32}, templates:{standard:250,fast:200,tank:200,ranged:150,disrupt:200} }],
  ["11-20", { countMin:34, countMax:50, drop:{normal:.50,fast:.24,tank:1,ranged:.34,special:.34}, templates:{standard:200,fast:150,tank:200,ranged:150,disrupt:150,mixed:150} }],
  ["21-30", { countMin:42, countMax:62, drop:{normal:.46,fast:.19,tank:1,ranged:.30,special:.30}, templates:{standard:100,fast:150,tank:200,ranged:150,disrupt:150,mixed:250} }],
];

const WAVE_BASE = [
  [1,.45,0,0,0,0,2,2.7,0],[2,.68,0,0,0,0,2,2.7,0],[3,1.08,2,1,0,0,2,2.7,0],[4,1.26,4,1,0,0,2,2.7,0],[5,1.45,6,1,0,0,2,2.7,0],
  [6,1.62,8,.9,.1,0,2,2.7,0],[7,1.84,10,.85,.15,0,2,2.7,0],[8,2.08,11,.8,.2,0,2,2.7,0],[9,2.33,12,.75,.25,0,2,2.7,0],[10,2.60,13,.7,.3,0,2,2.7,0],
  [11,2.82,14,.65,.3,.05,2,2.7,0],[12,3.04,15,.65,.3,.05,2,2.7,0],[13,3.26,16,.6,.35,.05,2,2.7,0],[14,3.48,17,.6,.35,.05,2,2.7,0],[15,3.70,18,.55,.4,.05,2,2.7,0],
  [16,3.91,19,.5,.4,.1,2,2.7,0],[17,4.12,20,.5,.4,.1,2,2.7,0],[18,4.33,21,.45,.45,.1,2,2.7,0],[19,4.54,22,.45,.45,.1,2,2.7,0],[20,4.75,24,.45,.45,.1,2,2.7,0],
  [21,4.92,25,.4,.45,.15,2,2.7,0],[22,5.09,26,.4,.44,.16,2,2.7,0],[23,5.26,27,.4,.43,.17,2,2.7,0],[24,5.43,28,.4,.42,.18,2,2.7,0],[25,5.60,29,.4,.41,.19,2,2.7,0],
  [26,5.77,30,.3,.45,.25,2,2.7,0],[27,5.94,31,.3,.44,.26,2,2.7,0],[28,6.11,32,.3,.43,.27,2,2.7,0],[29,6.28,33,.3,.42,.28,2,2.7,0],[30,6.45,35,.3,.41,.29,2,2.7,0],
];
const WAVE_CLEAR_BASE = [
  .985,.975,.955,.955,.955,.925,.925,.925,.925,.925,
  .890,.890,.890,.890,.890,.860,.860,.860,.860,.860,
  .840,.840,.840,.840,.840,.820,.820,.820,.820,.820,
];
const WAVE_PAYOUT_BASE = [
  .70,.56,1.04,.94,1.46,1.52,.83,.98,1.13,1.52,
  1.47,.96,1.10,1.15,1.25,1.25,.95,1.00,1.00,1.00,
  .85,.70,.70,.68,.66,.64,.62,.58,.55,.52,
];
const WAVE_FIELDS = [["hpMul","血量倍率"],["eliteWeight","菁英權重"],["e1","菁英1隻"],["e2","菁英2隻"],["e3","菁英3隻"],["bossBase","BOSS基礎權重"],["bossInc","BOSS累積增量"],["bossCd","BOSS CD"]];

const EXP_BASE = [95,125,155,190,225,290,330,370,415,460,510,565,625,690,760,835,915,1000,1090,1185,1285,1390,1500,1615,1735,1860,1990,2125,2265,2410,2560,2715,2875,3040,3210,3385,3565,3750,3940];
const HERO_TUNING = [
  ["fire","烈焰戰士","火","爆燃火球",{ damage:126, rate:.72, range:780, status:26, statusTime:2.0, splash:58, secondaryMul:.58, targets:1, projectileSpeed:680, zoneDuration:0 }],
  ["ice","寒霜獵手","冰","貫穿冰槍",{ damage:170, rate:.58, range:980, status:.24, statusTime:1.35, splash:0, secondaryMul:.72, targets:3, projectileSpeed:1250, zoneDuration:0 }],
  ["electric","雷霆特工","電","連鎖電弧",{ damage:76, rate:1.35, range:900, status:.12, statusTime:1.0, splash:0, secondaryMul:.62, targets:3, projectileSpeed:0, zoneDuration:0 }],
  ["poison","劇毒術士","毒","腐蝕毒囊",{ damage:58, rate:.68, range:820, status:22, statusTime:2.6, splash:54, secondaryMul:.50, targets:1, projectileSpeed:520, zoneDuration:2.0 }],
  ["neutral","戰術傭兵","無","三連實彈",{ damage:46, rate:.92, range:940, status:0, statusTime:0, splash:0, secondaryMul:1, targets:3, projectileSpeed:1450, zoneDuration:0 }],
];
[
  ["fire", { damage:140 }],
  ["ice", { damage:160, secondaryMul:.68 }],
  ["electric", { damage:88 }],
  ["poison", { damage:84, rate:.76, status:25, splash:58 }],
  ["neutral", { damage:60 }],
].forEach(([id, values]) => Object.assign(HERO_TUNING.find(hero => hero[0] === id)[4], values));
const HERO_FIELDS = [
  ["damage","傷害",0,1000,1],["rate","攻速",.05,10,.01],["range","射程",100,1200,10],
  ["status","狀態強度",0,200,.01],["statusTime","狀態時間",0,10,.05],["splash","範圍",0,200,1],
  ["secondaryMul","次要傷害",0,2,.01],["targets","目標數",1,10,1],["projectileSpeed","彈速",0,2000,10],["zoneDuration","地面時間",0,10,.1],
];
const HERO_FIELD_USE = {
  fire:new Set(["damage","rate","range","status","statusTime","splash","secondaryMul","projectileSpeed"]),
  ice:new Set(["damage","rate","range","status","statusTime","secondaryMul","targets","projectileSpeed"]),
  electric:new Set(["damage","rate","range","status","statusTime","secondaryMul","targets"]),
  poison:new Set(["damage","rate","range","status","statusTime","splash","secondaryMul","projectileSpeed","zoneDuration"]),
  neutral:new Set(["damage","rate","range","targets","projectileSpeed"]),
};
const HERO_GLOBAL_ROWS = [["角色共用參數","player-group",[
  ["heroDamageMul","角色全域傷害","倍",0,8,.05,"所有角色攻擊的總倍率。"],
  ["heroSameAttrBonusPct","同屬性塔加成","%",0,100,1,"角色對同屬性砲塔的基礎傷害加成。"],
  ["heroResonanceBonusPct","共鳴升級加成","%",0,100,1,"選到屬性共鳴時追加的同屬性塔加成。"],
  ["heroAllTowerBonusPct","全塔BUFF加成","%",0,100,1,"保留給角色全塔型BUFF使用。"],
  ["heroDamageUpgradePct","角色升等傷害","%",0,200,1,"角色普通升等時，三維同步成長中的傷害提升。"],
  ["heroRateUpgradePct","角色升等攻速","%",0,200,1,"角色普通升等時，三維同步成長中的攻速提升。"],
  ["heroFirstUpgradeQuantity","首次升等彈體","發",0,5,1,"第一次選擇普通角色升等時，立即增加的同時彈體數。"],
  ["heroQuantityUpgrade","角色彈體成長","發",1,5,1,"角色達到彈體成長週期時增加的同時彈體數。"],
  ["heroQuantityEveryLevels","彈體成長週期","次",1,10,1,"每選取幾次普通角色升等，增加一次彈體數；Lv.5/10/15 技能解鎖不計入。"],
]]];
const TOWER_TUNING = [
  ["flame", "噴火槍", { damage:104, rate:4.00, range:460, splash:0, duration:1.5, cooldown:2.4, tick:.5, minionMul:1.78, eliteMul:.95, bossMul:.78, factor:1.2 }],
  ["grenade", "榴彈", { damage:250, rate:.55, range:700, splash:50, duration:0, cooldown:0, tick:.5, minionMul:1.76, eliteMul:.92, bossMul:.64, factor:1.25 }],
  ["cryo", "急凍狙擊", { damage:371, rate:.45, range:900, splash:0, duration:0, cooldown:0, tick:.5, minionMul:.25, eliteMul:1.50, bossMul:2.02, factor:1.1 }],
  ["frostbomb", "冰晶炸彈", { damage:236, rate:.45, range:720, splash:52, duration:0, cooldown:0, tick:.5, minionMul:1.62, eliteMul:.92, bossMul:.58, factor:1.15 }],
  ["laser", "雷射光線", { damage:114, rate:3.40, range:860, splash:0, duration:3.0, cooldown:3.0, tick:.5, minionMul:.28, eliteMul:1.55, bossMul:2.12, factor:1.12 }],
  ["chain", "閃電鎖鏈", { damage:139, rate:.80, range:760, splash:0, duration:0, cooldown:0, tick:.5, minionMul:1.76, eliteMul:.92, bossMul:.54, factor:1.35 }],
  ["gas", "毒氣彈", { damage:104, rate:.42, range:740, splash:43, duration:2.6, cooldown:0, tick:.5, minionMul:1.68, eliteMul:.96, bossMul:.62, factor:1.55 }],
  ["needle", "毒針彈", { damage:256, rate:.75, range:700, splash:30, duration:0, cooldown:0, tick:.5, minionMul:.42, eliteMul:1.42, bossMul:1.92, factor:1.18 }],
  ["blade", "旋刃", { damage:295, rate:.84, range:680, splash:26, duration:0, cooldown:0, tick:.5, minionMul:1.02, eliteMul:1.10, bossMul:.88, factor:1.08 }],
  ["trap", "陷阱", { damage:140, rate:.48, range:700, splash:50, duration:1.4, cooldown:0, tick:.5, minionMul:1.22, eliteMul:.88, bossMul:.44, factor:1.35 }],
];
[
  ["flame", { bossMul:.82 }],
  ["grenade", { bossMul:.68 }],
  ["cryo", { bossMul:1.88 }],
  ["frostbomb", { bossMul:.62 }],
  ["laser", { bossMul:1.92 }],
  ["chain", { bossMul:.58 }],
  ["gas", { bossMul:.66 }],
  ["needle", { bossMul:1.72 }],
  ["blade", { bossMul:.88 }],
  ["trap", { bossMul:.46 }],
].forEach(([id, values]) => Object.assign(TOWER_TUNING.find(tower => tower[0] === id)[2], values));
[
  ["flame", { minionMul:1.78, eliteMul:.95, bossMul:.78 }],
  ["grenade", { minionMul:1.76, eliteMul:.92, bossMul:.64 }],
  ["cryo", { minionMul:.25, eliteMul:1.50, bossMul:2.02 }],
  ["frostbomb", { minionMul:1.62, eliteMul:.92, bossMul:.58 }],
  ["laser", { minionMul:.28, eliteMul:1.55, bossMul:2.12 }],
  ["chain", { minionMul:1.76, eliteMul:.92, bossMul:.54 }],
  ["gas", { minionMul:1.68, eliteMul:.96, bossMul:.62 }],
  ["needle", { minionMul:.42, eliteMul:1.42, bossMul:1.92 }],
  ["blade", { minionMul:1.02, eliteMul:1.10, bossMul:.88 }],
  ["trap", { minionMul:1.22, eliteMul:.88, bossMul:.44 }],
].forEach(([id, values]) => Object.assign(TOWER_TUNING.find(tower => tower[0] === id)[2], values));
const TOWER_ATTRIBUTE = {
  flame:"fire", grenade:"fire", cryo:"ice", frostbomb:"ice", laser:"electric",
  chain:"electric", gas:"poison", needle:"poison", blade:"neutral", trap:"neutral",
};
const TOWER_ROLE = {
  flame:"area", grenade:"area", cryo:"single", frostbomb:"control", laser:"single",
  chain:"area", gas:"area", needle:"single", blade:"general", trap:"control",
};
const TOWER_ROLE_LABEL = { area:"群體", single:"單體", control:"控場", general:"泛用" };
const TOWER_ROLE_CLASS_WEIGHTS = {
  area:{ minion:.72, elite:.18, boss:.10 },
  single:{ minion:.20, elite:.30, boss:.50 },
  control:{ minion:.55, elite:.30, boss:.15 },
  general:{ minion:.45, elite:.30, boss:.25 },
};
const TOWER_FIELDS = [["damage","傷害"],["rate","攻速"],["cooldown","冷卻"],["duration","持續時間"],["tick","區域Tick"],["range","射程"],["splash","範圍半徑"],["minionMul","對小怪"],["eliteMul","對菁英"],["bossMul","對BOSS"]];
const TOWER_FIELD_USE = {
  flame: new Set(["damage","rate","cooldown","duration","range","minionMul","eliteMul","bossMul"]),
  grenade: new Set(["damage","rate","cooldown","range","splash","minionMul","eliteMul","bossMul"]),
  cryo: new Set(["damage","rate","cooldown","range","minionMul","eliteMul","bossMul"]),
  frostbomb: new Set(["damage","rate","cooldown","range","splash","minionMul","eliteMul","bossMul"]),
  laser: new Set(["damage","rate","cooldown","duration","range","minionMul","eliteMul","bossMul"]),
  chain: new Set(["damage","rate","cooldown","range","minionMul","eliteMul","bossMul"]),
  gas: new Set(["damage","rate","cooldown","duration","tick","range","splash","minionMul","eliteMul","bossMul"]),
  needle: new Set(["damage","rate","cooldown","range","splash","minionMul","eliteMul","bossMul"]),
  blade: new Set(["damage","rate","cooldown","range","splash","minionMul","eliteMul","bossMul"]),
  trap: new Set(["damage","rate","cooldown","duration","tick","range","splash","minionMul","eliteMul","bossMul"]),
};
const TOWER_SCORE_MODEL = {
  flame: { kind:"channel", target:2.2, specialty:1.10, calibration:.82 },
  grenade: { kind:"burstArea", splash:.78, specialty:1.08, calibration:.95 },
  cryo: { kind:"pierce", pierce:2, specialty:1.04, calibration:1.15 },
  frostbomb: { kind:"burstArea", splash:.72, control:.42, cc:"範圍凍結", specialty:1.06, calibration:.95 },
  laser: { kind:"channel", target:1.15, boss:.12, specialty:1.06, calibration:1.30 },
  chain: { kind:"chain", chains:4, specialty:1.10, calibration:.68 },
  gas: { kind:"zone", splash:.82, specialty:1.12, calibration:.80 },
  needle: { kind:"burstArea", splash:.62, specialty:1.05, calibration:1.10 },
  blade: { kind:"burstArea", splash:.52, specialty:1.04, calibration:1.35 },
  trap: { kind:"zone", splash:.88, control:0, cc:"無（需升級解鎖）", specialty:1.13, calibration:1.35 },
};
const TOWER_UPGRADE_ROLES = {
  flame: { label:"近距離持續群傷", output:1.25, control:.55, mechanic:.95 },
  grenade: { label:"拋物線範圍爆發", output:1.20, control:.55, mechanic:1.05 },
  cryo: { label:"高威脅單體點殺", output:1.18, control:.70, mechanic:1.05 },
  frostbomb: { label:"範圍凍結控場", output:.82, control:1.45, mechanic:1.05 },
  laser: { label:"鎖定持續單體輸出", output:1.28, control:.55, mechanic:1.00 },
  chain: { label:"連鎖群體打擊", output:1.05, control:.88, mechanic:1.22 },
  gas: { label:"範圍持續傷害/易傷", output:1.08, control:1.02, mechanic:1.08 },
  needle: { label:"毒傷爆裂輸出", output:1.18, control:.70, mechanic:1.02 },
  blade: { label:"泛用斬擊輸出", output:1.20, control:.55, mechanic:1.05 },
  trap: { label:"定點輔助控場", output:.78, control:1.50, mechanic:1.18 },
};
const UPGRADE_VALUE_LABELS = {
  damagePct:["傷害", "%", 0, 300, 1],
  ratePct:["攻速", "%", 0, 300, 1],
  rangePct:["範圍", "%", 0, 300, 1],
  durationPct:["持續", "%", 0, 500, 1],
  burnDurationPct:["燃燒時間", "%", 0, 500, 1],
  poisonDurationPct:["中毒時間", "%", 0, 500, 1],
  slowDurationPct:["緩速時間", "%", 0, 500, 1],
  zoneDurationPct:["區域時間", "%", 0, 500, 1],
  iceTrailDurationPct:["冰痕時間", "%", 0, 500, 1],
  stunDurationPct:["麻痺時間", "%", 0, 500, 1],
  rootDurationPct:["定身時間", "%", 0, 500, 1],
  dotDamagePct:["持續傷害", "%", 0, 500, 1],
  pathDamagePct:["路徑傷害", "%", 0, 500, 1],
  focusDamageBonusPct:["聚焦強化", "%", 0, 500, 1],
  focusDelayReducePct:["聚焦縮短", "%", 0, 100, 1],
  vulnerableBonusPct:["易傷強化", "%", 0, 500, 1],
  iceTrailSlowBonusPct:["冰痕緩速+", "%", 0, 100, 1],
  ricochetDamageBonusPct:["迴旋傷害+", "%", 0, 500, 1],
  extraShots:["額外彈體", "個", 0, 10, 1],
  extraAreas:["爆點", "個", 0, 10, 1],
  extraProjectiles:["額外子彈", "發", 0, 10, 1],
  extraPierce:["穿透", "隻", 0, 10, 1],
  extraChainCasts:["額外閃電鏈", "條", 0, 10, 1],
  extraChains:["彈跳目標", "隻", 0, 20, 1],
  extraLaserTargets:["額外雷射目標", "目標", 0, 6, 1],
  ricochetExtra:["額外迴旋刃", "道", 0, 10, 1],
  pathDamage:["路徑傷害", "傷害", 0, 1000, 1],
  vulnerablePct:["易傷", "%", 0, 200, 1],
  slowPct:["緩速", "%", 0, 100, 1],
  burnDps:["燃燒DPS", "傷害", 0, 1000, 1],
  burnTime:["燃燒秒數", "秒", 0, 20, .1],
  burnAreaDps:["燃燒區DPS", "傷害", 0, 1000, 1],
  burnAreaTime:["燃燒區秒數", "秒", 0, 20, .1],
  poisonTick:["中毒Tick", "秒", .05, 5, .05],
  poisonDps:["中毒DPS", "傷害", 0, 1000, 1],
  poisonTime:["中毒秒數", "秒", 0, 20, .1],
  slowTime:["緩速秒數", "秒", 0, 20, .1],
  freezeTime:["凍結秒數", "秒", 0, 20, .1],
  iceTrailTime:["冰痕秒數", "秒", 0, 20, .1],
  iceTrailSlowPct:["冰痕緩速", "%", 0, 100, 1],
  stunTime:["麻痺秒數", "秒", 0, 20, .1],
  rootTime:["定身秒數", "秒", 0, 20, .1],
  pullStrengthPct:["牽引強度", "%", 0, 300, 1],
  focusDelay:["聚焦秒數", "秒", 0, 20, .1],
  focusDamagePct:["聚焦傷害", "%", 0, 300, 1],
  refractDamagePct:["折射傷害", "%", 0, 300, 1],
  ricochetChancePct:["迴旋機率", "%", 0, 100, 1],
  ricochetDamagePct:["迴旋傷害", "%", 0, 300, 1],
  conditionalExplosionPct:["條件爆炸傷害", "%", 0, 500, 1],
  conditionalExplosionRadius:["條件爆炸範圍", "半徑", 0, 300, 1],
  conditionalStunTime:["條件麻痺", "秒", 0, 10, .1],
  poisonTargetDamagePct:["中毒目標增傷", "%", 0, 500, 1],
  zoneStunTime:["區域麻痺", "秒", 0, 10, .1],
  zoneTime:["聯動區域時間", "秒", 0, 20, .1],
  zonePoisonDps:["區域毒傷", "傷害", 0, 1000, 1],
  zonePoisonTime:["區域中毒時間", "秒", 0, 20, .1],
  trailSlowPct:["軌跡緩速", "%", 0, 100, 1],
  trailTime:["軌跡時間", "秒", 0, 20, .1],
  shardCount:["碎片數", "枚", 0, 20, 1],
  shardDamagePct:["碎片傷害", "%", 0, 500, 1],
  freezeDurationPct:["凍結時間", "%", 0, 500, 1],
  postFreezeSlowPct:["凍結後緩速", "%", 0, 100, 1],
  postFreezeSlowTime:["凍結後緩速時間", "秒", 0, 20, .1],
  refractFocusPct:["折射聚焦效果", "%", 0, 300, 1],
  focusedBurstDamagePct:["聚焦爆點傷害", "%", 0, 500, 1],
  focusedBurstRadius:["聚焦爆點範圍", "半徑", 0, 300, 1],
  electricVulnerablePct:["電屬性增傷", "%", 0, 500, 1],
  electricVulnerableTime:["導電標記時間", "秒", 0, 20, .1],
  focusConduit:["聚焦導流目標", "隻", 0, 10, 1],
  poisonBurstDamagePct:["中毒爆炸傷害", "%", 0, 500, 1],
  poisonBurstRadius:["中毒爆炸範圍", "半徑", 0, 300, 1],
  poisonChainDamagePct:["中毒額外電流", "%", 0, 500, 1],
  burningTargetDamagePct:["燃燒目標增傷", "%", 0, 500, 1],
  zoneSlowPct:["區域緩速", "%", 0, 100, 1],
  frozenTargetDamagePct:["凍結目標增傷", "%", 0, 500, 1],
};
const LEGACY_UPGRADE_VALUE_DEFS = {
  flame: [[["damagePct",35]],[["durationPct",50]],[["rangePct",25]],[["extraShots",1]],[["burnDps",18],["burnTime",2]],[["dotDamagePct",100]],[["burnDurationPct",50]],[["conditionalExplosionPct",50],["conditionalExplosionRadius",46]],[["conditionalStunTime",.2]],[["poisonTargetDamagePct",20]]],
  grenade: [[["damagePct",35]],[["rangePct",25]],[["extraAreas",1]],[["ratePct",20]],[["burnAreaDps",30],["burnAreaTime",2]],[["dotDamagePct",100]],[["burnDurationPct",50]],[["pullStrengthPct",35]],[["zoneStunTime",.3],["zoneTime",2]],[["zonePoisonDps",25],["zonePoisonTime",2]]],
  cryo: [[["damagePct",35]],[["ratePct",25]],[["extraProjectiles",1]],[["extraPierce",1]],[["slowPct",25],["slowTime",2]],[["slowDurationPct",50]],[["freezeTime",1]],[["trailSlowPct",25],["trailTime",1]],[["poisonTargetDamagePct",20]],[["shardCount",2],["shardDamagePct",40]]],
  frostbomb: [[["damagePct",30]],[["rangePct",25]],[["ratePct",20]],[["extraShots",1]],[["iceTrailSlowPct",15],["iceTrailTime",2]],[["iceTrailDurationPct",50]],[["iceTrailSlowBonusPct",15]],[["freezeDurationPct",50]],[["shardCount",3],["shardDamagePct",30]],[["postFreezeSlowPct",20],["postFreezeSlowTime",1]]],
  laser: [[["damagePct",30]],[["ratePct",25]],[["durationPct",50]],[["refractDamagePct",55]],[["focusDelay",1],["focusDamagePct",20]],[["focusDamageBonusPct",50]],[["focusDelayReducePct",50]],[["refractFocusPct",100]],[["focusedBurstDamagePct",50],["focusedBurstRadius",42]],[["electricVulnerablePct",20],["electricVulnerableTime",2]]],
  chain: [[["damagePct",35]],[["extraChainCasts",1]],[["extraChains",3]],[["pathDamage",50]],[["stunTime",.3]],[["stunDurationPct",50]],[["pathDamagePct",100]],[["focusConduit",1]],[["poisonBurstDamagePct",50],["poisonBurstRadius",40]],[["poisonChainDamagePct",50]]],
  gas: [[["damagePct",35]],[["rangePct",25]],[["ratePct",20]],[["extraShots",1]],[["vulnerablePct",15]],[["vulnerableBonusPct",50]],[["zoneDurationPct",50]],[["burningTargetDamagePct",100]],[["zoneSlowPct",10]],[]],
  needle: [[["damagePct",30]],[["ratePct",25]],[["rangePct",25]],[["extraShots",1]],[["poisonTick",.5],["poisonDps",25],["poisonTime",2]],[["dotDamagePct",100]],[["poisonDurationPct",50]],[["conditionalStunTime",.2]],[["burnDps",18],["burnTime",2]],[["frozenTargetDamagePct",30]]],
  blade: [[["damagePct",40]],[["ratePct",25]],[["rangePct",25]],[["extraShots",1]],[["ricochetChancePct",45],["ricochetDamagePct",50]],[["ricochetDamageBonusPct",100]],[["ricochetExtra",1]],[["conditionalStunTime",.2]],[["burnDps",18],["burnTime",1]],[["poisonDps",25],["poisonTime",1]]],
  trap: [[["damagePct",30]],[["rangePct",25]],[["ratePct",20]],[["extraShots",1]],[["rootTime",.5]],[["rootDurationPct",50]],[["pullStrengthPct",75]],[["burnAreaDps",30],["burnAreaTime",2]],[["zoneStunTime",.3],["zoneTime",2]],[["zonePoisonDps",25],["zonePoisonTime",2]]],
};
const UPGRADE_VALUE_DEFS = {
  flame: [[['damagePct',25]],[['ratePct',15]],[['extraShots',1]],[['burnDps',18],['burnTime',2],['burnAreaDps',24],['burnAreaTime',2]],[['frozenTargetDamagePct',45]]],
  grenade: [[['damagePct',25]],[['ratePct',15]],[['extraAreas',1]],[['burnAreaDps',30],['burnAreaTime',2]],[['zonePoisonDps',25],['zonePoisonTime',2]]],
  cryo: [[['damagePct',25]],[['ratePct',15]],[['extraProjectiles',1]],[['slowPct',25],['slowTime',2],['freezeTime',.65]],[['electricVulnerablePct',18],['electricVulnerableTime',2]]],
  frostbomb: [[['damagePct',25]],[['ratePct',15]],[['extraShots',1]],[['iceTrailSlowPct',18],['iceTrailTime',2]],[['shardCount',3],['shardDamagePct',30]]],
  laser: [[['damagePct',25]],[['ratePct',15]],[['extraLaserTargets',1]],[['focusDelay',1],['focusDamagePct',25]],[['electricVulnerablePct',20],['electricVulnerableTime',2]]],
  chain: [[['damagePct',25]],[['ratePct',15]],[['extraChainCasts',1]],[['stunTime',.22],['pathDamage',42]],[['focusConduit',1]]],
  gas: [[['damagePct',25]],[['ratePct',15]],[['extraShots',1]],[['poisonTick',.5],['poisonDps',22],['poisonTime',2],['vulnerablePct',12]],[['burningTargetDamagePct',60]]],
  needle: [[['damagePct',25]],[['ratePct',15]],[['extraShots',1]],[['poisonTick',.5],['poisonDps',25],['poisonTime',2]],[['frozenTargetDamagePct',40]]],
  blade: [[['damagePct',25]],[['ratePct',15]],[['extraShots',1]],[['ricochetChancePct',48],['ricochetDamagePct',55]],[['poisonTick',.5],['poisonDps',22],['poisonTime',1.5]]],
  trap: [[['damagePct',25]],[['ratePct',15]],[['extraShots',1]],[['rootTime',.35],['pullStrengthPct',65]],[['zoneStunTime',.22],['zoneTime',2]]],
};

const LEGACY_UPGRADE_GRID = [
  [["燃壓提升","傷害+","傷害+35%"],["強力裝藥","傷害+","傷害+35%"],["冰核強化","傷害+","傷害+35%"],["冰晶加壓","傷害+","傷害+30%"],["聚焦增幅","傷害+","每段傷害+30%"],["高壓電芯","傷害+","傷害+35%"],["腐蝕升級","傷害+","每段傷害+35%"],["毒針強化","傷害+","傷害+30%"],["鋒刃加固","傷害+","傷害+40%"],["戰術強化","傷害+","傷害+30%"]],
  [["高效供油","時間+","持續時間+50%"],["巨型彈體","範圍+","範圍+25%"],["精準校正","攻速+","攻速+25%"],["擴散凍爆","範圍+","範圍+25%"],["超頻發射","攻速+","Tick速度+25%"],["額外鏈接","額外攻擊","額外閃電鏈+1"],["擴散氣囊","範圍+","範圍+25%"],["疾速連射","攻速+","攻速+25%"],["高速驅動","攻速+","攻速+25%"],["觸發增幅","範圍+","範圍+25%"]],
  [["擴散噴口","範圍+","範圍+25%"],["快速裝填","額外爆炸","爆點+1"],["多重槍管","子彈+1","額外子彈+1"],["急速投擲","攻速+","攻速+20%"],["延伸透鏡","持續時間+","持續時間+50%"],["彈跳目標","彈跳目標+","彈掉目標+3"],["快速裝填","攻速+","攻速+20%"],["擴散爆裂","範圍+","爆炸範圍+25%"],["巨大鋒刃","範圍+","攻擊範圍+25%"],["快速部署","攻速+","布置速度+20%"]],
  [["雙重火流","額外火焰","額外火焰+1"],["雙重裝彈","攻速+","攻速+20%"],["貫穿彈芯","穿透+","穿透敵人+1"],["多重冰爆","額外炸彈+","額外炸彈+1"],["折射光束","額外光束","在主目標折射一個光束對另一目標造成傷害"],["傳導增幅","路徑傷害","對聯鎖路徑上敵人造成50傷害"],["雙重罐體","額外毒霧","額外毒氣彈+1"],["追加毒針","額外毒針","額外毒針+1"],["光速連斬","額外斬擊","額外斬擊+1"],["追加模組","額外陷阱","額外陷阱+1"]],
  [["燃料附著","解鎖燃燒","命中後每秒造成燃燒傷害，持續2S"],["凝固汽油彈","爆炸後留下燃燒區域","燃燒區域持續2秒，每秒造成30傷害"],["寒氣附著","解鎖緩速","命中後緩速25%，持續2S"],["冰痕","爆炸後留下冰痕","爆炸後留下冰痕區域，敵人移速-15%，持續2S"],["過載聚焦","持續增傷","持續照射同一目標1S後，後續傷害+20%"],["電磁殘留","麻痺攻擊目標","被擊中的敵人麻痺0.3S"],["腐蝕毒霧","毒霧中的敵人受到額外傷害","毒霧中的敵人受到傷害+15%"],["神經毒素","命中後造成中毒","命中後造成中毒，每0.5S25傷害，持續2S"],["迴旋飛刃","命中後有機率發射額外迴旋刃","命中後機率向隨機方向發射一道回旋刃，造成50%傷害"],["戰術封鎖","陷阱造成定身","陷阱觸發後造成定身0.5S"]],
  [["燃燒強化","燃燒傷害+","燃燒傷害+100%"],["燃燒加劇","燃燒傷害+","燃燒傷害+100%"],["冷卻延長","緩速時間+","緩速時間+50%"],["冰痕延長","冰痕持續時間+","冰痕持續時間+50%"],["聚焦強化","聚焦效果+","加成效果提升50%"],["麻痺擴散","麻痺時間+","麻痺時間+50%"],["腐蝕加深","易傷效果+","增傷效果+50%"],["毒傷強化","中毒傷害+","中毒傷害+100%"],["迴旋增幅","迴旋飛刃傷害+","飛刃傷害+100%"],["封鎖延長","定身時間+","定身時間+50%"]],
  [["延時燃燒","燃燒時間+","燃燒持續時間+50%"],["延燒區域","燃燒時間+","燃燒持續時間+50%"],["極凍禁制","對第一個目標凍結","對第一個目標造成凍結效果，持續1S"],["冰痕強化","冰痕緩速+","冰痕緩速效果+15%"],["持續灼穿","聚焦時間-","持續照射需要時間-50%"],["路徑強化","路徑傷害+","路徑上造成的傷害+100%"],["延時滯留","毒霧持續時間+","毒霧持續時間+50%"],["延效毒素","中毒時間+","中毒持續時間+50%"],["追加飛刃","迴旋刃+1","額外迴旋刃+1"],["牽引模組","牽引強度+","陷阱觸發後將目標拉向中心"]],
  [["氣爆燃燒","對燃燒敵人造成爆炸","命中燃燒中的敵人時，在目標位置造成小範圍爆炸"],["牽引爆震","爆炸牽引敵人","爆炸命中敵人時造成短距離牽引"],["冰痕狙擊","子彈軌跡留下冰痕","子彈軌跡留下冰痕造成緩速25%，持續1S"],["冰封延長","凍結時間+","凍結持續時間+50%"],["折射聚焦","折射光束有聚焦","折射出的光束同樣享有聚焦效果"],["麻痺導流","攻擊聚焦敵人","被聚焦標記敵人也會被連鎖"],["劇毒烈焰","毒霧中燃燒敵人傷害+","毒霧中的燃燒敵人受到傷害+100%"],["麻痺毒針","中毒目標被毒針命中麻痺","中毒目標被毒針爆裂命中時，麻痺0.2S"],["電刃麻痺","造成命中麻痺","被迴旋刃命中的敵人造成麻痺0.2S"],["燃燒陷阱","陷阱觸發後留下燃燒區域","陷阱觸發後留下燃燒區域造成火焰傷害，持續2S"]],
  [["電熱灼斷","對燃燒敵人造成麻痺","命中燃燒中的敵人時，麻痺0.2S"],["電磁榴彈","爆炸後留下電磁區","爆炸後留下電磁區2S，接觸的敵人停頓0.3S"],["冷毒穿甲","中毒目標受到額外傷害","中毒目標受到狙擊傷害+20%"],["碎晶爆裂","冰爆後碎晶散射","爆炸後散出3枚冰晶，各造成30%傷害"],["高壓爆點","命中範圍爆炸","持續照射命中1S後，在目標位置產生小範圍爆炸"],["電毒傳播","中毒的敵人爆炸","中毒的敵人被閃電命中時，造成小範圍爆炸，造成50%傷害"],["寒毒封鎖","毒霧內緩速","毒霧內敵人降低10%移速"],["燃毒彈頭","中毒目標附加燃燒","中毒目標被毒針爆裂命中時，附加燃燒"],["燃刃切割","造成命中燃燒","被迴旋刃命中的敵人造成燃燒，持續1S"],["電磁陷阱","陷阱觸發後留下感電區域","陷阱觸發後留下感電區域，對接觸敵人造成麻痺0.3S，持續2S"]],
  [["毒焰","對中毒敵人造成額外傷害","若敵人中毒，噴火傷害+20%"],["毒爆榴彈","燃燒區域中的敵人中毒","燃燒區域中的敵人附加中毒效果，持續2S"],["碎晶穿透","擊中目標後分裂冰晶碎片","擊中第一個目標後分裂2枚冰晶碎片，造成40%傷害"],["寒爆壓制","凍結結束後減速","敵人凍結結束後，額外緩速20%，持續1S"],["導電標記","雷射命中增傷","被雷射命中的敵人受到閃電傷害+20%，持續2S"],["電毒擴散","中毒的敵人被擊中額外電流","中毒的敵人被電擊時，放出一條電流造成50%傷害"],null,["碎毒穿刺","凍結敵人命中增傷","凍結中的敵人被毒針命中時，爆裂傷害+30%"],["毒刃穿刺","造成命中中毒","被迴旋刃命中的敵人造成中毒，持續1S"],["毒化陷阱","陷阱觸發後留下毒霧區域","陷阱觸發後留下毒霧區域造成毒傷，持續2S"]],
];

const UPGRADE_GRID = [
  [["高壓燃料","傷害","傷害+25%"],["高爆裝藥","傷害","傷害+25%"],["精準校正","傷害","傷害+25%"],["冰晶加壓","傷害","傷害+25%"],["聚焦增幅","傷害","每段傷害+25%"],["高壓電芯","傷害","傷害+25%"],["腐蝕配方","傷害","每段傷害+25%"],["毒針強化","傷害","傷害+25%"],["鋒刃加固","傷害","傷害+25%"],["戰術彈頭","傷害","傷害+25%"]],
  [["快速增壓","攻速","攻速+15%"],["自動裝填","攻速","攻速+15%"],["快速拉栓","攻速","攻速+15%"],["急速投擲","攻速","攻速+15%"],["超頻發射","攻速","攻速+15%"],["快速充能","攻速","攻速+15%"],["快速裝填","攻速","攻速+15%"],["疾速連射","攻速","攻速+15%"],["高速驅動","攻速","攻速+15%"],["快速部署","攻速","攻速+15%"]],
  [["雙焰噴口","數量","額外火焰+1"],["雙發榴彈","數量","爆點+1"],["多重槍管","數量","額外子彈+1"],["多重冰爆","數量","額外冰晶彈+1"],["折射透鏡","數量","額外目標+1"],["額外電鏈","數量","額外閃電鏈+1"],["多重毒霧","數量","額外毒氣彈+1"],["追加毒針","數量","額外毒針+1"],["追加飛刃","數量","額外斬擊+1"],["追加模組","數量","額外陷阱+1"]],
  [["灼燒地帶","核心","噴流命中留下燃燒區域"],["焦土彈","核心","爆炸留下燃燒區域"],["極寒標記","核心","命中緩速並凍結首要目標"],["寒霜領域","核心","冰爆留下緩速冰痕"],["聚焦鎖定","核心","持續鎖定提高傷害"],["麻痺磁場","核心","電鏈麻痺並傷害路徑敵人"],["腐蝕毒霧","核心","毒霧造成中毒與易傷"],["神經毒素","核心","命中疊加持續毒傷"],["迴旋飛刃","核心","命中後彈射額外飛刃"],["牽引核心","核心","陷阱定身並牽引敵人"]],
  [["霜火噴流","連動","對凍結目標增傷"],["毒爆榴彈","連動","焦土區附加毒霧"],["導電冰彈","連動","冰彈附加導電標記"],["碎冰狙爆","連動","凍結目標碎裂冰晶"],["電磁折射","連動","雷射標記提高電屬傷害"],["聚焦導流","連動","電鏈追擊聚焦目標"],["劇毒燃爆","連動","對燃燒目標大幅增傷"],["寒毒爆發","連動","對凍結目標提高毒傷"],["淬毒旋刃","連動","飛刃命中附加中毒"],["電磁陷阱","連動","陷阱留下麻痺區域"]],
];

const LEGACY_UPGRADE_REQUIREMENT_LABELS = {
  "燃燒強化":"燃料附著", "延時燃燒":"燃料附著", "燃燒加劇":"凝固汽油彈", "延燒區域":"凝固汽油彈",
  "冷卻延長":"寒氣附著", "極凍禁制":"寒氣附著", "冰痕延長":"冰痕", "冰痕強化":"冰痕",
  "聚焦強化":"過載聚焦", "持續灼穿":"過載聚焦", "麻痺擴散":"電磁殘留", "路徑強化":"傳導增幅",
  "腐蝕加深":"腐蝕毒霧", "毒傷強化":"神經毒素", "延效毒素":"神經毒素", "迴旋增幅":"迴旋飛刃",
  "追加飛刃":"迴旋飛刃", "封鎖延長":"戰術封鎖",
  "氣爆燃燒":"凝固汽油彈", "牽引爆震":"戰術封鎖", "冰痕狙擊":"冰痕",
  "折射聚焦":"折射光束＋過載聚焦", "麻痺導流":"過載聚焦",
  "劇毒烈焰":"燃料附著", "麻痺毒針":"電磁殘留＋任一中毒來源", "電刃麻痺":"電磁殘留", "燃燒陷阱":"燃料附著",
  "電熱灼斷":"電磁殘留＋燃料附著", "電磁榴彈":"電磁殘留", "冷毒穿甲":"神經毒素", "高壓爆點":"強力裝藥",
  "電毒傳播":"任一中毒來源", "寒毒封鎖":"冰痕", "燃毒彈頭":"燃料附著＋任一中毒來源", "燃刃切割":"燃料附著", "電磁陷阱":"電磁殘留",
  "毒焰":"腐蝕毒霧", "毒爆榴彈":"腐蝕毒霧＋凝固汽油彈", "碎晶穿透":"碎晶爆裂",
  "導電標記":"傳導增幅", "電毒擴散":"任一中毒來源", "碎毒穿刺":"極凍禁制", "毒刃穿刺":"腐蝕毒霧", "毒化陷阱":"腐蝕毒霧"
};

const UPGRADE_REQUIREMENT_LABELS = {
  "霜火噴流":"寒霜領域",
  "毒爆榴彈":"腐蝕毒霧",
  "導電冰彈":"麻痺磁場",
  "碎冰狙爆":"極寒標記",
  "電磁折射":"麻痺磁場",
  "聚焦導流":"聚焦鎖定",
  "劇毒燃爆":"灼燒地帶",
  "寒毒爆發":"寒霜領域",
  "淬毒旋刃":"神經毒素",
  "電磁陷阱":"麻痺磁場",
};

const WAVE_REWARD_TIERS = [
  ["dry","低潮","waveRewardDryWeight","waveRewardDryMul","低機率的小幅乾波"],
  ["low","偏低","waveRewardLowWeight","waveRewardLowMul","小虧但不會過度乾燥"],
  ["normal","一般","waveRewardNormalWeight","waveRewardNormalMul","大多數一般波落在此區"],
  ["profit","小賺","waveRewardProfitWeight","waveRewardProfitMul","少量高於本波BET"],
  ["hot","熱波","waveRewardHotWeight","waveRewardHotMul","低機率小賺，不作為主要大獎"],
];

const BOSS_DIFFICULTY_TIERS = [
  ["easy","◆","bossDiffEasyWeight","bossDiffEasyHpMul","bossDiffEasyAtkMul","bossDiffEasySpeedMul"],
  ["normal","◆◆","bossDiffNormalWeight","bossDiffNormalHpMul","bossDiffNormalAtkMul","bossDiffNormalSpeedMul"],
  ["hard","◆◆◆","bossDiffHardWeight","bossDiffHardHpMul","bossDiffHardAtkMul","bossDiffHardSpeedMul"],
  ["brutal","◆◆◆◆","bossDiffBrutalWeight","bossDiffBrutalHpMul","bossDiffBrutalAtkMul","bossDiffBrutalSpeedMul"],
];

const RTP_ESTIMATE_REFERENCE = Object.freeze({
  revision:22,
  samples:100000,
  total:1.3080,
  base:0.4042,
  firstBoss:0.4521,
  laterBoss:0.4517,
  waveRewardBudget:0.463008,
  preBossRewardMul:1.15,
  postBossRewardFunding:.45,
  firstBossAdd:1.16,
  laterBossAdd:1.28,
  firstBossPressure:1.0918,
  laterBossPressure:.6048,
  firstBossKillRate:.935,
  laterBossKillRate:.859,
  bossChanceMul:1,
});

function firstBossDifficultyWeightKey(weightKey) {
  return weightKey.replace("bossDiff", "bossFirstDiff");
}

function upgradeRequirementText(text) {
  return Object.entries(UPGRADE_REQUIREMENT_LABELS).find(([name]) => text.includes(name))?.[1] || "";
}

const DEFAULT_PARAMS = {
  balanceRevision:202,
  mathModelEnabled:1,mathTargetRtp:.95,mathTolerancePct:1,mathBuildInfluence:.80,mathBossBuildInfluence:.08,mathBossLaterBuildInfluence:.08,mathMinionBuildInfluence:.24,mathAttributeMinionInfluence:.24,mathAttributeBossInfluence:.34,mathAreaBossRiskDiscount:.08,mathSingleTowerChanceShift:.07,mathAreaTowerChanceShift:-.03,mathControlTowerChanceShift:-.035,mathSingleTowerPayoutShift:0,mathAreaTowerPayoutShift:0,mathControlTowerPayoutShift:0,mathSingleSharePayoutSlope:0,mathAreaSharePayoutSlope:0,mathControlSharePayoutSlope:0,mathHpInfluence:1.50,mathMinionHpInfluence:.22,mathBossHpInfluence:1.10,mathBossLaterHpInfluence:.18,mathBossOrdinalPenalty:.08,mathBossFirstBaseChance:.97,mathBossLaterBaseChance:.75,mathFirstBossDelayPenalty:.012,mathFirstBossGuaranteePenalty:0,mathHpReference:.91,mathHeroPower_fire:1,mathHeroPower_ice:1,mathHeroPower_electric:1,mathHeroPower_neutral:1,mathHeroPower_poison:1,mathCoreRiskBonus:.05,mathTowerBossPower_flame:.68,mathTowerBossPower_grenade:.64,mathTowerBossPower_cryo:1.88,mathTowerBossPower_frostbomb:.58,mathTowerBossPower_laser:2.05,mathTowerBossPower_chain:.48,mathTowerBossPower_gas:.64,mathTowerBossPower_needle:2.08,mathTowerBossPower_blade:.88,mathTowerBossPower_trap:.42,mathBossPenalty:.35,mathPayoutCalibration:1,mathMinionPayoutChanceScale:1,mathBossPayoutChanceScale:.97,mathBossPayoutChanceMidScale:.95,mathBossPayoutChanceDeepScale:.59,mathBossPayoutChanceUltraScale:1.15,mathBossPayoutChanceTailScale:2.70,mathPayoutBand1:1,mathPayoutBand2:1,mathPayoutBand3:1,mathPayoutBand4:1,mathPayoutBand5:1,mathLossHpMul:5,mathLossAtkMul:5,mathLossSpeedMul:1.12,mathMinClearChance:.15,mathMaxClearChance:.999,mathFirstWaveClearChance:.985,
  mathClearBand1:.975,mathClearBand2:.955,mathClearBand3:.925,mathClearBand4:.875,mathClearBand5:.835,
  heroDamageMul:1,heroSameAttrBonusPct:15,heroResonanceBonusPct:10,heroAllTowerBonusPct:8,heroDamageUpgradePct:12,heroRateUpgradePct:8,heroFirstUpgradeQuantity:1,heroQuantityUpgrade:1,heroQuantityEveryLevels:3,
  bossRollDuration:4.8,
  bossRollHighThreshold:2.5,
  bossRollJackpotThreshold:3.8,
  bossLowWeight:55,bossMidWeight:35,bossHighWeight:10,bossLowMin:1,bossLowMax:1.6,bossMidMin:2,bossMidMax:4,bossHighMin:6,bossHighMax:14,
bossFirstMinWave:1,bossFirstChance:8,bossFirstChanceInc:12,bossFirstChanceCap:68,bossFirstGuaranteeWave:30,bossFirstRewardMul:.35,bossLaterRewardMul:.80,bossChanceMul:1,bossChanceCap:55,minionHpMul:1.18,minionAtkMul:1.20,minionSpeedMul:1.02,wave1MinionAtkMul:.52,eliteHpMul:1,eliteAtkMul:1,bossFirstHpMul:1.23,bossHpMul:1.32,bossHpPerOrdinalMul:1.06,bossAtkMul:.95,bossSpeedMul:1,bossFirstAtkMul:.75,bossPreludeCountMul:.60,
  moneyMul:1,deepMoneyBase:1.35,deepMoneyRamp:.04,deepMoneyCap:1.8,spawnInterval:.26,eliteMoneyMul:1,dropChanceMul:1,expMul:1,towerDamageMul:1,bossBetStepMul:1.5,preBossRewardMul:1.15,postBossRewardFunding:.45,betMidMul:1.5,betDeepMul:2.5,baseHp:1000,waveAttrBiasEarly:.90,waveAttrBias:.90,
  waveRewardDryWeight:32,waveRewardDryMul:.16,waveRewardLowWeight:30,waveRewardLowMul:.34,waveRewardNormalWeight:18,waveRewardNormalMul:.58,waveRewardProfitWeight:2,waveRewardProfitMul:1,waveRewardHotWeight:18,waveRewardHotMul:20,
  bossDiffEasyWeight:50,bossDiffEasyHpMul:.86,bossDiffEasyAtkMul:.9,bossDiffEasySpeedMul:.97,bossDiffNormalWeight:40,bossDiffNormalHpMul:1.06,bossDiffNormalAtkMul:1.05,bossDiffNormalSpeedMul:1,bossDiffHardWeight:8,bossDiffHardHpMul:1.30,bossDiffHardAtkMul:1.25,bossDiffHardSpeedMul:1.04,bossDiffBrutalWeight:2,bossDiffBrutalHpMul:1.58,bossDiffBrutalAtkMul:1.45,bossDiffBrutalSpeedMul:1.08,bossShieldHpPct:8,bossShieldDamageMul:.68,bossBreakDamageMul:1.58,bossBreakDuration:2.4,bossBreakAttackPause:1.35,bossAttackWindup:1,bossAttackIntervalJitterPct:18,bossEnrageHpPct:32,bossEnrageAttackSpeedMul:1.22,
  bossFirstDiffEasyWeight:50,bossFirstDiffNormalWeight:38,bossFirstDiffHardWeight:10,bossFirstDiffBrutalWeight:2,bossFirstDifficultyCompression:.65,
  modelBossKillRate:.70,modelClearRate10:.63,modelClearRate20:.18,modelClearRate30:.06,
  upgradeDamage40:1.4,upgradeDamage35:1.35,upgradeDamage30:1.3,upgradeRate25:1.25,upgradeRate20:1.2,upgradeRange25:1.25,upgradeDuration50:1.5,upgradeDotDamage100:2,upgradeExtraChain:3,upgradePathDamage:50,upgradeVulnerable15:.15,upgradeSlow25:.25,
};
DEFAULT_PARAMS.balanceRevision = 205;
DEFAULT_PARAMS.mathGeneralRtpShare = .52;
DEFAULT_PARAMS.mathBossRtpShare = .43;
DEFAULT_PARAMS.mathPoolEntryTier1Mul = .2;
DEFAULT_PARAMS.mathPoolEntryTier1Weight = 10;
DEFAULT_PARAMS.mathPoolEntryTier2Mul = .5;
DEFAULT_PARAMS.mathPoolEntryTier2Weight = 20;
DEFAULT_PARAMS.mathPoolEntryTier3Mul = .8;
DEFAULT_PARAMS.mathPoolEntryTier3Weight = 30;
DEFAULT_PARAMS.mathPoolEntryTier4Mul = 1.00;
DEFAULT_PARAMS.mathPoolEntryTier4Weight = 25;
DEFAULT_PARAMS.mathPoolEntryTier5Mul = 2.1;
DEFAULT_PARAMS.mathPoolEntryTier5Weight = 14;
DEFAULT_PARAMS.mathPoolEntryTier6Mul = 5;
DEFAULT_PARAMS.mathPoolEntryTier6Weight = 1;
DEFAULT_PARAMS.waveRewardDryWeight = 32;
DEFAULT_PARAMS.waveRewardDryMul = .16;
DEFAULT_PARAMS.waveRewardLowWeight = 30;
DEFAULT_PARAMS.waveRewardLowMul = .34;
DEFAULT_PARAMS.waveRewardNormalWeight = 18;
DEFAULT_PARAMS.waveRewardNormalMul = .58;
DEFAULT_PARAMS.waveRewardProfitWeight = 2;
DEFAULT_PARAMS.waveRewardProfitMul = 1;
DEFAULT_PARAMS.waveRewardHotWeight = 18;
DEFAULT_PARAMS.waveRewardHotMul = 20;
DEFAULT_PARAMS.bossLowWeight = 55;
DEFAULT_PARAMS.bossMidWeight = 35;
DEFAULT_PARAMS.bossHighWeight = 10;
DEFAULT_PARAMS.bossLowMin = 1.0;
DEFAULT_PARAMS.bossLowMax = 1.6;
DEFAULT_PARAMS.bossMidMin = 2.0;
DEFAULT_PARAMS.bossMidMax = 4.0;
DEFAULT_PARAMS.bossHighMin = 6.0;
DEFAULT_PARAMS.bossHighMax = 14.0;
DEFAULT_PARAMS.bossFirstRewardMul = .35;
DEFAULT_PARAMS.bossLaterRewardMul = .80;
DEFAULT_PARAMS.mathBossBuildInfluence = .08;
DEFAULT_PARAMS.mathBossLaterBuildInfluence = .08;
DEFAULT_PARAMS.mathBossLaterHpInfluence = .18;
DEFAULT_PARAMS.mathBossFirstBaseChance = .97;
DEFAULT_PARAMS.mathBossLaterBaseChance = .75;
DEFAULT_PARAMS.mathBossOrdinalPenalty = .08;
DEFAULT_PARAMS.mathSingleTowerChanceShift = .04;
DEFAULT_PARAMS.mathAreaTowerChanceShift = -.02;
DEFAULT_PARAMS.mathControlTowerChanceShift = -.03;
DEFAULT_PARAMS.mathBossPayoutChanceScale = .97;
DEFAULT_PARAMS.mathBossPayoutChanceMidScale = .95;
DEFAULT_PARAMS.mathBossPayoutChanceDeepScale = .59;
DEFAULT_PARAMS.mathBossPayoutChanceUltraScale = 1.15;
DEFAULT_PARAMS.mathBossPayoutChanceTailScale = 2.70;
DEFAULT_PARAMS.mathPoolEnabled = 1;
DEFAULT_PARAMS.mathPoolSeedBetUnits = 0;
DEFAULT_PARAMS.mathPoolMaxPayoutMul = 500;
DEFAULT_PARAMS.mathPoolTemporaryDeficitEnabled = 1;
DEFAULT_PARAMS.mathCarryShapeEnabled = 1;
DEFAULT_PARAMS.mathCarryAnchorChance = .60;
DEFAULT_PARAMS.mathCarryMinReturn = 1;
DEFAULT_PARAMS.mathPoolBaseOutcomeCapMul = 1.2;
DEFAULT_PARAMS.mathPoolDeepOutcomeCapMul = 500;
DEFAULT_PARAMS.mathPoolOutcomeCapRampWaves = 29;
DEFAULT_PARAMS.mathPoolOutcomeCapCurve = 2.4;
DEFAULT_PARAMS.mathPoolFirstBossOutcomeCapMul = 20;
DEFAULT_PARAMS.mathPoolBossCarryRecycleRate = 0;
DEFAULT_PARAMS.mathPoolBossAddCapScale = 0;
DEFAULT_PARAMS.mathPoolReleaseRate = .08;
DEFAULT_PARAMS.mathPoolDeepReleaseRate = .15;
DEFAULT_PARAMS.mathPoolDepthRampWaves = 8;
DEFAULT_PARAMS.mathPoolBossReleaseRate = 1;
DEFAULT_PARAMS.mathPoolFirstBossReleaseRate = .55;
DEFAULT_PARAMS.mathPoolLaterBossReleaseRate = .75;
DEFAULT_PARAMS.mathPoolReleaseCapMul = 500;
DEFAULT_PARAMS.mathPoolMeaningfulWinTriggerMul = .75;
DEFAULT_PARAMS.mathPoolMeaningfulWinFloorMul = 1.5;
DEFAULT_PARAMS.mathPoolStrongWinChance = .55;
DEFAULT_PARAMS.mathPoolStrongWinDeepChance = .95;
DEFAULT_PARAMS.mathPoolStrongWinEarlyFloorMul = 1.5;
DEFAULT_PARAMS.mathPoolStrongWinFloorMul = 7;
DEFAULT_PARAMS.mathPoolWeakBossCapMul = .95;
DEFAULT_PARAMS.mathPoolWeakBossReleaseRate = .20;
DEFAULT_PARAMS.mathPoolHotWaveEarlyFloorMul = 1.02;
DEFAULT_PARAMS.mathPoolHotWaveFloorMul = 6;
DEFAULT_PARAMS.mathPoolHotWaveDeepWeight = 8;
DEFAULT_PARAMS.mathPoolHotWaveEarlyReleaseRate = .25;
DEFAULT_PARAMS.mathPoolHotWaveReleaseRate = 1;
DEFAULT_PARAMS.mathCheckpointRepriceEnabled = 1;
DEFAULT_PARAMS.mathCheckpointMinChance = .05;
DEFAULT_PARAMS.mathRerollEntryEnabled = 1;
DEFAULT_PARAMS.mathSingleSharePayoutSlope = 0;
DEFAULT_PARAMS.mathAreaSharePayoutSlope = 0;
DEFAULT_PARAMS.mathControlSharePayoutSlope = 0;
DEFAULT_PARAMS.mathSingleTowerChanceShift = .04;
DEFAULT_PARAMS.mathAreaTowerChanceShift = -.02;
DEFAULT_PARAMS.mathControlTowerChanceShift = -.03;
DEFAULT_PARAMS.mathMinionBuildInfluence = .32;
DEFAULT_PARAMS.mathAttributeMinionInfluence = .32;
DEFAULT_PARAMS.mathAttributeBossInfluence = .42;
DEFAULT_PARAMS.mathMinionHpInfluence = .22;
DEFAULT_PARAMS.mathFirstWaveClearChance = .985;
DEFAULT_PARAMS.mathClearBand1 = .975;
DEFAULT_PARAMS.mathClearBand2 = .955;
DEFAULT_PARAMS.mathClearBand3 = .925;
DEFAULT_PARAMS.mathClearBand4 = .875;
DEFAULT_PARAMS.mathClearBand5 = .835;
DEFAULT_PARAMS.mathHeroPower_fire = 1;
DEFAULT_PARAMS.mathHeroPower_ice = 1;
DEFAULT_PARAMS.mathHeroPower_electric = 1;
DEFAULT_PARAMS.mathHeroPower_poison = 1;
DEFAULT_PARAMS.mathHeroPower_neutral = 1;
DEFAULT_PARAMS.mathTowerBossPower_flame = .68;
DEFAULT_PARAMS.mathTowerBossPower_grenade = .64;
DEFAULT_PARAMS.mathTowerBossPower_cryo = 1.88;
DEFAULT_PARAMS.mathTowerBossPower_frostbomb = .58;
DEFAULT_PARAMS.mathTowerBossPower_laser = 2.05;
DEFAULT_PARAMS.mathTowerBossPower_chain = .48;
DEFAULT_PARAMS.mathTowerBossPower_gas = .64;
DEFAULT_PARAMS.mathTowerBossPower_needle = 2.08;
DEFAULT_PARAMS.mathTowerBossPower_blade = .88;
DEFAULT_PARAMS.mathTowerBossPower_trap = .42;
DEFAULT_PARAMS.mathPayoutCalibration = 1;
DEFAULT_PARAMS.mathPayoutBand1 = 1;
DEFAULT_PARAMS.mathPayoutBand2 = 1;
DEFAULT_PARAMS.mathPayoutBand3 = 1;
DEFAULT_PARAMS.mathPayoutBand4 = 1;
DEFAULT_PARAMS.mathPayoutBand5 = 1;
DEFAULT_PARAMS.mathMinClearChance = .15;
DEFAULT_PARAMS.mathBossFirstMinClearChance = .15;
DEFAULT_PARAMS.mathBossLaterMinClearChance = .14;
DEFAULT_PARAMS.bossFirstRewardMul = .35;
DEFAULT_PARAMS.bossLaterRewardMul = .80;
DEFAULT_PARAMS.waveRewardDryWeight = 32;
DEFAULT_PARAMS.waveRewardDryMul = .16;
DEFAULT_PARAMS.waveRewardLowWeight = 30;
DEFAULT_PARAMS.waveRewardLowMul = .34;
DEFAULT_PARAMS.waveRewardNormalWeight = 18;
DEFAULT_PARAMS.waveRewardNormalMul = .58;
DEFAULT_PARAMS.waveRewardProfitWeight = 2;
DEFAULT_PARAMS.waveRewardProfitMul = 1;
DEFAULT_PARAMS.waveRewardHotWeight = 18;
DEFAULT_PARAMS.waveRewardHotMul = 20;
DEFAULT_PARAMS.bossFirstHpMul = 1.23;
DEFAULT_PARAMS.bossHpMul = 1.32;
DEFAULT_PARAMS.bossHpPerOrdinalMul = 1.06;
DEFAULT_PARAMS.minionHpMul = 1.30;
DEFAULT_PARAMS.minionAtkMul = 1.34;
DEFAULT_PARAMS.minionSpeedMul = 1.04;
DEFAULT_PARAMS.wave1MinionAtkMul = .42;
DEFAULT_PARAMS.bossAtkMul = .95;
DEFAULT_PARAMS.waveAttrBiasEarly = .90;
DEFAULT_PARAMS.waveAttrBias = .90;
DEFAULT_PARAMS.bossDiffEasyWeight = 50;
DEFAULT_PARAMS.bossDiffNormalWeight = 40;
DEFAULT_PARAMS.bossDiffHardWeight = 8;
DEFAULT_PARAMS.bossDiffBrutalWeight = 2;
DEFAULT_PARAMS.bossDiffEasyHpMul = .86;
DEFAULT_PARAMS.bossDiffNormalHpMul = 1.06;
DEFAULT_PARAMS.bossDiffHardHpMul = 1.30;
DEFAULT_PARAMS.bossDiffBrutalHpMul = 1.58;
DEFAULT_PARAMS.bossShieldHpPct = 8;
DEFAULT_PARAMS.bossShieldDamageMul = .68;
DEFAULT_PARAMS.bossBreakDamageMul = 1.58;
DEFAULT_PARAMS.bossBreakDuration = 2.4;
DEFAULT_PARAMS.bossBreakAttackPause = 1.35;
DEFAULT_PARAMS.bossAttackWindup = 1;
DEFAULT_PARAMS.bossAttackIntervalJitterPct = 18;
DEFAULT_PARAMS.bossPreludeCountMul = .60;
DEFAULT_PARAMS.bossFirstAtkMul = .75;
DEFAULT_PARAMS.bossEnrageHpPct = 32;
DEFAULT_PARAMS.bossEnrageAttackSpeedMul = 1.22;
DEFAULT_PARAMS.bossLowWeight = 55;
DEFAULT_PARAMS.bossMidWeight = 35;
DEFAULT_PARAMS.bossHighWeight = 10;
DEFAULT_PARAMS.bossLowMin = 1.0;
DEFAULT_PARAMS.bossLowMax = 1.6;
DEFAULT_PARAMS.bossMidMin = 2.0;
DEFAULT_PARAMS.bossMidMax = 4.0;
DEFAULT_PARAMS.bossHighMin = 6.0;
DEFAULT_PARAMS.bossHighMax = 14.0;
DEFAULT_PARAMS.mathFirstBossGuaranteePenalty = 0;
DEFAULT_PARAMS.mathFirstBossDelayPenalty = .012;
DEFAULT_PARAMS.mathCoreRiskBonus = .050;
DEFAULT_PARAMS.mathBossFirstBaseChance = .97;
DEFAULT_PARAMS.bossBetStepMul = 1.50;
DEFAULT_PARAMS.betMidMul = 1.50;
DEFAULT_PARAMS.betDeepMul = 2.50;
[...MONSTER_TYPES, ...ELITE_TYPES, ...BOSS_TYPES].forEach(([id,,base]) => MONSTER_FIELDS.forEach(([f]) => {
  if (Number.isFinite(base[f])) DEFAULT_PARAMS[`monster_${id}_${f}`] = base[f];
}));
[...MONSTER_TYPES, ...ELITE_TYPES, ...BOSS_TYPES].forEach(([id]) => MONSTER_ATTRIBUTE_FIELDS.forEach(([f]) => {
  DEFAULT_PARAMS[`monster_${id}_${f}`] = MONSTER_ATTRIBUTE_BASE[id]?.[f] ?? 1;
}));
Object.entries(TEMPLATE_BASE).forEach(([tid, weights]) => MONSTER_WEIGHT_IDS.forEach(([mid]) => DEFAULT_PARAMS[`template_${tid}_${mid}`] = weights[mid] || 0));
BAND_BASE.forEach(([,base], i) => {
  const id = i + 1;
  DEFAULT_PARAMS[`band_${id}_countMin`] = base.countMin;
  DEFAULT_PARAMS[`band_${id}_countMax`] = base.countMax;
  MONSTER_WEIGHT_IDS.forEach(([mid]) => DEFAULT_PARAMS[`band_${id}_drop_${mid}`] = base.drop[mid] || 0);
  TEMPLATE_IDS.forEach(([tid]) => DEFAULT_PARAMS[`band_${id}_template_${tid}`] = base.templates[tid] || 0);
});
WAVE_BASE.forEach(row => WAVE_FIELDS.forEach(([field], i) => {
  DEFAULT_PARAMS[`wave_${row[0]}_${field}`] = field === "mathClear"
    ? WAVE_CLEAR_BASE[row[0] - 1]
    : field === "mathPayout"
      ? WAVE_PAYOUT_BASE[row[0] - 1]
      : field === "mathBossCorrection"
        ? 0
        : row[i + 1];
}));
EXP_BASE.forEach((v,i) => DEFAULT_PARAMS[`exp_${i+1}`] = v);
HERO_TUNING.forEach(([id,,,,base]) => HERO_FIELDS.forEach(([field]) => DEFAULT_PARAMS[`hero_${id}_${field}`] = base[field]));
TOWER_TUNING.forEach(([id,,base]) => TOWER_FIELDS.forEach(([f]) => DEFAULT_PARAMS[`tower_${id}_${f}`] = base[f]));
UPGRADE_GRID.forEach((row, rowIndex) => {
  row.forEach((_, towerIndex) => {
    const id = TOWER_TUNING[towerIndex]?.[0];
    upgradeEffectSpecs(id, rowIndex).forEach(spec => DEFAULT_PARAMS[upgradeValueParamKey(id, rowIndex, spec.key)] = spec.value);
  });
});

const PARAM_GROUPS = [
  ["動態定價與 Reroll","economy-group",[
    ["mathCheckpointRepriceEnabled","升級節點重新定價","0/1",0,1,1,"戰鬥中的3選1完成後，以新Build重新估算剩餘通關率，只調整尚未發放的彩金。"],
    ["mathCheckpointMinChance","節點最低通關率","比例",.01,.99,.01,"避免極端Build讓反推彩金除以接近0；正式值必須由戰鬥模擬校準。"],
    ["mathRerollEntryEnabled","Reroll納入RTP","0/1",0,1,1,"Reroll支付視為獨立BET，重新抽入水倍率並計入當波或下一波RTP預算。"],
  ]],
  ["BOSS 風險定價下限","economy-group",[
    ["mathBossFirstMinClearChance","首王預估率下限","比例",.01,.99,.01,"避免首王少數極端 Build 產生不合理超高彩金。"],
    ["mathBossLaterMinClearChance","後王預估率下限","比例",.01,.99,.01,"允許低擊殺率後王取得相應的高風險補償。"],
  ]],
  ["BOSS 模型基準","economy-group",[
    ["mathBossFirstBaseChance","首王模型基準率","比例",.05,.999,.005,"首王獨立成功率基準，不再與一般波共用。"],
    ["mathBossLaterBaseChance","後王模型基準率","比例",.05,.999,.005,"第二隻以後 BOSS 的獨立成功率基準。"],
  ]],
  ["RTP 波段校正","economy-group",[
    ["mathHpInfluence","基地 HP 風險影響","比例",0,2,.01,"剩餘 HP 越低，通關後的風險補償越高；不改變實際戰鬥。"],
    ["mathMinionHpInfluence","一般波 HP 風險影響","比例",0,2,.01,"一般波降低低血量補償，避免 BOSS 後的安全波 RTP 暴增。"],
    ["mathBossHpInfluence","BOSS 波 HP 風險影響","比例",0,2,.01,"只調整 BOSS 波依基地剩餘血量產生的風險補償。"],
    ["mathBossLaterHpInfluence","後王 HP 風險影響","比例",0,2,.01,"第二隻以後 BOSS 使用較平緩的 HP 風險定價。"],
    ["mathBossOrdinalPenalty","每隻後續 BOSS 風險","比例",0,.8,.01,"每多遇到一隻 BOSS，降低預估擊殺率並提高成功後補償。"],
    ["mathFirstBossDelayPenalty","首王延後出現風險","比例",0,.2,.01,"首王越晚出現，依延後波數平方降低預估擊殺率。"],
    ["mathFirstBossGuaranteePenalty","首王保底波風險","比例",0,.6,.01,"首王拖到保底波才出現時，額外降低預估擊殺率。"],
    ["mathHpReference","基地 HP 風險基準","比例",0,1,.01,"以此 HP 比例作為風險補償的中性點。"],
    ["mathBossBuildInfluence","BOSS Build 風險影響","比例",0,2,.01,"BOSS 波完整反映單體、控場、角色與塔組成。"],
    ["mathBossLaterBuildInfluence","後王 Build 風險影響","比例",0,2,.01,"第二隻以後降低倖存者 Build 偏差，避免模型高估後王擊殺率。"],
    ["mathMinionBuildInfluence","一般波 Build 風險影響","比例",0,2,.01,"一般波只給小幅 Build 補償，避免單體塔每波被過度補償。"],
    ["mathAttributeMinionInfluence","一般波屬性影響","比例",0,2,.01,"依角色、砲塔與升級投入加權後的實際克制倍率，修正一般波預估通關率。"],
    ["mathAttributeBossInfluence","BOSS 屬性影響","比例",0,2,.01,"依角色、砲塔與升級投入加權後的實際克制倍率，修正 BOSS 預估擊殺率。"],
    ["mathAreaBossRiskDiscount","群體 Build 打王風險折扣","比例",0,.25,.01,"群體塔多於單體塔時，依差額提高 BOSS 通關後補償。"],
    ["mathSingleTowerChanceShift","每座單體塔風險修正","比例",-.25,.25,.005,"依實際持有的單體塔數修正 BOSS 預估擊殺率。"],
    ["mathAreaTowerChanceShift","每座群體塔風險修正","比例",-.25,.25,.005,"依實際持有的群體塔數修正 BOSS 預估擊殺率。"],
    ["mathControlTowerChanceShift","每座控場塔風險修正","比例",-.25,.25,.005,"依實際持有的控場塔數提高 BOSS 成功後補償。"],
    ["mathSingleTowerPayoutShift","單體投資彩金修正","比例",-.25,.25,.005,"依單體塔數與升級投入修正 BOSS 波彩金，不改變擊殺率。"],
    ["mathAreaTowerPayoutShift","群體投資彩金修正","比例",-.25,.25,.005,"依群體塔數與升級投入修正 BOSS 波彩金，不改變擊殺率。"],
    ["mathControlTowerPayoutShift","控場投資彩金修正","比例",-.25,.25,.005,"依控場塔數與升級投入修正 BOSS 波彩金，不改變擊殺率。"],
    ["mathCoreRiskBonus","核心／連動風險加成","比例",0,.25,.01,"每個核心或連動升級提高 Build 預估強度，避免高評級 Build 得到過多補償。"],
    ["mathHeroPower_fire","火角色風險強度","倍率",.25,2.5,.01,"只供風險定價使用，不改變角色實際傷害。"],
    ["mathHeroPower_ice","冰角色風險強度","倍率",.25,2.5,.01,"只供風險定價使用，不改變角色實際傷害。"],
    ["mathHeroPower_electric","電角色風險強度","倍率",.25,2.5,.01,"只供風險定價使用，不改變角色實際傷害。"],
    ["mathHeroPower_poison","毒角色風險強度","倍率",.25,2.5,.01,"只供風險定價使用，不改變角色實際傷害。"],
    ["mathHeroPower_neutral","無屬角色風險強度","倍率",.25,2.5,.01,"只供風險定價使用，不改變角色實際傷害。"],
    ["mathTowerBossPower_flame","噴火槍打王風險強度","倍率",.25,2.5,.01,"只供 Build 風險定價使用。"],
    ["mathTowerBossPower_grenade","榴彈打王風險強度","倍率",.25,2.5,.01,"只供 Build 風險定價使用。"],
    ["mathTowerBossPower_cryo","急凍狙擊打王風險強度","倍率",.25,2.5,.01,"只供 Build 風險定價使用。"],
    ["mathTowerBossPower_frostbomb","冰晶炸彈打王風險強度","倍率",.25,2.5,.01,"只供 Build 風險定價使用。"],
    ["mathTowerBossPower_laser","雷射光線打王風險強度","倍率",.25,2.5,.01,"只供 Build 風險定價使用。"],
    ["mathTowerBossPower_chain","閃電鎖鏈打王風險強度","倍率",.25,2.5,.01,"只供 Build 風險定價使用。"],
    ["mathTowerBossPower_gas","毒氣彈打王風險強度","倍率",.25,2.5,.01,"只供 Build 風險定價使用。"],
    ["mathTowerBossPower_needle","毒針彈打王風險強度","倍率",.25,2.5,.01,"只供 Build 風險定價使用。"],
    ["mathTowerBossPower_blade","旋刃打王風險強度","倍率",.25,2.5,.01,"只供 Build 風險定價使用。"],
    ["mathTowerBossPower_trap","陷阱打王風險強度","倍率",.25,2.5,.01,"只供 Build 風險定價使用。"],
    ["mathPayoutCalibration","RTP 整體校正","倍率",.5,1.5,.001,"只校正每波通關後的彩金預算，不改變實際戰鬥輸贏。"],
    ["mathMinionPayoutChanceScale","一般波計價成功率","倍率",.5,2,.001,"只調整一般波彩金反推使用的計價成功率；不改變實際通關。"],
    ["mathBossPayoutChanceScale","首王計價率","倍率",.5,4,.001,"首王彩金分母 = 首王預估擊殺率 × 本倍率；只校準彩金，不改實際戰鬥。"],
    ["mathBossPayoutChanceMidScale","後續 BOSS 前段計價率","倍率",.5,4,.001,"第2隻後、1-10波的彩金計價倍率；依正式模擬實際擊殺率校準。"],
    ["mathBossPayoutChanceDeepScale","後續 BOSS 中段計價率","倍率",.5,4,.001,"第2隻後、11-20波的彩金計價倍率；只改彩金反推，不改怪物強度。"],
    ["mathBossPayoutChanceUltraScale","後續 BOSS 深段計價率","倍率",.5,6,.001,"第2隻後、21-27波的彩金計價倍率；控制深追條件彩金。"],
    ["mathBossPayoutChanceTailScale","後續 BOSS 尾段計價率","倍率",.5,6,.001,"第2隻後、28-30波的彩金計價倍率；尾段樣本稀少，必須用正式模擬驗證。"],
    ["mathPayoutBand1","1-2 波彩金校正","倍率",.5,1.5,.001,"校正 1-2 波邊際 RTP。"],
    ["mathPayoutBand2","3-5 波彩金校正","倍率",.5,1.5,.001,"校正 3-5 波邊際 RTP。"],
    ["mathPayoutBand3","6-10 波彩金校正","倍率",.5,1.5,.001,"校正 6-10 波邊際 RTP。"],
    ["mathPayoutBand4","11-20 波彩金校正","倍率",.5,1.5,.001,"校正 11-20 波邊際 RTP。"],
    ["mathPayoutBand5","21-30 波彩金校正","倍率",.5,1.5,.001,"校正 21-30 波邊際 RTP，避免越深追期望越高。"],
  ]],
  ["真錢返還池","economy-group",[
    ["mathTargetRtp","目標 RTP（檢核值）","比例",.5,.99,.001,"用來和入池配籤的加權平均比較；實際入池 RTP 由下方六段配籤決定。"],
    ["mathPoolEnabled","個人返還池模式","0/1",0,1,1,"每位玩家使用獨立帳本，跨局延續且不與其他玩家共用；正式環境必須由伺服器保存。"],
    ["mathPoolMaxPayoutMul","單局最大曝險","該局總 BET 倍",1,500,1,"成功結算的最高倍數；實際彩金仍不得超過個人池當下可用餘額。"],
  ]],
  ["RTP 實跑驗證","economy-group",[
    ["mathTolerancePct","策略 RTP 容許差","百分點",0,20,.1,"五種合理 Build 在相同 BET、Collect 規則下允許的最大 RTP 差距。"],
    ["mathBuildInfluence","Build 推進影響","比例",0,1,.01,"越高代表強 Build 的預估通關率越高；獎金會按風險反向定價，不直接指定戰鬥輸贏。"],
    ["mathBossPenalty","BOSS 風險扣減","比例",0,.8,.01,"只修正 BOSS 波的預估通關率與獎金定價，不改變怪物或戰鬥結果。"],
    ["mathFirstWaveClearChance","第一波預估通關率","比例",.01,.999,.001,"用於第一波彩金定價；實際輸贏仍由基地 HP 與戰鬥決定。"],
    ["mathClearBand1","1-2 波預估通關率","比例",.01,.999,.001,"新手熟悉期的風險定價基準。"],
    ["mathClearBand2","3-5 波預估通關率","比例",.01,.999,.001,"首王與展開期的風險定價基準。"],
    ["mathClearBand3","6-10 波預估通關率","比例",.01,.999,.001,"主戰場的風險定價基準。"],
    ["mathClearBand4","11-20 波預估通關率","比例",.01,.999,.001,"深追區的風險定價基準。"],
    ["mathClearBand5","21-30 波預估通關率","比例",.01,.999,.001,"極深追區的風險定價基準。"],
  ]],
  ["BOSS 倍率權重","boss-group",[
    ["bossLowWeight","低倍率權重","",0,100,1,"越高越常抽到低倍率區間。"],["bossMidWeight","中倍率權重","",0,100,1,"越高越常抽到中倍率區間。"],["bossHighWeight","高倍率權重","",0,100,1,"越高越常抽到高倍率區間。"],
    ["bossLowMin","低倍率下限","加成",0,10,.1,"最終倍率 = 1 + 加成。"],["bossLowMax","低倍率上限","加成",0,10,.1,"低倍率區間上限。"],["bossMidMin","中倍率下限","加成",0,10,.1,"中倍率區間下限。"],["bossMidMax","中倍率上限","加成",0,10,.1,"中倍率區間上限。"],["bossHighMin","高倍率下限","加成",0,20,.1,"高倍率區間下限。"],["bossHighMax","高倍率上限","加成",0,20,.1,"高倍率區間上限。"],
  ]],
  ["BOSS 出現與 BET","player-group",[
    ["bossFirstMinWave","首隻BOSS起抽波","波",1,10,1,"從此波起，每波都有機會出現首隻BOSS。"],["bossFirstChance","首王起始機率","%",0,100,1,"首個可出現波次的機率。"],["bossFirstChanceInc","首王每波增率","%",0,100,1,"首王未出現時，每波增加的機率。"],["bossFirstChanceCap","首王機率上限","%",0,100,1,"首王單波最高出現機率，不是保證波。"],
    ["bossShieldHpPct","階段裝甲值","最大HP %",0,50,.5,"BOSS 每個階段開始時生成的裝甲值；裝甲是實際戰鬥狀態。"],["bossShieldDamageMul","裝甲期間承傷","倍",0,2,.01,"裝甲存在時，實際扣除 BOSS HP 的傷害倍率。"],["bossBreakDamageMul","破防期間承傷","倍",1,5,.01,"BREAK 窗口內的實際傷害倍率。"],["bossBreakDuration","破防時間","秒",.2,10,.1,"每次打破裝甲後的高傷害窗口。"],["bossEnrageHpPct","狂暴血量門檻","HP %",0,100,1,"BOSS 低於此血量時提高攻擊頻率。"],["bossEnrageAttackSpeedMul","狂暴攻速","倍",1,4,.05,"進入狂暴後，BOSS 攻擊頻率提高的倍率。"],
    ["bossBreakAttackPause","破甲攻擊硬直","秒",0,10,.05,"裝甲被打破後，BOSS 暫停移動與攻擊的時間。"],["bossAttackWindup","攻擊蓄力時間","秒",.1,5,.05,"BOSS 每次傷害基地前的可見蓄力時間。"],["bossAttackIntervalJitterPct","攻擊間隔起伏","%",0,80,1,"每次攻擊間隔在正負此比例內變動，避免節奏完全線性。"],["bossPreludeCountMul","王波前置怪數","一般波比例",.1,1,.05,"BOSS 波前置小怪數量 = 一般波抽中數量 × 本值；場上剩2隻以下時王進場。"],["bossFirstAtkMul","首王攻擊係數","倍",.1,2,.01,"第一隻 BOSS 的基地傷害倍率，後續 BOSS 不套用。"],
    ["bossFirstRewardMul","首王倍率係數","倍",0,2,.05,"只縮放第一隻BOSS開出的加成倍率，最低仍為+1.0。"],["bossLaterRewardMul","後續BOSS倍率係數","倍",0,2,.05,"只縮放第二隻以後BOSS的加成倍率，最低仍為+1.0。"],["bossFirstDifficultyCompression","首王難度差距","比例",0,1,.05,"0代表首王各難度都接近1倍；1代表完整使用後段難度差距。"],["bossChanceMul","BOSS出現率倍率","倍",0,3,.05,"套在累積權重上。"],["bossChanceCap","BOSS出現率上限","%",0,100,1,"單波最高機率。"],["bossRollDuration","BOSS倍率表演時間","秒",2.5,8,.1,"不受2倍或3倍加速影響，包含快速跳動、減速與鎖定。"],["bossRollHighThreshold","高倍表演門檻","加成倍數",1,8,.1,"單隻BOSS開出的加成達此值時，使用強化光效、震動與音效。"],["bossRollJackpotThreshold","大獎表演門檻","加成倍數",1,8,.1,"單隻BOSS開出的加成達此值時，使用最高強度表演。"],["bossBetStepMul","每隻BOSS後BET階梯","倍",1,3,.05,"每擊殺一隻BOSS，後續BET增加（此值-1）；與深追最低倍率取較高者，不再相乘。"],["preBossRewardMul","首王前彩金倍率","倍",0,3,.05,"首王擊殺前的一般波彩金加成，讓新手首王前也能累積有感POT。"],["postBossRewardFunding","王後一般波彩金回補","比例",0,1,.05,"擊殺BOSS後，提高的BET有多少比例回到一般波POT；越低越能控制倍率放大後的深追RTP。"],["betMidMul","11-20波BET最低倍率","倍",1,5,.05,"進入11-20波時的BET最低倍率；不與BOSS階梯相乘。"],["betDeepMul","21波後BET最低倍率","倍",1,8,.05,"進入21波後BET最低倍率；不與BOSS階梯相乘。"],["baseHp","基地HP","HP",100,5000,50,"每局開始基地血量。"],
  ]],
  ["波次屬性偏向","player-group",[
    ["waveAttrBiasEarly","前2波無屬性偏向","比例",0,1,.01,"前兩波怪物採用無屬性弱點的機率。"],["waveAttrBias","第3波後主屬性偏向","比例",0,1,.01,"其餘波次怪物採用當波主弱點的機率。"],
  ]],
  ["評估假設","economy-group",[
    ["modelBossKillRate","BOSS擊殺率假設","比例",0,1,.01,"用於RTP粗估，不影響遊戲。"],["modelClearRate10","10波RTP校準係數","比例",0,1,.01,"合併過關與條件收益的校準值，不等同實際通關率。"],["modelClearRate20","20波RTP校準係數","比例",0,1,.01,"合併過關與條件收益的校準值，不等同實際通關率。"],["modelClearRate30","30波RTP校準係數","比例",0,1,.01,"合併過關與條件收益的校準值，不等同實際通關率。"],
  ]],
  ["全域倍率","system-group",[
    ["wave1MinionAtkMul","第一波小怪攻擊","倍",0,2,.05,"只套在第一波一般小怪上，避免熟悉期被快速磨血。"],
    ["minionHpMul","小怪血量倍率","倍",.1,5,.05,"實際小怪HP = 怪物類型HP × 波次HP倍率 × 本值。"],["minionAtkMul","小怪攻擊倍率","倍",.1,5,.05,"實際小怪攻擊 = 怪物類型攻擊 × 本值；第1波再乘首波係數。"],["minionSpeedMul","小怪移速倍率","倍",.1,3,.05,"實際小怪移速 = 怪物類型移速 × 本值，仍受類型上限限制。"],["eliteHpMul","菁英血量倍率","倍",.1,8,.05,"實際菁英HP = 菁英類型HP × 波次HP倍率 × 本值。"],["eliteAtkMul","菁英攻擊倍率","倍",.1,8,.05,"實際菁英攻擊 = 菁英類型攻擊 × 本值。"],["bossFirstHpMul","首隻BOSS血量倍率","倍",.1,10,.05,"首王HP = BOSS類型HP × 波次倍率 × 難度倍率 × 本值。"],["bossHpMul","後王相對首王血量","倍",.1,3,.01,"第二隻BOSS相對首王基礎血量的比例；BOSS本體血量仍在怪物類型表調整。"],["bossHpPerOrdinalMul","每隻後王血量成長","倍",1,2,.01,"第三隻起，每多一隻BOSS再乘上的血量成長。"],["bossAtkMul","BOSS攻擊倍率","倍",.1,10,.05,"所有BOSS攻擊先乘本值；首王再乘首王攻擊係數。"],["bossSpeedMul","BOSS移速倍率","倍",.1,3,.05,"實際BOSS移速 = 類型移速 × 難度倍率 × 本值。"],["moneyMul","整波彩金倍率","倍",0,5,.05,"已停用；數值已合併到波次彩金表。"],["deepMoneyRamp","11波後每波彩金成長","比例",0,1,.01,"第11波起，每深入一波增加的整波彩金倍率。"],["deepMoneyCap","深追彩金倍率上限","倍",0,10,.1,"限制深追整波彩金成長的最高倍率。"],["eliteMoneyMul","菁英分配權重倍率","倍",0,8,.05,"只影響菁英分到整波彩金的比例，不增加總彩金。"],["dropChanceMul","小怪分配權重倍率","倍",0,3,.05,"只影響各類小怪分到整波彩金的比例。"],["expMul","EXP倍率","倍",.1,5,.05,"已停用；直接使用EXP表。"],["towerDamageMul","砲台全域傷害倍率","倍",.1,8,.05,"已停用；直接使用塔數值表。"],
    ["spawnInterval","生成間隔","秒",.08,2,.01,"每隻一般怪生成的間隔；越低怪群越集中。"],
    ["deepMoneyBase","11波起始彩金倍率","倍",0,5,.05,"第11波進入深追時套用的整波彩金倍率。"],
  ]],
];
PARAM_GROUPS.unshift([
  "深追倍率分布",
  "economy-group",
  [
    ["mathCarryShapeEnabled", "啟用等期望重排", "0/1", 0, 1, 1, "先算出原水池可配置平均彩金，再重排成倍率維持、上升與下降；不增加平均RTP。"],
    ["mathCarryAnchorChance", "維持原倍率機率", "通關分支比例", .05, .95, .01, "符合門檻時，通關後落在進場前回收倍率附近的基礎機率；其餘機率依公平平均自動形成上升或下降。"],
    ["mathCarryMinReturn", "啟用回收倍率門檻", "總回收 / 總BET", 0, 10, .05, "進場前回收倍率達到此值才做倍率重排；預設1x，前期仍可能直接贏到高倍。"],
    ["mathPoolTemporaryDeficitEnabled", "允許重排暫時責任", "0/1", 0, 1, 1, "只為支付同一平均值內的上升分支建立暫時責任；下降分支與後續入水回收，長期配置RTP不變。"],
  ],
]);
PARAM_GROUPS.unshift([
  "個人水池釋放",
  "economy-group",
  [
    ["mathPoolReleaseRate", "前段一般波釋放", "比例", 0, 1, .01, "第一波可動用個人池舊餘額的比例；之後隨波次逐步提高。"],
    ["mathPoolDeepReleaseRate", "深追一般波釋放", "比例", 0, 1, .01, "達到深追坡道後，一般波最多可動用的舊餘額比例。"],
    ["mathPoolDepthRampWaves", "釋放成長波數", "波", 1, 30, 1, "從第1波到本值+1波，釋放率由前段值線性成長至深追值。"],
    ["mathPoolFirstBossOutcomeCapMul", "首王單次回收上限", "總BET倍數", 1, 100, .05, "限制首王單次可釋放的歷史BOSS子池；平均仍由強獎機率與個人池餘額控制。"],
    ["mathPoolBossCarryRecycleRate", "跨局BOSS預算成熟", "比例/新局", 0, 1, .01, "未在上一局釋放的BOSS子池，每開新局有多少解除用途限制；確保固定早收手的長期RTP也能收斂。"],
    ["mathPoolFirstBossReleaseRate", "首王強獎釋放", "比例", 0, 1, .01, "首隻BOSS命中強獎時可動用的舊餘額比例。"],
    ["mathPoolLaterBossReleaseRate", "後王前段釋放", "比例", 0, 1, .01, "第二隻後BOSS在前段命中強獎時的舊餘額釋放起點。"],
    ["mathPoolBossReleaseRate", "深追BOSS釋放", "比例", 0, 1, .01, "後段BOSS強獎可動用的舊餘額上限。"],
  ],
]);
PARAM_GROUPS.unshift([
  "RTP 預算拆分",
  "economy-group",
  [
    ["mathGeneralRtpShare", "一般波 RTP 預算", "比例", 0, .99, .01, "每筆 BET 用於一般波彩金定價的長期期望預算。"],
    ["mathBossRtpShare", "BOSS RTP 預算", "比例", 0, .99, .01, "每筆 BET 保留給 BOSS 倍率與高倍後續波次的長期期望預算。"],
    ["mathPoolStrongWinChance", "前段BOSS強獎機率", "比例", 0, 1, .01, "前段BOSS進入集中釋放分支的機率；只重新分配個人水池，不增加RTP。"],
    ["mathPoolStrongWinDeepChance", "深追BOSS強獎機率", "比例", 0, 1, .01, "深追BOSS進入集中釋放分支的機率；由前段值平滑成長，只改派彩時機與VI。"],
    ["mathPoolStrongWinEarlyFloorMul", "前段BOSS強獎底線", "總BET倍數", 1, 20, .05, "前段BOSS強獎最低嘗試回收；隨深度成長。"],
    ["mathPoolStrongWinFloorMul", "深追BOSS強獎底線", "總BET倍數", 1, 20, .1, "深追BOSS強獎最低嘗試回收，仍受個人池可用預算限制。"],
    ["mathPoolWeakBossCapMul", "BOSS 弱獎上限", "總BET倍數", 0, 5, .05, "非強獎分支的當局回收上限，未派預算保留到後續遊戲。"],
    ["mathPoolWeakBossReleaseRate", "BOSS 弱獎餘額釋放", "比例", 0, 1, .01, "非強獎分支額外釋放個人水池餘額的比例。"],
    ["mathPoolHotWaveEarlyFloorMul", "前段熱波回收底線", "總BET倍數", 1, 10, .05, "前段抽中熱波時最低嘗試回收；避免大獎全擠在前兩波。"],
    ["mathPoolHotWaveFloorMul", "深追熱波回收底線", "總BET倍數", 1, 10, .1, "深追抽中一般波熱波時嘗試集中釋放到此倍數。"],
    ["mathPoolHotWaveDeepWeight", "深追熱波權重", "權重", 0, 100, 1, "熱波權重由一般波彩金表的前段值逐步移到本值；每波都重新正規化期望值，因此只改VI、不增加RTP。"],
    ["mathPoolHotWaveEarlyReleaseRate", "前段熱波餘額釋放", "比例", 0, 1, .01, "前段熱波可動用舊餘額的比例。"],
    ["mathPoolHotWaveReleaseRate", "深追熱波餘額釋放", "比例", 0, 1, .01, "深追熱波可動用舊餘額的比例。"],
  ],
]);
const BOSS_EMOTION_KEYS = new Set([
  "bossLowWeight", "bossMidWeight", "bossHighWeight",
  "bossLowMin", "bossLowMax", "bossMidMin", "bossMidMax", "bossHighMin", "bossHighMax",
  "bossFirstMinWave", "bossFirstChance", "bossFirstChanceInc", "bossFirstChanceCap",
  "bossFirstRewardMul", "bossLaterRewardMul", "bossFirstDifficultyCompression",
  "bossChanceCap", "bossBetStepMul", "betMidMul", "betDeepMul",
  "bossFirstHpMul", "bossHpMul", "bossHpPerOrdinalMul", "bossAtkMul", "bossSpeedMul",
  "bossShieldHpPct", "bossShieldDamageMul", "bossBreakDamageMul", "bossBreakDuration",
  "bossBreakAttackPause", "bossAttackWindup", "bossAttackIntervalJitterPct",
  "bossPreludeCountMul", "bossFirstAtkMul", "bossEnrageHpPct", "bossEnrageAttackSpeedMul",
]);
const POOL_PARAM_KEYS = new Set([
  "mathTargetRtp", "mathPoolEnabled", "mathGeneralRtpShare", "mathBossRtpShare", "mathCarryShapeEnabled", "mathCarryAnchorChance", "mathCarryMinReturn", "mathPoolTemporaryDeficitEnabled", "mathPoolStrongWinChance", "mathPoolStrongWinDeepChance", "mathPoolStrongWinEarlyFloorMul", "mathPoolStrongWinFloorMul", "mathPoolWeakBossCapMul", "mathPoolWeakBossReleaseRate", "mathPoolHotWaveEarlyFloorMul", "mathPoolHotWaveFloorMul", "mathPoolHotWaveDeepWeight", "mathPoolHotWaveEarlyReleaseRate", "mathPoolHotWaveReleaseRate", "mathCheckpointRepriceEnabled", "mathCheckpointMinChance", "mathRerollEntryEnabled",
  "mathBossFirstBaseChance", "mathBossLaterBaseChance", "mathBossOrdinalPenalty",
  "mathBossBuildInfluence", "mathBossLaterBuildInfluence",
  "mathSingleTowerChanceShift", "mathAreaTowerChanceShift", "mathControlTowerChanceShift",
  "mathBossPayoutChanceScale", "mathBossPayoutChanceMidScale", "mathBossPayoutChanceDeepScale",
  "mathBossPayoutChanceUltraScale", "mathBossPayoutChanceTailScale",
  "mathPoolReleaseRate", "mathPoolDeepReleaseRate", "mathPoolDepthRampWaves", "mathPoolFirstBossOutcomeCapMul", "mathPoolBossCarryRecycleRate", "mathPoolBossReleaseRate", "mathPoolFirstBossReleaseRate", "mathPoolLaterBossReleaseRate",
]);
const POOL_ENTRY_TIERS = Array.from({ length:6 }, (_, index) => {
  const tier = index + 1;
  return { tier, mulKey:`mathPoolEntryTier${tier}Mul`, weightKey:`mathPoolEntryTier${tier}Weight` };
});
const BOSS_EMOTION_GROUPS = PARAM_GROUPS
  .map(([title, className, rows]) => [
    title === "全域倍率" ? "BOSS 戰鬥成長" : title,
    className === "system-group" ? "boss-group" : className,
    rows.filter(([key]) => BOSS_EMOTION_KEYS.has(key)),
  ])
  .filter(([, , rows]) => rows.length);
const POOL_PARAM_GROUPS = PARAM_GROUPS
  .map(([title, className, rows]) => [title, className, rows.filter(([key]) => POOL_PARAM_KEYS.has(key))])
  .filter(([, , rows]) => rows.length);
const UPGRADE_ROWS = [
  ["upgradeDamage40","傷害+40%係數","倍",1,3,.05,"表中傷害+40%的實際倍率。"],["upgradeDamage35","傷害+35%係數","倍",1,3,.05,"表中傷害+35%的實際倍率。"],["upgradeDamage30","傷害+30%係數","倍",1,3,.05,"表中傷害+30%的實際倍率。"],["upgradeRate25","攻速+25%係數","倍",1,3,.05,"表中攻速+25%的實際倍率。"],["upgradeRate20","攻速+20%係數","倍",1,3,.05,"表中攻速+20%的實際倍率。"],["upgradeRange25","範圍+25%係數","倍",1,3,.05,"表中範圍+25%的實際倍率。"],["upgradeDuration50","時間+50%係數","倍",1,4,.05,"持續時間、控場時間類+50%。"],["upgradeDotDamage100","燃燒/中毒傷害+100%係數","倍",1,5,.05,"持續傷害加深倍率。"],["upgradeExtraChain","閃電彈跳增加數","次",0,10,1,"彈跳數+3的實際增加值。"],["upgradePathDamage","路徑傷害","傷害",0,300,1,"閃電路徑傷害解鎖值。"],["upgradeVulnerable15","易傷增加值","比例",0,1,.01,"易傷+15%的實際值。"],["upgradeSlow25","緩速強度","比例",0,1,.01,"緩速25%的實際值。"],
];
const COLLECT_POLICY_TEMPLATES = [
  { id:"humanConservative", label:"真人｜保守", probabilities:[.06,.13,.24,.46,.66,.84,.93,.975,.992], hp:[.28,.18,.07], bossKill:.16, danger:.08, wave10:.04, wave20:.10, note:"較早鎖定獲利，深度與VI偏低。" },
  { id:"humanBalanced", label:"真人｜平衡", probabilities:[.03,.07,.14,.31,.49,.70,.84,.93,.98], hp:[.28,.18,.07], bossKill:.12, danger:.16, wave10:.04, wave20:.07, note:"兼顧獲利與追深，作為主要真人基準。" },
  { id:"humanChaser", label:"真人｜追高", probabilities:[.012,.03,.07,.16,.30,.50,.69,.84,.95], hp:[.28,.18,.07], bossKill:.08, danger:.24, wave10:.02, wave20:.04, note:"較常追到BOSS與高倍，死亡及VI較高。" },
  { id:"humanGreedyChaser", label:"真人｜深追貪心", probabilities:[.003,.008,.02,.05,.10,.18,.30,.52,.82], hp:[.18,.10,.03], bossKill:.04, danger:.28, wave10:.01, wave20:.06, note:"壓低中低倍收手，專門驗證深追2x／5x與尾端死亡風險。" },
];

const ui = {
  rewardBody:document.getElementById("rewardTableBody"), bossEmotionBody:document.getElementById("bossEmotionTableBody"), bossDifficultyBody:document.getElementById("bossDifficultyTableBody"), monsterBody: document.getElementById("monsterTableBody"), templateBody: document.getElementById("templateTableBody"), bandBody: document.getElementById("bandTableBody"), waveBody: document.getElementById("waveTableBody"), expBody: document.getElementById("expTableBody"), heroGlobalBody:document.getElementById("heroGlobalTableBody"), heroBody:document.getElementById("heroTableBody"), towerBody: document.getElementById("towerTableBody"), upgradeBody: document.getElementById("upgradeCoefTableBody"), upgradeOptions: document.getElementById("upgradeOptionTables"), upgradeSummaryBody: document.getElementById("upgradeSummaryBody"), rtpBody: document.getElementById("rtpTableBody"), towerScoreBody: document.getElementById("towerScoreBody"),
  apply: document.getElementById("applyBtn"), reset: document.getElementById("resetBtn"), export: document.getElementById("exportBtn"), import: document.getElementById("importBtn"), json: document.getElementById("jsonText"), status: document.getElementById("statusText"), bossAvg: document.getElementById("bossAvgText"), bossRange: document.getElementById("bossRangeText"), rewardAvg:document.getElementById("rewardAvgText"), bossDifficultyAvg:document.getElementById("bossDifficultyAvgText"), towerGap: document.getElementById("towerGapText"), towerGapNote: document.getElementById("towerGapNote"),
  rewardRtpBody:document.getElementById("rewardRtpBudgetBody"), bossRtpBody:document.getElementById("bossRtpBudgetBody"), rewardRtpTotal:document.getElementById("rewardRtpTotal"), bossRtpTotal:document.getElementById("bossRtpTotal"), rewardRtpMeta:document.getElementById("rewardRtpMeta"), bossRtpMeta:document.getElementById("bossRtpMeta"),
  poolParamBody:document.getElementById("poolParamTableBody"), poolLedgerLogicBody:document.getElementById("poolLedgerLogicBody"), poolTargetRtpInput:document.getElementById("poolTargetRtpInput"), poolHouseEdge:document.getElementById("poolHouseEdge"), poolContributionPreview:document.getElementById("poolContributionPreview"), poolConservation:document.getElementById("poolConservation"),
  poolEntryBody:document.getElementById("poolEntryTableBody"), poolEntryRtp:document.getElementById("poolEntryRtp"), poolEntryGap:document.getElementById("poolEntryGap"), poolEntryProfitChance:document.getElementById("poolEntryProfitChance"), poolEntrySd1:document.getElementById("poolEntrySd1"), poolEntrySd5:document.getElementById("poolEntrySd5"), poolEntrySd10:document.getElementById("poolEntrySd10"), poolEntrySd20:document.getElementById("poolEntrySd20"),
  collectPolicyBody:document.getElementById("collectPolicyTableBody"),
  logicTargetRtp:document.getElementById("logicTargetRtp"), logicActualRtp:document.getElementById("logicActualRtp"), logicHouseEdge:document.getElementById("logicHouseEdge"), logicPoolMode:document.getElementById("logicPoolMode"), logicPipeline:document.getElementById("logicPipeline"), logicFormulaBody:document.getElementById("logicFormulaBody"), logicParameterBody:document.getElementById("logicParameterBody"), logicSearch:document.getElementById("logicSearch"),
  tabs: Array.from(document.querySelectorAll(".tab")), panels: {}
};
ui.tabs.forEach(tab => ui.panels[tab.dataset.tab] = document.getElementById(`${tab.dataset.tab}Tab`));

let params = loadParams();
let channel = null;
try { channel = new BroadcastChannel(PARAM_CHANNEL); } catch {}

function loadParams() { try { return cleanParams(migrateBossParams(JSON.parse(localStorage.getItem(PARAM_STORAGE_KEY) || "{}"))); } catch { return cleanParams(); } }
function migrateBossParams(input={}) {
  const next = { ...input };
  if (!Object.prototype.hasOwnProperty.call(input, "bossFirstMinWave")) {
    [
      "bossLowWeight", "bossMidWeight", "bossHighWeight",
      "bossLowMin", "bossLowMax", "bossMidMin", "bossMidMax", "bossHighMin", "bossHighMax",
      "bossHpMul", "bossAtkMul", "bossSpeedMul"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
  }
  if ((Number(input.balanceRevision) || 0) < 1) {
    if (!Object.prototype.hasOwnProperty.call(input, "moneyMul") || Number(input.moneyMul) === 1.2) next.moneyMul = DEFAULT_PARAMS.moneyMul;
    if (!Object.prototype.hasOwnProperty.call(input, "bossFirstHpMul") || Number(input.bossFirstHpMul) === 1.45) next.bossFirstHpMul = DEFAULT_PARAMS.bossFirstHpMul;
    if (!Object.prototype.hasOwnProperty.call(input, "bossFirstRewardMul") || Number(input.bossFirstRewardMul) === .75) next.bossFirstRewardMul = DEFAULT_PARAMS.bossFirstRewardMul;
    if (!Object.prototype.hasOwnProperty.call(input, "modelBossKillRate") || Number(input.modelBossKillRate) === .33) next.modelBossKillRate = DEFAULT_PARAMS.modelBossKillRate;
    next.balanceRevision = 1;
  }
  if ((Number(input.balanceRevision) || 0) < 2) return { ...DEFAULT_PARAMS, balanceRevision:29 };
  if ((Number(input.balanceRevision) || 0) < 3) {
    next.wave_1_hpMul = DEFAULT_PARAMS.wave_1_hpMul;
    next.wave_2_hpMul = DEFAULT_PARAMS.wave_2_hpMul;
    next.balanceRevision = 3;
  }
  if ((Number(input.balanceRevision) || 0) < 4) return { ...DEFAULT_PARAMS, balanceRevision:29 };
  if ((Number(input.balanceRevision) || 0) < 5) {
    next.modelClearRate10 = DEFAULT_PARAMS.modelClearRate10;
    next.modelClearRate20 = DEFAULT_PARAMS.modelClearRate20;
    next.balanceRevision = 5;
  }
  if ((Number(input.balanceRevision) || 0) < 6) {
    ["moneyMul", "deepMoneyBase", "deepMoneyRamp", "deepMoneyCap", "spawnInterval", "betMidMul", "tower_cryo_minionMul", "tower_laser_minionMul"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 6;
  }
  if ((Number(input.balanceRevision) || 0) < 7) {
    next.modelClearRate10 = DEFAULT_PARAMS.modelClearRate10;
    next.modelClearRate20 = DEFAULT_PARAMS.modelClearRate20;
    next.balanceRevision = 7;
  }
  if ((Number(input.balanceRevision) || 0) < 8) {
    [
      ...WAVE_REWARD_TIERS.flatMap(([, , weightKey, mulKey]) => [weightKey, mulKey]),
      ...BOSS_DIFFICULTY_TIERS.flatMap(([, , weightKey, hpKey, atkKey, speedKey]) => [weightKey, hpKey, atkKey, speedKey]),
      "deepMoneyBase", "deepMoneyRamp", "deepMoneyCap", "bossHpMul", "modelBossKillRate", "modelClearRate20"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 8;
  }
  if ((Number(input.balanceRevision) || 0) < 9) {
    [
      "bossFirstHpMul", "bossFirstRewardMul", "bossLaterRewardMul", "moneyMul", "modelBossKillRate",
      "bossDiffEasyWeight", "bossDiffNormalWeight", "bossDiffHardWeight", "bossDiffBrutalWeight"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 9;
  }
  if ((Number(input.balanceRevision) || 0) < 10) {
    next.moneyMul = DEFAULT_PARAMS.moneyMul;
    next.balanceRevision = 10;
  }
  if ((Number(input.balanceRevision) || 0) < 11) {
    [
      "bossFirstRewardMul", "bossLaterRewardMul", "bossFirstHpMul", "bossHpMul", "postBossRewardFunding", "modelBossKillRate",
      "tower_cryo_minionMul", "tower_cryo_bossMul", "tower_laser_minionMul", "tower_laser_bossMul",
      "tower_gas_bossMul", "tower_needle_minionMul", "tower_needle_splash",
      "tower_trap_damage", "tower_trap_rate", "tower_trap_minionMul", "tower_trap_eliteMul"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 11;
  }
  if ((Number(input.balanceRevision) || 0) < 12) {
    ["bossFirstRewardMul", "bossLaterRewardMul", "postBossRewardFunding", "modelClearRate10", "modelClearRate20"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 12;
  }
  if ((Number(input.balanceRevision) || 0) < 13) {
    next.balanceRevision = 13;
  }
  if ((Number(input.balanceRevision) || 0) < 14) {
    [
      "bossFirstRewardMul", "bossFirstHpMul", "preBossRewardMul",
      "bossFirstDiffEasyWeight", "bossFirstDiffNormalWeight", "bossFirstDiffHardWeight", "bossFirstDiffBrutalWeight",
      "bossFirstDifficultyCompression", "tower_cryo_bossMul", "tower_laser_bossMul", "tower_needle_bossMul",
      "modelBossKillRate", "modelClearRate10", "modelClearRate20", "modelClearRate30"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 14;
  }
  if ((Number(input.balanceRevision) || 0) < 15) {
    ["bossFirstRewardMul", "preBossRewardMul", "modelBossKillRate", "modelClearRate10", "modelClearRate20", "modelClearRate30"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 15;
  }
  if ((Number(input.balanceRevision) || 0) < 16) {
    ["bossRollDuration", "bossRollHighThreshold", "bossRollJackpotThreshold"].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 16;
  }
  if ((Number(input.balanceRevision) || 0) < 17) next.balanceRevision = 17;
  if ((Number(input.balanceRevision) || 0) < 18) {
    ["mathModelEnabled", "mathTargetRtp", "mathTolerancePct", "mathBuildInfluence", "mathBossPenalty", "mathMinClearChance", "mathMaxClearChance", "mathClearBand1", "mathClearBand2", "mathClearBand3", "mathClearBand4", "mathClearBand5"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 18;
  }
  if ((Number(input.balanceRevision) || 0) < 19) {
    [
      "mathModelEnabled", "moneyMul", "minionHpMul",
      "tower_flame_bossMul", "tower_grenade_bossMul", "tower_cryo_minionMul", "tower_cryo_bossMul",
      "tower_frostbomb_damage", "tower_frostbomb_bossMul", "tower_laser_minionMul", "tower_laser_bossMul",
      "tower_chain_bossMul", "tower_gas_bossMul", "tower_needle_minionMul", "tower_needle_bossMul",
      "tower_trap_damage", "tower_trap_bossMul"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 19;
  }
  if ((Number(input.balanceRevision) || 0) < 20) {
    next.moneyMul = DEFAULT_PARAMS.moneyMul;
    next.balanceRevision = 20;
  }
  if ((Number(input.balanceRevision) || 0) < 21) {
    next.moneyMul = DEFAULT_PARAMS.moneyMul;
    next.balanceRevision = 21;
  }
  if ((Number(input.balanceRevision) || 0) < 22) {
    ["moneyMul", "tower_flame_bossMul", "tower_grenade_bossMul", "tower_chain_bossMul", "tower_gas_bossMul"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 22;
  }
  if ((Number(input.balanceRevision) || 0) < 23) {
    [
      "bossFirstRewardMul", "bossLaterRewardMul", "bossChanceMul", "bossFirstHpMul", "bossHpMul",
      "tower_flame_damage", "tower_flame_minionMul", "tower_flame_eliteMul",
      "tower_grenade_damage", "tower_grenade_splash", "tower_grenade_minionMul", "tower_grenade_eliteMul", "tower_grenade_bossMul",
      "tower_frostbomb_damage", "tower_frostbomb_splash", "tower_frostbomb_minionMul", "tower_frostbomb_eliteMul", "tower_frostbomb_bossMul",
      "tower_laser_damage", "tower_laser_minionMul", "tower_laser_eliteMul", "tower_laser_bossMul",
      "tower_chain_damage", "tower_chain_minionMul", "tower_chain_eliteMul", "tower_chain_bossMul",
      "tower_gas_damage", "tower_gas_splash", "tower_gas_duration", "tower_gas_minionMul", "tower_gas_eliteMul", "tower_gas_bossMul",
      "tower_needle_damage", "tower_needle_splash", "tower_needle_minionMul", "tower_needle_eliteMul", "tower_needle_bossMul",
      "tower_blade_damage", "tower_blade_rate", "tower_blade_minionMul", "tower_blade_eliteMul", "tower_blade_bossMul",
      "tower_trap_damage", "tower_trap_rate", "tower_trap_splash", "tower_trap_duration", "tower_trap_minionMul", "tower_trap_eliteMul", "tower_trap_bossMul"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 23;
  }
  if ((Number(input.balanceRevision) || 0) < 24) {
    ["moneyMul","tower_flame_damage","tower_grenade_damage","tower_cryo_damage","tower_laser_damage","tower_chain_damage","tower_blade_damage"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 24;
  }
  if ((Number(input.balanceRevision) || 0) < 25) {
    ["moneyMul","tower_flame_damage","tower_grenade_damage","tower_cryo_damage","tower_frostbomb_damage","tower_laser_damage","tower_chain_damage","tower_gas_damage","tower_needle_damage","tower_trap_damage"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 25;
  }
  if ((Number(input.balanceRevision) || 0) < 26) {
    next.mathModelEnabled = DEFAULT_PARAMS.mathModelEnabled;
    next.balanceRevision = 26;
  }
  if ((Number(input.balanceRevision) || 0) < 27) {
    Object.keys(DEFAULT_PARAMS).filter(key => key.startsWith("hero"))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 27;
  }
  if ((Number(input.balanceRevision) || 0) < 28) {
    ["mathLossHpMul", "mathLossAtkMul", "mathLossSpeedMul"].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 28;
  }
  if ((Number(input.balanceRevision) || 0) < 29) {
    ["mathLossHpMul", "mathLossAtkMul", "mathLossSpeedMul"].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 29;
  }
  if ((Number(input.balanceRevision) || 0) < 30) {
    ["mathBuildInfluence", "mathBossPenalty", "mathClearBand1", "mathClearBand2", "mathClearBand3", "mathClearBand4", "mathClearBand5"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 30;
  }
  if ((Number(input.balanceRevision) || 0) < 31) {
    ["heroDamageUpgradePct", "heroRateUpgradePct", "heroQuantityUpgrade", "heroQuantityEveryLevels"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 31;
  }
  if ((Number(input.balanceRevision) || 0) < 32) {
    Object.keys(DEFAULT_PARAMS).filter(key => key.startsWith("upgradeVal_"))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 32;
  }
  if ((Number(input.balanceRevision) || 0) < 33) {
    ["mathLossSpeedMul", "waveAttrBiasEarly", "waveAttrBias"].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 33;
  }
  if ((Number(input.balanceRevision) || 0) < 34) {
    ["heroDamageUpgradePct", "heroRateUpgradePct", "heroFirstUpgradeQuantity", "wave1MinionAtkMul", "mathFirstWaveClearChance"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 34;
  }
  if ((Number(input.balanceRevision) || 0) < 35) {
    Object.keys(DEFAULT_PARAMS).filter(key => key.startsWith("hero_")).forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 35;
  }
  if ((Number(input.balanceRevision) || 0) < 36) {
    ["mathBuildInfluence", "mathBossPenalty", "mathMinClearChance", "mathMaxClearChance", "mathFirstWaveClearChance", "mathClearBand1", "mathClearBand2", "mathClearBand3", "mathClearBand4", "mathClearBand5"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 36;
  }
  if ((Number(input.balanceRevision) || 0) < 37) {
    ["mathBuildInfluence", "mathBossPenalty", "mathMaxClearChance", "mathFirstWaveClearChance", "mathClearBand1", "mathClearBand2", "mathClearBand3", "mathClearBand4", "mathClearBand5"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 37;
  }
  if ((Number(input.balanceRevision) || 0) < 38) {
    ["mathBuildInfluence", "mathBossPenalty", "mathClearBand3", "mathClearBand4", "mathClearBand5"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 38;
  }
  if ((Number(input.balanceRevision) || 0) < 39) {
    next.mathBossPenalty = DEFAULT_PARAMS.mathBossPenalty;
    next.balanceRevision = 39;
  }
  if ((Number(input.balanceRevision) || 0) < 40) {
    next.mathBossPenalty = DEFAULT_PARAMS.mathBossPenalty;
    next.balanceRevision = 40;
  }
  if ((Number(input.balanceRevision) || 0) < 41) {
    next.mathBuildInfluence = DEFAULT_PARAMS.mathBuildInfluence;
    next.mathBossPenalty = DEFAULT_PARAMS.mathBossPenalty;
    next.balanceRevision = 41;
  }
  if ((Number(input.balanceRevision) || 0) < 42) {
    [
      "mathBuildInfluence", "mathBossPenalty", "mathPayoutCalibration",
      "mathPayoutBand1", "mathPayoutBand2", "mathPayoutBand3", "mathPayoutBand4", "mathPayoutBand5",
      "mathMinClearChance", "bossFirstHpMul", "bossHpMul"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 42;
  }
  if ((Number(input.balanceRevision) || 0) < 43) {
    ["mathBuildInfluence", "mathBossPenalty", "mathPayoutCalibration", "bossFirstHpMul", "bossHpMul"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 43;
  }
  if ((Number(input.balanceRevision) || 0) < 44) {
    next.mathBossPenalty = DEFAULT_PARAMS.mathBossPenalty;
    next.balanceRevision = 44;
  }
  if ((Number(input.balanceRevision) || 0) < 45) {
    ["mathBossPenalty", "mathMinClearChance"].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 45;
  }
  if ((Number(input.balanceRevision) || 0) < 46) {
    ["mathHpInfluence", "mathHpReference"].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 46;
  }
  if ((Number(input.balanceRevision) || 0) < 47) {
    ["mathHpInfluence", "mathHpReference"].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 47;
  }
  if ((Number(input.balanceRevision) || 0) < 48) {
    Object.keys(DEFAULT_PARAMS).filter(key => key.startsWith("mathHeroPower_") || key.startsWith("mathTowerBossPower_"))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 48;
  }
  if ((Number(input.balanceRevision) || 0) < 49) {
    [
      "mathHeroPower_fire", "mathHeroPower_poison", "mathTowerBossPower_flame",
      "mathTowerBossPower_laser", "mathTowerBossPower_chain", "mathTowerBossPower_needle",
      "mathTowerBossPower_blade", "mathTowerBossPower_trap"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 49;
  }
  if ((Number(input.balanceRevision) || 0) < 50) {
    [
      "mathHeroPower_fire", "mathHeroPower_poison", "mathHeroPower_neutral", "mathCoreRiskBonus",
      "mathTowerBossPower_grenade", "mathTowerBossPower_cryo", "mathTowerBossPower_frostbomb",
      "mathTowerBossPower_laser", "mathTowerBossPower_chain", "mathTowerBossPower_needle", "mathTowerBossPower_trap"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 50;
  }
  if ((Number(input.balanceRevision) || 0) < 51) {
    next.mathCoreRiskBonus = DEFAULT_PARAMS.mathCoreRiskBonus;
    next.balanceRevision = 51;
  }
  if ((Number(input.balanceRevision) || 0) < 52) {
    [
      "mathBossBuildInfluence", "mathMinionBuildInfluence", "mathPayoutCalibration",
      "mathHeroPower_fire", "mathHeroPower_poison", "mathHeroPower_neutral",
      "mathTowerBossPower_grenade", "mathTowerBossPower_cryo", "mathTowerBossPower_frostbomb",
      "mathTowerBossPower_laser", "mathTowerBossPower_chain", "mathTowerBossPower_needle", "mathTowerBossPower_trap"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 52;
  }
  if ((Number(input.balanceRevision) || 0) < 53) {
    [
      "mathHeroPower_fire", "mathHeroPower_ice", "mathHeroPower_electric", "mathHeroPower_poison", "mathHeroPower_neutral",
      "mathTowerBossPower_flame", "mathTowerBossPower_grenade", "mathTowerBossPower_cryo",
      "mathTowerBossPower_laser", "mathTowerBossPower_chain", "mathTowerBossPower_needle",
      "mathTowerBossPower_blade", "mathTowerBossPower_trap"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 53;
  }
  if ((Number(input.balanceRevision) || 0) < 54) {
    next.mathMinionBuildInfluence = DEFAULT_PARAMS.mathMinionBuildInfluence;
    next.balanceRevision = 54;
  }
  if ((Number(input.balanceRevision) || 0) < 55) {
    ["mathBossBuildInfluence", "mathMinionBuildInfluence"].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 55;
  }
  if ((Number(input.balanceRevision) || 0) < 56) {
    ["mathAreaBossRiskDiscount", "mathPayoutCalibration"].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 56;
  }
  if ((Number(input.balanceRevision) || 0) < 57) {
    [
      "mathMinionHpInfluence", "mathBossHpInfluence", "mathBossOrdinalPenalty",
      "bossFirstHpMul", "bossHpMul", "bossHpPerOrdinalMul"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 57;
  }
  if ((Number(input.balanceRevision) || 0) < 58) {
    [
      "mathBossPenalty", "mathPayoutBand1", "mathPayoutBand2", "mathPayoutBand3",
      "mathPayoutBand4", "mathPayoutBand5", "bossFirstHpMul"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 58;
  }
  if ((Number(input.balanceRevision) || 0) < 59) {
    [
      "mathBossOrdinalPenalty", "mathFirstBossDelayPenalty",
      "mathClearBand3", "mathClearBand4", "mathClearBand5"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 59;
  }
  if ((Number(input.balanceRevision) || 0) < 60) {
    ["mathFirstBossDelayPenalty", "mathFirstBossGuaranteePenalty"].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    Object.keys(DEFAULT_PARAMS).filter(key => /^wave_\d+_mathClear$/.test(key))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 60;
  }
  if ((Number(input.balanceRevision) || 0) < 61) {
    [
      "mathMinionBuildInfluence", "mathMinionHpInfluence",
      "mathBossOrdinalPenalty", "mathFirstBossGuaranteePenalty"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 61;
  }
  if ((Number(input.balanceRevision) || 0) < 62) {
    Object.keys(DEFAULT_PARAMS).filter(key => /^wave_\d+_mathClear$/.test(key))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 62;
  }
  if ((Number(input.balanceRevision) || 0) < 63) {
    Object.keys(DEFAULT_PARAMS).filter(key => /^wave_\d+_mathClear$/.test(key))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 63;
  }
  if ((Number(input.balanceRevision) || 0) < 64) {
    [
      "mathTargetRtp", "mathBossBuildInfluence", "mathAreaBossRiskDiscount",
      "mathBossOrdinalPenalty", "mathBossFirstBaseChance", "mathBossLaterBaseChance",
      "mathPayoutCalibration", "bossHpMul", "bossHpPerOrdinalMul",
      "mathHeroPower_fire", "mathHeroPower_ice", "mathHeroPower_electric",
      "mathHeroPower_poison", "mathHeroPower_neutral"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    Object.keys(DEFAULT_PARAMS).filter(key => /^wave_\d+_mathClear$/.test(key))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 64;
  }
  if ((Number(input.balanceRevision) || 0) < 65) {
    [
      "mathPayoutCalibration",
      "mathHeroPower_fire", "mathHeroPower_ice", "mathHeroPower_electric", "mathHeroPower_poison", "mathHeroPower_neutral",
      "mathTowerBossPower_flame", "mathTowerBossPower_grenade", "mathTowerBossPower_cryo", "mathTowerBossPower_frostbomb",
      "mathTowerBossPower_laser", "mathTowerBossPower_chain", "mathTowerBossPower_gas", "mathTowerBossPower_needle",
      "mathTowerBossPower_blade", "mathTowerBossPower_trap",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 65;
  }
  if ((Number(input.balanceRevision) || 0) < 66) {
    next.mathPayoutCalibration = DEFAULT_PARAMS.mathPayoutCalibration;
    next.balanceRevision = 66;
  }
  if ((Number(input.balanceRevision) || 0) < 67) {
    [
      "mathBossFirstBaseChance", "mathBossLaterBaseChance", "mathPayoutCalibration",
      "mathHeroPower_fire", "mathHeroPower_electric", "mathHeroPower_neutral", "mathCoreRiskBonus",
      "mathTowerBossPower_cryo", "mathTowerBossPower_laser", "mathTowerBossPower_chain",
      "mathTowerBossPower_needle", "mathTowerBossPower_trap", "bossHpMul", "bossHpPerOrdinalMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 67;
  }
  if ((Number(input.balanceRevision) || 0) < 68) {
    [
      "mathBossLaterBaseChance", "mathBossLaterBuildInfluence", "mathBossLaterHpInfluence", "mathBossOrdinalPenalty",
      "mathHeroPower_fire", "mathHeroPower_electric", "mathHeroPower_poison", "mathHeroPower_neutral", "mathCoreRiskBonus",
      "mathTowerBossPower_flame", "mathTowerBossPower_grenade", "mathTowerBossPower_cryo", "mathTowerBossPower_frostbomb",
      "mathTowerBossPower_laser", "mathTowerBossPower_chain", "mathTowerBossPower_gas", "mathTowerBossPower_needle",
      "mathTowerBossPower_trap", "bossHpPerOrdinalMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 68;
  }
  if ((Number(input.balanceRevision) || 0) < 69) {
    [
      "mathHeroPower_fire", "mathHeroPower_ice", "mathHeroPower_electric", "mathHeroPower_poison", "mathHeroPower_neutral",
      "mathCoreRiskBonus", "mathTowerBossPower_flame", "mathTowerBossPower_grenade", "mathTowerBossPower_cryo",
      "mathTowerBossPower_frostbomb", "mathTowerBossPower_laser", "mathTowerBossPower_chain", "mathTowerBossPower_gas",
      "mathTowerBossPower_needle", "mathTowerBossPower_trap",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 69;
  }
  if ((Number(input.balanceRevision) || 0) < 70) {
    [
      "mathPayoutCalibration", "mathHeroPower_fire", "mathHeroPower_ice", "mathHeroPower_electric",
      "mathHeroPower_poison", "mathHeroPower_neutral", "mathTowerBossPower_cryo", "mathTowerBossPower_frostbomb",
      "mathTowerBossPower_laser", "mathTowerBossPower_chain", "mathTowerBossPower_needle", "mathTowerBossPower_trap",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 70;
  }
  if ((Number(input.balanceRevision) || 0) < 71) {
    [
      "mathPayoutCalibration", "mathBossLaterBaseChance", "mathBossLaterBuildInfluence",
      "mathTowerBossPower_flame", "mathTowerBossPower_grenade", "mathTowerBossPower_cryo",
      "mathTowerBossPower_frostbomb", "mathTowerBossPower_laser", "mathTowerBossPower_gas",
      "mathTowerBossPower_needle", "mathTowerBossPower_trap",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 71;
  }
  if ((Number(input.balanceRevision) || 0) < 72) {
    [
      "mathBossFirstBaseChance", "mathBossLaterBaseChance", "mathBossOrdinalPenalty",
      "mathSingleTowerChanceShift", "mathAreaTowerChanceShift", "mathControlTowerChanceShift",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 72;
  }
  if ((Number(input.balanceRevision) || 0) < 73) {
    [
      "mathPayoutCalibration", "mathSingleTowerChanceShift", "mathControlTowerChanceShift",
      "mathHeroPower_fire", "mathHeroPower_ice", "mathHeroPower_electric",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 73;
  }
  if ((Number(input.balanceRevision) || 0) < 74) {
    ["mathSingleTowerChanceShift", "mathControlTowerChanceShift"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 74;
  }
  if ((Number(input.balanceRevision) || 0) < 75) {
    ["mathSingleTowerPayoutShift", "mathAreaTowerPayoutShift", "mathControlTowerPayoutShift"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 75;
  }
  if ((Number(input.balanceRevision) || 0) < 76) {
    ["mathSingleTowerPayoutShift", "mathControlTowerPayoutShift"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 76;
  }
  if ((Number(input.balanceRevision) || 0) < 77) {
    [
      "mathSingleTowerPayoutShift", "mathAreaTowerPayoutShift", "mathControlTowerPayoutShift",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 77;
  }
  if ((Number(input.balanceRevision) || 0) < 78) {
    [
      "mathSingleTowerPayoutShift", "mathControlTowerPayoutShift",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 78;
  }
  if ((Number(input.balanceRevision) || 0) < 79) {
    [
      "mathSingleTowerPayoutShift", "mathAreaTowerPayoutShift", "mathControlTowerPayoutShift",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
      "bossHpPerOrdinalMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 79;
  }
  if ((Number(input.balanceRevision) || 0) < 80) {
    [
      "mathBossLaterBaseChance", "mathBossOrdinalPenalty", "mathPayoutCalibration",
      "mathSingleTowerPayoutShift", "mathAreaTowerPayoutShift", "mathControlTowerPayoutShift",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
      "bossHpMul", "bossHpPerOrdinalMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 80;
  }
  if ((Number(input.balanceRevision) || 0) < 81) {
    ["mathPayoutCalibration", "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 81;
  }
  if ((Number(input.balanceRevision) || 0) < 82) {
    [
      "mathBossFirstBaseChance", "mathPayoutCalibration", "mathAreaTowerChanceShift",
      "mathControlTowerChanceShift", "mathControlSharePayoutSlope", "mathCoreRiskBonus",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 82;
  }
  if ((Number(input.balanceRevision) || 0) < 83) {
    ["mathPayoutCalibration", "mathSingleSharePayoutSlope", "mathBossLaterBaseChance", "mathBossOrdinalPenalty"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 83;
  }
  if ((Number(input.balanceRevision) || 0) < 84) {
    ["mathControlTowerChanceShift", "mathCoreRiskBonus"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 84;
  }
  if ((Number(input.balanceRevision) || 0) < 85) {
    next.mathPayoutCalibration = DEFAULT_PARAMS.mathPayoutCalibration;
    next.balanceRevision = 85;
  }
  if ((Number(input.balanceRevision) || 0) < 86) {
    ["mathPayoutCalibration", "mathBossLaterBaseChance", "mathBossOrdinalPenalty"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 86;
  }
  if ((Number(input.balanceRevision) || 0) < 87) {
    [
      "bossFirstMinWave", "bossFirstChance", "bossFirstChanceInc", "bossFirstChanceCap",
      "bossChanceMul", "bossChanceCap", "bossHpPerOrdinalMul",
      "mathBossLaterBuildInfluence", "mathBossLaterHpInfluence", "mathBossLaterBaseChance",
      "mathBossOrdinalPenalty", "mathFirstBossGuaranteePenalty",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    Object.keys(DEFAULT_PARAMS)
      .filter(key => /^wave_\d+_(bossBase|bossInc|bossCd)$/.test(key))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 87;
  }
  if ((Number(input.balanceRevision) || 0) < 88) {
    [
      "mathPayoutCalibration",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
      "mathBossLaterBaseChance", "mathBossOrdinalPenalty",
      "bossLaterRewardMul", "bossHpMul", "bossHpPerOrdinalMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 88;
  }
  if ((Number(input.balanceRevision) || 0) < 89) {
    ["mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 89;
  }
  if ((Number(input.balanceRevision) || 0) < 108) {
    [
      "mathPayoutCalibration",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
      "mathBossFirstBaseChance", "mathBossLaterBaseChance", "mathBossOrdinalPenalty",
      "mathCoreRiskBonus", "bossLaterRewardMul", "bossHpMul", "bossHpPerOrdinalMul",
      "hero_fire_damage", "hero_ice_damage", "hero_ice_secondaryMul",
      "hero_electric_damage", "hero_poison_damage", "hero_poison_rate",
      "hero_poison_status", "hero_poison_splash", "hero_neutral_damage",
      "tower_blade_damage", "tower_blade_rate", "tower_blade_minionMul",
      "tower_blade_eliteMul", "tower_blade_bossMul",
      "tower_flame_bossMul", "tower_grenade_bossMul",
      "tower_chain_bossMul", "tower_gas_bossMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 108;
  }
  if ((Number(input.balanceRevision) || 0) < 109) {
    [
      "mathSingleSharePayoutSlope",
      "mathAreaSharePayoutSlope",
      "mathControlSharePayoutSlope",
    ].forEach(key => { next[key] = 0; });
    next.balanceRevision = 109;
  }
  if ((Number(input.balanceRevision) || 0) < 110) {
    [
      "mathPayoutCalibration",
      "mathSingleTowerChanceShift",
      "mathAreaTowerChanceShift",
      "mathControlTowerChanceShift",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 110;
  }
  if ((Number(input.balanceRevision) || 0) < 111) {
    [
      "mathPayoutCalibration",
      "mathSingleTowerChanceShift",
      "mathAreaTowerChanceShift",
      "mathControlTowerChanceShift",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 111;
  }
  if ((Number(input.balanceRevision) || 0) < 112) {
    [
      "mathSingleTowerChanceShift",
      "mathAreaTowerChanceShift",
      "mathControlTowerChanceShift",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 112;
  }
  if ((Number(input.balanceRevision) || 0) < 113) {
    [
      "mathPayoutCalibration",
      "tower_flame_bossMul", "tower_grenade_bossMul",
      "tower_cryo_bossMul", "tower_frostbomb_bossMul",
      "tower_laser_bossMul", "tower_chain_bossMul",
      "tower_gas_bossMul", "tower_needle_bossMul",
      "tower_blade_bossMul", "tower_trap_bossMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 113;
  }
  if ((Number(input.balanceRevision) || 0) < 114) {
    [
      "tower_cryo_bossMul",
      "tower_laser_bossMul",
      "tower_needle_bossMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 114;
  }
  if ((Number(input.balanceRevision) || 0) < 115) {
    [
      "tower_cryo_bossMul",
      "tower_laser_bossMul",
      "tower_needle_bossMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 115;
  }
  if ((Number(input.balanceRevision) || 0) < 116) {
    [
      "mathBossOrdinalPenalty", "mathBossFirstBaseChance", "mathBossLaterBaseChance",
      "mathPayoutBand5", "mathMinClearChance", "bossLaterRewardMul",
      "bossFirstHpMul", "bossHpMul", "bossHpPerOrdinalMul",
      "bossBetStepMul", "betMidMul", "betDeepMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 116;
  }
  if ((Number(input.balanceRevision) || 0) < 117) {
    ["mathPayoutCalibration", "bossFirstHpMul"].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 117;
  }
  if ((Number(input.balanceRevision) || 0) < 118) {
    [
      "mathBossOrdinalPenalty", "mathBossFirstBaseChance", "mathBossLaterBaseChance",
      "mathFirstBossDelayPenalty", "mathPayoutCalibration",
      "bossFirstHpMul", "bossHpMul", "bossHpPerOrdinalMul",
      ...Object.keys(DEFAULT_PARAMS).filter(key => /^wave_\d+_mathPayout$/.test(key)),
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 118;
  }
  if ((Number(input.balanceRevision) || 0) < 119) {
    [
      "mathPayoutCalibration",
      ...Object.keys(DEFAULT_PARAMS).filter(key => /^wave_\d+_mathPayout$/.test(key)),
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 119;
  }
  if ((Number(input.balanceRevision) || 0) < 120) {
    next.mathSingleTowerChanceShift = DEFAULT_PARAMS.mathSingleTowerChanceShift;
    next.balanceRevision = 120;
  }
  if ((Number(input.balanceRevision) || 0) < 121) {
    next.mathPayoutCalibration = DEFAULT_PARAMS.mathPayoutCalibration;
    next.balanceRevision = 128;
  }
  if ((Number(input.balanceRevision) || 0) < 129) {
    [
      "mathBossLaterBaseChance", "mathBossOrdinalPenalty",
      "mathSingleTowerChanceShift", "mathAreaTowerChanceShift", "mathControlTowerChanceShift",
      "mathHeroPower_fire", "mathHeroPower_ice", "mathHeroPower_electric", "mathHeroPower_poison", "mathHeroPower_neutral",
      "bossHpPerOrdinalMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 129;
  }
  if ((Number(input.balanceRevision) || 0) < 130) {
    [
      "mathPayoutCalibration", "mathBossOrdinalPenalty",
      "mathSingleTowerChanceShift", "mathAreaTowerChanceShift", "mathControlTowerChanceShift",
      "mathHeroPower_electric",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 130;
  }
  if ((Number(input.balanceRevision) || 0) < 131) {
    [
      "mathSingleTowerChanceShift", "mathAreaTowerChanceShift", "mathControlTowerChanceShift",
      "mathHeroPower_fire", "mathHeroPower_ice", "mathHeroPower_poison", "mathHeroPower_neutral",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 131;
  }
  if ((Number(input.balanceRevision) || 0) < 132) {
    [
      "mathBossFirstBaseChance",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 132;
  }
  if ((Number(input.balanceRevision) || 0) < 133) {
    [
      "mathBossBuildInfluence", "mathBossLaterBuildInfluence",
      "mathBossFirstBaseChance", "mathBossLaterBaseChance",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 133;
  }
  if ((Number(input.balanceRevision) || 0) < 134) {
    [
      "mathBossLaterBuildInfluence",
      "mathBossFirstBaseChance", "mathBossLaterBaseChance",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 134;
  }
  if ((Number(input.balanceRevision) || 0) < 135) {
    [
      "mathBossLaterBuildInfluence", "mathBossLaterBaseChance",
      "mathBossOrdinalPenalty", "mathPayoutCalibration",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 135;
  }
  if ((Number(input.balanceRevision) || 0) < 136) {
    [
      "mathPayoutCalibration",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 136;
  }
  if ((Number(input.balanceRevision) || 0) < 137) {
    ["mathBossFirstMinClearChance", "mathBossLaterMinClearChance"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 137;
  }
  if ((Number(input.balanceRevision) || 0) < 138) {
    Object.keys(DEFAULT_PARAMS).filter(key => /^wave_\d+_mathBossCorrection$/.test(key))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 138;
  }
  if ((Number(input.balanceRevision) || 0) < 139) {
    const multiplyMonsterField = (types, field, multiplier) => {
      types.forEach(([id]) => {
        const key = `monster_${id}_${field}`;
        if (Number.isFinite(Number(next[key]))) next[key] = Number(next[key]) * multiplier;
      });
    };
    const minionHp = Number.isFinite(Number(next.minionHpMul)) ? Number(next.minionHpMul) : 1.05;
    const minionAtk = Number.isFinite(Number(next.minionAtkMul)) ? Number(next.minionAtkMul) : .82;
    const minionSpeed = Number.isFinite(Number(next.minionSpeedMul)) ? Number(next.minionSpeedMul) : .90;
    const eliteHp = Number.isFinite(Number(next.eliteHpMul)) ? Number(next.eliteHpMul) : 1.05;
    const eliteAtk = Number.isFinite(Number(next.eliteAtkMul)) ? Number(next.eliteAtkMul) : 1.05;
    const bossFirstHp = Number.isFinite(Number(next.bossFirstHpMul)) ? Number(next.bossFirstHpMul) : 2.35;
    const bossLaterHp = Number.isFinite(Number(next.bossHpMul)) ? Number(next.bossHpMul) : 2.30;
    const bossAtk = Number.isFinite(Number(next.bossAtkMul)) ? Number(next.bossAtkMul) : 1;
    const bossSpeed = Number.isFinite(Number(next.bossSpeedMul)) ? Number(next.bossSpeedMul) : 1;
    const rewardMul = Number.isFinite(Number(next.moneyMul)) ? Number(next.moneyMul) : 1.085;
    const bossChanceMul = Number.isFinite(Number(next.bossChanceMul)) ? Number(next.bossChanceMul) : .45;
    multiplyMonsterField(MONSTER_TYPES, "hp", minionHp);
    multiplyMonsterField(MONSTER_TYPES, "atk", minionAtk);
    multiplyMonsterField(MONSTER_TYPES, "speed", minionSpeed);
    multiplyMonsterField(ELITE_TYPES, "hp", eliteHp);
    multiplyMonsterField(ELITE_TYPES, "atk", eliteAtk);
    multiplyMonsterField(BOSS_TYPES, "hp", bossFirstHp);
    multiplyMonsterField(BOSS_TYPES, "atk", bossAtk);
    multiplyMonsterField(BOSS_TYPES, "speed", bossSpeed);
    next.minionHpMul = 1;
    next.minionAtkMul = 1;
    next.minionSpeedMul = 1;
    next.eliteHpMul = 1;
    next.eliteAtkMul = 1;
    next.bossFirstHpMul = 1;
    next.bossHpMul = bossFirstHp > 0 ? bossLaterHp / bossFirstHp : 1;
    next.bossAtkMul = 1;
    next.bossSpeedMul = 1;
    WAVE_REWARD_TIERS.forEach(([, , , mulKey]) => {
      if (Number.isFinite(Number(next[mulKey]))) next[mulKey] = Number(next[mulKey]) * rewardMul;
    });
    next.moneyMul = 1;
    WAVE_BASE.forEach(row => {
      const key = `wave_${row[0]}_bossInc`;
      if (Number.isFinite(Number(next[key]))) next[key] = Number(next[key]) * bossChanceMul;
    });
    next.bossChanceMul = 1;
    next.balanceRevision = 139;
  }
  if ((Number(input.balanceRevision) || 0) < 140) {
    next.mathTargetRtp = .95;
    next.balanceRevision = 140;
  }
  if ((Number(input.balanceRevision) || 0) < 141) {
    WAVE_REWARD_TIERS.forEach(([, , weightKey, mulKey]) => {
      next[weightKey] = DEFAULT_PARAMS[weightKey];
      next[mulKey] = DEFAULT_PARAMS[mulKey];
    });
    next.balanceRevision = 141;
  }
  if ((Number(input.balanceRevision) || 0) < 142) {
    next.mathTargetRtp = .95;
    next.mathPoolEnabled = 1;
    next.mathPoolSeedBetUnits = 200;
    next.mathPoolMaxPayoutMul = 60;
    next.mathSingleTowerPayoutShift = 0;
    next.mathAreaTowerPayoutShift = 0;
    next.mathControlTowerPayoutShift = 0;
    next.mathSingleSharePayoutSlope = 0;
    next.mathAreaSharePayoutSlope = 0;
    next.mathControlSharePayoutSlope = 0;
    next.mathPayoutCalibration = 1;
    next.mathMinionPayoutChanceScale = 1;
    next.mathBossPayoutChanceScale = 1;
    next.mathBossPayoutChanceMidScale = 1;
    next.mathBossPayoutChanceDeepScale = 1;
    next.mathBossPayoutChanceUltraScale = 1;
    ["mathPayoutBand1", "mathPayoutBand2", "mathPayoutBand3", "mathPayoutBand4", "mathPayoutBand5"]
      .forEach(key => { next[key] = 1; });
    Object.keys(next).filter(key => /^wave_\d+_mathPayout$/.test(key))
      .forEach(key => { next[key] = 1; });
    next.bossBetStepMul = 1.5;
    next.balanceRevision = 142;
  }
  if ((Number(input.balanceRevision) || 0) < 143) {
    next.mathPoolReleaseRate = .12;
    next.mathPoolReleaseCapMul = 3;
    next.balanceRevision = 143;
  }
  if ((Number(input.balanceRevision) || 0) < 144) {
    next.mathPoolSeedBetUnits = 0;
    next.mathPoolMaxPayoutMul = 500;
    next.mathPoolReleaseRate = 0;
    next.mathPoolReleaseCapMul = 0;
    next.balanceRevision = 144;
  }
  if ((Number(input.balanceRevision) || 0) < 145) {
    next.balanceRevision = 145;
  }
  if ((Number(input.balanceRevision) || 0) < 146) {
    [
      "mathPoolReleaseRate", "mathPoolReleaseCapMul",
      "mathBossLaterBaseChance", "mathBossOrdinalPenalty", "mathBossLaterMinClearChance",
      "bossLaterRewardMul",
      "waveRewardDryWeight", "waveRewardDryMul", "waveRewardLowWeight", "waveRewardLowMul",
      "waveRewardNormalWeight", "waveRewardNormalMul", "waveRewardProfitWeight", "waveRewardProfitMul",
      "waveRewardHotWeight", "waveRewardHotMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 146;
  }
  if ((Number(input.balanceRevision) || 0) < 147) {
    [
      "mathPoolReleaseRate", "mathPoolReleaseCapMul",
      "mathBossLaterBaseChance", "mathBossOrdinalPenalty", "mathBossLaterMinClearChance",
      "bossLaterRewardMul", "bossHpMul", "bossHpPerOrdinalMul",
      "bossDiffEasyWeight", "bossDiffNormalWeight", "bossDiffHardWeight", "bossDiffBrutalWeight",
      "bossLowWeight", "bossMidWeight", "bossHighWeight", "bossHighMin", "bossHighMax",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 147;
  }
  if ((Number(input.balanceRevision) || 0) < 148) {
    [
      "mathPoolBaseOutcomeCapMul", "mathPoolBossAddCapScale", "mathPoolReleaseRate", "mathPoolReleaseCapMul",
      "mathBossLaterBaseChance", "mathBossOrdinalPenalty", "mathBossLaterMinClearChance",
      "mathHeroPower_fire", "mathHeroPower_ice", "mathHeroPower_electric", "mathHeroPower_poison", "mathHeroPower_neutral",
      "bossHpPerOrdinalMul", "bossDiffEasyWeight", "bossDiffNormalWeight", "bossDiffHardWeight", "bossDiffBrutalWeight",
      "waveRewardDryWeight", "waveRewardDryMul", "waveRewardLowWeight", "waveRewardLowMul",
      "waveRewardNormalWeight", "waveRewardNormalMul", "waveRewardProfitWeight", "waveRewardProfitMul",
      "waveRewardHotWeight", "waveRewardHotMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 148;
  }
  if ((Number(input.balanceRevision) || 0) < 149) {
    [
      "hero_fire_damage", "hero_ice_damage", "hero_electric_damage",
      "hero_poison_damage", "hero_poison_rate", "hero_neutral_damage",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 149;
  }
  if ((Number(input.balanceRevision) || 0) < 150) {
    next.mathPoolBossAddCapScale = DEFAULT_PARAMS.mathPoolBossAddCapScale;
    next.balanceRevision = 150;
  }
  if ((Number(input.balanceRevision) || 0) < 151) {
    ["mathPoolBaseOutcomeCapMul", "mathPoolMeaningfulWinTriggerMul", "mathPoolMeaningfulWinFloorMul"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 151;
  }
  if ((Number(input.balanceRevision) || 0) < 152) {
    ["mathPoolStrongWinChance", "mathPoolStrongWinFloorMul"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 152;
  }
  if ((Number(input.balanceRevision) || 0) < 153) {
    ["mathPoolBaseOutcomeCapMul", "mathPoolBossAddCapScale", "mathPoolReleaseRate", "mathPoolReleaseCapMul"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 153;
  }
  if ((Number(input.balanceRevision) || 0) < 154) {
    POOL_ENTRY_TIERS.forEach(({ mulKey, weightKey }) => {
      next[mulKey] = DEFAULT_PARAMS[mulKey];
      next[weightKey] = DEFAULT_PARAMS[weightKey];
    });
    next.balanceRevision = 154;
  }
  if ((Number(input.balanceRevision) || 0) < 155) {
    [
      "mathBossPayoutChanceScale", "mathBossPayoutChanceMidScale",
      "mathBossPayoutChanceDeepScale", "mathBossPayoutChanceUltraScale",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 155;
  }
  if ((Number(input.balanceRevision) || 0) < 156) {
    [
      "mathBossPayoutChanceScale", "mathBossPayoutChanceMidScale",
      "mathBossPayoutChanceDeepScale", "mathBossPayoutChanceUltraScale",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 156;
  }
  if ((Number(input.balanceRevision) || 0) < 157) {
    [
      "mathBossPayoutChanceScale", "mathBossPayoutChanceMidScale",
      "mathBossPayoutChanceDeepScale", "mathBossPayoutChanceUltraScale",
      "mathBossPayoutChanceTailScale",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 157;
  }
  if ((Number(input.balanceRevision) || 0) < 159) {
    [
      "mathBossBuildInfluence", "mathBossLaterBuildInfluence",
      "mathSingleTowerChanceShift", "mathAreaTowerChanceShift", "mathControlTowerChanceShift",
      "mathBossFirstBaseChance", "mathBossLaterBaseChance",
      "mathBossPayoutChanceScale", "mathBossPayoutChanceMidScale",
      "mathBossPayoutChanceDeepScale", "mathBossPayoutChanceUltraScale",
      "mathBossPayoutChanceTailScale",
    ]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 159;
  }
  if ((Number(input.balanceRevision) || 0) < 160) {
    [
      "mathBossBuildInfluence", "mathBossLaterBuildInfluence",
      "mathBossOrdinalPenalty", "mathBossFirstBaseChance", "mathBossLaterBaseChance",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 160;
  }
  if ((Number(input.balanceRevision) || 0) < 161) {
    [
      "mathBossPayoutChanceScale", "mathBossPayoutChanceMidScale",
      "mathBossPayoutChanceDeepScale", "mathBossPayoutChanceUltraScale",
      "mathBossPayoutChanceTailScale",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 161;
  }
  if ((Number(input.balanceRevision) || 0) < 162) {
    [
      "mathBossPayoutChanceDeepScale", "mathBossPayoutChanceUltraScale",
      "mathBossPayoutChanceTailScale",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 162;
  }
  if ((Number(input.balanceRevision) || 0) < 163) {
    next.mathBossOrdinalPenalty = DEFAULT_PARAMS.mathBossOrdinalPenalty;
    next.balanceRevision = 163;
  }
  if ((Number(input.balanceRevision) || 0) < 164) {
    [
      "mathBossPayoutChanceDeepScale", "mathBossPayoutChanceUltraScale",
      "mathBossPayoutChanceTailScale",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 164;
  }
  if ((Number(input.balanceRevision) || 0) < 166) {
    ["mathBossPayoutChanceDeepScale", "mathBossPayoutChanceUltraScale"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 166;
  }
  if ((Number(input.balanceRevision) || 0) < 167) {
    next.mathPoolReleaseRate = DEFAULT_PARAMS.mathPoolReleaseRate;
    next.mathPoolReleaseCapMul = DEFAULT_PARAMS.mathPoolReleaseCapMul;
    next.balanceRevision = 167;
  }
  if ((Number(input.balanceRevision) || 0) < 168) {
    [
      "mathBossFirstBaseChance", "mathBossLaterBaseChance", "mathBossOrdinalPenalty",
      "mathSingleTowerChanceShift", "mathAreaTowerChanceShift", "mathControlTowerChanceShift",
      "mathBossPayoutChanceScale", "mathBossPayoutChanceMidScale",
      "mathBossPayoutChanceDeepScale", "mathBossPayoutChanceUltraScale",
      "mathBossPayoutChanceTailScale", "mathPoolReleaseRate", "mathPoolReleaseCapMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 168;
  }
  if ((Number(input.balanceRevision) || 0) < 169) {
    [
      "mathPoolEntryTier1Mul", "mathPoolEntryTier1Weight",
      "mathPoolEntryTier2Mul", "mathPoolEntryTier2Weight",
      "mathPoolEntryTier3Mul", "mathPoolEntryTier3Weight",
      "mathPoolEntryTier4Mul", "mathPoolEntryTier4Weight",
      "mathPoolEntryTier5Mul", "mathPoolEntryTier5Weight",
      "mathPoolEntryTier6Mul", "mathPoolEntryTier6Weight",
      "waveRewardDryWeight", "waveRewardDryMul", "waveRewardLowWeight", "waveRewardLowMul",
      "waveRewardNormalWeight", "waveRewardNormalMul", "waveRewardProfitWeight", "waveRewardProfitMul",
      "waveRewardHotWeight", "waveRewardHotMul",
      "bossLowWeight", "bossMidWeight", "bossHighWeight",
      "bossLowMin", "bossLowMax", "bossMidMin", "bossMidMax", "bossHighMin", "bossHighMax",
      "bossFirstRewardMul", "bossLaterRewardMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 169;
  }
  if ((Number(input.balanceRevision) || 0) < 170) {
    [
      "waveRewardDryWeight", "waveRewardDryMul", "waveRewardLowWeight", "waveRewardLowMul",
      "waveRewardNormalWeight", "waveRewardNormalMul", "waveRewardProfitWeight", "waveRewardProfitMul",
      "waveRewardHotWeight", "waveRewardHotMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 170;
  }
  if ((Number(input.balanceRevision) || 0) < 171) {
    ["mathPoolReleaseRate", "mathPoolBossReleaseRate"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 171;
  }
  if ((Number(input.balanceRevision) || 0) < 172) {
    [
      "mathPoolEntryTier1Mul", "mathPoolEntryTier1Weight", "mathPoolEntryTier2Mul", "mathPoolEntryTier2Weight",
      "mathPoolEntryTier3Mul", "mathPoolEntryTier3Weight", "mathPoolEntryTier4Mul", "mathPoolEntryTier4Weight",
      "mathPoolEntryTier5Mul", "mathPoolEntryTier5Weight", "mathPoolEntryTier6Mul", "mathPoolEntryTier6Weight",
      "mathPoolReleaseRate", "mathMinionBuildInfluence", "mathAttributeMinionInfluence", "mathAttributeBossInfluence",
      "mathTowerBossPower_flame", "mathTowerBossPower_grenade", "mathTowerBossPower_cryo", "mathTowerBossPower_frostbomb",
      "mathTowerBossPower_laser", "mathTowerBossPower_chain", "mathTowerBossPower_gas", "mathTowerBossPower_needle",
      "mathTowerBossPower_blade", "mathTowerBossPower_trap",
      "mathMinionHpInfluence", "mathFirstWaveClearChance", "mathClearBand1", "mathClearBand2", "mathClearBand3",
      "mathClearBand4", "mathClearBand5", "minionHpMul", "minionAtkMul", "wave1MinionAtkMul",
      "waveAttrBiasEarly", "waveAttrBias", "bossDiffEasyHpMul", "bossDiffNormalHpMul", "bossDiffHardHpMul",
      "bossDiffBrutalHpMul", "bossShieldHpPct", "bossShieldDamageMul", "bossBreakDamageMul",
      "bossBreakDuration", "bossEnrageHpPct", "bossEnrageAttackSpeedMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    Object.keys(DEFAULT_PARAMS)
      .filter(key => /^tower_.+_(?:minionMul|eliteMul|bossMul)$/.test(key) || /^monster_.+_(?:fire|ice|electric|poison|neutral)Mul$/.test(key) || /^wave_\d+_mathClear$/.test(key))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 172;
  }
  if ((Number(input.balanceRevision) || 0) < 173) {
    [
      "bossBreakAttackPause", "bossAttackWindup", "bossAttackIntervalJitterPct",
      "bossPreludeCountMul", "bossFirstAtkMul", "bossFirstHpMul", "bossHpMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 173;
  }
  if ((Number(input.balanceRevision) || 0) < 174) {
    ["mathGeneralRtpShare", "mathBossRtpShare"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 174;
  }
  if ((Number(input.balanceRevision) || 0) < 175) {
    ["mathPoolStrongWinChance", "mathPoolStrongWinFloorMul", "mathPoolWeakBossCapMul", "mathPoolWeakBossReleaseRate"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 175;
  }
  if ((Number(input.balanceRevision) || 0) < 176) {
    [
      "mathPoolHotWaveFloorMul", "mathPoolHotWaveReleaseRate",
      "waveRewardDryWeight", "waveRewardDryMul", "waveRewardLowWeight", "waveRewardLowMul",
      "waveRewardNormalWeight", "waveRewardNormalMul", "waveRewardProfitWeight", "waveRewardProfitMul",
      "waveRewardHotWeight", "waveRewardHotMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 176;
  }
  if ((Number(input.balanceRevision) || 0) < 177) {
    [
      "minionHpMul", "minionAtkMul", "minionSpeedMul", "wave1MinionAtkMul",
      "bossFirstHpMul", "bossHpMul", "bossHpPerOrdinalMul", "bossAtkMul",
      "bossFirstAtkMul", "bossShieldHpPct",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    Object.keys(DEFAULT_PARAMS)
      .filter(key => /^wave_\d+_hpMul$/.test(key) || /^monster_.+_(?:fire|ice|electric|poison|neutral)Mul$/.test(key))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 177;
  }
  if ((Number(input.balanceRevision) || 0) < 178) {
    [
      "minionHpMul", "minionAtkMul", "minionSpeedMul", "wave1MinionAtkMul",
      "mathMinionBuildInfluence", "mathAttributeMinionInfluence", "mathAttributeBossInfluence",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    Object.keys(DEFAULT_PARAMS)
      .filter(key => /^tower_.+_(?:minion|elite|boss)Mul$/.test(key) || /^monster_.+_(?:fire|ice|electric|poison|neutral)Mul$/.test(key))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 178;
  }
  if ((Number(input.balanceRevision) || 0) < 179) {
    [
      "mathPoolReleaseRate", "mathPoolWeakBossReleaseRate",
      "mathSingleTowerChanceShift", "mathAreaTowerChanceShift", "mathControlTowerChanceShift",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 179;
  }
  if ((Number(input.balanceRevision) || 0) < 180) {
    [
      "mathPoolEntryTier1Mul", "mathPoolEntryTier1Weight", "mathPoolEntryTier2Mul", "mathPoolEntryTier2Weight",
      "mathPoolEntryTier3Mul", "mathPoolEntryTier3Weight", "mathPoolEntryTier4Mul", "mathPoolEntryTier4Weight",
      "mathPoolEntryTier5Mul", "mathPoolEntryTier5Weight", "mathPoolEntryTier6Mul", "mathPoolEntryTier6Weight",
      "mathPoolReleaseRate", "mathPoolDeepReleaseRate", "mathPoolDepthRampWaves",
      "mathPoolBossReleaseRate", "mathPoolFirstBossReleaseRate", "mathPoolLaterBossReleaseRate",
      "mathPoolStrongWinEarlyFloorMul", "mathPoolStrongWinFloorMul",
      "mathPoolHotWaveEarlyFloorMul", "mathPoolHotWaveFloorMul",
      "mathPoolHotWaveEarlyReleaseRate", "mathPoolHotWaveReleaseRate",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 180;
  }
  if ((Number(input.balanceRevision) || 0) < 181) {
    ["mathPoolBaseOutcomeCapMul", "mathPoolDeepOutcomeCapMul", "mathPoolOutcomeCapRampWaves"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 181;
  }
  if ((Number(input.balanceRevision) || 0) < 182) {
    [
      "mathPoolBaseOutcomeCapMul", "mathPoolDeepOutcomeCapMul", "mathPoolOutcomeCapRampWaves", "mathPoolFirstBossOutcomeCapMul",
      "mathPoolReleaseRate", "mathPoolDeepReleaseRate", "mathPoolDepthRampWaves",
      "mathPoolFirstBossReleaseRate", "mathPoolLaterBossReleaseRate", "mathPoolBossReleaseRate",
      "mathPoolStrongWinEarlyFloorMul", "mathPoolStrongWinFloorMul",
      "mathPoolHotWaveEarlyFloorMul", "mathPoolHotWaveFloorMul", "mathPoolHotWaveEarlyReleaseRate", "mathPoolHotWaveReleaseRate",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 182;
  }
  if ((Number(input.balanceRevision) || 0) < 183) {
    [
      "mathGeneralRtpShare", "mathBossRtpShare",
      "mathPoolEntryTier1Mul", "mathPoolEntryTier1Weight", "mathPoolEntryTier2Mul", "mathPoolEntryTier2Weight",
      "mathPoolEntryTier3Mul", "mathPoolEntryTier3Weight", "mathPoolEntryTier4Mul", "mathPoolEntryTier4Weight",
      "mathPoolEntryTier5Mul", "mathPoolEntryTier5Weight", "mathPoolEntryTier6Mul", "mathPoolEntryTier6Weight",
      "mathPoolBossCarryRecycleRate",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 183;
  }
  if ((Number(input.balanceRevision) || 0) < 184) {
    ["mathPoolDeepOutcomeCapMul", "mathPoolOutcomeCapRampWaves", "mathPoolOutcomeCapCurve"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 184;
  }
  if ((Number(input.balanceRevision) || 0) < 199) {
    next.balanceRevision = 199;
  }
  if ((Number(input.balanceRevision) || 0) < 200) {
    [
      "mathPoolReleaseRate", "mathPoolFirstBossReleaseRate", "mathPoolLaterBossReleaseRate",
      "mathPoolStrongWinChance", "mathPoolHotWaveEarlyReleaseRate",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 200;
  }
  if ((Number(input.balanceRevision) || 0) < 201) {
    ["mathPoolReleaseRate", "mathPoolDeepReleaseRate"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 201;
  }
  if ((Number(input.balanceRevision) || 0) < 202) {
    next.mathPoolHotWaveDeepWeight = DEFAULT_PARAMS.mathPoolHotWaveDeepWeight;
    next.balanceRevision = 202;
  }
  if ((Number(input.balanceRevision) || 0) < 203) {
    next.balanceRevision = 203;
  }
  if ((Number(input.balanceRevision) || 0) < 204) {
    [
      "mathPoolTemporaryDeficitEnabled",
      "mathCarryShapeEnabled",
      "mathCarryAnchorChance",
      "mathCarryMinReturn",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 204;
  }
  if ((Number(input.balanceRevision) || 0) < 205) {
    ["mathPoolStrongWinChance", "mathPoolStrongWinDeepChance"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 205;
  }
  return next;
}
function cleanParams(input={}) {
  const next = { ...DEFAULT_PARAMS };
  Object.keys(DEFAULT_PARAMS).forEach(key => { const value = Number(input[key]); if (Number.isFinite(value)) next[key] = value; });
  next.bossFirstMinWave = Math.max(1, Math.round(next.bossFirstMinWave));
  next.bossFirstGuaranteeWave = Math.max(next.bossFirstMinWave, Math.round(next.bossFirstGuaranteeWave));
  next.bossFirstChance = Math.max(0, Math.min(100, next.bossFirstChance));
  next.bossFirstChanceInc = Math.max(0, Math.min(100, next.bossFirstChanceInc));
  next.bossFirstChanceCap = Math.max(0, Math.min(100, next.bossFirstChanceCap));
  next.bossFirstRewardMul = Math.max(0, next.bossFirstRewardMul);
  next.bossLaterRewardMul = Math.max(0, next.bossLaterRewardMul);
  next.bossFirstDifficultyCompression = Math.max(0, Math.min(1, next.bossFirstDifficultyCompression));
  next.bossShieldHpPct = Math.max(0, Math.min(50, next.bossShieldHpPct));
  next.bossShieldDamageMul = Math.max(0, Math.min(2, next.bossShieldDamageMul));
  next.bossBreakDamageMul = Math.max(1, Math.min(5, next.bossBreakDamageMul));
  next.bossBreakDuration = Math.max(.2, Math.min(10, next.bossBreakDuration));
  next.bossBreakAttackPause = Math.max(0, Math.min(10, next.bossBreakAttackPause));
  next.bossAttackWindup = Math.max(.1, Math.min(5, next.bossAttackWindup));
  next.bossAttackIntervalJitterPct = Math.max(0, Math.min(80, next.bossAttackIntervalJitterPct));
  next.bossPreludeCountMul = Math.max(.1, Math.min(1, next.bossPreludeCountMul));
  next.bossFirstAtkMul = Math.max(.1, Math.min(2, next.bossFirstAtkMul));
  next.bossEnrageHpPct = Math.max(0, Math.min(100, next.bossEnrageHpPct));
  next.bossEnrageAttackSpeedMul = Math.max(1, Math.min(4, next.bossEnrageAttackSpeedMul));
  ["bossFirstDiffEasyWeight", "bossFirstDiffNormalWeight", "bossFirstDiffHardWeight", "bossFirstDiffBrutalWeight"]
    .forEach(key => { next[key] = Math.max(0, next[key]); });
  next.bossChanceCap = Math.max(0, Math.min(100, next.bossChanceCap));
  next.bossHpMul = Math.round(Math.max(.1, Math.min(3, next.bossHpMul)) * 100) / 100;
  next.mathModelEnabled = next.mathModelEnabled >= .5 ? 1 : 0;
  next.mathTargetRtp = Math.max(.5, Math.min(.99, next.mathTargetRtp));
  next.mathPoolEnabled = next.mathPoolEnabled >= .5 ? 1 : 0;
  next.mathGeneralRtpShare = Math.max(0, Math.min(next.mathTargetRtp, next.mathGeneralRtpShare));
  next.mathBossRtpShare = Math.max(0, Math.min(next.mathTargetRtp - next.mathGeneralRtpShare, next.mathBossRtpShare));
  next.mathPoolStrongWinChance = Math.max(0, Math.min(1, next.mathPoolStrongWinChance));
  next.mathPoolStrongWinDeepChance = Math.max(0, Math.min(1, next.mathPoolStrongWinDeepChance));
  next.mathPoolStrongWinEarlyFloorMul = Math.max(1, Math.min(500, next.mathPoolStrongWinEarlyFloorMul));
  next.mathPoolStrongWinFloorMul = Math.max(next.mathPoolStrongWinEarlyFloorMul, Math.min(500, next.mathPoolStrongWinFloorMul));
  next.mathPoolWeakBossCapMul = Math.max(0, Math.min(500, next.mathPoolWeakBossCapMul));
  next.mathPoolWeakBossReleaseRate = Math.max(0, Math.min(1, next.mathPoolWeakBossReleaseRate));
  next.mathPoolHotWaveEarlyFloorMul = Math.max(1, Math.min(500, next.mathPoolHotWaveEarlyFloorMul));
  next.mathPoolHotWaveFloorMul = Math.max(next.mathPoolHotWaveEarlyFloorMul, Math.min(500, next.mathPoolHotWaveFloorMul));
  next.mathPoolHotWaveDeepWeight = Math.max(0, Math.min(100, next.mathPoolHotWaveDeepWeight));
  next.mathPoolHotWaveEarlyReleaseRate = Math.max(0, Math.min(1, next.mathPoolHotWaveEarlyReleaseRate));
  next.mathPoolHotWaveReleaseRate = Math.max(0, Math.min(1, next.mathPoolHotWaveReleaseRate));
  POOL_ENTRY_TIERS.forEach(({ mulKey, weightKey }) => {
    next[mulKey] = Math.max(0, Math.min(100, next[mulKey]));
    next[weightKey] = Math.max(0, Math.min(100000, next[weightKey]));
  });
  next.mathPoolSeedBetUnits = Math.max(0, Math.min(10000, next.mathPoolSeedBetUnits));
  next.mathPoolMaxPayoutMul = Math.max(1, Math.min(500, next.mathPoolMaxPayoutMul));
  next.mathPoolTemporaryDeficitEnabled = next.mathPoolTemporaryDeficitEnabled >= .5 ? 1 : 0;
  next.mathCarryShapeEnabled = next.mathCarryShapeEnabled >= .5 ? 1 : 0;
  next.mathCarryAnchorChance = Math.max(.05, Math.min(.95, next.mathCarryAnchorChance));
  next.mathCarryMinReturn = Math.max(0, Math.min(100, next.mathCarryMinReturn));
  next.mathPoolBaseOutcomeCapMul = Math.max(0, Math.min(500, next.mathPoolBaseOutcomeCapMul));
  next.mathPoolDeepOutcomeCapMul = Math.max(next.mathPoolBaseOutcomeCapMul, Math.min(500, next.mathPoolDeepOutcomeCapMul));
  next.mathPoolOutcomeCapRampWaves = Math.max(1, Math.min(30, next.mathPoolOutcomeCapRampWaves));
  next.mathPoolOutcomeCapCurve = Math.max(.25, Math.min(8, next.mathPoolOutcomeCapCurve));
  next.mathPoolFirstBossOutcomeCapMul = Math.max(1, Math.min(500, next.mathPoolFirstBossOutcomeCapMul));
  next.mathPoolBossCarryRecycleRate = Math.max(0, Math.min(1, next.mathPoolBossCarryRecycleRate));
  next.mathPoolBossAddCapScale = Math.max(0, Math.min(100, next.mathPoolBossAddCapScale));
  next.mathPoolReleaseRate = Math.max(0, Math.min(1, next.mathPoolReleaseRate));
  next.mathPoolDeepReleaseRate = Math.max(next.mathPoolReleaseRate, Math.min(1, next.mathPoolDeepReleaseRate));
  next.mathPoolDepthRampWaves = Math.max(1, Math.min(30, next.mathPoolDepthRampWaves));
  next.mathPoolBossReleaseRate = Math.max(0, Math.min(1, next.mathPoolBossReleaseRate));
  next.mathPoolFirstBossReleaseRate = Math.max(0, Math.min(next.mathPoolBossReleaseRate, next.mathPoolFirstBossReleaseRate));
  next.mathPoolLaterBossReleaseRate = Math.max(0, Math.min(next.mathPoolBossReleaseRate, next.mathPoolLaterBossReleaseRate));
  next.mathPoolReleaseCapMul = Math.max(0, Math.min(500, next.mathPoolReleaseCapMul));
  next.mathPoolMeaningfulWinTriggerMul = Math.max(0, Math.min(500, next.mathPoolMeaningfulWinTriggerMul));
  next.mathPoolMeaningfulWinFloorMul = Math.max(1, Math.min(500, next.mathPoolMeaningfulWinFloorMul));
  next.mathPoolStrongWinChance = Math.max(0, Math.min(1, next.mathPoolStrongWinChance));
  next.mathPoolStrongWinDeepChance = Math.max(0, Math.min(1, next.mathPoolStrongWinDeepChance));
  next.mathPoolStrongWinFloorMul = Math.max(next.mathPoolStrongWinEarlyFloorMul, Math.min(500, next.mathPoolStrongWinFloorMul));
  next.mathCheckpointRepriceEnabled = next.mathCheckpointRepriceEnabled >= .5 ? 1 : 0;
  next.mathCheckpointMinChance = Math.max(.01, Math.min(.99, next.mathCheckpointMinChance));
  next.mathRerollEntryEnabled = next.mathRerollEntryEnabled >= .5 ? 1 : 0;
  next.mathTolerancePct = Math.max(0, Math.min(20, next.mathTolerancePct));
  next.mathBuildInfluence = Math.max(0, Math.min(1, next.mathBuildInfluence));
  next.mathBossBuildInfluence = Math.max(0, Math.min(2, next.mathBossBuildInfluence));
  next.mathBossLaterBuildInfluence = Math.max(0, Math.min(2, next.mathBossLaterBuildInfluence));
  next.mathMinionBuildInfluence = Math.max(0, Math.min(2, next.mathMinionBuildInfluence));
  next.mathAttributeMinionInfluence = Math.max(0, Math.min(2, next.mathAttributeMinionInfluence));
  next.mathAttributeBossInfluence = Math.max(0, Math.min(2, next.mathAttributeBossInfluence));
  next.mathAreaBossRiskDiscount = Math.max(0, Math.min(.25, next.mathAreaBossRiskDiscount));
  ["mathSingleTowerChanceShift", "mathAreaTowerChanceShift", "mathControlTowerChanceShift"]
    .forEach(key => { next[key] = Math.max(-.25, Math.min(.25, next[key])); });
  ["mathSingleTowerPayoutShift", "mathAreaTowerPayoutShift", "mathControlTowerPayoutShift"]
    .forEach(key => { next[key] = Math.max(-.25, Math.min(.25, next[key])); });
  ["mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope"]
    .forEach(key => { next[key] = Math.max(-1, Math.min(1, next[key])); });
  next.mathHpInfluence = Math.max(0, Math.min(2, next.mathHpInfluence));
  next.mathMinionHpInfluence = Math.max(0, Math.min(2, next.mathMinionHpInfluence));
  next.mathBossHpInfluence = Math.max(0, Math.min(2, next.mathBossHpInfluence));
  next.mathBossLaterHpInfluence = Math.max(0, Math.min(2, next.mathBossLaterHpInfluence));
  next.mathBossOrdinalPenalty = Math.max(0, Math.min(.8, next.mathBossOrdinalPenalty));
  next.mathBossFirstBaseChance = Math.max(.05, Math.min(.999, next.mathBossFirstBaseChance));
  next.mathBossLaterBaseChance = Math.max(.05, Math.min(.999, next.mathBossLaterBaseChance));
  next.mathFirstBossDelayPenalty = Math.max(0, Math.min(.2, next.mathFirstBossDelayPenalty));
  next.mathFirstBossGuaranteePenalty = Math.max(0, Math.min(.6, next.mathFirstBossGuaranteePenalty));
  Object.keys(DEFAULT_PARAMS).filter(key => /^wave_\d+_mathClear$/.test(key))
    .forEach(key => { next[key] = Math.max(.01, Math.min(.999, next[key])); });
  Object.keys(DEFAULT_PARAMS).filter(key => /^wave_\d+_mathPayout$/.test(key))
    .forEach(key => { next[key] = Math.max(.01, Math.min(2, next[key])); });
  Object.keys(DEFAULT_PARAMS).filter(key => /^wave_\d+_mathBossCorrection$/.test(key))
    .forEach(key => { next[key] = Math.max(-.8, Math.min(.8, next[key])); });
  next.mathHpReference = Math.max(0, Math.min(1, next.mathHpReference));
  next.mathCoreRiskBonus = Math.max(0, Math.min(.25, next.mathCoreRiskBonus));
  Object.keys(DEFAULT_PARAMS).filter(key => key.startsWith("mathHeroPower_") || key.startsWith("mathTowerBossPower_"))
    .forEach(key => { next[key] = Math.max(.25, Math.min(2.5, next[key])); });
  next.mathBossPenalty = Math.max(0, Math.min(.8, next.mathBossPenalty));
  next.mathPayoutCalibration = Math.max(.5, Math.min(1.5, next.mathPayoutCalibration));
  next.mathMinionPayoutChanceScale = Math.max(.5, Math.min(2, next.mathMinionPayoutChanceScale));
  next.mathBossPayoutChanceScale = Math.max(.5, Math.min(4, next.mathBossPayoutChanceScale));
  next.mathBossPayoutChanceMidScale = Math.max(.5, Math.min(4, next.mathBossPayoutChanceMidScale));
  next.mathBossPayoutChanceDeepScale = Math.max(.5, Math.min(4, next.mathBossPayoutChanceDeepScale));
  next.mathBossPayoutChanceUltraScale = Math.max(.5, Math.min(6, next.mathBossPayoutChanceUltraScale));
  next.mathBossPayoutChanceTailScale = Math.max(.5, Math.min(6, next.mathBossPayoutChanceTailScale));
  next.bossHpPerOrdinalMul = Math.max(1, Math.min(2, next.bossHpPerOrdinalMul));
  ["mathPayoutBand1", "mathPayoutBand2", "mathPayoutBand3", "mathPayoutBand4", "mathPayoutBand5"]
    .forEach(key => { next[key] = Math.max(.5, Math.min(1.5, next[key])); });
  next.mathLossHpMul = Math.max(1, Math.min(5, next.mathLossHpMul));
  next.mathLossAtkMul = Math.max(1, Math.min(5, next.mathLossAtkMul));
  next.mathLossSpeedMul = Math.max(1, Math.min(1.25, next.mathLossSpeedMul));
  next.mathMinClearChance = Math.max(.01, Math.min(.99, next.mathMinClearChance));
  next.mathBossFirstMinClearChance = Math.max(.01, Math.min(.99, next.mathBossFirstMinClearChance));
  next.mathBossLaterMinClearChance = Math.max(.01, Math.min(.99, next.mathBossLaterMinClearChance));
  next.mathMaxClearChance = Math.max(next.mathMinClearChance, Math.min(.999, next.mathMaxClearChance));
  next.mathFirstWaveClearChance = Math.max(.01, Math.min(.999, next.mathFirstWaveClearChance));
  ["mathClearBand1", "mathClearBand2", "mathClearBand3", "mathClearBand4", "mathClearBand5"]
    .forEach(key => { next[key] = Math.max(.01, Math.min(.999, next[key])); });
  next.heroDamageMul = Math.max(0, next.heroDamageMul);
  next.heroSameAttrBonusPct = Math.max(0, Math.min(100, next.heroSameAttrBonusPct));
  next.heroResonanceBonusPct = Math.max(0, Math.min(100, next.heroResonanceBonusPct));
  next.heroAllTowerBonusPct = Math.max(0, Math.min(100, next.heroAllTowerBonusPct));
  next.heroDamageUpgradePct = Math.max(0, Math.min(200, next.heroDamageUpgradePct));
  next.heroRateUpgradePct = Math.max(0, Math.min(200, next.heroRateUpgradePct));
  next.heroFirstUpgradeQuantity = Math.max(0, Math.round(next.heroFirstUpgradeQuantity));
  next.heroQuantityUpgrade = Math.max(1, Math.round(next.heroQuantityUpgrade));
  next.heroQuantityEveryLevels = Math.max(1, Math.round(next.heroQuantityEveryLevels));
  HERO_TUNING.forEach(([id]) => HERO_FIELDS.forEach(([field,,min,max]) => {
    const key = `hero_${id}_${field}`;
    next[key] = Math.max(min, Math.min(max, next[key]));
    if (field === "targets") next[key] = Math.round(next[key]);
  }));
  next.bossRollDuration = Math.max(2.5, Math.min(8, next.bossRollDuration));
  next.bossRollHighThreshold = Math.max(1, next.bossRollHighThreshold);
  next.bossRollJackpotThreshold = Math.max(next.bossRollHighThreshold, next.bossRollJackpotThreshold);
  next.postBossRewardFunding = Math.max(0, Math.min(1, next.postBossRewardFunding));
  next.preBossRewardMul = Math.max(0, next.preBossRewardMul);
  next.deepMoneyBase = Math.max(0, next.deepMoneyBase);
  next.deepMoneyRamp = Math.max(0, next.deepMoneyRamp);
  next.deepMoneyCap = Math.max(next.deepMoneyBase, next.deepMoneyCap);
  WAVE_REWARD_TIERS.forEach(([, , weightKey, mulKey]) => {
    next[weightKey] = Math.max(0, next[weightKey]);
    next[mulKey] = Math.round(Math.max(0, next[mulKey]) * 1e6) / 1e6;
  });
  BOSS_DIFFICULTY_TIERS.forEach(([, , weightKey, hpKey, atkKey, speedKey]) => {
    next[weightKey] = Math.max(0, next[weightKey]);
    next[hpKey] = Math.max(.1, next[hpKey]);
    next[atkKey] = Math.max(.1, next[atkKey]);
    next[speedKey] = Math.max(.1, next[speedKey]);
  });
  next.spawnInterval = Math.max(.08, Math.min(2, next.spawnInterval));
  next.wave1MinionAtkMul = Math.max(0, Math.min(2, next.wave1MinionAtkMul));
  next.baseHp = Math.max(1, Math.round(next.baseHp));
  if (next.tower_gas_duration <= 0) next.tower_gas_duration = DEFAULT_PARAMS.tower_gas_duration;
  if (next.tower_trap_duration <= 0) next.tower_trap_duration = DEFAULT_PARAMS.tower_trap_duration;
  if (next.tower_gas_tick <= 0) next.tower_gas_tick = DEFAULT_PARAMS.tower_gas_tick;
  if (next.tower_trap_tick <= 0) next.tower_trap_tick = DEFAULT_PARAMS.tower_trap_tick;
  if ((Number(input.balanceRevision) || 0) < 79) {
    [
      "mathSingleTowerPayoutShift", "mathAreaTowerPayoutShift", "mathControlTowerPayoutShift",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
      "bossHpPerOrdinalMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 79;
  }
  if ((Number(input.balanceRevision) || 0) < 80) {
    [
      "mathBossLaterBaseChance", "mathBossOrdinalPenalty", "mathPayoutCalibration",
      "mathSingleTowerPayoutShift", "mathAreaTowerPayoutShift", "mathControlTowerPayoutShift",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
      "bossHpMul", "bossHpPerOrdinalMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 80;
  }
  if ((Number(input.balanceRevision) || 0) < 81) {
    ["mathPayoutCalibration", "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 81;
  }
  if ((Number(input.balanceRevision) || 0) < 82) {
    [
      "mathBossFirstBaseChance", "mathPayoutCalibration", "mathAreaTowerChanceShift",
      "mathControlTowerChanceShift", "mathControlSharePayoutSlope", "mathCoreRiskBonus",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 82;
  }
  if ((Number(input.balanceRevision) || 0) < 83) {
    ["mathPayoutCalibration", "mathSingleSharePayoutSlope", "mathBossLaterBaseChance", "mathBossOrdinalPenalty"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 83;
  }
  if ((Number(input.balanceRevision) || 0) < 84) {
    ["mathControlTowerChanceShift", "mathCoreRiskBonus"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 84;
  }
  if ((Number(input.balanceRevision) || 0) < 85) {
    next.mathPayoutCalibration = DEFAULT_PARAMS.mathPayoutCalibration;
    next.balanceRevision = 85;
  }
  if ((Number(input.balanceRevision) || 0) < 86) {
    ["mathPayoutCalibration", "mathBossLaterBaseChance", "mathBossOrdinalPenalty"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 86;
  }
  if ((Number(input.balanceRevision) || 0) < 87) {
    [
      "bossFirstMinWave", "bossFirstChance", "bossFirstChanceInc", "bossFirstChanceCap",
      "bossChanceMul", "bossChanceCap", "bossHpPerOrdinalMul",
      "mathBossLaterBuildInfluence", "mathBossLaterHpInfluence", "mathBossLaterBaseChance",
      "mathBossOrdinalPenalty", "mathFirstBossGuaranteePenalty",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    Object.keys(DEFAULT_PARAMS)
      .filter(key => /^wave_\d+_(bossBase|bossInc|bossCd)$/.test(key))
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 87;
  }
  if ((Number(input.balanceRevision) || 0) < 88) {
    [
      "mathPayoutCalibration",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
      "mathBossLaterBaseChance", "mathBossOrdinalPenalty",
      "bossLaterRewardMul", "bossHpMul", "bossHpPerOrdinalMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 88;
  }
  if ((Number(input.balanceRevision) || 0) < 89) {
    ["mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 89;
  }
  if ((Number(input.balanceRevision) || 0) < 108) {
    [
      "mathPayoutCalibration",
      "mathSingleSharePayoutSlope", "mathAreaSharePayoutSlope", "mathControlSharePayoutSlope",
      "mathBossFirstBaseChance", "mathBossLaterBaseChance", "mathBossOrdinalPenalty",
      "mathCoreRiskBonus", "bossLaterRewardMul", "bossHpMul", "bossHpPerOrdinalMul",
      "hero_fire_damage", "hero_ice_damage", "hero_ice_secondaryMul",
      "hero_electric_damage", "hero_poison_damage", "hero_poison_rate",
      "hero_poison_status", "hero_poison_splash", "hero_neutral_damage",
      "tower_blade_damage", "tower_blade_rate", "tower_blade_minionMul",
      "tower_blade_eliteMul", "tower_blade_bossMul",
      "tower_flame_bossMul", "tower_grenade_bossMul",
      "tower_chain_bossMul", "tower_gas_bossMul",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 108;
  }
  if ((Number(input.balanceRevision) || 0) < 149) {
    [
      "hero_fire_damage", "hero_ice_damage", "hero_electric_damage",
      "hero_poison_damage", "hero_poison_rate", "hero_neutral_damage",
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 149;
  }
  if ((Number(input.balanceRevision) || 0) < 150) {
    next.mathPoolBossAddCapScale = DEFAULT_PARAMS.mathPoolBossAddCapScale;
    next.balanceRevision = 150;
  }
  if ((Number(input.balanceRevision) || 0) < 151) {
    ["mathPoolBaseOutcomeCapMul", "mathPoolMeaningfulWinTriggerMul", "mathPoolMeaningfulWinFloorMul"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 151;
  }
  if ((Number(input.balanceRevision) || 0) < 152) {
    ["mathPoolStrongWinChance", "mathPoolStrongWinFloorMul"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 152;
  }
  if ((Number(input.balanceRevision) || 0) < 153) {
    ["mathPoolBaseOutcomeCapMul", "mathPoolBossAddCapScale", "mathPoolReleaseRate", "mathPoolReleaseCapMul"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 153;
  }
  return next;
}
function upgradeValueParamKey(towerId, rowIndex, key) {
  return `upgradeVal_${towerId}_${rowIndex + 1}_${key}`;
}
function upgradeEffectSpecs(towerId, rowIndex) {
  return (UPGRADE_VALUE_DEFS[towerId]?.[rowIndex] || []).map(([key, value]) => ({ key, value, meta:UPGRADE_VALUE_LABELS[key] || [key, "", 0, 9999, 1] }));
}
function upgradeEffectInput(towerId, rowIndex, spec) {
  const [label, unit, min, max, step] = spec.meta;
  const key = upgradeValueParamKey(towerId, rowIndex, spec.key);
  return `<label class="mini-input"><span>${label}</span>${inputCell(key, min, max, step, false)}<em>${unit}</em><code class="mini-key">${escapeHtml(key)}</code><small class="mini-formula">${escapeHtml(parameterLogic(key))}</small></label>`;
}
function upgradeEffectValue(towerId, rowIndex, key, fallback=0) {
  const value = Number(params[upgradeValueParamKey(towerId, rowIndex, key)]);
  return Number.isFinite(value) ? value : fallback;
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[char]));
}
function parameterLogic(key) {
  const modern = {
    mathCarryShapeEnabled:"啟用時：先算 fundedMean，再做等期望值兩點分布；E[重排彩金 | 當下狀態] = fundedMean，不額外增加RTP",
    mathCarryAnchorChance:"倍率維持目標 = 上波POT + 上波回收倍率 × 本波新增BET；另一分支彩金由公平平均反推",
    mathCarryMinReturn:"上波POT ÷ 上波累計BET ≥ 此值時才啟用倍率維持分布",
    mathPoolTemporaryDeficitEnabled:"上升分支可形成暫時個人池責任；責任由同分布下降分支與後續入水回收，報表需列期末未結責任",
    mathCheckpointRepriceEnabled:"1=每次戰鬥中升級後重估剩餘通關率；只重算尚未掉落的彩金，不改已顯示POT",
    mathCheckpointMinChance:"重定價通關率 = max(即時戰鬥估算, 本值)，避免除以接近0產生失控彩金",
    mathRerollEntryEnabled:"1=Reroll費用視為獨立投注；Reroll入水額 = 當前BET × 該次抽中入水倍率",
  };
  if (modern[key]) return modern[key];
  const exact = {
    mathTargetRtp:"檢核差 = 配籤加權平均 - mathTargetRtp；不再直接決定單次入池額",
    mathPoolEnabled:"啟用條件 = mathModelEnabled ≥ 0.5 且 mathPoolEnabled ≥ 0.5",
    mathPoolSeedBetUnits:"初始 available = 開池參考 BET × mathPoolSeedBetUnits",
    mathPoolMaxPayoutMul:"基礎獎金 = min(理論條件獎金, 本局累計 BET × mathPoolMaxPayoutMul, 個人池可用餘額)；再加待釋放預算",
    mathPoolFirstBossOutcomeCapMul:"首王應付上限 = max(進王前已顯示得分, 累計BET × 本值)",
    mathPoolBossCarryRecycleRate:"每次開新局時：成熟額 = 上局剩餘BOSS子池 × 本值；只解除用途限制，個人池available總額不變",
    mathPoolBossAddCapScale:"結果上限倍率增加量 = Boss加總倍率 × 本值",
    mathPoolReleaseRate:"第1波一般舊餘額釋放率 = 本值；已公開POT會全額帶入下一波重新定價，不受本值折減",
    mathPoolDeepReleaseRate:"深追一般舊餘額釋放率上限；只控制尚未公開的可用餘額，不會稀釋已顯示POT",
    mathPoolDepthRampWaves:"深度進度 = clamp((波次-1) ÷ 本值, 0, 1)",
    mathPoolFirstBossReleaseRate:"首王強獎釋放率起點 = 本值",
    mathPoolLaterBossReleaseRate:"後王強獎釋放率起點 = 本值",
    mathPoolBossReleaseRate:"後王深追強獎釋放率上限 = 本值",
    mathPoolReleaseCapMul:"額外釋放上限 = 本局累計 BET × mathPoolReleaseCapMul",
    mathPoolHotWaveDeepWeight:"熱波權重 = 前段熱波權重 + (本值-前段熱波權重) × 深度進度；該波五層彩金再依實際權重正規化至期望1",
    mathPoolMeaningfulWinTriggerMul:"有感判定 = 原始應付 ≥ 本局累計 BET × 本值",
    mathPoolMeaningfulWinFloorMul:"有感最低回收 = max(累計 BET, 累計 BET × 本值)",
    mathPoolStrongWinChance:"前段強獎機率 = 本值；實際強獎機率會依深度進度往深追值插值",
    mathPoolStrongWinDeepChance:"實際強獎機率 = lerp(前段強獎機率, 深追強獎機率, 深度進度)",
    mathPoolStrongWinEarlyFloorMul:"前段BOSS強獎底線 = 累計BET × 本值",
    mathPoolStrongWinFloorMul:"BOSS強獎底線 = 累計BET × lerp(前段底線, 本值, 深度進度)",
    mathPoolHotWaveEarlyFloorMul:"前段熱波底線 = 累計BET × 本值",
    mathPoolHotWaveFloorMul:"熱波底線 = 累計BET × lerp(前段底線, 本值, 深度進度)",
    mathPoolHotWaveEarlyReleaseRate:"前段熱波舊餘額釋放率 = 本值",
    mathPoolHotWaveReleaseRate:"熱波釋放率 = lerp(前段釋放率, 本值, 深度進度)",
    bossFirstMinWave:"wave < 本值時首王機率 = 0",
    bossFirstChance:"首王機率 = min(上限, 本值 + 未出現波數 × 每波增率)",
    bossFirstChanceInc:"首王未出現時，每波機率增加本值百分點",
    bossFirstChanceCap:"首王機率 = min(計算機率, 本值)",
    bossChanceMul:"後王機率 = min(上限, 基礎權重 + 累積權重 × 本值)",
    bossChanceCap:"後王單波機率 = min(計算機率, 本值)",
    bossBetStepMul:"BOSS階梯 = 1 + 已擊殺BOSS數 × (本值 - 1)",
    betMidMul:"11-20波 BET倍率 = max(BOSS階梯, 本值)",
    betDeepMul:"21-30波 BET倍率 = max(BOSS階梯, 本值)",
    bossHpMul:"第2隻後王HP = 類型HP × 本值",
    bossHpPerOrdinalMul:"第n隻後王HP再乘 本值^(n-2)",
    bossFirstRewardMul:"首王加成倍率 = max(1, 抽中加成 × 本值)",
    bossLaterRewardMul:"後王加成倍率 = max(1, 抽中加成 × 本值)",
    bossFirstDifficultyCompression:"首王難度倍率 = 1 + (抽中倍率 - 1) × 本值",
    bossShieldHpPct:"每進入一個BOSS階段，裝甲值 = BOSS最大HP × 本值 ÷ 100",
    bossShieldDamageMul:"裝甲存在時，BOSS本體扣血 = 計算後傷害 × 本值；同一傷害也會削減裝甲",
    bossBreakDamageMul:"裝甲歸零後，BREAK期間傷害 = 計算後傷害 × 本值",
    bossBreakDuration:"裝甲歸零後，BREAK窗口維持本值秒；之後恢復一般承傷",
    bossBreakAttackPause:"裝甲歸零後，BOSS停止移動與攻擊本值秒",
    bossAttackWindup:"BOSS實際命中基地前，先蓄力本值秒；狂暴時再除以攻速倍率平方根",
    bossAttackIntervalJitterPct:"每次BOSS攻擊間隔 = 基礎間隔 × random(1-本值%, 1+本值%)",
    bossPreludeCountMul:"BOSS波前置小怪數 = round(一般波抽中數量 × 本值)，最低4隻；場上剩2隻以下時生成BOSS",
    bossFirstAtkMul:"首王基地傷害 = BOSS類型攻擊 × 難度攻擊倍率 × 本值",
    bossEnrageHpPct:"BOSS目前HP ÷ 最大HP ≤ 本值 ÷ 100 時進入狂暴",
    bossEnrageAttackSpeedMul:"狂暴攻擊間隔 = 原攻擊間隔 ÷ 本值",
    mathAttributeMinionInfluence:"一般波通關率修正 = (依角色、砲台與升級投入加權的屬性倍率 - 1) × 本值",
    mathAttributeBossInfluence:"BOSS通關率修正 = (依角色、砲台與升級投入加權的屬性倍率 - 1) × 本值",
    preBossRewardMul:"首王前一般波彩金 = 原彩金 × 本值",
    postBossRewardFunding:"王後彩金使用BET = 基礎BET × [1 + (BOSS階梯-1) × 本值]",
    baseHp:"開局基地 HP = 本值",
    spawnInterval:"相鄰一般怪生成時間差 = 本值秒",
    deepMoneyBase:"11波後彩金倍率起點 = 本值",
    deepMoneyRamp:"深追彩金倍率 = deepMoneyBase + (wave-11) × 本值",
    deepMoneyCap:"深追彩金倍率 = min(計算倍率, 本值)",
    eliteMoneyMul:"菁英分錢權重 = 怪物金錢權重 × 本值；不增加整波彩金",
    dropChanceMul:"小怪分錢權重 = 類型掉錢率 × 本值；不增加整波彩金",
    waveAttrBiasEarly:"前2波主屬性採無屬性的機率 = 本值",
    waveAttrBias:"第3波後怪物採當波主屬性的機率 = 本值",
  };
  if (exact[key]) return exact[key];
  if (/^mathPoolEntryTier\d+Mul$/.test(key)) return "抽中該籤位時，實際入池 = BET × 本倍率；此層只保留次要波動，主要高倍來自BOSS";
  if (/^mathPoolEntryTier\d+Weight$/.test(key)) return "該籤位機率 = 本權重 ÷ 六個籤位權重總和";
  if (/^waveReward.+Weight$/.test(key)) return "該彩金層機率 = 本權重 ÷ 所有彩金層權重總和";
  if (/^waveReward.+Mul$/.test(key)) return "一般波彩金因子 = 本倍率 ÷ 五層加權平均；維持中低幅度的小賺與小虧";
  if (/^boss(Low|Mid|High)Weight$/.test(key)) return "倍率層機率 = 本權重 ÷ 低中高權重總和";
  if (/^boss(Low|Mid|High)(Min|Max)$/.test(key)) return "層內加成 = uniform(下限, 上限)；最終顯示倍率 = 1 + 加總加成";
  if (/^boss(First)?Diff.+Weight$/.test(key)) return "難度機率 = 本權重 ÷ 該BOSS難度權重總和";
  if (/^bossDiff.+Hp$/.test(key)) return "實際BOSS HP = 類型HP × 後王成長 × 本難度HP倍率";
  if (/^bossDiff.+Atk$/.test(key)) return "實際BOSS攻擊 = 類型攻擊 × 本難度攻擊倍率";
  if (/^bossDiff.+Speed$/.test(key)) return "實際BOSS速度 = 類型速度 × 本難度速度倍率";
  let match = key.match(/^monster_(.+)_(hp|speed|range|atk|interval|exp|moneyMin|moneyMax|fireMul|iceMul|electricMul|poisonMul|neutralMul)$/);
  if (match) {
    const field = match[2];
    const map = {
      hp:"實際HP = 本值 × wave_hpMul × 菁英/BOSS難度倍率",
      speed:"每秒位移 = 本值 × 難度速度倍率 × 狀態速度倍率",
      range:"距基地距離 ≤ 本值時停止移動並攻擊",
      atk:"每次基地傷害 = 本值 × 難度攻擊倍率",
      interval:"攻擊次數/秒 = 1 ÷ 本值；每隔本值秒攻擊一次",
      exp:"擊殺EXP = 本值；累積達 exp_等級 時升級",
      moneyMin:"分錢基礎權重下限；本波總彩金不變",
      moneyMax:"分錢基礎權重上限；本波總彩金不變",
      fireMul:"火屬性最終傷害 = 原傷害 × 本值", iceMul:"冰屬性最終傷害 = 原傷害 × 本值",
      electricMul:"電屬性最終傷害 = 原傷害 × 本值", poisonMul:"毒屬性最終傷害 = 原傷害 × 本值",
      neutralMul:"無屬性最終傷害 = 原傷害 × 本值",
    };
    return map[field];
  }
  if (/^template_.+_(normal|fast|tank|ranged|special)$/.test(key)) return "模板內怪種占比 = 本權重 ÷ 該模板怪種權重總和";
  if (/^band_\d+_countMin$/.test(key)) return "本波怪物數 = 整數亂數[countMin, countMax]";
  if (/^band_\d+_countMax$/.test(key)) return "本波怪物數 = 整數亂數[countMin, countMax]";
  if (/^band_\d+_drop_/.test(key)) return "該類怪物分錢權重 = 模板數量 × 本分配率 × 怪物金錢權重";
  if (/^band_\d+_template_/.test(key)) return "區間抽中模板機率 = 本權重 ÷ 可用模板權重總和";
  match = key.match(/^wave_(\d+)_(.+)$/);
  if (match) {
    const field = match[2];
    const map = {
      hpMul:"該波怪物HP = 怪物類型HP × 本值",
      eliteWeight:"菁英出現判定使用本權重",
      elite1:"菁英數量抽中1隻的相對權重 = 本值",
      elite2:"菁英數量抽中2隻的相對權重 = 本值",
      elite3:"菁英數量抽中3隻的相對權重 = 本值",
      bossBase:"後王機率基礎值 = 本值",
      bossInc:"未出王時累積權重 += 本值",
      bossCd:"出王後本值波內不可再出BOSS",
      mathClear:"該波風險定價的基礎通關率 = 本值",
      mathPayout:"該波彩金反推倍率 = 本值",
      mathBossCorrection:"BOSS計價通關率 += 本值",
    };
    return map[field] || `第${match[1]}波計算直接讀取本值`;
  }
  if (/^exp_\d+$/.test(key)) return "角色/砲塔升級觸發 = 累積EXP ≥ 本級所需EXP";
  match = key.match(/^hero_(.+)_(damage|rate|range|splash|status|targets|secondaryMul|zoneDuration|projectileSpeed)$/);
  if (match) {
    const map = {damage:"角色每次命中基礎傷害 = 本值",rate:"角色每秒攻擊次數 = 本值",range:"可選取目標距離 ≤ 本值",splash:"範圍命中判定半徑 = 本值",status:"角色燃燒/冰凍/毒等狀態基礎值 = 本值",targets:"同次攻擊最多處理目標數 = 本值",secondaryMul:"次要目標傷害 = 主傷害 × 本值",zoneDuration:"地面區域持續秒數 = 本值",projectileSpeed:"彈體每秒移動距離 = 本值"};
    return map[match[2]];
  }
  match = key.match(/^tower_(.+)_(damage|rate|range|splash|duration|cooldown|tick|minionMul|eliteMul|bossMul)$/);
  if (match) {
    const map = {damage:"單次/單Tick基礎傷害 = 本值",rate:"每秒攻擊/傷害跳數 = 本值",range:"可鎖定目標距離 ≤ 本值",splash:"範圍命中半徑 = 本值",duration:"持續攻擊或區域存續秒數 = 本值",cooldown:"一次攻擊循環結束後冷卻本值秒",tick:"區域每隔本值秒造成一次傷害",minionMul:"對小怪傷害 = 原傷害 × 本值",eliteMul:"對菁英傷害 = 原傷害 × 本值",bossMul:"對BOSS傷害 = 原傷害 × 本值"};
    return map[match[2]];
  }
  if (/^upgradeVal_/.test(key)) return "選到該升級後，以本值套入升級效果；可重複選項依取得次數累加或相乘";
  if (/^hero(Damage|Rate|Quantity)/.test(key)) return "角色升級時把本值套入傷害、攻速或數量成長";
  if (/^math/.test(key)) return "數學定價/驗證參數；依引擎 key 直接套入 createMathTicket 或通關率估算";
  return `引擎於對應流程直接讀取 ${key}；完整位置見「計算邏輯」分頁`;
}
function parameterTiming(key) {
  if (/^mathPoolEntryTier/.test(key)) return "每次 BET／Reroll 入池抽籤時";
  if (POOL_PARAM_KEYS.has(key)) return "每次 BET 入池／Collect 結算";
  if (/^waveReward/.test(key)) return "按 BET 建立波次時";
  if (/^boss/.test(key) || /^wave_\d+_boss/.test(key)) return "BOSS 出現、生成或擊殺時";
  if (/^monster_/.test(key) || /^tower_/.test(key) || /^hero_/.test(key)) return "生成單位或每次攻擊時";
  if (/^upgrade/.test(key)) return "產生/套用升級選項時";
  if (/^exp_/.test(key)) return "擊殺取得 EXP 後";
  if (/^template_|^band_/.test(key)) return "建立普通波怪物組成時";
  if (/^wave_/.test(key)) return "進入該波時";
  return "依所屬系統即時計算";
}
function inputCell(key, min, max, step, showMeta=true) {
  const percent = key === "mathTargetRtp";
  const scale = percent ? .01 : 1;
  const value = Number(params[key]);
  const shown = Number.isFinite(value) ? value / scale : 0;
  const input = `<input data-key="${key}" data-scale="${scale}" type="number" min="${min / scale}" max="${max / scale}" step="${step / scale}" value="${shown}">`;
  if (!showMeta) return input;
  return `<div class="param-input-wrap">${input}<code class="param-key">${escapeHtml(key)}</code><span class="param-formula">${escapeHtml(parameterLogic(key))}</span></div>`;
}
function poolEntryStats() {
  const rows = POOL_ENTRY_TIERS.map(({ tier, mulKey, weightKey }) => ({
    tier, mulKey, weightKey,
    multiplier:Math.max(0, Number(params[mulKey]) || 0),
    weight:Math.max(0, Number(params[weightKey]) || 0),
  }));
  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  rows.forEach(row => { row.probability = totalWeight > 0 ? row.weight / totalWeight : 0; });
  const mean = totalWeight > 0
    ? rows.reduce((sum, row) => sum + row.multiplier * row.probability, 0)
    : Math.max(0, Number(params.mathTargetRtp) || 0);
  const variance = rows.reduce((sum, row) => sum + row.probability * (row.multiplier - mean) ** 2, 0);
  const sd = Math.sqrt(Math.max(0, variance));
  const profitChance = rows.reduce((sum, row) => sum + (row.multiplier > 1 ? row.probability : 0), 0);
  return { rows, totalWeight, mean, sd, profitChance };
}
function updatePoolEntryStats() {
  const stats = poolEntryStats();
  stats.rows.forEach(row => {
    const tableRow = ui.poolEntryBody?.querySelector(`tr[data-pool-tier="${row.tier}"]`);
    if (!tableRow) return;
    const probability = tableRow.querySelector("[data-pool-probability]");
    const amount = tableRow.querySelector("[data-pool-amount]");
    const contribution = tableRow.querySelector("[data-pool-contribution]");
    if (probability) probability.textContent = `${(row.probability * 100).toFixed(2)}%`;
    if (amount) amount.textContent = (100 * row.multiplier).toFixed(2);
    if (contribution) contribution.textContent = `${(row.multiplier * row.probability * 100).toFixed(2)} pp`;
  });
  const target = Math.max(0, Number(params.mathTargetRtp) || 0);
  const gap = stats.mean - target;
  if (ui.poolEntryRtp) ui.poolEntryRtp.textContent = `${(stats.mean * 100).toFixed(2)}%`;
  if (ui.poolEntryGap) {
    ui.poolEntryGap.textContent = Math.abs(gap) < .00005
      ? `符合目標 ${(target * 100).toFixed(2)}%`
      : `與目標相差 ${gap >= 0 ? "+" : ""}${(gap * 100).toFixed(2)} pp`;
    ui.poolEntryGap.classList.toggle("warn", Math.abs(gap) >= .00005);
  }
  if (ui.poolEntryProfitChance) ui.poolEntryProfitChance.textContent = `${(stats.profitChance * 100).toFixed(2)}%`;
  [[ui.poolEntrySd1,1],[ui.poolEntrySd5,5],[ui.poolEntrySd10,10],[ui.poolEntrySd20,20]].forEach(([element, samples]) => {
    if (element) element.textContent = `${(stats.sd / Math.sqrt(samples)).toFixed(3)}x`;
  });
  return stats;
}
function buildPoolEntryTable() {
  if (!ui.poolEntryBody) return;
  ui.poolEntryBody.innerHTML = POOL_ENTRY_TIERS.map(({ tier, mulKey, weightKey }) => `<tr data-pool-tier="${tier}"><td>籤位 ${tier}</td><td>${inputCell(mulKey,0,100,.01,false)}</td><td>${inputCell(weightKey,0,100000,1,false)}</td><td data-pool-probability>--</td><td data-pool-amount>--</td><td data-pool-contribution>--</td><td class="engine-key-cell"><code>${mulKey}</code><br><code>${weightKey}</code></td><td class="formula-cell">P = weight ÷ Σweight<br>入池 = BET × multiplier</td></tr>`).join("");
  bindInputs(ui.poolEntryBody);
  updatePoolEntryStats();
}
function bindInputs(root=document) {
  root.querySelectorAll("input[data-key]").forEach(input => input.addEventListener("input", () => {
    params[input.dataset.key] = Number(input.value);
    if (input.dataset.key.startsWith("upgrade")) buildUpgradeOptionTables();
    updateEvaluation();
  }));
}
function build() {
  buildParamTable(ui.poolParamBody, POOL_PARAM_GROUPS);
  buildPoolEntryTable();
  buildParamTable(ui.bossEmotionBody, BOSS_EMOTION_GROUPS);
  buildRewardTables();
  buildMonsterTable();
  buildTemplateTables();
  buildWaveTable();
  buildExpTable();
  buildHeroTable();
  buildTowerTable();
  buildParamTable(ui.upgradeBody, [["升級係數","player-group",UPGRADE_ROWS]]);
  buildUpgradeOptionTables();
  bindInputs(document);
  updateEvaluation();
  renderEngineeringLogic();
}
function buildRewardTables() {
  const rewardTotal = WAVE_REWARD_TIERS.reduce((sum, [, , weightKey]) => sum + Math.max(0, Number(params[weightKey]) || 0), 0) || 1;
  ui.rewardBody.innerHTML = WAVE_REWARD_TIERS.map(([, label, weightKey, mulKey, note]) => {
    const probability = Math.max(0, Number(params[weightKey]) || 0) / rewardTotal;
    const budget = 100 * Math.max(0, Number(params[mulKey]) || 0) * params.moneyMul;
    return `<tr><td>${label}</td><td>${inputCell(weightKey,0,1000,1)}</td><td>${inputCell(mulKey,0,10,.01)}</td><td>${(probability*100).toFixed(1)}%</td><td>${budget.toFixed(1)}</td><td>${note}</td></tr>`;
  }).join("");

  const difficultyTotal = BOSS_DIFFICULTY_TIERS.reduce((sum, [, , weightKey]) => sum + Math.max(0, Number(params[weightKey]) || 0), 0) || 1;
  const firstDifficultyTotal = BOSS_DIFFICULTY_TIERS.reduce((sum, [, , weightKey]) => sum + Math.max(0, Number(params[firstBossDifficultyWeightKey(weightKey)]) || 0), 0) || 1;
  ui.bossDifficultyBody.innerHTML = BOSS_DIFFICULTY_TIERS.map(([, label, weightKey, hpKey, atkKey, speedKey]) => {
    const probability = Math.max(0, Number(params[weightKey]) || 0) / difficultyTotal;
    const firstWeightKey = firstBossDifficultyWeightKey(weightKey);
    const firstProbability = Math.max(0, Number(params[firstWeightKey]) || 0) / firstDifficultyTotal;
    const pressure = params[hpKey] * .6 + params[atkKey] * .3 + params[speedKey] * .1;
    return `<tr><td>${label}</td><td>${inputCell(firstWeightKey,0,1000,1)}</td><td>${(firstProbability*100).toFixed(1)}%</td><td>${inputCell(weightKey,0,1000,1)}</td><td>${(probability*100).toFixed(1)}%</td><td>${inputCell(hpKey,.1,10,.01)}</td><td>${inputCell(atkKey,.1,10,.01)}</td><td>${inputCell(speedKey,.1,3,.01)}</td><td>${pressure.toFixed(2)}</td></tr>`;
  }).join("");
  bindInputs(ui.rewardBody);
  bindInputs(ui.bossDifficultyBody);
}
function buildParamTable(tbody, groups) {
  if (!tbody) return;
  tbody.innerHTML = "";
  groups.forEach(([title, className, rows]) => {
    tbody.insertAdjacentHTML("beforeend", `<tr class="group-row ${className}"><td colspan="8">${title}</td></tr>`);
    rows.forEach(([key,label,unit,min,max,step,note]) => tbody.insertAdjacentHTML("beforeend", `<tr><td>${label}</td><td>${inputCell(key,min,max,step,false)}</td><td>${unit}</td><td>${min}</td><td>${max}</td><td class="engine-key-cell"><code>${escapeHtml(key)}</code></td><td>${note}</td><td class="formula-cell">${escapeHtml(parameterLogic(key))}</td></tr>`));
  });
  bindInputs(tbody);
}
function buildMonsterTable() {
  const monsterTable = ui.monsterBody.closest("table");
  monsterTable.querySelector("thead").innerHTML = `<tr><th>怪物</th>${MONSTER_ALL_FIELDS.map(([,label]) => `<th>${label}</th>`).join("")}</tr>`;
  const monsterCaption = monsterTable.caption || monsterTable.createCaption();
  monsterCaption.textContent = "金錢上下限與波次分配率現在決定怪物分到整波彩金的相對權重，不會改變本波總彩金；屬性倍率仍可逐類調整。";
  const group = (title, rows) => `<tr class="group-row player-group"><td colspan="${MONSTER_ALL_FIELDS.length + 1}">${title}</td></tr>` + rows.map(([id,name,base]) => {
    const mergedBase = { ...base, ...(MONSTER_ATTRIBUTE_BASE[id] || {}) };
    const cells = MONSTER_ALL_FIELDS.map(([f,,min,max,step]) => Number.isFinite(mergedBase[f]) ? `<td>${inputCell(`monster_${id}_${f}`,min,max,step)}</td>` : `<td><span class="x-cell">X</span></td>`).join("");
    return `<tr><td>${name}</td>${cells}</tr>`;
  }).join("");
  ui.monsterBody.innerHTML = group("小怪", MONSTER_TYPES) + group("菁英怪", ELITE_TYPES) + group("BOSS", BOSS_TYPES);
  bindInputs(ui.monsterBody);
}
function buildTemplateTables() {
  ui.templateBody.innerHTML = TEMPLATE_IDS.map(([tid,name]) => `<tr><td>${name}</td>${MONSTER_WEIGHT_IDS.map(([mid]) => `<td>${inputCell(`template_${tid}_${mid}`,0,1000,1)}</td>`).join("")}</tr>`).join("");
  ui.bandBody.innerHTML = BAND_BASE.map(([label], i) => {
    const id = i + 1;
    return `<tr><td>${label}</td><td>${inputCell(`band_${id}_countMin`,0,200,1)}</td><td>${inputCell(`band_${id}_countMax`,0,200,1)}</td>${MONSTER_WEIGHT_IDS.map(([mid]) => `<td>${inputCell(`band_${id}_drop_${mid}`,0,1,.01)}</td>`).join("")}${TEMPLATE_IDS.map(([tid]) => `<td>${inputCell(`band_${id}_template_${tid}`,0,1000,1)}</td>`).join("")}</tr>`;
  }).join("");
  bindInputs(ui.templateBody); bindInputs(ui.bandBody);
}
function buildWaveTable() {
  const table = ui.waveBody.closest("table");
  table.querySelector("thead").innerHTML = `<tr><th>波次</th>${WAVE_FIELDS.map(([,label]) => `<th>${label}</th>`).join("")}</tr>`;
  ui.waveBody.innerHTML = WAVE_BASE.map(row => `<tr><td>${row[0]}</td>${WAVE_FIELDS.map(([field]) => {
    const min = field === "mathBossCorrection" ? -.8 : 0;
    const max = field === "mathClear" ? .999 : field === "mathPayout" ? 2 : field === "mathBossCorrection" ? .8 : field === "bossCd" ? 10 : 100;
    const step = field === "mathClear" ? .001 : field === "mathBossCorrection" ? .005 : .01;
    return `<td>${inputCell(`wave_${row[0]}_${field}`,min,max,step)}</td>`;
  }).join("")}</tr>`).join("");
  bindInputs(ui.waveBody);
}
function buildExpTable() {
  ui.expBody.innerHTML = EXP_BASE.map((_,i) => `<tr><td>${i+1} → ${i+2}</td><td>${inputCell(`exp_${i+1}`,0,99999,1)}</td></tr>`).join("");
  bindInputs(ui.expBody);
}
function buildHeroTable() {
  buildParamTable(ui.heroGlobalBody, HERO_GLOBAL_ROWS);
  const heroTable = ui.heroBody.closest("table");
  heroTable.querySelector("thead").innerHTML = `<tr><th>角色</th><th>屬性</th><th>攻擊方式</th>${HERO_FIELDS.map(([,label]) => `<th>${label}</th>`).join("")}<th>單體估算</th><th>群體估算</th></tr>`;
  ui.heroBody.innerHTML = HERO_TUNING.map(([id,name,attr,mode]) => `<tr><td>${name}</td><td>${attr}</td><td><span class="tag tag-core">${mode}</span></td>${HERO_FIELDS.map(([field,,min,max,step]) => `<td>${HERO_FIELD_USE[id].has(field) ? inputCell(`hero_${id}_${field}`,min,max,step) : '<span class="x-cell">X</span>'}</td>`).join("")}<td data-hero-score="${id}:single"></td><td data-hero-score="${id}:group"></td></tr>`).join("");
  bindInputs(ui.heroBody);
}

function heroPowerEstimate(id) {
  const mode = HERO_TUNING.find(row => row[0] === id)?.[3] || "";
  const value = field => Math.max(0, Number(params[`hero_${id}_${field}`]) || 0);
  const damage = value("damage");
  const rate = value("rate");
  const status = value("status");
  const targets = Math.max(1, Math.round(value("targets")));
  const secondary = value("secondaryMul");
  let single = damage * rate;
  let group = single;
  if (mode === "爆燃火球") {
    single += status;
    group = single + damage * rate * secondary * 1.8;
  } else if (mode === "貫穿冰槍" || mode === "連鎖電弧") {
    group = single * (1 + secondary * Math.max(0, targets - 1));
  } else if (mode === "腐蝕毒囊") {
    single += status * 2;
    group = single * (1 + secondary * 1.6) + status * value("zoneDuration") * .55;
  } else if (mode === "三連實彈") {
    single *= targets;
    group = single;
  }
  return { single, group };
}

function updateHeroEvaluationCells() {
  HERO_TUNING.forEach(([id]) => {
    const score = heroPowerEstimate(id);
    const single = ui.heroBody.querySelector(`[data-hero-score="${id}:single"]`);
    const group = ui.heroBody.querySelector(`[data-hero-score="${id}:group"]`);
    if (single) single.textContent = score.single.toFixed(1);
    if (group) group.textContent = score.group.toFixed(1);
  });
}
function buildTowerTable() {
  const towerTable = ui.towerBody.closest("table");
  towerTable.querySelector("thead").innerHTML = `<tr><th>塔</th>${TOWER_FIELDS.map(([field,label]) => `<th>${label}${field === "rate" ? "<br><small>下/秒</small>" : field === "cooldown" || field === "duration" || field === "tick" ? "<br><small>秒</small>" : field.endsWith("Mul") ? "<br><small>傷害倍率</small>" : ""}</th>`).join("")}</tr>`;
  const towerCaption = towerTable.caption || towerTable.createCaption();
  towerCaption.textContent = "目標係數只改變對該類敵人的傷害：單體塔偏菁英／BOSS，群體塔偏小怪。";
  ui.towerBody.innerHTML = TOWER_TUNING.map(([id,name]) => `<tr><td>${name}</td>${TOWER_FIELDS.map(([f]) => `<td>${towerFieldCell(id, f)}</td>`).join("")}</tr>`).join("");
  bindInputs(ui.towerBody);
}
function buildUpgradeOptionTables() {
  const scored = upgradeOptionScores();
  ui.upgradeOptions.innerHTML = TOWER_TUNING.map(([towerId, towerName], towerIndex) => {
    const rows = scored.filter(row => row.towerIndex === towerIndex);
    const body = rows.map(row => {
      const cls = row.rating > 135 || row.rating < 70 ? "score-bad" : row.rating > 118 || row.rating < 84 ? "score-warn" : "score-good";
      const valueInputs = row.specs.length ? row.specs.map(spec => upgradeEffectInput(row.towerId, row.rowIndex, spec)).join("") : `<span class="x-cell">X</span>`;
      return `<tr><td>${row.name}</td><td class="upgrade-value-cell">${valueInputs}</td><td>${row.trigger}</td><td>${row.effect}</td><td><span class="tag ${row.tagClass}">${row.tag}</span></td><td>${row.output.toFixed(1)}</td><td>${row.control.toFixed(1)}</td><td>${row.mechanic.toFixed(1)}</td><td>${row.total.toFixed(1)}</td><td class="${cls}">${Math.round(row.rating)}</td><td class="${cls}">${row.state}</td></tr>`;
    }).join("");
    return `<section class="sheet-card upgrade-card"><h2>${towerName}</h2><table class="data-table upgrade-option-table"><thead><tr><th>升級名稱</th><th>選項係數</th><th>敘述</th><th>效果</th><th>類型</th><th>輸出分</th><th>控場分</th><th>機制分</th><th>強度分</th><th>評分</th><th>狀態</th></tr></thead><tbody>${body}</tbody></table></section>`;
  }).join("");
  bindInputs(ui.upgradeOptions);
}
function buildUpgradeOptionTables() {
  const scored = upgradeOptionScores();
  ui.upgradeOptions.innerHTML = TOWER_TUNING.map(([towerId, towerName], towerIndex) => {
    const rows = scored.filter(row => row.towerIndex === towerIndex);
    const body = rows.map(row => {
      const cls = row.rating > 135 || row.rating < 70 ? "score-bad" : row.rating > 118 || row.rating < 84 ? "score-warn" : "score-good";
      const valueInputs = row.specs.length ? row.specs.map(spec => upgradeEffectInput(row.towerId, row.rowIndex, spec)).join("") : `<span class="x-cell">X</span>`;
      return `<tr><td>${row.name}</td><td class="upgrade-value-cell">${valueInputs}</td><td>${row.trigger}</td><td>${row.effect}</td><td><span class="tag ${row.tagClass}">${row.tag}</span></td><td>${row.output.toFixed(1)}</td><td>${row.control.toFixed(1)}</td><td>${row.mechanic.toFixed(1)}</td><td>${row.total.toFixed(1)}</td><td class="${cls}">${Math.round(row.rating)}</td><td class="${cls}">${row.state}</td></tr>`;
    }).join("");
    return `<section class="sheet-card upgrade-card"><h2>${towerName}</h2><table class="data-table upgrade-option-table"><thead><tr><th>升級選項</th><th>數值調整</th><th>觸發</th><th>效果</th><th>類型</th><th>輸出</th><th>控場</th><th>機制</th><th>總分</th><th>評級</th><th>狀態</th></tr></thead><tbody>${body}</tbody></table></section>`;
  }).join("");
  bindInputs(ui.upgradeOptions);
}

function upgradeOptionScores() {
  const rows = [];
  UPGRADE_GRID.forEach((upgradeRow, rowIndex) => {
    upgradeRow.forEach((option, towerIndex) => {
      if (!option) return;
      const [towerId] = TOWER_TUNING[towerIndex];
      rows.push({ towerId, towerIndex, rowIndex, ...scoreUpgradeOption(towerId, rowIndex, option) });
    });
  });
  const avg = rows.reduce((sum, row) => sum + row.total, 0) / (rows.length || 1);
  rows.forEach(row => {
    row.rating = avg ? row.total / avg * 100 : 0;
    row.state = row.rating > 135 ? "偏強" : row.rating < 70 ? "偏弱" : row.rating > 118 ? "略強" : row.rating < 84 ? "略弱" : "正常";
  });
  return rows;
}
function upgradeOptionScores() {
  const rows = [];
  UPGRADE_GRID.forEach((upgradeRow, rowIndex) => {
    upgradeRow.forEach((option, towerIndex) => {
      if (!option) return;
      const [towerId] = TOWER_TUNING[towerIndex];
      rows.push({ towerId, towerIndex, rowIndex, ...scoreUpgradeOption(towerId, rowIndex, option) });
    });
  });
  rows.forEach(row => { row.roleTotal = roleAdjustedUpgradeScore(row); });
  const globalAvg = rows.reduce((sum, row) => sum + row.roleTotal, 0) / (rows.length || 1);
  const towerAvgs = {};
  TOWER_TUNING.forEach(([towerId], towerIndex) => {
    const towerRows = rows.filter(row => row.towerIndex === towerIndex);
    towerAvgs[towerId] = towerRows.reduce((sum, row) => sum + row.roleTotal, 0) / (towerRows.length || 1);
  });
  rows.forEach(row => {
    row.globalRating = globalAvg ? row.roleTotal / globalAvg * 100 : 0;
    row.towerRating = towerAvgs[row.towerId] ? row.roleTotal / towerAvgs[row.towerId] * 100 : 0;
    row.rating = row.towerRating;
    row.state = upgradeBalanceState(row.towerRating);
  });
  return rows;
}

function scoreUpgradeOption(towerId, rowIndex, option) {
  const [name, trigger, effect] = option;
  const requirement = UPGRADE_REQUIREMENT_LABELS[name] || "";
  const specs = upgradeEffectSpecs(towerId, rowIndex);
  const value = key => {
    const spec = specs.find(item => item.key === key);
    return upgradeEffectValue(towerId, rowIndex, key, spec ? spec.value : 0);
  };
  const text = `${name} ${trigger} ${effect}`;
  let output = 0;
  let control = 0;
  let mechanic = rowIndex >= 4 ? 8 : 0;

  if (text.includes("傷害+40")) output += pctValue(params.upgradeDamage40, 120);
  if (text.includes("傷害+35") || text.includes("每段傷害+35")) output += pctValue(params.upgradeDamage35, 115);
  if (text.includes("傷害+30") || text.includes("每段傷害+30")) output += pctValue(params.upgradeDamage30, 110);
  if (text.includes("攻速+25") || text.includes("Tick速度+25")) output += pctValue(params.upgradeRate25, 115);
  if (text.includes("攻速+20") || text.includes("布置速度+20")) output += pctValue(params.upgradeRate20, 105);
  if (text.includes("範圍+25") || text.includes("攻擊範圍+25") || text.includes("爆炸範圍+25")) output += pctValue(params.upgradeRange25, towerUsesField(towerId, "splash") ? 90 : 64);
  if (text.includes("持續時間+50")) output += pctValue(params.upgradeDuration50, towerId === "laser" || towerId === "flame" ? 95 : 68);

  if (text.includes("額外子彈")) output += 58;
  if (text.includes("爆點+1")) output += 64;
  if (text.includes("額外火焰") || text.includes("額外炸彈") || text.includes("額外毒霧") || text.includes("額外毒氣彈") || text.includes("額外毒針") || text.includes("額外斬擊") || text.includes("額外陷阱")) output += towerUsesField(towerId, "splash") ? 66 : 54;
  if (text.includes("穿透敵人+1")) output += 48;
  if (text.includes("額外閃電鏈+1")) output += 58;
  if (text.includes("彈掉目標+3") || text.includes("彈跳目標+")) output += Math.max(0, params.upgradeExtraChain) * 15;
  if (text.includes("折射")) output += 48;
  if (text.includes("路徑傷害") && !text.includes("路徑上造成的傷害+100")) output += Math.max(0, params.upgradePathDamage) * .7;
  if (text.includes("路徑上造成的傷害+100")) output += 44;
  if (text.includes("持續增傷")) output += 34;
  if (text.includes("加成效果提升50")) output += 28;
  if (text.includes("持續照射需要時間-50")) output += 32;
  if (text.includes("迴旋飛刃") && !text.includes("傷害+")) output += 36;
  if (text.includes("飛刃傷害+100")) output += pctValue(params.upgradeDotDamage100, 35);
  if (text.includes("額外迴旋刃+1")) output += 44;

  if (text.includes("燃燒") || text.includes("中毒")) output += dotScore(text);
  if (text.includes("易傷") || text.includes("受到傷害+15")) output += Math.max(0, params.upgradeVulnerable15) * 240;
  if (text.includes("增傷效果+50")) output += 28;

  if (text.includes("緩速")) control += Math.max(0, params.upgradeSlow25) * 128;
  if (text.includes("緩速時間+50") || text.includes("冰痕持續時間+50")) control += pctValue(params.upgradeDuration50, 45);
  if (text.includes("冰痕") && !text.includes("持續時間")) control += 30;
  if (text.includes("凍結")) control += 58;
  if (text.includes("麻痺")) control += text.includes("時間+") ? pctValue(params.upgradeDuration50, 52) : 44;
  if (text.includes("定身")) control += text.includes("時間+") ? pctValue(params.upgradeDuration50, 58) : 52;
  if (text.includes("牽引")) control += 46;
  if (text.includes("毒霧持續時間+50") || text.includes("中毒持續時間+50") || text.includes("燃燒持續時間+50")) output += pctValue(params.upgradeDuration50, 42);

  const numeric = scoreUpgradeSpecs(specs, value);
  output = numeric.output;
  control = numeric.control;
  mechanic += numeric.mechanic;
  const tag = upgradeTag(rowIndex, text);
  const total = Math.max(0, output + control + mechanic);
  return { name, trigger, effect, specs, output, control, mechanic, total, ...tag };
}
function scoreUpgradeSpecs(specs, value) {
  let output = 0;
  let control = 0;
  let mechanic = 0;
  specs.forEach(spec => {
    const v = Math.max(0, Number(value(spec.key)) || 0);
    switch (spec.key) {
      case "damagePct": output += v * 2.15; break;
      case "ratePct": output += v * 2.35; break;
      case "rangePct": output += v * 1.6; break;
      case "durationPct": output += v * 1.55; break;
      case "dotDamagePct": output += v * .7; break;
      case "pathDamagePct": output += v * .45; break;
      case "burnDurationPct":
      case "poisonDurationPct":
      case "zoneDurationPct": output += v * .45; break;
      case "slowDurationPct":
      case "iceTrailDurationPct":
      case "stunDurationPct":
      case "rootDurationPct": control += v * .85; break;
      case "extraShots":
      case "extraAreas":
      case "extraProjectiles":
      case "extraPierce": output += v * 54; mechanic += v * 8; break;
      case "extraChainCasts": output += v * 58; mechanic += v * 10; break;
      case "extraChains": output += v * 15; mechanic += v * 4; break;
      case "extraLaserTargets": output += v * 46; mechanic += v * 14; break;
      case "pathDamage": output += v * .7; break;
      case "vulnerablePct": output += v * 2.4; break;
      case "vulnerableBonusPct": output += v * .52; break;
      case "slowPct": control += v * 1.2; break;
      case "slowTime":
      case "iceTrailTime": control += v * 16; break;
      case "freezeTime": control += v * 58; break;
      case "stunTime": control += v * 130; break;
      case "rootTime": control += v * 104; break;
      case "pullStrengthPct": control += v * .62; mechanic += 10; break;
      case "burnDps":
      case "burnAreaDps":
      case "poisonDps": output += v * 1.6; break;
      case "burnTime":
      case "burnAreaTime":
      case "poisonTime": output += v * 18; break;
      case "poisonTick": output += v > 0 ? 18 / v : 0; break;
      case "focusDelay": output += v > 0 ? 24 / v : 0; break;
      case "focusDamagePct": output += v * 1.8; break;
      case "focusDamageBonusPct": output += v * .7; break;
      case "focusDelayReducePct": output += v * .64; break;
      case "refractDamagePct": output += v * .72; mechanic += 12; break;
      case "ricochetChancePct": output += v * .55; break;
      case "ricochetDamagePct": output += v * .7; break;
      case "ricochetDamageBonusPct": output += v * .45; break;
      case "ricochetExtra": output += v * 44; mechanic += v * 8; break;
      case "iceTrailSlowPct":
      case "iceTrailSlowBonusPct": control += v * 1.15; break;
      case "conditionalExplosionPct": output += v * .75; break;
      case "conditionalExplosionRadius": mechanic += v * .18; break;
      case "conditionalStunTime": control += v * 130; break;
      case "poisonTargetDamagePct":
      case "frozenTargetDamagePct":
      case "burningTargetDamagePct": output += v * .75; break;
      case "zoneStunTime": control += v * 120; break;
      case "zoneTime": mechanic += v * 8; break;
      case "zonePoisonDps": output += v * 1.6; break;
      case "zonePoisonTime": output += v * 16; break;
      case "trailSlowPct": control += v; break;
      case "trailTime": control += v * 14; break;
      case "shardCount": output += v * 22; mechanic += v * 5; break;
      case "shardDamagePct": output += v * .55; break;
      case "freezeDurationPct": control += v * .8; break;
      case "postFreezeSlowPct": control += v * .9; break;
      case "postFreezeSlowTime": control += v * 14; break;
      case "refractFocusPct": output += v * .35; mechanic += 12; break;
      case "focusedBurstDamagePct": output += v * .7; break;
      case "focusedBurstRadius": mechanic += v * .15; break;
      case "electricVulnerablePct": output += v * .9; break;
      case "electricVulnerableTime": mechanic += v * 8; break;
      case "focusConduit": output += v * 10; mechanic += v * 20; break;
      case "poisonBurstDamagePct": output += v * .7; break;
      case "poisonBurstRadius": mechanic += v * .15; break;
      case "poisonChainDamagePct": output += v * .65; break;
      case "zoneSlowPct": control += v; break;
      default: mechanic += v > 0 ? 8 : 0;
    }
  });
  return { output, control, mechanic };
}

function upgradeRole(towerId) {
  return TOWER_UPGRADE_ROLES[towerId] || { label:"泛用", output:1, control:1, mechanic:1 };
}

function roleAdjustedUpgradeScore(row) {
  const role = upgradeRole(row.towerId);
  return Math.max(0, row.output * role.output + row.control * role.control + row.mechanic * role.mechanic);
}

function upgradeBalanceState(rating) {
  if (rating > 145) return "過強";
  if (rating > 125) return "偏強";
  if (rating < 62) return "過弱";
  if (rating < 78) return "偏弱";
  return "合理";
}

function scoreClass(value, warnHigh=125, badHigh=145, warnLow=78, badLow=62) {
  return value > badHigh || value < badLow ? "score-bad" : value > warnHigh || value < warnLow ? "score-warn" : "score-good";
}

function upgradePoolSummaries(rows) {
  return TOWER_TUNING.map(([towerId, towerName], towerIndex) => {
    const role = upgradeRole(towerId);
    const towerRows = rows.filter(row => row.towerIndex === towerIndex);
    const avg = towerRows.reduce((sum, row) => sum + row.roleTotal, 0) / (towerRows.length || 1);
    const maxRow = towerRows.reduce((best, row) => !best || row.roleTotal > best.roleTotal ? row : best, null);
    const minRow = towerRows.reduce((best, row) => !best || row.roleTotal < best.roleTotal ? row : best, null);
    const spread = minRow && minRow.roleTotal > 0 ? maxRow.roleTotal / minRow.roleTotal : 0;
    const outputAvg = towerRows.reduce((sum, row) => sum + row.output, 0) / (towerRows.length || 1);
    const controlAvg = towerRows.reduce((sum, row) => sum + row.control, 0) / (towerRows.length || 1);
    const mechanicAvg = towerRows.reduce((sum, row) => sum + row.mechanic, 0) / (towerRows.length || 1);
    const tooStrong = towerRows.filter(row => row.towerRating > 145).length;
    const tooWeak = towerRows.filter(row => row.towerRating < 62).length;
    let note = "升級池穩定";
    if (spread > 2.2 || tooStrong || tooWeak) note = `需檢查：${tooStrong} 個過強 / ${tooWeak} 個過弱`;
    else if (spread > 1.7) note = "落差偏大";
    return { towerId, towerName, role, avg, maxRow, minRow, spread, outputAvg, controlAvg, mechanicAvg, note };
  });
}

function renderUpgradeSummary(rows) {
  if (!ui.upgradeSummaryBody) return;
  ui.upgradeSummaryBody.innerHTML = upgradePoolSummaries(rows).map(row => {
    const spreadClass = row.spread > 2.2 ? "score-bad" : row.spread > 1.7 ? "score-warn" : "score-good";
    const noteClass = row.note.includes("需檢查") ? "score-bad" : row.note.includes("偏大") ? "score-warn" : "score-good";
    return `<tr><td>${row.towerName}</td><td>${row.role.label}</td><td>${row.avg.toFixed(1)}</td><td>${row.maxRow.name}<br><small>${row.maxRow.roleTotal.toFixed(1)} / 塔內${Math.round(row.maxRow.towerRating)}</small></td><td>${row.minRow.name}<br><small>${row.minRow.roleTotal.toFixed(1)} / 塔內${Math.round(row.minRow.towerRating)}</small></td><td class="${spreadClass}">${row.spread.toFixed(2)}x</td><td>${row.outputAvg.toFixed(0)} / ${row.controlAvg.toFixed(0)} / ${row.mechanicAvg.toFixed(0)}</td><td class="${noteClass}">${row.note}</td></tr>`;
  }).join("");
}

function buildUpgradeOptionTables() {
  const scored = upgradeOptionScores();
  renderUpgradeSummary(scored);
  ui.upgradeOptions.innerHTML = TOWER_TUNING.map(([towerId, towerName], towerIndex) => {
    const role = upgradeRole(towerId);
    const rows = scored.filter(row => row.towerIndex === towerIndex);
    const body = rows.map(row => {
      const towerCls = scoreClass(row.towerRating);
      const globalCls = scoreClass(row.globalRating, 130, 155, 75, 55);
      const valueInputs = row.specs.length ? row.specs.map(spec => upgradeEffectInput(row.towerId, row.rowIndex, spec)).join("") : `<span class="x-cell">X</span>`;
      return `<tr><td>${row.name}</td><td class="upgrade-value-cell">${valueInputs}</td><td>${row.trigger}</td><td>${row.effect}</td><td><span class="tag ${row.tagClass}">${row.tag}</span></td><td>${row.output.toFixed(1)}</td><td>${row.control.toFixed(1)}</td><td>${row.mechanic.toFixed(1)}</td><td>${row.roleTotal.toFixed(1)}</td><td class="${towerCls}">${Math.round(row.towerRating)}</td><td class="${globalCls}">${Math.round(row.globalRating)}</td><td class="${towerCls}">${row.state}</td></tr>`;
    }).join("");
    return `<section class="sheet-card upgrade-card"><h2>${towerName}<small>${role.label}</small></h2><table class="data-table upgrade-option-table"><thead><tr><th>升級選項</th><th>數值調整</th><th>觸發</th><th>效果</th><th>類型</th><th>輸出</th><th>控場</th><th>機制</th><th>定位分</th><th>塔內評級</th><th>全局評級</th><th>狀態</th></tr></thead><tbody>${body}</tbody></table></section>`;
  }).join("");
  bindInputs(ui.upgradeOptions);
}

function pctValue(ratio, weight) {
  return Math.max(0, (Number(ratio) || 1) - 1) * weight;
}
function dotScore(text) {
  let score = 0;
  if (text.includes("解鎖燃燒") || text.includes("造成燃燒") || text.includes("造成中毒")) score += 34;
  if (text.includes("燃燒區域")) score += 46;
  if (text.includes("燃燒傷害+100") || text.includes("中毒傷害+100")) score += pctValue(params.upgradeDotDamage100, 55);
  return score;
}
function upgradeTag(rowIndex, text) {
  if (rowIndex <= 2) return { tag:"普通", tagClass:"tag-common" };
  if (rowIndex === 3) return { tag:"核心解鎖", tagClass:"tag-core" };
  return { tag:"前置連動", tagClass:"tag-link" };
}
function towerFieldCell(id, field) {
  if (!towerUsesField(id, field)) return `<span class="x-cell">X</span>`;
  return inputCell(`tower_${id}_${field}`, 0, towerFieldMax(field), towerFieldStep(field));
}
function towerUsesField(id, field) {
  return TOWER_FIELD_USE[id]?.has(field);
}
function towerFieldMax(field) {
  if (field.endsWith("Mul")) return 3;
  if (field === "rate") return 10;
  if (field === "tick") return 5;
  if (field === "cooldown" || field === "duration") return 20;
  return 3000;
}
function towerFieldStep(field) {
  if (field.endsWith("Mul")) return .05;
  if (field === "rate" || field === "cooldown" || field === "duration" || field === "tick") return .05;
  return 1;
}
function bossExpectedAdd() {
  const weights = [params.bossLowWeight, params.bossMidWeight, params.bossHighWeight].map(v => Math.max(0, Number(v) || 0));
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  const mids = [(params.bossLowMin + params.bossLowMax) / 2, (params.bossMidMin + params.bossMidMax) / 2, (params.bossHighMin + params.bossHighMax) / 2];
  return weights.reduce((sum, weight, index) => sum + weight * mids[index], 0) / total;
}
function bossExpectedScaledAdd(rewardMul) {
  const weights = [params.bossLowWeight, params.bossMidWeight, params.bossHighWeight].map(v => Math.max(0, Number(v) || 0));
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  const mids = [(params.bossLowMin + params.bossLowMax) / 2, (params.bossMidMin + params.bossMidMax) / 2, (params.bossHighMin + params.bossHighMax) / 2];
  return weights.reduce((sum, weight, index) => sum + weight * Math.max(1, mids[index] * rewardMul), 0) / total;
}
function bandIdForWave(wave) { return wave <= 2 ? 1 : wave <= 5 ? 2 : wave <= 10 ? 3 : wave <= 20 ? 4 : 5; }
function waveValue(wave, field) { return Number(params[`wave_${wave}_${field}`] ?? 0); }
function monsterIdsForTemplateCategory(category) {
  const byAttr = ["neutral", "fire", "ice", "electric", "poison"].map(attr => MONSTER_TYPES.filter(([id]) => id.startsWith(`${attr}_`)));
  if (category === "tank") return byAttr.map(rows => rows[2]?.[0]).filter(Boolean);
  if (category === "ranged" || category === "special") return byAttr.map(rows => rows[1]?.[0]).filter(Boolean);
  if (category === "fast") return byAttr.flatMap(rows => [rows[0]?.[0], rows[1]?.[0]]).filter(Boolean);
  return byAttr.map(rows => rows[0]?.[0]).filter(Boolean);
}
function expectedMonsterMoney(monsterId, bandId) {
  const ids = monsterIdsForTemplateCategory(monsterId);
  const money = ids.reduce((sum, id) => sum + (Number(params[`monster_${id}_moneyMin`] || 0) + Number(params[`monster_${id}_moneyMax`] || 0)) / 2, 0) / Math.max(1, ids.length);
  const drop = Math.max(0, Math.min(1, Number(params[`band_${bandId}_drop_${monsterId}`] || 0) * params.dropChanceMul));
  return money * drop * params.moneyMul;
}
function weightedAverage(entries) {
  const total = entries.reduce((sum, [,weight]) => sum + Math.max(0, Number(weight) || 0), 0) || 1;
  return entries.reduce((sum, [value, weight]) => sum + value * Math.max(0, Number(weight) || 0), 0) / total;
}
function expectedTemplateMoney(templateId, bandId) {
  return weightedAverage(MONSTER_WEIGHT_IDS.map(([mid]) => [expectedMonsterMoney(mid, bandId), params[`template_${templateId}_${mid}`] || 0]));
}
function expectedEliteMoney() {
  return ELITE_TYPES.reduce((sum, [id]) => {
    const min = Number(params[`monster_${id}_moneyMin`] || 0);
    const max = Number(params[`monster_${id}_moneyMax`] || 0);
    return sum + (min + max) / 2;
  }, 0) / Math.max(1, ELITE_TYPES.length);
}
function waveRewardExpectedMultiplier() {
  const total = WAVE_REWARD_TIERS.reduce((sum, [, , weightKey]) => sum + Math.max(0, Number(params[weightKey]) || 0), 0) || 1;
  return WAVE_REWARD_TIERS.reduce((sum, [, , weightKey, mulKey]) => {
    return sum + Math.max(0, Number(params[weightKey]) || 0) * Math.max(0, Number(params[mulKey]) || 0);
  }, 0) / total;
}
function bossDifficultyExpectedHp(firstBoss=false) {
  const weightFor = weightKey => firstBoss ? firstBossDifficultyWeightKey(weightKey) : weightKey;
  const total = BOSS_DIFFICULTY_TIERS.reduce((sum, [, , weightKey]) => sum + Math.max(0, Number(params[weightFor(weightKey)]) || 0), 0) || 1;
  const compression = firstBoss ? Math.max(0, Math.min(1, params.bossFirstDifficultyCompression)) : 1;
  return BOSS_DIFFICULTY_TIERS.reduce((sum, [, , weightKey, hpKey]) => {
    const hp = 1 + (Math.max(.1, Number(params[hpKey]) || 1) - 1) * compression;
    return sum + Math.max(0, Number(params[weightFor(weightKey)]) || 0) * hp;
  }, 0) / total;
}
function clampEstimate(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}
function estimateRtpBudget() {
  const ref = RTP_ESTIMATE_REFERENCE;
  const rewardBudget = waveRewardExpectedMultiplier() * params.moneyMul;
  const rewardScale = rewardBudget / Math.max(.001, ref.waveRewardBudget);
  const preBossScale = Math.max(.05, params.preBossRewardMul) / Math.max(.05, ref.preBossRewardMul);
  const fundingScale = .55 + .45 * (Math.max(0, params.postBossRewardFunding) / Math.max(.01, ref.postBossRewardFunding));
  const firstPressure = Math.max(.05, params.bossFirstHpMul * bossDifficultyExpectedHp(true));
  const laterPressure = Math.max(.05, params.bossHpMul * bossDifficultyExpectedHp(false));
  const firstKillRate = clampEstimate(ref.firstBossKillRate * Math.pow(ref.firstBossPressure / firstPressure, .8), .08, .985);
  const laterKillRate = clampEstimate(ref.laterBossKillRate * Math.pow(ref.laterBossPressure / laterPressure, .8), .08, .985);
  const firstAdd = bossExpectedScaledAdd(params.bossFirstRewardMul);
  const laterAdd = bossExpectedScaledAdd(params.bossLaterRewardMul);
  const spawnScale = Math.pow(Math.max(.01, params.bossChanceMul / Math.max(.01, ref.bossChanceMul)), .55);
  let base = ref.base * rewardScale * (.55 + .45 * preBossScale);
  let firstBoss = ref.firstBoss * rewardScale * preBossScale
    * (firstAdd / Math.max(.01, ref.firstBossAdd))
    * (firstKillRate / Math.max(.01, ref.firstBossKillRate));
  let laterBoss = ref.laterBoss * rewardScale * fundingScale
    * (laterAdd / Math.max(.01, ref.laterBossAdd))
    * (laterKillRate / Math.max(.01, ref.laterBossKillRate)) * spawnScale;
  const certified = params.mathModelEnabled >= .5;
  const rawTotal = base + firstBoss + laterBoss;
  if (certified && rawTotal > 0) {
    const scale = poolEntryStats().mean / rawTotal;
    base *= scale;
    firstBoss *= scale;
    laterBoss *= scale;
  }
  return {
    base, firstBoss, laterBoss, total:base + firstBoss + laterBoss,
    rewardBudget, firstPressure, laterPressure, firstKillRate, laterKillRate,
    firstAdd, laterAdd, spawnScale, certified,
  };
}
function signedPercent(value) {
  const number = Number(value) || 0;
  return `${number >= 0 ? "+" : ""}${(number * 100).toFixed(2)} pp`;
}
function rtpEstimateTone(value, target=poolEntryStats().mean) {
  const gap = Math.abs(value - target) * 100;
  return gap <= params.mathTolerancePct ? "score-good" : gap <= params.mathTolerancePct * 2 ? "score-warn" : "score-bad";
}
function renderRtpBudget(estimate) {
  const ref = RTP_ESTIMATE_REFERENCE;
  const rows = [
    ["一般波／基礎 POT", estimate.base, ref.base, "主要受每波彩金表、掉錢與首王前補貼影響"],
    ["第一隻 BOSS", estimate.firstBoss, ref.firstBoss, `估算擊殺率 ${(estimate.firstKillRate * 100).toFixed(1)}%，平均增加 +${estimate.firstAdd.toFixed(2)}x`],
    ["後續 BOSS", estimate.laterBoss, ref.laterBoss, `估算擊殺率 ${(estimate.laterKillRate * 100).toFixed(1)}%，出現量約為基準 ${(estimate.spawnScale * 100).toFixed(0)}%`],
    ["合計 RTP", estimate.total, ref.total, "同 Collect 規則與玩家組成下的快速校正值"],
  ];
  const body = rows.map(([name,value,reference,note], index) => {
    const share = estimate.total > 0 ? value / estimate.total : 0;
    const tone = index === rows.length - 1 ? rtpEstimateTone(value) : "";
    return `<tr><td>${name}</td><td class="${tone}">${(value * 100).toFixed(2)}%</td><td>${(share * 100).toFixed(1)}%</td><td>${signedPercent(value-reference)}</td><td>${note}</td></tr>`;
  }).join("");
  ui.rewardRtpBody.innerHTML = body;
  ui.bossRtpBody.innerHTML = body;
  const totalText = `預估 ${(estimate.total * 100).toFixed(2)}%`;
  [ui.rewardRtpTotal,ui.bossRtpTotal].forEach(element => {
    element.textContent = totalText;
    element.className = rtpEstimateTone(estimate.total);
  });
  ui.rewardRtpMeta.textContent = estimate.certified
    ? `返還池模型已啟用：每筆 BET 依六段配籤抽入池倍率；目前配籤加權 RTP 為 ${(poolEntryStats().mean * 100).toFixed(2)}%。`
    : `每波平均彩金 ${estimate.rewardBudget.toFixed(3)}x BET。以第 ${ref.revision} 版 ${ref.samples.toLocaleString()} 場實跑校正；正式 RTP 仍以模擬器驗證。`;
  ui.bossRtpMeta.textContent = estimate.certified
    ? `BOSS 倍率、難度與出現頻率只重新分配返還池並改變 VI；不增加莊家份額以外的付款預算。首王壓力 ${estimate.firstPressure.toFixed(2)}x、後續王壓力 ${estimate.laterPressure.toFixed(2)}x。`
    : `首王壓力 ${estimate.firstPressure.toFixed(2)}x、後續王壓力 ${estimate.laterPressure.toFixed(2)}x。倍率、血量與出現頻率會分別反映到貢獻預估。`;
}
function firstBossRolledBeforeWave(wave) {
  let unseen = 1;
  for (let current=params.bossFirstMinWave; current<wave; current++) {
    const chance = Math.min(
      Math.max(0, params.bossFirstChanceCap),
      Math.max(0, params.bossFirstChance + Math.max(0, current - params.bossFirstMinWave) * params.bossFirstChanceInc),
    ) / 100;
    unseen *= 1 - chance;
  }
  return 1 - unseen;
}
function expectedDepthBetFloor(wave) {
  return wave >= 21 ? params.betDeepMul : wave >= 11 ? params.betMidMul : 1;
}
function expectedBossBetMultiplier(wave) {
  const expectedKillsBefore = wave > 1 ? expectedBossesTo(wave - 1) * params.modelBossKillRate : 0;
  return 1 + expectedKillsBefore * (Math.max(1, params.bossBetStepMul) - 1);
}
function expectedWaveBet(wave) {
  return 100 * Math.max(expectedDepthBetFloor(wave), expectedBossBetMultiplier(wave));
}
function expectedWavePot(wave) {
  const deepMoneyMul = wave >= 11 ? Math.min(params.deepMoneyCap, params.deepMoneyBase + (wave - 11) * params.deepMoneyRamp) : 1;
  const chargedBossMul = expectedBossBetMultiplier(wave);
  const fundedBossMul = 1 + (chargedBossMul - 1) * Math.max(0, Math.min(1, params.postBossRewardFunding));
  const fundingBet = 100 * Math.max(expectedDepthBetFloor(wave), fundedBossMul);
  const onboardingChance = 1 - firstBossRolledBeforeWave(wave);
  const onboardingMul = 1 + (Math.max(0, params.preBossRewardMul) - 1) * onboardingChance;
  return fundingBet * onboardingMul * waveRewardExpectedMultiplier() * params.moneyMul * deepMoneyMul;
}
function expectedBossesTo(targetWave) {
  let expected = 0;
  let states = [{ probability:1, firstDone:false, weight:0, cd:0 }];
  const addState = (map, state) => {
    if (state.probability <= 0) return;
    const key = `${state.firstDone ? 1 : 0}|${state.cd}|${state.weight.toFixed(4)}`;
    const current = map.get(key);
    if (current) current.probability += state.probability;
    else map.set(key, state);
  };
  for (let wave=1; wave<=targetWave; wave++) {
    const nextStates = new Map();
    states.forEach(state => {
      if (!state.firstDone) {
        const firstWave = params.bossFirstMinWave;
        if (wave < firstWave) {
          addState(nextStates, { ...state });
          return;
        }
        const chance = Math.min(
          Math.max(0, params.bossFirstChanceCap),
          Math.max(0, params.bossFirstChance + Math.max(0, wave - firstWave) * params.bossFirstChanceInc),
        ) / 100;
        expected += state.probability * chance;
        addState(nextStates, { probability:state.probability * chance, firstDone:true, weight:0, cd:waveValue(wave, "bossCd") || 0 });
        addState(nextStates, { probability:state.probability * (1 - chance), firstDone:false, weight:0, cd:0 });
        return;
      }
      if (state.cd > 0) {
        addState(nextStates, { ...state, cd:state.cd - 1 });
        return;
      }
      const weight = state.weight + Math.max(0, waveValue(wave, "bossInc"));
      const chance = Math.min(
        params.bossChanceCap,
        Math.max(0, waveValue(wave, "bossBase")) + weight * params.bossChanceMul,
      ) / 100;
      expected += state.probability * chance;
      addState(nextStates, { probability:state.probability * chance, firstDone:true, weight:0, cd:waveValue(wave, "bossCd") || 0 });
      addState(nextStates, { probability:state.probability * (1 - chance), firstDone:true, weight, cd:0 });
    });
    states = Array.from(nextStates.values());
  }
  return expected;
}
function totalBetTo(targetWave) {
  let total = 0;
  for (let wave=1; wave<=targetWave; wave++) {
    total += expectedWaveBet(wave) * survivalRateAt(wave - 1);
  }
  return total;
}
function survivalRateAt(wave) {
  if (wave <= 0) return 1;
  const s10 = Math.max(.0001, Math.min(1, params.modelClearRate10));
  const s20 = Math.max(.0001, Math.min(s10, params.modelClearRate20));
  const s30 = Math.max(.0001, Math.min(s20, params.modelClearRate30));
  if (wave <= 10) return Math.pow(s10, wave / 10);
  if (wave <= 20) return s10 * Math.pow(s20 / s10, (wave - 10) / 10);
  return s20 * Math.pow(s30 / s20, Math.min(10, wave - 20) / 10);
}
function expectedPotTo(targetWave) {
  let total = 0;
  for (let wave=1; wave<=targetWave; wave++) total += expectedWavePot(wave);
  return total;
}
function rtpEstimate(targetWave) {
  const pot = expectedPotTo(targetWave);
  const expectedBosses = expectedBossesTo(targetWave);
  const firstBossChance = Math.min(1, expectedBosses);
  const laterBosses = Math.max(0, expectedBosses - firstBossChance);
  const killRate = Math.max(0, Math.min(1, params.modelBossKillRate));
  const firstAdd = bossExpectedScaledAdd(params.bossFirstRewardMul) * firstBossChance * killRate;
  const laterAdd = bossExpectedScaledAdd(params.bossLaterRewardMul) * laterBosses * killRate;
  const bossAdd = firstAdd + laterAdd;
  const clearRate = targetWave === 10 ? params.modelClearRate10 : targetWave === 20 ? params.modelClearRate20 : params.modelClearRate30;
  const payout = pot * (1 + bossAdd) * clearRate;
  return { pot, bossAdd, payout, bet: totalBetTo(targetWave), rtp: payout / totalBetTo(targetWave) };
}
function towerScores() {
  const rows = TOWER_TUNING.map(([id, name, base]) => {
    const damage = Number(params[`tower_${id}_damage`] || 0) * params.towerDamageMul;
    const rate = Number(params[`tower_${id}_rate`] || 0);
    const range = Number(params[`tower_${id}_range`] || 0);
    const splash = Number(params[`tower_${id}_splash`] || 0);
    const duration = Number(params[`tower_${id}_duration`] || 0);
    const cooldown = Number(params[`tower_${id}_cooldown`] || 0);
    const tick = Number(params[`tower_${id}_tick`] || 0);
    const minionMul = Number(params[`tower_${id}_minionMul`] ?? 1);
    const eliteMul = Number(params[`tower_${id}_eliteMul`] ?? 1);
    const bossMul = Number(params[`tower_${id}_bossMul`] ?? 1);
    const role = TOWER_ROLE[id] || "general";
    const weights = TOWER_ROLE_CLASS_WEIGHTS[role] || TOWER_ROLE_CLASS_WEIGHTS.general;
    const classFactor = minionMul * weights.minion + eliteMul * weights.elite + bossMul * weights.boss;
    const attrFactor = expectedAttributeFactor(id, weights);
    const score = towerScoreParts(id, { damage, rate, range, splash, duration, cooldown, tick }, base);
    const outputRaw = score.output * classFactor * attrFactor;
    const controlRaw = score.control;
    return { id, name, role, roleLabel:TOWER_ROLE_LABEL[role] || role, damage, rate, cooldown, duration, tick, range, splash, minionMul, eliteMul, bossMul, classFactor, attrFactor, cc: score.cc, outputRaw, controlRaw, raw:outputRaw + controlRaw };
  });
  rows.forEach(row => {
    const peers = rows.filter(peer => peer.role === row.role);
    const roleAvg = peers.reduce((sum, peer) => sum + peer.raw, 0) / Math.max(1, peers.length);
    row.score = roleAvg ? row.raw / roleAvg * 100 : 0;
  });
  return rows;
}
function expectedAttributeFactor(towerId, weights=TOWER_ROLE_CLASS_WEIGHTS.general) {
  const attr = TOWER_ATTRIBUTE[towerId] || "neutral";
  const field = `${attr}Mul`;
  const average = ids => ids.reduce((sum, id) => sum + Number(params[`monster_${id}_${field}`] ?? 1), 0) / Math.max(1, ids.length);
  return average(MONSTER_TYPES.map(([id]) => id)) * weights.minion
    + average(ELITE_TYPES.map(([id]) => id)) * weights.elite
    + average(BOSS_TYPES.map(([id]) => id)) * weights.boss;
}
function towerScoreParts(id, values, base) {
  const model = TOWER_SCORE_MODEL[id] || {};
  const rate = Math.max(0, values.rate);
  const damage = Math.max(0, values.damage);
  const castRate = values.cooldown > 0 ? 1 / Math.max(.05, values.cooldown) : rate;
  const rangeFactor = .72 + Math.min(Math.max(0, values.range), 1000) / 3600;
  const splashFactor = towerUsesField(id, "splash") ? 1 + Math.min(Math.max(0, values.splash), 180) / 95 * (model.splash || .5) : 1;
  const tickStability = towerUsesField(id, "tick") ? 1 + Math.max(0, .5 - Math.max(.05, values.tick)) * .12 : 1;
  let throughput = damage * castRate;
  let utility = 1 + (model.dot || 0) + (model.boss || 0) + (model.ricochet || 0) + (model.path || 0);
  let controlReach = 1;

  if (model.kind === "channel") {
    const active = Math.max(0, values.duration);
    const cycle = Math.max(.05, active + Math.max(0, values.cooldown));
    throughput = damage * rate * (active > 0 ? active / cycle : 1);
    utility *= model.target || 1;
    controlReach = active > 0 ? active / cycle : 1;
  } else if (model.kind === "zone") {
    const active = Math.max(0, values.duration);
    throughput = damage * castRate * active * splashFactor * tickStability;
    utility *= 1.05;
    controlReach = Math.min(1.8, active * castRate) * splashFactor;
  } else if (model.kind === "pierce") {
    const pierce = model.pierce || 1;
    const pierceDamage = 1 + Math.max(0, pierce - 1) * .72;
    throughput *= pierceDamage;
    controlReach = pierceDamage;
  } else if (model.kind === "chain") {
    const chains = model.chains || 1;
    throughput *= 1 + Math.max(0, chains - 1) * .62;
    controlReach = 1 + Math.max(0, chains - 1) * .42;
  } else if (model.kind === "burstArea") {
    throughput *= splashFactor;
    controlReach = splashFactor;
  }

  const output = throughput * rangeFactor * utility * (model.specialty || 1) * (model.calibration || 1) * (base.factor || 1);
  const control = output * (model.control || 0) * Math.min(2.2, Math.max(.6, controlReach));
  return { output, control, total: output + control, cc: model.cc || "X" };
}
function scoreDisplay(row, field, formatter) {
  if (!towerUsesField(row.id, field)) return `<td><span class="x-cell">X</span></td>`;
  return `<td>${formatter(row[field])}</td>`;
}
function renderCollectPolicyTemplates() {
  if (!ui.collectPolicyBody) return;
  const percent = value => `${(value * 100).toFixed(value < .01 ? 1 : 0)}%`;
  ui.collectPolicyBody.innerHTML = COLLECT_POLICY_TEMPLATES.map(policy => {
    const context = `HP≤25/40/60%：+${percent(policy.hp[0])}/+${percent(policy.hp[1])}/+${percent(policy.hp[2])}；擊殺BOSS：+${percent(policy.bossKill)}；危險1/2/3：-${percent(policy.danger * .5)}/-${percent(policy.danger * .8)}/-${percent(policy.danger * 1.1)}；W10：+${percent(policy.wave10)}；W20再+${percent(policy.wave20)}`;
    return `<tr><td>${escapeHtml(policy.label)}<br><code>${escapeHtml(policy.id)}</code></td>${policy.probabilities.map(value => `<td>${percent(value)}</td>`).join("")}<td class="formula-cell">${escapeHtml(context)}</td><td>${escapeHtml(policy.note)}</td></tr>`;
  }).join("");
}
function updateEvaluation() {
  updateHeroEvaluationCells();
  renderCollectPolicyTemplates();
  const mins = [params.bossLowMin, params.bossMidMin, params.bossHighMin].map(Number);
  const maxs = [params.bossLowMax, params.bossMidMax, params.bossHighMax].map(Number);
  ui.bossAvg.textContent = `x${(1 + bossExpectedScaledAdd(params.bossFirstRewardMul)).toFixed(2)}`;
  ui.bossRange.textContent = `x${(1 + Math.max(1, Math.min(...mins) * params.bossFirstRewardMul)).toFixed(1)} - x${(1 + Math.max(1, Math.max(...maxs) * params.bossFirstRewardMul)).toFixed(1)}`;
  const rewardAverage = waveRewardExpectedMultiplier() * params.moneyMul;
  ui.rewardAvg.textContent = `首王前 ${(rewardAverage * params.preBossRewardMul).toFixed(2)}x / 後續 ${rewardAverage.toFixed(2)}x`;
  ui.bossDifficultyAvg.textContent = `首王 ${bossDifficultyExpectedHp(true).toFixed(2)}x / 後段 ${bossDifficultyExpectedHp(false).toFixed(2)}x`;
  const rtpEstimate = estimateRtpBudget();
  renderRtpBudget(rtpEstimate);
  const target = `${(params.mathTargetRtp * 100).toFixed(2)}%`;
  const actualPoolRtp = `${(poolEntryStats().mean * 100).toFixed(2)}%`;
  ui.rtpBody.innerHTML = [
    ["入池配籤期望", actualPoolRtp, actualPoolRtp, actualPoolRtp, "每筆 BET 獨立抽入池倍率；加權平均為實際理論 RTP"],
    ["付款模型", "戰鬥＋個人返還池", "戰鬥＋個人返還池", "戰鬥＋個人返還池", "每位玩家的返還池獨立且跨局延續，玩家之間不互相補貼"],
    ["單局曝險上限", `${params.mathPoolMaxPayoutMul.toFixed(0)}x`, `${params.mathPoolMaxPayoutMul.toFixed(0)}x`, `${params.mathPoolMaxPayoutMul.toFixed(0)}x`, "以該局累計 BET 計算，並受個人池當下可用餘額限制"],
    ["個人帳本", "不得為負", "不得為負", "不得為負", "彩金只使用該玩家已入水的可用餘額，不與其他玩家互補或預支未來投注"],
    ["目標 RTP", target, target, target, "同一 BET 與 Collect 規則下，五種合理策略都要接近此目標"],
    ["正式樣本", "100,000 / 策略", "100,000 / 策略", "100,000 / 策略", "正式驗證共跑 500,000 場，五種策略各 100,000 場"],
    ["通過門檻", `${params.mathTolerancePct.toFixed(2)} pp`, `${params.mathTolerancePct.toFixed(2)} pp`, `${params.mathTolerancePct.toFixed(2)} pp`, "同時檢查策略差距、逐波 RTP 漂移、目標偏差與 95% 信賴區間"],
  ].map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td></tr>`).join("");
  const scores = towerScores();
  const min = Math.min(...scores.map(row => row.score));
  const max = Math.max(...scores.map(row => row.score));
  const gap = min > 0 ? max / min : 0;
  ui.towerGap.textContent = `${gap.toFixed(2)}x`;
  ui.towerGap.className = gap > 2.2 ? "score-bad" : gap > 1.7 ? "score-warn" : "score-good";
  ui.towerGapNote.textContent = gap > 2.2 ? "同定位塔落差過大，建議回調" : gap > 1.7 ? "同定位內仍需注意弱塔體感" : "各定位內落差大致可接受";
  ui.towerGapNote.className = ui.towerGap.className;
  ui.towerScoreBody.closest("table").querySelector("thead").innerHTML = `<tr><th>塔</th><th>定位</th><th>傷害</th><th>攻速</th><th>冷卻</th><th>持續</th><th>Tick</th><th>射程</th><th>範圍</th><th>對小怪</th><th>對菁英</th><th>對BOSS</th><th>屬性期望</th><th>控場</th><th>輸出分</th><th>控場分</th><th>總分</th><th>定位內評級</th><th>狀態</th></tr>`;
  ui.towerScoreBody.innerHTML = scores
    .sort((a,b) => b.score - a.score)
    .map(row => {
      const cls = row.score > 135 || row.score < 70 ? "score-bad" : row.score > 120 || row.score < 82 ? "score-warn" : "score-good";
      const state = row.score > 135 ? "偏強" : row.score < 70 ? "偏弱" : row.score > 120 ? "略強" : row.score < 82 ? "略弱" : "正常";
      const ccCell = row.cc === "X" ? `<span class="x-cell">X</span>` : row.cc;
      return `<tr><td>${row.name}</td><td>${row.roleLabel}</td><td>${Math.round(row.damage)}</td><td>${row.rate.toFixed(2)}</td><td>${row.cooldown.toFixed(2)}</td>${scoreDisplay(row, "duration", v => v.toFixed(2))}${scoreDisplay(row, "tick", v => v.toFixed(2))}<td>${Math.round(row.range)}</td>${scoreDisplay(row, "splash", v => Math.round(v))}<td>${row.minionMul.toFixed(2)}</td><td>${row.eliteMul.toFixed(2)}</td><td>${row.bossMul.toFixed(2)}</td><td>${row.attrFactor.toFixed(2)}</td><td>${ccCell}</td><td>${Math.round(row.outputRaw)}</td><td>${Math.round(row.controlRaw)}</td><td>${Math.round(row.raw)}</td><td class="${cls}">${Math.round(row.score)}</td><td class="${cls}">${state}</td></tr>`;
    }).join("");
}

function syncParamInputs(key, source=null) {
  document.querySelectorAll("input[data-key]").forEach(input => {
    if (input === source || input.dataset.key !== key) return;
    const scale = Number(input.dataset.scale) || 1;
    input.value = Number(params[key] || 0) / scale;
  });
}

function renderPoolLedgerLogic() {
  if (!ui.poolLedgerLogicBody) return;
  const rows = [
    ["1. 每筆投注獨立入水", "按BET或付Reroll費用時", "入水額=投注額×獨立抽中倍率；長期入水RTP=Σ(倍率×權重)÷Σ權重", "每筆條件期望固定，Collect策略不能藉由已知結果改變後續BET的RTP"],
    ["2. 建立波次合約", "玩家按下繼續並扣BET後", "本波公平預算 = 既有應付 + 本波入水額 × 波次獎勵係數", "一般波採中低幅波段；BOSS才使用高倍尾端"],
    ["3. 依通關率反推彩金", "開波時", "計價率 = 戰鬥預估通關率 × BOSS順位/深度計價倍率；條件彩金 = 公平預算 ÷ 計價率", "計價率 × 條件彩金 = 公平預算"],
    ["4. 戰鬥中升級重定價", "完成3選1後", "新條件彩金 = (舊條件彩金×舊計價率 + 尚未定價入水額) ÷ 新計價率", "沿用相同BOSS順位/深度計價倍率；已顯示POT不可下降"],
    ["5. Reroll獨立入水", "玩家每次升級最多使用一次", "Reroll費用 = 當前BET；Reroll入水額 = 費用 × 獨立抽中倍率", "戰鬥中計入當波；波間先承諾下一波後才可使用"],
    ["6. BOSS倍率", "擊殺BOSS時", "總倍率 = 1 + 各BOSS加成倍率相加", "主要VI來源；首王偏低倍，後王保留高倍尾端"],
    ["7. POT風險延續", "玩家帶著POT繼續BET時", "新公平預算=上一波已公開應付+本波入水；上一波已保留的BOSS來源金額只能原額帶入，不能順帶解鎖其他BOSS子池", "倍率可上升、持平或下降；不會只因總BET增加而被帳本硬性稀釋"],
    ["8. 分帳與深追釋放", "計算波末可領彩金時", "每筆入水先拆為一般子池與BOSS子池；一般波可使用一般子池與上一波已公開的POT，BOSS波才可新增動用BOSS子池", "尚未公開的BOSS預算仍保留；一般波釋放率只作用於未公開舊餘額"],
    ["9. 跨局BOSS預算成熟", "玩家開始下一局時", "成熟額 = 上局剩餘BOSS子池 × 成熟率；只解除用途限制，個人池總available不變", "讓固定早收手玩家的長期RTP也能收斂，不會永久鎖住BOSS預算"],
    ["10. 個人預算帳本", "清波預留與Collect支付時", "實際預留 = min(條件彩金, 累計BET×全局Max Win, 當下可用子池餘額+上一波已保留應付)", "available 永不為負；不與其他玩家互補，也不預支未來投注"],
    ["11. 顯示即實付", "清波與Collect時", "Collect實付 = 畫面公開總得分 = 已預留金額", "波末不可縮POT；不可在Collect時突然補成另一個數字"],
    ["12. 帳本守恆與驗證", "每次入水、預留、支付後", "seed + contributed = available + reserved + paid；Cash Out RTP = Σ實付÷Σ總BET", "守恆誤差必須為0；正式判定看Cash Out RTP，不以帳面配置RTP代替"],
    ["13. 策略公平驗證", "比較不同Build策略時", "每名玩家固定一種策略並持有獨立個人水池；策略RTP = 該策略Σ實付÷Σ該策略BET；配置RTP = 實領RTP + 期末未付責任÷Σ該策略BET", "策略可改變深度、VI與死亡位置，但相同Collect規則的長期配置RTP應接近"],
  ];
  ui.poolLedgerLogicBody.innerHTML = rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
}

function logicFormulaRows() {
  return [
    ["投注入水", "BET/Reroll金額、入水倍率權重", "entryCredit=stake×draw(entryMultiplier)；E[entryCredit]/stake=Σ(倍率×權重)/Σ權重", "該筆投注RTP預算", "registerMathStake", "BET與Reroll都獨立抽籤，確保任意停止時點的條件期望不變"],
    ["升級節點重定價", "舊通關率、新Build通關率、未釋出彩金、Reroll入水", "fairValue=舊target×舊p+Reroll入水；新target=fairValue÷新p；remaining=max(0,新target-已顯示POT)", "剩餘彩金預算", "repriceActiveMathTicket", "不得降低已顯示POT；升級後戰鬥仍真實決定輸贏"],
    ["BET", "基礎BET、波次、已擊殺BOSS", "本波BET = round(基礎BET × max(深度最低倍率, 1 + 已擊殺BOSS數 × (bossBetStepMul - 1)))", "本波投注額", "betForWave / combinedBetMultiplier", "BET階梯只能由表內參數決定"],
    ["BOSS出現", "波次、CD、累積權重", "首王P = min(cap, firstChance + (wave-firstMinWave)×inc)；後王P = min(cap, bossBase + 累積權重×bossChanceMul)", "是否為BOSS波", "bossChanceForWave / rollBossForWave", "每波只能抽一次；預告不可揭露結果"],
    ["一般波彩金", "彩金層權重、倍率、本波BET、深追熱波權重", "熱波權重隨深度移向深追值；P(層)=當波權重÷當波總權重；rewardFactor=抽中倍率÷當波五層加權平均", "前段保留高倍機會；深追結果較集中、熱波較少但更大", "rollWaveReward / mathWaveRewardRoll", "每波的加權期望仍正規化為1，只改VI、不增加RTP"],
    ["怪物組成", "波段數量、模板、怪種權重", "數量=randomInt(countMin,countMax)；模板機率=模板權重÷總權重；怪種占比=怪種權重÷模板總權重", "本波怪物清單", "waveInfoFor / spawnWave", "抽樣分布應收斂至設定權重"],
    ["怪物戰鬥", "類型基礎值、波次倍率、難度", "HP=類型HP×waveHpMul×菁英/BOSS難度；攻擊間隔=interval；進入range後攻擊基地", "死亡、存活或基地受傷", "makeMonster / updateMonsters", "HP≤0 必須立即進入死亡結算"],
    ["角色／砲塔傷害", "傷害、攻速、冷卻、Tick、屬性倍率", "命中傷害=基礎傷害×升級倍率×目標類型倍率×屬性克制；持續型DPS=每Tick傷害÷tick並受duration/cooldown週期限制", "目標HP扣除、控場狀態", "attackHero / attackTower / damageMonster", "BOSS不吃硬控；屬性乘區只能套一次"],
    ["EXP與升級", "擊殺EXP、等級門檻、前置條件", "累積EXP≥exp_level 時升級；候選池先驗證擁有塔、核心與跨塔前置，再依新鮮度權重抽選", "3選1／Reroll 4選1", "grantExp / collectUpgradeCandidates", "每個候選必須當下可生效"],
    ["BOSS難度", "首/後王難度權重與三維倍率", "P(難度)=權重÷總權重；首王三維=1+(抽中倍率-1)×firstDifficultyCompression", "BOSS HP、攻擊、速度", "rollBossDifficulty", "首王與後王必須使用不同權重池"],
    ["BOSS倍率", "低中高倍權重、區間、首/後王係數", "層內uniform(min,max)；加成=round(max(1,抽中值×rewardMul),0.1)；總倍率=1+所有BOSS加成相加", "POT旁倍率與主要VI", "bossMultiplier / createMathTicket", "首王較保守、後王高倍尾端較長；多隻BOSS加成相加，不相乘"],
    ["風險定價", "clearChance、首王/後續深度計價倍率、rewardFactor、配籤RTP", "pricingRate=clamp(clearChance×chanceScale,0.0001,4)；expectedAfter=before+entryCredit×rewardFactor；conditionalPayout=expectedAfter÷pricingRate", "未受風險上限限制的targetPayout", "createMathTicket", "首王使用首王倍率；第2隻後依1-10、11-20、21-27、28-30波選倍率。pricingRate×conditionalPayout 必須等於 expectedAfter"],
    ["個人水池分帳", "入水額、一般/BOSS占比、上一波已保留應付", "entryCredit拆為general與boss；一般波spendable=generalAvailable+上一波已公開應付；BOSS波spendable=available+上一波已公開應付", "可使用的一般彩金、已公開POT與BOSS彩金", "registerMathStake / personalPoolPayoutAmount", "一般波只能續帶已公開的BOSS來源金額，不能解鎖其他BOSS子池；玩家間不可互補"],
    ["深追水池釋放", "波次、個人池available、前段/深追釋放率", "depth=clamp((wave-1)÷rampWaves,0,1)；releaseRate=early+(deep-early)×depth；額外釋放=max(0,可用額-條件應付)×releaseRate", "尚未公開舊餘額的釋放時機", "mathPoolDepthProgress / personalPoolPayoutAmount", "上一波已公開應付先全額納入風險定價；釋放率只移動其餘預算，不創造RTP"],
    ["深追倍率重排", "原水池可配置平均、上波POT、上波累計BET、本波新增BET", "anchor=上波POT+(上波POT÷上波累計BET)×新增BET；以anchorChance抽anchor，另一分支=(fundedMean-anchorChance×anchor)÷(1-anchorChance)", "通關後倍率維持、上升或下降", "mathCarryPayoutShape", "先算fundedMean才重排，所以三個分支只改VI與深追體感；正式驗證需同时列實領RTP與期末未結責任"],
    ["全波次回收資格", "累計BET、全局Max Win、個人池可用額", "本波可付≤min(累計BET×MaxWin, 可用子池餘額)；公式不含波次解鎖或深度上限", "前期與深追都可能高倍；深追差異來自累積BET、POT與BOSS子池", "personalPoolPayoutCeiling", "長期RTP仍由入水配籤與帳本守恆控制"],
    ["跨局BOSS預算成熟", "上局bossAvailable、成熟率", "matured=bossAvailable×recycleRate；bossAvailable-=matured；available總額不變", "早收手玩家下一局可用的一般預算", "registerMathStake", "只改用途標記，不創造彩金；用來維持不同Collect策略的長期公平"],
    ["Collect", "reservedPayout、累計BET", "玩家回收=reservedPayout；單局回收倍率=玩家回收÷本局累計BET", "錢包增加、paid增加", "collect / payMathReservation", "只有場上無怪時可Collect"],
    ["真人Collect模型", "POT÷累計BET、基地HP%、是否剛擊殺BOSS、危險預告、波次", "Pcollect=clamp(倍率區間基礎率+HP修正+BOSS修正-危險反應+深度修正,1%,99.5%)", "本波是否模擬收手", "humanCollectProbability / shouldCollect", "只模擬玩家決策，不改彩金、水池或單筆BET的RTP預算；各模板完整機率表列於評估頁"],
    ["失敗", "基地HP", "HP≤0 → 本局支付=0；reserved退回available", "本局結束、POT歸零", "failMathTicket / gameOver", "死亡不得向錢包付款"],
    ["RTP驗證", "大量獨立局的總BET與總實付", "Cash-out RTP=Σ成功Collect實付÷Σ所有投注；切片RTP=固定於該波Collect時的長期同式", "總RTP、逐波RTP、策略RTP", "simulator-worker formal mode", "報表使用paid，不把available或seed當成玩家回收"],
    ["策略中立驗證", "五種固定Build策略、相同Collect策略、各自獨立個人水池", "strategyCashoutRTP=Σ該策略實付÷Σ該策略BET；strategyAllocatedRTP=strategyCashoutRTP+期末未付責任÷Σ該策略BET", "策略RTP差距、進度與VI", "simulator validation matrix", "同一玩家跨局切換策略時，策略分項只算貢獻切片，不得作公平性判定"],
  ];
}

function parameterContext(input) {
  const panel = input.closest(".tab-panel");
  const names = { pool:"水池 / RTP", rewards:"波次彩金", bossDifficulty:"BOSS難度", monsters:"怪物類型", templates:"組成模板", waves:"WAVE", exp:"EXP", heroes:"角色", towers:"塔數值", upgrades:"升級選項", evaluation:"評估" };
  const tab = panel?.id?.replace(/Tab$/, "") || "其他";
  let label = input.closest(".pool-target-card")?.querySelector("label")?.textContent?.trim();
  label ||= input.closest(".mini-input")?.querySelector("span")?.textContent?.trim();
  label ||= input.closest("tr")?.querySelector("td:first-child")?.textContent?.trim();
  label ||= input.dataset.key;
  return { category:names[tab] || tab, label };
}

function updateEngineeringSummary() {
  const target = Number(params.mathTargetRtp) || 0;
  const actual = poolEntryStats().mean;
  const targetText = `${(target * 100).toFixed(2)}%`;
  const edgeText = `${((1 - actual) * 100).toFixed(2)}%`;
  if (ui.poolTargetRtpInput && document.activeElement !== ui.poolTargetRtpInput) ui.poolTargetRtpInput.value = (target * 100).toFixed(2);
  if (ui.poolHouseEdge) ui.poolHouseEdge.textContent = edgeText;
  if (ui.poolContributionPreview) ui.poolContributionPreview.textContent = (100 * actual).toFixed(2);
  if (ui.poolConservation) ui.poolConservation.textContent = "100.00%";
  if (ui.logicTargetRtp) ui.logicTargetRtp.textContent = targetText;
  if (ui.logicActualRtp) ui.logicActualRtp.textContent = `${(actual * 100).toFixed(2)}%`;
  if (ui.logicHouseEdge) ui.logicHouseEdge.textContent = edgeText;
  if (ui.logicPoolMode) ui.logicPoolMode.textContent = Number(params.mathPoolEnabled) >= .5 ? "啟用" : "停用";
  updatePoolEntryStats();
}

function renderEngineeringLogic() {
  updateEngineeringSummary();
  renderPoolLedgerLogic();
  if (ui.logicPipeline) {
    const steps = ["選擇BET", "入池與扣款", "抽波次/彩金", "生成怪物", "戰鬥與Build", "清波定價", "Continue / Collect", "付款或歸零"];
    ui.logicPipeline.innerHTML = steps.map((step, index) => `<div class="logic-step"><span>${index + 1}</span><strong>${step}</strong></div>`).join("");
  }
  if (ui.logicFormulaBody) {
    ui.logicFormulaBody.innerHTML = logicFormulaRows().map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
  }
  if (ui.logicParameterBody) {
    const seen = new Set();
    const entries = [];
    document.querySelectorAll("input[data-key]").forEach(input => {
      const key = input.dataset.key;
      if (!key || seen.has(key)) return;
      seen.add(key);
      const { category, label } = parameterContext(input);
      const value = key === "mathTargetRtp" ? `${((Number(params[key]) || 0) * 100).toFixed(2)}%` : String(params[key] ?? "");
      entries.push({ category, label, key, value, logic:parameterLogic(key), timing:parameterTiming(key) });
    });
    ui.logicParameterBody.innerHTML = entries.map(entry => `<tr data-search="${escapeHtml(Object.values(entry).join(" ").toLowerCase())}"><td>${escapeHtml(entry.category)}</td><td>${escapeHtml(entry.label)}</td><td class="engine-key-cell"><code>${escapeHtml(entry.key)}</code></td><td>${escapeHtml(entry.value)}</td><td class="formula-cell">${escapeHtml(entry.logic)}</td><td>${escapeHtml(entry.timing)}</td></tr>`).join("");
  }
  if (ui.logicSearch && ui.logicSearch.dataset.bound !== "1") {
    ui.logicSearch.dataset.bound = "1";
    ui.logicSearch.addEventListener("input", () => {
      const term = ui.logicSearch.value.trim().toLowerCase();
      ui.logicParameterBody?.querySelectorAll("tr").forEach(row => { row.hidden = !!term && !row.dataset.search.includes(term); });
    });
  }
}

function bindInputs(root=document) {
  root.querySelectorAll("input[data-key]").forEach(input => {
    if (input.dataset.bound === "1") return;
    input.dataset.bound = "1";
    input.addEventListener("input", () => {
      const value = Number(input.value);
      const scale = Number(input.dataset.scale) || 1;
      if (Number.isFinite(value)) params[input.dataset.key] = value * scale;
      syncParamInputs(input.dataset.key, input);
      updateEngineeringSummary();
      if (input.dataset.key.startsWith("mathPoolEntryTier")) updatePoolEntryStats();
      if (input.dataset.key.startsWith("upgradeVal_")) {
        updateLiveUpgradeDescription(input);
        return;
      }
      updateEvaluation();
    });
    input.addEventListener("change", () => {
      const value = Number(input.value);
      const scale = Number(input.dataset.scale) || 1;
      if (Number.isFinite(value)) params[input.dataset.key] = value * scale;
      syncParamInputs(input.dataset.key, input);
      if (input.dataset.key.startsWith("upgradeVal_") || input.dataset.key.startsWith("upgrade")) {
        buildUpgradeOptionTables();
      }
      if (input.dataset.key.startsWith("waveReward") || input.dataset.key.startsWith("bossDiff")) {
        buildRewardTables();
      }
      updateEvaluation();
      renderEngineeringLogic();
    });
  });
}

function upgradeNumericText(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, "");
}

function upgradeEffectPhrase(spec, value) {
  const [label, unit] = spec.meta;
  const amount = upgradeNumericText(value);
  if (unit === "%") return `${label}+${amount}%`;
  if (unit === "秒") return `${label}${amount}秒`;
  if (unit === "傷害") return `${label}${amount}`;
  if (unit === "下") return `${label}+${amount}`;
  if (unit === "目標") return `${label}+${amount}目標`;
  if (unit === "次") return `${label}+${amount}次`;
  if (unit === "倍") return `${label}${amount}倍`;
  return `${label}${amount}${unit || ""}`;
}

function upgradeEffectDescription(towerId, towerIndex, rowIndex, fallback) {
  const specs = upgradeEffectSpecs(towerId, rowIndex);
  if (!specs.length) return fallback || "無可調數值";
  return specs.map(spec => {
    const value = upgradeEffectValue(towerId, rowIndex, spec.key, spec.value);
    return upgradeEffectPhrase(spec, value);
  }).join("，");
}

function updateLiveUpgradeDescription(input) {
  const match = input.dataset.key.match(/^upgradeVal_([^_]+)_(\d+)_(.+)$/);
  if (!match) return;
  const towerId = match[1];
  const rowIndex = Number(match[2]) - 1;
  const towerIndex = TOWER_TUNING.findIndex(([id]) => id === towerId);
  if (towerIndex < 0 || rowIndex < 0) return;
  const cell = document.querySelector(`[data-effect-for="${towerId}_${rowIndex}"]`);
  if (!cell) return;
  const fallback = UPGRADE_GRID[rowIndex]?.[towerIndex]?.[2] || "";
  cell.textContent = upgradeEffectDescription(towerId, towerIndex, rowIndex, fallback);
}

function upgradePoolPotential(towerRows, role) {
  const avg = towerRows.reduce((sum, row) => sum + row.roleTotal, 0) / (towerRows.length || 1);
  const sorted = [...towerRows].sort((a, b) => b.roleTotal - a.roleTotal);
  const top3 = sorted.slice(0, 3);
  const top3Avg = top3.reduce((sum, row) => sum + row.roleTotal, 0) / (top3.length || 1);
  const coreRows = towerRows.filter(row => row.rowIndex >= 4);
  const coreAvg = coreRows.reduce((sum, row) => sum + row.roleTotal, 0) / (coreRows.length || 1);
  const linkRows = towerRows.filter(row => row.tagClass === "tag-link");
  const linkAvg = linkRows.reduce((sum, row) => sum + row.roleTotal, 0) / (linkRows.length || 1);
  const controlAvg = towerRows.reduce((sum, row) => sum + row.control, 0) / (towerRows.length || 1);
  const mechanicAvg = towerRows.reduce((sum, row) => sum + row.mechanic, 0) / (towerRows.length || 1);
  return avg * .34 + top3Avg * .24 + coreAvg * .22 + linkAvg * .12 + controlAvg * role.control * .04 + mechanicAvg * role.mechanic * .04;
}

function upgradePoolSummaries(rows) {
  const summaries = TOWER_TUNING.map(([towerId, towerName], towerIndex) => {
    const role = upgradeRole(towerId);
    const towerRows = rows.filter(row => row.towerIndex === towerIndex);
    const avg = towerRows.reduce((sum, row) => sum + row.roleTotal, 0) / (towerRows.length || 1);
    const maxRow = towerRows.reduce((best, row) => !best || row.roleTotal > best.roleTotal ? row : best, null);
    const minRow = towerRows.reduce((best, row) => !best || row.roleTotal < best.roleTotal ? row : best, null);
    const spread = minRow && minRow.roleTotal > 0 ? maxRow.roleTotal / minRow.roleTotal : 0;
    const outputAvg = towerRows.reduce((sum, row) => sum + row.output, 0) / (towerRows.length || 1);
    const controlAvg = towerRows.reduce((sum, row) => sum + row.control, 0) / (towerRows.length || 1);
    const mechanicAvg = towerRows.reduce((sum, row) => sum + row.mechanic, 0) / (towerRows.length || 1);
    const tooStrong = towerRows.filter(row => row.towerRating > 145).length;
    const tooWeak = towerRows.filter(row => row.towerRating < 62).length;
    const potential = upgradePoolPotential(towerRows, role);
    return { towerId, towerName, role, avg, maxRow, minRow, spread, outputAvg, controlAvg, mechanicAvg, tooStrong, tooWeak, potential };
  });
  const potentialAvg = summaries.reduce((sum, row) => sum + row.potential, 0) / (summaries.length || 1);
  return summaries.map(row => {
    const potentialRating = potentialAvg > 0 ? row.potential / potentialAvg * 100 : 100;
    let note = "升級池穩定";
    if (row.spread > 2.2 || row.tooStrong || row.tooWeak || potentialRating > 128 || potentialRating < 72) {
      note = `需檢查：${row.tooStrong} 張偏強 / ${row.tooWeak} 張偏弱`;
    } else if (row.spread > 1.7 || potentialRating > 115 || potentialRating < 85) {
      note = "略有落差";
    }
    return { ...row, potentialRating, note };
  });
}

function renderUpgradeSummary(rows) {
  if (!ui.upgradeSummaryBody) return;
  ui.upgradeSummaryBody.innerHTML = upgradePoolSummaries(rows).map(row => {
    const spreadClass = row.spread > 2.2 ? "score-bad" : row.spread > 1.7 ? "score-warn" : "score-good";
    const potentialClass = scoreClass(row.potentialRating, 115, 128, 85, 72);
    const noteClass = row.note.includes("需檢查") ? "score-bad" : row.note.includes("略有落差") ? "score-warn" : "score-good";
    const maxInfo = row.maxRow ? `${row.maxRow.name}<br><small>${row.maxRow.roleTotal.toFixed(1)} / 塔內${Math.round(row.maxRow.towerRating)}</small>` : "X";
    const minInfo = row.minRow ? `${row.minRow.name}<br><small>${row.minRow.roleTotal.toFixed(1)} / 塔內${Math.round(row.minRow.towerRating)}</small>` : "X";
    return `<tr><td>${row.towerName}</td><td>${row.role.label}</td><td class="${potentialClass}">${Math.round(row.potentialRating)}<br><small>${row.potential.toFixed(1)}</small></td><td>${row.avg.toFixed(1)}</td><td>${maxInfo}</td><td>${minInfo}</td><td class="${spreadClass}">${row.spread.toFixed(2)}x</td><td>${row.outputAvg.toFixed(0)} / ${row.controlAvg.toFixed(0)} / ${row.mechanicAvg.toFixed(0)}</td><td class="${noteClass}">${row.note}</td></tr>`;
  }).join("");
}

function buildUpgradeOptionTables() {
  const scored = upgradeOptionScores();
  renderUpgradeSummary(scored);
  ui.upgradeOptions.innerHTML = TOWER_TUNING.map(([towerId, towerName], towerIndex) => {
    const role = upgradeRole(towerId);
    const rows = scored.filter(row => row.towerIndex === towerIndex);
    const body = rows.map(row => {
      const towerCls = scoreClass(row.towerRating);
      const globalCls = scoreClass(row.globalRating, 130, 155, 75, 55);
      const valueInputs = row.specs.length ? row.specs.map(spec => upgradeEffectInput(row.towerId, row.rowIndex, spec)).join("") : `<span class="x-cell">X</span>`;
      const effectText = upgradeEffectDescription(row.towerId, row.towerIndex, row.rowIndex, row.effect);
      return `<tr><td>${row.name}</td><td class="upgrade-value-cell">${valueInputs}</td><td>${row.trigger}</td><td data-effect-for="${row.towerId}_${row.rowIndex}">${effectText}</td><td><span class="tag ${row.tagClass}">${row.tag}</span></td><td>${row.output.toFixed(1)}</td><td>${row.control.toFixed(1)}</td><td>${row.mechanic.toFixed(1)}</td><td>${row.roleTotal.toFixed(1)}</td><td class="${towerCls}">${Math.round(row.towerRating)}</td><td class="${globalCls}">${Math.round(row.globalRating)}</td><td class="${towerCls}">${row.state}</td></tr>`;
    }).join("");
    return `<section class="sheet-card upgrade-card"><h2>${towerName}<small>${role.label}</small></h2><table class="data-table upgrade-option-table"><thead><tr><th>升級名稱</th><th>可調數值</th><th>觸發</th><th>效果描述</th><th>類型</th><th>輸出</th><th>控場</th><th>機制</th><th>定位分</th><th>塔內評級</th><th>全局評級</th><th>狀態</th></tr></thead><tbody>${body}</tbody></table></section>`;
  }).join("");
  bindInputs(ui.upgradeOptions);
}

function upgradeDesignMeta(rowIndex, text) {
  if (rowIndex <= 3) return { key:"common", label:"普通強化", tagClass:"tag-common", immediate:.95, utility:.15, base:0 };
  if (rowIndex === 4) return { key:"core", label:"核心解鎖", tagClass:"tag-core", immediate:.68, utility:1.2, base:70 };
  if (rowIndex === 5 || rowIndex === 6) return { key:"deepen", label:"核心深化", tagClass:"tag-core", immediate:.86, utility:.72, base:36 };
  if (upgradeRequirementText(text) || text.includes("解鎖")) return { key:"link", label:"前置連動", tagClass:"tag-link", immediate:.78, utility:1.05, base:48 };
  return { key:"deepen", label:"深化/聯動", tagClass:"tag-link", immediate:.82, utility:.9, base:42 };
}

function designAdjustedUpgradeScore(row) {
  const role = upgradeRole(row.towerId);
  const meta = row.designMeta;
  const immediate = row.roleTotal * meta.immediate;
  const utility = (row.control * role.control + row.mechanic * role.mechanic) * meta.utility;
  return Math.max(0, immediate + utility + meta.base);
}

function averageBy(rows, keyFn, valueFn) {
  const sums = new Map();
  rows.forEach(row => {
    const key = keyFn(row);
    const current = sums.get(key) || { sum:0, count:0 };
    current.sum += valueFn(row);
    current.count += 1;
    sums.set(key, current);
  });
  const avgs = new Map();
  sums.forEach((value, key) => avgs.set(key, value.count ? value.sum / value.count : 0));
  return avgs;
}

function upgradeOptionScores() {
  const rows = [];
  UPGRADE_GRID.forEach((upgradeRow, rowIndex) => {
    upgradeRow.forEach((option, towerIndex) => {
      if (!option) return;
      const [towerId] = TOWER_TUNING[towerIndex];
      const scored = { towerId, towerIndex, rowIndex, ...scoreUpgradeOption(towerId, rowIndex, option) };
      scored.designMeta = upgradeDesignMeta(rowIndex, `${scored.name} ${scored.trigger} ${scored.effect}`);
      scored.roleTotal = roleAdjustedUpgradeScore(scored);
      scored.designTotal = designAdjustedUpgradeScore(scored);
      rows.push(scored);
    });
  });
  const towerImmediateAvg = averageBy(rows, row => row.towerIndex, row => row.roleTotal);
  const towerDesignAvg = averageBy(rows, row => row.towerIndex, row => row.designTotal);
  const designTypeAvg = averageBy(rows, row => row.designMeta.key, row => row.designTotal);
  const globalImmediateAvg = rows.reduce((sum, row) => sum + row.roleTotal, 0) / (rows.length || 1);
  rows.forEach(row => {
    const towerImmediate = towerImmediateAvg.get(row.towerIndex) || globalImmediateAvg || 1;
    const towerDesign = towerDesignAvg.get(row.towerIndex) || row.designTotal || 1;
    const typeDesign = designTypeAvg.get(row.designMeta.key) || row.designTotal || 1;
    row.towerRating = towerImmediate > 0 ? row.roleTotal / towerImmediate * 100 : 100;
    row.designRating = typeDesign > 0 ? row.designTotal / typeDesign * 100 : 100;
    row.poolRating = towerDesign > 0 ? row.designTotal / towerDesign * 100 : 100;
    row.rating = row.designRating;
    row.state = upgradeBalanceState(row.designRating);
  });
  return rows;
}

function upgradePoolPotential(towerRows, role) {
  const avg = towerRows.reduce((sum, row) => sum + row.designTotal, 0) / (towerRows.length || 1);
  const sorted = [...towerRows].sort((a, b) => b.designTotal - a.designTotal);
  const top3 = sorted.slice(0, 3);
  const top3Avg = top3.reduce((sum, row) => sum + row.designTotal, 0) / (top3.length || 1);
  const coreRows = towerRows.filter(row => row.designMeta.key === "core" || row.designMeta.key === "deepen");
  const coreAvg = coreRows.reduce((sum, row) => sum + row.designTotal, 0) / (coreRows.length || 1);
  const linkRows = towerRows.filter(row => row.designMeta.key === "link");
  const linkAvg = linkRows.reduce((sum, row) => sum + row.designTotal, 0) / (linkRows.length || 1);
  const controlAvg = towerRows.reduce((sum, row) => sum + row.control, 0) / (towerRows.length || 1);
  const mechanicAvg = towerRows.reduce((sum, row) => sum + row.mechanic, 0) / (towerRows.length || 1);
  return avg * .30 + top3Avg * .20 + coreAvg * .25 + linkAvg * .15 + controlAvg * role.control * .05 + mechanicAvg * role.mechanic * .05;
}

function upgradePoolSummaries(rows) {
  const summaries = TOWER_TUNING.map(([towerId, towerName], towerIndex) => {
    const role = upgradeRole(towerId);
    const towerRows = rows.filter(row => row.towerIndex === towerIndex);
    const avg = towerRows.reduce((sum, row) => sum + row.designTotal, 0) / (towerRows.length || 1);
    const maxRow = towerRows.reduce((best, row) => !best || row.designTotal > best.designTotal ? row : best, null);
    const minRow = towerRows.reduce((best, row) => !best || row.designTotal < best.designTotal ? row : best, null);
    const spread = minRow && minRow.designTotal > 0 ? maxRow.designTotal / minRow.designTotal : 0;
    const outputAvg = towerRows.reduce((sum, row) => sum + row.output, 0) / (towerRows.length || 1);
    const controlAvg = towerRows.reduce((sum, row) => sum + row.control, 0) / (towerRows.length || 1);
    const mechanicAvg = towerRows.reduce((sum, row) => sum + row.mechanic, 0) / (towerRows.length || 1);
    const tooStrong = towerRows.filter(row => row.designRating > 145).length;
    const tooWeak = towerRows.filter(row => row.designRating < 62).length;
    const potential = upgradePoolPotential(towerRows, role);
    return { towerId, towerName, role, avg, maxRow, minRow, spread, outputAvg, controlAvg, mechanicAvg, tooStrong, tooWeak, potential };
  });
  const potentialAvg = summaries.reduce((sum, row) => sum + row.potential, 0) / (summaries.length || 1);
  return summaries.map(row => {
    const potentialRating = potentialAvg > 0 ? row.potential / potentialAvg * 100 : 100;
    let note = "升級池穩定";
    if (row.spread > 2.2 || row.tooStrong || row.tooWeak || potentialRating > 128 || potentialRating < 72) {
      note = `需檢查：${row.tooStrong} 張偏強 / ${row.tooWeak} 張偏弱`;
    } else if (row.spread > 1.7 || potentialRating > 115 || potentialRating < 85) {
      note = "略有落差";
    }
    return { ...row, potentialRating, note };
  });
}

function renderUpgradeSummary(rows) {
  if (!ui.upgradeSummaryBody) return;
  ui.upgradeSummaryBody.innerHTML = upgradePoolSummaries(rows).map(row => {
    const spreadClass = row.spread > 2.2 ? "score-bad" : row.spread > 1.7 ? "score-warn" : "score-good";
    const potentialClass = scoreClass(row.potentialRating, 115, 128, 85, 72);
    const noteClass = row.note.includes("需檢查") ? "score-bad" : row.note.includes("略有落差") ? "score-warn" : "score-good";
    const maxInfo = row.maxRow ? `${row.maxRow.name}<br><small>${row.maxRow.designTotal.toFixed(1)} / ${row.maxRow.designMeta.label}</small>` : "X";
    const minInfo = row.minRow ? `${row.minRow.name}<br><small>${row.minRow.designTotal.toFixed(1)} / ${row.minRow.designMeta.label}</small>` : "X";
    return `<tr><td>${row.towerName}</td><td>${row.role.label}</td><td class="${potentialClass}">${Math.round(row.potentialRating)}<br><small>${row.potential.toFixed(1)}</small></td><td>${row.avg.toFixed(1)}</td><td>${maxInfo}</td><td>${minInfo}</td><td class="${spreadClass}">${row.spread.toFixed(2)}x</td><td>${row.outputAvg.toFixed(0)} / ${row.controlAvg.toFixed(0)} / ${row.mechanicAvg.toFixed(0)}</td><td class="${noteClass}">${row.note}</td></tr>`;
  }).join("");
}

function buildUpgradeOptionTables() {
  const scored = upgradeOptionScores();
  renderUpgradeSummary(scored);
  ui.upgradeOptions.innerHTML = TOWER_TUNING.map(([towerId, towerName], towerIndex) => {
    const role = upgradeRole(towerId);
    const rows = scored.filter(row => row.towerIndex === towerIndex);
    const body = rows.map(row => {
      const designCls = scoreClass(row.designRating);
      const poolCls = scoreClass(row.poolRating, 130, 155, 75, 55);
      const valueInputs = row.specs.length ? row.specs.map(spec => upgradeEffectInput(row.towerId, row.rowIndex, spec)).join("") : `<span class="x-cell">X</span>`;
      const effectText = upgradeEffectDescription(row.towerId, row.towerIndex, row.rowIndex, row.effect);
      return `<tr><td>${row.name}</td><td class="upgrade-value-cell">${valueInputs}</td><td>${row.trigger}</td><td data-effect-for="${row.towerId}_${row.rowIndex}">${effectText}</td><td><span class="tag ${row.designMeta.tagClass}">${row.designMeta.label}</span></td><td>${row.output.toFixed(1)}</td><td>${row.control.toFixed(1)}</td><td>${row.mechanic.toFixed(1)}</td><td>${row.roleTotal.toFixed(1)}</td><td>${row.designTotal.toFixed(1)}</td><td class="${poolCls}">${Math.round(row.poolRating)}</td><td class="${designCls}">${Math.round(row.designRating)}</td><td class="${designCls}">${row.state}</td></tr>`;
    }).join("");
    return `<section class="sheet-card upgrade-card"><h2>${towerName}<small>${role.label}</small></h2><table class="data-table upgrade-option-table"><thead><tr><th>升級名稱</th><th>可調數值</th><th>觸發</th><th>效果描述</th><th>設計類型</th><th>輸出</th><th>控場</th><th>機制</th><th>當下分</th><th>潛力分</th><th>塔內評級</th><th>同類評級</th><th>狀態</th></tr></thead><tbody>${body}</tbody></table></section>`;
  }).join("");
  bindInputs(ui.upgradeOptions);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function towerBaseFactorMap() {
  const scores = towerScores();
  const avgOutput = scores.reduce((sum, row) => sum + row.outputRaw, 0) / (scores.length || 1) || 1;
  const avgControl = scores.reduce((sum, row) => sum + row.controlRaw, 0) / (scores.length || 1) || 1;
  const avgTotal = scores.reduce((sum, row) => sum + row.raw, 0) / (scores.length || 1) || 1;
  const map = {};
  scores.forEach(row => {
    map[row.id] = {
      output: clampNumber(row.outputRaw / avgOutput, .55, 1.75),
      control: row.controlRaw > 0 ? clampNumber(row.controlRaw / avgControl, .55, 1.85) : .72,
      total: clampNumber(row.raw / avgTotal, .60, 1.70),
    };
  });
  return map;
}

function scoreUpgradeSpecsForTower(towerId, specs, value) {
  const generic = scoreUpgradeSpecs(specs, value);
  const factors = towerBaseFactorMap()[towerId] || { output:1, control:1, total:1 };
  const role = upgradeRole(towerId);
  const model = TOWER_SCORE_MODEL[towerId] || {};
  const extraCount = specs.reduce((sum, spec) => {
    if (!["extraShots", "extraAreas", "extraProjectiles", "extraPierce", "extraChainCasts", "extraLaserTargets"].includes(spec.key)) return sum;
    return sum + Math.max(0, Number(value(spec.key)) || 0);
  }, 0);
  let output = generic.output * factors.output;
  let control = generic.control * factors.control;
  let mechanic = generic.mechanic * (.72 + factors.total * .28);
  if (extraCount > 0) {
    const isControlCoverage = role.control > 1 || (model.control || 0) > 0 || ["frostbomb", "trap", "cryo"].includes(towerId);
    const isAreaCoverage = ["grenade", "frostbomb", "gas", "trap"].includes(towerId);
    const nonStackCoverageMul = towerId === "trap" ? .62 : 1;
    const coverageValue = extraCount * (34 + Math.max(0, role.control - 1) * 92) * factors.control * nonStackCoverageMul;
    const mechanicValue = extraCount * (18 + Math.max(0, role.mechanic - 1) * 44) * factors.total;
    if (isControlCoverage) control += coverageValue;
    if (isAreaCoverage) output += extraCount * 22 * factors.output;
    mechanic += mechanicValue;
  }
  if (towerId === "trap" && specs.some(spec => ["rootTime", "rootDurationPct", "pullStrengthPct"].includes(spec.key))) {
    control *= .72;
    mechanic += 8 * factors.total;
  }
  return {
    output,
    control,
    mechanic,
    baseFactor: factors.total,
    outputFactor: factors.output,
    controlFactor: factors.control,
  };
}

function scoreUpgradeOption(towerId, rowIndex, option) {
  const [name, trigger, effect] = option;
  const requirement = UPGRADE_REQUIREMENT_LABELS[name] || "";
  const specs = upgradeEffectSpecs(towerId, rowIndex);
  const value = key => {
    const spec = specs.find(item => item.key === key);
    return upgradeEffectValue(towerId, rowIndex, key, spec ? spec.value : 0);
  };
  const numeric = scoreUpgradeSpecsForTower(towerId, specs, value);
  const output = numeric.output;
  const control = numeric.control;
  const mechanic = numeric.mechanic;
  const tag = upgradeTag(rowIndex, `${name} ${trigger} ${effect}`);
  const total = Math.max(0, output + control + mechanic);
  return { name, trigger:requirement ? `需 ${requirement}｜${trigger}` : trigger, effect, specs, output, control, mechanic, total, baseFactor:numeric.baseFactor, outputFactor:numeric.outputFactor, controlFactor:numeric.controlFactor, ...tag };
}

function buildUpgradeOptionTables() {
  const scored = upgradeOptionScores();
  renderUpgradeSummary(scored);
  ui.upgradeOptions.innerHTML = TOWER_TUNING.map(([towerId, towerName], towerIndex) => {
    const role = upgradeRole(towerId);
    const rows = scored.filter(row => row.towerIndex === towerIndex);
    const body = rows.map(row => {
      const designCls = scoreClass(row.designRating);
      const poolCls = scoreClass(row.poolRating, 130, 155, 75, 55);
      const valueInputs = row.specs.length ? row.specs.map(spec => upgradeEffectInput(row.towerId, row.rowIndex, spec)).join("") : `<span class="x-cell">X</span>`;
      const effectText = upgradeEffectDescription(row.towerId, row.towerIndex, row.rowIndex, row.effect);
      return `<tr><td>${row.name}</td><td class="upgrade-value-cell">${valueInputs}</td><td>${row.trigger}</td><td data-effect-for="${row.towerId}_${row.rowIndex}">${effectText}</td><td><span class="tag ${row.designMeta.tagClass}">${row.designMeta.label}</span></td><td>x${row.baseFactor.toFixed(2)}</td><td>${row.output.toFixed(1)}</td><td>${row.control.toFixed(1)}</td><td>${row.mechanic.toFixed(1)}</td><td>${row.roleTotal.toFixed(1)}</td><td>${row.designTotal.toFixed(1)}</td><td class="${poolCls}">${Math.round(row.poolRating)}</td><td class="${designCls}">${Math.round(row.designRating)}</td><td class="${designCls}">${row.state}</td></tr>`;
    }).join("");
    return `<section class="sheet-card upgrade-card"><h2>${towerName}<small>${role.label}</small></h2><table class="data-table upgrade-option-table"><thead><tr><th>升級名稱</th><th>可調數值</th><th>觸發</th><th>效果描述</th><th>設計類型</th><th>基礎倍率</th><th>輸出</th><th>控場</th><th>機制</th><th>當下分</th><th>潛力分</th><th>塔內評級</th><th>同類評級</th><th>狀態</th></tr></thead><tbody>${body}</tbody></table></section>`;
  }).join("");
  bindInputs(ui.upgradeOptions);
}

function buildUpgradeOptionTables() {
  const scored = upgradeOptionScores();
  renderUpgradeSummary(scored);
  ui.upgradeOptions.innerHTML = TOWER_TUNING.map(([towerId, towerName], towerIndex) => {
    const role = upgradeRole(towerId);
    const rows = scored.filter(row => row.towerIndex === towerIndex);
    const body = rows.map(row => {
      const designCls = scoreClass(row.designRating);
      const poolCls = scoreClass(row.poolRating, 130, 155, 75, 55);
      const valueInputs = row.specs.length ? row.specs.map(spec => upgradeEffectInput(row.towerId, row.rowIndex, spec)).join("") : `<span class="x-cell">X</span>`;
      const effectText = upgradeEffectDescription(row.towerId, row.towerIndex, row.rowIndex, row.effect);
      return `<tr><td>${row.name}</td><td class="${designCls}">${row.state}</td><td class="${poolCls}">${Math.round(row.poolRating)}</td><td class="${designCls}">${Math.round(row.designRating)}</td><td><span class="tag ${row.designMeta.tagClass}">${row.designMeta.label}</span></td><td class="upgrade-value-cell">${valueInputs}</td><td>${row.trigger}</td><td data-effect-for="${row.towerId}_${row.rowIndex}">${effectText}</td><td>x${row.baseFactor.toFixed(2)}</td><td>${row.output.toFixed(1)}</td><td>${row.control.toFixed(1)}</td><td>${row.mechanic.toFixed(1)}</td><td>${row.roleTotal.toFixed(1)}</td><td>${row.designTotal.toFixed(1)}</td></tr>`;
    }).join("");
    return `<section class="sheet-card upgrade-card"><h2>${towerName}<small>${role.label}</small></h2><table class="data-table upgrade-option-table"><thead><tr><th>升級名稱</th><th>狀態</th><th>塔內評級</th><th>同類評級</th><th>設計類型</th><th>可調數值</th><th>觸發</th><th>效果描述</th><th>基礎倍率</th><th>輸出</th><th>控場</th><th>機制</th><th>當下分</th><th>潛力分</th></tr></thead><tbody>${body}</tbody></table></section>`;
  }).join("");
  bindInputs(ui.upgradeOptions);
}

const REPEATABLE_UPGRADE_KEYS = new Set([
  "damagePct", "ratePct", "rangePct", "durationPct",
  "burnDurationPct", "poisonDurationPct", "slowDurationPct", "zoneDurationPct", "iceTrailDurationPct", "stunDurationPct", "rootDurationPct",
  "dotDamagePct", "pathDamagePct", "focusDamageBonusPct", "focusDelayReducePct", "vulnerableBonusPct", "iceTrailSlowBonusPct", "ricochetDamageBonusPct",
  "extraShots", "extraAreas", "extraProjectiles", "extraPierce", "extraChainCasts", "extraChains", "extraLaserTargets", "ricochetExtra"
]);
const ONE_TIME_UPGRADE_KEYS = new Set([
  "burnDps", "burnTime", "burnAreaDps", "burnAreaTime",
  "poisonTick", "poisonDps", "poisonTime",
  "slowPct", "slowTime", "freezeTime", "iceTrailSlowPct", "iceTrailTime",
  "stunTime", "rootTime", "pullStrengthPct",
  "focusDelay", "focusDamagePct", "refractDamagePct",
  "ricochetChancePct", "ricochetDamagePct",
  "pathDamage", "vulnerablePct",
  "conditionalExplosionPct", "conditionalExplosionRadius", "conditionalStunTime", "poisonTargetDamagePct",
  "zoneStunTime", "zoneTime", "zonePoisonDps", "zonePoisonTime", "trailSlowPct", "trailTime",
  "shardCount", "shardDamagePct", "freezeDurationPct", "postFreezeSlowPct", "postFreezeSlowTime",
  "refractFocusPct", "focusedBurstDamagePct", "focusedBurstRadius", "electricVulnerablePct", "electricVulnerableTime",
  "focusConduit", "poisonBurstDamagePct", "poisonBurstRadius", "poisonChainDamagePct", "burningTargetDamagePct",
  "zoneSlowPct", "frozenTargetDamagePct"
]);

function upgradeRepeatabilityForScore(towerId, rowIndex, specs) {
  if (specs.some(spec => ONE_TIME_UPGRADE_KEYS.has(spec.key))) return { key:"once", label:"一次性", className:"tag-core", stackWeight:1, stackRisk:0 };
  if (specs.length && specs.every(spec => REPEATABLE_UPGRADE_KEYS.has(spec.key))) {
    const isBasic = rowIndex <= 2;
    const hasExtraBody = specs.some(spec => ["extraShots", "extraAreas", "extraProjectiles", "extraPierce", "extraChainCasts", "extraChains", "extraLaserTargets", "ricochetExtra"].includes(spec.key));
    return {
      key:"repeat",
      label:"可重複",
      className:"tag-repeat",
      stackWeight: hasExtraBody ? 1.34 : isBasic ? 1.24 : 1.18,
      stackRisk: hasExtraBody ? 16 : isBasic ? 10 : 8,
    };
  }
  return rowIndex <= 2
    ? { key:"repeat", label:"可重複", className:"tag-repeat", stackWeight:1.18, stackRisk:8 }
    : { key:"once", label:"一次性", className:"tag-core", stackWeight:1, stackRisk:0 };
}

function upgradeDesignMeta(rowIndex, text, repeatInfo={ key:"once" }) {
  if (repeatInfo.key === "repeat") return { key:"repeat", label:"可重複數值", tagClass:"tag-repeat", immediate:1.00, utility:.35, base:12 };
  if (rowIndex <= 2) return { key:"common", label:"普通強化", tagClass:"tag-common", immediate:.95, utility:.15, base:0 };
  if (rowIndex === 3) return { key:"core", label:"核心解鎖", tagClass:"tag-core", immediate:.72, utility:1.2, base:68 };
  return { key:"link", label:"前置連動", tagClass:"tag-link", immediate:.78, utility:1.05, base:48 };
}

function designAdjustedUpgradeScore(row) {
  const role = upgradeRole(row.towerId);
  const meta = row.designMeta;
  const repeat = row.repeatInfo || { stackWeight:1, stackRisk:0 };
  const immediate = row.roleTotal * meta.immediate;
  const utility = (row.control * role.control + row.mechanic * role.mechanic) * meta.utility;
  return Math.max(0, (immediate + utility + meta.base) * repeat.stackWeight + repeat.stackRisk);
}

function upgradeOptionScores() {
  const rows = [];
  UPGRADE_GRID.forEach((upgradeRow, rowIndex) => {
    upgradeRow.forEach((option, towerIndex) => {
      if (!option) return;
      const [towerId] = TOWER_TUNING[towerIndex];
      const scored = { towerId, towerIndex, rowIndex, ...scoreUpgradeOption(towerId, rowIndex, option) };
      scored.repeatInfo = upgradeRepeatabilityForScore(towerId, rowIndex, scored.specs);
      scored.designMeta = upgradeDesignMeta(rowIndex, `${scored.name} ${scored.trigger} ${scored.effect}`, scored.repeatInfo);
      scored.roleTotal = roleAdjustedUpgradeScore(scored);
      scored.designTotal = designAdjustedUpgradeScore(scored);
      rows.push(scored);
    });
  });
  const towerImmediateAvg = averageBy(rows, row => row.towerIndex, row => row.roleTotal);
  const towerDesignAvg = averageBy(rows, row => row.towerIndex, row => row.designTotal);
  const designTypeAvg = averageBy(rows, row => `${row.designMeta.key}:${row.repeatInfo.key}`, row => row.designTotal);
  const globalImmediateAvg = rows.reduce((sum, row) => sum + row.roleTotal, 0) / (rows.length || 1);
  rows.forEach(row => {
    const towerImmediate = towerImmediateAvg.get(row.towerIndex) || globalImmediateAvg || 1;
    const towerDesign = towerDesignAvg.get(row.towerIndex) || row.designTotal || 1;
    const typeDesign = designTypeAvg.get(`${row.designMeta.key}:${row.repeatInfo.key}`) || row.designTotal || 1;
    row.towerRating = towerImmediate > 0 ? row.roleTotal / towerImmediate * 100 : 100;
    row.designRating = typeDesign > 0 ? row.designTotal / typeDesign * 100 : 100;
    row.poolRating = towerDesign > 0 ? row.designTotal / towerDesign * 100 : 100;
    row.rating = row.designRating;
    row.state = upgradeBalanceState(row.designRating);
  });
  return rows;
}

function upgradePoolPotential(towerRows, role) {
  const avg = towerRows.reduce((sum, row) => sum + row.designTotal, 0) / (towerRows.length || 1);
  const repeatRows = towerRows.filter(row => row.repeatInfo?.key === "repeat");
  const repeatAvg = repeatRows.reduce((sum, row) => sum + row.designTotal, 0) / (repeatRows.length || 1);
  const sorted = [...towerRows].sort((a, b) => b.designTotal - a.designTotal);
  const top3 = sorted.slice(0, 3);
  const top3Avg = top3.reduce((sum, row) => sum + row.designTotal, 0) / (top3.length || 1);
  const coreRows = towerRows.filter(row => row.designMeta.key === "core" || row.designMeta.key === "deepen");
  const coreAvg = coreRows.reduce((sum, row) => sum + row.designTotal, 0) / (coreRows.length || 1);
  const linkRows = towerRows.filter(row => row.designMeta.key === "link");
  const linkAvg = linkRows.reduce((sum, row) => sum + row.designTotal, 0) / (linkRows.length || 1);
  const controlAvg = towerRows.reduce((sum, row) => sum + row.control, 0) / (towerRows.length || 1);
  const mechanicAvg = towerRows.reduce((sum, row) => sum + row.mechanic, 0) / (towerRows.length || 1);
  return avg * .24 + repeatAvg * .16 + top3Avg * .17 + coreAvg * .20 + linkAvg * .13 + controlAvg * role.control * .05 + mechanicAvg * role.mechanic * .05;
}

function buildUpgradeOptionTables() {
  const scored = upgradeOptionScores();
  renderUpgradeSummary(scored);
  ui.upgradeOptions.innerHTML = TOWER_TUNING.map(([towerId, towerName], towerIndex) => {
    const role = upgradeRole(towerId);
    const rows = scored.filter(row => row.towerIndex === towerIndex);
    const body = rows.map(row => {
      const designCls = scoreClass(row.designRating);
      const poolCls = scoreClass(row.poolRating, 130, 155, 75, 55);
      const valueInputs = row.specs.length ? row.specs.map(spec => upgradeEffectInput(row.towerId, row.rowIndex, spec)).join("") : `<span class="x-cell">X</span>`;
      const effectText = upgradeEffectDescription(row.towerId, row.towerIndex, row.rowIndex, row.effect);
      return `<tr><td>${row.name}</td><td class="${designCls}">${row.state}</td><td class="${poolCls}">${Math.round(row.poolRating)}</td><td class="${designCls}">${Math.round(row.designRating)}</td><td><span class="tag ${row.repeatInfo.className}">${row.repeatInfo.label}</span></td><td><span class="tag ${row.designMeta.tagClass}">${row.designMeta.label}</span></td><td class="upgrade-value-cell">${valueInputs}</td><td>${row.trigger}</td><td data-effect-for="${row.towerId}_${row.rowIndex}">${effectText}</td><td>x${row.baseFactor.toFixed(2)}</td><td>${row.output.toFixed(1)}</td><td>${row.control.toFixed(1)}</td><td>${row.mechanic.toFixed(1)}</td><td>${row.roleTotal.toFixed(1)}</td><td>${row.designTotal.toFixed(1)}</td></tr>`;
    }).join("");
    return `<section class="sheet-card upgrade-card"><h2>${towerName}<small>${role.label}</small></h2><table class="data-table upgrade-option-table"><thead><tr><th>升級名稱</th><th>狀態</th><th>塔內評級</th><th>同類評級</th><th>重複</th><th>設計類型</th><th>可調數值</th><th>觸發</th><th>效果描述</th><th>基礎倍率</th><th>輸出</th><th>控場</th><th>機制</th><th>當下分</th><th>潛力分</th></tr></thead><tbody>${body}</tbody></table></section>`;
  }).join("");
  bindInputs(ui.upgradeOptions);
}

function applyToGame() {
  params = cleanParams(params);
  localStorage.setItem(PARAM_STORAGE_KEY, JSON.stringify(params));
  channel?.postMessage({ type: "towerDefenseParams", params });
  ui.status.textContent = `已更新到遊戲：${new Date().toLocaleTimeString()}`;
  build();
}
function switchTab(tabName) {
  ui.tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.tab === tabName));
  Object.entries(ui.panels).forEach(([name, panel]) => panel.classList.toggle("active", name === tabName));
  if (tabName === "pool" || tabName === "logic") renderEngineeringLogic();
}
ui.tabs.forEach(tab => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));
ui.apply.addEventListener("click", applyToGame);
ui.reset.addEventListener("click", () => { params = cleanParams(); build(); applyToGame(); });
ui.export.addEventListener("click", () => { ui.json.value = JSON.stringify(cleanParams(params), null, 2); });
ui.import.addEventListener("click", () => { try { params = cleanParams(JSON.parse(ui.json.value)); build(); applyToGame(); } catch { ui.status.textContent = "JSON 格式錯誤，沒有匯入。"; } });
build();
