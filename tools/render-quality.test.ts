import { FrameLimiter, QualityManager } from '../src/render/quality';
import type { FrameCap } from '../src/render/quality';
import type { Platform } from '../src/platform/platform';

function check(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

for (const hz of [30, 60, 90, 120, 144, 165, 240]) {
  for (const cap of [0, 30, 60] as FrameCap[]) {
    const limiter = new FrameLimiter();
    let count = 0;
    for (let i = 0; i < hz * 20; i++) if (limiter.accept(i * 1000 / hz, cap)) count++;
    check(Math.abs(count / 20 - Math.min(hz, cap || hz)) <= 0.2, `${hz}Hz / ${cap}: ${count / 20}fps`);
  }
}
const stall = new FrameLimiter();
check(stall.accept(0, 60), 'first frame');
check(!stall.accept(5, 60), 'early callback');
check(stall.accept(1000, 60), 'resume after stall');
check(!stall.accept(1001, 60), 'no catch-up burst');
check(stall.accept(1002, 0), 'cap change');

const memory = new Map<string, string>();
const platform = { deviceInfo: () => ({ mobile: true, cores: 8, memoryGB: 8 }), load: (k: string) => memory.get(k), save: (k: string, v: string) => memory.set(k, v) } as unknown as Platform;
const q = new QualityManager(platform);
check(q.frameCap === 60 && q.active === 'medium', 'mobile default');
for (let n = 1; n <= 100; n++) q.sampleFrame(33, n * .033);
check(q.dynScale < 1, 'reduce resolution on sustained slow frame');
q.setDetail('resolution', 'high');
check(q.resScale === 1 && q.dynScale === 1, 'manual resolution override');
q.setSetting('medium', 4);
for (let n = 1; n <= 100; n++) q.sampleFrame(40, 4 + n * .04);
check(q.active === 'medium' && q.dynScale === 1, 'manual tier does not degrade');
console.log('PASS: frame cap 21 combinations; stall/resume; quality overrides');
