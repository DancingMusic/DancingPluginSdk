# OpenSpec: DancingPluginSdk

- Spec-ID: `dancing-plugin-sdk-openspec`
- Version: `2.0.0`
- Status: `Active`
- Last-Updated: `2026-05-17`

## Scope

定义插件 SDK 的边界、兼容策略和发布流程。

## 当前状态

- 包名：`@musicdance/plugin-sdk`
- 版本：`v1.0.0`
- 核心导出：`DancePlugin`（接口）、`AudioData`（类型）、`createEmptyAudioData`（辅助函数）
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
}
```

## MUST

- 独立可构建：`npm run build` 无需宿主环境。
- 插件类型与生命周期契约在 SemVer 下保持向后兼容。
- 公开导出集中在 `src/index.ts`。
- 维护文档站 `docs/index.html`。

## MUST NOT

- 包含宿主运行时 / UI 实现。
- 依赖 `DancingStoreSdk` 或 `MusicStoreSdk` 内部模块。
- 引入宿主专属运行时 API（如 Electron IPC）。

## 宿主兼容

- 宿主通过 `@musicdance/plugin-sdk` 或路径别名 `packages/dance-plugin-sdk/src/index.ts` 消费。
- 宿主插件加载器：`src/app/lib/dynamic-plugin-loader.ts`（ES Module 动态加载）。
- 宿主插件管理器：`src/app/lib/dance-plugin-manager.ts`（注册/激活/渲染/错误恢复）。

## Release

1. Run `npm run typecheck && npm run build`.
2. 更新 README 和 changelog。
3. 更新 `docs/index.html` 中的版本号。
4. 发布版本标签和包。
