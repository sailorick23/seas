import React, { useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import { makeFormSchema } from '../shared/Form'
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
  const [activeTaskForm, setActiveTaskForm] = useState<TaskFormProps | null>(
    null
  )
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
                    magnitudeX: {
                      key: 'magnitudeX',
                      variant: 'text',
                      initialValue: '',
                      valueSchema: yup
                        .number()
                        .typeError('must be a number')
                        .positive('must be greater than 0'),
                      name: 'magnitudeX',
                      label: 'magnitude x',
                      order: 0,
                    },
                    magnitudeY: {
                      key: 'magnitudeY',
                      variant: 'text',
                      initialValue: '',
                      valueSchema: yup
                        .number()
                        .typeError('must be a number')
                        .positive('must be greater than 0'),
                      name: 'magnitudeY',
                      label: 'magnitude y',
                      order: 1,
                    },
                    phase: {
                      key: 'phase',
                      variant: 'text',
                      initialValue: '',
                      valueSchema: yup
                        .number()
                        .typeError('must be a number')
                        .min(0, 'must be greater than or equal to 0')
                        .lessThan(1, 'must be less than 1'),
                      name: 'phase',
                      label: 'phase',
                      order: 2,
                    },
                  })
                  const nextActiveTaskForm: TaskFormProps<typeof nextFormSchema> = {
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
                  }
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
