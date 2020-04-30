import React from 'react'
import { CompositeWaveform } from './shared/Waveform'
import { WaveformCosineTimelineGraphic } from './WaveformCosineTimelineGraphic'
import { WaveformSineTimelineGraphic } from './WaveformSineTimelineGraphic'
import { WaveformStructureGraphic } from './WaveformStructureGraphic'

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

export const CompositeSineTimelineGraphic = () => {
  return <WaveformSineTimelineGraphic graphicData={periodicWaveform} />
}

export const CompositeCosineTimelineGraphic = () => {
  return <WaveformCosineTimelineGraphic graphicData={periodicWaveform} />
}
