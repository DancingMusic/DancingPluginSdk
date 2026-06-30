# OpenSpec: DancingPluginSdk

- Spec-ID: `dancing-plugin-sdk-openspec`
- Version: `2.0.0`
- Status: `Active`
- Last-Updated: `2026-05-17`

## Scope

定义插件 SDK 的边界、兼容策略和发布流程。

## 当前状态

- 包名：`@dancingmusic/plugin-sdk`
- 版本：`v1.1.0`
- 核心导出：`DancePlugin`（接口）、`AudioData` / `DanceRhythmFrame`（类型）、`createEmptyAudioData`（辅助函数）
- 文档站：`docs/index.html`（支持 i18n 中英切换、客户端搜索、暗色模式）
- 示例插件：`src/example/`

## 核心接口

### DancePlugin

```typescript
interface DancePlugin {
  config: DancePluginConfig;
  init(canvas: HTMLCanvasElement, settings?: Record<string, unknown>): void;
  render(audioData: AudioData, deltaTime: number, isPlaying: boolean): void;
  dispose(): void;
  resize?(width: number, height: number): void;
  updateSettings?(settings: Record<string, unknown>): void;
}
```

### DanceHostActions

宿主可以通过 `updateSettings({ hostActions })` 向插件提供显式动作回调。
插件只能通过这些回调请求宿主行为，不能直接导入宿主模块、调用连接器或修改播放队列。

```typescript
interface DanceHostPlaylistRequest {
  id: string;
  title?: string;
  startIndex?: number;
}

interface DanceHostPlaylistTrackSnapshot {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover?: string;
  durationSec?: number;
}

interface DanceHostPlaylistDetailSnapshot {
  id: string;
  title?: string;
  tracks: DanceHostPlaylistTrackSnapshot[];
}

interface DanceHostActions {
  playQueueIndex?: (index: number) => void | Promise<void>;
  playPlaylist?: (request: DanceHostPlaylistRequest) => void | Promise<void>;
  getPlaylistDetail?: (request: DanceHostPlaylistRequest) => DanceHostPlaylistDetailSnapshot | Promise<DanceHostPlaylistDetailSnapshot>;
  openPlaylistDetail?: (request: DanceHostPlaylistRequest) => void | Promise<void>;
}
```

宿主仍然拥有动作执行权，可以校验、忽略或降级处理请求。该接口用于插件内的 3D
歌单架、可视化卡片、只读详情列表等场景把用户意图交回宿主执行。`getPlaylistDetail`
返回的是宿主生成的只读快照，插件仍不能直接访问连接器。

### DancePluginConfig.hostOverlay

插件可以通过 `config.hostOverlay` 显式决定宿主左上角当前歌曲 overlay 的展示策略；这是插件控制项，不是宿主根据画布内容推断。

```typescript
interface DancePluginConfig {
  hostOverlay?: {
    showSongCover?: boolean;     // default true
    showSongMetadata?: boolean;  // default true, title + artist
  };
}
```

### DancePluginConfig.stageMotion

插件可以通过 `config.stageMotion` 声明宿主面板打开时的舞台位移策略。默认由宿主移动整个 visual canvas；需要保持全屏背景铺满的插件可以声明 `plugin-content`，由宿主通过 `updateSettings({ hostStage })` 传入只读面板状态和建议位移，插件只移动自己的前景内容。

```typescript
interface DanceHostStageState {
  panel: 'none' | 'dance-switcher';
  expanded: boolean;
  shiftX: number; // CSS pixels
  scale: number;  // 1 is neutral
}

interface DancePluginConfig {
  stageMotion?: {
    panelShift?: 'host-transform' | 'plugin-content';
  };
}
```

插件不得通过该协议修改宿主 canvas 尺寸、移动宿主 DOM 或渲染宿主面板；只能消费 `hostStage` 进行内部相机、前景节点或 2D 绘制偏移。

### DancePluginConfig.settings

插件设置由 SDK schema 描述，宿主负责渲染设置面板。设置项支持分组、排序、说明、禁用态和带 label 的 select 选项；插件不得自行注入宿主 DOM 控制面板。

```typescript
interface DancePluginSettingSection {
  id: string;
  label: string;
  description?: string;
  order?: number;
  defaultOpen?: boolean;
}

interface DancePluginSettingDefinition {
  type: 'number' | 'boolean' | 'color' | 'select';
  label: string;
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<string | { label: string; value: string }>;
  section?: string;
  order?: number;
  help?: string;
  disabled?: boolean;
}

interface DancePluginConfig {
  settingSections?: DancePluginSettingSection[];
  settings?: Record<string, DancePluginSettingDefinition>;
}
```

### AudioData

```typescript
interface AudioData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  bassLevel: number;       // 20-250 Hz
  midLevel: number;        // 250-4000 Hz
  trebleLevel: number;     // 4000-20000 Hz
  volume: number;
  energy: number;          // volume^1.5
  beatDetected: boolean;   // 节拍检测（300ms 冷却）
  bpm: number;
  bassChange: number;
  volumeChange: number;
  rhythm: DanceRhythmFrame;
}
```

### DanceRhythmFrame

`DanceRhythmFrame` 是唯一标准节奏协议。宿主负责分析音频并输出 `bands`、`onset`、`section`、`beat`、`pulse`、`bass/mid/treble/energy`；插件不得自行挂载 analyser 或实现私有节拍检测。

- `section.energy/low/lift/dynamics/density/climax/bloom` 用于高潮段落、连续副歌能量和歌词高光。

## MUST

- 独立可构建：`npm run build` 无需宿主环境。
- 插件类型与生命周期契约在 SemVer 下保持向后兼容。
- 公开导出集中在 `src/index.ts`。
- 维护文档站 `docs/index.html`。

## MUST NOT

- 包含宿主运行时 / UI 实现。
- 依赖 `DancingStoreSdk` 或 `MusicStoreSdk` 内部模块。
- 引入宿主专属运行时 API（如 Electron IPC）。
- 直接调用连接器、解析播放 URL 或修改播放队列；需要这些行为时必须通过宿主提供的 `DanceHostActions` 请求。

## 宿主兼容

- 宿主通过 `@dancingmusic/plugin-sdk` 消费。
- 宿主插件加载器：`src/app/lib/dynamic-plugin-loader.ts`（ES Module 动态加载）。
- 宿主插件管理器：`src/app/lib/dance-plugin-manager.ts`（注册/激活/渲染/错误恢复）。

## Release

1. Run `npm run typecheck && npm run build`.
2. 更新 README 和 changelog。
3. 更新 `docs/index.html` 中的版本号。
4. 发布版本标签和包。
