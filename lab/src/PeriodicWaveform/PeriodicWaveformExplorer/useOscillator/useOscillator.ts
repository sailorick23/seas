import { useEffect, useRef, useState } from 'react'
import { getEllipsePerimeterSine } from '../../shared/Geometry'
import { CompositeWaveform } from '../../shared/Waveform'

export interface Oscillator {
  readonly status: OscillatorStatus
  readonly isStable: boolean
  readonly toggle: () => void
}

export enum OscillatorStatus {
  IDLE,
  STARTING,
  PLAYING,
  STOPPING,
}

export const useOscillator = (
  periodicWaveform: CompositeWaveform
): Oscillator => {
  const audioContextRef = useRef<AudioContext | undefined>(undefined)
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const [oscillatorStatus, setOscillatorStatus] = useState(
    OscillatorStatus.IDLE
  )
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
      const periodicWaveSamples = computePeriodicWaveSamples({
        periodicWaveform,
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
  }, [oscillatorStatus, periodicWaveform])
  useEffect(() => {
    if (
      bufferSourceRef.current &&
      periodicWaveform.length === 0 &&
      oscillatorStatus === OscillatorStatus.PLAYING
    ) {
      setOscillatorStatus(OscillatorStatus.STOPPING)
    } else if (
      bufferSourceRef.current &&
      oscillatorStatus === OscillatorStatus.PLAYING
    ) {
      const bufferSource = bufferSourceRef.current
      bufferSource.stop()
      bufferSource.disconnect()
      setOscillatorStatus(OscillatorStatus.STARTING)
    }
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

const computePeriodicWaveSamples = (props: PeriodicWaveSamplesProps) => {
  const { periodicWaveform, samplesPerPeriod } = props
  const computeNormalSampleMagnitude = periodicWaveform
    .map((basicWaveform) => {
      return {
        center: { x: 0, y: 0 },
        radiusX: basicWaveform.magnitudeX,
        radiusY: basicWaveform.magnitudeY,
        rotation: basicWaveform.phase,
      }
    })
    .reduce(
      (compParentSampleMagnitude, ellipse, harmonicIndex) => {
        return (timeIndex: number) =>
          compParentSampleMagnitude(timeIndex) +
          getEllipsePerimeterSine({
            someEllipse: ellipse,
            angleIndex:
              -ellipse.rotation + timeIndex * Math.pow(2, harmonicIndex),
          })
      },
      (periodAngle: number) => 0
    )
  const periodStep = 1 / (samplesPerPeriod - 1)
  const normalSamples = Array(samplesPerPeriod)
    .fill(null)
    .map((_, sampleIndex) => {
      const periodIndex = periodStep * sampleIndex
      return computeNormalSampleMagnitude(periodIndex)
    })
  const maxAmp = normalSamples.reduce((currentMax, sample) => {
    return Math.max(Math.abs(sample), currentMax)
  }, 0)
  const fittedSamples = normalSamples.map(
    (sample) => ((sample / maxAmp) * 11) / 12
  )
  return fittedSamples
}
