/**
 * A single lyric line with a timestamp (seconds from track start).
 */
export interface LyricLine {
  time: number;
  text: string;
}

/**
 * Real-time audio analysis data passed to every plugin on each frame.
 */
export interface AudioData {
  /** Full frequency spectrum array (0–255 per bin) */
  frequencyData: Uint8Array;
  /** Time-domain waveform data */
  timeDomainData: Uint8Array;

  /** Low-frequency energy (0–1) */
  bassLevel: number;
  /** Mid-frequency energy (0–1) */
  midLevel: number;
  /** High-frequency energy (0–1) */
  trebleLevel: number;

  /** Overall volume (0–1) */
  volume: number;
  /** Overall energy, non-linear curve (0–1) */
  energy: number;

  /** True when a beat is detected in this frame */
  beatDetected: boolean;
  /** Estimated BPM (0 if not yet computed) */
  bpm: number;

  /** Low-frequency change rate relative to last frame (-1 to 1) */
  bassChange: number;
  /** Volume change rate relative to last frame (-1 to 1) */
  volumeChange: number;
}

/**
 * Static metadata and configurable settings for a Dance plugin.
 */
export interface DancePluginConfig {
  /** Unique plugin identifier (kebab-case, e.g. "spectrum-wave") */
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  /** Preview image URL shown in the plugin store */
  thumbnail?: string;
  category: 'abstract' | 'particle' | 'geometric' | 'nature' | 'other';
  /** 0 = free */
  price: number;

  /** Optional host overlay preferences controlled by the plugin. */
  hostOverlay?: {
    /**
     * Whether the host should show its top-left current-song cover overlay.
     * Defaults to true when omitted.
     */
    showSongCover?: boolean;
    /**
     * Whether the host should show its top-left title/artist overlay.
     * Defaults to true when omitted.
     */
    showSongMetadata?: boolean;
  };

  /** User-configurable parameters */
  settings?: {
    [key: string]: {
      type: 'number' | 'boolean' | 'color' | 'select';
      label: string;
      default: any;
      min?: number;
      max?: number;
      options?: string[];
    };
  };

  // Fields set by the loader — plugin authors do not need to provide these.
  /** URL this plugin bundle was dynamically loaded from */
  readonly loadedFrom?: string;
  /** Whether this plugin is bundled with the app or dynamically loaded */
  readonly source?: 'builtin' | 'dynamic';
}

/**
 * The core Dance plugin interface. Every plugin must implement this.
 *
 * Lifecycle per plugin activation:
 *   init(canvas) → [resize?(w, h)] → render() × N → dispose()
 */
export interface DancePlugin {
  config: DancePluginConfig;

  /**
   * Called once when the plugin is activated, after the canvas is ready.
   * Store a reference to the canvas and set up any rendering context here.
   */
  init(canvas: HTMLCanvasElement): void;

  /**
   * Called every animation frame (~60 fps).
   * @param audioData  Real-time audio analysis for this frame
   * @param deltaTime  Seconds since the previous frame
   * @param isPlaying  Whether audio is currently playing
   */
  render(audioData: AudioData, deltaTime: number, isPlaying: boolean): void;

  /**
   * Called before the plugin is switched out. Release all resources
   * (cancel timers, dispose Three.js objects, etc.).
   */
  dispose(): void;

  /** Called when the canvas is resized. */
  resize?(width: number, height: number): void;

  /** Called when the user changes plugin settings. */
  updateSettings?(settings: Record<string, any>): void;

  /**
   * Optional: called when the Web Audio graph is available.
   * Implement this if your plugin needs direct access to AudioContext or
   * a source node (e.g. a WebGL visualizer reading from the audio graph).
   * Will be called after init() whenever the audio graph changes.
   */
  setAudioSource?(audioContext: AudioContext, sourceNode: AudioNode): void;
}

/**
 * A plugin entry in the remote plugin registry.
 */
export interface PluginRegistryEntry {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  category: DancePluginConfig['category'];
  price: number;
  thumbnail?: string;
  /** URL to a preview GIF/video shown in the store */
  preview?: string;
  /** URL of the self-contained ESM plugin bundle */
  bundleUrl: string;
  /** SDK version range the plugin was built against (semver) */
  sdkVersion: string;
  /** SHA-256 hex digest of the bundle for integrity verification */
  checksumSha256?: string;
  tags?: string[];
  publishedAt?: string;
}

/**
 * The full registry document fetched from the registry endpoint.
 */
export interface PluginRegistry {
  version: string;
  updatedAt?: string;
  plugins: PluginRegistryEntry[];
}

/** @deprecated Use DancePlugin directly */
export interface DanceStoreItem {
  config: DancePluginConfig;
  installed: boolean;
  enabled: boolean;
  preview?: string;
}
