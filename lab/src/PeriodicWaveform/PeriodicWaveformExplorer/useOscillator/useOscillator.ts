import { useRef, useState } from 'react'
import { getWaveformWavData, WaveformWavDataProps } from '../../shared/Audio'

export enum OscillatorStatus {
  IDLE,
  PLAYING,
}

export interface Oscillator {
  readonly status: OscillatorStatus
  readonly play: (
    props: Pick<
      WaveformWavDataProps,
      'approximateSeconds' | 'periodicWaveform' | 'waveformFrequency'
    >
  ) => void
  readonly stop: () => void
}

export const useOscillator = (): Oscillator => {
  const [oscillatorStatus, setOscillatorStatus] = useState(
    OscillatorStatus.IDLE
  )
  const audioContextRef = useRef<AudioContext | undefined>(undefined)
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null)
  return {
    status: oscillatorStatus,
    play: (props) => {
      if (bufferSourceRef.current) {
        bufferSourceRef.current.stop()
        bufferSourceRef.current.disconnect()
        bufferSourceRef.current = null
      }
      if (!audioContextRef.current) {
        const newAudioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)()
        newAudioContext.resume()
        audioContextRef.current = newAudioContext
      }
      const audioContext = audioContextRef.current
      const waveformWavData = getWaveformWavData(props)
      audioContext.decodeAudioData(waveformWavData.buffer, (audioBuffer) => {
        const nextBufferSource = audioContext.createBufferSource()
        nextBufferSource.buffer = audioBuffer
        nextBufferSource.loop = true
        nextBufferSource.connect(audioContext.destination)
        nextBufferSource.start()
        bufferSourceRef.current = nextBufferSource
        setOscillatorStatus(OscillatorStatus.PLAYING)
      })
    },
    stop: () => {
      const bufferSource = bufferSourceRef.current
      if (bufferSource) {
        bufferSource.stop()
        bufferSource.disconnect()
        bufferSourceRef.current = null
        setOscillatorStatus(OscillatorStatus.IDLE)
      }
    },
  }
}
