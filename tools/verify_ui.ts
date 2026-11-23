// Run against a local Vite dev server: npx tsx tools/verify_ui.ts http://localhost:5173
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless:true,
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl'] });
  try {
    const page = await browser.newPage({ viewport:{width:1280,height:800}, hasTouch:true });
    const errors:string[] = [];
    page.on('pageerror', e=>errors.push(e.message));
    page.on('requestfailed',r=>errors.push(`${r.url()}: ${r.failure()?.errorText}`));
    page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
    await page.goto(process.argv[2] || 'http://localhost:5173');
    await page.locator('#home-guest').waitFor();
    await page.screenshot({path:'ui-login-desktop.png'});
    await page.locator('#home-email').click();
    await page.waitForFunction(()=>document.querySelector('#home-status')?.textContent?.includes('正式域名'));
    await page.setViewportSize({width:844,height:390});
    await page.screenshot({path:'ui-login-landscape.png'});
    await page.locator('#home-guest').tap();
    const start = page.locator('#screen-start');
    await start.waitFor();
    await start.getByRole('group',{name:'实时阴影'}).getByRole('button',{name:'关',exact:true}).tap();
    await start.getByRole('group',{name:'帧率上限'}).getByRole('button',{name:'30',exact:true}).tap();
    const teammate=start.getByRole('switch',{name:'减轻队友特效'});
    await start.locator('.ui-switch').filter({has:teammate}).locator('.switch__control').tap();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('tideline_quality_details')||'{}').teammates==='low');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('tideline_quality_details')||'{}').shadows),'off');
    assert.equal(await page.evaluate(()=>localStorage.getItem('tideline_fpscap')),'30');
    await page.screenshot({path:'ui-prep-landscape.png'});
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:'ui-prep-portrait.png'});
    await page.setViewportSize({width:844,height:390});
    await page.locator('#btn-start').tap({timeout:60_000});
    await page.locator('#btn-pause').tap();
    const pause=page.locator('#screen-pause');
    await pause.waitFor();
    assert.equal(await pause.getByRole('switch',{name:'减轻队友特效'}).getAttribute('aria-checked'),'true');
    await page.screenshot({path:'ui-pause-landscape.png'});
    await page.locator('#btn-resume').tap();
    await page.evaluate(()=> (window as any).__TIDELINE__.game.devLevelUp());
    await page.locator('#screen-levelup:not(.hidden)').waitFor();
    assert.equal(await page.locator('#cards .card').count(),3);
    await page.screenshot({path:'ui-upgrade-landscape.png'});
    await page.locator('#cards .card').first().tap();
    await page.locator('#screen-levelup').waitFor({state:'hidden'});
    assert.deepEqual(errors,[]);
    console.log('PASS: guest, settings, mobile layouts, pause sync, upgrade; no errors');
  } finally { await browser.close(); }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
