/** 均匀空间网格：每步重建，用于缩小敌人碰撞候选 */
export class SpatialGrid {
  readonly cell: number;
  readonly minX: number;
  readonly minZ: number;
  readonly cols: number;
  readonly rows: number;
  private head: Int32Array;
  private next: Int32Array;

  constructor(minX: number, minZ: number, maxX: number, maxZ: number, cell: number, capacity: number) {
    this.cell = cell;
    this.minX = minX;
    this.minZ = minZ;
    this.cols = Math.ceil((maxX - minX) / cell);
    this.rows = Math.ceil((maxZ - minZ) / cell);
    this.head = new Int32Array(this.cols * this.rows).fill(-1);
    this.next = new Int32Array(capacity).fill(-1);
  }

  clear() {
    this.head.fill(-1);
  }

  private cx(x: number) {
    const c = Math.floor((x - this.minX) / this.cell);
    return c < 0 ? 0 : c >= this.cols ? this.cols - 1 : c;
  }
  private cz(z: number) {
    const c = Math.floor((z - this.minZ) / this.cell);
    return c < 0 ? 0 : c >= this.rows ? this.rows - 1 : c;
  }

  insert(i: number, x: number, z: number) {
    if (i >= this.next.length) {
      const n = new Int32Array(this.next.length * 2).fill(-1);
      n.set(this.next);
      this.next = n;
    }
    const k = this.cz(z) * this.cols + this.cx(x);
    this.next[i] = this.head[k];
    this.head[k] = i;
  }

  /** 遍历 AABB 覆盖的格子内所有索引 */
  query(x0: number, z0: number, x1: number, z1: number, cb: (i: number) => void) {
    const a = this.cx(Math.min(x0, x1)), b = this.cx(Math.max(x0, x1));
    const c = this.cz(Math.min(z0, z1)), d = this.cz(Math.max(z0, z1));
    for (let r = c; r <= d; r++) {
      for (let col = a; col <= b; col++) {
        let i = this.head[r * this.cols + col];
        while (i !== -1) {
          cb(i);
          i = this.next[i];
        }
      }
    }
  }
}
