/**
 * BAB-01 · B4 通用 VFX 曲线、随机表、单位换算与画质预算求值器（引擎无关纯 TS）
 *
 * 作者：Gemini（GM-09）· 2026-11-23
 * 依赖：仅依赖同目录 `./effect_def`（零 Three.js / Babylon.js / DOM 依赖），
 * 可在 Node 单测、Babylon B4 运行器与离线工具中直接复用。
 */

import {
  EFFECT_UNITS,
  type Curve,
  type EffectImportance,
  type EffectOwner,
  type EffectQualityBudget,
  type PrimitiveKind,
  type Rgba,
  type Scalar,
  type Vec2,
  type Vec3,
} from './effect_def';

export interface CurveEvalOptions<T extends Scalar = Scalar> {
  /** 确定性随机数生成器（返回 [0, 1)），缺省时使用 0.5（中值） */
  rng?: () => number;
  /** 当曲线为 flex 时由游戏逻辑注入的运行时覆盖值 */
  flexOverride?: T;
  /** 对 integrated 曲线的采样细分步数（默认 16） */
  integrateSteps?: number;
}

function clamp01(x: number): number {
  return x <= 0 ? 0 : x >= 1 ? 1 : x;
}

/** 对单张原版 probabilityTable 按归一化 u ∈ [0, 1] 线性插值采样 */
export function sampleProbTable(table: { t: number[]; v: number[] }, u: number): number {
  const { t, v } = table;
  if (!v || v.length === 0) return 1;
  if (v.length === 1 || !t || t.length !== v.length) return v[0];
  const x = clamp01(u);
  if (x <= t[0]) return v[0];
  const last = t.length - 1;
  if (x >= t[last]) return v[last];
  for (let i = 0; i < last; i++) {
    const t0 = t[i];
    const t1 = t[i + 1];
    if (x >= t0 && x <= t1) {
      const span = t1 - t0;
      const a = span > 1e-9 ? (x - t0) / span : 0;
      return v[i] + (v[i + 1] - v[i]) * a;
    }
  }
  return v[last];
}

/** 对曲线关键帧 (t[], v[]) 在归一化时间 u ∈ [0, 1] 做线性插值 */
function sampleKeyframes<T extends Scalar>(times: number[], values: T[], u: number): T {
  const n = Math.min(times.length, values.length);
  if (n === 1) return values[0];
  const x = clamp01(u);
  if (x <= times[0]) return values[0];
  if (x >= times[n - 1]) return values[n - 1];
  for (let i = 0; i < n - 1; i++) {
    const t0 = times[i];
    const t1 = times[i + 1];
    if (x >= t0 && x <= t1) {
      const span = t1 - t0;
      const a = span > 1e-9 ? (x - t0) / span : 0;
      const v0 = values[i];
      const v1 = values[i + 1];
      if (typeof v0 === 'number' && typeof v1 === 'number') {
        return (v0 + (v1 - v0) * a) as T;
      }
      if (Array.isArray(v0) && Array.isArray(v1)) {
        const len = Math.min(v0.length, v1.length);
        const out = new Array<number>(len);
        for (let k = 0; k < len; k++) out[k] = v0[k] + (v1[k] - v0[k]) * a;
        return out as T;
      }
      return v0;
    }
  }
  return values[n - 1];
}

/** 预采样一个粒子实例在出生时固定的 probabilityTables 随机倍率 */
export function rollCurveRandom(curve: Curve | undefined, rng: () => number = () => 0.5): number[] | null {
  if (!curve || !curve.rnd || curve.rnd.length === 0) return null;
  return curve.rnd.map((tbl) => sampleProbTable(tbl, rng()));
}

function applyRandom<T extends Scalar>(val: T, rndMul: number[] | null): T {
  if (!rndMul || rndMul.length === 0) return val;
  if (typeof val === 'number') return (val * rndMul[0]) as T;
  if (Array.isArray(val)) {
    return val.map((comp, i) => comp * (rndMul[i] ?? rndMul[0] ?? 1)) as T;
  }
  return val;
}

/**
 * 求值标量曲线（支持常量 c、关键帧 t/v、probabilityTables 随机倍率、integrated 积分、flex 覆盖）。
 * 当 integrated=true 时，返回 [0, u] 区间上的数值积分（用于 UV 滚动位移等累积量）。
 */
export function evalCurveNumber(
  curve: Curve<number> | Curve | undefined,
  u: number,
  fallback = 0,
  opts?: CurveEvalOptions<number>,
  preRolledRnd?: number[] | null,
): number {
  if (!curve) return fallback;
  if (curve.flex && opts?.flexOverride !== undefined) return opts.flexOverride;

  const rndMul = preRolledRnd !== undefined ? preRolledRnd : rollCurveRandom(curve, opts?.rng);
  const evalInstant = (tNorm: number): number => {
    let base: number;
    if (curve.t && curve.v && curve.t.length > 0 && curve.v.length > 0) {
      const sampled = sampleKeyframes(curve.t, curve.v as number[], tNorm);
      base = typeof sampled === 'number' ? sampled : (Array.isArray(sampled) ? sampled[0] : fallback);
    } else if (typeof curve.c === 'number') {
      base = curve.c;
    } else if (Array.isArray(curve.c) && curve.c.length > 0) {
      base = curve.c[0];
    } else {
      base = fallback;
    }
    return applyRandom(base, rndMul);
  };

  const tClamped = clamp01(u);
  if (!curve.integrated) return evalInstant(tClamped);
  if (tClamped <= 0) return 0;

  const steps = Math.max(4, opts?.integrateSteps ?? 16);
  const dt = tClamped / steps;
  let sum = 0.5 * (evalInstant(0) + evalInstant(tClamped));
  for (let i = 1; i < steps; i++) sum += evalInstant(i * dt);
  return sum * dt;
}

export function evalCurveVec2(
  curve: Curve<Vec2> | Curve | undefined,
  u: number,
  fallback: Vec2 = [0, 0],
  opts?: CurveEvalOptions<Vec2>,
  preRolledRnd?: number[] | null,
): Vec2 {
  if (!curve) return [fallback[0], fallback[1]];
  if (curve.flex && opts?.flexOverride !== undefined) return [opts.flexOverride[0], opts.flexOverride[1]];

  const rndMul = preRolledRnd !== undefined ? preRolledRnd : rollCurveRandom(curve, opts?.rng);
  const toVec2 = (x: Scalar | undefined): Vec2 => {
    if (typeof x === 'number') return [x, x];
    if (Array.isArray(x)) return [x[0] ?? fallback[0], x[1] ?? x[0] ?? fallback[1]];
    return [fallback[0], fallback[1]];
  };

  const evalInstant = (tNorm: number): Vec2 => {
    const raw = (curve.t && curve.v && curve.t.length > 0 && curve.v.length > 0)
      ? sampleKeyframes(curve.t, curve.v, tNorm)
      : curve.c;
    return applyRandom(toVec2(raw), rndMul);
  };

  const tClamped = clamp01(u);
  if (!curve.integrated) return evalInstant(tClamped);
  if (tClamped <= 0) return [0, 0];

  const steps = Math.max(4, opts?.integrateSteps ?? 16);
  const dt = tClamped / steps;
  const v0 = evalInstant(0);
  const v1 = evalInstant(tClamped);
  let sx = 0.5 * (v0[0] + v1[0]);
  let sy = 0.5 * (v0[1] + v1[1]);
  for (let i = 1; i < steps; i++) {
    const vi = evalInstant(i * dt);
    sx += vi[0];
    sy += vi[1];
  }
  return [sx * dt, sy * dt];
}

export function evalCurveVec3(
  curve: Curve<Vec3> | Curve | undefined,
  u: number,
  fallback: Vec3 = [1, 1, 1],
  opts?: CurveEvalOptions<Vec3>,
  preRolledRnd?: number[] | null,
): Vec3 {
  if (!curve) return [fallback[0], fallback[1], fallback[2]];
  if (curve.flex && opts?.flexOverride !== undefined) {
    return [opts.flexOverride[0], opts.flexOverride[1], opts.flexOverride[2]];
  }
  const rndMul = preRolledRnd !== undefined ? preRolledRnd : rollCurveRandom(curve, opts?.rng);
  const toVec3 = (x: Scalar | undefined): Vec3 => {
    if (typeof x === 'number') return [x, x, x];
    if (Array.isArray(x)) return [x[0] ?? fallback[0], x[1] ?? x[0] ?? fallback[1], x[2] ?? x[0] ?? fallback[2]];
    return [fallback[0], fallback[1], fallback[2]];
  };
  const raw = (curve.t && curve.v && curve.t.length > 0 && curve.v.length > 0)
    ? sampleKeyframes(curve.t, curve.v, clamp01(u))
    : curve.c;
  return applyRandom(toVec3(raw), rndMul);
}

export function evalCurveColor(
  curve: Curve<Rgba> | Curve | undefined,
  u: number,
  fallback: Rgba = [1, 1, 1, 1],
  opts?: CurveEvalOptions<Rgba>,
  preRolledRnd?: number[] | null,
): Rgba {
  if (!curve) return [fallback[0], fallback[1], fallback[2], fallback[3]];
  if (curve.flex && opts?.flexOverride !== undefined) {
    return [opts.flexOverride[0], opts.flexOverride[1], opts.flexOverride[2], opts.flexOverride[3]];
  }
  const rndMul = preRolledRnd !== undefined ? preRolledRnd : rollCurveRandom(curve, opts?.rng);
  const toRgba = (x: Scalar | undefined): Rgba => {
    if (typeof x === 'number') return [x, x, x, 1];
    if (Array.isArray(x)) {
      return [
        x[0] ?? fallback[0],
        x[1] ?? fallback[1],
        x[2] ?? fallback[2],
        x[3] ?? fallback[3],
      ];
    }
    return [fallback[0], fallback[1], fallback[2], fallback[3]];
  };
  const raw = (curve.t && curve.v && curve.t.length > 0 && curve.v.length > 0)
    ? sampleKeyframes(curve.t, curve.v, clamp01(u))
    : curve.c;
  const c = applyRandom(toRgba(raw), rndMul);
  return [clamp01(c[0]), clamp01(c[1]), clamp01(c[2]), clamp01(c[3])];
}

/** 统一换算原版 birthScale 到世界米（全部走 EFFECT_UNITS，严禁模块私自硬编码） */
export function birthScaleToWorld(
  birthScale: Vec3,
  primitive: PrimitiveKind,
  systemScale = 1,
): Vec3 {
  const k = (primitive === 'mesh' || primitive === 'attachedMesh')
    ? EFFECT_UNITS.meshScalePerBirthScale
    : EFFECT_UNITS.quadFullWidthPerBirthScale;
  const s = k * systemScale;
  return [birthScale[0] * s, birthScale[1] * s, birthScale[2] * s];
}

/**
 * 画质与「减轻队友特效」预算判定。
 * 硬性约束（COLLAB / BABYLON_MIGRATION / Q01-05）：
 * - `importance === 'critical'` 与 `owner === 'enemy'` 关键预警**绝不允许**被低画质或队友设置裁掉；
 * - 只有 `decor` 受 `decorBudget`、`decorScale` 与 `teammateDecorScale` 调节。
 */
export function shouldSpawnByBudget(
  owner: EffectOwner,
  importance: EffectImportance,
  activeDecorCount: number,
  budget: EffectQualityBudget,
  rng: () => number = () => 0.5,
): boolean {
  if (importance === 'critical' || importance === 'gameplay') return true;
  if (owner === 'enemy') return true;
  if (activeDecorCount >= budget.decorBudget) return false;
  let prob = clamp01(budget.decorScale);
  if (owner === 'teammate') prob *= clamp01(budget.teammateDecorScale);
  if (prob <= 0) return false;
  if (prob >= 1) return true;
  return rng() < prob;
}
