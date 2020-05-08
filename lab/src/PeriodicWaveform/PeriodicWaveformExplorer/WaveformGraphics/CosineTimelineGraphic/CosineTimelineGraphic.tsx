import React from 'react'
import { BaseWaveformGraphic, WaveformGraphicProps } from '../../../shared/BaseWaveformGraphic'
import {
    getEllipsePerimeterCosine, getRegionCenter, getRegionRoot, makePoint
} from '../../../shared/Geometry'
import { makeGetTimeGraphicGeometry } from '../makeGetTimeGraphicGeometry'

export interface CosineTimelineGraphicProps extends WaveformGraphicProps {}

export const CosineTimelineGraphic = (props: CosineTimelineGraphicProps) => (
  <BaseWaveformGraphic getGraphicGeometry={getGraphicGeometry} {...props} />
)

const getGraphicGeometry = makeGetTimeGraphicGeometry({
  initialUnitSample: [0],
  getHarmonicUnitSample: (props) => [getEllipsePerimeterCosine(props)],
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
      x:
        (maxTargetRadius * unitSample[0]) / maxCompositeUnitRadius +
        targetCenter.x,
      y: timeIndex * targetRegion.height + targetRegion.anchor.y,
    })
  },
})
