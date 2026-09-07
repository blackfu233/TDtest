"use strict";
// Generated from game.js by tools/export-encounter-tuning.cjs.
globalThis.TD_ENCOUNTER_TUNING = {
  "build": "encounter-balance258",
  "economyMode": "encounter-rtp-candidate-258",
  "encounterDefaults": {
    "encounterRewardRevision": 258,
    "encounterEconomyEnabled": 1,
    "encounterRtpTargetMin": 0.96,
    "encounterRtpTargetMax": 1,
    "encounterRewardScale": 0.94,
    "encounterChestUpgradeChance": 0.1,
    "encounterHpDepthGrowth": 0.09,
    "encounterHpDepthCap": 2,
    "encounterGrade1HpMul": 1.45,
    "encounterGrade2HpMul": 0.98,
    "encounterGrade3HpMul": 0.9,
    "encounterGrade1AtkMul": 6,
    "encounterGrade2AtkMul": 4.5,
    "encounterGrade3AtkMul": 3.5,
    "encounterBaseHitCap": 100,
    "encounterMinionBaseHitLimit": 1,
    "encounterChest1Min": 0.3,
    "encounterChest1Max": 1.77,
    "encounterChest2Min": 0.35,
    "encounterChest2Max": 1.8,
    "encounterChest3Min": 0.66,
    "encounterChest3Max": 1.9,
    "encounterChest4Min": 0.7,
    "encounterChest4Max": 2,
    "encounterBossChestMin": 0.17,
    "encounterBossChestMax": 0.28,
    "encounterBossSmallWeight": 90,
    "encounterBossMediumWeight": 9,
    "encounterBossLargeWeight": 1,
    "encounterBossSmallMin": 0.1,
    "encounterBossSmallMax": 0.18,
    "encounterBossMediumMin": 0.3,
    "encounterBossMediumMax": 0.6,
    "encounterBossLargeMin": 1.2,
    "encounterBossLargeMax": 2.2,
    "encounterBossDepthGrowth": 0.08,
    "encounterRushSpeedCap": 78,
    "encounterTankSingleDamageMul": 1.35,
    "encounterTankAreaDamageMul": 0.6,
    "encounterTrapSlowPct": 0.38,
    "encounterTrapSlowTime": 0.8,
    "encounterFrostSlowPct": 0.35,
    "encounterFrostSlowTime": 1
  },
  "attributes": [
    "fire",
    "ice",
    "electric",
    "poison",
    "neutral"
  ],
  "attributeMarks": {
    "fire": "火",
    "ice": "冰",
    "electric": "電",
    "poison": "毒",
    "neutral": "無"
  },
  "attributeWeights": {
    "fire": {
      "fire": 60,
      "ice": 7,
      "electric": 7,
      "poison": 7,
      "neutral": 12
    },
    "ice": {
      "fire": 7,
      "ice": 60,
      "electric": 7,
      "poison": 7,
      "neutral": 12
    },
    "electric": {
      "fire": 7,
      "ice": 7,
      "electric": 60,
      "poison": 7,
      "neutral": 12
    },
    "poison": {
      "fire": 7,
      "ice": 7,
      "electric": 7,
      "poison": 60,
      "neutral": 12
    },
    "neutral": {
      "fire": 7,
      "ice": 7,
      "electric": 7,
      "poison": 7,
      "neutral": 60
    }
  },
  "formations": [
    {
      "id": "swarm",
      "label": "群體",
      "template": "standard",
      "role": "area",
      "threat": 1,
      "countMul": 1.6,
      "hpMul": 0.68,
      "atkMul": 0.9,
      "speedMul": 1,
      "eliteCount": 0,
      "batchSize": 5,
      "spawnGapMul": 2.4,
      "range": 0,
      "artIndex": 0,
      "marks": 3
    },
    {
      "id": "rush",
      "label": "高速",
      "template": "fast",
      "role": "control",
      "threat": 2,
      "countMul": 1.05,
      "hpMul": 0.85,
      "atkMul": 1,
      "speedMul": 1.45,
      "eliteCount": 0,
      "batchSize": 2,
      "spawnGapMul": 2.6,
      "range": 0,
      "artIndex": 0,
      "marks": 2
    },
    {
      "id": "armor",
      "label": "坦克",
      "template": "tank",
      "role": "single",
      "threat": 2,
      "countMul": 0.4,
      "hpMul": 1.6,
      "atkMul": 1.3,
      "speedMul": 0.64,
      "eliteCount": 0,
      "batchSize": 1,
      "spawnGapMul": 5.5,
      "range": 0,
      "artIndex": 2,
      "marks": 2
    },
    {
      "id": "siege",
      "label": "遠程",
      "template": "ranged",
      "role": "area",
      "threat": 2,
      "countMul": 0.65,
      "hpMul": 1.15,
      "atkMul": 1.5,
      "speedMul": 0.85,
      "eliteCount": 0,
      "batchSize": 2,
      "spawnGapMul": 4,
      "range": 230,
      "artIndex": 1,
      "marks": 2
    },
    {
      "id": "elite",
      "label": "菁英",
      "template": "mixed",
      "role": "single",
      "threat": 3,
      "countMul": 0.14,
      "hpMul": 1.2,
      "atkMul": 1.4,
      "speedMul": 1,
      "eliteCount": 1,
      "batchSize": 1,
      "spawnGapMul": 4,
      "range": 0,
      "artIndex": 0,
      "marks": 1
    }
  ],
  "lanes": [
    {
      "id": "steady",
      "label": "穩健",
      "threat": 1,
      "reward": 1,
      "countMul": 0.78,
      "hpMul": 0.8,
      "atkMul": 0.85,
      "speedMul": 0.9,
      "spawnGapMul": 1.25,
      "formations": [
        "swarm",
        "rush",
        "siege"
      ]
    },
    {
      "id": "tactical",
      "label": "戰術",
      "threat": 2,
      "reward": 2,
      "countMul": 1,
      "hpMul": 1.5,
      "atkMul": 1.6,
      "speedMul": 1,
      "spawnGapMul": 1,
      "formations": [
        "rush",
        "armor",
        "siege",
        "swarm"
      ]
    },
    {
      "id": "greedy",
      "label": "高風險",
      "threat": 3,
      "reward": 3,
      "countMul": 1.08,
      "hpMul": 2,
      "atkMul": 2,
      "speedMul": 1.08,
      "spawnGapMul": 0.9,
      "formations": [
        "elite",
        "armor",
        "rush",
        "siege"
      ]
    }
  ],
  "formationProbabilities": {
    "steady": {
      "swarm": 0.3333333333333333,
      "rush": 0.3333333333333333,
      "siege": 0.3333333333333333
    },
    "tactical": {
      "rush": 0.2222222222222222,
      "armor": 0.3333333333333333,
      "siege": 0.2222222222222222,
      "swarm": 0.2222222222222222
    },
    "greedy": {
      "elite": 0.4074074074074074,
      "armor": 0.25925925925925924,
      "siege": 0.16666666666666666,
      "rush": 0.16666666666666666
    }
  },
  "clearExp": {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0
  },
  "killExpFactors": {
    "1": 0.8,
    "2": 1.05,
    "3": 1.42,
    "4": 1.9
  },
  "unbalancedBands": {
    "1": [
      0.45,
      0.65
    ],
    "2": [
      1,
      1.35
    ],
    "3": [
      2.4,
      3.1
    ],
    "4": [
      4.8,
      6
    ]
  },
  "bands": [
    {
      "id": 1,
      "from": 1,
      "to": 2,
      "count": [
        16,
        24
      ]
    },
    {
      "id": 2,
      "from": 3,
      "to": 5,
      "count": [
        20,
        30
      ]
    },
    {
      "id": 3,
      "from": 6,
      "to": 10,
      "count": [
        28,
        40
      ]
    },
    {
      "id": 4,
      "from": 11,
      "to": 20,
      "count": [
        34,
        50
      ]
    },
    {
      "id": 5,
      "from": 21,
      "to": 30,
      "count": [
        42,
        62
      ]
    }
  ],
  "boss": {
    "min": 7,
    "max": 14,
    "total": 5,
    "archetypes": [
      {
        "id": "armored",
        "label": "重甲型",
        "hpMul": 1.38,
        "atkMul": 0.92,
        "speedMul": 0.82,
        "preludeMul": 0.72,
        "eliteCount": 0,
        "clearShift": -7,
        "reward": 4
      },
      {
        "id": "summoner",
        "label": "召集型",
        "hpMul": 0.96,
        "atkMul": 1,
        "speedMul": 1,
        "preludeMul": 1.48,
        "eliteCount": 1,
        "clearShift": -5,
        "reward": 3
      },
      {
        "id": "berserker",
        "label": "狂襲型",
        "hpMul": 0.88,
        "atkMul": 1.34,
        "speedMul": 1.2,
        "preludeMul": 0.88,
        "eliteCount": 0,
        "clearShift": -9,
        "reward": 4
      }
    ],
    "repair": 0.35,
    "hpByOrdinal": [
      1.1,
      1.65,
      2.25,
      2.9,
      3.6
    ]
  },
  "clearShare": 0.4,
  "engineSha256": "e2ced1e61d8bba1223f9a492dca097e6caf46520584e501a2a50eab2fd11315d"
};
if (typeof module !== "undefined") module.exports = globalThis.TD_ENCOUNTER_TUNING;
