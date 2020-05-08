import { useEffect, useRef, useState } from 'react'
import { getEllipsePerimeterSine, makeEllipse, makePoint } from '../../shared/Geometry'
import { CompositeWaveform } from '../../shared/Waveform'

export enum OscillatorStatus {
  IDLE,
  STARTING,
  PLAYING,
  STOPPING,
}

export interface Oscillator {
  readonly status: OscillatorStatus
  readonly isStable: boolean
  readonly toggle: () => void
}

export const useOscillator = (
  periodicWaveform: CompositeWaveform
): Oscillator => {
  const [oscillatorStatus, setOscillatorStatus] = useState(
    OscillatorStatus.IDLE
  )
  const periodicWaveformRef = useRef(periodicWaveform)
  const oscillatorStatusRef = useRef(oscillatorStatus)
  const audioContextRef = useRef<AudioContext | undefined>(undefined)
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null)
  useEffect(() => {
    if (
      bufferSourceRef.current &&
      oscillatorStatus === OscillatorStatus.STOPPING
    ) {
      const bufferSource = bufferSourceRef.current
      bufferSource.stop()
      bufferSource.disconnect()
      setOscillatorStatus(OscillatorStatus.IDLE)
    } else if (
      audioContextRef.current &&
      oscillatorStatus === OscillatorStatus.STARTING
    ) {
      const audioContext = audioContextRef.current
      const nextBufferSource = audioContext.createBufferSource()
      const sampleResolution = Math.floor(audioContext.sampleRate / 220)
      const periodicWaveSamples = getPeriodicWaveSamples({
        periodicWaveform: periodicWaveformRef.current,
        samplesPerPeriod: sampleResolution,
      })
      const periodicWaveBuffer = audioContext.createBuffer(
        2,
        periodicWaveSamples.length,
        audioContext.sampleRate
      )
      const targetChannelA = periodicWaveBuffer.getChannelData(0)
      const targetChannelB = periodicWaveBuffer.getChannelData(1)
      periodicWaveSamples.forEach((sample, sampleIndex) => {
        targetChannelA[sampleIndex] = sample
        targetChannelB[sampleIndex] = sample
      })
      nextBufferSource.buffer = periodicWaveBuffer
      nextBufferSource.loop = true
      nextBufferSource.connect(audioContext.destination)
      nextBufferSource.start()
      bufferSourceRef.current = nextBufferSource
      setOscillatorStatus(OscillatorStatus.PLAYING)
    }
    oscillatorStatusRef.current = oscillatorStatus
  }, [oscillatorStatus])
  useEffect(() => {
    if (
      bufferSourceRef.current &&
      periodicWaveform.length === 0 &&
      oscillatorStatusRef.current === OscillatorStatus.PLAYING
    ) {
      setOscillatorStatus(OscillatorStatus.STOPPING)
    } else if (
      bufferSourceRef.current &&
      oscillatorStatusRef.current === OscillatorStatus.PLAYING
    ) {
      const bufferSource = bufferSourceRef.current
      bufferSource.stop()
      bufferSource.disconnect()
      setOscillatorStatus(OscillatorStatus.STARTING)
    }
    periodicWaveformRef.current = periodicWaveform
  }, [periodicWaveform])
  const oscillatorIsStable =
    oscillatorStatus === OscillatorStatus.IDLE ||
    oscillatorStatus === OscillatorStatus.PLAYING
  const toggleOscillator = () => {
    if (!audioContextRef.current) {
      const newAudioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      newAudioContext.resume()
      audioContextRef.current = newAudioContext
    }
    if (oscillatorIsStable) {
      const nextOscillatorStatus =
        oscillatorStatus === OscillatorStatus.PLAYING
          ? OscillatorStatus.STOPPING
          : OscillatorStatus.STARTING
      setOscillatorStatus(nextOscillatorStatus)
    }
  }
  return {
    status: oscillatorStatus,
    isStable: oscillatorIsStable,
    toggle: toggleOscillator,
  }
}

interface PeriodicWaveSamplesProps {
  periodicWaveform: CompositeWaveform
  samplesPerPeriod: number
}

const getPeriodicWaveSamples = (props: PeriodicWaveSamplesProps) => {
  const { periodicWaveform, samplesPerPeriod } = props
  const getUnitSineSample = periodicWaveform.reduce(
    (getParentSineSample, basicWaveform, harmonicIndex) => {
      const childEllipse = makeEllipse({
        center: makePoint({ x: 0, y: 0 }),
        radiusX: basicWaveform.magnitudeX,
        radiusY: basicWaveform.magnitudeY,
        rotation: basicWaveform.phase,
      })
      return (timeIndex: number) => {
        const childAngleIndex =
          -childEllipse.rotation + timeIndex * Math.pow(2, harmonicIndex)
        return (
          getParentSineSample(timeIndex) +
          getEllipsePerimeterSine({
            someEllipse: childEllipse,
            angleIndex: childAngleIndex,
          })
        )
      }
    },
    (periodAngle: number) => 0
  )
  const periodStep = 1 / (samplesPerPeriod - 1)
  const unitSineSamples = Array(samplesPerPeriod)
    .fill(null)
    .map((_, sampleIndex) => {
      const periodIndex = periodStep * sampleIndex
      return getUnitSineSample(periodIndex)
    })
  const maxAmp = unitSineSamples.reduce((currentMax, baseSample) => {
    return Math.max(Math.abs(baseSample), currentMax)
  }, 0)
  const projectedSamples = unitSineSamples.map(
    (unitSample) => ((unitSample / maxAmp) * 11) / 12
  )
  return projectedSamples
}
