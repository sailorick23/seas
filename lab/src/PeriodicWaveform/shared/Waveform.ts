export interface BasicWaveform {
  magnitudeX: number
  magnitudeY: number
  phase: number
}

export type CompositeWaveform = Array<BasicWaveform>
