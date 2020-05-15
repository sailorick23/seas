import { CompositeWaveform } from '../../shared/Waveform'
import { ExplorerActions } from './'

export interface ResetWaveformActionProps
  extends Pick<ExplorerActions, 'periodicWaveform' | 'setPeriodicWaveform'> {}

export const makeResetWaveformAction = (props: ResetWaveformActionProps) => {
  const { periodicWaveform, setPeriodicWaveform } = props
  return {
    label: 'reset waveform',
    disabled: !periodicWaveform.length,
    onClick: () => {
      const nextPeriodicWaveform: CompositeWaveform = []
      setPeriodicWaveform(nextPeriodicWaveform)
    },
  }
}
