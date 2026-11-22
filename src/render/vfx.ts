import * as THREE from 'three';
import type { Game, Hazard } from '../sim/game';
import { JinxVfxSystem } from './jinx_vfx';
import { softDot } from './style';
import type { WeaponVfxRenderer } from './weapon_vfx';

interface Ring {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  maxR: number;
  active: boolean;
}

interface Particle {
  active: boolean;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  age: number; life: number;
  r: number; g: number; b: number;
}

/**
 * 特效与危险区渲染：
 * - 地面危险区与逻辑共用同一套 Hazard 数据，玫红实线边框 + 半透明填充
 * - 敌方预警渲染优先级高于友方爆炸
 * - 粒子使用对象池 + 单个 Points，受画质预算限制
 */
export class VfxRenderer {
  private root = new THREE.Group();
  private hazardGroup = new THREE.Group();
  private hazardPool: { fill: THREE.Mesh; line: THREE.Line }[] = [];
  private rings: Ring[] = [];

  private maxP = 800;
  private particles: Particle[] = [];
  private pGeo: THREE.BufferGeometry;
  private pPos: Float32Array;
  private pCol: Float32Array;
  private pPoints: THREE.Points;

  readonly jinxVfx: JinxVfxSystem;
  private weaponVfx: WeaponVfxRenderer | null = null;

  shake = 0;
  reduceFlash = false;
  noShake = false;

  constructor(scene: THREE.Scene) {
    scene.add(this.root);
    this.hazardGroup.renderOrder = 12;
    this.root.add(this.hazardGroup);

    // 预分配冲击波环池
    const ringGeo = new THREE.RingGeometry(0.75, 1.0, 28);
    ringGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
        color: 0xffa630, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false,
      }));
      m.visible = false;
      m.renderOrder = 8;
      this.root.add(m);
      this.rings.push({ mesh: m, age: 0, life: 0.3, maxR: 2, active: false });
    }

    // 粒子池
    this.pPos = new Float32Array(this.maxP * 3);
    this.pCol = new Float32Array(this.maxP * 3);
    this.pGeo = new THREE.BufferGeometry();
    this.pGeo.setAttribute('position', new THREE.BufferAttribute(this.pPos, 3));
    this.pGeo.setAttribute('color', new THREE.BufferAttribute(this.pCol, 3));
    this.pPoints = new THREE.Points(this.pGeo, new THREE.PointsMaterial({
      size: 0.52, map: softDot(), alphaTest: 0.02, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false,
    }));
    this.pPoints.frustumCulled = false;
    this.pPoints.renderOrder = 10;
    this.root.add(this.pPoints);
    for (let i = 0; i < this.maxP; i++) {
      this.particles.push({ active: false, x: 0, y: -50, z: 0, vx: 0, vy: 0, vz: 0, age: 0, life: 1, r: 1, g: 1, b: 1 });
    }

    // 金克丝官方 VFX 系统
    this.jinxVfx = new JinxVfxSystem(this.root);
  }

  attachWeaponVfx(w: WeaponVfxRenderer) {
    this.weaponVfx = w;
  }

  private spawnRing(x: number, z: number, maxR: number, life: number, hex: number) {
    const r = this.rings.find((v) => !v.active);
    if (!r) return;
    r.active = true; r.age = 0; r.life = life; r.maxR = maxR;
    r.mesh.visible = true;
    r.mesh.position.set(x, 0.08, z);
    r.mesh.scale.setScalar(0.2);
    (r.mesh.material as THREE.MeshBasicMaterial).color.setHex(hex);
  }

  private spawnParticles(x: number, y: number, z: number, count: number, speed: number, life: number, hex: number) {
    const c = new THREE.Color(hex);
    let spawned = 0;
    for (let i = 0; i < this.maxP && spawned < count; i++) {
      const p = this.particles[i];
      if (p.active) continue;
      p.active = true;
      p.x = x; p.y = y; p.z = z;
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.4 + Math.random() * 0.8);
      p.vx = Math.cos(a) * sp;
      p.vy = 1.5 + Math.random() * speed * 0.6;
      p.vz = Math.sin(a) * sp;
      p.age = 0; p.life = life * (0.7 + Math.random() * 0.6);
      p.r = c.r; p.g = c.g; p.b = c.b;
      spawned++;
    }
  }

  private addShake(amount: number) {
    if (!this.noShake) this.shake = Math.min(0.6, Math.max(this.shake, amount));
  }

  consumeEvents(g: Game, fxScale: number, budget: number) {
    const qScale = this.reduceFlash ? fxScale * 0.45 : fxScale;
    const count = (n: number) => Math.max(1, Math.round(n * qScale));
    for (const ev of g.events) {
      if (ev.type === 'shoot') {
        this.jinxVfx.triggerMuzzle(ev.x, ev.z, ev.ang, ev.weapon, ev.ownerId ?? 0);
        if (ev.weapon === 'cn') this.addShake(0.1);
        if (ev.weapon === 'ult') this.addShake(0.28);
      } else if (ev.type === 'hit') {
        const hex = ev.crit ? 0xffe45e : ev.kind === 'meow_evo' ? 0xff6ee6 : ev.kind === 'statikk' ? 0x92fbff : 0x8ef9ff;
        this.spawnParticles(ev.x, 0.65, ev.z, count(ev.crit ? 7 : 4), 4.5, 0.22, hex);
        if (ev.kind === 'meow' || ev.kind === 'meow_evo' || ev.kind === 'uwu' || ev.kind === 'crossbow') {
          this.jinxVfx.spawnGunHit(ev.x, ev.z, !!ev.crit, ev.kind === 'meow_evo');
        }
      } else if (ev.type === 'explode') {
        if (ev.kind === 'ult' || ev.kind === 'ult_r') {
          this.jinxVfx.spawnUltDome(ev.x, ev.z, ev.r);
          this.spawnRing(ev.x, ev.z, ev.r, 0.45, 0xb8feff);
          this.spawnRing(ev.x, ev.z, ev.r * 0.65, 0.28, 0xff62d4);
          this.spawnParticles(ev.x, 0.7, ev.z, count(44), 11, 0.55, 0x62f5ff);
          this.spawnParticles(ev.x, 0.5, ev.z, count(26), 5.5, 0.85, 0xff80e0);
          this.addShake(0.48);
        } else if (ev.kind === 'rocket_e') {
          this.jinxVfx.spawnRocketEBlast(ev.x, ev.z, ev.r);
          this.spawnRing(ev.x, ev.z, ev.r, 0.26, 0xff9e2c);
          this.spawnParticles(ev.x, 0.5, ev.z, count(14), 6.5, 0.3, 0xffae3d);
          this.addShake(0.14);
        } else if (ev.kind === 'iceblast') {
          this.weaponVfx?.spawnIceBlast(ev.x, ev.z, ev.r);
          this.spawnRing(ev.x, ev.z, ev.r, 0.45, 0x8ef9ff);
          this.spawnParticles(ev.x, 0.6, ev.z, count(28), 9, 0.5, 0xa8fcff);
          this.addShake(0.2);
        } else if (ev.kind === 'orbital') {
          this.weaponVfx?.spawnOrbitalBeam(ev.x, ev.z, ev.r);
          this.spawnRing(ev.x, ev.z, ev.r, 0.32, 0x8ef9ff);
          this.spawnParticles(ev.x, 0.7, ev.z, count(20), 8, 0.36, 0xffe46b);
          this.addShake(0.18);
        } else if (ev.kind === 'radiant') {
          this.spawnRing(ev.x, ev.z, ev.r, 0.26, 0xff5a22);
          this.spawnParticles(ev.x, 0.5, ev.z, count(14), 6, 0.3, 0xff8c38);
        } else if (ev.kind === 'mine') {
          this.spawnRing(ev.x, ev.z, ev.r, 0.32, 0xff8c3a);
          this.spawnParticles(ev.x, 0.4, ev.z, count(14), 6, 0.32, 0xffaa44);
          this.addShake(0.14);
        } else {
          this.spawnRing(ev.x, ev.z, ev.r, 0.26, 0xff9e2c);
          this.spawnParticles(ev.x, 0.5, ev.z, count(14), 6.5, 0.3, 0xffae3d);
          this.addShake(0.15);
        }
      } else if (ev.type === 'kill') {
        // Q-27：原版 Strawberry_Enemy_Death 是红橙色（HeartGlow (1, 0.27, 0.22)、Spark (1, 0.09, 0.09)、HeartGlow2 (1, 0.33, 0.24)），
        // 火花层 FN_Universal_Sparks 寿命 0.5 s。旧值暗青 0x3a6f74、0.35 s。
        this.spawnParticles(ev.x, 0.45, ev.z, count(ev.kind === 'elite' ? 24 : 7), 4.5, 0.5, 0xff4639);
      } else if (ev.type === 'dash') {
        this.spawnParticles(ev.x, 0.5, ev.z, count(10), 4, 0.28, 0x4df5ff);
      } else if (ev.type === 'overload' && ev.on) {
        this.spawnRing(g.player.x, g.player.z, 2.5, 0.35, 0x48f7ff);
      } else if (ev.type === 'bossLand') {
        this.spawnRing(ev.x, ev.z, 6.5, 0.5, 0xff2e88);
        this.spawnParticles(ev.x, 0.5, ev.z, count(30), 9, 0.6, 0xdbe5ec);
        this.addShake(0.48);
      } else if (ev.type === 'hazardHit') {
        this.spawnRing(ev.x, ev.z, ev.kind === 'circle' ? 2.5 : 4, 0.25, 0xff2b85);
        this.addShake(0.22);
      } else if (ev.type === 'bossPhase') {
        if (g.boss) this.spawnRing(g.boss.x, g.boss.z, 8, 0.6, 0xff3b9a);
        this.addShake(0.4);
      } else if (ev.type === 'bossDead') {
        this.spawnRing(ev.x, ev.z, 10, 0.8, 0x62f8ff);
        this.spawnParticles(ev.x, 1.2, ev.z, count(60), 12, 1.0, 0xffb338);
        this.addShake(0.55);
      } else if (ev.type === 'playerHurt') {
        this.addShake(0.26);
      } else if (ev.type === 'fountainHeal') {
        this.spawnRing(ev.x, ev.z, 12.5, 0.65, 0x2ef89a);
        this.spawnRing(ev.x, ev.z, 9.0, 0.45, 0xffd452);
        this.spawnParticles(ev.x, 1.0, ev.z, count(32), 8.5, 0.85, 0x33ff85);
        this.spawnParticles(ev.x, 1.2, ev.z, count(20), 7.5, 0.9, 0xffc845);
        this.addShake(0.16);
      } else if (ev.type === 'boxBreak') {
        this.spawnRing(ev.x, ev.z, 1.8, 0.28, 0x95b5ff);
        this.spawnRing(ev.x, ev.z, 1.2, 0.18, 0x9eff40);
        this.spawnParticles(ev.x, 0.55, ev.z, count(20), 6.2, 0.42, 0x8c9ad6);
        this.spawnParticles(ev.x, 0.45, ev.z, count(8), 2.5, 0.55, 0x555c66);
      }
    }
    this.maxActiveBudget = budget;
  }
  private maxActiveBudget = 420;

  update(dt: number, g: Game) {
    this.shake = Math.max(0, this.shake - dt * 1.8);

    // 冲击波环
    for (const r of this.rings) {
      if (!r.active) continue;
      r.age += dt;
      if (r.age >= r.life) { r.active = false; r.mesh.visible = false; continue; }
      const k = r.age / r.life;
      r.mesh.scale.setScalar(0.2 + (r.maxR - 0.2) * (1 - Math.pow(1 - k, 2)));
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * (this.reduceFlash ? 0.55 : 0.9);
    }

    // 粒子
    let activeCount = 0;
    for (let i = 0; i < this.maxP; i++) {
      const p = this.particles[i];
      if (!p.active || activeCount >= this.maxActiveBudget) {
        if (p.active && activeCount >= this.maxActiveBudget) p.active = false;
        this.pPos[i * 3 + 1] = -99;
        continue;
      }
      p.age += dt;
      if (p.age >= p.life) { p.active = false; this.pPos[i * 3 + 1] = -99; continue; }
      p.vy -= 12 * dt;
      p.x += p.vx * dt; p.y = Math.max(0.05, p.y + p.vy * dt); p.z += p.vz * dt;
      const fade = 1 - p.age / p.life;
      this.pPos[i * 3] = p.x; this.pPos[i * 3 + 1] = p.y; this.pPos[i * 3 + 2] = p.z;
      this.pCol[i * 3] = p.r * fade; this.pCol[i * 3 + 1] = p.g * fade; this.pCol[i * 3 + 2] = p.b * fade;
      activeCount++;
    }
    this.pGeo.attributes.position.needsUpdate = true;
    this.pGeo.attributes.color.needsUpdate = true;

    this.jinxVfx.update(dt, g.clock, g.player.x, g.player.z, g.player.overloadT > 0, this.reduceFlash);

    this.drawHazards(g);
  }

  private drawHazards(g: Game) {
    // 清理上一帧几何，仅在有危险区时绘制（通常 <= 6 个，开销极微）
    while (this.hazardPool.length < g.hazards.length) {
      const fill = new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.MeshBasicMaterial({ color: 0xff2b88, transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false }),
      );
      const line = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 0xff1c74, linewidth: 2 }),
      );
      fill.renderOrder = 12; line.renderOrder = 13;
      this.hazardGroup.add(fill, line);
      this.hazardPool.push({ fill, line });
    }
    for (let i = 0; i < this.hazardPool.length; i++) {
      const slot = this.hazardPool[i];
      if (i >= g.hazards.length) { slot.fill.visible = false; slot.line.visible = false; continue; }
      const h = g.hazards[i];
      slot.fill.visible = true; slot.line.visible = true;
      const prog = Math.min(1, Math.max(0, (g.time - h.t0) / Math.max(0.01, h.t1 - h.t0)));
      const mat = slot.fill.material as THREE.MeshBasicMaterial;
      mat.opacity = h.resolved ? 0.55 : 0.16 + prog * 0.28;
      this.buildHazardGeo(h, prog, slot.fill, slot.line);
    }
  }

  private buildHazardGeo(h: Hazard, prog: number, fill: THREE.Mesh, line: THREE.Line) {
    fill.geometry.dispose(); line.geometry.dispose();
    if (h.kind === 'circle') {
      const isRingWarn = h.dmg === 0 && h.arc > 0; // 潮门缺口示意
      if (isRingWarn) {
        const geo = new THREE.RingGeometry(h.r, h.r + 0.55, 28, 1, -h.ang + h.arc / 2, Math.PI * 2 - h.arc);
        geo.rotateX(-Math.PI / 2);
        fill.geometry = geo;
        fill.position.set(h.x, 0.06, h.z);
        line.visible = false;
        return;
      }
      const r = h.r;
      const fg = new THREE.CircleGeometry(r * Math.max(0.15, prog), 28);
      fg.rotateX(-Math.PI / 2);
      fill.geometry = fg;
      fill.position.set(h.x, 0.055, h.z);
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 28; k++) {
        const a = (k / 28) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, 0.065, Math.sin(a) * r));
      }
      line.geometry = new THREE.BufferGeometry().setFromPoints(pts);
      line.position.set(h.x, 0, h.z);
    } else if (h.kind === 'sector') {
      // Three.js CircleGeometry 在 XY 平面从 +X 逆时针；rotateX(-PI/2) 后 +Y 变成 -Z，注意角度符号
      const start = -h.ang - h.arc / 2;
      const fg = new THREE.CircleGeometry(h.r * Math.max(0.2, prog), 24, start, h.arc);
      fg.rotateX(-Math.PI / 2);
      fill.geometry = fg;
      fill.position.set(h.x, 0.055, h.z);
      const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0.065, 0)];
      for (let k = 0; k <= 24; k++) {
        const a = h.ang - h.arc / 2 + (k / 24) * h.arc;
        pts.push(new THREE.Vector3(Math.cos(a) * h.r, 0.065, Math.sin(a) * h.r));
      }
      pts.push(new THREE.Vector3(0, 0.065, 0));
      line.geometry = new THREE.BufferGeometry().setFromPoints(pts);
      line.position.set(h.x, 0, h.z);
    } else {
      // line（冲锋路径）
      const hw = h.w / 2;
      const fg = new THREE.PlaneGeometry(h.r, h.w);
      fg.rotateX(-Math.PI / 2);
      fg.translate(h.r / 2, 0.055, 0);
      fg.rotateY(-h.ang);
      fill.geometry = fg;
      fill.position.set(h.x, 0, h.z);
      const c = Math.cos(h.ang), s = Math.sin(h.ang);
      const px = -s * hw, pz = c * hw;
      const ex = c * h.r, ez = s * h.r;
      line.geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(px, 0.065, pz),
        new THREE.Vector3(ex + px, 0.065, ez + pz),
        new THREE.Vector3(ex - px, 0.065, ez - pz),
        new THREE.Vector3(-px, 0.065, -pz),
        new THREE.Vector3(px, 0.065, pz),
      ]);
      line.position.set(h.x, 0, h.z);
    }
  }
}
