import * as Yup from 'yup'
import { makeFormSchema, makeTextFieldSchema } from '../../shared/Form'
import { BasicWaveform } from '../../shared/Waveform'
import { makeTaskForm } from '../TaskForm'
import { ExplorerActions } from './'

export interface EditWaveformActionProps
  extends Pick<
    ExplorerActions,
    | 'periodicWaveform'
    | 'periodicWaveformRef'
    | 'setPeriodicWaveform'
    | 'setActiveTaskForm'
  > {}

export const makeEditWaveformAction = (props: EditWaveformActionProps) => {
  const {
    periodicWaveform,
    periodicWaveformRef,
    setActiveTaskForm,
    setPeriodicWaveform,
  } = props
  return {
    label: 'edit waveform',
    disabled: !periodicWaveform.length,
    onClick: () => {
      const editWaveformFormSchema = makeEditWaveformFormSchema({
        periodicWaveformRef,
      })
      const nextActiveTaskForm = makeTaskForm<typeof editWaveformFormSchema>({
        label: 'edit waveform',
        formSchema: editWaveformFormSchema,
        onCancel: () => {
          setActiveTaskForm(null)
        },
        onSubmit: (validatedValues) => {
          const { index, ...newWaveformValues } = validatedValues
          const nextPeriodicWaveform = [...periodicWaveformRef.current]
          nextPeriodicWaveform[index] = {
            ...periodicWaveformRef.current[index],
            ...(newWaveformValues as Partial<BasicWaveform>),
          }
          setPeriodicWaveform(nextPeriodicWaveform)
          setActiveTaskForm(null)
        },
      })
      setActiveTaskForm(nextActiveTaskForm)
    },
  }
}

interface EditWaveformFormSchemaProps
  extends Pick<EditWaveformActionProps, 'periodicWaveformRef'> {}

const makeEditWaveformFormSchema = (props: EditWaveformFormSchemaProps) => {
  const { periodicWaveformRef } = props
  return makeFormSchema({
    index: makeTextFieldSchema<number>({
      key: 'index',
      valueSchema: Yup.number()
        .transform((value, originalValue) =>
          originalValue ? value : undefined
        )
        .typeError('must be an integer')
        .integer('must be an integer')
        .test(
          'waveformExist',
          'index must exist',
          (value) => value < periodicWaveformRef.current.length && value >= 0
        )
        .test('required', 'required', (value) => value !== undefined),
      order: 0,
    }),
    magnitudeX: makeTextFieldSchema<number | undefined>({
      key: 'magnitudeX',
      valueSchema: Yup.number()
        .transform((value, originalValue) =>
          originalValue ? value : undefined
        )
        .notRequired()
        .typeError('must be a number')
        .positive('must be greater than 0'),
      order: 1,
    }),
    magnitudeY: makeTextFieldSchema<number | undefined>({
      key: 'magnitudeY',
      valueSchema: Yup.number()
        .transform((value, originalValue) =>
          originalValue ? value : undefined
        )
        .notRequired()
        .typeError('must be a number')
        .positive('must be greater than 0'),
      order: 2,
    }),
    phase: makeTextFieldSchema<number | undefined>({
      key: 'phase',
      valueSchema: Yup.number()
        .transform((value, originalValue) =>
          originalValue ? value : undefined
        )
        .typeError('must be a number')
        .min(0, 'must be greater than or equal to 0')
        .lessThan(1, 'must be less than 1'),
      order: 3,
    }),
  })
}
