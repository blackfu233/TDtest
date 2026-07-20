const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
const BUILD_VERSION = "sound-laser1";
const MAX_EFFECTS = 240;
const UI_FRAME_MS = 1000 / 30;
const DEBUG_FRAME_MS = 250;

const ui = {
  phone: document.querySelector(".phone"),
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
  bottomUi: document.querySelector(".bottom-ui"),
  betMinus: document.getElementById("betMinusBtn"),
  betPlus: document.getElementById("betPlusBtn"),
  betText: document.getElementById("betText"),
  waveBet: document.getElementById("waveBetText"),
  bet: document.getElementById("betBtn"),
  nextAttrHint: document.getElementById("nextAttrHint"),
  nextAttrCanvas: document.getElementById("nextAttrIcon"),
  waveAttrCanvas: document.getElementById("waveAttrIcon"),
  collect: document.getElementById("collectBtn"),
  collectText: document.getElementById("collectText"),
  reset: document.getElementById("resetBtn"),
  sound: document.getElementById("soundBtn"),
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
const SOUND_STORAGE_KEY = "towerDefenseSoundMuted.v1";
const FIELD = { w: 350, h: 760, pathX: 175, spawnY: -18, baseY: 720, attackLineY: 720 };
const TOWER_SLOTS = [{ x: 62, y: 700 }, { x: 175, y: 678 }, { x: 288, y: 700 }];
const EXP_TABLE = [95,125,155,190,225,290,330,370,415,460,510,565,625,690,760,835,915,1000,1090,1185,1285,1390,1500,1615,1735,1860,1990,2125,2265,2410,2560,2715,2875,3040,3210,3385,3565,3750,3940];

const audioState = {
  ctx: null,
  master: null,
  muted: false,
  last: new Map(),
  noiseBuffer: null,
  channels: new Set(),
};
try { audioState.muted = localStorage.getItem(SOUND_STORAGE_KEY) === "1"; } catch {}

function ensureAudio() {
  if (audioState.muted) return null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioState.ctx) {
    audioState.ctx = new AudioCtor({ latencyHint:"interactive" });
    audioState.master = audioState.ctx.createGain();
    audioState.master.gain.value = .42;
    audioState.master.connect(audioState.ctx.destination);
  }
  if (audioState.ctx.state === "suspended") audioState.ctx.resume().catch(() => {});
  return audioState.ctx;
}

function soundTone(key, frequency, duration=.08, type="sine", gain=.05, endFrequency=frequency, delay=0, minGap=0) {
  const audio = ensureAudio();
  if (!audio) return;
  const previous = audioState.last.get(key) ?? -Infinity;
  if (audio.currentTime - previous < minGap) return;
  audioState.last.set(key, audio.currentTime);
  const start = audio.currentTime + delay;
  const end = start + duration;
  const oscillator = audio.createOscillator();
  const volume = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), end);
  volume.gain.setValueAtTime(.0001, start);
  volume.gain.exponentialRampToValueAtTime(Math.max(.0002, gain), start + Math.min(.018, duration * .25));
  volume.gain.exponentialRampToValueAtTime(.0001, end);
  oscillator.connect(volume);
  volume.connect(audioState.master);
  oscillator.start(start);
  oscillator.stop(end + .02);
}

function soundNoise(key, duration=.1, gain=.035, filterFrequency=900, delay=0, minGap=0) {
  const audio = ensureAudio();
  if (!audio) return;
  const previous = audioState.last.get(key) ?? -Infinity;
  if (audio.currentTime - previous < minGap) return;
  audioState.last.set(key, audio.currentTime);
  if (!audioState.noiseBuffer) {
    const length = Math.ceil(audio.sampleRate * .6);
    audioState.noiseBuffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = audioState.noiseBuffer.getChannelData(0);
    for (let i=0;i<length;i+=1) data[i] = Math.random() * 2 - 1;
  }
  const start = audio.currentTime + delay;
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const volume = audio.createGain();
  source.buffer = audioState.noiseBuffer;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(filterFrequency, start);
  volume.gain.setValueAtTime(Math.max(.0002, gain), start);
  volume.gain.exponentialRampToValueAtTime(.0001, start + duration);
  source.connect(filter);
  filter.connect(volume);
  volume.connect(audioState.master);
  source.start(start);
  source.stop(start + duration + .02);
}

function playSfx(name) {
  if (name === "bet") {
    soundTone("bet-low", 150, .09, "square", .045, 205);
    soundTone("bet-high", 260, .1, "triangle", .04, 360, .07);
  } else if (name === "ui") soundTone("ui", 360, .045, "square", .025, 440, 0, .035);
  else if (name === "upgrade") {
    soundTone("upgrade-a", 410, .11, "triangle", .045, 610);
    soundTone("upgrade-b", 610, .13, "triangle", .04, 880, .09);
  } else if (name === "coin") soundTone("coin", 760, .07, "sine", .032, 1120, 0, .055);
  else if (name === "elite") {
    soundNoise("elite-noise", .2, .05, 1500);
    soundTone("elite-a", 180, .18, "sawtooth", .055, 420);
    soundTone("elite-b", 480, .22, "triangle", .055, 820, .1);
  } else if (name === "boss") {
    soundNoise("boss-noise", .32, .06, 1000);
    [180,270,405,610].forEach((frequency, index) => soundTone(`boss-${index}`, frequency, .18, "sawtooth", .055, frequency * 1.18, index * .11));
  } else if (name === "waveClear") {
    [420,560,740].forEach((frequency, index) => soundTone(`clear-${index}`, frequency, .14, "triangle", .04, frequency * 1.08, index * .08));
  } else if (name === "collect") {
    [520,680,920].forEach((frequency, index) => soundTone(`collect-${index}`, frequency, .16, "sine", .05, frequency * 1.18, index * .09));
  } else if (name === "baseHit") {
    soundNoise("base-hit-noise", .09, .045, 420, 0, .14);
    soundTone("base-hit", 92, .12, "square", .04, 54, 0, .14);
  } else if (name === "fail") {
    soundNoise("fail-noise", .38, .055, 520);
    soundTone("fail-a", 220, .48, "sawtooth", .055, 72);
  }
}

function playTowerSfx(mode) {
  if (mode === "grenade") {
    soundNoise("tower-grenade", .12, .035, 620, 0, .18);
    soundTone("tower-grenade-tone", 125, .14, "square", .035, 74, 0, .18);
  } else if (mode === "cryo") soundTone("tower-cryo", 980, .1, "sine", .04, 1480, 0, .16);
  else if (mode === "frostbomb") {
    soundTone("tower-frost", 620, .14, "triangle", .038, 380, 0, .18);
    soundTone("tower-frost-hi", 1240, .09, "sine", .025, 820, .03, .18);
  } else if (mode === "chain") {
    soundNoise("tower-chain-noise", .08, .025, 2400, 0, .12);
    soundTone("tower-chain", 520, .09, "sawtooth", .035, 1180, 0, .12);
  } else if (mode === "gas") soundNoise("tower-gas", .2, .035, 760, 0, .22);
  else if (mode === "needle") soundTone("tower-needle", 520, .065, "square", .03, 260, 0, .11);
  else if (mode === "blade") {
    soundNoise("tower-blade-noise", .08, .022, 1800, 0, .11);
    soundTone("tower-blade", 260, .1, "sawtooth", .028, 520, 0, .11);
  } else if (mode === "trap") soundTone("tower-trap", 150, .12, "triangle", .032, 98, 0, .18);
  else if (mode === "flame") soundNoise("tower-flame-start", .16, .045, 1300, 0, .2);
  else if (mode === "laser") soundTone("tower-laser-start", 110, .16, "sawtooth", .04, 190, 0, .2);
}

function startChannelAudio(mode) {
  const audio = ensureAudio();
  if (!audio || (mode !== "laser" && mode !== "flame")) return null;
  const start = audio.currentTime;
  const volume = audio.createGain();
  volume.gain.setValueAtTime(.0001, start);
  volume.gain.exponentialRampToValueAtTime(mode === "laser" ? .025 : .032, start + .06);
  volume.connect(audioState.master);
  let source;
  let extra = null;
  if (mode === "laser") {
    source = audio.createOscillator();
    source.type = "sawtooth";
    source.frequency.setValueAtTime(118, start);
    source.frequency.linearRampToValueAtTime(132, start + 1.2);
    extra = audio.createOscillator();
    extra.type = "sine";
    extra.frequency.setValueAtTime(236, start);
    extra.connect(volume);
    extra.start(start);
  } else {
    if (!audioState.noiseBuffer) {
      const length = Math.ceil(audio.sampleRate * .6);
      audioState.noiseBuffer = audio.createBuffer(1, length, audio.sampleRate);
      const data = audioState.noiseBuffer.getChannelData(0);
      for (let i=0;i<length;i+=1) data[i] = Math.random() * 2 - 1;
    }
    source = audio.createBufferSource();
    source.buffer = audioState.noiseBuffer;
    source.loop = true;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 720;
    filter.Q.value = .7;
    source.connect(filter);
    filter.connect(volume);
  }
  source.connect(volume);
  source.start(start);
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    const now = audio.currentTime;
    volume.gain.cancelScheduledValues(now);
    volume.gain.setValueAtTime(Math.max(.0001, volume.gain.value), now);
    volume.gain.exponentialRampToValueAtTime(.0001, now + .055);
    try { source.stop(now + .06); } catch {}
    try { extra?.stop(now + .06); } catch {}
    audioState.channels.delete(stop);
  };
  audioState.channels.add(stop);
  return stop;
}

function stopChannelAudio() {
  [...audioState.channels].forEach(stop => stop());
  audioState.channels.clear();
}

function updateSoundButton() {
  if (!ui.sound) return;
  ui.sound.classList.toggle("muted", audioState.muted);
  ui.sound.setAttribute?.("aria-label", audioState.muted ? "開啟音效" : "關閉音效");
}

function toggleSound() {
  audioState.muted = !audioState.muted;
  try { localStorage.setItem(SOUND_STORAGE_KEY, audioState.muted ? "1" : "0"); } catch {}
  if (audioState.muted) stopChannelAudio();
  else {
    ensureAudio();
    playSfx("ui");
  }
  updateSoundButton();
}

const TOWERS = [
  { id:"flame", name:"噴火槍", attr:"火", damage:80, range:460, rate:4.00, mode:"flame", color:"#ff5c2d", desc:"1.5秒持續噴灑，擅長壓制小怪群。" },
  { id:"grenade", name:"榴彈", attr:"火", damage:275, range:700, rate:0.55, mode:"grenade", color:"#ff9b35", splash:52, desc:"拋物線爆炸，穩定清理密集小怪。" },
  { id:"cryo", name:"急凍狙擊", attr:"冰", damage:345, range:900, rate:0.45, mode:"cryo", color:"#67c5ff", pierce:2, desc:"高傷穿透單發，專門點殺菁英與 BOSS。" },
  { id:"frostbomb", name:"冰晶炸彈", attr:"冰", damage:245, range:720, rate:0.45, mode:"frostbomb", color:"#9fe7ff", splash:56, freeze:0.32, desc:"指定地點爆炸並減速，重點是群體減壓。" },
  { id:"laser", name:"雷射光線", attr:"電", damage:98, range:860, rate:3.40, mode:"laser", color:"#ffe066", lockTime:3.0, desc:"持續鎖定高血量目標，對菁英與 BOSS 強。" },
  { id:"chain", name:"閃電鎖鏈", attr:"電", damage:118, range:760, rate:0.80, mode:"chain", color:"#b67cff", chains:4, desc:"瞬間連鎖多目標，清群穩定但打王較弱。" },
  { id:"gas", name:"毒氣彈", attr:"毒", damage:118, range:740, rate:0.42, mode:"gas", color:"#55d65a", splash:46, zoneTime:2.7, desc:"定點毒霧，以持續範圍傷害封鎖路線。" },
  { id:"needle", name:"毒針彈", attr:"毒", damage:300, range:700, rate:0.75, mode:"needle", color:"#41d08a", splash:30, desc:"中高單體傷害兼小範圍爆裂，偏菁英戰。" },
  { id:"blade", name:"旋刃", attr:"無", damage:245, range:680, rate:0.78, mode:"blade", color:"#d5dde8", splash:26, desc:"高頻泛用輸出，不依賴屬性相剋。" },
  { id:"trap", name:"陷阱", attr:"無", damage:130, range:700, rate:0.44, mode:"trap", color:"#9aa3b6", splash:54, desc:"定點控場與聚怪，輸出不是主要價值。" },
];

const POISON_SOURCE_UPGRADES = ["神經毒素", "腐蝕毒霧", "毒爆榴彈", "毒刃穿刺", "毒化陷阱"];

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
  "氣爆燃燒": "凝固汽油彈",
  "牽引爆震": "戰術封鎖",
  "冰痕狙擊": "冰痕",
  "折射聚焦": { all:["折射光束", "過載聚焦"] },
  "麻痺導流": "過載聚焦",
  "劇毒烈焰": "燃料附著",
  "麻痺毒針": { all:["電磁殘留"], any:POISON_SOURCE_UPGRADES, anyLabel:"任一中毒來源" },
  "電刃麻痺": { all:["電磁殘留", "迴旋飛刃"] },
  "燃燒陷阱": "燃料附著",
  "電熱灼斷": { all:["電磁殘留", "燃料附著"] },
  "電磁榴彈": "電磁殘留",
  "冷毒穿甲": "神經毒素",
  "高壓爆點": "強力裝藥",
  "電毒傳播": { any:POISON_SOURCE_UPGRADES, anyLabel:"任一中毒來源" },
  "寒毒封鎖": "冰痕",
  "燃毒彈頭": { all:["燃料附著"], any:POISON_SOURCE_UPGRADES, anyLabel:"任一中毒來源" },
  "燃刃切割": "迴旋飛刃",
  "電磁陷阱": "電磁殘留",
  "毒焰": "腐蝕毒霧",
  "毒爆榴彈": { all:["腐蝕毒霧", "凝固汽油彈"] },
  "碎晶穿透": "碎晶爆裂",
  "導電標記": "傳導增幅",
  "電毒擴散": { any:POISON_SOURCE_UPGRADES, anyLabel:"任一中毒來源" },
  "碎毒穿刺": "極凍禁制",
  "毒刃穿刺": "迴旋飛刃",
  "毒化陷阱": "腐蝕毒霧",
};

const UPGRADE_ROWS = [
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

const WAVE_REWARD_TIERS = [
  { id:"dry", label:"低潮", weightKey:"waveRewardDryWeight", mulKey:"waveRewardDryMul" },
  { id:"low", label:"小獎", weightKey:"waveRewardLowWeight", mulKey:"waveRewardLowMul" },
  { id:"normal", label:"普通", weightKey:"waveRewardNormalWeight", mulKey:"waveRewardNormalMul" },
  { id:"profit", label:"獲利", weightKey:"waveRewardProfitWeight", mulKey:"waveRewardProfitMul" },
  { id:"hot", label:"熱波", weightKey:"waveRewardHotWeight", mulKey:"waveRewardHotMul" },
];

const BOSS_DIFFICULTY_TIERS = [
  { id:"easy", label:"容易", weightKey:"bossDiffEasyWeight", hpKey:"bossDiffEasyHpMul", atkKey:"bossDiffEasyAtkMul", speedKey:"bossDiffEasySpeedMul", marks:1 },
  { id:"normal", label:"標準", weightKey:"bossDiffNormalWeight", hpKey:"bossDiffNormalHpMul", atkKey:"bossDiffNormalAtkMul", speedKey:"bossDiffNormalSpeedMul", marks:2 },
  { id:"hard", label:"困難", weightKey:"bossDiffHardWeight", hpKey:"bossDiffHardHpMul", atkKey:"bossDiffHardAtkMul", speedKey:"bossDiffHardSpeedMul", marks:3 },
  { id:"brutal", label:"極難", weightKey:"bossDiffBrutalWeight", hpKey:"bossDiffBrutalHpMul", atkKey:"bossDiffBrutalAtkMul", speedKey:"bossDiffBrutalSpeedMul", marks:4 },
];

const WAVE = [
  [1,.42,0,0,0,0,0,0,2],[2,.60,0,0,0,0,0,0,2],[3,.95,2,1,0,0,0,0,2],[4,1.08,4,1,0,0,0,0,2],[5,1.22,6,1,0,0,1,1,2],
  [6,1.38,8,.9,.1,0,2,1,2],[7,1.55,10,.85,.15,0,3,2,2],[8,1.73,11,.8,.2,0,4,2,2],[9,1.93,12,.75,.25,0,5,2,2],[10,2.15,13,.7,.3,0,6,3,2],
  [11,2.30,14,.65,.3,.05,7,3,2],[12,2.47,15,.65,.3,.05,8,3,2],[13,2.64,16,.6,.35,.05,9,3,2],[14,2.82,17,.6,.35,.05,10,4,2],[15,3.00,18,.55,.4,.05,11,4,2],
  [16,3.08,19,.5,.4,.1,12,4,2],[17,3.16,20,.5,.4,.1,13,4,2],[18,3.24,21,.45,.45,.1,14,5,2],[19,3.32,22,.45,.45,.1,15,5,2],[20,3.40,24,.45,.45,.1,16,5,2],
  [21,3.40,25,.4,.45,.15,17,5,2],[22,3.42,26,.4,.44,.16,18,6,2],[23,3.44,27,.4,.43,.17,19,6,2],[24,3.46,28,.4,.42,.18,20,6,2],[25,3.48,29,.4,.41,.19,21,6,2],
  [26,3.50,30,.3,.45,.25,22,7,2],[27,3.52,31,.3,.44,.26,23,7,2],[28,3.54,32,.3,.43,.27,24,7,2],[29,3.56,33,.3,.42,.28,25,7,2],[30,3.58,35,.3,.41,.29,26,8,2],
].map(r => ({ wave:r[0], hpMul:r[1], eliteWeight:r[2], e1:r[3], e2:r[4], e3:r[5], bossBase:r[6], bossInc:r[7], bossCd:r[8] }));

const BANDS = [
  { from:1, to:2, count:[16,24], drop:{normal:.63,fast:.36,tank:.9,ranged:.45,special:.45}, templates:{standard:700,fast:300} },
  { from:3, to:5, count:[20,30], drop:{normal:.585,fast:.315,tank:.9,ranged:.405,special:.405}, templates:{standard:400,tank:250,ranged:200,disrupt:150} },
  { from:6, to:10, count:[28,40], drop:{normal:.44,fast:.24,tank:.8,ranged:.32,special:.32}, templates:{standard:250,fast:200,tank:200,ranged:150,disrupt:200} },
  { from:11, to:20, count:[34,50], drop:{normal:.50,fast:.24,tank:1,ranged:.34,special:.34}, templates:{standard:200,fast:150,tank:200,ranged:150,disrupt:150,mixed:150} },
  { from:21, to:30, count:[42,62], drop:{normal:.46,fast:.19,tank:1,ranged:.30,special:.30}, templates:{standard:100,fast:150,tank:200,ranged:150,disrupt:150,mixed:250} },
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
const TOWER_ROLE = {
  flame:"area", grenade:"area", cryo:"single", frostbomb:"control", laser:"single",
  chain:"area", gas:"area", needle:"single", blade:"general", trap:"control",
};
const ATTRIBUTE_KEYS = ["fire", "ice", "electric", "poison", "neutral"];
const ATTRIBUTE_DISPLAY = {
  fire:{ label:"火", color:"#ff6b3d" },
  ice:{ label:"冰", color:"#72d4ff" },
  electric:{ label:"電", color:"#d89cff" },
  poison:{ label:"毒", color:"#66d86f" },
  neutral:{ label:"無", color:"#d5dde8" },
};
const WAVE_ATTRIBUTE_CYCLE = ["fire", "ice", "electric", "poison", "neutral"];
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
const WALLET_STORAGE_KEY = "towerDefenseWallet.v1";
const PARAM_CHANNEL = "tower-defense-param-sync";
const TOWER_PARAM_IDS = ["flame","grenade","cryo","frostbomb","laser","chain","gas","needle","blade","trap"];
const TOWER_BASE_PARAMS = {
  flame: { damage:80, rate:4.00, range:460, splash:0, duration:1.5, cooldown:2.4, tick:0.5, minionMul:1.40, eliteMul:.85, bossMul:.95 },
  grenade: { damage:275, rate:.55, range:700, splash:52, duration:0, cooldown:0, tick:.5, minionMul:1.40, eliteMul:.85, bossMul:.58 },
  cryo: { damage:345, rate:.45, range:900, splash:0, duration:0, cooldown:0, tick:.5, minionMul:.56, eliteMul:1.25, bossMul:1.10 },
  frostbomb: { damage:245, rate:.45, range:720, splash:56, duration:0, cooldown:0, tick:.5, minionMul:1.40, eliteMul:.80, bossMul:.82 },
  laser: { damage:98, rate:3.40, range:860, splash:0, duration:3.0, cooldown:3.0, tick:.5, minionMul:.62, eliteMul:1.25, bossMul:1.25 },
  chain: { damage:118, rate:.80, range:760, splash:0, duration:0, cooldown:0, tick:.5, minionMul:1.40, eliteMul:.80, bossMul:.90 },
  gas: { damage:118, rate:.42, range:740, splash:46, duration:2.7, cooldown:0, tick:.5, minionMul:1.40, eliteMul:.90, bossMul:.75 },
  needle: { damage:300, rate:.75, range:700, splash:30, duration:0, cooldown:0, tick:.5, minionMul:1.05, eliteMul:1.20, bossMul:1.40 },
  blade: { damage:245, rate:.78, range:680, splash:26, duration:0, cooldown:0, tick:.5, minionMul:.90, eliteMul:1.00, bossMul:.75 },
  trap: { damage:130, rate:.44, range:700, splash:54, duration:1.5, cooldown:0, tick:.5, minionMul:1.15, eliteMul:.78, bossMul:.95 },
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
    [{ key:"conditionalExplosionPct", value:50 }, { key:"conditionalExplosionRadius", value:46 }],
    [{ key:"conditionalStunTime", value:.2 }],
    [{ key:"poisonTargetDamagePct", value:20 }],
  ],
  grenade: [
    [{ key:"damagePct", value:35 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"extraAreas", value:1 }],
    [{ key:"ratePct", value:20 }],
    [{ key:"burnAreaDps", value:30 }, { key:"burnAreaTime", value:2 }],
    [{ key:"dotDamagePct", value:100 }],
    [{ key:"burnDurationPct", value:50 }],
    [{ key:"pullStrengthPct", value:35 }],
    [{ key:"zoneStunTime", value:.3 }, { key:"zoneTime", value:2 }],
    [{ key:"zonePoisonDps", value:25 }, { key:"zonePoisonTime", value:2 }],
  ],
  cryo: [
    [{ key:"damagePct", value:35 }],
    [{ key:"ratePct", value:25 }],
    [{ key:"extraProjectiles", value:1 }],
    [{ key:"extraPierce", value:1 }],
    [{ key:"slowPct", value:25 }, { key:"slowTime", value:2 }],
    [{ key:"slowDurationPct", value:50 }],
    [{ key:"freezeTime", value:1 }],
    [{ key:"trailSlowPct", value:25 }, { key:"trailTime", value:1 }],
    [{ key:"poisonTargetDamagePct", value:20 }],
    [{ key:"shardCount", value:2 }, { key:"shardDamagePct", value:40 }],
  ],
  frostbomb: [
    [{ key:"damagePct", value:30 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"ratePct", value:20 }],
    [{ key:"extraShots", value:1 }],
    [{ key:"iceTrailSlowPct", value:15 }, { key:"iceTrailTime", value:2 }],
    [{ key:"iceTrailDurationPct", value:50 }],
    [{ key:"iceTrailSlowBonusPct", value:15 }],
    [{ key:"freezeDurationPct", value:50 }],
    [{ key:"shardCount", value:3 }, { key:"shardDamagePct", value:30 }],
    [{ key:"postFreezeSlowPct", value:20 }, { key:"postFreezeSlowTime", value:1 }],
  ],
  laser: [
    [{ key:"damagePct", value:30 }],
    [{ key:"ratePct", value:25 }],
    [{ key:"durationPct", value:50 }],
    [{ key:"refractDamagePct", value:55 }],
    [{ key:"focusDelay", value:1 }, { key:"focusDamagePct", value:20 }],
    [{ key:"focusDamageBonusPct", value:50 }],
    [{ key:"focusDelayReducePct", value:50 }],
    [{ key:"refractFocusPct", value:100 }],
    [{ key:"focusedBurstDamagePct", value:50 }, { key:"focusedBurstRadius", value:42 }],
    [{ key:"electricVulnerablePct", value:20 }, { key:"electricVulnerableTime", value:2 }],
  ],
  chain: [
    [{ key:"damagePct", value:35 }],
    [{ key:"extraChainCasts", value:1 }],
    [{ key:"extraChains", value:3 }],
    [{ key:"pathDamage", value:50 }],
    [{ key:"stunTime", value:.3 }],
    [{ key:"stunDurationPct", value:50 }],
    [{ key:"pathDamagePct", value:100 }],
    [{ key:"focusConduit", value:1 }],
    [{ key:"poisonBurstDamagePct", value:50 }, { key:"poisonBurstRadius", value:40 }],
    [{ key:"poisonChainDamagePct", value:50 }],
  ],
  gas: [
    [{ key:"damagePct", value:35 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"ratePct", value:20 }],
    [{ key:"extraShots", value:1 }],
    [{ key:"vulnerablePct", value:15 }],
    [{ key:"vulnerableBonusPct", value:50 }],
    [{ key:"zoneDurationPct", value:50 }],
    [{ key:"burningTargetDamagePct", value:100 }],
    [{ key:"zoneSlowPct", value:10 }],
    [],
  ],
  needle: [
    [{ key:"damagePct", value:30 }],
    [{ key:"ratePct", value:25 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"extraShots", value:1 }],
    [{ key:"poisonTick", value:.5 }, { key:"poisonDps", value:25 }, { key:"poisonTime", value:2 }],
    [{ key:"dotDamagePct", value:100 }],
    [{ key:"poisonDurationPct", value:50 }],
    [{ key:"conditionalStunTime", value:.2 }],
    [{ key:"burnDps", value:18 }, { key:"burnTime", value:2 }],
    [{ key:"frozenTargetDamagePct", value:30 }],
  ],
  blade: [
    [{ key:"damagePct", value:40 }],
    [{ key:"ratePct", value:25 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"extraShots", value:1 }],
    [{ key:"ricochetChancePct", value:45 }, { key:"ricochetDamagePct", value:50 }],
    [{ key:"ricochetDamageBonusPct", value:100 }],
    [{ key:"ricochetExtra", value:1 }],
    [{ key:"conditionalStunTime", value:.2 }],
    [{ key:"burnDps", value:18 }, { key:"burnTime", value:1 }],
    [{ key:"poisonDps", value:25 }, { key:"poisonTime", value:1 }],
  ],
  trap: [
    [{ key:"damagePct", value:30 }],
    [{ key:"rangePct", value:25 }],
    [{ key:"ratePct", value:20 }],
    [{ key:"extraShots", value:1 }],
    [{ key:"rootTime", value:.5 }],
    [{ key:"rootDurationPct", value:50 }],
    [{ key:"pullStrengthPct", value:75 }],
    [{ key:"burnAreaDps", value:30 }, { key:"burnAreaTime", value:2 }],
    [{ key:"zoneStunTime", value:.3 }, { key:"zoneTime", value:2 }],
    [{ key:"zonePoisonDps", value:25 }, { key:"zonePoisonTime", value:2 }],
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
  balanceRevision: 8,
  bossLowWeight: 55,
  bossMidWeight: 38,
  bossHighWeight: 7,
  bossLowMin: 1.0,
  bossLowMax: 1.6,
  bossMidMin: 1.8,
  bossMidMax: 3.0,
  bossHighMin: 4.0,
  bossHighMax: 8.0,
  bossFirstMinWave: 3,
  bossFirstChance: 28,
  bossFirstChanceInc: 32,
  bossFirstGuaranteeWave: 5,
  bossFirstRewardMul: 1.0,
  bossChanceMul: 1.0,
  bossChanceCap: 70,
  minionHpMul: 1.0,
  minionAtkMul: .82,
  minionSpeedMul: .90,
  eliteHpMul: 1.05,
  eliteAtkMul: 1.05,
  bossFirstHpMul: 1.10,
  bossHpMul: .52,
  bossAtkMul: 1.0,
  bossSpeedMul: 1.0,
  moneyMul: 1.15,
  deepMoneyBase: 1.35,
  deepMoneyRamp: .04,
  deepMoneyCap: 1.80,
  waveRewardDryWeight: 30,
  waveRewardDryMul: .105,
  waveRewardLowWeight: 32,
  waveRewardLowMul: .24,
  waveRewardNormalWeight: 25,
  waveRewardNormalMul: .48,
  waveRewardProfitWeight: 10,
  waveRewardProfitMul: 1.35,
  waveRewardHotWeight: 3,
  waveRewardHotMul: 2.45,
  bossDiffEasyWeight: 25,
  bossDiffEasyHpMul: .80,
  bossDiffEasyAtkMul: .90,
  bossDiffEasySpeedMul: .97,
  bossDiffNormalWeight: 45,
  bossDiffNormalHpMul: 1.25,
  bossDiffNormalAtkMul: 1.05,
  bossDiffNormalSpeedMul: 1.0,
  bossDiffHardWeight: 23,
  bossDiffHardHpMul: 1.75,
  bossDiffHardAtkMul: 1.25,
  bossDiffHardSpeedMul: 1.04,
  bossDiffBrutalWeight: 7,
  bossDiffBrutalHpMul: 2.40,
  bossDiffBrutalAtkMul: 1.45,
  bossDiffBrutalSpeedMul: 1.08,
  spawnInterval: .26,
  waveAttrBiasEarly: 0.72,
  waveAttrBias: 0.58,
  eliteMoneyMul: 1.0,
  dropChanceMul: 1.0,
  expMul: 1.0,
  towerDamageMul: 1.0,
  bossBetStepMul: 1.5,
  betMidMul: 1.35,
  betDeepMul: 1.85,
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
  next.bossFirstMinWave = Math.max(1, Math.round(next.bossFirstMinWave));
  next.bossFirstGuaranteeWave = Math.max(next.bossFirstMinWave, Math.round(next.bossFirstGuaranteeWave));
  next.bossFirstChance = Math.max(0, Math.min(100, next.bossFirstChance));
  next.bossFirstChanceInc = Math.max(0, Math.min(100, next.bossFirstChanceInc));
  next.bossFirstRewardMul = Math.max(0, next.bossFirstRewardMul);
  next.bossChanceCap = Math.max(0, Math.min(100, next.bossChanceCap));
  next.deepMoneyBase = Math.max(0, next.deepMoneyBase);
  next.deepMoneyRamp = Math.max(0, next.deepMoneyRamp);
  next.deepMoneyCap = Math.max(next.deepMoneyBase, next.deepMoneyCap);
  WAVE_REWARD_TIERS.forEach(tier => {
    next[tier.weightKey] = Math.max(0, next[tier.weightKey]);
    next[tier.mulKey] = Math.max(0, next[tier.mulKey]);
  });
  BOSS_DIFFICULTY_TIERS.forEach(tier => {
    next[tier.weightKey] = Math.max(0, next[tier.weightKey]);
    next[tier.hpKey] = Math.max(.1, next[tier.hpKey]);
    next[tier.atkKey] = Math.max(.1, next[tier.atkKey]);
    next[tier.speedKey] = Math.max(.1, next[tier.speedKey]);
  });
  next.spawnInterval = Math.max(.08, Math.min(2, next.spawnInterval));
  next.baseHp = Math.max(1, Math.round(next.baseHp));
  if (next.tower_gas_duration <= 0) next.tower_gas_duration = DEFAULT_PARAMS.tower_gas_duration;
  if (next.tower_trap_duration <= 0) next.tower_trap_duration = DEFAULT_PARAMS.tower_trap_duration;
  if (next.tower_gas_tick <= 0) next.tower_gas_tick = DEFAULT_PARAMS.tower_gas_tick;
  if (next.tower_trap_tick <= 0) next.tower_trap_tick = DEFAULT_PARAMS.tower_trap_tick;
  return next;
}

function loadParams() {
  try {
    const stored = JSON.parse(localStorage.getItem(PARAM_STORAGE_KEY) || "{}");
    return cleanParams(migrateBossParams(stored));
  } catch {
    return cleanParams();
  }
}

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
    next.balanceRevision = 1;
  }
  if ((Number(input.balanceRevision) || 0) < 2) return { ...DEFAULT_PARAMS, balanceRevision:8 };
  if ((Number(input.balanceRevision) || 0) < 3) {
    next.wave_1_hpMul = DEFAULT_PARAMS.wave_1_hpMul;
    next.wave_2_hpMul = DEFAULT_PARAMS.wave_2_hpMul;
    next.balanceRevision = 3;
  }
  if ((Number(input.balanceRevision) || 0) < 4) return { ...DEFAULT_PARAMS, balanceRevision:8 };
  if ((Number(input.balanceRevision) || 0) < 5) next.balanceRevision = 5;
  if ((Number(input.balanceRevision) || 0) < 6) {
    ["moneyMul", "deepMoneyBase", "deepMoneyRamp", "deepMoneyCap", "spawnInterval", "betMidMul", "tower_cryo_minionMul", "tower_laser_minionMul"]
      .forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 6;
  }
  if ((Number(input.balanceRevision) || 0) < 7) next.balanceRevision = 7;
  if ((Number(input.balanceRevision) || 0) < 8) {
    [
      ...WAVE_REWARD_TIERS.flatMap(tier => [tier.weightKey, tier.mulKey]),
      ...BOSS_DIFFICULTY_TIERS.flatMap(tier => [tier.weightKey, tier.hpKey, tier.atkKey, tier.speedKey]),
      "deepMoneyBase", "deepMoneyRamp", "deepMoneyCap", "bossHpMul"
    ].forEach(key => { next[key] = DEFAULT_PARAMS[key]; });
    next.balanceRevision = 8;
  }
  return next;
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
  stopChannelAudio();
  const wallet = state && Number.isFinite(state.wallet) ? state.wallet : loadWallet();
  state = {
    wallet, baseBetIndex: 3, started: false, over: false, wave: 0, hp: params.baseHp, pot: 0, exp: 0, level: 1,
    towers: [], monsters: [], projectiles: [], effects: [], zones: [], choicesOpen: false, waveActive: false, upgradeRepeatLocks: {},
    spawn: null, waveReward: null, bossWeight: 0, bossCd: 0, bossRolled: 0, bossAdd: 0, bossSeen: 0, bossRoll: null, nextBoss: false, nextBossWave: 0, selectedTemplate: "standard", currentWaveAttr: "neutral",
  };
  hideChoices();
  hideResult();
  updateUi();
}

function loadWallet() {
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY);
    if (raw === null || raw === "") return 10000;
    const saved = Number(raw);
    if (Number.isFinite(saved) && saved >= 0) return Math.floor(saved);
  } catch {}
  return 10000;
}

function persistWallet() {
  try { localStorage.setItem(WALLET_STORAGE_KEY, String(Math.max(0, Math.floor(state.wallet)))); } catch {}
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
function wavePrimaryAttribute(wave) {
  if (wave <= 2) return "neutral";
  return WAVE_ATTRIBUTE_CYCLE[(wave - 3) % WAVE_ATTRIBUTE_CYCLE.length];
}
function waveAttributeBias(wave) {
  return clamp(paramNumber(wave <= 2 ? "waveAttrBiasEarly" : "waveAttrBias", wave <= 2 ? .72 : .58), 0, 1);
}
function pickWaveMonster(templateId) { return pickWeighted(tunedTemplate(templateId)); }
function pickWaveAttribute(primaryAttr, wave, force=false) {
  return force || Math.random() < waveAttributeBias(wave) ? primaryAttr : null;
}
function applyWaveAttributeBias(attrMultipliers, primaryAttr) {
  if (!primaryAttr || !ATTRIBUTE_KEYS.includes(primaryAttr)) return attrMultipliers;
  const weakAttr = ATTRIBUTE_KEYS.reduce((best, attr) => attrMultipliers[attr] > attrMultipliers[best] ? attr : best, ATTRIBUTE_KEYS[0]);
  if (weakAttr === primaryAttr) return attrMultipliers;
  const result = { ...attrMultipliers };
  [result[weakAttr], result[primaryAttr]] = [result[primaryAttr], result[weakAttr]];
  return result;
}
function currentBet() {
  return betForWave(state.wave + 1);
}
function betForWave(wave) {
  const base = BET_STEPS[state.baseBetIndex];
  const depthMul = wave >= 21 ? params.betDeepMul : wave >= 11 ? params.betMidMul : 1;
  const bossStep = Math.max(1, params.bossBetStepMul);
  const bossMul = 1 + state.bossSeen * (bossStep - 1);
  return Math.round(base * depthMul * bossMul);
}
function payout() { return Math.floor(state.pot * (1 + state.bossAdd)); }

function pickParamTier(tiers) {
  const weights = Object.fromEntries(tiers.map(tier => [tier.id, Math.max(0, paramNumber(tier.weightKey, 0))]));
  if (!Object.values(weights).some(weight => weight > 0)) return tiers[0];
  const id = pickWeighted(weights);
  return tiers.find(tier => tier.id === id) || tiers[0];
}

function waveRewardDepthMul(wave) {
  if (wave < 11) return 1;
  return Math.min(params.deepMoneyCap, params.deepMoneyBase + (wave - 11) * params.deepMoneyRamp);
}

function rollWaveReward(wave, bet) {
  const tier = pickParamTier(WAVE_REWARD_TIERS);
  const multiplier = Math.max(0, paramNumber(tier.mulKey, 0));
  const budget = Math.max(0, Math.round(bet * multiplier * params.moneyMul * waveRewardDepthMul(wave)));
  return { id:tier.id, label:tier.label, multiplier, budget, remaining:budget, weightRemaining:0 };
}

function rollBossDifficulty() {
  const tier = pickParamTier(BOSS_DIFFICULTY_TIERS);
  return {
    id:tier.id,
    label:tier.label,
    marks:tier.marks,
    hpMul:paramNumber(tier.hpKey, 1),
    atkMul:paramNumber(tier.atkKey, 1),
    speedMul:paramNumber(tier.speedKey, 1),
  };
}

function normalRewardWeight(kind, band) {
  const base = MONSTERS[kind];
  const min = paramNumber(`monster_${kind}_moneyMin`, base.money[0]);
  const max = paramNumber(`monster_${kind}_moneyMax`, base.money[1]);
  const drop = clamp((band.drop[kind] || 0) * params.dropChanceMul, 0, 1);
  return Math.max(.01, ((min + max) / 2) * drop);
}

function eliteRewardWeight(index) {
  const base = ELITES[index];
  const tuneId = `elite_${index + 1}`;
  const min = paramNumber(`monster_${tuneId}_moneyMin`, base.money[0]);
  const max = paramNumber(`monster_${tuneId}_moneyMax`, base.money[1]);
  return Math.max(.01, ((min + max) / 2) * params.eliteMoneyMul);
}

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
  if (state.bossRolled <= 0) {
    const firstWave = params.bossFirstMinWave;
    if (wave < firstWave) return false;
    const guaranteeWave = Math.max(firstWave, params.bossFirstGuaranteeWave);
    const chance = wave >= guaranteeWave
      ? 100
      : Math.min(100, params.bossFirstChance + Math.max(0, wave - firstWave) * params.bossFirstChanceInc);
    const ok = Math.random() * 100 < chance;
    if (ok) {
      state.bossRolled += 1;
      state.bossWeight = 0;
      state.bossCd = info.bossCd;
    }
    return ok;
  }
  if (state.bossCd > 0) {
    if (state.bossCd > 0) state.bossCd -= 1;
    return false;
  }
  state.bossWeight += info.bossBase + info.bossInc;
  const ok = Math.random() * 100 < Math.min(params.bossChanceCap, state.bossWeight * params.bossChanceMul);
  if (ok) {
    state.bossRolled += 1;
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
    const towerDef = choice.towerId ? TOWERS.find(tower => tower.id === choice.towerId) : null;
    const attrKey = choice.attrKey || (towerDef ? towerAttr(towerDef) : "neutral");
    const icon = towerDef ? towerIconDataUrl(towerDef) : "";
    btn.className = `choice-card rarity-${rarity} attr-${attrKey}`;
    btn.type = "button";
    btn.style.setProperty("--choice-color", (ATTRIBUTE_DISPLAY[attrKey] || ATTRIBUTE_DISPLAY.neutral).color);
    const iconHtml = icon ? `<span class="choice-emblem"><img src="${icon}" alt=""></span>` : "";
    btn.innerHTML = `${iconHtml}<span class="choice-copy"><span class="choice-top"><span class="choice-name">${choice.title}</span><span class="rarity-badge">${choice.rarityLabel || rarityLabel(rarity)}</span></span><span class="choice-sub">${choice.tag || ""}</span><span class="choice-desc">${choice.desc}</span></span>`;
    btn.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      if (btn.disabled) return;
      btn.disabled = true;
      playSfx("upgrade");
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
  playSfx("bet");
  if (!state.started) {
    state.wallet -= bet;
    persistWallet();
    showStartingTowerDraft();
    return;
  }
  state.wallet -= bet;
  persistWallet();
  startWave();
}

function showStartingTowerDraft() {
  const singlePool = TOWERS.filter(t => TOWER_ROLE[t.id] === "single");
  const areaPool = TOWERS.filter(t => ["flame", "grenade", "frostbomb", "chain", "gas"].includes(t.id));
  const drafted = [pick(singlePool), pick(areaPool)];
  const remaining = TOWERS.filter(t => !drafted.includes(t));
  drafted.push(pick(remaining));
  for (let i = drafted.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [drafted[i], drafted[j]] = [drafted[j], drafted[i]];
  }
  const choices = drafted.map(t => towerChoice(t, () => {
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
  const ownedRoles = new Set(state.towers.map(t => TOWER_ROLE[t.id]));
  const picks = [];
  while (picks.length < n && picks.length < pool.length) {
    const available = pool.filter(t => !picks.includes(t));
    const weighted = available.map(t => {
      const role = TOWER_ROLE[t.id];
      const weight = role === "single" && !ownedRoles.has("single") ? 1.45
        : role === "area" && !ownedRoles.has("area") ? 1.45
        : role === "control" && !ownedRoles.has("control") ? 1.15
        : role === "general" ? 1.05 : 1;
      return { t, weight };
    });
    let roll = Math.random() * weighted.reduce((sum, item) => sum + item.weight, 0);
    let chosen = weighted[weighted.length - 1].t;
    for (const item of weighted) {
      roll -= item.weight;
      if (roll <= 0) { chosen = item.t; break; }
    }
    picks.push(chosen);
  }
  return picks;
}

function towerChoice(t, onPick) {
  const damage = towerParam(t, "damage", t.damage);
  const range = towerParam(t, "range", t.range);
  const rate = towerParam(t, "rate", t.rate);
  return { title: t.name, tag: `${t.attr}屬性｜${towerRoleLabel(t)}`, towerId:t.id, attrKey:towerAttr(t), rarity:"newTower", desc: `傷害 ${damage}｜射程 ${range}｜攻速 ${rate}/秒。${t.desc}`, onPick };
}

function towerRoleLabel(t) {
  return {
    flame:"近距群攻", grenade:"範圍爆發", cryo:"單體點殺", frostbomb:"群體控場", laser:"持續單體",
    chain:"連鎖群攻", gas:"範圍持續", needle:"毒傷點殺", blade:"泛用輸出", trap:"定點輔助"
  }[t.id] || "戰術砲台";
}

const towerIconCache = new Map();
function towerIconDataUrl(tower) {
  if (!tower) return "";
  if (towerIconCache.has(tower.id)) return towerIconCache.get(tower.id);
  const iconCanvas = document.createElement("canvas");
  iconCanvas.width = 96;
  iconCanvas.height = 96;
  if (typeof iconCanvas.toDataURL !== "function") return "";
  const g = iconCanvas.getContext("2d");
  const attr = towerAttr(tower);
  const color = (ATTRIBUTE_DISPLAY[attr] || ATTRIBUTE_DISPLAY.neutral).color;
  const bg = g.createRadialGradient(40, 32, 4, 48, 48, 48);
  bg.addColorStop(0, "#353941");
  bg.addColorStop(1, "#0a0c10");
  g.fillStyle = bg;
  g.fillRect(0, 0, 96, 96);
  g.strokeStyle = color;
  g.lineWidth = 4;
  g.beginPath();
  g.arc(48, 48, 38, 0, Math.PI * 2);
  g.stroke();
  g.globalAlpha = .22;
  g.fillStyle = color;
  g.beginPath();
  g.arc(48, 48, 33, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  drawTowerGlyph(g, tower.id, color);
  const url = iconCanvas.toDataURL("image/png");
  towerIconCache.set(tower.id, url);
  return url;
}

function drawTowerGlyph(g, id, color) {
  g.save();
  g.translate(48, 48);
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = 6;
  g.lineCap = "round";
  g.lineJoin = "round";
  if (id === "flame") {
    g.beginPath(); g.moveTo(-18,18); g.bezierCurveTo(-30,-2,-9,-24,0,-30); g.bezierCurveTo(4,-13,25,-10,16,-28); g.bezierCurveTo(34,-3,20,25,-2,29); g.bezierCurveTo(-1,15,-8,5,-18,18); g.fill();
  } else if (id === "grenade") {
    g.beginPath(); g.arc(0,7,21,0,Math.PI*2); g.fill(); g.fillRect(-9,-24,18,12); g.beginPath(); g.arc(13,-18,10,Math.PI,Math.PI*1.8); g.stroke();
  } else if (id === "cryo") {
    g.beginPath(); g.arc(0,0,20,0,Math.PI*2); g.stroke(); g.beginPath(); g.moveTo(-31,0); g.lineTo(31,0); g.moveTo(0,-31); g.lineTo(0,31); g.stroke(); g.beginPath(); g.arc(0,0,5,0,Math.PI*2); g.fill();
  } else if (id === "frostbomb") {
    for (let i=0;i<3;i++) { g.rotate(Math.PI/3); g.beginPath(); g.moveTo(-29,0); g.lineTo(29,0); g.moveTo(18,0); g.lineTo(10,-8); g.moveTo(18,0); g.lineTo(10,8); g.stroke(); }
  } else if (id === "laser") {
    g.beginPath(); g.moveTo(-28,18); g.lineTo(-6,-18); g.lineTo(8,1); g.lineTo(29,-22); g.stroke(); g.beginPath(); g.arc(-22,22,7,0,Math.PI*2); g.fill();
  } else if (id === "chain") {
    g.beginPath(); g.moveTo(8,-32); g.lineTo(-22,5); g.lineTo(-4,3); g.lineTo(-13,32); g.lineTo(24,-12); g.lineTo(5,-9); g.closePath(); g.fill();
  } else if (id === "gas") {
    [[-15,5,15],[2,-10,18],[18,9,14],[-1,18,17]].forEach(([x,y,r])=>{ g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fill(); });
  } else if (id === "needle") {
    g.rotate(-.65); g.fillRect(-30,-4,45,8); g.beginPath(); g.moveTo(15,-11); g.lineTo(32,0); g.lineTo(15,11); g.closePath(); g.fill(); g.fillRect(-26,-14,6,28);
  } else if (id === "blade") {
    for (let i=0;i<3;i++) { g.rotate(Math.PI*2/3); g.beginPath(); g.moveTo(0,-5); g.quadraticCurveTo(28,-22,30,-3); g.quadraticCurveTo(18,8,0,5); g.fill(); } g.fillStyle="#0b0d11"; g.beginPath(); g.arc(0,0,7,0,Math.PI*2); g.fill();
  } else {
    g.beginPath(); for (let i=0;i<6;i++) { const a=-Math.PI/2+i*Math.PI/3; const x=Math.cos(a)*28,y=Math.sin(a)*28; i?g.lineTo(x,y):g.moveTo(x,y); } g.closePath(); g.stroke(); g.beginPath(); g.moveTo(0,-18); g.lineTo(17,15); g.lineTo(-17,15); g.closePath(); g.fill();
  }
  g.restore();
}

function addTower(def) {
  if (state.towers.length >= 3) return;
  state.towers.push({
    ...JSON.parse(JSON.stringify(def)),
    slot: state.towers.length, x: TOWER_SLOTS[state.towers.length].x, y: TOWER_SLOTS[state.towers.length].y,
    cd: 0, channel: null, lock: null, upgrades: [], level: 1, extraShots: 0, extraAreas: 0, dotMul: 1, slowMul: 1, stunMul: 1,
    burnDurationMul: 1, poisonDurationMul: 1, slowDurationMul: 1, zoneDurationMul: 1, iceTrailDurationMul: 1,
    durationMul: 1, freezeDurationMul: 1, focusMul: 1, vulnerable: 0, burnArea: false, poison: false, stun: false, freeze: false,
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
  const primaryAttr = wavePrimaryAttribute(state.wave);
  state.currentWaveAttr = primaryAttr;
  const count = rand(band.count[0], band.count[1]);
  const boss = consumeBossPreview(state.wave, info);
  const elites = eliteCount(info);
  const normalQueue = Array.from({ length:count }, () => {
    const kind = pickWaveMonster(template);
    return { kind, rewardWeight:normalRewardWeight(kind, band) };
  });
  const eliteQueue = Array.from({ length:elites }, () => {
    const index = rand(0, ELITES.length - 1);
    return { index, rewardWeight:eliteRewardWeight(index) };
  });
  const reward = rollWaveReward(state.wave, betForWave(state.wave));
  reward.weightRemaining = [...normalQueue, ...eliteQueue].reduce((sum, entry) => sum + entry.rewardWeight, 0);
  state.waveReward = reward;
  state.spawn = {
    remain:normalQueue.length, normalQueue, eliteQueue, timer:0, every:params.spawnInterval,
    template, hpMul:info.hpMul, band, elites:eliteQueue.length, boss,
    bossDifficulty:boss ? rollBossDifficulty() : null, primaryAttr, wave:state.wave
  };
  state.waveActive = true;
  state.message = `戰鬥開始：${count} 隻怪${elites ? `，菁英 ${elites}` : ""}${boss ? "，Boss 接近" : ""}`;
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

function spawnMonster(kind, hpMul, band, primaryAttr, wave, rewardWeight=0) {
  const base = MONSTERS[kind];
  const lane = base.special ? rand(-68, 68) : pick([-70, -35, 0, 35, 70]) + rand(-4, 4);
  const x = FIELD.pathX + lane;
  const curve = base.special ? rand(30, 54) * pick([-1, 1]) : 0;
  state.monsters.push(makeEnemy(base, hpMul, x, curve, kind, band.drop[kind], false, false, base.special ? "sway" : "straight", kind, pickWaveAttribute(primaryAttr, wave), 0, rewardWeight));
}
function spawnElite(hpMul, primaryAttr, wave, index=rand(0, ELITES.length - 1), rewardWeight=0) {
  const base = ELITES[index];
  state.monsters.push(makeEnemy(base, hpMul, FIELD.pathX + pick([-54, -18, 18, 54]) + rand(-4, 4), 0, "elite", 1, true, false, "straight", `elite_${index + 1}`, pickWaveAttribute(primaryAttr, wave), 0, rewardWeight));
}
function spawnBoss(hpMul, primaryAttr, wave, difficulty=null) {
  const index = rand(0, BOSSES.length - 1);
  const base = BOSSES[index];
  state.monsters.push(makeEnemy(base, hpMul, FIELD.pathX, 0, "boss", 0, false, true, "straight", `boss_${index + 1}`, pickWaveAttribute(primaryAttr, wave, true), state.bossRolled, 0, difficulty));
}
function makeEnemy(base, hpMul, x, curve, kind, dropChance, elite=false, boss=false, pathType="straight", tuneId=kind, primaryAttr=null, bossOrdinal=0, rewardWeight=0, bossDifficulty=null) {
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
  const classHpMul = boss
    ? (bossOrdinal === 1 ? params.bossFirstHpMul : params.bossHpMul)
    : elite ? params.eliteHpMul : params.minionHpMul;
  const classAtkMul = boss ? params.bossAtkMul : elite ? params.eliteAtkMul : params.minionAtkMul;
  const classSpeedMul = boss ? params.bossSpeedMul : elite ? 1 : params.minionSpeedMul;
  const difficultyHpMul = boss ? (bossDifficulty?.hpMul || 1) : 1;
  const difficultyAtkMul = boss ? (bossDifficulty?.atkMul || 1) : 1;
  const difficultySpeedMul = boss ? (bossDifficulty?.speedMul || 1) : 1;
  const hp = Math.round(tunedBase.hp * hpMul * classHpMul * difficultyHpMul);
  const minionAtkMul = { normal:.25, fast:.27, tank:.28, ranged:.30, special:.33 };
  const atk = elite || boss ? Math.round(tunedBase.atk * classAtkMul * difficultyAtkMul) : Math.max(1, Math.round(tunedBase.atk * (minionAtkMul[kind] || .3) * classAtkMul));
  const minionSpeedMul = { normal:.72, fast:.76, tank:.68, ranged:.72, special:.74 };
  const speed = elite || boss ? Math.max(1, Math.round(tunedBase.speed * classSpeedMul * difficultySpeedMul)) : Math.max(1, Math.round(tunedBase.speed * (minionSpeedMul[kind] || .72) * classSpeedMul));
  const attributeDefaults = ENEMY_ATTRIBUTE_DEFAULTS[tuneId] || {};
  const baseAttrMultipliers = Object.fromEntries(ATTRIBUTE_KEYS.map(attr => [
    attr,
    paramNumber(`monster_${tuneId}_${attr}Mul`, attributeDefaults[attr] ?? 1)
  ]));
  const attrMultipliers = applyWaveAttributeBias(baseAttrMultipliers, primaryAttr);
  return { ...tunedBase, kind, elite, boss, pathType, x, y: FIELD.spawnY, sx:x, curve, hp, maxHp:hp, atk, speed, atkCd:0, stopped:false,
    tuneId, attrMultipliers, burn:0, burnTime:0, poison:0, poisonTime:0, toxicTime:0, slowTime:0, slowPct:0, stunTime:0, freezeTime:0,
    focusMarkTime:0, electricVulnerableTime:0, electricVulnerableAmount:0, vulnerable:0, vulnerableAmount:0, dropChance, rewardWeight, bossDifficulty };
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
    const entry = s.normalQueue.shift();
    spawnMonster(entry.kind, s.hpMul, s.band, s.primaryAttr, s.wave, entry.rewardWeight);
    s.remain -= 1;
    s.timer = s.every;
  }
  if (s.remain <= 0 && s.elites > 0) {
    const entry = s.eliteQueue.shift();
    spawnElite(s.hpMul, s.primaryAttr, s.wave, entry.index, entry.rewardWeight);
    s.elites -= 1;
  }
  if (s.remain <= 0 && s.elites <= 0 && s.boss) { spawnBoss(s.hpMul, s.primaryAttr, s.wave, s.bossDifficulty); s.boss = false; }
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
        if (z.slow) {
          m.slowTime = Math.max(m.slowTime, z.slow);
          m.slowPct = Math.max(m.slowPct || 0, z.slowPct || .45);
        }
        if (z.root && !z.hardControlHits.has(m)) {
          const control = zoneControls.get(m) || { root:0, rootZones:[], pull:0, pullZone:null };
          if (z.root > control.root) control.root = z.root;
          control.rootZones.push(z);
          zoneControls.set(m, control);
        }
        if (z.vulnerable) { m.vulnerable = Math.max(m.vulnerable, 1); m.vulnerableAmount = Math.max(m.vulnerableAmount || 0, z.vulnerable); }
        if (z.toxic) m.toxicTime = Math.max(m.toxicTime || 0, .2);
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
  playTowerSfx(t.mode);
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
    aimAngle: Math.atan2(primary.y - origin.y, primary.x - origin.x),
    burstTargets: new Set(),
    refractTarget: null,
    audioStop: startChannelAudio(t.mode)
  };
  t.cd = 0;
}

function updateChannel(t, dt) {
  const c = t.channel;
  c.time -= dt;
  c.tick -= dt;
  if (t.mode === "laser") {
    const visibleTargets = findTargets(t);
    const target = c.target && c.target.hp > 0 && dist(fireOrigin(), c.target) <= scaledRange(t)
      ? c.target
      : visibleTargets[0]?.m || null;
    if (target !== c.target) {
      c.lockElapsed = 0;
      c.refractTarget = null;
    }
    c.target = target;
  }
  while (c.tick <= 0 && c.time > 0) {
    const targets = findTargets(t);
    if (t.mode === "flame") {
      flame(t, targets, c);
    } else if (t.mode === "laser") {
      if (!c.target) break;
      laser(t, c.target, targets, c);
      c.lockElapsed += attackCooldown(t);
    }
    c.tick += attackCooldown(t);
  }
  if (c.time <= 0) {
    c.audioStop?.();
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
        const wasBurning = o.m.burnTime > 0;
        damageEnemy(o.m, dmg, t);
        if (wasBurning && t.conditionalExplosionPct && (o.m.flameBurstCd || 0) <= 0) {
          synergyAreaDamage(t, o.m, dmg * t.conditionalExplosionPct / 100, t.conditionalExplosionRadius || 46, o.m);
          o.m.flameBurstCd = .6;
          effect("impact", t, o.m, { radius:t.conditionalExplosionRadius || 46 });
        }
        if (wasBurning && t.conditionalStunTime) applyHardControl(o.m, "stunTime", t.conditionalStunTime);
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
  targets.forEach((o,i) => {
    damageEnemy(o.m, scaledDamage(t)*(i?0.72:1), t);
    if (t.slow) {
      o.m.slowTime = Math.max(o.m.slowTime, towerSlowTime(t));
      o.m.slowPct = Math.max(o.m.slowPct || 0, t.slow || .25);
    }
    if (t.freeze && i === 0) applyHardControl(o.m, "freezeTime", towerFreezeTime(t));
  });
  if (t.trailTime && targets[0]) addLineSlowZones(t, from, targets[0].m);
  if (t.shardCount && targets[0]) scatterShards(t, targets[0].m, targets.map(o => o.m));
  if (showEffect) effect(type, { ...from, color:t.color }, targets[0].m, { chain: targets.slice(1).map(o=>o.m) });
}
function laser(t, primary, targets, channel=null) {
  const focusDelay = (t.focusDelay || 1) * (t.focusDelayMul || 1);
  const focused = t.focus && channel && channel.lockElapsed >= focusDelay;
  const bonus = focused ? 1 + ((t.focusDamagePct || 20) / 100)*t.focusMul : 1;
  damageEnemy(primary, scaledDamage(t)*bonus, t);
  if (focused) primary.focusMarkTime = Math.max(primary.focusMarkTime || 0, 2);
  if (channel) channel.refractTarget = null;
  if (t.refract) {
    const next = targets.find(o => o.m !== primary)?.m;
    if (next) {
      const refractFocus = focused && t.refractFocusPct
        ? 1 + ((t.focusDamagePct || 20) / 100) * t.focusMul * (t.refractFocusPct / 100)
        : 1;
      damageEnemy(next, scaledDamage(t)*((t.refractDamagePct || 55) / 100)*refractFocus, t);
      if (focused && t.refractFocusPct) next.focusMarkTime = Math.max(next.focusMarkTime || 0, 2);
      if (channel) channel.refractTarget = next;
    }
  }
  if (channel && t.focusedBurstDamagePct && channel.lockElapsed >= 1 && !channel.burstTargets.has(primary)) {
    channel.burstTargets.add(primary);
    synergyAreaDamage(t, primary, scaledDamage(t) * t.focusedBurstDamagePct / 100, t.focusedBurstRadius || 42, primary);
    effect("impact", t, primary, { radius:t.focusedBurstRadius || 42 });
  }
  if (t.electricVulnerablePct) {
    primary.electricVulnerableAmount = Math.max(primary.electricVulnerableAmount || 0, t.electricVulnerablePct / 100);
    primary.electricVulnerableTime = Math.max(primary.electricVulnerableTime || 0, t.electricVulnerableTime || 2);
  }
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
    if (t.focusConduit) {
      state.monsters
        .filter(m => m.hp > 0 && (m.focusMarkTime || 0) > 0 && !hit.includes(m))
        .slice(0, t.focusConduit)
        .forEach(m => hit.push(m));
    }
    const extraCurrent = new Set();
    hit.forEach((m,i) => {
      const wasPoisoned = isPoisoned(m);
      damageEnemy(m, scaledDamage(t)*(i?0.58:1), t);
      if (t.stun) applyHardControl(m, "stunTime", towerStunTime(t));
      if (wasPoisoned && t.poisonBurstDamagePct && (m.poisonBurstCd || 0) <= 0) {
        synergyAreaDamage(t, m, scaledDamage(t) * t.poisonBurstDamagePct / 100, t.poisonBurstRadius || 40, m);
        m.poisonBurstCd = .6;
        effect("impact", t, m, { radius:t.poisonBurstRadius || 40 });
      }
      if (wasPoisoned && t.poisonChainDamagePct) {
        const extra = state.monsters
          .filter(other => other !== m && other.hp > 0 && !hit.includes(other) && !extraCurrent.has(other))
          .sort((a,b) => dist(m,a)-dist(m,b))[0];
        if (extra) {
          extraCurrent.add(extra);
          damageEnemy(extra, scaledDamage(t) * t.poisonChainDamagePct / 100, t);
          effect("chain", { x:m.x, y:m.y, color:t.color }, extra);
        }
      }
    });
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
    addZone(center.x, center.y, radius, zoneDuration(t, t.zoneTime || 2.5), scaledDamage(t), t, {
      poison:t.poison ? towerPoisonDps(t) : 0,
      slow:t.zoneSlowPct ? 1 : t.slow ? towerSlowTime(t) : 0,
      slowPct:t.zoneSlowPct ? t.zoneSlowPct / 100 : t.slow || 0,
      vulnerable:t.vulnerable || 0,
      toxic:t.toxicZone ? 1 : 0
    });
    effect("gas", t, center, { radius });
  });
}
function frostbomb(t, targets) {
  const radius = scaledSplash(t, t.splash || 62);
  areaTargetPoints(targets, 1 + (t.extraShots || 0), radius).forEach(center => {
    areaAtPoint(t, center, "frost", radius, scaledDamage(t), .5, {
      freeze:(t.freeze || .6) * (t.freezeDurationMul || 1),
      slow:.25,
      slowPct:.25,
      postFreezeSlowPct:t.postFreezeSlowPct || 0,
      postFreezeSlowTime:t.postFreezeSlowTime || 0
    });
    if (t.shardCount) scatterShards(t, center, []);
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
      if (t.conditionalStunTime) applyHardControl(m, "stunTime", t.conditionalStunTime);
      if (t.burnDps && !t.burn) applyBurn(m, t.burnDps, t.burnTime || 1, t);
      if (t.poisonDps && !t.poison) applyPoison(m, t.poisonDps, t.poisonTime || 1, t, t.poisonTick || .5);
      effect("blade", { x:primary.x, y:primary.y, color:t.color }, m, { radius: scaledSplash(t,24) });
    });
  }
  effect("blade", t, primary, { radius: scaledSplash(t,36) });
}
function trap(t, targets) {
  const radius = scaledSplash(t, t.splash || 62);
  areaTargetPoints(targets, 1 + (t.extraShots || 0), radius).forEach(center => {
    const duration = Math.max(zoneDuration(t, 1.25), t.burnAreaTime || 0, t.synergyZoneTime || 0, t.zonePoisonTime || 0);
    const controlTime = Math.max(t.root ? towerRootTime(t) : 0, t.zoneStunTime || 0);
    addZone(center.x, center.y, radius, duration, scaledDamage(t), t, {
      root:controlTime,
      pull:t.pull ? ((t.pullStrengthPct || 75) / 100)*(t.pullMul || 1) : 0,
      burn:t.burnAreaDps || 0,
      poison:t.zonePoisonDps || 0
    });
    effect("trap", t, center, { radius });
  });
}

function synergyAreaDamage(t, center, damage, radius, excluded=null) {
  state.monsters.forEach(m => {
    if (m !== excluded && m.hp > 0 && dist(m, center) <= radius) damageEnemy(m, damage, t);
  });
}

function scatterShards(t, center, excluded=[]) {
  const excludeSet = new Set(excluded);
  state.monsters
    .filter(m => m.hp > 0 && !excludeSet.has(m))
    .sort((a,b) => dist(center,a)-dist(center,b))
    .slice(0, t.shardCount || 0)
    .forEach(m => {
      damageEnemy(m, scaledDamage(t) * (t.shardDamagePct || 0) / 100, t);
      effect("spark", { x:center.x, y:center.y, color:t.color }, m, { life:.22 });
    });
}

function addLineSlowZones(t, from, to) {
  const count = 4;
  for (let i = 1; i <= count; i += 1) {
    const ratio = i / count;
    addZone(
      from.x + (to.x - from.x) * ratio,
      from.y + (to.y - from.y) * ratio,
      28,
      t.trailTime || 1,
      0,
      t,
      { slow:.3, slowPct:(t.trailSlowPct || 25) / 100 }
    );
  }
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
    const radius = scaledSplash(t, t.splash || 54);
    areaAtPoint(t, center, "grenade", radius, scaledDamage(t), .65);
    if (t.pullStrengthPct) {
      const pull = clamp(t.pullStrengthPct / 100, 0, .8);
      state.monsters.forEach(m => {
        if (dist(m, center) <= radius) {
          m.x += (center.x - m.x) * pull;
          m.y += (center.y - m.y) * pull;
        }
      });
    }
    if (t.zoneStunTime) addZone(center.x, center.y, radius, t.synergyZoneTime || 2, 0, t, { root:t.zoneStunTime });
    if (t.zonePoisonDps && t.burnArea) addZone(center.x, center.y, radius, t.zonePoisonTime || 2, 0, t, { poison:t.zonePoisonDps });
    if (t.burnArea) addZone(center.x, center.y, radius, towerBurnAreaTime(t), towerBurnAreaDps(t), t, { burn:towerBurnDps(t) });
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
    if (opts.freeze) {
      applyHardControl(m, "freezeTime", opts.freeze*t.durationMul);
      if (opts.postFreezeSlowTime) {
        m.postFreezeSlowTime = Math.max(m.postFreezeSlowTime || 0, opts.postFreezeSlowTime);
        m.postFreezeSlowPct = Math.max(m.postFreezeSlowPct || 0, (opts.postFreezeSlowPct || 0) / 100);
      }
    }
    if (opts.slow) {
      m.slowTime = Math.max(m.slowTime, opts.slow*t.slowMul);
      m.slowPct = Math.max(m.slowPct || 0, opts.slowPct || .45);
    }
    if (opts.poison) applyPoison(m, opts.poison, towerPoisonTime(t), t, t.poisonTick || .5);
  });
  effect(type, t, center, { radius });
}

function addZone(x,y,radius,time,damage,tower,extra={}) {
  const tick = Math.max(0.05, extra.tick || zoneTick(tower));
  state.zones.push({
    x,y,radius,time,maxTime:time,damage,tower,tick,tickTimer:0,
    visualSeed:Math.random() * Math.PI * 2,
    hardControlHits:new Set(),...extra
  });
}
function applyHardControl(m, key, time) {
  if (m.boss) return;
  const duration = Math.min(time, m.elite ? 0.18 : 0.28);
  m[key] = Math.max(m[key], duration);
}
function damageEnemy(m, amount, t) {
  const wasPoisoned = isPoisoned(m);
  const dealt = resolveDamage(m, amount, t);
  if (t.burn) applyBurn(m, towerBurnDps(t), towerBurnTime(t), t);
  if (t.poison) applyPoison(m, towerPoisonDps(t), towerPoisonTime(t), t, t.poisonTick || .5);
  if (t.id === "needle" && wasPoisoned && t.conditionalStunTime) applyHardControl(m, "stunTime", t.conditionalStunTime);
  if (t.id === "needle" && wasPoisoned && t.burnDps && !t.burn) applyBurn(m, t.burnDps, t.burnTime || 2, t);
  return dealt;
}
function isPoisoned(m) { return (m.poisonTime || 0) > 0 || (m.toxicTime || 0) > 0; }
function resolveDamage(m, amount, t) {
  const vuln = m.vulnerable > 0 ? 1 + (m.vulnerableAmount || 0) : 1;
  const attrMul = attributeMultiplier(t, m);
  const classMul = targetClassMultiplier(t, m);
  let conditionalMul = 1;
  if (t.poisonTargetDamagePct && isPoisoned(m)) conditionalMul *= 1 + t.poisonTargetDamagePct / 100;
  if (t.frozenTargetDamagePct && m.freezeTime > 0) conditionalMul *= 1 + t.frozenTargetDamagePct / 100;
  if (t.burningTargetDamagePct && m.burnTime > 0) conditionalMul *= 1 + t.burningTargetDamagePct / 100;
  if (towerAttr(t) === "electric" && m.electricVulnerableTime > 0) conditionalMul *= 1 + (m.electricVulnerableAmount || 0);
  const dealt = amount * vuln * attrMul * classMul * conditionalMul;
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
    if (m.focusMarkTime > 0) m.focusMarkTime -= dt;
    if (m.electricVulnerableTime > 0) m.electricVulnerableTime -= dt;
    else m.electricVulnerableAmount = 0;
    if (m.flameBurstCd > 0) m.flameBurstCd -= dt;
    if (m.poisonBurstCd > 0) m.poisonBurstCd -= dt;
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
    if (m.toxicTime > 0) m.toxicTime -= dt;
    if (m.vulnerable > 0) m.vulnerable -= dt;
    else m.vulnerableAmount = 0;
    if (m.freezeTime > 0) {
      m.freezeTime -= dt;
      if (m.freezeTime <= 0 && m.postFreezeSlowTime > 0) {
        m.slowTime = Math.max(m.slowTime, m.postFreezeSlowTime);
        m.slowPct = Math.max(m.slowPct || 0, m.postFreezeSlowPct || 0);
        m.postFreezeSlowTime = 0;
        m.postFreezeSlowPct = 0;
      }
    }
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
          playSfx("baseHit");
        }
      } else {
        const slow = m.slowTime > 0 ? 1 - clamp(m.slowPct || .45, 0, .9) : 1;
        if (m.slowTime > 0) {
          m.slowTime -= dt;
          if (m.slowTime <= 0) m.slowPct = 0;
        }
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
    stopChannelAudio();
    playSfx("fail");
    showResult("防線突破", "基地 HP 歸零，本局失敗，POT 歸零。");
  }
}

function kill(m) {
  if (m.boss) {
    const rawAdd = bossMultiplier();
    const rewardMul = state.bossSeen === 0 ? params.bossFirstRewardMul : 1;
    const add = Math.round(Math.max(1, rawAdd * rewardMul) * 10) / 10;
    state.bossSeen += 1;
    state.exp += (m.exp || 120) * params.expMul;
    showBossReward(add);
    return;
  }
  state.exp += (m.exp || 0) * params.expMul;
  const amount = claimWaveReward(m);
  if (amount > 0) {
    state.pot += amount;
    showMoneyReward(m, amount);
  }
}

function claimWaveReward(m) {
  const reward = state.waveReward;
  const weight = Math.max(0, Number(m.rewardWeight) || 0);
  if (!reward || reward.remaining <= 0 || weight <= 0 || reward.weightRemaining <= 0) return 0;
  const finalShare = weight >= reward.weightRemaining - .0001;
  const amount = finalShare
    ? reward.remaining
    : Math.max(0, Math.round(reward.remaining * weight / reward.weightRemaining));
  reward.remaining = Math.max(0, reward.remaining - amount);
  reward.weightRemaining = Math.max(0, reward.weightRemaining - weight);
  return amount;
}

function showMoneyReward(m, amount) {
  const elite = !!m.elite;
  if (elite) showEliteDefeat(m, amount);
  else playSfx("coin");
  effect(elite ? "eliteCoin" : "coin", {x:m.x,y:m.y,color: elite ? "#fff1a6" : "#f0bc4f"}, m, {
    text: `+${amount}`,
    amount,
    radius: elite ? 34 : 14,
    life: elite ? 1.36 : .72
  });
  if (elite) pulsePotMoney();
}

function showEliteDefeat(m, amount) {
  playSfx("elite");
  effect("eliteDefeat", {x:m.x,y:m.y,color:"#ffd85c"}, m, { text:`菁英擊破 +${amount}`, amount, radius:72, life:1.28 });
  for (let i = 0; i < 8; i += 1) {
    const angle = i * Math.PI / 4 + Math.random() * .22;
    const distance = 42 + Math.random() * 34;
    effect("eliteShard", {x:m.x,y:m.y,color:i % 2 ? "#fff1a6" : "#ff9f43"}, {
      x:m.x + Math.cos(angle) * distance,
      y:m.y + Math.sin(angle) * distance
    }, { life:.62 + Math.random() * .28 });
  }
  ui.phone?.classList.remove("elite-flash");
  void ui.phone?.offsetWidth;
  ui.phone?.classList.add("elite-flash");
  try { navigator.vibrate?.([24, 24, 52]); } catch {}
}

function pulsePotMoney() {
  ui.potChip.classList.remove("money-pop");
  ui.potChip.classList.remove("elite-pop");
  void ui.potChip.offsetWidth;
  ui.potChip.classList.add("money-pop");
  ui.potChip.classList.add("elite-pop");
}

function showBossReward(add) {
  playSfx("boss");
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
    playSfx("waveClear");
    effect("waveClear", {x:FIELD.w/2,y:FIELD.h*.42,color:"#89e4ff"}, {x:FIELD.w/2,y:FIELD.h*.42}, { text:"波次完成", life:.9 });
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
    const required = UPGRADE_REQUIREMENTS[picked.up.name];
    const requirementNote = required ? `前置已解鎖：${upgradeRequirementLabel(required)}｜` : "";
    choices.push({
      title: picked.up.name,
      tag: picked.tower.name,
      towerId: picked.tower.id,
      attrKey: towerAttr(picked.tower),
      rarity: picked.rarity,
      repeatTaken: picked.takenCount > 0,
      desc: `${requirementNote}${picked.up.desc}｜${picked.up.effect}`,
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
  const corePity = rarity === "tower" && takenCount <= 0 ? Math.max(0, state.level - 4) * 7 : 0;
  let weight = base + depthBonus + corePity;
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
  "pathDamage", "vulnerablePct",
  "conditionalExplosionPct", "conditionalExplosionRadius", "conditionalStunTime", "poisonTargetDamagePct",
  "zoneStunTime", "zoneTime", "zonePoisonDps", "zonePoisonTime", "trailSlowPct", "trailTime",
  "shardCount", "shardDamagePct", "freezeDurationPct", "postFreezeSlowPct", "postFreezeSlowTime",
  "refractFocusPct", "focusedBurstDamagePct", "focusedBurstRadius", "electricVulnerablePct", "electricVulnerableTime",
  "focusConduit", "poisonBurstDamagePct", "poisonBurstRadius", "poisonChainDamagePct", "burningTargetDamagePct",
  "zoneSlowPct", "frozenTargetDamagePct"
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
  if (required && !upgradeRequirementSatisfied(required)) return false;
  const text = upgradeText(up);
  if (text.includes("路徑傷害+") && !hasOwnedUpgrade("傳導增幅")) return false;
  return true;
}
function upgradeRequirementSatisfied(required) {
  if (typeof required === "string") return hasOwnedUpgrade(required);
  const all = Array.isArray(required?.all) ? required.all : [];
  const any = Array.isArray(required?.any) ? required.any : [];
  return all.every(hasOwnedUpgrade) && (!any.length || any.some(hasOwnedUpgrade));
}
function upgradeRequirementLabel(required) {
  if (typeof required === "string") return required;
  const labels = [...(required?.all || [])];
  if (required?.any?.length) labels.push(required.anyLabel || `任一：${required.any.join("／")}`);
  return labels.join("＋");
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
  if (up.name === "寒氣附著") t.slow = Math.max(t.slow || 0, .25);
  if (up.name === "極凍禁制") t.freeze = true;
  if (up.name === "冰痕") t.iceTrail = true;
  if (s.includes("冰痕緩速效果+15")) t.iceSlow = (t.iceSlow || .15) + .15;
  if (up.name === "電磁殘留") t.stun = true;
  if (up.name === "戰術封鎖") t.root = true;
  if (up.name === "過載聚焦") t.focus = true;
  if (s.includes("加成效果提升50")) t.focusMul *= 1.5;
  if (s.includes("持續照射需要時間-50")) t.focusDelayMul = (t.focusDelayMul || 1) * .5;
  if (s.includes("折射")) t.refract = true;
  if (s.includes("受到傷害+15")) t.vulnerable = (t.vulnerable || 0) + .15;
  if (s.includes("增傷效果+50")) t.vulnerable = (t.vulnerable || .15) * 1.5;
  if (s.includes("燃燒區域")) t.burnArea = true;
  if (s.includes("毒霧")) t.poisonArea = true;
  if (up.name === "腐蝕毒霧") t.toxicZone = true;
  if (s.includes("迴旋飛刃")) t.ricochet = true;
  if (s.includes("飛刃傷害+100")) t.ricochetMul = (t.ricochetMul || 1) * 2;
  if (s.includes("額外迴旋刃+1")) t.ricochetExtra = (t.ricochetExtra || 0) + 1;
  if (up.name === "牽引模組") t.pull = true;
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
  if (has("conditionalExplosionPct")) t.conditionalExplosionPct = val("conditionalExplosionPct");
  if (has("conditionalExplosionRadius")) t.conditionalExplosionRadius = val("conditionalExplosionRadius");
  if (has("conditionalStunTime")) t.conditionalStunTime = val("conditionalStunTime");
  if (has("poisonTargetDamagePct")) t.poisonTargetDamagePct = val("poisonTargetDamagePct");
  if (has("zoneStunTime")) t.zoneStunTime = val("zoneStunTime");
  if (has("zoneTime")) t.synergyZoneTime = val("zoneTime");
  if (has("zonePoisonDps")) t.zonePoisonDps = val("zonePoisonDps");
  if (has("zonePoisonTime")) t.zonePoisonTime = val("zonePoisonTime");
  if (has("trailSlowPct")) t.trailSlowPct = val("trailSlowPct");
  if (has("trailTime")) t.trailTime = val("trailTime");
  if (has("shardCount")) t.shardCount = Math.max(0, Math.round(val("shardCount")));
  if (has("shardDamagePct")) t.shardDamagePct = val("shardDamagePct");
  if (has("freezeDurationPct")) t.freezeDurationMul = 1 + val("freezeDurationPct") / 100;
  if (has("postFreezeSlowPct")) t.postFreezeSlowPct = val("postFreezeSlowPct");
  if (has("postFreezeSlowTime")) t.postFreezeSlowTime = val("postFreezeSlowTime");
  if (has("refractFocusPct")) t.refractFocusPct = val("refractFocusPct");
  if (has("focusedBurstDamagePct")) t.focusedBurstDamagePct = val("focusedBurstDamagePct");
  if (has("focusedBurstRadius")) t.focusedBurstRadius = val("focusedBurstRadius");
  if (has("electricVulnerablePct")) t.electricVulnerablePct = val("electricVulnerablePct");
  if (has("electricVulnerableTime")) t.electricVulnerableTime = val("electricVulnerableTime");
  if (has("focusConduit")) t.focusConduit = Math.max(0, Math.round(val("focusConduit")));
  if (has("poisonBurstDamagePct")) t.poisonBurstDamagePct = val("poisonBurstDamagePct");
  if (has("poisonBurstRadius")) t.poisonBurstRadius = val("poisonBurstRadius");
  if (has("poisonChainDamagePct")) t.poisonChainDamagePct = val("poisonChainDamagePct");
  if (has("burningTargetDamagePct")) t.burningTargetDamagePct = val("burningTargetDamagePct");
  if (has("zoneSlowPct")) t.zoneSlowPct = val("zoneSlowPct");
  if (has("frozenTargetDamagePct")) t.frozenTargetDamagePct = val("frozenTargetDamagePct");
}

function tuneRatio(target, key, beforeValue, defaultRatio, tunedRatio) {
  const afterValue = target[key];
  if (!Number.isFinite(afterValue) || !Number.isFinite(beforeValue) || beforeValue === 0) return;
  if (Math.abs(afterValue / beforeValue - defaultRatio) < 0.001) target[key] = beforeValue * tunedRatio;
}

function collect() {
  if (!canCollect()) return;
  playSfx("collect");
  const win = payout();
  state.wallet += win;
  persistWallet();
  showResult("Collect", `帶走 ${win}。錢包餘額 ${state.wallet}。`);
}
function canCollect() { return state.started && !state.over && !state.waveActive && !state.monsters.length && !state.spawn && !state.choicesOpen && state.pot > 0; }

function effect(type, from, to, opts={}) {
  const visualLife = {
    cone:.24, chain:.25, spark:.24, grenade:.42, frost:.46,
    gas:.4, trap:.42, needle:.28, blade:.32, impact:.34, hitBase:.4
  };
  const areaFlashLife = visualLife[type] || .35;
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
  drawActiveChannels();
  state.effects.forEach(drawEffect);
  state.monsters.forEach(drawEnemy);
}

function drawActiveChannels() {
  const origin = fireOrigin();
  state.towers.forEach(tower => {
    if (tower.mode !== "laser" || !tower.channel) return;
    const channel = tower.channel;
    const target = channel.target;
    if (!target || target.hp <= 0) return;
    const focusDelay = (tower.focusDelay || 1) * (tower.focusDelayMul || 1);
    const focused = !!tower.focus && channel.lockElapsed >= focusDelay;
    drawPersistentLaser(origin, target, tower.color, focused, false);
    const refractTarget = channel.refractTarget;
    if (tower.refract && refractTarget && refractTarget.hp > 0) {
      drawPersistentLaser(target, refractTarget, tower.color, focused && !!tower.refractFocusPct, true);
    }
  });
}

function drawPersistentLaser(from, to, color, focused=false, secondary=false) {
  const phase = performance.now() / 160;
  const pulse = .96 + Math.sin(phase) * .04;
  const coreWidth = secondary ? 1.25 : focused ? 2.35 : 1.75;
  const beamWidth = secondary ? 7 : focused ? 14 : 11;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = focused ? 18 : 13;
  ctx.globalAlpha = (secondary ? .15 : .22) * pulse;
  ctx.strokeStyle = color;
  ctx.lineWidth = beamWidth;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.globalAlpha = secondary ? .7 : .88;
  ctx.lineWidth = secondary ? 2.4 : focused ? 5 : 3.8;
  ctx.stroke();
  ctx.shadowBlur = 5;
  ctx.globalAlpha = secondary ? .82 : .96;
  ctx.strokeStyle = "#fff9ce";
  ctx.lineWidth = coreWidth;
  ctx.stroke();
  const travel = (performance.now() / (secondary ? 540 : 420)) % 1;
  const sparkX = from.x + (to.x - from.x) * travel;
  const sparkY = from.y + (to.y - from.y) * travel;
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = .85;
  ctx.beginPath();
  ctx.arc(sparkX, sparkY, secondary ? 1.5 : 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.globalAlpha = .75;
  ctx.lineWidth = secondary ? 1.3 : 2;
  ctx.beginPath();
  ctx.arc(to.x, to.y, secondary ? 4 : 6 + Math.sin(phase) * .5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
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
  const ground = g.createLinearGradient(0, 0, 0, layer.height);
  ground.addColorStop(0, "#10141a");
  ground.addColorStop(.5, "#17171a");
  ground.addColorStop(1, "#080a0e");
  g.fillStyle = ground;
  g.fillRect(0, 0, layer.width, layer.height);

  const road = g.createLinearGradient(0, 0, layer.width, 0);
  road.addColorStop(0, "#2b2624");
  road.addColorStop(.08, "#17191d");
  road.addColorStop(.5, "#232429");
  road.addColorStop(.92, "#17191d");
  road.addColorStop(1, "#2b2624");
  g.fillStyle = road;
  g.fillRect(8, 0, layer.width - 16, FIELD.baseY + 12);

  g.fillStyle = "#090c11";
  g.fillRect(20, 0, layer.width - 40, FIELD.baseY + 12);
  const innerRoad = g.createLinearGradient(0, 0, layer.width, 0);
  innerRoad.addColorStop(0, "#1b1d22");
  innerRoad.addColorStop(.5, "#292a2f");
  innerRoad.addColorStop(1, "#1b1d22");
  g.fillStyle = innerRoad;
  g.fillRect(27, 0, layer.width - 54, FIELD.baseY + 12);

  g.strokeStyle = "rgba(126, 220, 255, .22)";
  g.lineWidth = 2;
  [-98, -49, 49, 98].forEach(offset => {
    g.beginPath();
    g.moveTo(FIELD.pathX + offset, 0);
    g.lineTo(FIELD.pathX + offset, FIELD.baseY - 30);
    g.stroke();
  });

  for (let y = 42; y < FIELD.baseY - 48; y += 62) {
    g.fillStyle = y % 124 ? "rgba(255,255,255,.035)" : "rgba(255,138,68,.045)";
    g.fillRect(29, y, layer.width - 58, 2);
    g.strokeStyle = "rgba(137, 228, 255, .18)";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(FIELD.pathX - 10, y + 25);
    g.lineTo(FIELD.pathX + 10, y + 20);
    g.stroke();
  }

  for (let y = 10; y < FIELD.baseY - 24; y += 32) {
    g.fillStyle = (y / 32) % 2 ? "#c98228" : "#282c32";
    g.save();
    g.translate(12, y);
    g.rotate(-.42);
    g.fillRect(-8, -5, 22, 8);
    g.restore();
    g.save();
    g.translate(layer.width - 12, y);
    g.rotate(.42);
    g.fillRect(-14, -5, 22, 8);
    g.restore();
  }

  const portalGlow = g.createRadialGradient(FIELD.pathX, 2, 0, FIELD.pathX, 2, 92);
  portalGlow.addColorStop(0, "rgba(120, 225, 255, .34)");
  portalGlow.addColorStop(1, "rgba(120, 225, 255, 0)");
  g.fillStyle = portalGlow;
  g.fillRect(72, 0, 206, 96);
  g.fillStyle = "#0a0d12";
  g.fillRect(112, 0, 126, 20);
  g.strokeStyle = "#78dfff";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(116, 18);
  g.quadraticCurveTo(FIELD.pathX, 42, 234, 18);
  g.stroke();

  g.fillStyle = "#11161d";
  g.fillRect(22, FIELD.baseY - 18, 306, 56);
  g.fillStyle = "#242933";
  g.fillRect(34, FIELD.baseY - 10, 282, 20);
  g.strokeStyle = "rgba(255,255,255,.35)";
  g.lineWidth = 2;
  g.strokeRect(22, FIELD.baseY - 18, 306, 56);
  g.fillStyle = "#080c12";
  for (let x = 44; x <= 306; x += 29) g.fillRect(x, FIELD.baseY - 14, 13, 8);
  g.strokeStyle = "#7ee6ff";
  g.shadowColor = "#7ee6ff";
  g.shadowBlur = 14;
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(38, FIELD.baseY - 21);
  g.lineTo(312, FIELD.baseY - 21);
  g.stroke();
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
function enemyPolygon(x, y, radius, sides, rotation=-Math.PI/2) {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const angle = rotation + i * Math.PI * 2 / sides;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.closePath();
}

function drawMinionBody(m, size) {
  ctx.fillStyle = m.color;
  ctx.strokeStyle = "rgba(224,236,255,.66)";
  ctx.lineWidth = 1.5;
  ctx.shadowColor = m.color;
  ctx.shadowBlur = 3;
  ctx.beginPath();
  if (m.shape === "triangle") {
    ctx.moveTo(m.x,m.y-size/2); ctx.lineTo(m.x+size/2,m.y+size/2); ctx.lineTo(m.x-size/2,m.y+size/2); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (m.shape === "diamond") {
    ctx.moveTo(m.x,m.y-size/2); ctx.lineTo(m.x+size/2,m.y); ctx.lineTo(m.x,m.y+size/2); ctx.lineTo(m.x-size/2,m.y); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else {
    ctx.fillRect(m.x-size/2,m.y-size/2,size,size);
    ctx.strokeRect(m.x-size/2,m.y-size/2,size,size);
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,.72)";
  ctx.beginPath();
  ctx.arc(m.x - size*.14, m.y - size*.08, Math.max(1.5,size*.07), 0, Math.PI*2);
  ctx.arc(m.x + size*.14, m.y - size*.08, Math.max(1.5,size*.07), 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = "rgba(8,12,18,.78)";
  ctx.fillRect(m.x-size*.22,m.y+size*.15,size*.44,Math.max(2,size*.08));
}

function drawEliteBody(m, size) {
  const spin = performance.now() / 850;
  ctx.shadowColor = "#ffd85c";
  ctx.shadowBlur = 14;
  ctx.strokeStyle = "rgba(255,216,92,.88)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(m.x, m.y, size * .72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  for (let i = 0; i < 4; i += 1) {
    const angle = spin + i * Math.PI / 2;
    ctx.save();
    ctx.translate(m.x + Math.cos(angle) * size * .78, m.y + Math.sin(angle) * size * .78);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = i % 2 ? "#fff1a6" : m.color;
    ctx.beginPath();
    ctx.moveTo(0, -6); ctx.lineTo(6, 5); ctx.lineTo(-6, 5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#17130d";
  ctx.strokeStyle = "#fff1a6";
  ctx.lineWidth = 3;
  ctx.shadowColor = m.color;
  ctx.shadowBlur = 10;
  enemyPolygon(m.x, m.y, size * .55, 6);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = .9;
  ctx.fillStyle = m.color;
  enemyPolygon(m.x, m.y + 1, size * .37, 6, Math.PI / 6);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fff6cf";
  ctx.beginPath();
  ctx.moveTo(m.x - 10, m.y - 10); ctx.lineTo(m.x - 5, m.y - 18); ctx.lineTo(m.x, m.y - 11); ctx.lineTo(m.x + 6, m.y - 18); ctx.lineTo(m.x + 11, m.y - 9); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#15100a";
  ctx.fillRect(m.x - 9, m.y + 6, 18, 4);
}

function drawBossBody(m, size) {
  const spin = performance.now() / 1300;
  ctx.shadowColor = m.color;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = "rgba(255,91,77,.82)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(m.x, m.y, size * .68, spin, spin + Math.PI * 1.45);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(m.x, m.y, size * .78, -spin, -spin + Math.PI * 1.12);
  ctx.stroke();
  ctx.shadowBlur = 0;
  for (let i = 0; i < 8; i += 1) {
    const angle = spin + i * Math.PI / 4;
    ctx.save();
    ctx.translate(m.x + Math.cos(angle) * size * .65, m.y + Math.sin(angle) * size * .65);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = i % 2 ? "#ffd0c8" : m.color;
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(7, 5); ctx.lineTo(-7, 5); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#160d10";
  ctx.strokeStyle = "#ffd4cf";
  ctx.lineWidth = 3.5;
  ctx.shadowColor = m.color;
  ctx.shadowBlur = 14;
  enemyPolygon(m.x, m.y, size * .54, 8, Math.PI / 8);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#2a171b";
  ctx.fillRect(m.x - size * .72, m.y - 9, size * .22, 18);
  ctx.fillRect(m.x + size * .5, m.y - 9, size * .22, 18);
  ctx.strokeStyle = "#ffb9ae";
  ctx.strokeRect(m.x - size * .72, m.y - 9, size * .22, 18);
  ctx.strokeRect(m.x + size * .5, m.y - 9, size * .22, 18);
  const core = ctx.createRadialGradient(m.x - 3, m.y - 4, 2, m.x, m.y, size * .35);
  core.addColorStop(0, "#fff4cf");
  core.addColorStop(.28, m.color);
  core.addColorStop(1, "#3b0710");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(m.x, m.y, size * .31, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.7)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#13060a";
  ctx.beginPath();
  ctx.arc(m.x - 8, m.y - 3, 3.5, 0, Math.PI * 2);
  ctx.arc(m.x + 8, m.y - 3, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(m.x - 10, m.y + 9, 20, 4);
}

function drawEnemy(m) {
  const size = m.boss ? 44 : m.elite ? 32 : m.size;
  const hpPct = Math.max(0, m.hp / m.maxHp);
  ctx.save();
  if (m.boss) drawBossBody(m, size);
  else if (m.elite) drawEliteBody(m, size);
  else drawMinionBody(m, size);
  ctx.restore();
  drawEnemyAttributeMarker(m, size);
  const bw = m.boss ? 58 : m.elite ? 46 : 32;
  if (m.boss) {
    const barW = 92;
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
  ctx.fillStyle = "rgba(5,8,12,.82)"; ctx.fillRect(m.x-bw/2-1,m.y-size/2-11,bw+2,6);
  ctx.fillStyle = m.elite ? "#ffd85c" : "#41d47a";
  ctx.fillRect(m.x-bw/2,m.y-size/2-10,bw*hpPct,4);
  if (m.elite) {
    ctx.fillStyle = "#fff4c6";
    ctx.font = "900 9px Microsoft JhengHei";
    ctx.textAlign = "center";
    ctx.fillText("ELITE", m.x, m.y-size/2-15);
  }
}

function drawAttributeGlyph(g, attr, x, y, size, color) {
  g.save();
  g.fillStyle = color;
  g.strokeStyle = color;
  g.lineWidth = Math.max(1.4, size * .16);
  g.lineCap = "round";
  g.lineJoin = "round";
  if (attr === "fire") {
    g.beginPath();
    g.moveTo(x, y + size * .78);
    g.bezierCurveTo(x - size * .68, y + size * .36, x - size * .48, y - size * .18, x - size * .12, y - size * .82);
    g.bezierCurveTo(x - size * .08, y - size * .30, x + size * .56, y - size * .20, x + size * .42, y - size * .72);
    g.bezierCurveTo(x + size * .98, y - size * .08, x + size * .62, y + size * .62, x, y + size * .78);
    g.closePath();
    g.fill();
  } else if (attr === "ice") {
    for (let i = 0; i < 3; i += 1) {
      const a = i * Math.PI / 3;
      const dx = Math.cos(a), dy = Math.sin(a);
      g.beginPath();
      g.moveTo(x - dx * size * .82, y - dy * size * .82);
      g.lineTo(x + dx * size * .82, y + dy * size * .82);
      g.stroke();
      for (const side of [-1, 1]) {
        const bx = x + dx * size * .52 * side;
        const by = y + dy * size * .52 * side;
        const branch = a + (side > 0 ? Math.PI : 0);
        for (const turn of [-.62, .62]) {
          g.beginPath();
          g.moveTo(bx, by);
          g.lineTo(bx + Math.cos(branch + turn) * size * .28, by + Math.sin(branch + turn) * size * .28);
          g.stroke();
        }
      }
    }
  } else if (attr === "electric") {
    g.beginPath();
    g.moveTo(x + size * .14, y - size * .90);
    g.lineTo(x - size * .62, y + size * .08);
    g.lineTo(x - size * .12, y + size * .02);
    g.lineTo(x - size * .32, y + size * .92);
    g.lineTo(x + size * .68, y - size * .22);
    g.lineTo(x + size * .16, y - size * .12);
    g.closePath();
    g.fill();
  } else if (attr === "poison") {
    g.beginPath();
    g.moveTo(x - size * .18, y - size * .84);
    g.bezierCurveTo(x - size * .72, y - size * .10, x - size * .70, y + size * .62, x, y + size * .78);
    g.bezierCurveTo(x + size * .70, y + size * .62, x + size * .72, y - size * .10, x + size * .18, y - size * .84);
    g.bezierCurveTo(x + size * .08, y - size * .98, x - size * .08, y - size * .98, x - size * .18, y - size * .84);
    g.closePath();
    g.fill();
    g.beginPath(); g.arc(x + size * .54, y - size * .55, size * .18, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + size * .76, y - size * .12, size * .11, 0, Math.PI * 2); g.fill();
  } else {
    g.beginPath();
    for (let i = 0; i < 16; i += 1) {
      const a = -Math.PI / 2 + i * Math.PI / 8;
      const r = i % 2 ? size * .38 : size * .88;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
    g.fill();
    g.fillStyle = "rgba(7,10,16,.82)";
    g.beginPath(); g.arc(x, y, size * .20, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

function renderAttributeCanvas(canvasEl, attr, boss=false) {
  if (!canvasEl?.getContext) return;
  const cacheKey = `${attr}:${boss}`;
  if (canvasEl._attrCache === cacheKey) return;
  canvasEl._attrCache = cacheKey;
  const g = canvasEl.getContext("2d");
  const w = canvasEl.width, h = canvasEl.height;
  const display = ATTRIBUTE_DISPLAY[attr] || ATTRIBUTE_DISPLAY.neutral;
  g.clearRect(0, 0, w, h);
  g.fillStyle = "rgba(7,10,16,.92)";
  g.strokeStyle = boss ? "#ff5b52" : display.color;
  g.lineWidth = boss ? 3 : 2;
  g.beginPath(); g.arc(w / 2, h / 2, Math.min(w, h) * .42, 0, Math.PI * 2); g.fill(); g.stroke();
  drawAttributeGlyph(g, attr, w / 2, h / 2, Math.min(w, h) * .25, display.color);
}

function drawEnemyAttributeMarker(m, size) {
  const entries = Object.entries(m.attrMultipliers || {});
  const weak = entries.reduce((best, entry) => !best || entry[1] > best[1] ? entry : best, null);
  if (!weak || weak[0] === "neutral" || weak[1] <= 1.001) return;
  const display = ATTRIBUTE_DISPLAY[weak[0]] || ATTRIBUTE_DISPLAY.neutral;
  const radius = m.boss ? 11 : m.elite ? 9.5 : 8;
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
  drawAttributeGlyph(ctx, weak[0], x, y, radius * .58, display.color);
  ctx.restore();
}

function drawProjectile(p) {
  const y = p.y - (p.arc || 0);
  const angle = Math.atan2(p.ty - p.sy, p.tx - p.sx);
  const motion = Math.max(0, Math.min(1, 1 - p.time / Math.max(.01, p.total || 1)));
  ctx.save();
  if (p.type === "grenade") {
    ctx.globalAlpha = .25;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 3, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = .34;
    ctx.strokeStyle = p.tower.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const trailX = p.x - Math.cos(angle) * 17;
    const trailY = y - Math.sin(angle) * 17;
    ctx.moveTo(trailX, trailY);
    ctx.lineTo(p.x, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.translate(p.x, y);
    ctx.rotate(angle + motion * Math.PI * 4);
    ctx.shadowColor = "#ff8a2d";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#282b31";
    ctx.strokeStyle = "#ff9f3f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffe1a1";
    ctx.fillRect(-2, -8, 4, 16);
    ctx.fillStyle = "#ff5b24";
    ctx.beginPath(); ctx.arc(-7, -7, 2.4, 0, Math.PI * 2); ctx.fill();
  } else if (p.type === "cryo") {
    ctx.translate(p.x, y);
    ctx.rotate(angle);
    ctx.shadowColor = "#83e9ff";
    ctx.shadowBlur = 10;
    ctx.globalAlpha = .26;
    ctx.fillStyle = p.tower.color;
    ctx.beginPath();
    ctx.moveTo(-27, 0); ctx.lineTo(-5, -7); ctx.lineTo(7, 0); ctx.lineTo(-5, 7); ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#d9f7ff";
    ctx.strokeStyle = p.tower.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 0); ctx.lineTo(-3, -6); ctx.lineTo(-10, 0); ctx.lineTo(-3, 6); ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#92eaff";
    ctx.beginPath(); ctx.moveTo(-2,-5); ctx.lineTo(-8,-12); ctx.lineTo(4,-5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-2,5); ctx.lineTo(-8,12); ctx.lineTo(4,5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.ellipse(5, -1, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
  } else if (p.type === "needle") {
    ctx.translate(p.x, y);
    ctx.rotate(angle);
    ctx.shadowColor = "#65ff83";
    ctx.shadowBlur = 7;
    ctx.strokeStyle = "rgba(89,255,127,.4)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-25,0); ctx.lineTo(-5,0); ctx.stroke();
    ctx.fillStyle = "#d7ffd8";
    ctx.strokeStyle = p.tower.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(-6, -4);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#60e879";
    ctx.fillRect(-9, -2, 7, 4);
  } else if (p.type === "blade") {
    ctx.translate(p.x, y);
    ctx.rotate(p.spin);
    ctx.shadowColor = p.tower.color;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = "rgba(220,246,255,.5)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = p.tower.color;
    for (let i = 0; i < 3; i += 1) {
      ctx.rotate(Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.moveTo(1, -2); ctx.quadraticCurveTo(13, -8, 16, 1); ctx.quadraticCurveTo(8, 4, 1, 2); ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "#effbff";
    ctx.beginPath(); ctx.arc(0,0,3.5,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
function drawZone(z) {
  const life = clamp(z.time / Math.max(.01, z.maxTime || z.time), 0, 1);
  const age = 1 - life;
  const fade = Math.min(1, age * 8) * Math.min(1, life * 5);
  const pulse = .5 + .5 * Math.sin(age * 18 + (z.visualSeed || 0));
  const mode = z.tower?.mode || "";
  const trap = mode === "trap" || z.root || z.pull;
  const fire = !trap && (z.burn > 0 || mode === "flame");
  const poison = !trap && !fire && (mode === "gas" || z.poison > 0);
  const frost = !trap && !fire && !poison && (mode === "frostbomb" || mode === "cryo" || z.slow > 0);
  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.globalAlpha = Math.max(.08, fade);

  if (fire) {
    const glow = ctx.createRadialGradient(0,0,z.radius*.12,0,0,z.radius);
    glow.addColorStop(0, "rgba(255,202,74,.34)");
    glow.addColorStop(.5, "rgba(255,82,24,.22)");
    glow.addColorStop(1, "rgba(50,8,3,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0,0,z.radius,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(34,12,8,.72)";
    ctx.beginPath(); ctx.arc(0,0,z.radius*.72,0,Math.PI*2); ctx.fill();
    for (let i=0;i<8;i+=1) {
      const a = (z.visualSeed || 0) + i * Math.PI / 4 + age * .35;
      const rr = z.radius * (.18 + (i%3)*.16);
      const h = 8 + (i%3)*4 + pulse*5;
      ctx.fillStyle = i%2 ? "rgba(255,91,24,.78)" : "rgba(255,190,54,.82)";
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*rr-4, Math.sin(a)*rr+4);
      ctx.quadraticCurveTo(Math.cos(a)*rr, Math.sin(a)*rr-h, Math.cos(a)*rr+4, Math.sin(a)*rr+4);
      ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = `rgba(255,143,42,${.42 + pulse*.25})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([7,5]);
    ctx.beginPath(); ctx.arc(0,0,z.radius*.88,0,Math.PI*2); ctx.stroke();
  } else if (poison) {
    const mist = ctx.createRadialGradient(0,0,0,0,0,z.radius);
    mist.addColorStop(0,"rgba(121,255,104,.25)");
    mist.addColorStop(.62,"rgba(50,182,74,.2)");
    mist.addColorStop(1,"rgba(12,70,34,0)");
    ctx.fillStyle = mist;
    ctx.beginPath(); ctx.arc(0,0,z.radius,0,Math.PI*2); ctx.fill();
    for (let i=0;i<7;i+=1) {
      const a = (z.visualSeed || 0) + i*2.17 + age*(i%2 ? .7 : -.55);
      const rr = z.radius * (.16 + (i%4)*.16);
      const bubble = 5 + (i%3)*3 + pulse*2;
      ctx.fillStyle = i%2 ? "rgba(100,235,102,.24)" : "rgba(181,255,116,.18)";
      ctx.beginPath(); ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,bubble,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = "rgba(188,255,150,.42)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(104,236,112,${.42 + pulse*.2})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([3,7]);
    ctx.beginPath(); ctx.arc(0,0,z.radius*.9,0,Math.PI*2); ctx.stroke();
  } else if (frost) {
    const ice = ctx.createRadialGradient(0,0,0,0,0,z.radius);
    ice.addColorStop(0,"rgba(211,250,255,.28)");
    ice.addColorStop(.6,"rgba(102,216,255,.17)");
    ice.addColorStop(1,"rgba(77,155,255,0)");
    ctx.fillStyle = ice;
    ctx.beginPath(); ctx.arc(0,0,z.radius,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = "rgba(202,248,255,.58)";
    ctx.lineWidth = 1.5;
    for (let i=0;i<8;i+=1) {
      const a = i*Math.PI/4 + (z.visualSeed || 0)*.2;
      const inner = z.radius*.18;
      const outer = z.radius*(.62 + (i%2)*.16);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);
      ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);
      ctx.stroke();
      const bx = Math.cos(a)*outer*.7;
      const by = Math.sin(a)*outer*.7;
      ctx.beginPath();
      ctx.moveTo(bx,by);
      ctx.lineTo(bx+Math.cos(a+.7)*8,by+Math.sin(a+.7)*8);
      ctx.moveTo(bx,by);
      ctx.lineTo(bx+Math.cos(a-.7)*8,by+Math.sin(a-.7)*8);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(139,230,255,${.48 + pulse*.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0,0,z.radius*.9,0,Math.PI*2); ctx.stroke();
  } else if (trap) {
    ctx.fillStyle = "rgba(15,24,31,.62)";
    ctx.beginPath(); ctx.arc(0,0,z.radius*.92,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = z.root ? "rgba(174,116,255,.8)" : "rgba(100,224,255,.72)";
    ctx.lineWidth = 2;
    for (const scale of [.38,.68,.92]) {
      ctx.beginPath(); ctx.arc(0,0,z.radius*scale,age*1.4,age*1.4+Math.PI*1.55); ctx.stroke();
    }
    ctx.rotate(age * (z.pull ? 1.8 : .6));
    for (let i=0;i<8;i+=1) {
      const a=i*Math.PI/4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*z.radius*.28,Math.sin(a)*z.radius*.28);
      ctx.lineTo(Math.cos(a)*z.radius*.78,Math.sin(a)*z.radius*.78);
      ctx.stroke();
      if (z.pull) {
        const rr=z.radius*.58;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);
        ctx.lineTo(Math.cos(a+.18)*(rr-10),Math.sin(a+.18)*(rr-10));
        ctx.lineTo(Math.cos(a-.18)*(rr-10),Math.sin(a-.18)*(rr-10));
        ctx.closePath(); ctx.fillStyle="rgba(138,237,255,.55)"; ctx.fill();
      }
    }
  } else {
    ctx.fillStyle = `${z.tower.color}33`;
    ctx.beginPath(); ctx.arc(0,0,z.radius,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = z.tower.color;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0,0,z.radius*.9,0,Math.PI*2); ctx.stroke();
  }
  ctx.restore();
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
  else if (e.type==="eliteDefeat") {
    const progress = 1 - p;
    ctx.globalAlpha = Math.min(1, p * 1.55);
    ctx.translate(e.x, e.y);
    ctx.strokeStyle = "#ffd85c";
    ctx.lineWidth = 4 * p + 1;
    ctx.beginPath();
    ctx.arc(0, 0, 18 + progress * 62, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,244,198,${.68*p})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i += 1) {
      const a = i * Math.PI / 6 + progress * .34;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (22 + progress * 15), Math.sin(a) * (22 + progress * 15));
      ctx.lineTo(Math.cos(a) * (50 + progress * 34), Math.sin(a) * (50 + progress * 34));
      ctx.stroke();
    }
    const bannerY = -42 - progress * 24;
    ctx.fillStyle = `rgba(15,10,5,${.82*p})`;
    roundRect(-82, bannerY - 18, 164, 34, 5);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,216,92,${p})`;
    ctx.stroke();
    ctx.font = "900 18px Microsoft JhengHei";
    ctx.textAlign = "center";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,.82)";
    ctx.fillStyle = "#fff1a6";
    ctx.strokeText(e.text || "菁英擊破", 0, bannerY + 5);
    ctx.fillText(e.text || "菁英擊破", 0, bannerY + 5);
  }
  else if (e.type==="eliteShard") {
    const progress = 1 - p;
    const x = e.x + (e.tx - e.x) * progress;
    const y = e.y + (e.ty - e.y) * progress + progress * progress * 18;
    ctx.translate(x, y);
    ctx.rotate(progress * 5);
    ctx.globalAlpha = p;
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.moveTo(0,-5); ctx.lineTo(4,0); ctx.lineTo(0,5); ctx.lineTo(-4,0); ctx.closePath(); ctx.fill();
  }
  else if (e.type==="waveClear") {
    const progress = 1 - p;
    ctx.translate(e.x, e.y - progress * 14);
    ctx.globalAlpha = Math.min(1, p * 1.8);
    ctx.fillStyle = `rgba(5,12,18,${.72*p})`;
    roundRect(-70,-21,140,42,5);
    ctx.fill();
    ctx.strokeStyle = `rgba(137,228,255,${p})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#dff8ff";
    ctx.font = "900 19px Microsoft JhengHei";
    ctx.textAlign = "center";
    ctx.fillText(e.text || "波次完成", 0, 7);
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
    const nx = -dy / length;
    const ny = dx / length;
    const progress = 1 - p;
    const flameLayers = [
      { scale:1, color:`rgba(255,60,20,${.18*p})` },
      { scale:.72, color:`rgba(255,139,30,${.24*p})` },
      { scale:.42, color:`rgba(255,239,147,${.3*p})` }
    ];
    ctx.shadowColor = "#ff5b24";
    ctx.shadowBlur = 12;
    flameLayers.forEach(layer => {
      const px = nx * e.width * layer.scale;
      const py = ny * e.width * layer.scale;
      const reach = .72 + layer.scale * .28;
      ctx.fillStyle = layer.color;
      ctx.beginPath();
      ctx.moveTo(e.x,e.y);
      ctx.quadraticCurveTo(e.x+dx*.55+px*.25,e.y+dy*.55+py*.25,e.x+dx*reach+px,e.y+dy*reach+py);
      ctx.lineTo(e.x+dx*reach-px,e.y+dy*reach-py);
      ctx.quadraticCurveTo(e.x+dx*.55-px*.25,e.y+dy*.55-py*.25,e.x,e.y);
      ctx.fill();
    });
    ctx.strokeStyle = `rgba(255,226,119,${.7*p})`;
    ctx.lineWidth = 2;
    for (let i=0;i<5;i+=1) {
      const t = .32 + i*.13;
      const side = Math.sin(i*2.7+progress*12) * e.width * t*.45;
      const x1=e.x+dx*t+nx*side;
      const y1=e.y+dy*t+ny*side;
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x1-dx/length*(8+i*2)+nx*3,y1-dy/length*(8+i*2)+ny*3);
      ctx.stroke();
    }
  }
  else if (e.type==="grenade") {
    const progress = 1-p;
    const radius = (e.radius || 22) * (.35 + progress*.85);
    ctx.translate(e.tx,e.ty);
    ctx.shadowColor="#ff5b24"; ctx.shadowBlur=14;
    const blast=ctx.createRadialGradient(0,0,0,0,0,radius);
    blast.addColorStop(0,`rgba(255,245,186,${.72*p})`);
    blast.addColorStop(.32,`rgba(255,143,35,${.52*p})`);
    blast.addColorStop(1,"rgba(139,28,8,0)");
    ctx.fillStyle=blast; ctx.beginPath(); ctx.arc(0,0,radius,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=`rgba(255,211,91,${.8*p})`; ctx.lineWidth=3*p+1;
    ctx.beginPath(); ctx.arc(0,0,radius*.9,0,Math.PI*2); ctx.stroke();
    for(let i=0;i<10;i+=1){
      const a=i*Math.PI/5+progress*.3;
      const inner=radius*.42, outer=radius*(.82+(i%3)*.14);
      ctx.strokeStyle=i%2?`rgba(255,99,27,${.75*p})`:`rgba(255,234,145,${.75*p})`;
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner); ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer); ctx.stroke();
    }
  }
  else if (e.type==="frost") {
    const progress=1-p;
    const radius=(e.radius||20)*(.35+progress*.8);
    ctx.translate(e.tx,e.ty);
    ctx.fillStyle=`rgba(126,226,255,${.18*p})`;
    ctx.beginPath(); ctx.arc(0,0,radius,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=`rgba(211,251,255,${.86*p})`; ctx.lineWidth=2;
    for(let i=0;i<10;i+=1){
      const a=i*Math.PI/5+progress*.18;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*radius*.12,Math.sin(a)*radius*.12); ctx.lineTo(Math.cos(a)*radius,Math.sin(a)*radius); ctx.stroke();
      const tipX=Math.cos(a)*radius*.68, tipY=Math.sin(a)*radius*.68;
      ctx.beginPath(); ctx.moveTo(tipX,tipY); ctx.lineTo(tipX+Math.cos(a+.75)*radius*.22,tipY+Math.sin(a+.75)*radius*.22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tipX,tipY); ctx.lineTo(tipX+Math.cos(a-.75)*radius*.22,tipY+Math.sin(a-.75)*radius*.22); ctx.stroke();
    }
    ctx.strokeStyle=`rgba(116,211,255,${.68*p})`; ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(0,0,radius*.82,0,Math.PI*2);ctx.stroke();
  }
  else if (e.type==="gas") {
    const progress=1-p;
    const radius=(e.radius||24)*(.42+progress*.72);
    ctx.translate(e.tx,e.ty);
    ctx.shadowColor="#54d968";ctx.shadowBlur=9;
    for(let i=0;i<8;i+=1){
      const a=i*2.31+progress*(i%2?.7:-.5);
      const rr=radius*(.08+(i%4)*.15);
      const size=radius*(.24+(i%3)*.07);
      ctx.fillStyle=i%2?`rgba(83,214,91,${.2*p})`:`rgba(171,255,102,${.16*p})`;
      ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,size,0,Math.PI*2);ctx.fill();
    }
    ctx.strokeStyle=`rgba(157,255,130,${.68*p})`;ctx.lineWidth=2;ctx.setLineDash([4,5]);
    ctx.beginPath();ctx.arc(0,0,radius*.84,0,Math.PI*2);ctx.stroke();
  }
  else if (e.type==="trap") {
    const progress=1-p;
    const radius=(e.radius||20)*(.5+progress*.62);
    ctx.translate(e.tx,e.ty);ctx.rotate(progress*.7);
    ctx.fillStyle=`rgba(41,173,213,${.12*p})`;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=`rgba(142,239,255,${.76*p})`;ctx.lineWidth=2;
    [1,.62].forEach(scale=>{ctx.beginPath();ctx.arc(0,0,radius*scale,0,Math.PI*2);ctx.stroke();});
    for(let i=0;i<8;i+=1){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*.28,Math.sin(a)*radius*.28);ctx.lineTo(Math.cos(a)*radius,Math.sin(a)*radius);ctx.stroke();}
  }
  else if (e.type==="needle") {
    const progress=1-p;
    const radius=(e.radius||14)*(.35+progress*.8);
    ctx.translate(e.tx,e.ty);ctx.rotate(progress*.2);
    ctx.strokeStyle=`rgba(115,255,133,${.82*p})`;ctx.lineWidth=2;
    for(let i=0;i<8;i+=1){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*.15,Math.sin(a)*radius*.15);ctx.lineTo(Math.cos(a)*radius,Math.sin(a)*radius);ctx.stroke();}
    ctx.fillStyle=`rgba(64,218,92,${.24*p})`;ctx.beginPath();ctx.arc(0,0,radius*.58,0,Math.PI*2);ctx.fill();
  }
  else if (e.type==="blade") {
    const progress=1-p;
    const radius=(e.radius||18)*(.45+progress*.75);
    ctx.translate(e.tx,e.ty);ctx.rotate(progress*2.4);
    ctx.strokeStyle=`rgba(212,247,255,${.78*p})`;ctx.lineWidth=3;
    for(let i=0;i<3;i+=1){ctx.beginPath();ctx.arc(0,0,radius,i*Math.PI*2/3,i*Math.PI*2/3+1.35);ctx.stroke();}
    ctx.fillStyle=`rgba(122,220,255,${.18*p})`;ctx.beginPath();ctx.arc(0,0,radius*.68,0,Math.PI*2);ctx.fill();
  }
  else if (e.type==="impact" || e.type==="hitBase") {
    const progress=1-p;
    const radius=(e.radius||18)*(.35+progress*.9);
    ctx.translate(e.tx,e.ty);
    const color=e.type==="hitBase"?"255,72,58":"173,239,255";
    ctx.fillStyle=`rgba(${color},${.15*p})`;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=`rgba(${color},${.8*p})`;ctx.lineWidth=3*p+1;ctx.beginPath();ctx.arc(0,0,radius*.86,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<6;i+=1){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*.55,Math.sin(a)*radius*.55);ctx.lineTo(Math.cos(a)*radius*1.12,Math.sin(a)*radius*1.12);ctx.stroke();}
  }
  else if (e.type==="spark") {
    const progress=1-p;
    ctx.strokeStyle=e.color||"#d9f8ff";
    ctx.lineWidth = 2.2;
    ctx.shadowColor=e.color||"#9beaff";ctx.shadowBlur=7;
    [[-4,-2,-17,-8],[4,2,17,8],[-3,4,-10,16],[3,-4,10,-16],[-2,0,-20,2],[2,0,20,-2]].forEach((s,i) => {
      const spread=.72+progress*.34+(i%2)*.08;
      ctx.beginPath();
      ctx.moveTo(e.tx + s[0] * spread, e.ty + s[1] * spread);
      ctx.lineTo(e.tx + s[2] * spread, e.ty + s[3] * spread);
      ctx.stroke();
    });
  }
  else if (e.type==="chain") {
    let from={x:e.x,y:e.y};
    [{x:e.tx,y:e.ty},...e.chain].forEach((to,i)=>{
      ctx.strokeStyle=`rgba(93,104,255,${.25*p})`;ctx.lineWidth=10;ctx.shadowColor="#6e7cff";ctx.shadowBlur=10;jag(from,to,(1-p)*8+i);
      ctx.strokeStyle=`rgba(177,192,255,${.92*p})`;ctx.lineWidth=3;ctx.shadowBlur=4;jag(from,to,(1-p)*8+i);
      ctx.strokeStyle=`rgba(255,255,255,${.9*p})`;ctx.lineWidth=1;jag(from,to,(1-p)*8+i);
      from=to;
    });
  }
  else { ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.tx,e.ty); ctx.stroke(); }
  if (e.text && !["damageText","coin","eliteCoin","bossReward","eliteDefeat","waveClear"].includes(e.type)) { ctx.fillStyle="#fff3bf"; ctx.font="bold 18px Arial"; ctx.fillText(e.text,e.tx-24,e.ty-20); }
  ctx.restore();
}
function jag(a,b,phase=0) {
  const dx=b.x-a.x,dy=b.y-a.y;
  const length=Math.hypot(dx,dy)||1;
  const nx=-dy/length,ny=dx/length;
  ctx.beginPath(); ctx.moveTo(a.x,a.y);
  for (let i=1;i<6;i++) {
    const t=i/6;
    const wobble=Math.sin(i*8.73+phase*2.4)*Math.min(8,length*.06);
    ctx.lineTo(a.x+dx*t+nx*wobble,a.y+dy*t+ny*wobble);
  }
  ctx.lineTo(b.x,b.y); ctx.stroke();
}

function updateAttributeIndicators(bossWarning) {
  const previewWave = state.wave + 1;
  const nextAttr = wavePrimaryAttribute(previewWave);
  const showNext = previewWave <= 30 && nextAttr !== "neutral" && !state.waveActive && !state.choicesOpen && !state.over;
  if (ui.nextAttrHint) {
    ui.nextAttrHint.hidden = !showNext;
    ui.nextAttrHint.classList.toggle("boss", !!bossWarning);
    ui.nextAttrHint.style.borderColor = (ATTRIBUTE_DISPLAY[nextAttr] || ATTRIBUTE_DISPLAY.neutral).color;
    ui.nextAttrHint.style.color = bossWarning ? "#ff5b52" : (ATTRIBUTE_DISPLAY[nextAttr] || ATTRIBUTE_DISPLAY.neutral).color;
    ui.nextAttrHint.setAttribute?.("aria-label", `下一波主要為${ATTRIBUTE_DISPLAY[nextAttr]?.label || "無"}屬性弱點`);
  }
  if (showNext) renderAttributeCanvas(ui.nextAttrCanvas, nextAttr, !!bossWarning);

  const showCurrent = state.wave > 0 && state.currentWaveAttr !== "neutral" && (state.waveActive || state.monsters.length > 0);
  if (ui.waveAttrCanvas) {
    ui.waveAttrCanvas.hidden = !showCurrent;
    ui.waveAttrCanvas.setAttribute?.("aria-label", `本波主要為${ATTRIBUTE_DISPLAY[state.currentWaveAttr]?.label || "無"}屬性弱點`);
  }
  if (showCurrent) renderAttributeCanvas(ui.waveAttrCanvas, state.currentWaveAttr, false);
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
  updateAttributeIndicators(bossWarning);
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
  const readyForNextWave = state.started && state.wave > 0 && !state.over && !state.choicesOpen && !state.waveActive && !state.monsters.length && !state.spawn && state.wallet >= currentBet();
  ui.bet.classList.toggle("ready-next", readyForNextWave);
  ui.bottomUi?.classList.toggle("bet-ready", readyForNextWave);
  ui.message.classList.toggle("bet-ready", readyForNextWave);
  ui.bet.setAttribute?.("aria-label", readyForNextWave ? `繼續第 ${state.wave + 1} 波，BET ${currentBet()}` : `BET ${currentBet()}`);
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
      const icon = document.createElement("img");
      const name = document.createElement("div");
      const info = document.createElement("small");
      const cooldown = document.createElement("div");
      const fill = document.createElement("div");
      icon.className = "slot-icon";
      icon.alt = "";
      name.className = "slot-name";
      cooldown.className = "slot-cd";
      fill.className = "slot-cd-fill";
      cooldown.appendChild(fill);
      root.append(icon, name, info, cooldown);
      ui.slots.appendChild(root);
      slotViews.push({ root, icon, name, info, cooldown, fill });
    }
  }

  for (let i=0;i<3;i++) {
    const t = state.towers[i];
    const view = slotViews[i];
    view.root.className = "slot" + (t ? "" : " empty");
    if (t) {
      const ready = Math.round(cooldownProgress(t) * 100);
      view.root.dataset.attr = towerAttr(t);
      view.icon.hidden = false;
      if (view.icon.dataset.tower !== t.id) {
        view.icon.src = towerIconDataUrl(t);
        view.icon.dataset.tower = t.id;
      }
      view.name.textContent = t.name;
      view.info.textContent = `${t.attr} Lv.${t.level}`;
      view.info.hidden = false;
      view.cooldown.hidden = false;
      view.fill.style.width = `${ready}%`;
    } else {
      delete view.root.dataset.attr;
      view.icon.hidden = true;
      view.icon.removeAttribute?.("src");
      view.icon.dataset.tower = "";
      view.name.textContent = `砲塔槽 ${i+1}`;
      view.info.hidden = true;
      view.cooldown.hidden = true;
    }
  }
}

function updateDebugSnapshot(now = performance.now()) {
  if (now - lastDebugFrame < DEBUG_FRAME_MS) return;
  lastDebugFrame = now;
  const snapshot = JSON.stringify({ build:BUILD_VERSION, wave:state.wave, currentAttr:state.currentWaveAttr, nextAttr:wavePrimaryAttribute(state.wave + 1), hp:state.hp, pot:state.pot, monsters:state.monsters.length, projectiles:state.projectiles.length, zones:state.zones.length, effects:state.effects.length, spawn:!!state.spawn, towers:state.towers.length, collect:canCollect(), upgrade:state.lastUpgradeDebug || null });
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
  playSfx("ui");
  updateUi();
}

ui.betMinus.onclick = () => { if (!state.started) { state.baseBetIndex = Math.max(0,state.baseBetIndex-1); playSfx("ui"); } updateUi(); };
ui.betPlus.onclick = () => { if (!state.started) { state.baseBetIndex = Math.min(BET_STEPS.length-1,state.baseBetIndex+1); playSfx("ui"); } updateUi(); };
ui.bet.onclick = startBet;
ui.collect.onclick = collect;
ui.reset.onclick = () => { playSfx("ui"); reset(); };
ui.sound.onclick = toggleSound;
ui.speed.onclick = toggleSpeed;
ui.newRun.onclick = () => { playSfx("ui"); reset(); };

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

updateSoundButton();
reset();
requestAnimationFrame(loop);
