"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const project = path.resolve(__dirname, "..");

function readRules() {
  const source = fs.readFileSync(path.join(project, "game.js"), "utf8");
  const worker = fs.readFileSync(path.join(project, "simulator-worker.js"), "utf8");
  const sandbox = {URLSearchParams, performance, console, setTimeout:()=>0, clearTimeout(){}};
  Object.assign(sandbox, {self:sandbox, location:{search:"?headless=1"}, addEventListener(){}, removeEventListener(){}});
  const context = vm.createContext(sandbox);
  const run = code => vm.runInContext(code, context);
  run(worker.slice(0, worker.indexOf('importScripts("simulator-core.js')));
  run(source);
  const rules = JSON.parse(JSON.stringify(run(`(() => {
    __tdHeadless.setParams({});
    const originalWeighted = pickWeighted;
    const attributeWeights = {};
    try {
      for (const attr of ATTRIBUTE_KEYS) {
        pickWeighted = weights => {attributeWeights[attr] = {...weights}; return attr;};
        rollBiomeEncounterAttribute(attr);
      }
    } finally { pickWeighted = originalWeighted; }
    const formationProbabilities = {};
    // Enumerate the engine's eligible pools in its actual sequential draw order.
    const inspectPool = new Function("pick", "ENCOUNTER_FORMATIONS", "lane", "usedFormations",
      "return (" + encounterFormationForLane.toString() + ")(lane, usedFormations)");
    {
      function visit(index, used, probability) {
        if (index === ENCOUNTER_LANES.length) return;
        const lane = ENCOUNTER_LANES[index];
        let pool;
        inspectPool(choices => {pool = choices; return choices[0];}, ENCOUNTER_FORMATIONS, lane, used);
        formationProbabilities[lane.id] ||= {};
        for (const item of pool) {
          const p = probability / pool.length;
          formationProbabilities[lane.id][item.id] = (formationProbabilities[lane.id][item.id] || 0) + p;
          visit(index + 1, new Set([...used, item.id]), p);
        }
      }
      visit(0, new Set(), 1);
    }
    return {build:BUILD_VERSION, economyMode:economyMode(),
      defaultParams:DEFAULT_PARAMS,
      encounterDefaults:ENCOUNTER_PARAM_DEFAULTS,
      attributes:ATTRIBUTE_KEYS, attributeMarks:ENCOUNTER_ATTR_MARKS, attributeWeights,
      formations:ENCOUNTER_FORMATIONS, lanes:ENCOUNTER_LANES, formationProbabilities,
      clearExp:ENCOUNTER_CLEAR_EXP, killExpFactors:ENCOUNTER_EXP_FACTORS,
      unbalancedBands:ENCOUNTER_REWARD_BANDS,
      bands:BANDS.map((band,index)=>({id:index+1,from:band.from,to:band.to,count:band.count})),
      boss:{min:PROTOTYPE_BOSS_MIN_ENCOUNTER,max:PROTOTYPE_BOSS_MAX_ENCOUNTER,total:PROTOTYPE_BOSS_TOTAL,
        archetypes:BOSS_COMBAT_ARCHETYPES,repair:PROTOTYPE_BOSS_REPAIR,hpByOrdinal:PROTOTYPE_BOSS_HP},
      clearShare:.40};
  })()`)));
  rules.engineSha256 = crypto.createHash("sha256").update(source).digest("hex");
  return rules;
}

function serializedRules() {
  return '"use strict";\n// Generated from game.js by tools/export-encounter-tuning.cjs.\n' +
    "globalThis.TD_ENCOUNTER_TUNING = " + JSON.stringify(readRules(), null, 2) +
    ';\nif (typeof module !== "undefined") module.exports = globalThis.TD_ENCOUNTER_TUNING;\n';
}

if (require.main === module) {
  const target = path.join(project, "encounter-tuning-data.js");
  const output = serializedRules();
  if (process.argv.includes("--check")) {
    if (fs.readFileSync(target, "utf8") !== output) throw new Error("Encounter tuning snapshot is stale");
    console.log("Encounter tuning snapshot matches the current engine.");
  } else {
    fs.writeFileSync(target, output);
    console.log(target);
  }
}
module.exports = {readRules, serializedRules};
