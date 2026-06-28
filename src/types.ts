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

  /**
   * Unified rhythm protocol for visual plugins.
   *
   * The host owns rhythm analysis. Plugins should consume this frame instead
   * of attaching their own analysers or re-implementing beat detection.
   */
  rhythm: DanceRhythmFrame;
}

/**
 * Beat role in a four-beat phrase, used by camera and particle choreography.
 */
export type DanceBeatCombo = 'none' | 'downbeat' | 'push' | 'drop' | 'rebound' | 'accent';

export type DanceBeatSource = 'silent' | 'realtime' | 'scheduled' | 'fallback';

export interface DanceRhythmBands {
  sub: number;
  kick: number;
  low: number;
  body: number;
  vocal: number;
  snap: number;
  mid: number;
  treble: number;
  volume: number;
  energy: number;
}

export interface DanceBeatFrame {
  hit: boolean;
  time: number;
  strength: number;
  confidence: number;
  score: number;
  low: number;
  body: number;
  vocal: number;
  snap: number;
  mass: number;
  sharpness: number;
  tempoAssist: boolean;
  tempoGap: number;
  tempoConfidence: number;
  combo: DanceBeatCombo;
  source: DanceBeatSource;
}

export interface DanceRhythmFrame {
  bands: DanceRhythmBands;
  onset: {
    bass: number;
    energy: number;
    score: number;
  };
  section: {
    /** Smoothed section-level musical energy (0-1). */
    energy: number;
    /** Smoothed section low-frequency drive (0-1). */
    low: number;
    /** Relative lift above the current song baseline (0-1). */
    lift: number;
    /** Combined section/camera dynamics scale. 1 is neutral. */
    dynamics: number;
    /** Running rhythmic density estimate (0-1). */
    density: number;
    /** Sustained climax drive for choruses and high-energy passages (0-1). */
    climax: number;
    /** Sustained high-frequency/vocal bloom for lyric glow (0-1). */
    bloom: number;
  };
  beat: DanceBeatFrame;
  pulse: number;
  bass: number;
  mid: number;
  treble: number;
  energy: number;
}

export interface DancePluginSettingOption {
  label: string;
  value: string;
}

export interface DancePluginSettingSection {
  id: string;
  label: string;
  description?: string;
  order?: number;
  defaultOpen?: boolean;
}

export interface DancePluginSettingDefinition {
  type: 'number' | 'boolean' | 'color' | 'select';
  label: string;
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<string | DancePluginSettingOption>;
  section?: string;
  order?: number;
  help?: string;
  disabled?: boolean;
}

export interface DanceHostPlaylistRequest {
  id: string;
  title?: string;
  startIndex?: number;
}

export interface DanceHostPlaylistTrackSnapshot {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover?: string;
  durationSec?: number;
}

export interface DanceHostPlaylistDetailSnapshot {
  id: string;
  title?: string;
  tracks: DanceHostPlaylistTrackSnapshot[];
}

export interface DanceHostActions {
  /**
   * Request that the host select and play an item from the active queue.
   * The host remains the owner of playback state and may ignore invalid indexes.
   */
  playQueueIndex?: (index: number) => void | Promise<void>;
  /**
   * Request that the host resolve and play a playlist snapshot previously
   * supplied through updateSettings. Plugins must not fetch connector data.
   */
  playPlaylist?: (request: DanceHostPlaylistRequest) => void | Promise<void>;
  /**
   * Request a read-only playlist detail snapshot for plugin-owned visual lists.
   * The host owns connector access and may return an empty snapshot.
   */
  getPlaylistDetail?: (request: DanceHostPlaylistRequest) => DanceHostPlaylistDetailSnapshot | Promise<DanceHostPlaylistDetailSnapshot>;
  /**
   * Request that the host open its own playlist/detail surface. This is a UI
   * handoff, not permission for plugins to render host controls.
   */
  openPlaylistDetail?: (request: DanceHostPlaylistRequest) => void | Promise<void>;
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

  /** Rendering target requirements declared by the plugin. */
  rendering?: {
    /**
     * Canvas context type required by the plugin.
     * Defaults to "2d" for backward compatibility.
     */
    context?: '2d' | 'webgl';
  };

  /** Optional grouping metadata for user-configurable parameters. */
  settingSections?: DancePluginSettingSection[];

  /** User-configurable parameters */
  settings?: {
    [key: string]: DancePluginSettingDefinition;
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

  /**
   * Called when the user changes plugin settings and when the host forwards
   * read-only runtime context such as currentSong/currentTime/playlist.
   *
   * Hosts may include `hostActions?: DanceHostActions`. Plugins may call those
   * callbacks to request host-owned behavior, but must not import host modules,
   * call connectors, or mutate playback state directly.
   */
  updateSettings?(settings: Record<string, any>): void;

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
