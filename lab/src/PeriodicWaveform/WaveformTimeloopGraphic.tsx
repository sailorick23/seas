import React from 'react'
import {
    getEllipsePerimeterPoint, getRegionCenter, getRegionRoot, makeEllipse, makePoint, makeRegion,
    Point
} from './shared/Geometry'
import { DrawGraphicProps, GetGraphicGeometryProps, Graphic, GraphicProps } from './shared/Graphic'
import { CompositeWaveform } from './shared/Waveform'

export const WaveformTimeloopGraphic = (
  props: WaveformTimeloopGraphicProps
) => {
  return (
    <Graphic
      graphicSize={{ width: 256, height: 256 }}
      graphicStyle={{
        backgroundColor: 'white',
        timelineColor: 'black',
        timelineWidth: 3,
      }}
      {...props}
      getGraphicGeometry={getGraphicGeometry}
      drawGraphic={drawGraphic}
    />
  )
}

export interface WaveformTimeloopGraphicProps
  extends Pick<
    GraphicProps<
      CompositeWaveform,
      WaveformTimeloopGeometry,
      WaveformTimeloopStyle
    >,
    'graphicData'
  > {}

const getGraphicGeometry = (
  props: GetGraphicGeometryProps<CompositeWaveform>
): WaveformTimeloopGeometry => {
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
        getCompositeWaveformSample: (timeIndex: number) => {
          const baseVectorPoint = unitGeometryResult.getCompositeWaveformSample(
            timeIndex
          )
          const newVectorPoint = getEllipsePerimeterPoint({
            someEllipse: newUnitEllipse,
            angleIndex:
              -newUnitEllipse.rotation + timeIndex * Math.pow(2, harmonicIndex),
          })
          return makePoint({
            x: baseVectorPoint.x + newVectorPoint.x,
            y: baseVectorPoint.y + newVectorPoint.y,
          })
        },
        maxCompositeRadius:
          unitGeometryResult.maxCompositeRadius +
          Math.max(newUnitEllipse.radiusX, newUnitEllipse.radiusY),
      }
    },
    {
      getCompositeWaveformSample: () => makePoint({ x: 0, y: 0 }),
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
  const sampleCount = 256
  const timeIndexStep = 1 / (sampleCount - 1)
  const projectedTimelineSamples = Array(sampleCount)
    .fill(undefined)
    .map((_, sampleIndex) => {
      const timeIndex = timeIndexStep * sampleIndex
      const unitSample = unitGeometry.getCompositeWaveformSample(timeIndex)
      return makePoint({
        x:
          (maxTargetRadius * unitSample.x) / unitGeometry.maxCompositeRadius +
          targetCenter.x,
        y:
          (maxTargetRadius * unitSample.y) / unitGeometry.maxCompositeRadius +
          targetCenter.y,
      })
    })
  return { projectedTimelineSamples }
}

interface WaveformTimeloopGeometry {
  projectedTimelineSamples: Point[]
}

interface UnitGeometry {
  getCompositeWaveformSample: (timeIndex: number) => Point
  maxCompositeRadius: number
}

const drawGraphic = (
  props: DrawGraphicProps<WaveformTimeloopGeometry, WaveformTimeloopStyle>
) => {
  const { graphicGeometry, graphicContext, graphicStyle } = props
  const { projectedTimelineSamples } = graphicGeometry
  graphicContext.fillStyle = graphicStyle.backgroundColor
  graphicContext.fillRect(
    0,
    0,
    graphicContext.canvas.width,
    graphicContext.canvas.height
  )
  graphicContext.beginPath()
  projectedTimelineSamples.forEach((sample) => {
    graphicContext.lineTo(sample.x, sample.y)
  })
  graphicContext.strokeStyle = graphicStyle.timelineColor
  graphicContext.lineWidth = graphicStyle.timelineWidth
  graphicContext.stroke()
}

interface WaveformTimeloopStyle {
  backgroundColor: string
  timelineColor: string
  timelineWidth: number
}
