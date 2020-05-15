import * as Yup from 'yup'
import { makeFormSchema, makeTextFieldSchema } from '../../shared/Form'
import { makeTaskForm } from '../TaskForm'
import { ExplorerActions } from './'

export interface PlayAudioActionProps
  extends Pick<
    ExplorerActions,
    | 'periodicWaveform'
    | 'periodicWaveformRef'
    | 'oscillator'
    | 'setActiveTaskForm'
  > {}

export const makePlayAudioAction = (props: PlayAudioActionProps) => {
  const {
    periodicWaveform,
    periodicWaveformRef,
    setActiveTaskForm,
    oscillator,
  } = props
  return {
    label: 'play audio',
    disabled: !periodicWaveform.length,
    onClick: () => {
      const nextActiveTaskForm = makeTaskForm<typeof playAudioFormSchema>({
        label: 'play audio',
        formSchema: playAudioFormSchema,
        onCancel: () => {
          setActiveTaskForm(null)
        },
        onSubmit: (validatedValues) => {
          oscillator.play({
            waveformFrequency: validatedValues.frequency,
            periodicWaveform: periodicWaveformRef.current,
            approximateSeconds: 1,
          })
          setActiveTaskForm(null)
        },
      })
      setActiveTaskForm(nextActiveTaskForm)
    },
  }
}

const playAudioFormSchema = makeFormSchema({
  frequency: makeTextFieldSchema<number>({
    key: 'frequency',
    valueSchema: Yup.number()
      .transform((value, originalValue) => (originalValue ? value : undefined))
      .required('required')
      .typeError('must be a number')
      .positive('must be greater than 0'),
    order: 0,
  }),
})
