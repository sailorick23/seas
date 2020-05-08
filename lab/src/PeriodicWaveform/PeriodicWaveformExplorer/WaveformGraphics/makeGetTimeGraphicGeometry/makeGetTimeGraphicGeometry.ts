import { WaveformGraphicGeometry } from '../../../shared/BaseWaveformGraphic'
import {
    EllipsePerimeterProps, getRegionRoot, makeEllipse, makePoint, makeRegion, Point, Region
} from '../../../shared/Geometry'
import { GetGraphicGeometryProps } from '../../../shared/Graphic'
import { CompositeWaveform } from '../../../shared/Waveform'

export interface MakeGetGraphicGeometryProps<
  SomeTimeSample extends TimeSample
> {
  initialUnitSample: SomeTimeSample
  getHarmonicUnitSample: (props: EllipsePerimeterProps) => SomeTimeSample
  getProjectedPoint: (props: {
    timeIndex: number
    unitSample: SomeTimeSample
    targetRegion: Region
    maxCompositeUnitRadius: number
  }) => Point
}

export type TimeSample = [number] | [number, number]

export const makeGetTimeGraphicGeometry = <SomeTimeSample extends TimeSample>(
  makeGetProps: MakeGetGraphicGeometryProps<SomeTimeSample>
) => {
  const {
    getHarmonicUnitSample,
    initialUnitSample,
    getProjectedPoint,
  } = makeGetProps
  return (
    getProps: GetGraphicGeometryProps<CompositeWaveform>
  ): WaveformGraphicGeometry => {
    const { graphicData, targetCanvas } = getProps
    const {
      getCompositeUnitSample,
      maxCompositeUnitRadius,
    } = graphicData.reduce<UnitGeometry<SomeTimeSample>>(
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
            const childUnitSample = getHarmonicUnitSample({
              someEllipse: childEllipse,
              angleIndex: childAngleIndex,
            })
            return parentUnitSample.map(
              (parentDimensionSample, dimensionIndex) =>
                parentDimensionSample + childUnitSample[dimensionIndex]
            ) as SomeTimeSample
          },
          maxCompositeUnitRadius:
            maxCompositeUnitRadius +
            Math.max(childEllipse.radiusX, childEllipse.radiusY),
        }
      },
      {
        getCompositeUnitSample: () => initialUnitSample,
        maxCompositeUnitRadius: 0,
      }
    )
    const canvasRegion = makeRegion({
      anchor: makePoint({ x: 0, y: 0 }),
      width: targetCanvas.width,
      height: targetCanvas.height,
    })
    const canvasRoot = getRegionRoot(canvasRegion)
    const targetPadding = canvasRoot / 8
    const targetRoot = canvasRoot - 2 * targetPadding
    const targetRegion = makeRegion({
      anchor: makePoint({ x: targetPadding, y: targetPadding }),
      width: targetRoot,
      height: targetRoot,
    })
    const sampleCount = 128
    const timeIndexStep = 1 / (sampleCount - 1)
    const projectedTimePoints = Array(sampleCount)
      .fill(undefined)
      .map((_, sampleIndex) => {
        const timeIndex = timeIndexStep * sampleIndex
        const unitSample = getCompositeUnitSample(timeIndex)
        return getProjectedPoint({
          timeIndex,
          unitSample,
          targetRegion,
          maxCompositeUnitRadius: maxCompositeUnitRadius,
        })
      })
    return {
      waveformPaths: [{ variant: 'sequence', data: projectedTimePoints }],
    }
  }
}

interface UnitGeometry<SomeTimeSample extends TimeSample> {
  getCompositeUnitSample: (timeIndex: number) => SomeTimeSample
  maxCompositeUnitRadius: number
}
