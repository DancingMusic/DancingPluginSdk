# @musicdance/plugin-sdk

TypeScript SDK for building [MusicDance](https://github.com/musicdance/app) visualization plugins.

## Installation

```bash
npm install @musicdance/plugin-sdk
```

## Quick Start

```typescript
import type { DancePlugin, AudioData, DancePluginConfig } from '@musicdance/plugin-sdk';

class MyPlugin implements DancePlugin {
  config: DancePluginConfig = {
    id: 'my-plugin',           // unique kebab-case identifier
    name: 'My Plugin',
    description: 'A cool visualization',
    author: 'your-name',
    version: '1.0.0',
    category: 'abstract',      // abstract | particle | geometric | nature | other
    price: 0,                  // 0 = free
    hostOverlay: {
      showSongCover: true,     // default true
      showSongMetadata: true,  // default true, title + artist
    },
  };

  private ctx: CanvasRenderingContext2D | null = null;

  init(canvas: HTMLCanvasElement): void {
    this.ctx = canvas.getContext('2d');
  }

  render(audioData: AudioData, deltaTime: number, isPlaying: boolean): void {
    if (!this.ctx) return;
    // Use audioData.bassLevel, audioData.frequencyData, audioData.beatDetected, etc.
    // Draw your visualization here
  }

  dispose(): void {
    this.ctx = null;
  }

  // Optional: called when canvas is resized
  resize(width: number, height: number): void {}

  // Optional: called if your plugin needs direct Web Audio graph access (WebGL, etc.)
  setAudioSource(audioContext: AudioContext, sourceNode: AudioNode): void {}
}

// Export a plugin instance as the default export
export default new MyPlugin();
```

## AudioData Reference

| Field | Type | Description |
|-------|------|-------------|
| `frequencyData` | `Uint8Array` | Full FFT spectrum (0–255 per bin) |
| `timeDomainData` | `Uint8Array` | Time-domain waveform |
| `bassLevel` | `number` | Low-frequency energy (0–1) |
| `midLevel` | `number` | Mid-frequency energy (0–1) |
| `trebleLevel` | `number` | High-frequency energy (0–1) |
| `volume` | `number` | Overall volume (0–1) |
| `energy` | `number` | Overall energy, non-linear (0–1) |
| `beatDetected` | `boolean` | Beat detected this frame |
| `bpm` | `number` | Estimated BPM |
| `bassChange` | `number` | Bass change since last frame (-1–1) |
| `volumeChange` | `number` | Volume change since last frame (-1–1) |

## Building Your Plugin for Distribution

Your plugin must be published as a self-contained ESM bundle with a default export.

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'plugin',
    },
    // Do NOT externalize anything — the bundle must be self-contained
  },
});
```

Build output: `dist/plugin.js` — host this file at a CORS-accessible URL.

## Security

Dance plugins run in the **same JavaScript context** as the host application.
They have full DOM access. Only install plugins from sources you trust.

## License

MIT

## GitHub Pages

This repository publishes a responsibility overview page from `docs/` via GitHub Actions.

- Expected URL: `https://dancingmusic.github.io/DancingPluginSdk/`
- Workflow: `.github/workflows/deploy-pages.yml`
