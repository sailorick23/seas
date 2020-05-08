import React from 'react'
import { BaseWaveformGraphic, WaveformGraphicProps } from '../../../shared/BaseWaveformGraphic'
import {
    getEllipsePerimeterSine, getRegionCenter, getRegionRoot, makePoint
} from '../../../shared/Geometry'
import { makeGetTimeGraphicGeometry } from '../makeGetTimeGraphicGeometry'

export interface SineTimelineGraphicProps extends WaveformGraphicProps {}

export const SineTimelineGraphic = (props: SineTimelineGraphicProps) => (
  <BaseWaveformGraphic getGraphicGeometry={getGraphicGeometry} {...props} />
)

const getGraphicGeometry = makeGetTimeGraphicGeometry({
  initialUnitSample: [0],
  getHarmonicUnitSample: (props) => [getEllipsePerimeterSine(props)],
  getProjectedPoint: (props) => {
    const {
      timeIndex,
      targetRegion,
      unitSample,
      maxCompositeUnitRadius,
    } = props
    const maxTargetRadius = getRegionRoot(targetRegion) / 2
    const targetCenter = getRegionCenter(targetRegion)
    return makePoint({
      x: timeIndex * targetRegion.width + targetRegion.anchor.x,
      y:
        (maxTargetRadius * unitSample[0]) / maxCompositeUnitRadius +
        targetCenter.y,
    })
  },
})
