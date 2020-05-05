export interface BasicWaveform {
  magnitudeX: number
  magnitudeY: number
  phase: number
}

export interface CompositeWaveform<T extends BasicWaveform = BasicWaveform>
  extends Array<T> {}
