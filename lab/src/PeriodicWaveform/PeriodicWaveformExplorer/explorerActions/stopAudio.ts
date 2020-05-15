import { OscillatorStatus } from '../useOscillator'
import { ExplorerActions } from './'

export interface ResetWaveformActionProps
  extends Pick<ExplorerActions, 'oscillator'> {}

export const makeStopAudioAction = (props: ResetWaveformActionProps) => {
  const { oscillator } = props
  return {
    label: 'stop audio',
    disabled: oscillator.status === OscillatorStatus.IDLE,
    onClick: () => {
      oscillator.stop()
    },
  }
}
