import { chromium } from 'playwright-core';
declare const process: { argv: string[]; env?: Record<string, string | undefined>; platform?: string; exit(code?: number): never };

/**
 * 截图检查：横屏开局 / 中期混战 / 首领战 / 竖屏 / 升级卡 / 结算
 * 用法：npx tsx tools/shots.ts http://127.0.0.1:5173 输出目录
 */
const URL = process.argv[2] ?? 'http://127.0.0.1:5173';
const OUT = process.argv[3] ?? (process.platform === 'win32' ? './tmp/shots' : '/tmp/shots');
const LAUNCH_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'];

async function launchBrowser() {
  const custom = process.env?.CHROME_PATH;
  if (custom) return chromium.launch({ headless: true, executablePath: custom, args: LAUNCH_ARGS });
  const tries: Parameters<typeof chromium.launch>[0][] = process.platform === 'win32'
    ? [{ channel: 'chrome' }, { channel: 'msedge' }, {}]
    : [{ executablePath: '/usr/bin/google-chrome' }, { channel: 'chrome' }, {}];
  for (const opt of tries) {
    try { return await chromium.launch({ headless: true, args: LAUNCH_ARGS, ...opt }); } catch { /* try next */ }
  }
  return chromium.launch({ headless: true, args: LAUNCH_ARGS });
}

async function main() {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/0_start.png` });

  await page.click('#btn-start');
  await page.evaluate(() => {
    const g = (window as any).__TIDELINE__.game;
    g.dev.invincible = true;
    (window as any).__TIDELINE__.quality.setSetting('high', performance.now() / 1000);
    (window as any).__TIDELINE__.renderer.applyQuality();
  });
  const waitSim = (sec: number) =>
    page.waitForFunction((t: number) => (window as any).__TIDELINE__.game.clock > t, sec, { timeout: 120000 });
  const autoPick = async () => {
    for (let i = 0; i < 6; i++) {
      const vis = await page.locator('#screen-levelup:not(.hidden)').count();
      if (!vis) break;
      await page.locator('#cards .card').first().click();
      await page.waitForTimeout(100);
    }
  };

  // 开局几秒
  await waitSim(5);
  await page.screenshot({ path: `${OUT}/1_early.png` });

  // 中期：跳到 6:40，带刺囊兽与裂甲兽
  await page.evaluate(() => (window as any).__TIDELINE__.game.devSkipTo(400));
  const c1 = await page.evaluate(() => (window as any).__TIDELINE__.game.clock);
  await page.keyboard.down('KeyA');
  for (let i = 0; i < 12; i++) { await autoPick(); await page.waitForTimeout(400); }
  await page.keyboard.up('KeyA');
  await waitSim(c1 + 7);
  await autoPick();
  await page.screenshot({ path: `${OUT}/2_mid.png` });

  // 首领
  await page.evaluate(() => (window as any).__TIDELINE__.game.devSpawnBoss());
  const c2 = await page.evaluate(() => (window as any).__TIDELINE__.game.clock);
  await waitSim(c2 + 1.6);
  await autoPick();
  await page.screenshot({ path: `${OUT}/3_boss_enter.png` });
  await waitSim(c2 + 7.5);
  await autoPick();
  await page.screenshot({ path: `${OUT}/4_boss_fight.png` });
  await waitSim(c2 + 10.5);
  await autoPick();
  await page.screenshot({ path: `${OUT}/5_boss_fight2.png` });

  // 竖屏
  await page.setViewportSize({ width: 430, height: 900 });
  await page.waitForTimeout(800);
  await autoPick();
  await page.screenshot({ path: `${OUT}/6_portrait.png` });

  // 升级卡
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.evaluate(() => (window as any).__TIDELINE__.game.devLevelUp());
  await page.waitForSelector('#screen-levelup:not(.hidden)', { timeout: 20000 });
  await page.screenshot({ path: `${OUT}/7_levelup.png` });
  await autoPick();

  // 结算
  await page.evaluate(() => {
    const g = (window as any).__TIDELINE__.game;
    g.boss.state = 'window';
    g.bossPhase = 2;
    g.damageEnemy(g.boss, 999999, 't');
  });
  await page.waitForSelector('#screen-end:not(.hidden)', { timeout: 30000 });
  await page.screenshot({ path: `${OUT}/8_end.png` });

  // 角色特写：缩小相机视野
  await page.click('#btn-restart');
  await page.evaluate(() => {
    const r = (window as any).__TIDELINE__.renderer;
    r.cam.left = -6; r.cam.right = 6; r.cam.top = 3.4; r.cam.bottom = -3.4;
    r.cam.updateProjectionMatrix();
    r.resize = () => {};
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/9_closeup.png` });

  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
