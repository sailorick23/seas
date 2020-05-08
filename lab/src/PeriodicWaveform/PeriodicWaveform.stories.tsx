import React from 'react'
import { PeriodicWaveformExplorer } from './PeriodicWaveformExplorer'

export default {
  title: 'PeriodicWaveform',
  component: () => null,
}

export const Explorer = () => {
  return <PeriodicWaveformExplorer />
}

export const TypeShit = () => {
  // type transform / derive
  // <[{ key: 'foo' }]> => <{ foo: { key: 'foo' } }>
  return null
}
