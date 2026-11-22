# 第一关「仓库区」地面贴图清单（Step 1）

本目录存放第一关仓库区的 **36 张 2048×2048 高清手绘地面分块**（总计 `28.84 MB`），用于内测阶段在 Three.js 中铺设高分辨率地表。

## 1. 排布与朝向校验结论

已将 36 张贴图逐像素边缘比对，并与 `materials.bin.json` 中的 **117 个 `MapLocator` 坐标**（`boundsMax = [18000, 18000]`）及小地图 `warehouse-district-minimap1.png` 验证通过：

- **X 轴（西 → 东，世界 `X: 0 → 18000`）**：编号 **`1` → `6`**
- **Z 轴（北 → 南，世界 `Z: 18000 → 0`）**：字母 **`A` → `F`**
- **单块变换**：**无需任何旋转或翻转（`None`，直接映射标准 UV）**。实测相邻接缝平均像素色差仅 `4.3`（横向）与 `5.5`（纵向），且与 `warehouse-district-minimap1.png` 呈 **1:1 像素级完全重合**。

```text
      西 (X=0)                                        东 (X=18000)
北 (Z=18000)  A1(Shop) A2       A3       A4       A5       A6
              B1       B2       B3       B4(Boss) B5       B6
              C1       C2       C3(Hub)  C4(Hub)  C5       C6
              D1       D2       D3       D4       D5       D6
              E1(Sea)  E2(Sea)  E3       E4       E5(Fact) E6
南 (Z=0)      F1(Sea)  F2(Sea)  F3(Sea)  F4(Sea)  F5(Sea)  F6(Sea)
```

## 2. 文件命名与后期原创资产替换规范

- **本地规范命名**：`ground_{row}{col}.png`（例如 `ground_a1.png` 对应原包 `strawberry_ground_a1.strawberryrebuild.png`）。
- **元信息索引**：同目录下的 [manifest.json](./manifest.json) 记录了每块贴图的 `id`、原文件名、中文区域备注、网格索引（`gridX`, `gridZ`）、分辨率与字节大小。
- **后期重构原创资产**：只需保持 `ground_a1.png` ~ `ground_f6.png` 同名与对应网格朝向替换即可，游戏内加载逻辑无需改动。
