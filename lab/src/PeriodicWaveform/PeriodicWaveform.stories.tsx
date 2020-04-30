import React from 'react'
import { CompositeWaveform } from './shared/Waveform'
import { WaveformStructureGraphic } from './WaveformStructureGraphic'
import { WaveformTimelineGraphic } from './WaveformTimelineGraphic'

export default {
  title: 'PeriodicWaveform',
  component: () => null,
}

const periodicWaveform: CompositeWaveform = [
  { magnitudeX: 0.25, magnitudeY: 0.75, phase: 0 },
  { magnitudeX: 0.5, magnitudeY: 0.675, phase: 0 },
  { magnitudeX: 1, magnitudeY: 0.5, phase: 0 },
]

export const CompositeStructureGraphic = () => {
  return <WaveformStructureGraphic graphicData={periodicWaveform} />
}

export const CompositeTimelineGraphic = () => {
  return <WaveformTimelineGraphic graphicData={periodicWaveform} />
}
