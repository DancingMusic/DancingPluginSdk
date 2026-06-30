export type {
  AudioData,
  DanceBeatCombo,
  DanceBeatFrame,
  DanceBeatSource,
  DanceRhythmBands,
  DanceRhythmFrame,
  LyricLine,
  DancePluginConfig,
  DanceHostActions,
  DanceHostStagePanel,
  DanceHostStagePanelShift,
  DanceHostStageState,
  DanceHostPlaylistDetailSnapshot,
  DanceHostPlaylistRequest,
  DanceHostPlaylistTrackSnapshot,
  DancePlugin,
  DanceStoreItem,
  PluginRegistryEntry,
  PluginRegistry,
} from './types';

export { createEmptyAudioData, createEmptyRhythmFrame } from './create-empty-audio-data';

export const SDK_VERSION = '1.1.0';
