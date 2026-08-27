"use strict";

class ClassListStub {
  constructor(initial = []) { this.values = new Set(initial); }
  add(...names) { names.forEach(name => this.values.add(name)); }
  remove(...names) { names.forEach(name => this.values.delete(name)); }
  toggle(name, force) {
    const enabled = force === undefined ? !this.values.has(name) : !!force;
    if (enabled) this.values.add(name); else this.values.delete(name);
    return enabled;
  }
  contains(name) { return this.values.has(name); }
}

function noopContext() {
  const gradient = { addColorStop() {} };
  return new Proxy({}, {
    get(target, prop) {
      if (prop === "createLinearGradient" || prop === "createRadialGradient") return () => gradient;
      if (prop === "measureText") return () => ({ width:0 });
      if (!(prop in target)) target[prop] = () => {};
      return target[prop];
    },
    set(target, prop, value) { target[prop] = value; return true; },
  });
}

class ElementStub {
  constructor(tag = "div", id = "") {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.children = [];
    this.listeners = {};
    this.classList = new ClassListStub(id.endsWith("Overlay") ? ["hidden"] : []);
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.dataset = {};
    this.textContent = "";
    this.disabled = false;
    this.hidden = false;
    this.offsetWidth = 100;
    this.queried = new Map();
    this.width = id === "game" ? 350 : 0;
    this.height = id === "game" ? 760 : 0;
    this._innerHTML = "";
  }
  set innerHTML(value) { this._innerHTML = value; if (!value) this.children = []; }
  get innerHTML() { return this._innerHTML; }
  appendChild(child) { this.children.push(child); return child; }
  append(...children) { this.children.push(...children); }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  setAttribute(name, value) { this[name] = String(value); }
  removeAttribute(name) { delete this[name]; }
  querySelector(selector) {
    if (!this.queried.has(selector)) this.queried.set(selector, new ElementStub());
    return this.queried.get(selector);
  }
  remove() {}
  select() {}
  closest() { return this._closest || this; }
  click() {
    const event = { preventDefault() {}, stopPropagation() {} };
    if (this.listeners.click) this.listeners.click(event);
    else if (typeof this.onclick === "function") this.onclick(event);
  }
  getContext() { return noopContext(); }
}

function installHeadlessDom() {
  const elements = new Map();
  const getElement = id => {
    if (!elements.has(id)) elements.set(id, new ElementStub(id === "game" || id.endsWith("Icon") ? "canvas" : "div", id));
    return elements.get(id);
  };
  getElement("waveText")._closest = new ElementStub("div", "waveChip");
  const potChip = new ElementStub("div", "potChip");
  const phone = new ElementStub("div", "phone");
  const bottomUi = new ElementStub("div", "bottomUi");
  const body = new ElementStub("body", "body");
  const documentElement = new ElementStub("html", "html");
  self.window = self;
  self.document = {
    body,
    documentElement,
    hidden:false,
    getElementById:getElement,
    querySelector(selector) {
      if (selector === ".pot-chip") return potChip;
      if (selector === ".phone") return phone;
      if (selector === ".bottom-ui") return bottomUi;
      return new ElementStub();
    },
    querySelectorAll() { return []; },
    createElement(tag) { return new ElementStub(tag); },
    addEventListener() {},
  };
  self.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
  self.BroadcastChannel = class { constructor() { this.onmessage = null; } postMessage() {} close() {} };
  self.requestAnimationFrame = () => 1;
  self.cancelAnimationFrame = () => {};
  self.visualViewport = { height:844, addEventListener() {} };
  self.innerHeight = 844;
}

installHeadlessDom();
importScripts("simulator-core.js?v=deep-chase-minion210", "game.js?v=deep-chase-minion210");

const engine = self.__tdHeadless;
if (!engine?.ready) throw new Error("Worker 戰鬥引擎載入失敗");

function runAssignments(message) {
  const { config, params, assignments, chunkSize = 100 } = message;
  engine.setParams(params || {});
  engine.lockParams(true);
  let completed = 0;
  let brokePlayers = 0;
  let buffer = [];

  const flush = () => {
    if (!buffer.length) return;
    self.postMessage({ type:"rows", rows:buffer, completed });
    buffer = [];
  };

  for (let assignmentIndex = 0; assignmentIndex < assignments.length; assignmentIndex += 1) {
    const assignment = assignments[assignmentIndex];
    engine.resetMathPool?.(config.baseBet);
    const cashoutWave = Math.max(1,Math.min(config.maxWave,Number(assignment.cashoutWave)||config.maxWave));
    let wallet = config.startWallet;
    const gameStart = assignment.gameStart ?? 0;
    const gameEnd = assignment.gameEnd ?? config.gamesPerPlayer;
    for (let game = gameStart; game < gameEnd; game += 1) {
      const strategyCycle = Array.isArray(assignment.strategyCycle) && assignment.strategyCycle.length
        ? assignment.strategyCycle
        : [assignment.strategy];
      const strategy = strategyCycle[(game+(Number(assignment.strategyOffset)||0))%strategyCycle.length];
      const heroCycle = Array.isArray(assignment.heroCycle) && assignment.heroCycle.length
        ? assignment.heroCycle
        : [assignment.heroId || config.forcedHeroId || ""];
      const forcedHeroId = heroCycle[(game+(Number(assignment.heroOffset)||0))%heroCycle.length];
      const strategyConfig = {
        ...config,
        strategy,
        forcedHeroId,
        maxWave:assignment.cashoutWave ? cashoutWave : config.maxWave,
        collectPolicy:assignment.cashoutWave ? "fixedWave" : config.collectPolicy,
      };
      const gameWallet = config.walletMode === "independent" ? config.startWallet : wallet;
      if (gameWallet < config.baseBet) {
        if (gameStart === 0) brokePlayers += 1;
        break;
      }
      const runSeed = (config.seed + assignment.player * 1000003 + game * 7919) >>> 0;
      const row = self.TDSimCore.runOne(engine, strategyConfig, gameWallet, runSeed || 1);
      row._runOrder = assignment.orderBase + game;
      row.playerId = assignment.player;
      row.cashoutWave = assignment.cashoutWave ? cashoutWave : row.wave;
      row.personalPoolClosing = game === gameEnd - 1;
      if (config.walletMode === "continuous") wallet = row.endingWallet;
      buffer.push(row);
      completed += 1;
      if (buffer.length >= chunkSize) flush();
    }
    flush();
    self.postMessage({
      type:"assignmentDone",
      assignmentIndex,
      resumeIndex:Number(assignment.resumeIndex) || 0,
      player:Number(assignment.player) || 0,
      completed,
    });
  }
  flush();
  engine.lockParams(false);
  self.postMessage({ type:"done", completed, brokePlayers });
}

self.onmessage = event => {
  if (event.data?.type !== "start") return;
  try {
    runAssignments(event.data);
  } catch (error) {
    try { engine.lockParams(false); } catch {}
    self.postMessage({ type:"error", message:error?.message || String(error), stack:error?.stack || "" });
  }
};
