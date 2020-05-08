import React from 'react'
import {
    BaseWaveformGraphic, WaveformGraphicGeometry, WaveformGraphicProps
} from '../../../shared/BaseWaveformGraphic'
import {
    Ellipse, getEllipsePerimeterPoint, getRegionCenter, getRegionRoot, makeEllipse, makePoint,
    makeRegion, PathType
} from '../../../shared/Geometry'
import { GetGraphicGeometryProps } from '../../../shared/Graphic'
import { CompositeWaveform } from '../../../shared/Waveform'

export interface StructureGraphicProps extends WaveformGraphicProps {}

export const StructureGraphic = (props: StructureGraphicProps) => (
  <BaseWaveformGraphic getGraphicGeometry={getGraphicGeometry} {...props} />
)

const getGraphicGeometry = (
  props: GetGraphicGeometryProps<CompositeWaveform>
): WaveformGraphicGeometry => {
  const { graphicData, targetCanvas } = props
  const { unitHarmonics, maxCompositeUnitRadius } = graphicData.reduce<
    UnitGeometry
  >(
    (unitGeometryResult, harmonicWaveform, harmonicIndex) => {
      const { unitHarmonics, maxCompositeUnitRadius } = unitGeometryResult
      const parentEllipse = unitHarmonics[harmonicIndex - 1]
      const childCenter = parentEllipse
        ? getEllipsePerimeterPoint({
            someEllipse: parentEllipse,
            angleIndex: -parentEllipse.rotation,
          })
        : makePoint({ x: 0, y: 0 })
      const childEllipse = makeEllipse({
        center: childCenter,
        radiusX: harmonicWaveform.magnitudeX,
        radiusY: harmonicWaveform.magnitudeY,
        rotation: harmonicWaveform.phase,
      })
      return {
        unitHarmonics: [...unitHarmonics, childEllipse],
        maxCompositeUnitRadius:
          maxCompositeUnitRadius +
          Math.max(childEllipse.radiusX, childEllipse.radiusY),
      }
    },
    {
      unitHarmonics: [],
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
  const targetCenter = getRegionCenter(targetRegion)
  const maxTargetRadius = targetRoot / 2
  const sampleIndexStep = 1 / HARMONIC_ELLIPSE_PERIMETER_SAMPLE_COUNT
  const projectedHarmonicPaths = Array(HARMONIC_ELLIPSE_PERIMETER_SAMPLE_COUNT)
    .fill(undefined)
    .reduce<PathType[]>(
      (harmonicsPathsResult, _, sampleIndex) => {
        const sampleAngleIndex = sampleIndex * sampleIndexStep
        harmonicsPathsResult.forEach((projectedHarmonicPath, harmonicIndex) => {
          const unitEllipse = unitHarmonics[harmonicIndex]
          const unitSample = getEllipsePerimeterPoint({
            someEllipse: unitEllipse,
            angleIndex: sampleAngleIndex,
          })
          const projectedSample = makePoint({
            x:
              (maxTargetRadius * unitSample.x) / maxCompositeUnitRadius +
              targetCenter.x,
            y:
              (maxTargetRadius * unitSample.y) / maxCompositeUnitRadius +
              targetCenter.y,
          })
          projectedHarmonicPath.data.push(projectedSample)
        })
        return harmonicsPathsResult
      },
      unitHarmonics.map(() => ({ variant: 'shape', data: [] }))
    )
  return { waveformPaths: projectedHarmonicPaths }
}

interface UnitGeometry {
  unitHarmonics: Ellipse[]
  maxCompositeUnitRadius: number
}

const HARMONIC_ELLIPSE_PERIMETER_SAMPLE_COUNT = 128
