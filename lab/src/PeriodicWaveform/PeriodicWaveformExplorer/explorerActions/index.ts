import { CompositeWaveform } from '../../shared/Waveform'
import { TaskFormProps } from '../TaskForm'
import { Oscillator } from '../useOscillator'
import { makeDownloadAudioAction } from './downloadAudio'
import { makeEditWaveformAction } from './editWaveform'
import { makePlayAudioAction } from './playAudio'
import { makePopWaveformAction } from './popWaveform'
import { makePushWaveformAction } from './pushWaveform'
import { makeResetWaveformAction } from './resetWaveform'
import { makeStopAudioAction } from './stopAudio'

export interface ExplorerActions {
  periodicWaveform: CompositeWaveform
  periodicWaveformRef: React.MutableRefObject<CompositeWaveform>
  setPeriodicWaveform: React.Dispatch<React.SetStateAction<CompositeWaveform>>
  oscillator: Oscillator
  setActiveTaskForm: React.Dispatch<
    React.SetStateAction<TaskFormProps<any> | null>
  >
}

export const makeExplorerActions = (props: ExplorerActions) => [
  makePushWaveformAction(props),
  makeEditWaveformAction(props),
  makePopWaveformAction(props),
  makeResetWaveformAction(props),
  makePlayAudioAction(props),
  makeStopAudioAction(props),
  makeDownloadAudioAction(props),
]
