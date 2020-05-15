import * as Yup from 'yup'
import { getWaveformWavData } from '../../shared/Audio'
import { makeFormSchema, makeTextFieldSchema } from '../../shared/Form'
import { makeTaskForm } from '../TaskForm'
import { ExplorerActions } from './'

export interface DownloadAudioActionProps
  extends Pick<
    ExplorerActions,
    'periodicWaveform' | 'periodicWaveformRef' | 'setActiveTaskForm'
  > {}

export const makeDownloadAudioAction = (props: DownloadAudioActionProps) => {
  const { periodicWaveform, setActiveTaskForm, periodicWaveformRef } = props
  return {
    label: 'download audio',
    disabled: !periodicWaveform.length,
    onClick: () => {
      const nextActiveTaskForm = makeTaskForm<typeof downloadAudioFormSchema>({
        label: 'download audio',
        formSchema: downloadAudioFormSchema,
        onCancel: () => {
          setActiveTaskForm(null)
        },
        onSubmit: (validatedValues) => {
          const waveformFrequency = validatedValues.frequency
          const waveformWavData = getWaveformWavData({
            waveformFrequency,
            approximateSeconds: validatedValues.seconds,
            periodicWaveform: periodicWaveformRef.current,
          })
          const wavFileName = `${periodicWaveformRef.current.reduce(
            (result, basicWaveform) =>
              `${result}__${basicWaveform.magnitudeX}_${basicWaveform.magnitudeY}_${basicWaveform.phase}`,
            `${waveformFrequency}`
          )}.wav`
          const wavFile = new File([waveformWavData], wavFileName)
          const wavUrl = URL.createObjectURL(wavFile)
          const linkElement = document.createElement('a')
          linkElement.href = wavUrl
          linkElement.download = wavFile.name
          document.body.appendChild(linkElement)
          linkElement.click()
          linkElement.remove()
          URL.revokeObjectURL(wavUrl)
          setActiveTaskForm(null)
        },
      })
      setActiveTaskForm(nextActiveTaskForm)
    },
  }
}

const downloadAudioFormSchema = makeFormSchema({
  frequency: makeTextFieldSchema<number>({
    key: 'frequency',
    valueSchema: Yup.number()
      .transform((value, originalValue) => (originalValue ? value : undefined))
      .required('required')
      .typeError('must be a number')
      .positive('must be greater than 0'),
    order: 0,
  }),
  seconds: makeTextFieldSchema<number>({
    key: 'seconds',
    valueSchema: Yup.number()
      .transform((value, originalValue) => (originalValue ? value : undefined))
      .required('required')
      .typeError('must be a number')
      .positive('must be greater than 0'),
    order: 1,
  }),
})
