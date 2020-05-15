import * as Yup from 'yup'
import { makeFormSchema, makeTextFieldSchema } from '../../shared/Form'
import { makeTaskForm } from '../TaskForm'
import { ExplorerActions } from './'

export interface PushWaveformActionProps
  extends Pick<
    ExplorerActions,
    'periodicWaveformRef' | 'setPeriodicWaveform' | 'setActiveTaskForm'
  > {}

export const makePushWaveformAction = (props: PushWaveformActionProps) => {
  const { setActiveTaskForm, setPeriodicWaveform, periodicWaveformRef } = props
  return {
    label: 'push waveform',
    disabled: false,
    onClick: () => {
      const nextActiveTaskForm = makeTaskForm<typeof pushWaveformFormSchema>({
        label: 'push waveform',
        formSchema: pushWaveformFormSchema,
        onCancel: () => {
          setActiveTaskForm(null)
        },
        onSubmit: (validatedValues) => {
          const nextPeriodicWaveform = [...periodicWaveformRef.current]
          nextPeriodicWaveform.push(validatedValues)
          setPeriodicWaveform(nextPeriodicWaveform)
          setActiveTaskForm(null)
        },
      })
      setActiveTaskForm(nextActiveTaskForm)
    },
  }
}

const pushWaveformFormSchema = makeFormSchema({
  magnitudeX: makeTextFieldSchema<number>({
    key: 'magnitudeX',
    valueSchema: Yup.number()
      .transform((value, originalValue) => (originalValue ? value : undefined))
      .required('required')
      .typeError('must be a number')
      .positive('must be greater than 0'),
    order: 0,
  }),
  magnitudeY: makeTextFieldSchema<number>({
    key: 'magnitudeY',
    valueSchema: Yup.number()
      .transform((value, originalValue) => (originalValue ? value : undefined))
      .required('required')
      .typeError('must be a number')
      .positive('must be greater than 0'),
    order: 1,
  }),
  phase: makeTextFieldSchema<number>({
    key: 'phase',
    valueSchema: Yup.number()
      .transform((value, originalValue) => (originalValue ? value : undefined))
      .required('required')
      .typeError('must be a number')
      .min(0, 'must be greater than or equal to 0')
      .lessThan(1, 'must be less than 1'),
    order: 2,
  }),
})
