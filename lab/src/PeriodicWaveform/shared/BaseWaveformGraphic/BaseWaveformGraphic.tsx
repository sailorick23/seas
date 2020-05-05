import React from 'react'
import { PathType } from '../Geometry'
import { DrawGraphicProps, Graphic, GraphicProps } from '../Graphic'
import { CompositeWaveform } from '../Waveform'

export const BaseWaveformGraphic = (props: BaseWaveformGraphicProps) => {
  return <Graphic drawGraphic={drawGraphic} {...props} />
}

export interface BaseWaveformGraphicProps
  extends Pick<
    GraphicProps<
      CompositeWaveform,
      WaveformGraphicGeometry,
      WaveformGraphicStyle
    >,
    'graphicData' | 'graphicSize' | 'graphicStyle' | 'getGraphicGeometry'
  > {}

export interface WaveformGraphicProps
  extends Pick<
    BaseWaveformGraphicProps,
    'graphicData' | 'graphicSize' | 'graphicStyle'
  > {}

export interface WaveformGraphicGeometry {
  waveformPaths: PathType[]
}

export interface WaveformGraphicStyle {
  backgroundStyle: CanvasFillStrokeStyles['strokeStyle']
  pathStyle: CanvasFillStrokeStyles['strokeStyle']
  pathWidth: number
}

const drawGraphic = (
  props: DrawGraphicProps<WaveformGraphicGeometry, WaveformGraphicStyle>
) => {
  const { graphicGeometry, graphicContext, graphicStyle } = props
  const { waveformPaths } = graphicGeometry
  graphicContext.fillStyle = graphicStyle.backgroundStyle
  graphicContext.fillRect(
    0,
    0,
    graphicContext.canvas.width,
    graphicContext.canvas.height
  )
  waveformPaths.forEach((currentPath) => {
    graphicContext.beginPath()
    currentPath.data.forEach((currentPoint) => {
      graphicContext.lineTo(currentPoint.x, currentPoint.y)
    })
    if (currentPath.variant === 'shape') {
      graphicContext.closePath()
    }
    graphicContext.strokeStyle = graphicStyle.pathStyle
    graphicContext.lineWidth = graphicStyle.pathWidth
    graphicContext.stroke()
  })
}
