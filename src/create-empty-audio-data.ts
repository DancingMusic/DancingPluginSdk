import type { AudioData, DanceRhythmFrame } from './types';

export function createEmptyRhythmFrame(): DanceRhythmFrame {
  return {
    bands: {
      sub: 0,
      kick: 0,
      low: 0,
      body: 0,
      vocal: 0,
      snap: 0,
      mid: 0,
      treble: 0,
      volume: 0,
      energy: 0,
    },
    onset: {
      bass: 0,
      energy: 0,
      score: 0,
    },
    beat: {
      hit: false,
      time: 0,
      strength: 0,
      confidence: 0,
      score: 0,
      low: 0,
      body: 0,
      vocal: 0,
      snap: 0,
      mass: 0,
      sharpness: 0,
      tempoAssist: false,
      tempoGap: 0,
      tempoConfidence: 0,
      combo: 'none',
      source: 'silent',
    },
    pulse: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    energy: 0,
  };
}

/**
 * Returns a zeroed-out AudioData object.
 * Useful for rendering plugins in a paused/idle state, or for unit tests.
 */
export function createEmptyAudioData(): AudioData {
  return {
    frequencyData: new Uint8Array(128),
    timeDomainData: new Uint8Array(256),
    bassLevel: 0,
    midLevel: 0,
    trebleLevel: 0,
    volume: 0,
    energy: 0,
    beatDetected: false,
    bpm: 0,
    bassChange: 0,
    volumeChange: 0,
    rhythm: createEmptyRhythmFrame(),
  };
}
