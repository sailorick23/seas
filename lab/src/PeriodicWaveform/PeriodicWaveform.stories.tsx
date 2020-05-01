import React from 'react'
import { WaveformGraphics } from './WaveformGraphics/WaveformGraphics'

export default {
  title: 'PeriodicWaveform',
  component: () => null,
}

export const Explorer = () => {
  return (
    <WaveformGraphics
      graphicData={[
        { magnitudeX: 0.25, magnitudeY: 0.75, phase: 0 },
        { magnitudeX: 0.5, magnitudeY: 0.675, phase: 0 },
        { magnitudeX: 1, magnitudeY: 0.5, phase: 0 },
      ]}
    />
  )
}
