import React from 'react'
import {
    BaseWaveformGraphic, WaveformGraphicGeometry, WaveformGraphicProps
} from '../../../shared/BaseWaveformGraphic'
import {
    getEllipsePerimeterSine, getRegionCenter, getRegionRoot, makeEllipse, makePoint, makeRegion
} from '../../../shared/Geometry'
import { GetGraphicGeometryProps } from '../../../shared/Graphic'
import { CompositeWaveform } from '../../../shared/Waveform'

export const SineTimelineGraphic = (props: SineTimelineGraphicProps) => (
  <BaseWaveformGraphic getGraphicGeometry={getGraphicGeometry} {...props} />
)

export interface SineTimelineGraphicProps extends WaveformGraphicProps {}

const getGraphicGeometry = (
  props: GetGraphicGeometryProps<CompositeWaveform>
): WaveformGraphicGeometry => {
  const { graphicData, targetCanvas } = props
  const unitGeometry = graphicData.reduce<UnitGeometry>(
    (unitGeometryResult, harmonicWaveform, harmonicIndex) => {
      const newUnitEllipse = makeEllipse({
        center: makePoint({ x: 0, y: 0 }),
        radiusX: harmonicWaveform.magnitudeX,
        radiusY: harmonicWaveform.magnitudeY,
        rotation: harmonicWaveform.phase,
      })
      return {
        getCompositeWaveformSample: (timeIndex: number) =>
          unitGeometryResult.getCompositeWaveformSample(timeIndex) +
          getEllipsePerimeterSine({
            someEllipse: newUnitEllipse,
            angleIndex:
              -newUnitEllipse.rotation + timeIndex * Math.pow(2, harmonicIndex),
          }),
        maxCompositeRadius:
          unitGeometryResult.maxCompositeRadius +
          Math.max(newUnitEllipse.radiusX, newUnitEllipse.radiusY),
      }
    },
    {
      getCompositeWaveformSample: () => 0,
      maxCompositeRadius: 0,
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
  const targetCenter = getRegionCenter(targetRegion)
  const maxTargetRadius = targetRoot / 2
  const sampleCount = 128
  const timeIndexStep = 1 / (sampleCount - 1)
  const projectedTimelineSamples = Array(sampleCount)
    .fill(undefined)
    .map((_, sampleIndex) => {
      const timeIndex = timeIndexStep * sampleIndex
      const unitSample = unitGeometry.getCompositeWaveformSample(timeIndex)
      return makePoint({
        x: timeIndex * targetRegion.width + targetRegion.anchor.x,
        y:
          (maxTargetRadius * unitSample) / unitGeometry.maxCompositeRadius +
          targetCenter.y,
      })
    })
  return {
    waveformPaths: [{ variant: 'sequence', data: projectedTimelineSamples }],
  }
}

interface UnitGeometry {
  getCompositeWaveformSample: (timeIndex: number) => number
  maxCompositeRadius: number
}
