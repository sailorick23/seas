import React from 'react'
import {
    Ellipse, getEllipsePerimeterPoint, getRegionCenter, getRegionRoot, makeEllipse, makePoint,
    makeRegion, PathType, ShapePath
} from '../shared/Geometry'
import { GetGraphicGeometryProps } from '../shared/Graphic'
import { CompositeWaveform } from '../shared/Waveform'
import {
    BaseWaveformGraphic, WaveformGraphicGeometry, WaveformGraphicProps
} from './BaseWaveformGraphic'

export const StructureGraphic = (props: StructureGraphicProps) => (
  <BaseWaveformGraphic getGraphicGeometry={getGraphicGeometry} {...props} />
)

export interface StructureGraphicProps extends WaveformGraphicProps {}

const HARMONIC_ELLIPSE_PERIMETER_SAMPLE_COUNT = 128

const getGraphicGeometry = (
  props: GetGraphicGeometryProps<CompositeWaveform>
): WaveformGraphicGeometry => {
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
  const sampleIndexStep = 1 / HARMONIC_ELLIPSE_PERIMETER_SAMPLE_COUNT
  const projectedHarmonicPaths = Array(HARMONIC_ELLIPSE_PERIMETER_SAMPLE_COUNT)
    .fill(undefined)
    .reduce<PathType[]>(
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
          projectedHarmonicPath.data.push(projectedSample)
        })
        return harmonicsPathsResult
      },
      unitGeometry.harmonics.map(() => ({ variant: 'shape', data: [] }))
    )
  return { waveformPaths: projectedHarmonicPaths }
}

interface UnitGeometry {
  harmonics: UnitHarmonicGeometry[]
  maxCompositeRadius: number
}

interface UnitHarmonicGeometry {
  ellipse: Ellipse
}
