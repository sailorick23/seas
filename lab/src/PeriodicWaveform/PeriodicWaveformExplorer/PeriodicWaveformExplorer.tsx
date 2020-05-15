import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CompositeWaveform } from '../shared/Waveform'
import { ActionPalette } from './ActionPalette'
import { makeExplorerActions } from './explorerActions'
import styles from './PeriodicWaveformExplorer.module.css'
import { TaskForm, TaskFormProps } from './TaskForm'
import { useOscillator } from './useOscillator'
import { WaveformGraphics } from './WaveformGraphics'

export interface PeriodicWaveformExplorerProps {}

export const PeriodicWaveformExplorer = (
  props: PeriodicWaveformExplorerProps
) => {
  const [periodicWaveform, setPeriodicWaveform] = useState<CompositeWaveform>([
    { magnitudeX: 1, magnitudeY: 1, phase: 0 },
  ])
  const periodicWaveformRef = useRef(periodicWaveform)
  useEffect(() => {
    periodicWaveformRef.current = periodicWaveform
  }, [periodicWaveform])
  const oscillator = useOscillator()
  const [activeTaskForm, setActiveTaskForm] = useState<TaskFormProps<
    any
  > | null>(null)
  const explorerActions = useMemo(
    () =>
      makeExplorerActions({
        periodicWaveform,
        periodicWaveformRef,
        setPeriodicWaveform,
        oscillator,
        setActiveTaskForm,
      }),
    [
      periodicWaveform,
      periodicWaveformRef,
      setPeriodicWaveform,
      oscillator,
      setActiveTaskForm,
    ]
  )
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
          <ActionPalette actions={explorerActions} />
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
