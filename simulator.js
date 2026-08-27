const PARAM_STORAGE_KEY = "towerDefenseTuningParams.v3";
const PARAM_CHANNEL = "tower-defense-param-sync";
const CONFIG_STORAGE_KEY = "towerDefenseRtpSimulatorConfig.v1";
const PROFILE_STORAGE_KEY = "towerDefenseRtpSimulatorProfiles.v1";
const SNAPSHOT_STORAGE_KEY = "towerDefenseRtpParamSnapshots.v1";
const RESULT_STORAGE_KEY = "towerDefenseRtpResults.v3";
const BET_STEPS = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
const MAX_SAMPLES = 500000;
const TRUSTED_SAMPLES_PER_STRATEGY = 100000;
const TOWER_INFO = {
  flame:{name:"噴火槍",role:"area"}, grenade:{name:"榴彈",role:"area"}, cryo:{name:"急凍狙擊",role:"single"},
  frostbomb:{name:"冰晶炸彈",role:"control"}, laser:{name:"雷射光線",role:"single"}, chain:{name:"閃電鎖鏈",role:"area"},
  gas:{name:"毒氣彈",role:"area"}, needle:{name:"毒針彈",role:"single"}, blade:{name:"旋刃",role:"general"}, trap:{name:"陷阱",role:"control"},
};
const VALIDATION_STRATEGIES = ["balanced", "single", "area", "control", "random"];
const HERO_IDS = ["fire", "ice", "electric", "poison", "neutral"];
const STRATEGY_LABELS = { matrix:"驗證矩陣（5 種策略）", balanced:"平衡策略", single:"單體爆發", area:"群體清場", control:"控場連動", greedy:"高評級優先", random:"完全隨機" };
const COLLECT_LABELS = { fixedWaveMatrix:"第 1–30 波固定收手矩陣", profit:"得分高於總投注時收手", adaptive:"風險報酬判斷", humanConservative:"真人模板｜保守", humanBalanced:"真人模板｜平衡", humanChaser:"真人模板｜追高", humanGreedyChaser:"真人模板｜深追貪心", boss1:"首王後收手", boss2:"第二王後收手", preboss:"危險升高時收手", wave5:"第 5 波收手", wave10:"第 10 波收手", wave20:"第 20 波收手", never:"追到上限或失敗" };
const WALLET_MODE_LABELS = { independent:"獨立場次", continuous:"連續錢包" };

const ui = Object.fromEntries([
  "paramDot","paramStatus","paramMeta","paramSource","refreshParamsBtn","strategy","playerCount","gamesPerPlayer","walletMode","baseBet","startWallet","collectPolicy","maxWave","accuracy","rerollChance","seed","workerCount","sampleTotal","setupHint",
  "runBtn","trustedRunBtn","parityBtn","cancelBtn","profileName","saveProfileBtn","profileSelect","deleteProfileBtn","progressFill","progressText","elapsedText","workerStatus",
  "rtpValue","rtpCi","bossKillValue","bossKillMeta","profitValue","zeroMeta","waveValue","volatilityMeta",
  "copySummaryBtn","copyTabBtn","copyAllBtn","saveResultBtn","resultMeta","overviewBody","validationBody","distributionBody","waveBody","chaseWaveBody","bossBody","buildBody","heroBody","towerBody","upgradeBody",
  "snapshotName","saveSnapshotBtn","exportParamsBtn","importParamsInput","snapshotBody","historyBody","toast","engineFrame"
].map(id => [id, document.getElementById(id)]));

let engine = null;
let liveParams = {};
let liveParamUpdatedAt = null;
let running = false;
let cancelRequested = false;
let currentReport = null;
let currentTab = "overview";
let snapshots = loadList(SNAPSHOT_STORAGE_KEY);
let profiles = loadList(PROFILE_STORAGE_KEY);
let resultHistory = loadList(RESULT_STORAGE_KEY);
let paramChannel = null;
let activeWorkers = [];
let activeParallelCancel = null;

function loadList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function saveList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function pct(value, digits=1) { return Number.isFinite(value) ? `${(value * 100).toFixed(digits)}%` : "--"; }
function mult(value, digits=2) { return Number.isFinite(value) ? `${value.toFixed(digits)}x` : "--"; }
function number(value, digits=0) { return Number.isFinite(value) ? value.toFixed(digits) : "--"; }
function waveBaseHpPct(report, row) {
  const stored = Number(row?.avgHpPct);
  if (Number.isFinite(stored)) return clamp(stored, 0, 1);
  const baseHp = Math.max(1, Number(report?.config?.baseHp) || 1000);
  const samples = Math.max(0, Number(row?.samples) || 0);
  const totalHp = Math.max(0, Number(row?.hp) || (Number(row?.avgHp) || 0) * (Number(row?.clears) || 0));
  return samples ? clamp(totalHp / (samples * baseHp), 0, 1) : 0;
}
function id(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[char]); }
function configuredPoolRtp(params={}) {
  const tiers = Array.from({ length:6 }, (_, index) => {
    const tier = index + 1;
    return {
      multiplier:Math.max(0, Number(params[`mathPoolEntryTier${tier}Mul`]) || 0),
      weight:Math.max(0, Number(params[`mathPoolEntryTier${tier}Weight`]) || 0),
    };
  });
  const totalWeight = tiers.reduce((sum, tier) => sum + tier.weight, 0);
  if (Number(params.mathPoolEnabled) >= .5 && totalWeight > 0) {
    return tiers.reduce((sum, tier) => sum + tier.multiplier * tier.weight, 0) / totalWeight;
  }
  return Math.max(0, Number(params.mathTargetRtp) || 0);
}

function stableParamString(params) {
  return Object.keys(params || {}).sort().map(key => `${key}:${Number(params[key])}`).join("|");
}

function paramHash(params) {
  const text = stableParamString(params);
  let hash = 2166136261;
  for (let i=0;i<text.length;i+=1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function selectedParamRecord() {
  if (ui.paramSource.value === "live") return { name:"即時參數", params:liveParams, updatedAt:liveParamUpdatedAt };
  const snapshot = snapshots.find(item => item.id === ui.paramSource.value);
  const snapshotParams = snapshot && engine?.normalizeParams ? engine.normalizeParams(snapshot.params) : snapshot?.params;
  return snapshot ? { name:snapshot.name, params:snapshotParams, updatedAt:snapshot.createdAt } : { name:"即時參數", params:liveParams, updatedAt:liveParamUpdatedAt };
}

function refreshParamSources() {
  const selected = ui.paramSource.value || "live";
  ui.paramSource.innerHTML = `<option value="live">即時參數</option>${snapshots.map(snapshot => `<option value="${escapeHtml(snapshot.id)}">快照｜${escapeHtml(snapshot.name)}</option>`).join("")}`;
  ui.paramSource.value = selected === "live" || snapshots.some(item => item.id === selected) ? selected : "live";
  renderParamStatus();
}

function renderParamStatus(changed=false) {
  const source = selectedParamRecord();
  const params = source.params || {};
  const count = Object.keys(params).length;
  const hash = count ? paramHash(params) : "--------";
  const revision = params.balanceRevision ?? "--";
  const time = source.updatedAt ? new Date(source.updatedAt).toLocaleString() : "尚未同步";
  ui.paramStatus.textContent = count ? (ui.paramSource.value === "live" ? "已連接調參工具" : `使用快照：${source.name}`) : "尚未取得參數";
  ui.paramMeta.textContent = `v${revision} · ${count} 項 · ${hash} · ${time}`;
  ui.paramDot.className = `status-dot ${changed ? "changed" : count ? "ready" : ""}`;
  if (currentReport && currentReport.paramHash !== hash) {
    ui.paramStatus.textContent += "｜目前報表使用舊參數";
    ui.paramDot.className = "status-dot changed";
  }
}

function receiveLiveParams(values) {
  if (!values || typeof values !== "object") return;
  liveParams = engine?.normalizeParams ? engine.normalizeParams(values) : clone(values);
  liveParamUpdatedAt = new Date().toISOString();
  if (engine && !running) engine.setParams(liveParams);
  renderParamStatus(!!currentReport && ui.paramSource.value === "live" && currentReport.paramHash !== paramHash(liveParams));
  showToast("已收到調參工具的新數值，下一次模擬會使用新參數。", false, 2800);
}

function readLiveParams() {
  try {
    const stored = JSON.parse(localStorage.getItem(PARAM_STORAGE_KEY) || "{}");
    if (Object.keys(stored).length) receiveLiveParams(stored);
    else if (engine) receiveLiveParams(engine.params());
  } catch {
    if (engine) receiveLiveParams(engine.params());
  }
}

function waitForEngine() {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      try {
        const candidate = ui.engineFrame.contentWindow?.__tdHeadless;
        if (candidate?.ready) { engine = candidate; resolve(candidate); return; }
      } catch {}
      if (Date.now() - started > 12000) { reject(new Error("戰鬥引擎載入逾時")); return; }
      window.setTimeout(check, 50);
    };
    check();
  });
}

function readConfig() {
  return {
    strategy:ui.strategy.value,
    playerCount:clamp(Math.round(Number(ui.playerCount.value) || 1),1,100000),
    gamesPerPlayer:clamp(Math.round(Number(ui.gamesPerPlayer.value) || 1),1,10000),
    walletMode:WALLET_MODE_LABELS[ui.walletMode.value] ? ui.walletMode.value : "independent",
    baseBet:Number(ui.baseBet.value) || 100,
    startWallet:Math.max(1,Math.round(Number(ui.startWallet.value) || 10000)),
    collectPolicy:ui.collectPolicy.value,
    maxWave:clamp(Math.round(Number(ui.maxWave.value) || 30),1,30),
    accuracy:clamp(Number(ui.accuracy.value),0,1),
    rerollChance:clamp(Number(ui.rerollChance.value),0,1),
    seed:(Number(ui.seed.value) >>> 0) || 1000003,
    workerCount:ui.workerCount.value || "auto",
  };
}

function writeConfig(config) {
  if (!config.walletMode) ui.walletMode.value = "independent";
  ["strategy","playerCount","gamesPerPlayer","walletMode","baseBet","startWallet","collectPolicy","maxWave","accuracy","rerollChance","seed","workerCount"].forEach(key => {
    if (config[key] !== undefined && ui[key]) ui[key].value = String(config[key]);
  });
  updateSampleTotal();
}

function saveCurrentConfig() {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(readConfig()));
}

function loadCurrentConfig() {
  try {
    const config = JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY) || "{}");
    writeConfig({...config,maxWave:30});
  } catch {}
}

function logicalCoreCount() {
  return clamp(Math.round(Number(navigator.hardwareConcurrency) || 4),1,64);
}

function automaticWorkerCount() {
  return clamp(logicalCoreCount() - 1,1,8);
}

function selectedWorkerCount() {
  if (typeof Worker === "undefined") return 1;
  if (ui.workerCount.value === "auto") return automaticWorkerCount();
  return clamp(Math.round(Number(ui.workerCount.value) || 1),1,16);
}

function renderWorkerStatus(message="") {
  if (!ui.workerStatus || !ui.workerCount) return;
  const workers = selectedWorkerCount();
  const detected = logicalCoreCount();
  ui.workerStatus.textContent = message || (workers > 1
    ? `本機多核心：${workers} 執行緒（偵測 ${detected} 邏輯核心）`
    : `單執行緒精度基準（偵測 ${detected} 邏輯核心）`);
}

function updateSampleTotal() {
  const config = readConfig();
  const strategyCount = config.strategy === "matrix" ? VALIDATION_STRATEGIES.length : 1;
  const total = config.playerCount * config.gamesPerPlayer * strategyCount;
  ui.sampleTotal.textContent = `${total.toLocaleString()} 場`;
  ui.setupHint.textContent = config.strategy === "matrix"
    ? total >= MAX_SAMPLES
      ? `正式驗證：完整 30 波，${VALIDATION_STRATEGIES.length} 種策略各 ${TRUSTED_SAMPLES_PER_STRATEGY.toLocaleString()} 場；使用 ${selectedWorkerCount()} 個本機執行緒，請保持頁面開啟。`
      : `固定同一 Collect 策略，以 ${selectedWorkerCount()} 個本機執行緒比較 ${VALIDATION_STRATEGIES.length} 種合理策略。`
    : config.walletMode === "continuous"
      ? "同一玩家會繼承上一場錢包，適合觀察破產率與資金續航。"
      : "每場都以起始錢包重新開局，適合驗證正式 RTP 與玩法差異。";
  ui.sampleTotal.className = total > MAX_SAMPLES ? "value-bad" : "";
  renderWorkerStatus();
  saveCurrentConfig();
}

function runOne(config, playerWallet, seed) {
  return window.TDSimCore.runOne(engine, config, playerWallet, seed);
}

function percentile(sorted, q) {
  if (!sorted.length) return 0;
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function aggregateRuns(rows) {
  const bets = rows.reduce((sum,row) => sum + row.bets, 0);
  const payout = rows.reduce((sum,row) => sum + row.payout, 0);
  const payoutSq = rows.reduce((sum,row) => sum + row.payout ** 2, 0);
  const betSq = rows.reduce((sum,row) => sum + row.bets ** 2, 0);
  const payoutBet = rows.reduce((sum,row) => sum + row.payout * row.bets, 0);
  const rtp = bets ? payout / bets : 0;
  const meanBet = rows.length ? bets / rows.length : 0;
  const residuals = rows.map(row => row.payout - rtp * row.bets);
  const residualMean = residuals.reduce((sum,value) => sum + value, 0) / Math.max(1, residuals.length);
  const residualVariance = residuals.length > 1
    ? residuals.reduce((sum,value) => sum + (value - residualMean) ** 2, 0) / (residuals.length - 1)
    : 0;
  const ci95 = rows.length && meanBet ? 1.96 * Math.sqrt(residualVariance / rows.length) / meanBet : 0;
  const spawned = rows.reduce((sum,row) => sum + row.bossEvents.length, 0);
  const killed = rows.reduce((sum,row) => sum + row.bossEvents.filter(event => event.killed).length, 0);
  const modelBossChance = spawned
    ? rows.reduce((sum,row) => sum + row.bossEvents.reduce((eventSum,event) => eventSum + (Number(event.modelClearChance) || 0),0),0) / spawned
    : 0;
  const modelBossBuildPower = spawned
    ? rows.reduce((sum,row) => sum + row.bossEvents.reduce((eventSum,event) => eventSum + (Number(event.modelBuildPower) || 0),0),0) / spawned
    : 0;
  const minionRecords = rows.flatMap(row => (row.waveRecords || []).filter(record => !record.boss));
  const minionAttempts = minionRecords.length;
  const minionClearRate = minionAttempts ? minionRecords.filter(record => record.cleared).length / minionAttempts : 0;
  const modelMinionChance = minionAttempts ? minionRecords.reduce((sum,record) => sum + (Number(record.modelClearChance) || 0),0) / minionAttempts : 0;
  const modelMinionBuildPower = minionAttempts ? minionRecords.reduce((sum,record) => sum + (Number(record.modelBuildPower) || 0),0) / minionAttempts : 0;
  const mathPoolContribution = rows.reduce((sum,row) => sum + (Number(row.mathPoolContribution) || 0), 0);
  const mathPoolCapHits = rows.reduce((sum,row) => sum + (Number(row.mathPoolCapHits) || 0), 0);
  const mathPoolRecycled = rows.reduce((sum,row) => sum + (Number(row.mathPoolRecycled) || 0), 0);
  const rerollSpent = rows.reduce((sum,row) => sum + (Number(row.rerollSpent) || 0), 0);
  const mathPoolMaxInvariantError = rows.reduce((max,row) => Math.max(max,Math.abs(Number(row.mathPoolInvariantError) || 0)),0);
  const payoutMismatchCount = rows.filter(row => Math.abs(Number(row.payoutMismatch) || 0) > 1e-6).length;
  const payoutMismatchTotal = rows.reduce((sum,row) => sum + (Number(row.payoutMismatch) || 0),0);
  const payoutMismatchMax = rows.reduce((max,row) => Math.max(max,Math.abs(Number(row.payoutMismatch) || 0)),0);
  const returns = rows.map(row => row.bets ? row.payout/row.bets : 0).sort((a,b) => a-b);
  const closingRows = rows.filter(row => row.personalPoolClosing);
  const mathPoolOperatorAdvance = closingRows.reduce((sum,row) => sum + (Number(row.mathPoolOperatorAdvance) || 0), 0);
  const returnDistribution = [
    ["0x",value => value === 0],["0-0.5x",value => value > 0 && value < .5],
    ["0.5-1x",value => value >= .5 && value < 1],["1x 保本",value => value === 1],
    ["1-1.2x",value => value > 1 && value < 1.2],
    ["1.2-1.5x",value => value >= 1.2 && value < 1.5],["1.5-2x",value => value >= 1.5 && value < 2],
    ["2-3x",value => value >= 2 && value < 3],["3-5x",value => value >= 3 && value < 5],
    ["5-10x",value => value >= 5 && value < 10],
    ["10-20x",value => value >= 10 && value < 20],["20-50x",value => value >= 20 && value < 50],
    ["50x+",value => value >= 50],
  ].map(([label,test]) => {
    const count = returns.filter(test).length;
    return {label,count,rate:rows.length ? count/rows.length : 0};
  });
  return {
    samples:rows.length, bets, payout, payoutSq, betSq, payoutBet, rtp, ci95,
    mathPoolContribution, mathPoolCapHits, mathPoolRecycled, mathPoolOperatorAdvance, rerollSpent, mathPoolMaxInvariantError,
    payoutMismatchCount, payoutMismatchTotal, payoutMismatchMax,
    personalPools:closingRows.length,
    mathPoolSeedTotal:closingRows.reduce((sum,row) => sum+(Number(row.mathPoolSeed)||0),0),
    mathPoolClosingAvailable:closingRows.reduce((sum,row) => sum+(Number(row.mathPoolAvailable)||0),0),
    mathPoolClosingReserved:closingRows.reduce((sum,row) => sum+(Number(row.mathPoolReserved)||0),0),
    mathPoolClosingContributed:closingRows.reduce((sum,row) => sum+(Number(row.mathPoolContributed)||0),0),
    mathPoolClosingPaid:closingRows.reduce((sum,row) => sum+(Number(row.mathPoolPaid)||0),0),
    allocatedRtp:bets ? closingRows.reduce((sum,row) => sum+(Number(row.mathPoolPaid)||0)+(Number(row.mathPoolAvailable)||0)+(Number(row.mathPoolReserved)||0)-(Number(row.mathPoolSeed)||0)-(Number(row.mathPoolOperatorAdvance)||0),0)/bets : 0,
    closingLiabilityRtp:bets ? closingRows.reduce((sum,row) => sum+(Number(row.mathPoolAvailable)||0)+(Number(row.mathPoolReserved)||0),0)/bets : 0,
    returnDistribution,
    breakEvenRate:rows.length ? returns.filter(value => value === 1).length/rows.length : 0,
    meaningfulWinRate:rows.length ? returns.filter(value => value >= 1.5).length/rows.length : 0,
    win2xRate:rows.length ? returns.filter(value => value >= 2).length/rows.length : 0,
    win5xRate:rows.length ? returns.filter(value => value >= 5).length/rows.length : 0,
    win10xRate:rows.length ? returns.filter(value => value >= 10).length/rows.length : 0,
    win20xRate:rows.length ? returns.filter(value => value >= 20).length/rows.length : 0,
    win50xRate:rows.length ? returns.filter(value => value >= 50).length/rows.length : 0,
    avgWave:rows.length ? rows.reduce((sum,row) => sum + row.wave, 0) / rows.length : 0,
    bossKillRate:spawned ? killed / spawned : 0, modelBossChance, modelBossBuildPower,
    minionClearRate, modelMinionChance, modelMinionBuildPower,
    profitRate:rows.length ? rows.filter(row => row.payout > row.bets).length / rows.length : 0,
  };
}

function buildChaseAnalysis(rows, maxWave=30) {
  const waves = Array.from({length:maxWave},(_,index) => ({
    wave:index+1,clears:0,checkpointPayout:0,checkpointBet:0,
    profitStates:0,x2States:0,x5States:0,
    continuedProfit:0,continued2x:0,continued5x:0,
    diedAfterProfit:0,diedAfter2x:0,diedAfter5x:0,checkpointMax:0,
    twoXTransitions:0,twoXNextClears:0,twoXNextDeaths:0,twoXUp:0,twoXFlat:0,twoXDown:0,twoXRetained:0,
    twoXProfitUp:0,twoXProfitFlat:0,twoXProfitDown:0,
    twoXStartRatio:0,twoXNextRatio:0,twoXStartBet:0,twoXNextBet:0,twoXStartPayout:0,twoXNextPayout:0,
  }));
  let hadProfit=0,had2x=0,had5x=0,diedAfterProfit=0,diedAfter2x=0,diedAfter5x=0;
  let deepReached=0,deepTerminal=0,deepPeak2x=0,deepPeak5x=0,deepFinal2x=0,deepFinal5x=0;
  let peakReturnSum=0,peakReturnMax=0,peakWaveSum=0,lostPeakPayout=0;
  let twoXTransitions=0,twoXNextClears=0,twoXNextDeaths=0,twoXUp=0,twoXFlat=0,twoXDown=0,twoXRetained=0;
  let twoXProfitUp=0,twoXProfitFlat=0,twoXProfitDown=0;
  let twoXStartRatio=0,twoXNextRatio=0,twoXStartBet=0,twoXNextBet=0,twoXStartPayout=0,twoXNextPayout=0;
  let wave6TwoX=0,wave6Continued=0,wave6FinalDeaths=0,wave6Final2x=0,wave6StartProfit=0,wave6FinalProfit=0;
  rows.forEach(row => {
    const allRecords = (row.waveRecords || []).filter(record => record.finished && record.cumulativeBet > 0);
    const recordMap = new Map(allRecords.map(record => [record.wave,record]));
    const records = allRecords.filter(record => record.cleared);
    let peakReturn=0,peakPayout=0,peakWave=0;
    let runHadProfit=false,runHad2x=false,runHad5x=false,runDeep2x=false,runDeep5x=false;
    records.forEach(record => {
      const ratio = Math.max(0,Number(record.payout)||0) / Math.max(1,Number(record.cumulativeBet)||0);
      if (ratio > peakReturn) {
        peakReturn = ratio;
        peakPayout = Math.max(0,Number(record.payout)||0);
        peakWave = record.wave;
      }
      runHadProfit ||= ratio > 1;
      runHad2x ||= ratio >= 2;
      runHad5x ||= ratio >= 5;
      runDeep2x ||= record.wave >= 6 && ratio >= 2;
      runDeep5x ||= record.wave >= 6 && ratio >= 5;
      const item = waves[record.wave-1];
      if (!item) return;
      const continued = Number(row.wave) > record.wave;
      const laterDeath = continued && Number(row.payout) === 0;
      item.clears += 1;
      item.checkpointPayout += Math.max(0,Number(record.payout)||0);
      item.checkpointBet += Math.max(0,Number(record.cumulativeBet)||0);
      item.checkpointMax = Math.max(item.checkpointMax,ratio);
      item.profitStates += ratio > 1 ? 1 : 0;
      item.x2States += ratio >= 2 ? 1 : 0;
      item.x5States += ratio >= 5 ? 1 : 0;
      item.continuedProfit += continued && ratio > 1 ? 1 : 0;
      item.continued2x += continued && ratio >= 2 ? 1 : 0;
      item.continued5x += continued && ratio >= 5 ? 1 : 0;
      item.diedAfterProfit += laterDeath && ratio > 1 ? 1 : 0;
      item.diedAfter2x += laterDeath && ratio >= 2 ? 1 : 0;
      item.diedAfter5x += laterDeath && ratio >= 5 ? 1 : 0;
    });
    records.filter(record => record.wave >= 6).forEach(record => {
      const startBet = Math.max(1,Number(record.cumulativeBet)||0);
      const startPayout = Math.max(0,Number(record.payout)||0);
      const startRatio = startPayout/startBet;
      if (startRatio < 2) return;
      const next = recordMap.get(record.wave+1);
      if (!next) return;
      const item = waves[record.wave-1];
      twoXTransitions += 1;
      twoXStartRatio += startRatio;
      twoXStartBet += startBet;
      twoXStartPayout += startPayout;
      if (item) {
        item.twoXTransitions += 1;
        item.twoXStartRatio += startRatio;
        item.twoXStartBet += startBet;
        item.twoXStartPayout += startPayout;
      }
      if (!next.cleared) {
        twoXNextDeaths += 1;
        if (item) item.twoXNextDeaths += 1;
        return;
      }
      const nextBet = Math.max(1,Number(next.cumulativeBet)||0);
      const nextPayout = Math.max(0,Number(next.payout)||0);
      const nextRatio = nextPayout/nextBet;
      const delta = nextRatio-startRatio;
      const ratioBand = Math.max(.15,startRatio*.15);
      const profitDelta = (nextPayout-nextBet)-(startPayout-startBet);
      twoXNextClears += 1;
      twoXNextRatio += nextRatio;
      twoXNextBet += nextBet;
      twoXNextPayout += nextPayout;
      twoXRetained += nextRatio >= 2 ? 1 : 0;
      if (delta > ratioBand) twoXUp += 1;
      else if (delta < -ratioBand) twoXDown += 1;
      else twoXFlat += 1;
      if (profitDelta > 0) twoXProfitUp += 1;
      else if (profitDelta < 0) twoXProfitDown += 1;
      else twoXProfitFlat += 1;
      if (item) {
        item.twoXNextClears += 1;
        item.twoXNextRatio += nextRatio;
        item.twoXNextBet += nextBet;
        item.twoXNextPayout += nextPayout;
        item.twoXRetained += nextRatio >= 2 ? 1 : 0;
        if (delta > ratioBand) item.twoXUp += 1;
        else if (delta < -ratioBand) item.twoXDown += 1;
        else item.twoXFlat += 1;
        if (profitDelta > 0) item.twoXProfitUp += 1;
        else if (profitDelta < 0) item.twoXProfitDown += 1;
        else item.twoXProfitFlat += 1;
      }
    });
    const wave6 = recordMap.get(6);
    if (wave6?.cleared) {
      const startBet = Math.max(1,Number(wave6.cumulativeBet)||0);
      const startPayout = Math.max(0,Number(wave6.payout)||0);
      if (startPayout/startBet >= 2) {
        wave6TwoX += 1;
        wave6StartProfit += startPayout-startBet;
        if (recordMap.has(7)) wave6Continued += 1;
        const finalRatio = Number(row.bets) > 0 ? Math.max(0,Number(row.payout)||0)/Number(row.bets) : 0;
        wave6FinalDeaths += Number(row.payout) === 0 ? 1 : 0;
        wave6Final2x += finalRatio >= 2 ? 1 : 0;
        wave6FinalProfit += Math.max(0,Number(row.payout)||0)-Math.max(0,Number(row.bets)||0);
      }
    }
    const finalReturn = row.bets ? row.payout/row.bets : 0;
    hadProfit += runHadProfit ? 1 : 0;
    had2x += runHad2x ? 1 : 0;
    had5x += runHad5x ? 1 : 0;
    deepReached += records.some(record => record.wave >= 6) ? 1 : 0;
    deepTerminal += row.wave >= 6 ? 1 : 0;
    deepPeak2x += runDeep2x ? 1 : 0;
    deepPeak5x += runDeep5x ? 1 : 0;
    deepFinal2x += row.wave >= 6 && finalReturn >= 2 ? 1 : 0;
    deepFinal5x += row.wave >= 6 && finalReturn >= 5 ? 1 : 0;
    const lost = Number(row.payout) === 0;
    diedAfterProfit += lost && runHadProfit ? 1 : 0;
    diedAfter2x += lost && runHad2x ? 1 : 0;
    diedAfter5x += lost && runHad5x ? 1 : 0;
    if (lost) lostPeakPayout += peakPayout;
    peakReturnSum += peakReturn;
    peakReturnMax = Math.max(peakReturnMax,peakReturn);
    peakWaveSum += peakWave;
  });
  const samples = rows.length;
  return {
    summary:{
      samples,hadProfitRate:samples?hadProfit/samples:0,had2xRate:samples?had2x/samples:0,had5xRate:samples?had5x/samples:0,
      diedAfterProfitRate:samples?diedAfterProfit/samples:0,diedAfter2xRate:samples?diedAfter2x/samples:0,diedAfter5xRate:samples?diedAfter5x/samples:0,
      profitRiskDeathRate:hadProfit?diedAfterProfit/hadProfit:0,twoXRiskDeathRate:had2x?diedAfter2x/had2x:0,
      deepReachedCount:deepReached,deepTerminalCount:deepTerminal,
      deepReachRate:samples?deepReached/samples:0,deepTerminalRate:samples?deepTerminal/samples:0,
      deepPeak2xRate:samples?deepPeak2x/samples:0,deepPeak5xRate:samples?deepPeak5x/samples:0,
      deepFinal2xRate:samples?deepFinal2x/samples:0,deepFinal5xRate:samples?deepFinal5x/samples:0,
      deepPeak2xConditionalRate:deepReached?deepPeak2x/deepReached:0,deepPeak5xConditionalRate:deepReached?deepPeak5x/deepReached:0,
      deepFinal2xConditionalRate:deepTerminal?deepFinal2x/deepTerminal:0,deepFinal5xConditionalRate:deepTerminal?deepFinal5x/deepTerminal:0,
      avgPeakReturn:samples?peakReturnSum/samples:0,peakReturnMax,avgPeakWave:samples?peakWaveSum/samples:0,lostPeakPayout,
      twoXTransitionCount:twoXTransitions,
      twoXNextClearCount:twoXNextClears,twoXNextDeathCount:twoXNextDeaths,
      twoXRetainedCount:twoXRetained,twoXUpCount:twoXUp,twoXFlatCount:twoXFlat,twoXDownCount:twoXDown,
      twoXProfitUpCount:twoXProfitUp,twoXProfitFlatCount:twoXProfitFlat,twoXProfitDownCount:twoXProfitDown,
      twoXStartRatioSum:twoXStartRatio,twoXNextRatioSum:twoXNextRatio,
      twoXStartBetSum:twoXStartBet,twoXNextBetSum:twoXNextBet,
      twoXStartPayoutSum:twoXStartPayout,twoXNextPayoutSum:twoXNextPayout,
      twoXNextClearRate:twoXTransitions?twoXNextClears/twoXTransitions:0,
      twoXNextDeathRate:twoXTransitions?twoXNextDeaths/twoXTransitions:0,
      twoXRetainRate:twoXNextClears?twoXRetained/twoXNextClears:0,
      twoXUpRate:twoXNextClears?twoXUp/twoXNextClears:0,
      twoXFlatRate:twoXNextClears?twoXFlat/twoXNextClears:0,
      twoXDownRate:twoXNextClears?twoXDown/twoXNextClears:0,
      twoXProfitUpRate:twoXNextClears?twoXProfitUp/twoXNextClears:0,
      twoXProfitFlatRate:twoXNextClears?twoXProfitFlat/twoXNextClears:0,
      twoXProfitDownRate:twoXNextClears?twoXProfitDown/twoXNextClears:0,
      twoXAvgStartRatio:twoXTransitions?twoXStartRatio/twoXTransitions:0,
      twoXAvgNextRatio:twoXNextClears?twoXNextRatio/twoXNextClears:0,
      twoXAvgStartProfit:twoXTransitions?(twoXStartPayout-twoXStartBet)/twoXTransitions:0,
      twoXAvgNextProfit:twoXNextClears?(twoXNextPayout-twoXNextBet)/twoXNextClears:0,
      wave6TwoXCount:wave6TwoX,
      wave6ContinuedCount:wave6Continued,wave6FinalDeathCount:wave6FinalDeaths,wave6Final2xCount:wave6Final2x,
      wave6StartProfitSum:wave6StartProfit,wave6FinalProfitSum:wave6FinalProfit,
      wave6ContinueRate:wave6TwoX?wave6Continued/wave6TwoX:0,
      wave6FinalDeathRate:wave6TwoX?wave6FinalDeaths/wave6TwoX:0,
      wave6Final2xRate:wave6TwoX?wave6Final2x/wave6TwoX:0,
      wave6AvgProfitGrowth:wave6TwoX?(wave6FinalProfit-wave6StartProfit)/wave6TwoX:0,
    },
    waves:waves.map(item => ({
      ...item,
      checkpointRtp:item.checkpointBet?item.checkpointPayout/item.checkpointBet:0,
      profitStateRate:item.clears?item.profitStates/item.clears:0,
      x2StateRate:item.clears?item.x2States/item.clears:0,
      x5StateRate:item.clears?item.x5States/item.clears:0,
      continueAfterProfitRate:item.profitStates?item.continuedProfit/item.profitStates:0,
      continueAfter2xRate:item.x2States?item.continued2x/item.x2States:0,
      deathAfterProfitRiskRate:item.continuedProfit?item.diedAfterProfit/item.continuedProfit:0,
      deathAfter2xRiskRate:item.continued2x?item.diedAfter2x/item.continued2x:0,
      twoXNextClearRate:item.twoXTransitions?item.twoXNextClears/item.twoXTransitions:0,
      twoXNextDeathRate:item.twoXTransitions?item.twoXNextDeaths/item.twoXTransitions:0,
      twoXRetainRate:item.twoXNextClears?item.twoXRetained/item.twoXNextClears:0,
      twoXUpRate:item.twoXNextClears?item.twoXUp/item.twoXNextClears:0,
      twoXFlatRate:item.twoXNextClears?item.twoXFlat/item.twoXNextClears:0,
      twoXDownRate:item.twoXNextClears?item.twoXDown/item.twoXNextClears:0,
      twoXProfitUpRate:item.twoXNextClears?item.twoXProfitUp/item.twoXNextClears:0,
      twoXProfitFlatRate:item.twoXNextClears?item.twoXProfitFlat/item.twoXNextClears:0,
      twoXProfitDownRate:item.twoXNextClears?item.twoXProfitDown/item.twoXNextClears:0,
      twoXAvgStartRatio:item.twoXTransitions?item.twoXStartRatio/item.twoXTransitions:0,
      twoXAvgNextRatio:item.twoXNextClears?item.twoXNextRatio/item.twoXNextClears:0,
      twoXAvgStartProfit:item.twoXTransitions?(item.twoXStartPayout-item.twoXStartBet)/item.twoXTransitions:0,
      twoXAvgNextProfit:item.twoXNextClears?(item.twoXNextPayout-item.twoXNextBet)/item.twoXNextClears:0,
    })),
  };
}

function mergeChaseReports(reports, samples) {
  const waveMap = new Map();
  reports.forEach(report => (report.chase?.waves || []).forEach(row => {
    const item = waveMap.get(row.wave) || {
      wave:row.wave,clears:0,checkpointPayout:0,checkpointBet:0,
      profitStates:0,x2States:0,x5States:0,continuedProfit:0,continued2x:0,continued5x:0,
      diedAfterProfit:0,diedAfter2x:0,diedAfter5x:0,checkpointMax:0,
      twoXTransitions:0,twoXNextClears:0,twoXNextDeaths:0,twoXUp:0,twoXFlat:0,twoXDown:0,twoXRetained:0,
      twoXProfitUp:0,twoXProfitFlat:0,twoXProfitDown:0,
      twoXStartRatio:0,twoXNextRatio:0,twoXStartBet:0,twoXNextBet:0,twoXStartPayout:0,twoXNextPayout:0,
    };
    ["clears","checkpointPayout","checkpointBet","profitStates","x2States","x5States","continuedProfit","continued2x","continued5x","diedAfterProfit","diedAfter2x","diedAfter5x",
      "twoXTransitions","twoXNextClears","twoXNextDeaths","twoXUp","twoXFlat","twoXDown","twoXRetained","twoXProfitUp","twoXProfitFlat","twoXProfitDown","twoXStartRatio","twoXNextRatio","twoXStartBet","twoXNextBet","twoXStartPayout","twoXNextPayout"]
      .forEach(key => { item[key] += Number(row[key]) || 0; });
    item.checkpointMax = Math.max(item.checkpointMax,Number(row.checkpointMax)||0);
    waveMap.set(row.wave,item);
  }));
  const weighted = key => reports.reduce((sum,report) => sum+(Number(report.chase?.summary?.[key])||0)*report.completedSamples,0);
  const summary = {
    samples,
    hadProfitRate:samples?weighted("hadProfitRate")/samples:0,had2xRate:samples?weighted("had2xRate")/samples:0,had5xRate:samples?weighted("had5xRate")/samples:0,
    diedAfterProfitRate:samples?weighted("diedAfterProfitRate")/samples:0,diedAfter2xRate:samples?weighted("diedAfter2xRate")/samples:0,diedAfter5xRate:samples?weighted("diedAfter5xRate")/samples:0,
    deepPeak2xRate:samples?weighted("deepPeak2xRate")/samples:0,deepPeak5xRate:samples?weighted("deepPeak5xRate")/samples:0,
    deepFinal2xRate:samples?weighted("deepFinal2xRate")/samples:0,deepFinal5xRate:samples?weighted("deepFinal5xRate")/samples:0,
    avgPeakReturn:samples?weighted("avgPeakReturn")/samples:0,avgPeakWave:samples?weighted("avgPeakWave")/samples:0,
    peakReturnMax:reports.reduce((max,report)=>Math.max(max,Number(report.chase?.summary?.peakReturnMax)||0),0),
    lostPeakPayout:reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.lostPeakPayout)||0),0),
  };
  summary.deepReachedCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.deepReachedCount)||0),0);
  summary.deepTerminalCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.deepTerminalCount)||0),0);
  summary.deepReachRate = samples ? summary.deepReachedCount/samples : 0;
  summary.deepTerminalRate = samples ? summary.deepTerminalCount/samples : 0;
  summary.deepPeak2xConditionalRate = summary.deepReachedCount ? summary.deepPeak2xRate*samples/summary.deepReachedCount : 0;
  summary.deepPeak5xConditionalRate = summary.deepReachedCount ? summary.deepPeak5xRate*samples/summary.deepReachedCount : 0;
  summary.deepFinal2xConditionalRate = summary.deepTerminalCount ? summary.deepFinal2xRate*samples/summary.deepTerminalCount : 0;
  summary.deepFinal5xConditionalRate = summary.deepTerminalCount ? summary.deepFinal5xRate*samples/summary.deepTerminalCount : 0;
  summary.profitRiskDeathRate = summary.hadProfitRate ? summary.diedAfterProfitRate/summary.hadProfitRate : 0;
  summary.twoXRiskDeathRate = summary.had2xRate ? summary.diedAfter2xRate/summary.had2xRate : 0;
  summary.twoXTransitionCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXTransitionCount)||0),0);
  summary.twoXNextClearCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXNextClearCount)||0),0);
  summary.twoXNextDeathCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXNextDeathCount)||0),0);
  summary.twoXRetainedCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXRetainedCount)||0),0);
  summary.twoXUpCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXUpCount)||0),0);
  summary.twoXFlatCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXFlatCount)||0),0);
  summary.twoXDownCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXDownCount)||0),0);
  summary.twoXProfitUpCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXProfitUpCount)||0),0);
  summary.twoXProfitFlatCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXProfitFlatCount)||0),0);
  summary.twoXProfitDownCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXProfitDownCount)||0),0);
  summary.twoXStartRatioSum = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXStartRatioSum)||0),0);
  summary.twoXNextRatioSum = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXNextRatioSum)||0),0);
  summary.twoXStartBetSum = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXStartBetSum)||0),0);
  summary.twoXNextBetSum = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXNextBetSum)||0),0);
  summary.twoXStartPayoutSum = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXStartPayoutSum)||0),0);
  summary.twoXNextPayoutSum = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.twoXNextPayoutSum)||0),0);
  summary.twoXNextClearRate = summary.twoXTransitionCount ? summary.twoXNextClearCount/summary.twoXTransitionCount : 0;
  summary.twoXNextDeathRate = summary.twoXTransitionCount ? summary.twoXNextDeathCount/summary.twoXTransitionCount : 0;
  summary.twoXRetainRate = summary.twoXNextClearCount ? summary.twoXRetainedCount/summary.twoXNextClearCount : 0;
  summary.twoXUpRate = summary.twoXNextClearCount ? summary.twoXUpCount/summary.twoXNextClearCount : 0;
  summary.twoXFlatRate = summary.twoXNextClearCount ? summary.twoXFlatCount/summary.twoXNextClearCount : 0;
  summary.twoXDownRate = summary.twoXNextClearCount ? summary.twoXDownCount/summary.twoXNextClearCount : 0;
  summary.twoXProfitUpRate = summary.twoXNextClearCount ? summary.twoXProfitUpCount/summary.twoXNextClearCount : 0;
  summary.twoXProfitFlatRate = summary.twoXNextClearCount ? summary.twoXProfitFlatCount/summary.twoXNextClearCount : 0;
  summary.twoXProfitDownRate = summary.twoXNextClearCount ? summary.twoXProfitDownCount/summary.twoXNextClearCount : 0;
  summary.twoXAvgStartRatio = summary.twoXTransitionCount ? summary.twoXStartRatioSum/summary.twoXTransitionCount : 0;
  summary.twoXAvgNextRatio = summary.twoXNextClearCount ? summary.twoXNextRatioSum/summary.twoXNextClearCount : 0;
  summary.twoXAvgStartProfit = summary.twoXTransitionCount ? (summary.twoXStartPayoutSum-summary.twoXStartBetSum)/summary.twoXTransitionCount : 0;
  summary.twoXAvgNextProfit = summary.twoXNextClearCount ? (summary.twoXNextPayoutSum-summary.twoXNextBetSum)/summary.twoXNextClearCount : 0;
  summary.wave6TwoXCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.wave6TwoXCount)||0),0);
  summary.wave6ContinuedCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.wave6ContinuedCount)||0),0);
  summary.wave6FinalDeathCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.wave6FinalDeathCount)||0),0);
  summary.wave6Final2xCount = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.wave6Final2xCount)||0),0);
  summary.wave6StartProfitSum = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.wave6StartProfitSum)||0),0);
  summary.wave6FinalProfitSum = reports.reduce((sum,report)=>sum+(Number(report.chase?.summary?.wave6FinalProfitSum)||0),0);
  summary.wave6ContinueRate = summary.wave6TwoXCount ? summary.wave6ContinuedCount/summary.wave6TwoXCount : 0;
  summary.wave6FinalDeathRate = summary.wave6TwoXCount ? summary.wave6FinalDeathCount/summary.wave6TwoXCount : 0;
  summary.wave6Final2xRate = summary.wave6TwoXCount ? summary.wave6Final2xCount/summary.wave6TwoXCount : 0;
  summary.wave6AvgProfitGrowth = summary.wave6TwoXCount ? (summary.wave6FinalProfitSum-summary.wave6StartProfitSum)/summary.wave6TwoXCount : 0;
  return {summary,waves:[...waveMap.values()].sort((a,b)=>a.wave-b.wave).map(item=>({
    ...item,checkpointRtp:item.checkpointBet?item.checkpointPayout/item.checkpointBet:0,
    profitStateRate:item.clears?item.profitStates/item.clears:0,x2StateRate:item.clears?item.x2States/item.clears:0,x5StateRate:item.clears?item.x5States/item.clears:0,
    continueAfterProfitRate:item.profitStates?item.continuedProfit/item.profitStates:0,continueAfter2xRate:item.x2States?item.continued2x/item.x2States:0,
    deathAfterProfitRiskRate:item.continuedProfit?item.diedAfterProfit/item.continuedProfit:0,deathAfter2xRiskRate:item.continued2x?item.diedAfter2x/item.continued2x:0,
    twoXNextClearRate:item.twoXTransitions?item.twoXNextClears/item.twoXTransitions:0,twoXNextDeathRate:item.twoXTransitions?item.twoXNextDeaths/item.twoXTransitions:0,
    twoXRetainRate:item.twoXNextClears?item.twoXRetained/item.twoXNextClears:0,twoXUpRate:item.twoXNextClears?item.twoXUp/item.twoXNextClears:0,
    twoXFlatRate:item.twoXNextClears?item.twoXFlat/item.twoXNextClears:0,twoXDownRate:item.twoXNextClears?item.twoXDown/item.twoXNextClears:0,
    twoXProfitUpRate:item.twoXNextClears?item.twoXProfitUp/item.twoXNextClears:0,twoXProfitFlatRate:item.twoXNextClears?item.twoXProfitFlat/item.twoXNextClears:0,
    twoXProfitDownRate:item.twoXNextClears?item.twoXProfitDown/item.twoXNextClears:0,
    twoXAvgStartRatio:item.twoXTransitions?item.twoXStartRatio/item.twoXTransitions:0,twoXAvgNextRatio:item.twoXNextClears?item.twoXNextRatio/item.twoXNextClears:0,
    twoXAvgStartProfit:item.twoXTransitions?(item.twoXStartPayout-item.twoXStartBet)/item.twoXTransitions:0,
    twoXAvgNextProfit:item.twoXNextClears?(item.twoXNextPayout-item.twoXNextBet)/item.twoXNextClears:0,
  }))};
}

function buildDepthValidation(waves, sampleCount, targetRtp, tolerance, useAllocated=false) {
  const minimumCashouts = Math.max(1000, Math.ceil(sampleCount * .002));
  const reliableWaves = waves.filter(row => row.samples >= minimumCashouts);
  const values = reliableWaves.map(row => useAllocated ? row.allocatedRtp : row.checkpointRtp);
  const first = reliableWaves[0] || null;
  const last = reliableWaves.at(-1) || null;
  const spread = values.length ? Math.max(...values) - Math.min(...values) : 0;
  const drift = first && last ? last.checkpointRtp - first.checkpointRtp : 0;
  const maxDeviation = values.length ? Math.max(...values.map(value => Math.abs(value - targetRtp))) : Infinity;
  const maxUnexplainedDeviation = maxDeviation;
  const targetInIntervals = reliableWaves.length >= 2 && reliableWaves.every(row => targetRtp >= row.checkpointRtp-row.cashoutCi95 && targetRtp <= row.checkpointRtp+row.cashoutCi95);
  return {
    minimumEntrants:minimumCashouts,
    minimumCashouts,
    waveCount:reliableWaves.length,
    firstWave:first?.wave || 0,
    lastWave:last?.wave || 0,
    firstRtp:first?.checkpointRtp || 0,
    lastRtp:last?.checkpointRtp || 0,
    spread,
    drift,
    maxDeviation,
    maxUnexplainedDeviation,
    targetInIntervals,
    pass:maxDeviation <= tolerance,
  };
}

function buildConditionalWaveSliceInfo() {
  return {
    applicable:false,
    mode:"actualCashoutConditional",
    minimumEntrants:0,
    minimumCashouts:0,
    waveCount:0,
    firstWave:0,
    lastWave:0,
    firstRtp:0,
    lastRtp:0,
    spread:0,
    drift:0,
    maxDeviation:0,
    maxUnexplainedDeviation:0,
    targetInIntervals:false,
    pass:true,
  };
}

function buildReport(results, config, paramRecord, startedAt, elapsedMs, requestedSamples, brokePlayers, canceled) {
  const totals = aggregateRuns(results);
  const chase = buildChaseAnalysis(results,config.maxWave);
  const returns = results.map(row => row.bets ? row.payout / row.bets : 0).sort((a,b) => a-b);
  const mean = returns.reduce((sum,value) => sum + value, 0) / Math.max(1, returns.length);
  const variance = returns.reduce((sum,value) => sum + (value - mean) ** 2, 0) / Math.max(1, returns.length);
  const volatility = Math.sqrt(variance);
  const bossSpawned = results.reduce((sum,row) => sum + row.bossEvents.length, 0);
  const bossKilled = results.reduce((sum,row) => sum + row.bossEvents.filter(event => event.killed).length, 0);
  const basePayout = results.reduce((sum,row) => sum + (Number(row.basePayout) || 0), 0);
  const bossPayout = results.reduce((sum,row) => sum + (Number(row.bossPayout) || 0), 0);
  const targetRtp = configuredPoolRtp(paramRecord.params);
  const baseHp = Math.max(1, Number(config.baseHp) || 1000);

  const waveMap = new Map(Array.from({length:config.maxWave},(_,index) => {
    const wave = index + 1;
    return [wave,{ wave,samples:0,entrants:0,clears:0,hp:0,pot:0,totalBet:0,waveBet:0,checkpointPayout:0,basePayout:0,bossPayout:0,boss:0,cashoutResidual:0,cashoutResidualSq:0,returnMax:0,return1x:0,return2x:0,return5x:0,return10x:0,return20x:0,return50x:0,personalPools:0,poolSeed:0,poolClosingAvailable:0,poolClosingReserved:0,poolClosingPaid:0,poolOperatorAdvance:0 }];
  }));
  results.forEach(row => {
    const records = new Map((row.waveRecords || []).map(record => [record.wave,record]));
    const wave = clamp(Math.round(Number(row.cashoutWave) || Number(row.wave) || config.maxWave),1,config.maxWave);
    const item = waveMap.get(wave);
    const record = records.get(wave);
    const cleared = !!record?.cleared && !!(row.collected || row.completed) && Number(row.wave) >= wave;
    const cashoutBet = Math.max(0,Number(row.bets) || 0);
    const cashoutPayout = Math.max(0,Number(row.payout) || 0);
    const returnMultiple = cashoutBet ? cashoutPayout/cashoutBet : 0;
    const residual = cashoutPayout-targetRtp*cashoutBet;
    item.samples += 1;
    item.totalBet += cashoutBet;
    item.cashoutResidual += residual;
    item.cashoutResidualSq += residual*residual;
    item.returnMax = Math.max(item.returnMax,returnMultiple);
    item.return1x += returnMultiple > 1 ? 1 : 0;
    item.return2x += returnMultiple >= 2 ? 1 : 0;
    item.return5x += returnMultiple >= 5 ? 1 : 0;
    item.return10x += returnMultiple >= 10 ? 1 : 0;
    item.return20x += returnMultiple >= 20 ? 1 : 0;
    item.return50x += returnMultiple >= 50 ? 1 : 0;
    if (row.personalPoolClosing) {
      item.personalPools += 1;
      item.poolSeed += Math.max(0,Number(row.mathPoolSeed)||0);
      item.poolClosingAvailable += Number(row.mathPoolAvailable)||0;
      item.poolClosingReserved += Math.max(0,Number(row.mathPoolReserved)||0);
      item.poolClosingPaid += Math.max(0,Number(row.mathPoolPaid)||0);
      item.poolOperatorAdvance += Math.max(0,Number(row.mathPoolOperatorAdvance)||0);
    }
    if (record) {
      item.entrants += 1;
      item.waveBet += Math.max(0,Number(record.waveBet) || 0);
      if (record.boss) item.boss += 1;
    }
    if (cleared) {
      item.clears += 1;
      item.hp += Math.max(0,Number(row.hp) || Number(record.hp) || 0);
      item.pot += Math.max(0,Number(row.pot) || Number(record.pot) || 0);
      item.checkpointPayout += cashoutPayout;
      item.basePayout += Math.max(0,Number(row.basePayout) || 0);
      item.bossPayout += Math.max(0,Number(row.bossPayout) || 0);
    }
  });
  const waves = [...waveMap.values()].sort((a,b) => a.wave-b.wave).map(item => {
    const residualVariance = item.samples > 1 ? Math.max(0,(item.cashoutResidualSq-item.cashoutResidual**2/item.samples)/(item.samples-1)) : 0;
    const averageCashoutBet = item.samples ? item.totalBet/item.samples : 0;
    const cashoutCi95 = item.samples && averageCashoutBet ? 1.96*Math.sqrt(residualVariance/item.samples)/averageCashoutBet : 0;
    return {
    ...item,
    conditionalSurvival:item.entrants ? item.clears/item.entrants : 0,
    cumulativeSurvival:item.samples ? item.clears/item.samples : 0,
    avgHp:item.clears ? item.hp/item.clears : 0,
    survivorAvgHpPct:item.clears ? item.hp/(item.clears*baseHp) : 0,
    avgHpPct:item.samples ? item.hp/(item.samples*baseHp) : 0,
    avgPot:item.clears ? item.pot/item.clears : 0,
    avgPotMultiplier:item.pot ? item.checkpointPayout/item.pot : 0,
    avgTotalBet:item.samples ? item.totalBet/item.samples : 0,
    checkpointRtp:item.totalBet ? item.checkpointPayout/item.totalBet : 0,
    cashoutCi95,
    baseRtp:item.totalBet ? item.basePayout/item.totalBet : 0,
    bossRtp:item.totalBet ? item.bossPayout/item.totalBet : 0,
    bossRate:item.entrants ? item.boss/item.entrants : 0,
    profitRate:item.samples ? item.return1x/item.samples : 0,
    survivorProfitRate:item.clears ? item.return1x/item.clears : 0,
    return2xRate:item.samples ? item.return2x/item.samples : 0,
    return5xRate:item.samples ? item.return5x/item.samples : 0,
    return10xRate:item.samples ? item.return10x/item.samples : 0,
    return20xRate:item.samples ? item.return20x/item.samples : 0,
    return50xRate:item.samples ? item.return50x/item.samples : 0,
    allocatedRtp:item.totalBet ? (item.poolClosingPaid+item.poolClosingAvailable+item.poolClosingReserved-item.poolSeed-item.poolOperatorAdvance)/item.totalBet : 0,
    operatorAdvanceRtp:item.totalBet ? item.poolOperatorAdvance/item.totalBet : 0,
    closingLiabilityRtp:item.totalBet ? (item.poolClosingAvailable+item.poolClosingReserved)/item.totalBet : 0,
  };});

  const bossMap = new Map();
  results.forEach(row => {
    const killedAddTotal = row.bossEvents.filter(event => event.killed).reduce((sum,event) => sum + Math.max(0,Number(event.add) || 0),0);
    row.bossEvents.forEach(event => {
    const item = bossMap.get(event.order) || { order:event.order, encounters:0, kills:0, waveTotal:0, addTotal:0, modelChanceTotal:0, rtpContribution:0 };
    item.encounters += 1;
    item.waveTotal += event.wave;
    item.modelChanceTotal += Math.max(0,Number(event.modelClearChance) || 0);
    if (event.killed) {
      item.kills += 1;
      item.addTotal += event.add;
      if (row.payout > 0 && killedAddTotal > 0) item.rtpContribution += (Number(row.bossPayout) || 0) * Math.max(0,Number(event.add) || 0) / killedAddTotal;
    }
    bossMap.set(event.order,item);
    });
  });
  const bosses = [...bossMap.values()].sort((a,b) => a.order-b.order).map(item => ({
    ...item,
    reachRate:results.length ? item.encounters/results.length : 0,
    killRate:item.encounters ? item.kills/item.encounters : 0,
    avgModelChance:item.encounters ? item.modelChanceTotal/item.encounters : 0,
    avgWave:item.encounters ? item.waveTotal/item.encounters : 0,
    avgAdd:item.kills ? item.addTotal/item.kills : 0,
    rtpContribution:totals.bets ? item.rtpContribution/totals.bets : 0,
  }));

  const comboMap = new Map();
  const heroMap = new Map();
  const towerMap = new Map();
  const upgradeMap = new Map();
  results.forEach(row => {
    const hero = row.hero;
    if (hero) {
      if (!heroMap.has(hero.id)) heroMap.set(hero.id, { id:hero.id, name:hero.name || hero.id, attrKey:hero.attrKey, rows:[] });
      heroMap.get(hero.id).rows.push(row);
      const heroCounts = new Map();
      (hero.upgrades || []).forEach(name => heroCounts.set(name,(heroCounts.get(name)||0)+1));
      heroCounts.forEach((count,name) => {
        const key = `hero:${hero.id}:${name}`;
        if (!upgradeMap.has(key)) upgradeMap.set(key,{ key, name, tower:`角色｜${hero.name || hero.id}`, rows:[], totalCount:0 });
        const item = upgradeMap.get(key);
        item.rows.push(row);
        item.totalCount += count;
      });
    }
    const towers = (row.towers || []).slice().sort((a,b) => a.id.localeCompare(b.id));
    const comboKey = towers.map(tower => tower.id).join("+") || "none";
    if (!comboMap.has(comboKey)) comboMap.set(comboKey, { name:towers.map(tower => tower.name || TOWER_INFO[tower.id]?.name || tower.id).join("＋") || "無塔", rows:[] });
    comboMap.get(comboKey).rows.push(row);
    towers.forEach(tower => {
      if (!towerMap.has(tower.id)) towerMap.set(tower.id, { id:tower.id, name:tower.name || TOWER_INFO[tower.id]?.name || tower.id, rows:[] });
      towerMap.get(tower.id).rows.push(row);
      const counts = new Map();
      (tower.upgrades || []).forEach(name => counts.set(name,(counts.get(name)||0)+1));
      counts.forEach((count,name) => {
        const key = `${tower.id}:${name}`;
        if (!upgradeMap.has(key)) upgradeMap.set(key,{ key, name, tower:tower.name || TOWER_INFO[tower.id]?.name || tower.id, rows:[], totalCount:0 });
        const item = upgradeMap.get(key);
        item.rows.push(row);
        item.totalCount += count;
      });
    });
  });
  const combos = [...comboMap.values()].map(item => ({ name:item.name, ...aggregateRuns(item.rows) })).sort((a,b) => b.samples-a.samples || b.rtp-a.rtp);
  const heroes = [...heroMap.values()].map(item => ({ id:item.id, name:item.name, attrKey:item.attrKey, ...aggregateRuns(item.rows) })).sort((a,b) => b.samples-a.samples);
  const towers = [...towerMap.values()].map(item => ({ id:item.id, name:item.name, ...aggregateRuns(item.rows) })).sort((a,b) => b.samples-a.samples);
  const upgrades = [...upgradeMap.values()].map(item => ({ key:item.key, name:item.name, tower:item.tower, totalCount:item.totalCount, avgCount:item.totalCount/item.rows.length, ...aggregateRuns(item.rows) })).sort((a,b) => b.samples-a.samples || b.rtp-a.rtp);
  const strategyMap = new Map();
  results.forEach(row => {
    if (!strategyMap.has(row.strategy)) strategyMap.set(row.strategy, []);
    strategyMap.get(row.strategy).push(row);
  });
  const strategyStats = [...strategyMap.entries()].map(([strategy, rows]) => {
    const stats = aggregateRuns(rows);
    const rowReturns = rows.map(row => row.bets ? row.payout / row.bets : 0);
    const rowMean = rowReturns.reduce((sum,value) => sum + value, 0) / Math.max(1, rowReturns.length);
    const rowVariance = rowReturns.reduce((sum,value) => sum + (value - rowMean) ** 2, 0) / Math.max(1, rowReturns.length);
    return { strategy, ...stats, volatility:Math.sqrt(rowVariance) };
  }).sort((a,b) => VALIDATION_STRATEGIES.indexOf(a.strategy) - VALIDATION_STRATEGIES.indexOf(b.strategy));
  const tolerance = Math.max(0,Number(paramRecord.params.mathTolerancePct) || 0) / 100;
  const cashoutRtps = strategyStats.map(item => item.rtp);
  const strategyRtps = strategyStats.map(item => item.rtp);
  const empiricalSpread = strategyRtps.length ? Math.max(...strategyRtps) - Math.min(...strategyRtps) : 0;
  const cashoutSpread = cashoutRtps.length ? Math.max(...cashoutRtps) - Math.min(...cashoutRtps) : 0;
  const maxTargetDeviation = strategyRtps.length ? Math.max(...strategyRtps.map(item => Math.abs(item-targetRtp))) : 0;
  const minStrategySamples = strategyStats.length ? Math.min(...strategyStats.map(item => item.samples)) : 0;
  const maxStrategyCi95 = strategyStats.length ? Math.max(...strategyStats.map(item => item.ci95)) : 0;
  const isValidationMatrix = strategyStats.length === VALIDATION_STRATEGIES.length
    && VALIDATION_STRATEGIES.every(strategy => strategyStats.some(item => item.strategy === strategy));
  const trustedSample = isValidationMatrix && minStrategySamples >= TRUSTED_SAMPLES_PER_STRATEGY;
  const targetInIntervals = strategyStats.length > 0
    && strategyStats.every(item => targetRtp >= item.rtp - item.ci95 && targetRtp <= item.rtp + item.ci95);
  const targetPass = strategyStats.length > 0 && maxTargetDeviation <= tolerance;
  const empiricalPass = isValidationMatrix && empiricalSpread <= tolerance;
  const depthValidationApplicable = config.collectPolicy === "fixedWaveMatrix";
  const depth = depthValidationApplicable
    ? {...buildDepthValidation(waves, results.length, targetRtp, tolerance, false),applicable:true,mode:"fixedWaveMatrix"}
    : buildConditionalWaveSliceInfo();
  const validation = {
    targetRtp, tolerance, targetInIntervals, targetPass, maxTargetDeviation, metric:"cashoutRtp", cashoutSpread,
    empiricalSpread, empiricalPass, minStrategySamples, maxStrategyCi95,
    trustedSample, isValidationMatrix, strategies:strategyStats, depth, depthValidationApplicable,
    status:!isValidationMatrix ? "單策略觀察"
      : !trustedSample ? "方向樣本（未達可信數量）"
        : targetPass && empiricalPass && depth.pass ? "通過" : "未通過",
  };

  return {
    id:id("result"), createdAt:new Date().toISOString(), startedAt, elapsedMs, canceled,
    requestedSamples, completedSamples:results.length, brokePlayers,
    config:clone(config), paramName:paramRecord.name, paramHash:paramHash(paramRecord.params), paramRevision:paramRecord.params.balanceRevision ?? null,
    summary:{
      ...totals, volatility, bossSpawned, bossKilled, bossKillRate:bossSpawned ? bossKilled/bossSpawned : 0,
      basePayout, bossPayout, baseRtp:totals.bets ? basePayout/totals.bets : 0, bossRtp:totals.bets ? bossPayout/totals.bets : 0,
      hitRate:results.length ? results.filter(row => row.payout > 0).length/results.length : 0,
      zeroRate:results.length ? results.filter(row => row.payout === 0).length/results.length : 0,
      collectedRate:results.length ? results.filter(row => row.collected || row.completed).length/results.length : 0,
      completed30Rate:results.length ? results.filter(row => row.completed).length/results.length : 0,
      p50:percentile(returns,.5), p75:percentile(returns,.75), p90:percentile(returns,.9), p95:percentile(returns,.95), p99:percentile(returns,.99), max:returns.at(-1)||0,
    },
    waves, bosses, chase, combos, heroes, towers, upgrades, validation,
  };
}

function nextFrame() { return new Promise(resolve => window.setTimeout(resolve,0)); }

function buildWorkerAssignments(strategySet, config, workerCount) {
  const assignments = [];
  strategySet.forEach((strategy,strategyIndex) => {
    for (let player=0;player<config.playerCount;player+=1) {
      const orderBase = (strategyIndex * config.playerCount + player) * config.gamesPerPlayer;
      const cashoutWave = config.collectPolicy === "fixedWaveMatrix"
        ? 1+(player%config.maxWave)
        : 0;
      const heroId = HERO_IDS[(strategyIndex + player) % HERO_IDS.length];
      assignments.push({strategy,player,heroId,gameStart:0,gameEnd:config.gamesPerPlayer,orderBase,cashoutWave});
    }
  });
  return assignments;
}

function runWorkerPool(config, params, strategySet, requestedWorkers, onProgress=()=>{}) {
  const assignments = buildWorkerAssignments(strategySet,config,requestedWorkers);
  const workerCount = Math.max(1,Math.min(requestedWorkers,assignments.length));
  const buckets = Array.from({length:workerCount},()=>[]);
  assignments.forEach((assignment,index) => buckets[index % workerCount].push(assignment));

  return new Promise((resolve,reject) => {
    const localWorkers = [];
    const rows = [];
    let finishedWorkers = 0;
    let brokePlayers = 0;
    let settled = false;

    const cleanup = () => {
      localWorkers.forEach(worker => worker.terminate());
      if (activeWorkers === localWorkers) activeWorkers = [];
      activeParallelCancel = null;
    };
    const finish = canceled => {
      if (settled) return;
      settled = true;
      cleanup();
      rows.sort((a,b) => (a._runOrder ?? 0) - (b._runOrder ?? 0));
      resolve({rows,brokePlayers,canceled,workerCount});
    };
    const fail = error => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    activeWorkers = localWorkers;
    activeParallelCancel = () => finish(true);
    buckets.forEach(bucket => {
    const worker = new Worker("simulator-worker.js?headless=1&v=deep-chase-minion210");
      localWorkers.push(worker);
      worker.onmessage = event => {
        if (settled) return;
        const message = event.data || {};
        if (message.type === "rows") {
          rows.push(...(message.rows || []));
          onProgress(rows.length,workerCount);
          return;
        }
        if (message.type === "done") {
          brokePlayers += Number(message.brokePlayers) || 0;
          finishedWorkers += 1;
          if (finishedWorkers >= workerCount) finish(false);
          return;
        }
        if (message.type === "error") fail(new Error(message.message || "Worker 模擬失敗"));
      };
      worker.onerror = event => fail(new Error(event.message || "Worker 載入失敗"));
      worker.postMessage({type:"start",config,params,assignments:bucket,chunkSize:100});
    });
  });
}

function updateRunProgress(completed, requestedSamples, startedMs, workerCount) {
  const progress = requestedSamples ? completed/requestedSamples : 0;
  ui.progressFill.style.width = `${Math.round(progress*100)}%`;
  ui.progressText.textContent = `已完成 ${completed.toLocaleString()} / ${requestedSamples.toLocaleString()} 場`;
  ui.elapsedText.textContent = `${((performance.now()-startedMs)/1000).toFixed(1)} 秒`;
  renderWorkerStatus(workerCount > 1 ? `正在使用 ${workerCount} 個本機執行緒` : "正在使用單執行緒精度基準");
}

async function runSimulation() {
  if (running) return;
  const config = readConfig();
  const strategySet = config.strategy === "matrix" ? VALIDATION_STRATEGIES : [config.strategy];
  const requestedSamples = config.playerCount * config.gamesPerPlayer * strategySet.length;
  if (requestedSamples > MAX_SAMPLES) { showToast(`單次最多 ${MAX_SAMPLES.toLocaleString()} 場，請降低玩家數或每人場數。`,true); return; }
  const source = selectedParamRecord();
  if (!Object.keys(source.params || {}).length) { showToast("尚未取得調參工具數值。",true); return; }
  if (!engine) { showToast("戰鬥引擎尚未準備完成。",true); return; }

  running = true;
  cancelRequested = false;
  ui.runBtn.disabled = true;
  ui.trustedRunBtn.disabled = true;
  ui.parityBtn.disabled = true;
  ui.cancelBtn.disabled = false;
  setCopyEnabled(false);
  const startedAt = new Date().toISOString();
  const startedMs = performance.now();
  const batchParams = clone(source.params);
  const runConfig = { ...config, baseHp:Number(batchParams.baseHp) || 1000 };
  engine.setParams(batchParams);
  engine.lockParams(true);
  const rows = [];
  let brokePlayers = 0;
  let completed = 0;
  let actualWorkerCount = 1;

  try {
    const requestedWorkerCount = selectedWorkerCount();
    if (requestedWorkerCount > 1) {
      const workerResult = await runWorkerPool(runConfig,batchParams,strategySet,requestedWorkerCount,(count,workers) => {
        completed = count;
        updateRunProgress(completed,requestedSamples,startedMs,workers);
      });
      rows.push(...workerResult.rows);
      rows.forEach(row => { delete row._runOrder; });
      brokePlayers = workerResult.brokePlayers;
      cancelRequested = cancelRequested || workerResult.canceled;
      actualWorkerCount = workerResult.workerCount;
      completed = rows.length;
      updateRunProgress(completed,requestedSamples,startedMs,actualWorkerCount);
    } else {
      outer: for (let strategyIndex=0;strategyIndex<strategySet.length;strategyIndex+=1) {
        const strategy = strategySet[strategyIndex];
        for (let player=0;player<config.playerCount;player+=1) {
          engine.resetMathPool?.(config.baseBet);
          const cashoutWave = config.collectPolicy === "fixedWaveMatrix" ? 1+(player%config.maxWave) : 0;
          const strategyConfig = {
            ...runConfig,
            strategy,
            forcedHeroId:HERO_IDS[(strategyIndex + player) % HERO_IDS.length],
            maxWave:cashoutWave || runConfig.maxWave,
            collectPolicy:cashoutWave ? "fixedWave" : runConfig.collectPolicy,
          };
          let wallet = config.startWallet;
          for (let game=0;game<config.gamesPerPlayer;game+=1) {
            if (cancelRequested) break outer;
            const gameWallet = config.walletMode === "independent" ? config.startWallet : wallet;
            if (gameWallet < config.baseBet) { brokePlayers += 1; break; }
            const runSeed = (config.seed + player * 1000003 + game * 7919) >>> 0;
            const row = runOne(strategyConfig,gameWallet,runSeed || 1);
            row.playerId = player;
            row.cashoutWave = cashoutWave || row.wave;
            row.personalPoolClosing = game === config.gamesPerPlayer-1;
            if (config.walletMode === "continuous") wallet = row.endingWallet;
            rows.push(row);
            completed += 1;
            if (completed % 25 === 0 || completed === requestedSamples) {
              updateRunProgress(completed,requestedSamples,startedMs,1);
              await nextFrame();
            }
          }
        }
      }
    }
    const reportConfig = {...config,actualWorkerCount};
    currentReport = buildReport(rows,reportConfig,{name:source.name,params:batchParams},startedAt,performance.now()-startedMs,requestedSamples,brokePlayers,cancelRequested);
    renderReport(currentReport);
    showToast(cancelRequested ? `已停止，保留 ${rows.length.toLocaleString()} 場有效結果。` : `模擬完成，共 ${rows.length.toLocaleString()} 場。`);
  } catch (error) {
    console.error(error);
    showToast(`模擬失敗：${error.message || error}`,true);
  } finally {
    engine.lockParams(false);
    if (ui.paramSource.value === "live" && Object.keys(liveParams).length) engine.setParams(liveParams);
    running = false;
    ui.runBtn.disabled = false;
    ui.trustedRunBtn.disabled = false;
    ui.parityBtn.disabled = false;
    ui.cancelBtn.disabled = true;
    renderWorkerStatus();
    renderParamStatus();
  }
}

function mergeAnalysisRows(reports, field, keyField) {
  const map = new Map();
  reports.forEach(report => (report[field] || []).forEach(row => {
    const key = row[keyField] ?? row.name;
    const item = map.get(key) || {...row,samples:0,bets:0,payout:0,waveTotal:0,bossRateTotal:0,profitTotal:0,totalCount:0};
    item.samples += row.samples || 0;
    item.bets += row.bets || 0;
    item.payout += row.payout || 0;
    item.waveTotal += (row.avgWave || 0)*(row.samples || 0);
    item.bossRateTotal += (row.bossKillRate || 0)*(row.samples || 0);
    item.profitTotal += (row.profitRate || 0)*(row.samples || 0);
    item.totalCount += row.totalCount || 0;
    map.set(key,item);
  }));
  return [...map.values()].map(item => ({
    ...item,rtp:item.bets ? item.payout/item.bets : 0,ci95:0,
    avgWave:item.samples ? item.waveTotal/item.samples : 0,
    bossKillRate:item.samples ? item.bossRateTotal/item.samples : 0,
    profitRate:item.samples ? item.profitTotal/item.samples : 0,
    avgCount:item.samples ? item.totalCount/item.samples : 0,
  })).sort((a,b) => b.samples-a.samples || b.rtp-a.rtp);
}

function mergeFormalReports(reports, returns, config, paramRecord, startedAt, elapsedMs, requestedSamples, brokePlayers, canceled) {
  const completedSamples = reports.reduce((sum,report) => sum+report.completedSamples,0);
  const samples = completedSamples;
  const bets = reports.reduce((sum,report) => sum+report.summary.bets,0);
  const payout = reports.reduce((sum,report) => sum+report.summary.payout,0);
  const rtp = bets ? payout/bets : 0;
  const payoutSq = reports.reduce((sum,report) => sum+(report.summary.payoutSq || 0),0);
  const betSq = reports.reduce((sum,report) => sum+(report.summary.betSq || 0),0);
  const payoutBet = reports.reduce((sum,report) => sum+(report.summary.payoutBet || 0),0);
  const sortedReturns = returns.sort((a,b) => a-b);
  const returnMean = samples ? sortedReturns.reduce((sum,value) => sum+value,0)/samples : 0;
  const returnVariance = samples > 1 ? sortedReturns.reduce((sum,value) => sum+(value-returnMean)**2,0)/(samples-1) : 0;
  const volatility = Math.sqrt(returnVariance);
  const residualSq = Math.max(0,payoutSq-2*rtp*payoutBet+rtp*rtp*betSq);
  const residualVariance = samples > 1 ? residualSq/(samples-1) : 0;
  const meanBet = samples ? bets/samples : 0;
  const ci95 = samples && meanBet ? 1.96*Math.sqrt(residualVariance/samples)/meanBet : 0;
  const weighted = key => samples ? reports.reduce((sum,report) => sum+(report.summary[key] || 0)*report.completedSamples,0)/samples : 0;
  const bossSpawned = reports.reduce((sum,report) => sum+report.summary.bossSpawned,0);
  const bossKilled = reports.reduce((sum,report) => sum+report.summary.bossKilled,0);
  const basePayout = reports.reduce((sum,report) => sum+(report.summary.basePayout || 0),0);
  const bossPayout = reports.reduce((sum,report) => sum+(report.summary.bossPayout || 0),0);
  const mathPoolContribution = reports.reduce((sum,report) => sum+(report.summary.mathPoolContribution || 0),0);
  const mathPoolCapHits = reports.reduce((sum,report) => sum+(report.summary.mathPoolCapHits || 0),0);
  const mathPoolRecycled = reports.reduce((sum,report) => sum+(report.summary.mathPoolRecycled || 0),0);
  const mathPoolOperatorAdvance = reports.reduce((sum,report) => sum+(report.summary.mathPoolOperatorAdvance || 0),0);
  const rerollSpent = reports.reduce((sum,report) => sum+(report.summary.rerollSpent || 0),0);
  const mathPoolMaxInvariantError = reports.reduce((max,report) => Math.max(max,Math.abs(report.summary.mathPoolMaxInvariantError || 0)),0);
  const payoutMismatchCount = reports.reduce((sum,report) => sum+(report.summary.payoutMismatchCount || 0),0);
  const payoutMismatchTotal = reports.reduce((sum,report) => sum+(report.summary.payoutMismatchTotal || 0),0);
  const payoutMismatchMax = reports.reduce((max,report) => Math.max(max,Math.abs(report.summary.payoutMismatchMax || 0)),0);
  const personalPools = reports.reduce((sum,report) => sum+(report.summary.personalPools || 0),0);
  const mathPoolSeedTotal = reports.reduce((sum,report) => sum+(report.summary.mathPoolSeedTotal || 0),0);
  const mathPoolClosingAvailable = reports.reduce((sum,report) => sum+(report.summary.mathPoolClosingAvailable || 0),0);
  const mathPoolClosingReserved = reports.reduce((sum,report) => sum+(report.summary.mathPoolClosingReserved || 0),0);
  const mathPoolClosingContributed = reports.reduce((sum,report) => sum+(report.summary.mathPoolClosingContributed || 0),0);
  const mathPoolClosingPaid = reports.reduce((sum,report) => sum+(report.summary.mathPoolClosingPaid || 0),0);
  const returnDistribution = [
    ["0x",value => value === 0],["0-0.5x",value => value > 0 && value < .5],
    ["0.5-1x",value => value >= .5 && value < 1],["1x 保本",value => value === 1],
    ["1-1.2x",value => value > 1 && value < 1.2],
    ["1.2-1.5x",value => value >= 1.2 && value < 1.5],["1.5-2x",value => value >= 1.5 && value < 2],
    ["2-3x",value => value >= 2 && value < 3],["3-5x",value => value >= 3 && value < 5],
    ["5-10x",value => value >= 5 && value < 10],
    ["10-20x",value => value >= 10 && value < 20],["20-50x",value => value >= 20 && value < 50],
    ["50x+",value => value >= 50],
  ].map(([label,test]) => {
    const count = sortedReturns.filter(test).length;
    return {label,count,rate:samples ? count/samples : 0};
  });
  const targetRtp = configuredPoolRtp(paramRecord.params);
  const baseHp = Math.max(1, Number(config.baseHp) || 1000);

  const waveMap = new Map();
  reports.forEach(report => report.waves.forEach(row => {
    const item = waveMap.get(row.wave) || {wave:row.wave,samples:0,entrants:0,clears:0,hp:0,pot:0,totalBet:0,waveBet:0,checkpointPayout:0,basePayout:0,bossPayout:0,boss:0,cashoutResidual:0,cashoutResidualSq:0,returnMax:0,return1x:0,return2x:0,return5x:0,return10x:0,return20x:0,return50x:0,personalPools:0,poolSeed:0,poolClosingAvailable:0,poolClosingReserved:0,poolClosingPaid:0,poolOperatorAdvance:0};
    ["samples","entrants","clears","hp","pot","totalBet","waveBet","checkpointPayout","basePayout","bossPayout","boss","cashoutResidual","cashoutResidualSq","return1x","return2x","return5x","return10x","return20x","return50x","personalPools","poolSeed","poolClosingAvailable","poolClosingReserved","poolClosingPaid","poolOperatorAdvance"].forEach(key => { item[key] += row[key] || 0; });
    item.returnMax = Math.max(item.returnMax,row.returnMax || 0);
    waveMap.set(row.wave,item);
  }));
  const waves = [...waveMap.values()].sort((a,b) => a.wave-b.wave).map(item => {
    const residualVariance = item.samples > 1 ? Math.max(0,(item.cashoutResidualSq-item.cashoutResidual**2/item.samples)/(item.samples-1)) : 0;
    const averageCashoutBet = item.samples ? item.totalBet/item.samples : 0;
    return {
    ...item,conditionalSurvival:item.entrants ? item.clears/item.entrants : 0,
    cumulativeSurvival:item.samples ? item.clears/item.samples : 0,avgHp:item.clears ? item.hp/item.clears : 0,
    survivorAvgHpPct:item.clears ? item.hp/(item.clears*baseHp) : 0,
    avgHpPct:item.samples ? item.hp/(item.samples*baseHp) : 0,
    avgPot:item.clears ? item.pot/item.clears : 0,avgPotMultiplier:item.pot ? item.checkpointPayout/item.pot : 0,avgTotalBet:item.samples ? item.totalBet/item.samples : 0,
    checkpointRtp:item.totalBet ? item.checkpointPayout/item.totalBet : 0,
    cashoutCi95:item.samples && averageCashoutBet ? 1.96*Math.sqrt(residualVariance/item.samples)/averageCashoutBet : 0,
    baseRtp:item.totalBet ? item.basePayout/item.totalBet : 0,bossRtp:item.totalBet ? item.bossPayout/item.totalBet : 0,
    bossRate:item.entrants ? item.boss/item.entrants : 0,
    profitRate:item.samples ? item.return1x/item.samples : 0,
    survivorProfitRate:item.clears ? item.return1x/item.clears : 0,
    return2xRate:item.samples ? item.return2x/item.samples : 0,
    return5xRate:item.samples ? item.return5x/item.samples : 0,
    return10xRate:item.samples ? item.return10x/item.samples : 0,
    return20xRate:item.samples ? item.return20x/item.samples : 0,
    return50xRate:item.samples ? item.return50x/item.samples : 0,
    allocatedRtp:item.totalBet ? (item.poolClosingPaid+item.poolClosingAvailable+item.poolClosingReserved-item.poolSeed-item.poolOperatorAdvance)/item.totalBet : 0,
    operatorAdvanceRtp:item.totalBet ? item.poolOperatorAdvance/item.totalBet : 0,
    closingLiabilityRtp:item.totalBet ? (item.poolClosingAvailable+item.poolClosingReserved)/item.totalBet : 0,
  };});
  const chase = mergeChaseReports(reports,samples);

  const bossMap = new Map();
  reports.forEach(report => report.bosses.forEach(row => {
    const item = bossMap.get(row.order) || {order:row.order,encounters:0,kills:0,waveTotal:0,addTotal:0,modelChanceTotal:0,contributionValue:0};
    item.encounters += row.encounters || 0;
    item.kills += row.kills || 0;
    item.waveTotal += row.waveTotal || 0;
    item.addTotal += row.addTotal || 0;
    item.modelChanceTotal += row.modelChanceTotal || 0;
    item.contributionValue += (row.rtpContribution || 0)*report.summary.bets;
    bossMap.set(row.order,item);
  }));
  const bosses = [...bossMap.values()].sort((a,b) => a.order-b.order).map(item => ({
    ...item,reachRate:samples ? item.encounters/samples : 0,killRate:item.encounters ? item.kills/item.encounters : 0,
    avgModelChance:item.encounters ? item.modelChanceTotal/item.encounters : 0,
    avgWave:item.encounters ? item.waveTotal/item.encounters : 0,avgAdd:item.kills ? item.addTotal/item.kills : 0,
    rtpContribution:bets ? item.contributionValue/bets : 0,
  }));

  const strategies = reports.flatMap(report => report.validation.strategies);
  const tolerance = Math.max(0,Number(paramRecord.params.mathTolerancePct) || 0)/100;
  const cashoutRtps = strategies.map(row => row.rtp);
  const strategyRtps = strategies.map(row => row.rtp);
  const empiricalSpread = strategyRtps.length ? Math.max(...strategyRtps)-Math.min(...strategyRtps) : 0;
  const cashoutSpread = cashoutRtps.length ? Math.max(...cashoutRtps)-Math.min(...cashoutRtps) : 0;
  const maxTargetDeviation = strategyRtps.length ? Math.max(...strategyRtps.map(row => Math.abs(row-targetRtp))) : 0;
  const minStrategySamples = strategies.length ? Math.min(...strategies.map(row => row.samples)) : 0;
  const maxStrategyCi95 = strategies.length ? Math.max(...strategies.map(row => row.ci95)) : 0;
  const trustedSample = strategies.length === VALIDATION_STRATEGIES.length && minStrategySamples >= TRUSTED_SAMPLES_PER_STRATEGY;
  const targetInIntervals = strategies.length > 0
    && strategies.every(row => targetRtp >= row.rtp-row.ci95 && targetRtp <= row.rtp+row.ci95);
  const targetPass = strategies.length > 0 && maxTargetDeviation <= tolerance;
  const empiricalPass = strategies.length === VALIDATION_STRATEGIES.length && empiricalSpread <= tolerance;
  const depthValidationApplicable = config.collectPolicy === "fixedWaveMatrix";
  const depth = depthValidationApplicable
    ? {...buildDepthValidation(waves, samples, targetRtp, tolerance, false),applicable:true,mode:"fixedWaveMatrix"}
    : buildConditionalWaveSliceInfo();
  const validation = {targetRtp,tolerance,targetInIntervals,targetPass,maxTargetDeviation,metric:"isolatedCashoutRtp",strategyFairnessApplicable:true,strategyFairnessMode:"isolatedPersonalPool",cashoutSpread,empiricalSpread,empiricalPass,minStrategySamples,maxStrategyCi95,trustedSample,isValidationMatrix:strategies.length === VALIDATION_STRATEGIES.length,strategies,depth,depthValidationApplicable,status:!trustedSample ? "方向樣本（未達可信數量）" : targetPass && empiricalPass && depth.pass ? "通過" : "未通過"};
  return {
    id:id("result"),createdAt:new Date().toISOString(),startedAt,elapsedMs,canceled,requestedSamples,completedSamples,brokePlayers,
    config:clone(config),paramName:paramRecord.name,paramHash:paramHash(paramRecord.params),paramRevision:paramRecord.params.balanceRevision ?? null,
    summary:{samples,bets,payout,payoutSq,betSq,payoutBet,rtp,ci95,avgWave:weighted("avgWave"),bossKillRate:bossSpawned ? bossKilled/bossSpawned : 0,
      basePayout,bossPayout,baseRtp:bets ? basePayout/bets : 0,bossRtp:bets ? bossPayout/bets : 0,
      mathPoolContribution,mathPoolCapHits,mathPoolRecycled,mathPoolOperatorAdvance,rerollSpent,mathPoolMaxInvariantError,
      payoutMismatchCount,payoutMismatchTotal,payoutMismatchMax,
      personalPools,mathPoolSeedTotal,mathPoolClosingAvailable,mathPoolClosingReserved,mathPoolClosingContributed,mathPoolClosingPaid,
      allocatedRtp:bets ? (mathPoolClosingPaid+mathPoolClosingAvailable+mathPoolClosingReserved-mathPoolSeedTotal-mathPoolOperatorAdvance)/bets : 0,
      closingLiabilityRtp:bets ? (mathPoolClosingAvailable+mathPoolClosingReserved)/bets : 0,
      profitRate:weighted("profitRate"),volatility,bossSpawned,bossKilled,hitRate:weighted("hitRate"),zeroRate:weighted("zeroRate"),
      collectedRate:weighted("collectedRate"),completed30Rate:weighted("completed30Rate"),
      p50:percentile(sortedReturns,.5),p75:percentile(sortedReturns,.75),p90:percentile(sortedReturns,.9),p95:percentile(sortedReturns,.95),p99:percentile(sortedReturns,.99),max:sortedReturns.at(-1)||0,
      win2xRate:samples ? sortedReturns.filter(value => value >= 2).length/samples : 0,
      win5xRate:samples ? sortedReturns.filter(value => value >= 5).length/samples : 0,
      win10xRate:samples ? sortedReturns.filter(value => value >= 10).length/samples : 0,
      win20xRate:samples ? sortedReturns.filter(value => value >= 20).length/samples : 0,
      win50xRate:samples ? sortedReturns.filter(value => value >= 50).length/samples : 0,
      breakEvenRate:samples ? sortedReturns.filter(value => value === 1).length/samples : 0,
      meaningfulWinRate:samples ? sortedReturns.filter(value => value >= 1.5).length/samples : 0,
      returnDistribution},
    waves,bosses,chase,combos:mergeAnalysisRows(reports,"combos","name"),heroes:mergeAnalysisRows(reports,"heroes","id"),towers:mergeAnalysisRows(reports,"towers","id"),
    upgrades:mergeAnalysisRows(reports,"upgrades","key"),validation,
  };
}

async function runTrustedSimulation() {
  if (running) return;
  const source = selectedParamRecord();
  if (!engine || !Object.keys(source.params || {}).length) { showToast("戰鬥引擎或參數尚未準備完成。",true); return; }
  ui.strategy.value = "matrix";
  ui.playerCount.value = "1000";
  ui.gamesPerPlayer.value = "100";
  ui.walletMode.value = "independent";
  ui.collectPolicy.value = "fixedWaveMatrix";
  ui.maxWave.value = "30";
  updateSampleTotal();
  const baseConfig = {...readConfig(),strategy:"matrix",collectPolicy:"fixedWaveMatrix",maxWave:30};
  const batchParams = clone(source.params);
  const requestedSamples = TRUSTED_SAMPLES_PER_STRATEGY*VALIDATION_STRATEGIES.length;
  const workerCount = selectedWorkerCount();
  const startedAt = new Date().toISOString();
  const startedMs = performance.now();
  const reports = [];
  const returns = [];
  let brokePlayers = 0;
  let completed = 0;

  running = true;
  cancelRequested = false;
  [ui.runBtn,ui.trustedRunBtn,ui.parityBtn].forEach(button => button.disabled=true);
  ui.cancelBtn.disabled = false;
  setCopyEnabled(false);
  showToast("正式驗證開始：完整 30 波，五種策略各 100,000 場，並建立逐波固定 Collect RTP。",false,5000);
  engine.setParams(batchParams);
  engine.lockParams(true);
  try {
    for (const strategy of VALIDATION_STRATEGIES) {
      if (cancelRequested) break;
      const strategyConfig = {...baseConfig,strategy,baseHp:Number(batchParams.baseHp)||1000};
      const result = await runWorkerPool(strategyConfig,batchParams,[strategy],workerCount,(count,workers) => {
        updateRunProgress(completed+count,requestedSamples,startedMs,workers);
      });
      result.rows.forEach(row => { delete row._runOrder; returns.push(row.bets ? row.payout/row.bets : 0); });
      const partial = buildReport(result.rows,{...strategyConfig,actualWorkerCount:result.workerCount},{name:source.name,params:batchParams},startedAt,performance.now()-startedMs,TRUSTED_SAMPLES_PER_STRATEGY,result.brokePlayers,result.canceled);
      reports.push(partial);
      brokePlayers += result.brokePlayers;
      completed += result.rows.length;
      cancelRequested = cancelRequested || result.canceled;
      updateRunProgress(completed,requestedSamples,startedMs,result.workerCount);
      await nextFrame();
    }
    currentReport = mergeFormalReports(reports,returns,{...baseConfig,actualWorkerCount:workerCount},{name:source.name,params:batchParams},startedAt,performance.now()-startedMs,requestedSamples,brokePlayers,cancelRequested);
    renderReport(currentReport);
    showToast(cancelRequested ? `正式驗證已停止，保留 ${completed.toLocaleString()} 場結果。` : "完整 30 波、500,000 場正式驗證完成。",false,6000);
  } catch (error) {
    console.error(error);
    showToast(`正式驗證失敗：${error.message || error}`,true,8000);
  } finally {
    engine.lockParams(false);
    if (ui.paramSource.value === "live" && Object.keys(liveParams).length) engine.setParams(liveParams);
    running = false;
    [ui.runBtn,ui.trustedRunBtn,ui.parityBtn].forEach(button => button.disabled=false);
    ui.cancelBtn.disabled = true;
    renderWorkerStatus();
    renderParamStatus();
  }
}

function comparableRow(row) {
  const value = clone(row);
  delete value._runOrder;
  return JSON.stringify(value);
}

async function runParityCheck() {
  if (running) return;
  if (typeof Worker === "undefined") { showToast("目前瀏覽器不支援本機 Worker。",true); return; }
  const source = selectedParamRecord();
  if (!engine || !Object.keys(source.params || {}).length) { showToast("戰鬥引擎或參數尚未準備完成。",true); return; }

  const base = readConfig();
  const params = clone(source.params);
  const config = {
    ...base,
    strategy:"balanced",
    playerCount:2,
    gamesPerPlayer:3,
    maxWave:Math.min(5,base.maxWave),
    baseHp:Number(params.baseHp) || 1000,
  };
  running = true;
  ui.runBtn.disabled = true;
  ui.trustedRunBtn.disabled = true;
  ui.parityBtn.disabled = true;
  renderWorkerStatus("正在核對固定種子的逐局結果");
  engine.setParams(params);
  engine.lockParams(true);

  try {
    const preciseEngine = new Proxy(engine, {
      get(target,prop) {
        if (prop === "stepFrames" || prop === "snapshotLite") return undefined;
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
    let checkedRows = 0;
    for (const walletMode of ["independent","continuous"]) {
      const modeConfig = {...config,walletMode};
      const serialRows = [];
      for (let player=0;player<modeConfig.playerCount;player+=1) {
        let wallet = modeConfig.startWallet;
        for (let game=0;game<modeConfig.gamesPerPlayer;game+=1) {
          const gameWallet = walletMode === "independent" ? modeConfig.startWallet : wallet;
          if (gameWallet < modeConfig.baseBet) break;
          const seed = (modeConfig.seed + player * 1000003 + game * 7919) >>> 0;
          const preciseRow = window.TDSimCore.runOne(preciseEngine,modeConfig,gameWallet,seed || 1);
          const row = runOne(modeConfig,gameWallet,seed || 1);
          if (comparableRow(preciseRow) !== comparableRow(row)) throw new Error(`${WALLET_MODE_LABELS[walletMode]}第 ${player*modeConfig.gamesPerPlayer+game+1} 局批次步進與逐幀結果不一致`);
          if (walletMode === "continuous") wallet = row.endingWallet;
          row._runOrder = player * modeConfig.gamesPerPlayer + game;
          serialRows.push(row);
        }
      }
      const parallel = await runWorkerPool(modeConfig,params,["balanced"],2);
      const parallelRows = parallel.rows;
      const sameLength = serialRows.length === parallelRows.length;
      const mismatch = sameLength ? serialRows.findIndex((row,index) => comparableRow(row) !== comparableRow(parallelRows[index])) : 0;
      if (!sameLength || mismatch >= 0) throw new Error(`${WALLET_MODE_LABELS[walletMode]}第 ${Math.max(1,mismatch+1)} 局結果不一致`);
      checkedRows += serialRows.length;
    }
    renderWorkerStatus(`精度檢查通過：逐幀、批次與多核心共 ${checkedRows} 局完全相同`);
    showToast("精度檢查通過：逐幀基準、批次加速與多核心結果完全相同。",false,5000);
  } catch (error) {
    renderWorkerStatus("精度檢查未通過");
    showToast(`精度檢查失敗：${error.message || error}`,true,8000);
  } finally {
    engine.lockParams(false);
    if (ui.paramSource.value === "live" && Object.keys(liveParams).length) engine.setParams(liveParams);
    running = false;
    ui.runBtn.disabled = false;
    ui.trustedRunBtn.disabled = false;
    ui.parityBtn.disabled = false;
  }
}

function setCopyEnabled(enabled) {
  [ui.copySummaryBtn,ui.copyTabBtn,ui.copyAllBtn,ui.saveResultBtn].forEach(button => button.disabled = !enabled);
}

function renderReport(report) {
  const s = report.summary;
  const v = report.validation;
  const chase = report.chase?.summary || {};
  const depth = v.depth || buildDepthValidation(report.waves || [],report.completedSamples,v.targetRtp,v.tolerance);
  ui.rtpValue.textContent = pct(s.rtp,2);
  ui.rtpCi.textContent = `95% 信賴區間 ±${pct(s.ci95,2)}`;
  ui.bossKillValue.textContent = pct(s.bossKillRate,1);
  ui.bossKillMeta.textContent = `${s.bossKilled.toLocaleString()} / ${s.bossSpawned.toLocaleString()} 隻`;
  ui.profitValue.textContent = pct(s.profitRate,1);
  ui.zeroMeta.textContent = `歸零率 ${pct(s.zeroRate,1)}`;
  ui.waveValue.textContent = number(s.avgWave,1);
  ui.volatilityMeta.textContent = `VI ${number(s.volatility,2)}`;
  ui.resultMeta.textContent = `${STRATEGY_LABELS[report.config.strategy]}｜${WALLET_MODE_LABELS[report.config.walletMode] || WALLET_MODE_LABELS.independent}｜${COLLECT_LABELS[report.config.collectPolicy]}｜${report.config.actualWorkerCount || 1} 執行緒｜${report.completedSamples.toLocaleString()} 場｜參數 ${report.paramHash}${report.canceled ? "｜中途停止" : ""}`;

  const overviewRows = [
    ["總 RTP",pct(s.rtp,2),`總賠付 ${Math.round(s.payout).toLocaleString()} / 總 BET ${Math.round(s.bets).toLocaleString()}`],
    ["個人帳面配置 RTP",pct(s.allocatedRtp || 0,2),"實付加上期末個人帳面餘額；僅供核帳，不是玩家實際RTP"],
    ["期末個人帳面餘額",pct(s.closingLiabilityRtp || 0,2),"尚未釋放的個人池可用餘額；永不為負，也不預支未來投注"],
    ["一般怪／一般波 RTP",pct(s.baseRtp || 0,2),`基礎 POT 賠付 ${Math.round(s.basePayout || 0).toLocaleString()} / 總 BET`],
    ["BOSS RTP",pct(s.bossRtp || 0,2),`BOSS 倍率追加賠付 ${Math.round(s.bossPayout || 0).toLocaleString()} / 總 BET`],
    ["個人返還池",`${Math.round(s.personalPools || 0).toLocaleString()} 個`,`每位玩家獨立且跨局沿用；玩家之間不共用`],
    ["投注入水 RTP",pct(s.bets ? (s.mathPoolContribution || 0) / s.bets : 0,2),`累計入水 ${Math.round(s.mathPoolContribution || 0).toLocaleString()}｜Reroll BET ${Math.round(s.rerollSpent || 0).toLocaleString()}`],
    ["倍率重排暫時責任",Math.round(s.mathPoolOperatorAdvance || 0).toLocaleString(),`只支付同一公平平均內的上升分支；由同玩家後續入水回收，配置RTP已扣除`],
    ["帳本守恆",number(s.mathPoolMaxInvariantError || 0,6),`seed + 入水 = available + reserved + paid`],
    ["顯示／實付一致性",s.payoutMismatchCount ? "異常" : "一致",`差異場次 ${Math.round(s.payoutMismatchCount || 0).toLocaleString()}｜最大差額 ${number(s.payoutMismatchMax || 0,6)}`],
    ["目標 RTP",pct(v.targetRtp,2),`各策略容許偏差 ${pct(v.tolerance,2)}`],
    ["策略驗證模式",v.strategyFairnessMode === "isolatedPersonalPool" ? "隔離個人水池" : "非隔離", "每名玩家在完整模擬期間固定同一策略；策略間不共用水池"],
    ["可信樣本",v.trustedSample ? "已達標" : "未達標",`每策略至少 ${TRUSTED_SAMPLES_PER_STRATEGY.toLocaleString()} 場｜目前最少 ${v.minStrategySamples.toLocaleString()} 場`],
    ["策略 RTP 差距",pct(v.empiricalSpread,2),`容許 ${pct(v.tolerance,2)}｜${v.empiricalPass ? "通過" : "未通過"}`],
    ["最大目標偏差",pct(v.maxTargetDeviation,2),`容許 ${pct(v.tolerance,2)}｜${v.targetPass ? "通過" : "未通過"}`],
    ["Cash Out RTP 漂移",`${number(depth.drift*100,2)} pp`,`固定 Collect：第 ${depth.firstWave} 波 ${pct(depth.firstRtp,2)} → 第 ${depth.lastWave} 波 ${pct(depth.lastRtp,2)}`],
    ["深追中立檢查",depth.pass ? "通過" : "未通過",`以每波固定 Collect RTP 判定｜可靠波次 ${depth.waveCount} 個｜最大目標偏差 ${pct(depth.maxDeviation,2)}`],
    ["驗證結論",v.status,v.isValidationMatrix ? `各策略最大 95% 誤差 ±${pct(v.maxStrategyCi95,2)}` : "請使用驗證矩陣比較五種策略"],
    ["95% 信賴區間",`${pct(Math.max(0,s.rtp-s.ci95),2)} ～ ${pct(s.rtp+s.ci95,2)}`,`誤差 ±${pct(s.ci95,2)}`],
    ["Hit Frequency",pct(s.hitRate,1),"有取得賠付的場次比例"],
    ["獲利局比例",pct(s.profitRate,1),"賠付高於該場總 BET"],
    ["1.5x+ 有感獲利局",pct(s.meaningfulWinRate || 0,1),"單局回收至少為該局總 BET 的 1.5 倍"],
    ["1x 保本局",pct(s.breakEvenRate || 0,1),"回收恰好等於該局總 BET，另列且不算獲利"],
    ["2x+ 大獎率",pct(s.win2xRate || 0,3),`5x+ ${pct(s.win5xRate || 0,3)}｜10x+ ${pct(s.win10xRate || 0,3)}`],
    ["20x+ 高倍率",pct(s.win20xRate || 0,4),`50x+ ${pct(s.win50xRate || 0,4)}｜單局最大 ${mult(s.max || 0,2)}`],
    ["曾持有帳面 2x+",pct(chase.had2xRate || 0,2),`曾持有 5x+ ${pct(chase.had5xRate || 0,2)}｜最高帳面 ${mult(chase.peakReturnMax || 0,2)}`],
    ["進入深追樣本",pct(chase.deepReachRate || 0,2),`完成第 6 波並有可 Collect 帳面；終局在第 6 波後 ${pct(chase.deepTerminalRate || 0,2)}`],
    ["深追玩家曾達 2x+",pct(chase.deepPeak2xConditionalRate || 0,2),`以進入深追者為分母｜5x+ ${pct(chase.deepPeak5xConditionalRate || 0,2)}`],
    ["深追終局實領 2x+",pct(chase.deepFinal2xConditionalRate || 0,2),`以第 6 波後終局者為分母｜5x+ ${pct(chase.deepFinal5xConditionalRate || 0,2)}`],
    ["帶著 2x 續追後死亡",pct(chase.twoXRiskDeathRate || 0,2),`所有曾達 2x 的玩家中，最後因續追死亡的比例`],
    ["平均最高帳面倍率",mult(chase.avgPeakReturn || 0,2),`平均在第 ${number(chase.avgPeakWave || 0,1)} 波達到最高帳面`],
    ["歸零率",pct(s.zeroRate,1),"未 Collect 且賠付為 0"],
    ["成功結算率",pct(s.collectedRate,1),"Collect 或 30 波通關"],
    ["30 波通關率",pct(s.completed30Rate,1),"完成第 30 波"],
    ["波動 VI",number(s.volatility,3),"每場回收倍數的標準差"],
    ["執行模式",`${report.config.actualWorkerCount || 1} 執行緒`,report.config.actualWorkerCount > 1 ? "本機 CPU 多核心，戰鬥步長維持 1/60" : "單執行緒精度基準，戰鬥步長 1/60"],
    [report.config.walletMode === "continuous" ? "破產玩家" : "無法開局玩家",`${report.brokePlayers} 人`,report.config.walletMode === "continuous" ? "累積錢包不足以開始下一場" : "起始錢包低於起始 BET"],
    ["執行時間",`${(report.elapsedMs/1000).toFixed(1)} 秒`,`${report.completedSamples.toLocaleString()} / ${report.requestedSamples.toLocaleString()} 場`],
  ];
  ui.overviewBody.innerHTML = overviewRows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
  ui.validationBody.innerHTML = v.strategies.map(row => `<tr>
    <td>${escapeHtml(STRATEGY_LABELS[row.strategy] || row.strategy)}</td><td>${row.samples}</td><td>${pct(row.rtp,2)}</td><td>${pct(row.allocatedRtp ?? row.rtp,2)}</td><td>${pct(row.closingLiabilityRtp || 0,2)}</td>
    <td>${pct(Math.max(0,row.rtp-row.ci95),2)} ～ ${pct(row.rtp+row.ci95,2)}</td>
    <td>${number(row.avgWave,1)}</td><td>${pct(row.minionClearRate,1)}</td><td>${pct(row.modelMinionChance,1)}</td><td>${number(row.modelMinionBuildPower,3)}</td><td>${pct(row.bossKillRate,1)}</td><td>${pct(row.modelBossChance,1)}</td><td>${number(row.modelBossBuildPower,3)}</td><td>${number(row.volatility,3)}</td>
  </tr>`).join("");
  ui.distributionBody.innerHTML = `<tr>${(s.returnDistribution || []).map(row => `<td><strong>${pct(row.rate,2)}</strong><small>${Number(row.count || 0).toLocaleString()} 局</small></td>`).join("")}</tr>`;

  ui.waveBody.innerHTML = report.waves.map(row => `<tr>
    <td>第 ${row.wave} 波</td><td>${row.samples}</td><td>${row.entrants}</td><td>${row.clears}</td>
    <td class="bar-cell"><div class="bar-track"><span style="width:${clamp(row.conditionalSurvival*100,0,100)}%"></span><b>${pct(row.conditionalSurvival,1)}</b></div></td>
    <td>${pct(row.cumulativeSurvival,1)}</td><td>${pct(row.profitRate || 0,1)}</td><td>${pct(row.survivorProfitRate || 0,1)}</td><td>${pct(row.return2xRate || 0,1)}</td><td>${pct(row.return5xRate || 0,1)}</td><td>${number(row.returnMax || 0,2)}x</td><td>${number(row.avgHp,0)}</td><td>${pct(waveBaseHpPct(report,row),1)}</td><td>${number(row.avgPot,1)}</td><td>${number(row.avgPotMultiplier || 0,2)}x</td><td>${number(row.avgTotalBet,1)}</td><td>${pct(row.baseRtp || 0,2)}</td><td>${pct(row.bossRtp || 0,2)}</td><td>${pct(row.checkpointRtp,2)}</td><td>${pct(Math.max(0,row.checkpointRtp-row.cashoutCi95),2)} ～ ${pct(row.checkpointRtp+row.cashoutCi95,2)}</td><td>${pct(row.bossRate,1)}</td>
  </tr>`).join("");
  ui.chaseWaveBody.innerHTML = (report.chase?.waves || []).map(row => `<tr>
    <td>第 ${row.wave} 波</td><td>${Math.round(row.clears || 0).toLocaleString()}</td><td>${pct(row.checkpointRtp || 0,2)}</td>
    <td>${pct(row.profitStateRate || 0,1)}</td><td>${pct(row.x2StateRate || 0,1)}</td><td>${pct(row.x5StateRate || 0,1)}</td>
    <td>${pct(row.continueAfterProfitRate || 0,1)}</td><td>${pct(row.continueAfter2xRate || 0,1)}</td>
    <td>${pct(row.deathAfterProfitRiskRate || 0,1)}</td><td>${pct(row.deathAfter2xRiskRate || 0,1)}</td><td>${number(row.checkpointMax || 0,2)}x</td>
  </tr>`).join("") || `<tr><td colspan="11">這份舊報表尚未包含深追風險資料。</td></tr>`;

  ui.bossBody.innerHTML = report.bosses.length ? report.bosses.map(row => `<tr><td>第 ${row.order} 隻</td><td>${row.encounters}</td><td>${pct(row.reachRate,1)}</td><td>${row.kills}</td><td>${pct(row.killRate,1)}</td><td>${pct(row.avgModelChance,1)}</td><td>${number(row.avgWave,1)}</td><td>+${number(row.avgAdd,2)}</td><td>${pct(row.rtpContribution,2)}</td></tr>`).join("") : `<tr><td colspan="9">本次樣本沒有遇到 BOSS。</td></tr>`;

  ui.buildBody.innerHTML = report.combos.slice(0,100).map(row => `<tr><td>${escapeHtml(row.name)}</td><td>${row.samples}</td><td>${pct(row.samples/report.completedSamples,1)}</td><td>${pct(row.rtp,2)}</td><td>${number(row.avgWave,1)}</td><td>${pct(row.bossKillRate,1)}</td><td>${pct(row.profitRate,1)}</td><td class="${row.samples<20?"sample-low":""}">${row.samples<20?"資料不足":"可比較"}</td></tr>`).join("");
  ui.heroBody.innerHTML = (report.heroes || []).map(row => `<tr><td>${escapeHtml(row.name)}</td><td>${row.samples}</td><td>${pct(row.samples/report.completedSamples,1)}</td><td>${pct(row.rtp,2)}</td><td>${pct(row.allocatedRtp ?? row.rtp,2)}</td><td>${pct(row.closingLiabilityRtp || 0,2)}</td><td>${number(row.avgWave,1)}</td><td>${pct(row.bossKillRate,1)}</td></tr>`).join("");
  ui.towerBody.innerHTML = report.towers.map(row => `<tr><td>${escapeHtml(row.name)}</td><td>${row.samples}</td><td>${pct(row.samples/report.completedSamples,1)}</td><td>${pct(row.rtp,2)}</td><td>${number(row.avgWave,1)}</td><td>${pct(row.bossKillRate,1)}</td></tr>`).join("");
  ui.upgradeBody.innerHTML = report.upgrades.slice(0,150).map(row => `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.tower)}</td><td>${row.samples}</td><td>${number(row.avgCount,2)}</td><td>${pct(row.rtp,2)}</td><td>${number(row.avgWave,1)}</td></tr>`).join("");
  setCopyEnabled(true);
  renderParamStatus();
}

function tsvValue(value) { return String(value ?? "").replace(/[\t\r\n]+/g," "); }
function tsvRows(rows) { return rows.map(row => row.map(tsvValue).join("\t")).join("\n"); }
function sheetCell(value,tone="") { return {value:String(value ?? ""),tone}; }
function sheetValue(value) { return value && typeof value === "object" && "value" in value ? value.value : value; }
function sheetTone(value) { return value && typeof value === "object" ? value.tone || "" : ""; }
function sheetPercent(value,digits=2) { return pct(Number(value),digits); }
function sheetNumber(value,digits=0) { return number(Number(value),digits); }
function rtpTone(value,validation,samples=Infinity) {
  if (samples < 20) return "warn";
  return Math.abs(value-validation.targetRtp) <= validation.tolerance ? "good" : "bad";
}

function reportSections(report) {
  const s=report.summary;
  const v=report.validation;
  const chase=report.chase?.summary || {};
  const depth=v.depth || buildDepthValidation(report.waves || [],report.completedSamples,v.targetRtp,v.tolerance);
  const strategyRows=v.strategies.map(row=>[
    STRATEGY_LABELS[row.strategy]||row.strategy,
    row.samples,
    sheetCell(sheetPercent(row.rtp,2),rtpTone(row.rtp,v,row.samples)),
    sheetPercent(row.allocatedRtp ?? row.rtp,2),
    sheetPercent(row.closingLiabilityRtp || 0,2),
    `${sheetPercent(Math.max(0,row.rtp-row.ci95),2)} ～ ${sheetPercent(row.rtp+row.ci95,2)}`,
    sheetNumber(row.avgWave,1),
    sheetPercent(row.minionClearRate,1),
    sheetPercent(row.modelMinionChance,1),
    sheetNumber(row.modelMinionBuildPower,3),
    sheetPercent(row.bossKillRate,1),
    sheetPercent(row.modelBossChance,1),
    sheetNumber(row.modelBossBuildPower,3),
    sheetNumber(row.volatility,3),
  ]);
  return [
    {id:"settings",title:"模擬設定",headers:["項目","數值"],rows:[
      ["參數名稱",report.paramName],["參數版本",report.paramRevision ?? "--"],["參數雜湊",report.paramHash],["報表時間",new Date(report.createdAt).toLocaleString()],
      ["策略模板",STRATEGY_LABELS[report.config.strategy]],["玩家數",report.config.playerCount],["每人場數",report.config.gamesPerPlayer],["要求場數",report.requestedSamples],["完成場數",report.completedSamples],
      ["錢包模式",WALLET_MODE_LABELS[report.config.walletMode] || WALLET_MODE_LABELS.independent],["起始 BET",report.config.baseBet],["起始錢包",report.config.startWallet],
      ["Collect 策略",COLLECT_LABELS[report.config.collectPolicy]],["最大波次",report.config.maxWave],["決策準確度",sheetPercent(report.config.accuracy,0)],["Reroll 使用率",sheetPercent(report.config.rerollChance || 0,0)],["亂數種子",report.config.seed],
      ["CPU 執行緒",report.config.actualWorkerCount || 1],["執行時間",`${sheetNumber(report.elapsedMs/1000,1)} 秒`],["執行狀態",sheetCell(report.canceled?"中途停止":"完整完成",report.canceled?"warn":"good")],
    ]},
    {id:"core",title:"核心指標",headers:["指標","結果","說明"],rows:[
      ["總 RTP",sheetCell(sheetPercent(s.rtp,2),rtpTone(s.rtp,v,s.samples)),`總賠付 ${Math.round(s.payout)} / 總 BET ${Math.round(s.bets)}`],
      ["一般怪／一般波 RTP",sheetPercent(s.baseRtp || 0,2),`基礎 POT 賠付 ${Math.round(s.basePayout || 0)} / 總 BET`],
      ["BOSS RTP",sheetPercent(s.bossRtp || 0,2),`BOSS 倍率追加賠付 ${Math.round(s.bossPayout || 0)} / 總 BET`],
      ["返還池投入",sheetPercent(s.bets ? (s.mathPoolContribution || 0) / s.bets : 0,2),`累計投入 ${Math.round(s.mathPoolContribution || 0)}`],
      ["舊版餘額釋放",Math.round(s.mathPoolRecycled || 0),"目前正式邏輯不使用；應維持0"],
      ["返還池上限觸發",Math.round(s.mathPoolCapHits || 0),`帳本最大誤差 ${sheetNumber(s.mathPoolMaxInvariantError || 0,6)}`],
      ["顯示／實付一致性",sheetCell(s.payoutMismatchCount ? "異常" : "一致",s.payoutMismatchCount ? "bad" : "good"),`差異場次 ${Math.round(s.payoutMismatchCount || 0)}｜最大差額 ${sheetNumber(s.payoutMismatchMax || 0,6)}`],
      ["目標 RTP",sheetPercent(v.targetRtp,2),`策略容許差 ${sheetPercent(v.tolerance,2)}`],
      ["95% 信賴區間",`${sheetPercent(Math.max(0,s.rtp-s.ci95),2)} ～ ${sheetPercent(s.rtp+s.ci95,2)}`,`誤差 ±${sheetPercent(s.ci95,2)}`],
      ["莊家期望差",sheetCell(sheetPercent(1-s.rtp,2),s.rtp<1?"good":s.rtp>1?"bad":"warn"),"1 - 實跑 RTP；尚未扣除營運成本"],
      ["BOSS 擊殺率",sheetPercent(s.bossKillRate,1),`${s.bossKilled} / ${s.bossSpawned} 隻`],["獲利局比例",sheetPercent(s.profitRate,1),"賠付高於該場總 BET"],
      ["歸零率",sheetPercent(s.zeroRate,1),"未成功結算且賠付為 0"],["Hit Frequency",sheetPercent(s.hitRate,1),"有取得賠付的場次比例"],
      ["成功結算率",sheetPercent(s.collectedRate,1),"Collect 或 30 波通關"],["30 波通關率",sheetPercent(s.completed30Rate,1),"完成第 30 波"],
      ["平均到達波次",sheetNumber(s.avgWave,1),"所有樣本平均"],["波動 VI",sheetNumber(s.volatility,3),"每場回收倍數標準差"],
      ["曾持有帳面 2x+",sheetPercent(chase.had2xRate || 0,2),`曾持有 5x+ ${sheetPercent(chase.had5xRate || 0,2)}`],
      ["進入深追樣本",sheetPercent(chase.deepReachRate || 0,2),`完成第 6 波並有可 Collect 帳面；終局在第 6 波後 ${sheetPercent(chase.deepTerminalRate || 0,2)}`],
      ["深追玩家曾達 2x+",sheetPercent(chase.deepPeak2xConditionalRate || 0,2),`以進入深追者為分母｜5x+ ${sheetPercent(chase.deepPeak5xConditionalRate || 0,2)}`],
      ["深追終局實領 2x+",sheetPercent(chase.deepFinal2xConditionalRate || 0,2),`以第 6 波後終局者為分母｜5x+ ${sheetPercent(chase.deepFinal5xConditionalRate || 0,2)}`],
      ["帶著 2x 續追後死亡",sheetPercent(chase.twoXRiskDeathRate || 0,2),"所有曾達 2x 的玩家中，最後因續追死亡的比例"],
      ["平均最高帳面倍率",`${sheetNumber(chase.avgPeakReturn || 0,2)}x`,`平均在第 ${sheetNumber(chase.avgPeakWave || 0,1)} 波達到峰值`],
    ]},
    {id:"validation",title:"實跑驗證",headers:["檢查項目","結果","門檻／說明"],rows:[
      ["驗證狀態",sheetCell(v.status,v.status==="通過"?"good":v.status==="未通過"?"bad":"warn"),v.isValidationMatrix?"五種策略矩陣":"目前只有單策略"],
      ["策略驗證模式",v.strategyFairnessMode === "isolatedPersonalPool" ? "隔離個人水池" : "非隔離","策略公平性只能使用固定策略、獨立水池樣本"],
      ["可信樣本",sheetCell(v.trustedSample?"已達標":"未達標",v.trustedSample?"good":"warn"),`每策略至少 ${TRUSTED_SAMPLES_PER_STRATEGY} 場；目前最少 ${v.minStrategySamples} 場`],
      ["最大 95% 誤差",sheetPercent(v.maxStrategyCi95,2),"策略中最大的統計誤差"],
      ["最大目標偏差",sheetCell(sheetPercent(v.maxTargetDeviation,2),v.targetPass?"good":"bad"),`容許 ${sheetPercent(v.tolerance,2)}`],
      ["策略 RTP 差距",sheetCell(sheetPercent(v.empiricalSpread,2),v.empiricalPass?"good":"bad"),`容許 ${sheetPercent(v.tolerance,2)}`],
      ["Cash Out RTP 差距",sheetPercent(v.cashoutSpread || 0,2),"有限樣本仍受各群組期末個人池責任影響"],
      ["固定波深度驗證",depth.applicable===false?sheetCell("不適用","warn"):sheetCell(`${sheetNumber(depth.drift*100,2)} pp`,depth.pass?"good":"bad"),depth.applicable===false?"本次為真人／動態 Collect；逐波資料是條件切片，不能當固定波次 RTP":`固定 Collect：第 ${depth.firstWave} 波 ${sheetPercent(depth.firstRtp,2)} → 第 ${depth.lastWave} 波 ${sheetPercent(depth.lastRtp,2)}`],
      ["波次最大目標偏差",depth.applicable===false?"—":sheetCell(sheetPercent(depth.maxDeviation,2),depth.pass?"good":"warn"),depth.applicable===false?"請改跑固定波次矩陣驗證":"以各波固定 Collect RTP 判定"],
      ["波次信賴區間",depth.applicable===false?"—":sheetCell(depth.targetInIntervals?"通過":"未通過",depth.targetInIntervals?"good":"bad"),depth.applicable===false?"不使用條件切片判斷深度套利":`可靠波次 ${depth.waveCount} 個；每波至少 ${depth.minimumCashouts || depth.minimumEntrants} 次成功 Collect`],
      ["目標落在信賴區間",sheetCell(v.targetInIntervals?"是":"否",v.targetInIntervals?"good":"warn"),"所有策略的 95% 區間是否包含目標 RTP"],
    ]},
    {id:"strategies",title:"策略比較",headers:["策略","樣本","Cash Out RTP","配置 RTP","期末責任","95% 區間","平均波次","一般通過率","一般預估","一般強度","BOSS 擊殺率","BOSS 預估","BOSS 強度","VI"],rows:strategyRows},
    {id:"distribution",title:"賠付分布",headers:["P50","P75","P90","P95","P99","最高"],rows:[[sheetNumber(s.p50,2),sheetNumber(s.p75,2),sheetNumber(s.p90,2),sheetNumber(s.p95,2),sheetNumber(s.p99,2),sheetNumber(s.max,2)]]},
    {id:"waves",title:depth.applicable===false?"真人 Collect 行為切片（不作固定波 RTP 驗證）":"固定於第 N 波 Collect 的長期 RTP（Crash 報表）",headers:["波次","全部樣本","進入波次","成功 Collect","條件通過率",depth.applicable===false?"該條件樣本成功率":"固定收手成功率","獲利局率（含死亡）","存活獲利率","2x+","5x+","最大倍數","存活者平均 HP","基地 HP%（含死亡）","平均 POT","POT 加權平均倍率","平均已付 BET","一般波 RTP","BOSS RTP",depth.applicable===false?"條件樣本回收率（非固定波 RTP）":"固定收手 RTP","95% 區間","BOSS 波比例"],rows:report.waves.map(row=>[
      `第 ${row.wave} 波`,row.samples,row.entrants,row.clears,sheetPercent(row.conditionalSurvival,1),sheetPercent(row.cumulativeSurvival,1),sheetPercent(row.profitRate || 0,1),sheetPercent(row.survivorProfitRate || 0,1),sheetPercent(row.return2xRate || 0,1),sheetPercent(row.return5xRate || 0,1),`${sheetNumber(row.returnMax || 0,2)}x`,sheetNumber(row.avgHp,0),sheetPercent(waveBaseHpPct(report,row),1),sheetNumber(row.avgPot,1),`${sheetNumber(row.avgPotMultiplier || 0,2)}x`,sheetNumber(row.avgTotalBet,1),sheetPercent(row.baseRtp || 0,2),sheetPercent(row.bossRtp || 0,2),sheetPercent(row.checkpointRtp,2),`${sheetPercent(Math.max(0,row.checkpointRtp-row.cashoutCi95),2)} ～ ${sheetPercent(row.checkpointRtp+row.cashoutCi95,2)}`,sheetPercent(row.bossRate,1),
    ])},
    {id:"chaseSummary",title:"POT 深追風險摘要",headers:["指標","結果","說明"],rows:[
      ["曾經帳面獲利",sheetPercent(chase.hadProfitRate || 0,2),"任一清場節點的可 Collect 金額高於累計 BET"],
      ["曾經帳面 2x+",sheetPercent(chase.had2xRate || 0,2),`其中最後死亡 ${sheetPercent(chase.twoXRiskDeathRate || 0,2)}`],
      ["曾經帳面 5x+",sheetPercent(chase.had5xRate || 0,2),`最後死亡占全部樣本 ${sheetPercent(chase.diedAfter5xRate || 0,2)}`],
      ["進入深追樣本",sheetPercent(chase.deepReachRate || 0,2),`終局在第 6 波後 ${sheetPercent(chase.deepTerminalRate || 0,2)}`],
      ["深追玩家曾達 2x+",sheetPercent(chase.deepPeak2xConditionalRate || 0,2),`以進入深追者為分母｜占全部樣本 ${sheetPercent(chase.deepPeak2xRate || 0,2)}`],
      ["深追玩家曾達 5x+",sheetPercent(chase.deepPeak5xConditionalRate || 0,2),`以進入深追者為分母｜占全部樣本 ${sheetPercent(chase.deepPeak5xRate || 0,2)}`],
      ["深追終局實領 2x+",sheetPercent(chase.deepFinal2xConditionalRate || 0,2),`以第 6 波後終局者為分母｜占全部樣本 ${sheetPercent(chase.deepFinal2xRate || 0,2)}`],
      ["深追終局實領 5x+",sheetPercent(chase.deepFinal5xConditionalRate || 0,2),`以第 6 波後終局者為分母｜占全部樣本 ${sheetPercent(chase.deepFinal5xRate || 0,2)}`],
      ["2x 深追下一波",`${chase.twoXTransitionCount || 0} 次`, `通過 ${sheetPercent(chase.twoXNextClearRate || 0,1)}｜死亡 ${sheetPercent(chase.twoXNextDeathRate || 0,1)}`],
      ["2x 後總回收比走向",`同區間 ${sheetPercent(chase.twoXFlatRate || 0,1)}`,`Cashout ÷ 累積總BET：上升>15% ${sheetPercent(chase.twoXUpRate || 0,1)}｜下降>15% ${sheetPercent(chase.twoXDownRate || 0,1)}｜仍≥2x ${sheetPercent(chase.twoXRetainRate || 0,1)}；BOSS 顯示倍率另行累加`],
      ["2x 深追實際淨利",`增加 ${sheetPercent(chase.twoXProfitUpRate || 0,1)}`,`持平 ${sheetPercent(chase.twoXProfitFlatRate || 0,1)}｜減少 ${sheetPercent(chase.twoXProfitDownRate || 0,1)}`],
      ["2x 深追平均狀態",`${sheetNumber(chase.twoXAvgStartRatio || 0,2)}x → ${sheetNumber(chase.twoXAvgNextRatio || 0,2)}x`,`平均淨利 ${sheetNumber(chase.twoXAvgStartProfit || 0,0)} → ${sheetNumber(chase.twoXAvgNextProfit || 0,0)}`],
      ["第6波已2x的最終結果",`${chase.wave6TwoXCount || 0} 局`,`繼續 ${sheetPercent(chase.wave6ContinueRate || 0,1)}｜最終死亡 ${sheetPercent(chase.wave6FinalDeathRate || 0,1)}｜最終仍≥2x ${sheetPercent(chase.wave6Final2xRate || 0,1)}`],
      ["平均最高帳面倍率",`${sheetNumber(chase.avgPeakReturn || 0,2)}x`,`平均峰值波次 ${sheetNumber(chase.avgPeakWave || 0,1)}｜最高 ${sheetNumber(chase.peakReturnMax || 0,2)}x`],
    ]},
    {id:"chaseWaves",title:"逐波 POT 深追風險",headers:["波次","清場檢查點","帳面 RTP","帳面獲利","帳面 2x+","帳面 5x+","獲利後繼續","2x 後繼續","續追後死亡","2x 續追後死亡","2x轉移樣本","下一波死亡","總回收比上升>15%","總回收比同區間","總回收比下降>15%","仍≥2x","淨利增加","淨利持平","淨利減少","平均總回收比變化","平均淨利變化","該波最高"],rows:(report.chase?.waves || []).map(row=>[
      `第 ${row.wave} 波`,row.clears,sheetPercent(row.checkpointRtp || 0,2),sheetPercent(row.profitStateRate || 0,1),sheetPercent(row.x2StateRate || 0,1),sheetPercent(row.x5StateRate || 0,1),sheetPercent(row.continueAfterProfitRate || 0,1),sheetPercent(row.continueAfter2xRate || 0,1),sheetPercent(row.deathAfterProfitRiskRate || 0,1),sheetPercent(row.deathAfter2xRiskRate || 0,1),row.twoXTransitions || 0,sheetPercent(row.twoXNextDeathRate || 0,1),sheetPercent(row.twoXUpRate || 0,1),sheetPercent(row.twoXFlatRate || 0,1),sheetPercent(row.twoXDownRate || 0,1),sheetPercent(row.twoXRetainRate || 0,1),sheetPercent(row.twoXProfitUpRate || 0,1),sheetPercent(row.twoXProfitFlatRate || 0,1),sheetPercent(row.twoXProfitDownRate || 0,1),`${sheetNumber(row.twoXAvgStartRatio || 0,2)}x → ${sheetNumber(row.twoXAvgNextRatio || 0,2)}x`,`${sheetNumber(row.twoXAvgStartProfit || 0,0)} → ${sheetNumber(row.twoXAvgNextProfit || 0,0)}`,`${sheetNumber(row.checkpointMax || 0,2)}x`,
    ])},
    {id:"bosses",title:"逐隻 BOSS 分析",headers:["BOSS 順序","遭遇次數","到達率","擊殺數","擊殺率","模型預估","平均出現波次","平均增加倍率","RTP 貢獻"],rows:report.bosses.length?report.bosses.map(row=>[
      `第 ${row.order} 隻`,row.encounters,sheetPercent(row.reachRate,1),row.kills,sheetPercent(row.killRate,1),sheetPercent(row.avgModelChance,1),sheetNumber(row.avgWave,1),`+${sheetNumber(row.avgAdd,2)}`,sheetPercent(row.rtpContribution,2),
    ]):[["本次樣本沒有遇到 BOSS"]]},
    {id:"builds",title:"最終 Build 組合",headers:["最終塔組合","樣本","占比","RTP","平均波次","BOSS 擊殺率","獲利率","判定"],rows:report.combos.map(row=>[
      row.name,row.samples,sheetPercent(row.samples/report.completedSamples,1),sheetCell(sheetPercent(row.rtp,2),rtpTone(row.rtp,v,row.samples)),sheetNumber(row.avgWave,1),sheetPercent(row.bossKillRate,1),sheetPercent(row.profitRate,1),sheetCell(row.samples<20?"資料不足":"可比較",row.samples<20?"warn":"good"),
    ])},
    {id:"heroes",title:"角色表現",headers:["角色","使用場數","使用率","Cash Out RTP","配置 RTP","期末未付責任","平均波次","BOSS 擊殺率"],rows:(report.heroes || []).map(row=>[
      row.name,row.samples,sheetPercent(row.samples/report.completedSamples,1),sheetCell(sheetPercent(row.rtp,2),rtpTone(row.rtp,v,row.samples)),sheetPercent(row.allocatedRtp ?? row.rtp,2),sheetPercent(row.closingLiabilityRtp || 0,2),sheetNumber(row.avgWave,1),sheetPercent(row.bossKillRate,1),
    ])},
    {id:"towers",title:"單塔表現",headers:["塔","使用場數","使用率","含此塔 RTP","平均波次","BOSS 擊殺率"],rows:report.towers.map(row=>[
      row.name,row.samples,sheetPercent(row.samples/report.completedSamples,1),sheetCell(sheetPercent(row.rtp,2),rtpTone(row.rtp,v,row.samples)),sheetNumber(row.avgWave,1),sheetPercent(row.bossKillRate,1),
    ])},
    {id:"upgrades",title:"升級選取表現",headers:["升級","所屬塔","取得場數","平均取得次數","含此升級 RTP","平均波次"],rows:report.upgrades.map(row=>[
      row.name,row.tower,row.samples,sheetNumber(row.avgCount,2),sheetCell(sheetPercent(row.rtp,2),rtpTone(row.rtp,v,row.samples)),sheetNumber(row.avgWave,1),
    ])},
  ];
}

function sectionsForCopy(report,scope="all",tab=currentTab) {
  const sections=reportSections(report);
  if (scope === "summary") return sections.filter(section=>["settings","core","validation","strategies","distribution","chaseSummary"].includes(section.id));
  if (scope === "tab") {
    const ids=tab==="waves"?["waves","chaseSummary","chaseWaves"]:tab==="bosses"?["bosses"]:tab==="builds"?["builds","heroes","towers","upgrades"]:["settings","core","validation","strategies","distribution","chaseSummary"];
    return sections.filter(section=>ids.includes(section.id));
  }
  return sections;
}

function sectionsTsv(report,sections) {
  const rows=[["塔防 RTP 模擬報告"],["報表時間",new Date(report.createdAt).toLocaleString()],["參數雜湊",report.paramHash],[]];
  sections.forEach(section=>{
    rows.push([section.title],section.headers,...section.rows.map(row=>row.map(sheetValue)),[]);
  });
  return tsvRows(rows);
}

function reportHtml(report,sections) {
  const maxColumns=Math.max(2,...sections.map(section=>section.headers.length));
  const border="border:1px solid #9fb3c8;";
  const base=`${border}padding:6px 9px;font-family:Arial,'Microsoft JhengHei',sans-serif;font-size:11pt;white-space:nowrap;vertical-align:middle;`;
  const toneStyles={good:"background:#e2f0d9;color:#215e31;font-weight:700;",warn:"background:#fff2cc;color:#7f6000;font-weight:700;",bad:"background:#f4cccc;color:#9c0006;font-weight:700;",info:"background:#ddebf7;color:#1f4e78;font-weight:700;"};
  const blankCells=count=>Array.from({length:count},()=>`<td style="${base}background:#ffffff;"></td>`).join("");
  const body=[];
  body.push(`<tr><td colspan="${maxColumns}" style="${base}background:#17365d;color:#ffffff;font-size:16pt;font-weight:700;padding:10px;">塔防 RTP 模擬報告</td></tr>`);
  body.push(`<tr><td style="${base}background:#d9eaf7;font-weight:700;">報表時間</td><td style="${base}">${escapeHtml(new Date(report.createdAt).toLocaleString())}</td>${blankCells(maxColumns-2)}</tr>`);
  body.push(`<tr><td style="${base}background:#d9eaf7;font-weight:700;">參數識別</td><td style="${base}">${escapeHtml(`${report.paramName}｜v${report.paramRevision ?? "--"}｜${report.paramHash}`)}</td>${blankCells(maxColumns-2)}</tr>`);
  sections.forEach(section=>{
    body.push(`<tr><td colspan="${maxColumns}" style="height:8px;background:#ffffff;border:0;"></td></tr>`);
    body.push(`<tr><td colspan="${maxColumns}" style="${base}background:#1f4e78;color:#ffffff;font-size:12pt;font-weight:700;padding:8px;">${escapeHtml(section.title)}</td></tr>`);
    body.push(`<tr>${section.headers.map(header=>`<th style="${base}background:#d9eaf7;color:#17365d;font-weight:700;text-align:left;">${escapeHtml(header)}</th>`).join("")}${blankCells(maxColumns-section.headers.length)}</tr>`);
    section.rows.forEach((row,rowIndex)=>{
      const background=rowIndex%2===0?"#ffffff":"#f4f8fb";
      const cells=row.map((cell,columnIndex)=>{
        const tone=toneStyles[sheetTone(cell)]||"";
        const first=columnIndex===0?"font-weight:600;":"";
        return `<td style="${base}background:${background};${first}${tone}">${escapeHtml(sheetValue(cell))}</td>`;
      }).join("");
      body.push(`<tr>${cells}${blankCells(maxColumns-row.length)}</tr>`);
    });
  });
  return `<html><head><meta charset="utf-8"></head><body><table cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${body.join("")}</table></body></html>`;
}

async function copyPlainText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const area=document.createElement("textarea");
    area.value=text; area.style.position="fixed"; area.style.left="-10000px"; document.body.appendChild(area); area.select();
    const copied=document.execCommand("copy"); area.remove(); return copied;
  }
}

function legacyCopyHtml(html) {
  try {
    const holder=document.createElement("div");
    holder.contentEditable="true"; holder.style.position="fixed"; holder.style.left="-10000px"; holder.innerHTML=html; document.body.appendChild(holder);
    const range=document.createRange(); range.selectNodeContents(holder);
    const selection=window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    const copied=document.execCommand("copy"); selection.removeAllRanges(); holder.remove(); return copied;
  } catch { return false; }
}

async function copyReport(report,scope,label,tab=currentTab) {
  const sections=sectionsForCopy(report,scope,tab);
  const text=sectionsTsv(report,sections);
  const html=reportHtml(report,sections);
  let rich=false;
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") throw new Error("rich clipboard unavailable");
    await navigator.clipboard.write([new ClipboardItem({
      "text/html":new Blob([html],{type:"text/html"}),
      "text/plain":new Blob([text],{type:"text/plain"}),
    })]);
    rich=true;
  } catch {
    rich=legacyCopyHtml(html);
    if (!rich) await copyPlainText(text);
  }
  showToast(rich?`${label}已複製，貼到試算表會保留分區、底色與標色。`:`${label}已用相容格式複製。`,false,5200);
}

function showToast(message,error=false,duration=4000) {
  ui.toast.textContent=message;
  ui.toast.className=`toast${error?" error":""}`;
  window.clearTimeout(showToast.timer);
  showToast.timer=window.setTimeout(()=>{ if(ui.toast.textContent===message) ui.toast.textContent=""; },duration);
}

function switchTab(name) {
  currentTab=name;
  document.querySelectorAll(".result-tab").forEach(button=>button.classList.toggle("active",button.dataset.tab===name));
  document.querySelectorAll(".result-panel").forEach(panel=>panel.classList.toggle("active",panel.id===`${name}Tab`));
}

function renderProfiles() {
  ui.profileSelect.innerHTML=`<option value="">載入設定檔</option>${profiles.map(profile=>`<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name)}</option>`).join("")}`;
}

function saveProfile() {
  const name=ui.profileName.value.trim() || `設定 ${new Date().toLocaleString()}`;
  profiles.unshift({id:id("profile"),name,createdAt:new Date().toISOString(),config:readConfig()});
  profiles=profiles.slice(0,30);
  saveList(PROFILE_STORAGE_KEY,profiles);
  renderProfiles();
  ui.profileName.value="";
  showToast(`已儲存設定「${name}」。`);
}

function renderSnapshots() {
  refreshParamSources();
  ui.snapshotBody.innerHTML=snapshots.length?snapshots.map(snapshot=>`<tr><td>${escapeHtml(snapshot.name)}</td><td>v${escapeHtml(snapshot.params.balanceRevision??"--")}</td><td>${escapeHtml(snapshot.hash)}</td><td>${new Date(snapshot.createdAt).toLocaleString()}</td><td><span class="row-actions"><button class="button secondary" type="button" data-use-snapshot="${escapeHtml(snapshot.id)}">使用</button><button class="button danger" type="button" data-delete-snapshot="${escapeHtml(snapshot.id)}">刪除</button></span></td></tr>`).join(""):`<tr><td colspan="5">尚未儲存參數快照。</td></tr>`;
}

function saveSnapshot() {
  const source=selectedParamRecord();
  const name=ui.snapshotName.value.trim() || `參數 ${new Date().toLocaleString()}`;
  const params=engine?.normalizeParams ? engine.normalizeParams(source.params) : clone(source.params);
  snapshots.unshift({id:id("params"),name,createdAt:new Date().toISOString(),hash:paramHash(params),params});
  snapshots=snapshots.slice(0,30);
  saveList(SNAPSHOT_STORAGE_KEY,snapshots);
  ui.snapshotName.value="";
  renderSnapshots();
  showToast(`已儲存參數快照「${name}」。`);
}

function exportParams() {
  const source=selectedParamRecord();
  const payload={name:source.name,createdAt:new Date().toISOString(),hash:paramHash(source.params),params:source.params};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download=`td-params-${payload.hash}.json`;
  link.click();
  window.setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  showToast("已匯出目前參數 JSON。");
}

async function importParams(file) {
  if(!file)return;
  try{
    const json=JSON.parse(await file.text());
    const imported=json.params&&typeof json.params==="object"?json.params:json;
    const params=engine?.normalizeParams ? engine.normalizeParams(imported) : imported;
    if(!params||typeof params!=="object"||!Object.keys(params).length)throw new Error("檔案沒有參數");
    const name=json.name||file.name.replace(/\.json$/i,"")||`匯入參數 ${new Date().toLocaleString()}`;
    snapshots.unshift({id:id("params"),name,createdAt:new Date().toISOString(),hash:paramHash(params),params:clone(params)});
    snapshots=snapshots.slice(0,30);
    saveList(SNAPSHOT_STORAGE_KEY,snapshots);
    renderSnapshots();
    showToast(`已匯入參數快照「${name}」。`);
  }catch(error){showToast(`參數匯入失敗：${error.message||error}`,true);}
  finally{ui.importParamsInput.value="";}
}

function compactReport(report) {
  return clone(report);
}

function saveResult() {
  if (!currentReport) return;
  const name=`${STRATEGY_LABELS[currentReport.config.strategy]} ${new Date().toLocaleString()}`;
  resultHistory.unshift({id:id("history"),name,createdAt:new Date().toISOString(),report:compactReport(currentReport)});
  resultHistory=resultHistory.slice(0,12);
  saveList(RESULT_STORAGE_KEY,resultHistory);
  renderHistory();
  showToast(`已儲存模擬結果「${name}」。`);
}

function renderHistory() {
  ui.historyBody.innerHTML=resultHistory.length?resultHistory.map(item=>`<tr><td>${escapeHtml(item.name)}</td><td>${pct(item.report.summary.rtp,2)}</td><td>${item.report.completedSamples}</td><td>${escapeHtml(item.report.paramHash)}</td><td>${new Date(item.createdAt).toLocaleString()}</td><td><span class="row-actions"><button class="button secondary" type="button" data-load-result="${escapeHtml(item.id)}">載入</button><button class="button danger" type="button" data-delete-result="${escapeHtml(item.id)}">刪除</button></span></td></tr>`).join(""):`<tr><td colspan="6">尚未儲存模擬結果。</td></tr>`;
}

function bindEvents() {
  [ui.strategy,ui.playerCount,ui.gamesPerPlayer,ui.walletMode,ui.baseBet,ui.startWallet,ui.collectPolicy,ui.maxWave,ui.accuracy,ui.rerollChance,ui.seed,ui.workerCount].forEach(control=>control.addEventListener("change",updateSampleTotal));
  ui.playerCount.addEventListener("input",updateSampleTotal);
  ui.gamesPerPlayer.addEventListener("input",updateSampleTotal);
  ui.runBtn.addEventListener("click",runSimulation);
  ui.trustedRunBtn.addEventListener("click",runTrustedSimulation);
  ui.parityBtn.addEventListener("click",runParityCheck);
  ui.cancelBtn.addEventListener("click",()=>{
    cancelRequested=true;
    ui.cancelBtn.disabled=true;
    ui.progressText.textContent+="｜正在停止";
    activeParallelCancel?.();
  });
  ui.refreshParamsBtn.addEventListener("click",readLiveParams);
  ui.paramSource.addEventListener("change",()=>renderParamStatus());
  ui.saveProfileBtn.addEventListener("click",saveProfile);
  ui.profileSelect.addEventListener("change",()=>{const profile=profiles.find(item=>item.id===ui.profileSelect.value);ui.deleteProfileBtn.disabled=!profile;if(profile){writeConfig(profile.config);showToast(`已載入設定「${profile.name}」。`);}});
  ui.deleteProfileBtn.addEventListener("click",()=>{const selected=ui.profileSelect.value;if(!selected)return;profiles=profiles.filter(item=>item.id!==selected);saveList(PROFILE_STORAGE_KEY,profiles);renderProfiles();ui.deleteProfileBtn.disabled=true;showToast("已刪除設定檔。");});
  document.querySelectorAll(".result-tab").forEach(button=>button.addEventListener("click",()=>switchTab(button.dataset.tab)));
  ui.copySummaryBtn.addEventListener("click",()=>currentReport&&copyReport(currentReport,"summary","摘要"));
  ui.copyTabBtn.addEventListener("click",()=>currentReport&&copyReport(currentReport,"tab","目前報表",currentTab));
  ui.copyAllBtn.addEventListener("click",()=>currentReport&&copyReport(currentReport,"all","完整報表"));
  ui.saveResultBtn.addEventListener("click",saveResult);
  ui.saveSnapshotBtn.addEventListener("click",saveSnapshot);
  ui.exportParamsBtn.addEventListener("click",exportParams);
  ui.importParamsInput.addEventListener("change",()=>importParams(ui.importParamsInput.files?.[0]));
  ui.snapshotBody.addEventListener("click",event=>{
    const use=event.target.closest("[data-use-snapshot]");
    const remove=event.target.closest("[data-delete-snapshot]");
    if(use){ui.paramSource.value=use.dataset.useSnapshot;renderParamStatus();showToast("已選用參數快照，下一次模擬會使用此版本。");}
    if(remove){snapshots=snapshots.filter(item=>item.id!==remove.dataset.deleteSnapshot);saveList(SNAPSHOT_STORAGE_KEY,snapshots);renderSnapshots();}
  });
  ui.historyBody.addEventListener("click",event=>{
    const load=event.target.closest("[data-load-result]");
    const remove=event.target.closest("[data-delete-result]");
    if(load){const item=resultHistory.find(row=>row.id===load.dataset.loadResult);if(item){currentReport=clone(item.report);renderReport(currentReport);switchTab("overview");showToast(`已載入「${item.name}」。`);}}
    if(remove){resultHistory=resultHistory.filter(item=>item.id!==remove.dataset.deleteResult);saveList(RESULT_STORAGE_KEY,resultHistory);renderHistory();}
  });
}

async function init() {
  const autoOption = ui.workerCount.querySelector('option[value="auto"]');
  if (autoOption) autoOption.textContent = `自動（${automaticWorkerCount()} 執行緒）`;
  loadCurrentConfig();
  renderProfiles();
  renderSnapshots();
  renderHistory();
  bindEvents();
  try {
    await waitForEngine();
    readLiveParams();
    if (!Object.keys(liveParams).length) receiveLiveParams(engine.params());
    showToast("戰鬥模擬核心已就緒。",false,1800);
  } catch(error) {
    showToast(error.message || String(error),true,10000);
  }
  try {
    paramChannel=new BroadcastChannel(PARAM_CHANNEL);
    paramChannel.onmessage=event=>{if(event.data?.type==="towerDefenseParams")receiveLiveParams(event.data.params);};
  } catch {}
  window.addEventListener("storage",event=>{if(event.key===PARAM_STORAGE_KEY&&event.newValue){try{receiveLiveParams(JSON.parse(event.newValue));}catch{}}});
}

init();
