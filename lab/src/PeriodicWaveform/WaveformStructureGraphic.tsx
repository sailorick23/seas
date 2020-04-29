import React from 'react'
import { strokePathPoints } from './shared/Drawing'
import {
    Ellipse, getEllipsePerimeterPoint, getRectangleCenter, getRectangleRoot, makeEllipse, makePoint,
    makeRectangle, Point
} from './shared/Geometry'
import { DrawGraphicProps, GetGraphicGeometryProps, Graphic, GraphicProps } from './shared/Graphic'
import { CompositeWaveform } from './shared/Waveform'

export const WaveformStructureGraphic = (
  props: WaveformStructureGraphicProps
) => (
  <Graphic
    {...props}
    getGraphicGeometry={getGraphicGeometry}
    drawGraphic={drawGraphic}
    graphicStyle={{}}
  />
)

export interface WaveformStructureGraphicProps
  extends Pick<
    GraphicProps<
      CompositeWaveform,
      WaveformStructureGeometry,
      typeof drawGraphic
    >,
    'graphicData'
  > {}

const HARMONIC_ELLIPSE_PERIMETER_SAMPLE_COUNT = 128

const getGraphicGeometry = (
  props: GetGraphicGeometryProps<CompositeWaveform>
): WaveformStructureGeometry => {
  const { graphicData, targetCanvas } = props
  const unitGeometry = graphicData.reduce<UnitGeometry>(
    (unitGeometryResult, harmonicWaveform, harmonicIndex) => {
      const previousGeometry = unitGeometryResult.harmonics[harmonicIndex - 1]
      const newEllipseCenter = previousGeometry
        ? getEllipsePerimeterPoint({
            someEllipse: previousGeometry.ellipse,
            angleIndex: -previousGeometry.ellipse.rotation,
          })
        : makePoint({ x: 0, y: 0 })
      const newUnitEllipse = makeEllipse({
        center: newEllipseCenter,
        radiusX: harmonicWaveform.magnitudeX,
        radiusY: harmonicWaveform.magnitudeY,
        rotation: harmonicWaveform.phase,
      })
      unitGeometryResult.harmonics.push({
        ellipse: newUnitEllipse,
      })
      return {
        harmonics: unitGeometryResult.harmonics,
        maxCompositeRadius:
          unitGeometryResult.maxCompositeRadius +
          Math.max(newUnitEllipse.radiusX, newUnitEllipse.radiusY),
      }
    },
    {
      harmonics: [],
      maxCompositeRadius: 0,
    }
  )
  const canvasRectangle = makeRectangle({
    anchor: makePoint({ x: 0, y: 0 }),
    width: targetCanvas.width,
    height: targetCanvas.height,
  })
  const canvasRoot = getRectangleRoot(canvasRectangle)
  const targetPadding = canvasRoot / 8
  const targetRoot = canvasRoot - 2 * targetPadding
  const targetRectangle = makeRectangle({
    anchor: makePoint({ x: targetPadding, y: targetPadding }),
    width: targetRoot,
    height: targetRoot,
  })
  const targetCenter = getRectangleCenter(targetRectangle)
  const maxTargetRadius = targetRoot / 2
  const sampleIndexStep = 1 / HARMONIC_ELLIPSE_PERIMETER_SAMPLE_COUNT
  const projectedHarmonicPaths = Array(HARMONIC_ELLIPSE_PERIMETER_SAMPLE_COUNT)
    .fill(undefined)
    .reduce<Point[][]>(
      (harmonicsPathsResult, _, sampleIndex) => {
        const sampleAngleIndex = sampleIndex * sampleIndexStep
        harmonicsPathsResult.forEach((projectedHarmonicPath, harmonicIndex) => {
          const unitHarmonicGeometry = unitGeometry.harmonics[harmonicIndex]
          const unitSample = getEllipsePerimeterPoint({
            someEllipse: unitHarmonicGeometry.ellipse,
            angleIndex: sampleAngleIndex,
          })
          const projectedSample = makePoint({
            x:
              (maxTargetRadius * unitSample.x) /
                unitGeometry.maxCompositeRadius +
              targetCenter.x,
            y:
              (maxTargetRadius * unitSample.y) /
                unitGeometry.maxCompositeRadius +
              targetCenter.y,
          })
          projectedHarmonicPath.push(projectedSample)
        })
        return harmonicsPathsResult
      },
      unitGeometry.harmonics.map(() => [])
    )
  return { projectedHarmonicPaths }
}

interface WaveformStructureGeometry {
  projectedHarmonicPaths: Point[][]
}

interface UnitGeometry {
  harmonics: UnitHarmonicGeometry[]
  maxCompositeRadius: number
}

interface UnitHarmonicGeometry {
  ellipse: Ellipse
}

const drawGraphic = (
  props: DrawGraphicProps<WaveformStructureGeometry, {}>
) => {
  const { graphicGeometry, graphicContext } = props
  const { projectedHarmonicPaths } = graphicGeometry
  projectedHarmonicPaths.forEach((harmonicPath) => {
    strokePathPoints({
      graphicContext,
      pathPoints: harmonicPath,
    })
  })
}
