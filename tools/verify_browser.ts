import { chromium } from 'playwright-core';
declare const process: { argv: string[]; env?: Record<string, string | undefined>; platform?: string; exit(code?: number): never };

const URL = process.argv[2] ?? 'http://127.0.0.1:5173';
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
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('#btn-start');

  // 1. 开局
  await page.click('#btn-start');
  await page.waitForTimeout(400);
  const t0 = await page.evaluate(() => (window as any).__TIDELINE__.game.time);
  if (!(t0 > 0)) throw new Error('Game did not advance after start');

  // 2. 移动 + 换枪 + 地雷 + 闪避
  const p0 = await page.evaluate(() => ({ x: (window as any).__TIDELINE__.game.player.x, z: (window as any).__TIDELINE__.game.player.z }));
  await page.keyboard.down('KeyD');
  await page.waitForFunction((x0: number) => (window as any).__TIDELINE__.game.player.x > x0 + 0.3, p0.x, { timeout: 5000 });
  await page.keyboard.up('KeyD');
  await page.keyboard.press('KeyQ');
  await page.keyboard.press('KeyE');
  await page.keyboard.press('Space');
  const c0 = await page.evaluate(() => (window as any).__TIDELINE__.game.clock);
  await page.waitForFunction((c: number) => (window as any).__TIDELINE__.game.clock > c + 0.05, c0, { timeout: 5000 });
  const p1 = await page.evaluate(() => {
    const g = (window as any).__TIDELINE__.game;
    return { x: g.player.x, weapon: g.player.weapon, mines: g.mines.length, dashCd: g.player.dashCd };
  });
  if (!(p1.x > p0.x + 0.3) || p1.weapon !== 'cn' || p1.mines < 1 || !(p1.dashCd > 0)) {
    throw new Error(`Input check failed: ${JSON.stringify(p1)}`);
  }

  // 3. 升级三选一暂停与恢复
  await page.click('[data-dev="lvl"]');
  await page.waitForSelector('#screen-levelup:not(.hidden)');
  const cards = await page.locator('#cards .card').count();
  if (cards !== 3) throw new Error(`Expected 3 upgrade cards, got ${cards}`);
  const tPaused = await page.evaluate(() => (window as any).__TIDELINE__.game.time);
  await page.waitForTimeout(250);
  const tPaused2 = await page.evaluate(() => (window as any).__TIDELINE__.game.time);
  if (Math.abs(tPaused2 - tPaused) > 0.001) throw new Error('Time advanced during levelup');
  await page.locator('#cards .card').first().click();
  await page.waitForSelector('#screen-levelup', { state: 'hidden' });

  // 4. 横竖屏旋转保留进度
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  const afterRotate = await page.evaluate(() => ({
    time: (window as any).__TIDELINE__.game.time,
    aspect: (window as any).__TIDELINE__.renderer.cam.right / (window as any).__TIDELINE__.renderer.cam.top,
  }));
  if (afterRotate.aspect >= 1) throw new Error('Camera did not adapt to portrait aspect');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(150);

  // 5. 双指：左摇杆拖动 + 右侧闪避按钮
  await page.evaluate(() => {
    const g = (window as any).__TIDELINE__.game;
    g.player.dashCd = 0;
    const z = document.getElementById('stick-zone')!;
    const d = document.getElementById('btn-dash')!;
    z.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 11, clientX: 120, clientY: 220, bubbles: true }));
    z.dispatchEvent(new PointerEvent('pointermove', { pointerId: 11, clientX: 170, clientY: 220, bubbles: true }));
    d.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 12, clientX: 760, clientY: 320, bubbles: true }));
  });
  await page.waitForTimeout(150);
  const multi = await page.evaluate(() => {
    const g = (window as any).__TIDELINE__.game;
    document.getElementById('stick-zone')!.dispatchEvent(new PointerEvent('pointerup', { pointerId: 11, bubbles: true }));
    return { dashCd: g.player.dashCd };
  });
  if (!(multi.dashCd > 0)) throw new Error('Multi-touch joystick + dash failed');

  // 6. 切后台自动暂停 + 手动继续
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.waitForSelector('#screen-pause:not(.hidden)');
  await page.click('#btn-resume');
  await page.waitForSelector('#screen-pause', { state: 'hidden' });

  // 7. 刷首领 + 弹幕高峰性能采样 + 击杀首领胜利 + 重开
  await page.click('[data-dev="boss"]');
  await page.evaluate(() => { (window as any).__TIDELINE__.game.dev.invincible = true; });
  await page.waitForFunction(() => {
    const b = (window as any).__TIDELINE__.game.boss;
    return b && b.state !== 'enter';
  }, null, { timeout: 15000 });
  const bossInfo = await page.evaluate(() => {
    const g = (window as any).__TIDELINE__.game;
    return { hasBoss: !!g.boss, state: g.boss?.state, enemies: g.enemies.length, bullets: g.enemyBullets.length };
  });
  if (!bossInfo.hasBoss) throw new Error('Boss did not spawn');

  // 测量 1.5s 帧率
  const perf = await page.evaluate(`new Promise((res) => {
    let frames = 0;
    const tStart = performance.now();
    function tick() {
      frames++;
      if (performance.now() - tStart >= 1500) {
        const dt = performance.now() - tStart;
        res({ frames, avgMs: +(dt / frames).toFixed(2) });
      } else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })`);

  // 触发首领死亡 -> 胜利结算 -> 立即重开
  await page.evaluate(() => {
    const g = (window as any).__TIDELINE__.game;
    g.damageEnemy(g.boss, 99999, 'test');
    g.boss.state = 'window';
    g.damageEnemy(g.boss, 99999, 'test');
  });
  await page.waitForSelector('#screen-end:not(.hidden)', { timeout: 12000 });
  const winTitle = await page.textContent('#end-title');
  if (!winTitle?.includes('击破')) throw new Error(`Unexpected win title: ${winTitle}`);
  await page.click('#btn-restart');
  await page.waitForSelector('#screen-end', { state: 'hidden' });

  // 8. 死亡结算 -> 立即重开
  await page.evaluate(() => {
    const g = (window as any).__TIDELINE__.game;
    g.dev.invincible = false;
    g.player.iframe = 0;
    g.hurtPlayer(9999);
  });
  await page.waitForSelector('#screen-end:not(.hidden)', { timeout: 5000 });
  const loseTitle = await page.textContent('#end-title');
  if (!loseTitle?.includes('失守')) throw new Error(`Unexpected lose title: ${loseTitle}`);
  await page.click('#btn-restart');
  await page.waitForSelector('#screen-end', { state: 'hidden' });

  if (errors.length) throw new Error(errors.join('\n'));
  console.log('ALL BROWSER CHECKS PASSED', { bossInfo, perf });
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
