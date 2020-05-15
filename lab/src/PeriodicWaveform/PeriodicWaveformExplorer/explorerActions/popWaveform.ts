import { ExplorerActions } from './'

export interface PopWaveformActionProps
  extends Pick<
    ExplorerActions,
    'periodicWaveform' | 'periodicWaveformRef' | 'setPeriodicWaveform'
  > {}

export const makePopWaveformAction = (props: PopWaveformActionProps) => {
  const { periodicWaveform, periodicWaveformRef, setPeriodicWaveform } = props
  return {
    label: 'pop waveform',
    disabled: !periodicWaveform.length,
    onClick: () => {
      const nextPeriodicWaveform = [...periodicWaveformRef.current]
      nextPeriodicWaveform.pop()
      setPeriodicWaveform(nextPeriodicWaveform)
    },
  }
}
