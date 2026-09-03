"use strict";

const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const url = process.env.QA_URL || "http://127.0.0.1:4183/?v=continue-hierarchy242";
const output = path.resolve(process.argv[2] || "../encounter242-decision");

async function playToDecision(page) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    const status = await page.evaluate(() => ({
      over: state.over,
      active: state.waveActive,
      choosing: state.choicesOpen,
      decision: !document.getElementById("waveDecision").classList.contains("hidden")
    }));
    assert.equal(status.over, false, "test run must reach a real wave-clear decision");
    if (status.decision) return;
    if (status.choosing) {
      const steady = page.locator('.encounter-card[data-lane="steady"]');
      if (await steady.count()) await steady.click();
      else await page.locator("#choiceList .choice-card").first().click();
    }
    await page.waitForTimeout(100);
  }
  throw new Error("wave-clear decision timed out");
}

async function inspectDecision(page) {
  const data = await page.evaluate(() => {
    const rect = selector => {
      const node = document.querySelector(selector);
      const box = node.getBoundingClientRect();
      return {x:box.x, y:box.y, width:box.width, height:box.height,
        right:box.right, bottom:box.bottom, text:node.innerText,
        disabled:node.disabled, animation:getComputedStyle(node).animationName};
    };
    return {
      panel:rect(".decision-panel"), continue:rect("#continueBtn"), collect:rect("#collectBtn"),
      viewport:{width:innerWidth,height:innerHeight},
      scrollWidth:document.documentElement.scrollWidth,
      wallet:state.wallet, payout:payout(), wave:state.wave,
      bet:Number(document.getElementById("waveBetText").textContent.replaceAll(",", "")),
      collectAmount:Number(document.getElementById("collectText").textContent.replaceAll(",", "")),
      reward:document.getElementById("decisionReward").textContent
    };
  });
  assert.ok(data.continue.bottom < data.collect.y, "Continue must be above Collect");
  assert.ok(data.continue.width > data.collect.width * 1.2, "Continue must be visibly wider");
  assert.ok(data.continue.height >= 72);
  assert.ok(data.collect.height >= 44 && data.collect.height < data.continue.height);
  assert.equal(data.continue.disabled, false);
  assert.equal(data.collect.disabled, false);
  assert.equal(data.continue.animation, "none");
  assert.equal(data.collect.animation, "none");
  assert.equal(data.collectAmount, data.payout);
  assert.ok(data.bet > 0 && data.reward.includes("POT"));
  assert.ok(data.panel.x >= 0 && data.panel.right <= data.viewport.width);
  assert.ok(data.panel.y >= 0 && data.panel.bottom <= data.viewport.height);
  assert.ok(data.scrollWidth <= data.viewport.width);
  return data;
}

(async () => {
  fs.mkdirSync(output, {recursive:true});
  const browser = await chromium.launch({headless:true,
    executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"});
  const results = [];
  try {
    for (const viewport of [{width:320,height:640}, {width:390,height:844}, {width:1440,height:900}]) {
      const page = await browser.newPage({viewport});
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(url, {waitUntil:"networkidle"});
      await page.locator("#betBtn").click();
      await page.locator("#choiceList .choice-card").first().click();
      await page.locator('.encounter-card[data-lane="steady"]').click();
      await page.waitForFunction(() => state.waveActive);
      await page.locator("#speedBtn").click();
      await page.locator("#speedBtn").click();
      await playToDecision(page);
      const first = await inspectDecision(page);
      await page.screenshot({path:path.join(output, `decision-${viewport.width}.png`)});
      await page.locator("#continueBtn").click();
      await page.locator('.encounter-card[data-lane="steady"]').click();
      await page.waitForFunction(() => state.waveActive);
      const continued = await page.evaluate(() => ({wallet:state.wallet, wave:state.wave}));
      assert.equal(continued.wallet, first.wallet - first.bet, "Continue debits exactly one displayed BET");
      assert.equal(continued.wave, first.wave + 1);
      await playToDecision(page);
      const second = await inspectDecision(page);
      await page.locator("#collectBtn").click();
      const settled = await page.evaluate(() => ({wallet:state.wallet, over:state.over, canCollect:canCollect()}));
      assert.equal(settled.wallet, second.wallet + second.payout);
      assert.equal(settled.over, true);
      assert.equal(settled.canCollect, false);
      assert.deepEqual(errors, []);
      results.push({viewport, first, continued, second, settled, errors});
      console.log(JSON.stringify({viewport, passed:true, continue:first.continue, collect:first.collect}));
      await page.close();
    }
    fs.writeFileSync(path.join(output, "verification.json"), JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
