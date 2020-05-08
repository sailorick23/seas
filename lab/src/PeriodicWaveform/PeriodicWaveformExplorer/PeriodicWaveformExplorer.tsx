import React, { useEffect, useRef, useState } from 'react'
import * as Yup from 'yup'
import { FormSchema, makeFormSchema, makeTextFieldSchema } from '../shared/Form'
import { CompositeWaveform } from '../shared/Waveform'
import { ActionPalette } from './ActionPalette'
import styles from './PeriodicWaveformExplorer.module.css'
import { TaskForm, TaskFormProps } from './TaskForm'
import { OscillatorStatus, useOscillator } from './useOscillator'
import { WaveformGraphics } from './WaveformGraphics'

export const PeriodicWaveformExplorer = (
  props: PeriodicWaveformExplorerProps
) => {
  const [periodicWaveform, setPeriodicWaveform] = useState<CompositeWaveform>([
    { magnitudeX: 1, magnitudeY: 1, phase: 0 },
  ])
  const oscillator = useOscillator(periodicWaveform)
  const [activeTaskForm, setActiveTaskForm] = useState<TaskFormProps<
    any
  > | null>(null)
  const periodicWaveformRef = useRef(periodicWaveform)
  useEffect(() => {
    periodicWaveformRef.current = periodicWaveform
  }, [periodicWaveform])
  return (
    <div className={styles.rootContainer}>
      <div className={styles.headerContainer}>
        <div>
          <div className={styles.title}>Periodic Waveform</div>
          <div className={styles.titleUnderline} />
        </div>
      </div>
      <div className={styles.bodyContainer}>
        <div className={styles.sectionContainer}>
          <WaveformGraphics graphicData={periodicWaveform} />
        </div>
        <div className={styles.sectionContainer}>
          <ActionPalette
            actions={[
              {
                label:
                  oscillator.status === OscillatorStatus.PLAYING ||
                  oscillator.status === OscillatorStatus.STOPPING
                    ? 'stop audio'
                    : 'play audio',
                disabled: !oscillator.isStable || !periodicWaveform.length,
                onClick: () => {
                  oscillator.toggle()
                },
              },
              {
                label: 'push waveform',
                disabled: false,
                onClick: () => {
                  const nextFormSchema = makeFormSchema({
                    magnitudeX: makeTextFieldSchema<number>({
                      key: 'magnitudeX',
                      valueSchema: Yup.number()
                        .typeError('must be a number')
                        .positive('must be greater than 0'),
                      order: 0,
                    }),
                    magnitudeY: makeTextFieldSchema<number>({
                      key: 'magnitudeY',
                      valueSchema: Yup.number()
                        .typeError('must be a number')
                        .positive('must be greater than 0'),
                      order: 1,
                    }),
                    phase: makeTextFieldSchema<number>({
                      key: 'phase',
                      valueSchema: Yup.number()
                        .typeError('must be a number')
                        .min(0, 'must be greater than or equal to 0')
                        .lessThan(1, 'must be less than 1'),
                      order: 2,
                    }),
                  })
                  const nextActiveTaskForm = makeTaskForm<
                    typeof nextFormSchema
                  >({
                    label: 'push waveform',
                    formSchema: nextFormSchema,
                    onCancel: () => {
                      setActiveTaskForm(null)
                    },
                    onSubmit: (validatedValues) => {
                      const nextPeriodicWaveform = [
                        ...periodicWaveformRef.current,
                      ]
                      nextPeriodicWaveform.push(validatedValues)
                      setPeriodicWaveform(nextPeriodicWaveform)
                      setActiveTaskForm(null)
                    },
                  })
                  setActiveTaskForm(nextActiveTaskForm)
                },
              },
              {
                label: 'pop waveform',
                disabled: !periodicWaveform.length,
                onClick: () => {
                  const nextPeriodicWaveform = [...periodicWaveformRef.current]
                  nextPeriodicWaveform.pop()
                  setPeriodicWaveform(nextPeriodicWaveform)
                },
              },
            ]}
          />
        </div>
        {activeTaskForm ? (
          <div className={styles.sectionContainer}>
            <TaskForm {...activeTaskForm} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export interface PeriodicWaveformExplorerProps {}

const makeTaskForm = <
  SomeFormSchema extends FormSchema,
  SomeTaskFormProps = TaskFormProps<SomeFormSchema>
>(
  someTaskFormProps: SomeTaskFormProps
): SomeTaskFormProps => someTaskFormProps
