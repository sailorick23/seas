import React from 'react'
import { BaseWaveformGraphic, WaveformGraphicProps } from '../../../shared/BaseWaveformGraphic'
import {
    getEllipsePerimeterVector, getRegionCenter, getRegionRoot, makePoint
} from '../../../shared/Geometry'
import { makeGetTimeGraphicGeometry } from '../makeGetTimeGraphicGeometry'

export interface TimeloopGraphicProps extends WaveformGraphicProps {}

export const TimeloopGraphic = (props: TimeloopGraphicProps) => (
  <BaseWaveformGraphic getGraphicGeometry={getGraphicGeometry} {...props} />
)

const getGraphicGeometry = makeGetTimeGraphicGeometry({
  initialUnitSample: [0, 0],
  getHarmonicUnitSample: (props) => {
    const perimeterVector = getEllipsePerimeterVector(props)
    return [perimeterVector.x, perimeterVector.y]
  },
  getProjectedPoint: (props) => {
    const { targetRegion, unitSample, maxCompositeUnitRadius } = props
    const maxTargetRadius = getRegionRoot(targetRegion) / 2
    const targetCenter = getRegionCenter(targetRegion)
    return makePoint({
      x:
        (maxTargetRadius * unitSample[0]) / maxCompositeUnitRadius +
        targetCenter.x,
      y:
        (maxTargetRadius * unitSample[1]) / maxCompositeUnitRadius +
        targetCenter.y,
    })
  },
})
