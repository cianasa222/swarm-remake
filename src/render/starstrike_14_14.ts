/**
 * Q-30：战兔巨爆（14.14 原版 StarStrike）逐层特效数据 + 纯计算函数（不依赖 three，可在 Node 里测试）。
 *
 * 来源：Patch 14.14 `map33.bin.json` 的 4 个 VfxSystemDefinitionData，经 BAB-Q01 `tools/bab/extract_vfx_14_14.cjs`
 * 提取（`src/render-babylon/vfx/data/14.14/weapons.json`），再由 Quick AI 用脚本转成本表；**数值没有手工改写**。
 *   - target            = Strawberry_Weapon_StarStrike_Karthus_Target        普通版落点（4 层）
 *   - targetEvolve      = Strawberry_Weapon_Starstrike_Evolve_Target         进化版的普通落点（4 层）
 *   - targetEvolveMain  = Strawberry_Weapon_Starstrike_Evolve_Target_Main    进化版额外的大落点（4 层，红橙色）
 *   - explosion         = Strawberry_Weapon_StarStrike_Karthus_Explosion     爆炸（9 层，普通 / 进化共用）
 * 三个落点系统与游戏状态的对应是按名称推断的（bin 里没有法术引用），需用原版录像确认。
 *
 * 单位：原版 1 = 1 cm。换算规则集中在 STAR_UNITS（与 BAB-Q01 `EFFECT_UNITS` 相同的约定），需要用原版截图校准时只改这里。
 * 未实现（已在各层 `skipped` 标注）：alphaErosionDefinition（溶解）、softParticleParams（软粒子）、useNavmeshMask。
 *
 * ⚠️ 状态：未编译（Quick AI 环境没有 TypeScript），由上传方跑 `npm run build` 和 `tools/q30-starstrike.test.ts`。
 */

export type V3 = [number, number, number];
export type V4 = [number, number, number, number];
export interface Curve { c?: number[]; t?: number[]; v?: number[][] }
export interface RndTable { t: number[]; v: number[] }

export interface StarLayer {
  name: string;
  /** ground = 平铺地面的方片；ray = 竖直、绕竖轴朝向镜头的光柱（底部在发射点）；axial = 沿速度方向朝向镜头的碎片；mesh = 3D 网格 */
  prim: 'ground' | 'ray' | 'axial' | 'mesh';
  tex: string;
  mult?: { tex: string; flipV: boolean; rotRate: number };
  mesh?: 'burst' | 'lightInside';
  blend: 'add' | 'alpha';
  pass: number;
  emitLife: number | null;
  single: boolean;
  rate: number;
  life: number;
  lifeRnd?: RndTable;
  bs: number[];
  bsRnd?: (RndTable | null)[];
  scale: Curve;
  bc: number[];
  bcRnd?: (RndTable | null)[];
  color: Curve | null;
  rot: number[];
  rotRnd?: (RndTable | null)[];
  rotVel?: number[];
  vel?: number[];
  velRnd?: (RndTable | null)[];
  drag?: number[];
  pos: number[];
  offset?: number[];
  randYaw?: boolean;
  cyl?: [number, number];
  ground?: boolean;
  dirOriented?: boolean;
  uv?: { div?: number[]; frame?: number; scale?: number[]; scroll?: number[]; offset?: number[] };
  skipped?: string[];
}
export interface StarSystem { id: string; layers: StarLayer[] }
export type StarSystemKey = 'target' | 'targetEvolve' | 'targetEvolveMain' | 'explosion';

export const STARSTRIKE_14_14: Record<StarSystemKey, StarSystem> = {"targetEvolve":{"id":"Strawberry_Weapon_Starstrike_Evolve_Target","layers":[{"name":"StarS_BG","prim":"ground","tex":"strawberry_weapon_starstrike_decal_perf","blend":"alpha","pass":0,"emitLife":null,"single":true,"rate":1,"life":1.100000023841858,"bs":[90,90,0],"scale":{"t":[0,0.2,0.25,0.3,0.4],"v":[[1.14,1.5,1],[1.95,1.5,1],[1.5,1.5,1],[1.5,1.5,1],[0,0,0]]},"bc":[1,1,1,0.4],"color":{"t":[0.25,0.3],"v":[[0.094118,0.51339,0.905882,1],[0.098039,0.164706,0.533333,1]]},"rot":[90,0,0],"pos":[0,5,0],"randYaw":true},{"name":"StarS_Outline","prim":"ground","tex":"strawberry_weapon_starstrike_decal_outline_perf","blend":"alpha","pass":1,"emitLife":null,"single":true,"rate":1,"life":1.100000023841858,"bs":[90,90,1],"scale":{"t":[0,0.2,0.25,0.3,0.4],"v":[[1.125,1.5,1],[1.95,1.5,1],[1.5,1.5,1],[1.5,1.5,1],[0,0,0]]},"bc":[1,1,1,0.4],"color":{"t":[0.25,0.3],"v":[[0.094118,0.859617,0.905882,1],[0.368627,0.831373,0.858824,1]]},"rot":[90,0,0],"pos":[0,5,0],"randYaw":true,"skipped":["alphaErosionDefinition"]},{"name":"BG","prim":"ground","tex":"strawberry_weapon_starstrike_deca_xtarget","blend":"add","pass":3,"emitLife":null,"single":true,"rate":1,"life":1.100000023841858,"bs":[50,1,1],"scale":{"t":[0,0.112717,0.149133,0.177746,0.2,0.215029,0.230636,0.25,0.271387,0.289595,0.35,0.4],"v":[[0,0,0],[1.731818,0,0],[2.1,0,0],[2.236364,0,0],[2.25,0,0],[1.609091,0,0],[0.831818,0,0],[0.681818,0,0],[0.709091,0,0],[0.927273,0,0],[1.5,0,0],[0,0,0]]},"bc":[0.140002,0.859998,0.770001,0.4],"color":{"t":[0,0.15,0.25],"v":[[1,1,1,0.4],[1,1,1,0.4],[1,1,1,1]]},"rot":[90,0,0],"pos":[0,5,0],"offset":[0,1,0],"randYaw":true},{"name":"Laser_","prim":"ray","tex":"aurelionsol_base_r_groundtrail_color-bellcurve","blend":"add","pass":4,"mult":{"tex":"belveth_base_basicgradient","flipV":false,"rotRate":0.25},"emitLife":4,"single":true,"rate":1,"life":1,"bs":[25,900,0],"scale":{"t":[0,0.3,0.4],"v":[[2,1,0],[2,1,0],[0,1,0]]},"bc":[1,1,1,0.250004],"color":{"t":[0,0.03,0.8,1],"v":[[0.094118,0.81239,0.905882,0],[0.094118,0.846357,0.905882,1],[0.409995,0.489998,0.620005,1],[0.121569,0.023529,0,0]]},"rot":[-90,0,90],"pos":[0,0,0],"skipped":["softParticleParams"]}]},"targetEvolveMain":{"id":"Strawberry_Weapon_Starstrike_Evolve_Target_Main","layers":[{"name":"StarS_BG","prim":"ground","tex":"strawberry_weapon_starstrike_decal_perf","blend":"alpha","pass":0,"emitLife":null,"single":true,"rate":1,"life":1.100000023841858,"bs":[90,90,0],"scale":{"t":[0,0.2,0.25,0.3,0.4],"v":[[1.14,1.5,1],[1.95,1.5,1],[1.5,1.5,1],[1.5,1.5,1],[0,0,0]]},"bc":[1,1,1,1],"color":{"t":[0.25,0.3],"v":[[0.905882,0.094118,0.152026,1],[0.098039,0.164706,0.533333,1]]},"rot":[90,0,0],"pos":[0,5,0],"randYaw":true},{"name":"StarS_Outline","prim":"ground","tex":"strawberry_weapon_starstrike_decal_outline_perf","blend":"alpha","pass":1,"emitLife":null,"single":true,"rate":1,"life":1.100000023841858,"bs":[90,90,1],"scale":{"t":[0,0.2,0.25,0.3,0.4],"v":[[1.125,1.5,1],[1.95,1.5,1],[1.5,1.5,1],[1.5,1.5,1],[0,0,0]]},"bc":[1,1,1,1],"color":{"t":[0.25,0.3],"v":[[0.905882,0.356863,0.094118,1],[0.368627,0.831373,0.858824,1]]},"rot":[90,0,0],"pos":[0,5,0],"randYaw":true,"skipped":["alphaErosionDefinition"]},{"name":"BG","prim":"ground","tex":"strawberry_weapon_starstrike_deca_xtarget","blend":"add","pass":3,"emitLife":null,"single":true,"rate":1,"life":1.100000023841858,"bs":[50,1,1],"scale":{"t":[0,0.112717,0.149133,0.177746,0.2,0.215029,0.230636,0.25,0.271387,0.289595,0.35,0.4],"v":[[0,0,0],[1.731818,0,0],[2.1,0,0],[2.236364,0,0],[2.25,0,0],[1.609091,0,0],[0.831818,0,0],[0.681818,0,0],[0.709091,0,0],[0.927273,0,0],[1.5,0,0],[0,0,0]]},"bc":[0.140002,0.859998,0.770001,1],"color":{"t":[0,0.15,0.25],"v":[[1,1,1,0.4],[1,1,1,0.4],[1,1,1,1]]},"rot":[90,0,0],"pos":[0,5,0],"offset":[0,1,0],"randYaw":true},{"name":"Laser_","prim":"ray","tex":"aurelionsol_base_r_groundtrail_color-bellcurve","blend":"add","pass":4,"mult":{"tex":"belveth_base_basicgradient","flipV":false,"rotRate":0.25},"emitLife":4,"single":true,"rate":1,"life":1,"bs":[25,900,0],"scale":{"t":[0,0.3,0.4],"v":[[2,1,0],[2,1,0],[0,1,0]]},"bc":[1,1,1,1],"color":{"t":[0,0.03,0.8,1],"v":[[0.905882,0.419913,0.094118,0],[0.905882,0.373907,0.094118,1],[0.409995,0.489998,0.620005,1],[0.121569,0.023529,0,0]]},"rot":[-90,0,90],"pos":[0,0,0],"skipped":["softParticleParams"]}]},"explosion":{"id":"Strawberry_Weapon_StarStrike_Karthus_Explosion","layers":[{"name":"StarS_Bits","prim":"axial","tex":"sylas_skin24_shapes01","blend":"add","pass":9,"emitLife":0.20000000298023224,"single":true,"rate":5,"life":0.699999988079071,"lifeRnd":{"t":[0,0.5,1],"v":[0.4,0.6,1.2]},"bs":[55,100,0],"bsRnd":[{"t":[0,1],"v":[0.4,1]},{"t":[0,1],"v":[0.5,1.5]},null],"scale":{"t":[0,0.112177,0.175158,0.519681,1],"v":[[0,0,0],[0.135135,1,0],[1,1,0],[0.297165,0.305344,0],[0,0,0]]},"bc":[1,1,1,1],"color":{"t":[0,0.1,0.5,0.7,0.8,1],"v":[[0.330007,1,0.801907,0],[0.254902,1,0.855085,1],[0.160784,1,0.960418,1],[0.837949,0.45098,1,1],[1,0.329412,0.994522,1],[0.772168,0,1,0]]},"rot":[1,0,0],"rotRnd":[{"t":[0,1],"v":[-360,360]},null,null],"vel":[800,2000,0],"velRnd":[{"t":[0,1],"v":[0.3,1]},{"t":[0,1],"v":[0.1,1]},null],"drag":[5,5,5],"pos":[0,0,0],"cyl":[0,0],"dirOriented":true,"uv":{"div":[2,2],"frame":1}},{"name":"StarS_SkyBeam_Center","prim":"ray","tex":"strawberry_leona_skin10_beam_2","blend":"add","pass":201,"emitLife":0.20000000298023224,"single":false,"rate":3,"life":0.30000001192092896,"bs":[200,1280,1],"scale":{"t":[0.023649,0.110135,0.136892,0.207027,0.419595,1],"v":[[0.025,1.429091,0],[0.430303,1.4,0.5],[0.430303,1.298182,0.5],[1,1.210909,0.5],[0.5,0.865455,1],[0.05,0,0.1]]},"bc":[1,0.880003,0.579995,1],"bcRnd":[{"t":[0,1],"v":[1,1]},{"t":[0,1],"v":[1,1]},{"t":[0,1],"v":[1,1]},null],"color":{"t":[0,0.4,1],"v":[[1,1,1,1],[1,1,1,1],[0.702846,0.161563,0.977157,1]]},"rot":[-90,0,0],"pos":[0,0,0],"skipped":["softParticleParams"]},{"name":"StarS_SkyBeam","prim":"ray","tex":"augment_orbitallaser_laser_corehardedge","blend":"alpha","pass":200,"mult":{"tex":"aurelionsol_base_cata_sharpedges_gradientmask","flipV":true,"rotRate":0},"emitLife":1,"single":true,"rate":1,"life":0.5,"bs":[350,1300,0],"bsRnd":[{"t":[0,1],"v":[0.5,1]},null,null],"scale":{"t":[0,0.511207,1],"v":[[0.7,1.5,1],[0.49,1.5,0],[0,1.5,0]]},"bc":[1,1,1,0.949996],"bcRnd":[{"t":[0,1],"v":[1,1]},{"t":[0,1],"v":[1,1]},{"t":[0,1],"v":[1,1]},null],"color":{"t":[0,0.456897,0.689655,0.866379,1],"v":[[0.370993,0,1,1],[0.137072,0.92636,1,0.921569],[0.206897,0.853803,1,0.776471],[0.485283,0.259922,1,0.458824],[0.644755,0.300008,1,0]]},"rot":[-90,0,0],"pos":[0,0,0],"uv":{"scale":[1,2],"scroll":[0,-5]},"skipped":["softParticleParams"]},{"name":"StarS_EarthGround_LightRim","prim":"ground","tex":"cracks_light","blend":"add","pass":1,"emitLife":0.5,"single":true,"rate":1,"life":0.699999988079071,"bs":[300,-300,300],"scale":{"t":[0,0.05,1],"v":[[0,0,0],[1,1,1],[1,1,1]]},"bc":[1,1,1,0.500008],"color":{"t":[0,0.1,0.4,1],"v":[[1,1,1,0],[0,0.970169,1,1],[0,0.530831,1,0.14902],[0,0.411994,1,0]]},"rot":[90,270,0],"pos":[0,0,0],"ground":true,"skipped":["useNavmeshMask"]},{"name":"StarS_EarthGround","prim":"ground","tex":"base_revive_ground_crack","blend":"alpha","pass":0,"emitLife":3,"single":true,"rate":1,"life":1,"bs":[300,-300,300],"scale":{"t":[0,0.05,1],"v":[[0,0,0],[1,1,1],[1,1,1]]},"bc":[0.779995,0.779995,0.779995,0.8],"color":{"t":[0,0.5,1],"v":[[1,1,1,1],[1,1,1,1],[1,1,1,0]]},"rot":[90,270,0],"pos":[0,0,0],"offset":[0,4,0],"ground":true,"skipped":["alphaErosionDefinition","useNavmeshMask"]},{"name":"StarS_GroundFlare","prim":"ground","tex":"leona_skin53_lensflare","blend":"add","pass":12,"emitLife":0.5,"single":true,"rate":2,"life":0.30000001192092896,"bs":[450,760,0.5],"scale":{"t":[0,1],"v":[[1,0,0],[0,0,0]]},"bc":[1,0.979995,1,1],"color":{"t":[0,0.1,0.9,0.9999],"v":[[0.158358,0.901946,1,0],[0.241382,0.6907,0.910842,1],[0.364599,0.170108,0.876036,1],[0.45272,0.162905,0.825833,1]]},"rot":[90,0,90],"pos":[0,0,0]},{"name":"StarS_GroundSwirl","prim":"mesh","tex":"strawberry_leona_base_erosionsphere02","blend":"add","pass":10,"mesh":"burst","emitLife":1,"single":true,"rate":1,"life":0.5,"lifeRnd":{"t":[0,1],"v":[0.7,1.3]},"bs":[2.4,1,2.75],"scale":{"t":[0,0.15,1],"v":[[0.4,0.4,0.4],[0.8,0.8,0.8],[0.96,0.96,0.96]]},"bc":[1,1,1,1],"bcRnd":[null,null,null,{"t":[0,1],"v":[0.5,1]}],"color":{"t":[0,0.25,0.4,0.6,1],"v":[[0.572549,1,0.907103,1],[0.564706,0.982147,1,1],[0.352941,0.694804,1,1],[0.454902,0.51313,1,0.490196],[0.378408,0.184314,0.756863,0]]},"rot":[0,1,0],"rotRnd":[null,{"t":[0,1],"v":[0,360]},null],"rotVel":[0,150,0],"pos":[0,0,0],"uv":{"offset":[0,0.10000000149011612]},"skipped":["alphaErosionDefinition"]},{"name":"StarS_Ground_Inner","prim":"mesh","tex":"strawberry_poi_mapd_turret_base_smoke_trail","blend":"add","pass":7,"mesh":"lightInside","emitLife":1,"single":true,"rate":1,"life":0.5,"lifeRnd":{"t":[0,1],"v":[0.7,1.2]},"bs":[13,15,13],"bsRnd":[null,{"t":[0,1],"v":[0.5,1]},null],"scale":{"t":[0,0.084868,0.292763,0.583553,0.996711],"v":[[0,0,0],[0.8,1.16,0.8],[0.90493,1.38,0.90493],[1.06,1.53,1.06],[1.1,1.65,1.1]]},"bc":[0.089998,0.919997,0.949996,1],"color":{"t":[0,1],"v":[[1,1,1,1],[0.392035,0,0.957732,0]]},"rot":[0,1,0],"rotRnd":[null,{"t":[0,1],"v":[0,360]},null],"vel":[0,40,0],"velRnd":[null,{"t":[0,1],"v":[0.2,1]},null],"drag":[0,1,0],"pos":[0,0,0],"uv":{"div":[0.5,1],"scroll":[1,1]},"skipped":["alphaErosionDefinition"]},{"name":"StarS_SkyBeam_VertBits","prim":"ray","tex":"strawberry_leona_skin10_beam_2","blend":"add","pass":201,"emitLife":0.20000000298023224,"single":false,"rate":12,"life":0.15000000596046448,"bs":[100,1280,1],"bsRnd":[null,{"t":[0,1],"v":[0.5,1]},null],"scale":{"t":[0.023649,0.110135,0.136892,0.207027,0.419595,1],"v":[[0.015,0.714545,0],[0.258182,0.7,0.5],[0.258182,0.649091,0.5],[0.6,0.605455,0.5],[0.3,0.432727,1],[0.03,0,0.1]]},"bc":[1,0.880003,0.579995,0.579995],"color":{"t":[0,0.4,1],"v":[[1,1,1,1],[1,1,1,1],[0.702846,0.161563,0.977157,1]]},"rot":[-90,0,0],"vel":[0,-500,0],"drag":[0,3,0],"pos":[0,0,0],"cyl":[100,600],"skipped":["softParticleParams"]}]},"target":{"id":"Strawberry_Weapon_StarStrike_Karthus_Target","layers":[{"name":"StarS_BG1","prim":"ground","tex":"strawberry_weapon_starstrike_decal_perf","blend":"alpha","pass":0,"emitLife":null,"single":true,"rate":1,"life":1.100000023841858,"bs":[90,90,0],"scale":{"t":[0,0.2,0.25,0.3,0.4],"v":[[1.14,1.5,1],[1.95,1.5,1],[1.5,1.5,1],[1.5,1.5,1],[0,0,0]]},"bc":[1,1,1,1],"color":{"t":[0.25,0.3],"v":[[0.094118,0.51339,0.905882,1],[0.098039,0.164706,0.533333,1]]},"rot":[90,0,0],"pos":[0,5,0],"randYaw":true},{"name":"StarS_Outline1","prim":"ground","tex":"strawberry_weapon_starstrike_decal_outline_perf","blend":"alpha","pass":1,"emitLife":null,"single":true,"rate":1,"life":1.100000023841858,"bs":[90,90,1],"scale":{"t":[0,0.2,0.25,0.3,0.4],"v":[[1.125,1.5,1],[1.95,1.5,1],[1.5,1.5,1],[1.5,1.5,1],[0,0,0]]},"bc":[1,1,1,1],"color":{"t":[0.25,0.3],"v":[[0.094118,0.859617,0.905882,1],[0.368627,0.831373,0.858824,1]]},"rot":[90,0,0],"pos":[0,5,0],"randYaw":true,"skipped":["alphaErosionDefinition"]},{"name":"BG4","prim":"ground","tex":"strawberry_weapon_starstrike_deca_xtarget","blend":"add","pass":3,"emitLife":null,"single":true,"rate":1,"life":1.100000023841858,"bs":[50,1,1],"scale":{"t":[0,0.112717,0.149133,0.177746,0.2,0.215029,0.230636,0.25,0.271387,0.289595,0.35,0.4],"v":[[0,0,0],[1.731818,0,0],[2.1,0,0],[2.236364,0,0],[2.25,0,0],[1.609091,0,0],[0.831818,0,0],[0.681818,0,0],[0.709091,0,0],[0.927273,0,0],[1.5,0,0],[0,0,0]]},"bc":[0.140002,0.859998,0.770001,1],"color":{"t":[0,0.15,0.25],"v":[[1,1,1,0.4],[1,1,1,0.4],[1,1,1,1]]},"rot":[90,0,0],"pos":[0,5,0],"offset":[0,1,0],"randYaw":true},{"name":"Laser_1","prim":"ray","tex":"aurelionsol_base_r_groundtrail_color-bellcurve","blend":"add","pass":4,"mult":{"tex":"belveth_base_basicgradient","flipV":false,"rotRate":0.25},"emitLife":4,"single":true,"rate":1,"life":1,"bs":[25,900,0],"scale":{"t":[0,0.3,0.4],"v":[[2,1,0],[2,1,0],[0,1,0]]},"bc":[1,1,1,1],"color":{"t":[0,0.03,0.8,1],"v":[[0.094118,0.81239,0.905882,0],[0.094118,0.846357,0.905882,1],[0.409995,0.489998,0.620005,1],[0.121569,0.023529,0,0]]},"rot":[-90,0,90],"pos":[0,0,0],"skipped":["softParticleParams"]}]}};

/** 原版贴图 → 项目文件（由 tools/q30/fetch_starstrike_14_14.mjs 从 CommunityDragon 14.14 下载并转 webp） */
export const STARSTRIKE_TEX: Record<string, string> = {
  "augment_orbitallaser_laser_corehardedge": "./assets/weapons/vfx/starstrike/augment_orbitallaser_laser_corehardedge.webp",
  "aurelionsol_base_cata_sharpedges_gradientmask": "./assets/weapons/vfx/starstrike/aurelionsol_base_cata_sharpedges_gradientmask.webp",
  "aurelionsol_base_r_groundtrail_color-bellcurve": "./assets/weapons/vfx/starstrike/aurelionsol_base_r_groundtrail_color-bellcurve.webp",
  "base_revive_ground_crack": "./assets/weapons/vfx/starstrike/base_revive_ground_crack.webp",
  "belveth_base_basicgradient": "./assets/weapons/vfx/starstrike/belveth_base_basicgradient.webp",
  "cracks_light": "./assets/weapons/vfx/starstrike/cracks_light.webp",
  "leona_skin53_lensflare": "./assets/weapons/vfx/starstrike/leona_skin53_lensflare.webp",
  "strawberry_leona_base_erosionsphere02": "./assets/weapons/vfx/starstrike/strawberry_leona_base_erosionsphere02.webp",
  "strawberry_leona_skin10_beam_2": "./assets/weapons/vfx/starstrike/strawberry_leona_skin10_beam_2.webp",
  "strawberry_poi_mapd_turret_base_smoke_trail": "./assets/weapons/vfx/starstrike/strawberry_poi_mapd_turret_base_smoke_trail.webp",
  "strawberry_weapon_starstrike_deca_xtarget": "./assets/weapons/vfx/starstrike/strawberry_weapon_starstrike_deca_xtarget.webp",
  "strawberry_weapon_starstrike_decal_outline_perf": "./assets/weapons/vfx/starstrike/strawberry_weapon_starstrike_decal_outline_perf.webp",
  "strawberry_weapon_starstrike_decal_perf": "./assets/weapons/vfx/starstrike/strawberry_weapon_starstrike_decal_perf.webp",
  "sylas_skin24_shapes01": "./assets/weapons/vfx/starstrike/sylas_skin24_shapes01.webp"
};

/** 网格：burst 用项目已有的 star_burst.json（推断对应 Sylas_Skin24_AnimeBurstMesh02，待按顶点数核对）；
 *  lightInside（Strawberry_StarStrike_Light_Inside.scb）项目里还没有，缺失时用开口圆柱代替。 */
export const STARSTRIKE_MESH = {
  burst: './assets/weapons/vfx/star_burst.json',
  lightInside: './assets/weapons/vfx/starstrike/light_inside.json',
} as const;

export const STAR_UNITS = {
  /** 原版 1 cm → 项目 1 m */
  world: 0.01,
  /** 平面 / 光柱：全宽(m) = birthScale × scale × quad（同 EFFECT_UNITS.quadFullWidthPerBirthScale，待截图校准） */
  quad: 0.02,
  /** 网格：缩放 = birthScale × scale × mesh */
  mesh: 0.01,
  /** 14.14 StarStrike 爆炸半径 180 → 1.8 m；实际半径（范围加成 / 进化大落点）按比例放大水平尺寸 */
  baseRadius: 1.8,
} as const;

/** 落点特效在命中前多久开始：原版落点各层的缩放曲线都在 0.4 × 寿命处归零（底图 0.44 s、激光 0.40 s），按"归零 = 命中"对齐。 */
export const TARGET_LEAD = 0.44;

// ───────────── 纯计算 ─────────────

export function sampleTable(tb: RndTable | null | undefined, u: number): number {
  if (!tb || !tb.t.length) return 1;
  const { t, v } = tb;
  if (u <= t[0]) return v[0];
  for (let i = 1; i < t.length; i++) {
    if (u <= t[i]) { const k = (u - t[i - 1]) / Math.max(1e-6, t[i] - t[i - 1]); return v[i - 1] + (v[i] - v[i - 1]) * k; }
  }
  return v[v.length - 1];
}

/** 曲线采样，结果写进 out（零 GC）。有关键帧用关键帧，否则用常量；关键帧之外保持首 / 尾值。 */
export function sampleCurve(cv: Curve | null, u: number, out: number[], dim: number, def = 1): number[] {
  if (!cv) { for (let i = 0; i < dim; i++) out[i] = def; return out; }
  const t = cv.t, v = cv.v;
  if (t && v && t.length) {
    let a = 0, b = 0, k = 0;
    if (u <= t[0]) { a = b = 0; } else if (u >= t[t.length - 1]) { a = b = t.length - 1; } else {
      for (let i = 1; i < t.length; i++) if (u <= t[i]) { a = i - 1; b = i; k = (u - t[a]) / Math.max(1e-6, t[b] - t[a]); break; }
    }
    for (let i = 0; i < dim; i++) { const va = v[a][i] ?? def, vb = v[b][i] ?? def; out[i] = va + (vb - va) * k; }
    return out;
  }
  const c = cv.c ?? [];
  for (let i = 0; i < dim; i++) out[i] = c[i] ?? (c.length === 1 ? c[0] : def);
  return out;
}

/** 可复现随机数（每个爆炸 / 落点一个种子，粒子不存状态） */
export function rand01(seed: number, a: number, b = 0): number {
  let h = (seed ^ Math.imul(a + 1, 0x9e3779b1) ^ Math.imul(b + 7, 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** 某层的发射时刻（秒，相对系统开始）。单发层一次发 rate 个；连续层按 rate 均匀发到 emitLife。 */
export function emitTimes(L: StarLayer): number[] {
  if (L.single) return Array.from({ length: Math.max(1, Math.round(L.rate)) }, () => 0);
  const span = L.emitLife ?? L.life;
  const n = Math.max(1, Math.ceil(L.rate * span - 1e-6));
  return Array.from({ length: n }, (_, i) => i / L.rate);
}

/** 粒子寿命（含随机表） */
export function particleLife(L: StarLayer, seed: number, li: number, pi: number): number {
  return L.life * (L.lifeRnd ? sampleTable(L.lifeRnd, rand01(seed, li * 64 + pi, 1)) : 1);
}

/** 系统总时长（最晚一个粒子结束的时刻，取寿命上限） */
export function systemDuration(sys: StarSystem): number {
  let d = 0;
  for (const L of sys.layers) {
    const lifeMax = L.life * (L.lifeRnd ? Math.max(...L.lifeRnd.v) : 1);
    const ts = emitTimes(L);
    d = Math.max(d, ts[ts.length - 1] + lifeMax);
  }
  return d;
}

/** 带阻力的位移（原版 birthDrag：v' = -drag·v），返回 t 秒后的位移 */
export function dragDisp(v0: number, drag: number, t: number): number {
  return drag > 1e-6 ? v0 * (1 - Math.exp(-drag * t)) / drag : v0 * t;
}

/** sRGB → 线性（原版颜色按 sRGB 存，三维管线在线性空间混合） */
export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
