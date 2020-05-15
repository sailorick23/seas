export interface BasicWaveform {
  magnitudeX: number
  magnitudeY: number
  phase: number
}

export interface CompositeWaveform extends Array<BasicWaveform> {}
