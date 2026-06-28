/**
 * Spectrum Wave — reference plugin implementation
 *
 * This is the canonical example showing how to build a Dance plugin.
 * Copy this file as your starting point and modify the render() method.
 *
 * To distribute:
 *   1. npm install @dancingmusic/plugin-sdk
 *   2. Build with Vite lib mode (formats: ['es'], self-contained bundle)
 *   3. Host the bundle at a CORS-accessible URL
 *   4. Submit the URL to the MusicDance plugin registry
 */
import type { DancePlugin, AudioData, DancePluginConfig } from '../../types';

export class SpectrumWavePlugin implements DancePlugin {
  config: DancePluginConfig = {
    id: 'spectrum-wave',
    name: '频谱波浪',
    description: '经典频谱可视化，彩色频率条随音乐律动',
    author: 'MusicDance',
    version: '1.0.0',
    category: 'abstract',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=200&fit=crop',
  };

  private ctx: CanvasRenderingContext2D | null = null;
  private width = 0;
  private height = 0;

  init(canvas: HTMLCanvasElement): void {
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
  }

  render(audioData: AudioData, _deltaTime: number, isPlaying: boolean): void {
    if (!this.ctx) return;

    const { frequencyData } = audioData;

    this.ctx.fillStyle = isPlaying ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.4)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const barCount = 128;
    const barWidth = this.width / barCount;
    const pauseMultiplier = isPlaying ? 1.0 : 0.2;
    const opacityMultiplier = isPlaying ? 1.0 : 0.3;

    for (let i = 0; i < barCount; i++) {
      const value = frequencyData[i] / 255;
      const barHeight = value * this.height * 0.8 * pauseMultiplier;

      const hue = (i / barCount) * 360;
      const saturation = isPlaying ? (70 + value * 30) : 40;
      const lightness = isPlaying ? (50 + value * 20) : 30;

      this.ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacityMultiplier})`;

      const x = i * barWidth;
      const y = this.height - barHeight;
      this.ctx.fillRect(x, y, barWidth - 2, barHeight);

      if (isPlaying && audioData.beatDetected && value > 0.5) {
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
        this.ctx.fillRect(x, y, barWidth - 2, barHeight);
        this.ctx.shadowBlur = 0;
      }
    }

    if (!isPlaying) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.font = '16px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('⏸️ 已暂停', this.width / 2, this.height / 2);
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  dispose(): void {
    this.ctx = null;
  }
}

// Default export: a plugin instance (required by the dynamic loader)
export default new SpectrumWavePlugin();
