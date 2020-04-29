import React from 'react'
import { CompositeWaveform } from './shared/Waveform'
import { WaveformStructureGraphic } from './WaveformStructureGraphic'

export default {
  title: 'PeriodicWaveform',
  component: () => null,
}

export const CompositeStructureGraphic = () => {
  const periodicWaveform: CompositeWaveform = [
    { magnitudeX: 1, magnitudeY: 0.5, phase: 1 / 3 },
    { magnitudeX: 0.5, magnitudeY: 0.25, phase: 1 / 3 / 2 },
    { magnitudeX: 0.25, magnitudeY: 0.125, phase: 1 / 3 / 2 / 3 },
  ]
  return <WaveformStructureGraphic graphicData={periodicWaveform} />
}
