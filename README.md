# 设计工作台（Design Studio）

![license](https://img.shields.io/badge/license-MIT-blue)
![tests](https://img.shields.io/badge/checks-211%20passing-brightgreen)
![platform](https://img.shields.io/badge/platform-DeepSeek%20Harness%20Web-6f42c1)

DeepSeek Harness 内嵌的分层设计工作台：上传图片、按图层排版，把不同设计里的图片层 / 文字层绑到同一个绑定组，一处修改多图同步，最后批量导出 PNG / JPG / ZIP。

- 入口：左侧栏图标（`design-studio`，排序 6），点开后占据中间主面板。
- 插件包名 `@local/design-studio`，Host 半（`index.js`，负责项目落盘）+ Client 半（`client.js`，负责界面与画布）。

## 预览

同一份「活动背景」素材，三张不同尺寸的设计各自排版（cover / contain / 不同透明度），标题文字共享但字号、颜色、对齐、斜体各设计独立：

| 1080×1080 | 1080×1920 |
| --- | --- |
| ![方形海报](docs/export-square.png) | ![长竖海报](docs/export-tall.png) |

两张图都是引擎真实导出的 PNG（不是编辑器截图），尺寸严格等于画布尺寸。

## 安装

仓库只包含插件本体（`client.js` 已构建好，装完即用）。

```bash
git clone https://github.com/northstacker/dsh-design-studio.git
```

然后在 DeepSeek Harness 里任选一种：

1. **插件页安装**：把仓库目录作为本地插件安装；
2. **profile 链接**（`~/.dsh/profiles/<profile>/`）：
   ```bash
   ln -s /path/to/dsh-design-studio node_modules/@local/design-studio
   ```
   并在 `package.json` 的 `dependencies` 加
   `"@local/design-studio": "link:/path/to/dsh-design-studio"`、
   在 `dsh.profile.bundles` 末尾加 `"@local/design-studio"`，然后重启 Harness。

包名保留为 `@local/design-studio`（按路径安装，不走 npm registry）。改了 `src/` 之后执行 `npm run build` 重新生成 `client.js`。

## 界面

```
┌────────────────────────────────────────────────────────────────────────┐
│ 顶部工具条  项目名 · 上传 · 新建设计 · 撤销 · 重做 · 保存 · 导出        │
├──────────┬──────────────────────────────────┬──────────────────────────┤
│ 设计列表 │                                  │ 图层列表（上）           │
│ 素材列表 │            画布                  │ 属性 / 绑定 面板（下）   │
│          │  （缩放 / 平移 / 选中 / 变换）   │                          │
├──────────┴──────────────────────────────────┴──────────────────────────┤
│ 状态栏：保存状态 · 项目统计 · 选中图层提示                             │
└────────────────────────────────────────────────────────────────────────┘
```

## 使用

### 新建与导入

- **新建设计**：选择预设尺寸（1080²、1080×1350、1080×1920、1920×1080、1200×628）或自定义宽高。
- **上传**（PNG / JPG / WebP）有两种落点：
  - *每张图片新建一个设计*：一张图 = 一个画布，画布尺寸取原图尺寸。
  - *作为图层加入当前设计*：图片成为当前设计里的一个新图片层，默认 80% 铺满并保持比例。
- 普通照片导入后就是一个完整的图片层，照片里已经合成的文字与背景仍是图片像素；需要单独改的文字 / 图片请另加图层。

### 图层

- 左侧缩略图切换设计；右侧图层列表可拖拽排序（列表顶部 = 画布最上层），眼睛切换显示、锁头锁定，双击改名，垃圾桶删除，`复制` 生成偏移 24px 的副本。
- 画布上：拖动 = 移动；拖角/边 = 缩放（`Shift` 锁定比例）；上方圆点 = 旋转（`Shift` 15° 吸附）；空白处拖动 = 平移视图；滚轮 = 平移，`⌘/Ctrl` + 滚轮 = 以指针为中心缩放。
- 属性面板提供位置、尺寸、旋转、透明度的数值输入，以及图片的适应方式（适应 / 填充 / 铺满 / 原始尺寸）、裁切模式与裁切框、文字的字体 / 字号 / 字重 / 颜色 / 对齐 / 行距 / 斜体。
- 撤销 / 重做覆盖所有编辑动作；一次绑定组批量修改只占一条撤销记录。

### 跨设计绑定

1. 选中图层 → 右侧「绑定」标签。
2. *新建绑定组*：图片层只能建图片组，文字层只能建文字组（类型不符会被拒绝）。
3. 其他设计里选中同类图层 → *加入已有绑定组*，或从组内列表点「添加关联」。
4. 绑定后，编辑**共享内容**（替换图片素材 / 改文字）会先列出受影响的设计与关联数量，确认后一次同步全部成员，并作为一条撤销记录。
5. 位置、尺寸、旋转、透明度、字体、字号、颜色、对齐、行距**始终各设计独立**——这是「同一份内容、各自的排版」的实现方式。
6. 替换图片时保留每个图层的显示区域，按各自的适应 / 填充 / 裁切设置重新显示。
7. 解除绑定或删除绑定组后，图层保留当前内容与外观（引擎会把共享内容落到图层自己身上）。
8. 删除设计 / 图层只影响它自己，不会删掉其他设计里的关联图层。

### 保存

- 手动「保存」写入 `~/.dsh/design-studio/project.json`（`$DSH_HOME` 存在时用它），保留一份上一版 `project.prev.json`。
- 编辑后 1.8s 防抖自动保存；每次保存回写路径与时间到状态栏。
- 图片素材以 base64 data URL 随项目一起持久化，不依赖任何临时地址，重开后可继续编辑与批量替换。
- Host 路由不可用时回退到浏览器 `localStorage`（约 5MB 上限，素材多时会提示改用文件保存）。

### 导出

- 范围：勾选任意设计（默认当前设计）→ 单个导出直接下载，多个导出打包 ZIP。
- 格式：PNG（可选透明背景）/ JPG（可选背景色与 0.5–1 质量）。
- 尺寸：严格等于画布像素尺寸，与编辑器缩放无关。
- 导出前等待素材与字体就绪（`document.fonts.ready`），超时或缺图会在结果里明确列出。
- 文件名取设计名并做去重（重名加 ` (2)`、` (3)`），非法字符替换为 `-`。
- 结果显示每个文件的名称、尺寸、体积或失败原因。

## 数据模型

```
Project   { id, name, designs[], bindings{}, assets{} }
Design    { id, name, width, height, background, transparent, layers[] }
Layer     { id, type:'image'|'text', name, x, y, w, h, rotation, opacity,
            visible, locked, bindingId, ...内容字段 }
Binding   { id, name, kind:'image'|'text', payload:{assetId}|{text} }
Asset     { id, name, mime, width, height, dataUrl, bytes }
```

关键约定：

- **图层实例**拥有本设计的位置、尺寸、旋转、透明度与全部文字样式；**绑定组**只拥有共享内容（图片素材或文字串）。两处内容各存一份，绑定组是权威来源，加载时会重新同步一次，因此解绑 / 删组不会丢外观。
- 组成员关系是**派生**的（`layer.bindingId === binding.id`），不单独存成员表，避免两边不一致。
- 素材是追加式（append-only），替换图片不会删除旧素材，历史记录因此可以轻量共享。

## 文件

| 路径 | 作用 |
| --- | --- |
| `src/engine.mjs` | 纯数据模型、绑定、撤销、几何、文字排版、绘制 |
| `src/zip.mjs` | store-only ZIP + CRC32（批量导出用） |
| `src/ui.mjs` | 样式、基础控件、素材缓存、画布舞台（交互） |
| `src/panels.mjs` | 工作台三栏、属性 / 绑定面板、各处弹窗、导出对话框 |
| `src/entry.mjs` | 侧栏图标 + `sidebar.panellist` / `main` 注册、多语言注册 |
| `build.mjs` | 把 `src/*` 拼成 `client.js`（含词条注入与语法校验） |
| `client.js` | 构建产物（由 `node build.mjs` 生成，勿手改） |
| `index.js` | Host 半：`POST /design-studio/state` 的 `save` / `load` |
| `locale/{zh,en}.json` | 词条 |
| `test/` | 验证套件（不进发布包） |
| `docs/` | README 用的导出示例图 |

重新构建：`node build.mjs`（在插件目录内）。安装：在 Harness 插件页安装本目录，或把 `@local/design-studio` 加到 profile 的 bundle 列表。

## 测试

```bash
npm install        # 只为测试安装 @napi-rs/canvas（Skia），插件运行时不依赖它
npm test
```

四个套件共 211 项检查，直接 import 发布源码，因此测的就是装进去的代码：

| 套件 | 数量 | 覆盖 |
| --- | --- | --- |
| `test/test-model.mjs` | 95 | 数据模型、绑定同步与影响分析、类型校验、解绑/删组保留内容、单步撤销回滚整批绑定修改、命中测试、contain/cover/fill/裁切几何、CJK 与拉丁折行、文件名去重、`normalizeProject` 容错 |
| `test/test-render.mjs` | 39 | **真实 Skia 像素**：导出尺寸、cover/contain/透明度/裁切/旋转、PNG alpha、JPG 背景色、缺图上报、缩放不影响成品、>80MP 拒绝、ZIP 结构（`python3 zipfile` 校验名字/完整性/解压后 sha256） |
| `test/test-host.mjs` | 45 | Host 路由：405、save→load、上一版轮转、400/422 坏输入、HEAD、响应头 |
| `test/test-client.mjs` | 32 | 打包产物：module id、两个 Slot 注册参数、label thunk、双语键集一致、图标、工作台渲染、teardown |

`test/scenario.mjs` 是三设计 / 两绑定组的验收夹具，测试与手动验证共用同一份数据。

## 已知限制

- 只有图片层与文字层，没有形状 / 蒙版 / 滤镜 / 混合模式 / 多选变换。
- 画布上限约 8000 万像素（导出时更大会明确报错），预览按设备像素比最多渲染 2400 万像素。
- 文字排版用 `measureText` 逐词/逐字折行；没有字距微调、连字、竖排与富文本分段。
- 浏览器文件选择框、真实下载落盘属于运行时交互，自动化测试覆盖到导出前的画布与 ZIP 字节，未覆盖系统对话框本身。

## License

[MIT](LICENSE)
