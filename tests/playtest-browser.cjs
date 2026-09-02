"use strict";

const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const output = path.resolve(process.argv[2] || "../encounter241-browser");
const url = process.env.QA_URL || "http://127.0.0.1:4183/?v=encounter-campaign241";

(async () => {
  fs.mkdirSync(output, {recursive:true});
  const browser = await chromium.launch({headless:true, executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"});
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const errors = [], waves = [], picks = [], captured = new Set();
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => { if(response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  let previousWave = 0, speedSet = false;
  try {
    await page.goto(url, {waitUntil:"networkidle"});
    await page.locator("#betBtn").click();
    const deadline = Date.now() + 12 * 60 * 1000;
    while(Date.now() < deadline) {
      const status = await page.evaluate(() => ({over:state.over, active:state.waveActive, wave:state.wave,
        bosses:state.bossSeen, hp:state.hp, bossVisible:state.monsters.some(m=>m.boss && m.y>90),
        visible:state.monsters.filter(m=>m.hp>0 && m.y>90).length, build:BUILD_VERSION}));
      if(status.over) break;
      if(await page.locator("#choiceOverlay").isVisible()) {
        const index = await page.evaluate(() => {
          if(!state.hero) return Math.max(0,currentChoices.findIndex(c=>c.heroId==="neutral"));
          return currentChoices.map((c,i)=>({i,score:
            (c.dimension==="newTower"?20:0) + (c.attrKey===state.hero.attrKey?3:0) +
            (["core","synergy"].includes(c.dimension)||c.rarity==="heroBuff"?6:0) +
            (["damage","speed","quantity","hero"].includes(c.dimension)?2:0)
          })).sort((a,b)=>b.score-a.score||a.i-b.i)[0].i;
        });
        await page.locator("#choiceList .choice-card").nth(index).click();
      } else if(await page.locator("#encounterOverlay").isVisible()) {
        const cards = page.locator("#encounterList .encounter-card");
        if(await cards.count() && await cards.first().isEnabled()) {
          const data = await page.evaluate(() => {
            const choices=state.encounterChoices;
            let index=choices.findIndex(c=>c.lane==="steady");
            if(choices[0]?.boss) index=0;
            const tactical=choices.findIndex(c=>c.lane==="tactical" &&
              enemyAttributeProfile(c.attr)[state.hero.attrKey]>1 && state.hp>750);
            if(tactical>=0) index=tactical;
            return {index:Math.max(0,index),boss:!!choices[0]?.boss,
              elite:choices.some(c=>c.formation==="elite"), wave:state.wave+1};
          });
          const name=data.boss?"boss-card":data.elite?"elite-choice":"normal-choice";
          if(!captured.has(name)) {
            await page.waitForTimeout(250);
            await page.screenshot({path:path.join(output,`${name}.png`)});captured.add(name);
          }
          picks.push(data);
          await cards.nth(data.index).click();
          await page.waitForTimeout(600);
        }
      } else if(status.active) {
        if(!speedSet) {
          await page.locator("#speedBtn").click();
          await page.locator("#speedBtn").click();
          speedSet=true;
        }
        const name=status.bossVisible?"boss-combat":status.visible>0?"combat":null;
        if(name&&!captured.has(name)) {
          await page.screenshot({path:path.join(output,`${name}.png`)});captured.add(name);
        }
      } else if(await page.locator("#waveDecision").isVisible()) {
        if(previousWave!==status.wave) {
          const receipt=await page.evaluate(()=>({wave:state.wave,bosses:state.bossSeen,hp:state.hp,
            summary:state.waveSummary,budget:state.waveReward.budget,score:scoreDisplaySnapshot(),payout:payout()}));
          assert.equal(Math.round(receipt.summary.pot),receipt.budget);
          assert.equal(receipt.payout,receipt.score.total);
          waves.push(receipt);previousWave=status.wave;
          if(!captured.has("receipt")||receipt.summary.repair>0&&!captured.has("boss-repair")) {
            const name=receipt.summary.repair>0?"boss-repair":"receipt";
            await page.screenshot({path:path.join(output,`${name}.png`)});captured.add(name);
          }
        }
        if(status.bosses>=2) {
          const before=await page.evaluate(()=>({wallet:state.wallet,payout:payout()}));
          await page.locator("#collectBtn").click();
          assert.equal(await page.evaluate(()=>state.wallet),before.wallet+before.payout);
          break;
        }
        await page.locator("#continueBtn").click();
      }
      await page.waitForTimeout(120);
    }
    const final=await page.evaluate(()=>({over:state.over,hp:state.hp,wave:state.wave,bosses:state.bossSeen,
      wallet:state.wallet,build:BUILD_VERSION,scroll:document.documentElement.scrollWidth,width:innerWidth}));
    await page.screenshot({path:path.join(output,"final.png")});
    fs.writeFileSync(path.join(output,"results.json"),JSON.stringify({url,final,waves,picks,errors},null,2));
    assert.ok(final.over,"Playtest timed out before a terminal result or two-BOSS collect");
    assert.ok(waves.length>0,"No real wave was completed");
    assert.ok(final.scroll<=final.width,"Horizontal layout overflow");
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({final,clearedWaves:waves.length,captured:[...captured],errors},null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
