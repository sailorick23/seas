import { Point } from './Geometry'

export interface StrokePathPointsProps<StrokeStyle> {
  graphicContext: CanvasRenderingContext2D
  pathPoints: Point[]
  pathStyle?: {
    lineWidth?: number
    strokeStyle?: string
  }
}

export const strokePathPoints = <StrokeStyle>(
  props: StrokePathPointsProps<StrokeStyle>
) => {
  const { graphicContext, pathPoints, pathStyle } = props
  graphicContext.beginPath()
  pathPoints.forEach((point: Point) => {
    graphicContext.lineTo(point.x, point.y)
  })
  graphicContext.closePath()
  graphicContext.lineWidth = pathStyle?.lineWidth || 2
  graphicContext.strokeStyle = pathStyle?.strokeStyle || 'black'
  graphicContext.stroke()
}
