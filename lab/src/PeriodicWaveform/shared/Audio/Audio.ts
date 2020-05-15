import { getEllipsePerimeterSine, makeEllipse, makePoint } from '../Geometry'
import { CompositeWaveform } from '../Waveform'

export interface WaveformWavDataProps {
  waveformFrequency: number
  approximateSeconds: number
  periodicWaveform: CompositeWaveform
}

export const getWaveformWavData = (props: WaveformWavDataProps) => {
  const { waveformFrequency, periodicWaveform, approximateSeconds } = props
  const sampleRate = 44100
  const samplesPerPeriod = Math.floor(sampleRate / waveformFrequency)
  const sampleStep = 1 / samplesPerPeriod
  const getWaveformSample = makeGetWaveformSample(periodicWaveform)
  const numberOfSamples =
    approximateSeconds * samplesPerPeriod * waveformFrequency
  const waveformSamples = Array(numberOfSamples)
    .fill(undefined)
    .map((_, sampleIndex) =>
      getWaveformSample(sampleStep * (sampleIndex % samplesPerPeriod))
    )
  return encodeWavFileData(waveformSamples)
}

const makeGetWaveformSample = (periodicWaveform: CompositeWaveform) => {
  const {
    getCompositeUnitSample,
    maxCompositeUnitRadius,
  } = periodicWaveform.reduce<any>(
    (unitGeometryResult, harmonicWaveform, harmonicIndex) => {
      const {
        getCompositeUnitSample,
        maxCompositeUnitRadius,
      } = unitGeometryResult
      const childEllipse = makeEllipse({
        center: makePoint({ x: 0, y: 0 }),
        radiusX: harmonicWaveform.magnitudeX,
        radiusY: harmonicWaveform.magnitudeY,
        rotation: harmonicWaveform.phase,
      })
      return {
        getCompositeUnitSample: (timeIndex: number) => {
          const parentUnitSample = getCompositeUnitSample(timeIndex)
          const childAngleIndex =
            -childEllipse.rotation + timeIndex * Math.pow(2, harmonicIndex)
          const childUnitSample = getEllipsePerimeterSine({
            someEllipse: childEllipse,
            angleIndex: childAngleIndex,
          })
          return parentUnitSample + childUnitSample
        },
        maxCompositeUnitRadius:
          maxCompositeUnitRadius +
          Math.max(childEllipse.radiusX, childEllipse.radiusY),
      }
    },
    {
      getCompositeUnitSample: () => 0,
      maxCompositeUnitRadius: 0,
    }
  )
  return (timeIndex: number) =>
    getCompositeUnitSample(timeIndex) / maxCompositeUnitRadius
}

// http://www.topherlee.com/software/pcm-tut-wavformat.html
// http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/WAVE.html
// https://github.com/mohayonao/wav-encoder/blob/master/index.js
const encodeWavFileData = (waveformSamples: number[]) => {
  const formatLength = 16
  const sampleType = 0x0003
  const numberOfChannels = 1
  const sampleRate = 44100
  const bitsPerChannelSample = 32
  const bytesPerChannelSample = bitsPerChannelSample / 8
  const bytesPerSecond =
    (sampleRate * bitsPerChannelSample * numberOfChannels) / 8
  const bytesPerCompositeSample = (bitsPerChannelSample * numberOfChannels) / 8
  const waveSize = bytesPerCompositeSample * waveformSamples.length
  const headerSize = 44
  const fileSize = headerSize + waveSize
  const wavFileData = new Uint8Array(fileSize)
  const wavBufferView = new DataView(wavFileData.buffer)
  wavBufferView.setUint32(0, stringToLittleEndianData('RIFF'))
  wavBufferView.setUint32(4, fileSize)
  wavBufferView.setUint32(8, stringToLittleEndianData('WAVE'))
  wavBufferView.setUint32(12, stringToLittleEndianData('fmt '))
  wavBufferView.setUint32(16, formatLength, true)
  wavBufferView.setUint16(20, sampleType, true)
  wavBufferView.setUint16(22, numberOfChannels, true)
  wavBufferView.setUint32(24, sampleRate, true)
  wavBufferView.setUint32(28, bytesPerSecond, true)
  wavBufferView.setUint16(32, bytesPerCompositeSample, true)
  wavBufferView.setUint16(34, bitsPerChannelSample, true)
  wavBufferView.setUint32(36, stringToLittleEndianData('data'))
  wavBufferView.setUint32(40, waveSize, true)
  waveformSamples.forEach((sample, sampleIndex) => {
    wavBufferView.setFloat32(
      headerSize + sampleIndex * bytesPerChannelSample,
      sample,
      true
    )
  })
  return wavFileData
}

// someString.length <= 4
const stringToLittleEndianData = (someString: string) =>
  Array.from(someString).reduce(
    (dataResult, character) => (dataResult << 8) | character.charCodeAt(0),
    0
  )
