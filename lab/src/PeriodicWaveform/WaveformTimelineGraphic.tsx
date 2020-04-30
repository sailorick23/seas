import React from 'react'
import {
    getEllipsePerimeterPoint, getRegionCenter, getRegionRoot, makeEllipse, makePoint, makeRegion,
    Point
} from './shared/Geometry'
import { DrawGraphicProps, GetGraphicGeometryProps, Graphic, GraphicProps } from './shared/Graphic'
import { CompositeWaveform } from './shared/Waveform'

export const WaveformTimelineGraphic = (
  props: WaveformTimelineGraphicProps
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

export interface WaveformTimelineGraphicProps
  extends Pick<
    GraphicProps<
      CompositeWaveform,
      WaveformTimelineGeometry,
      WaveformTimelineStyle
    >,
    'graphicData'
  > {}

const getGraphicGeometry = (
  props: GetGraphicGeometryProps<CompositeWaveform>
): WaveformTimelineGeometry => {
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
          getEllipsePerimeterPoint({
            someEllipse: newUnitEllipse,
            angleIndex:
              -newUnitEllipse.rotation + timeIndex * Math.pow(2, harmonicIndex),
          }).y,
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
  return { projectedTimelineSamples }
}

interface WaveformTimelineGeometry {
  projectedTimelineSamples: Point[]
}

interface UnitGeometry {
  getCompositeWaveformSample: (timeIndex: number) => number
  maxCompositeRadius: number
}

const drawGraphic = (
  props: DrawGraphicProps<WaveformTimelineGeometry, WaveformTimelineStyle>
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

interface WaveformTimelineStyle {
  backgroundColor: string
  timelineColor: string
  timelineWidth: number
}
