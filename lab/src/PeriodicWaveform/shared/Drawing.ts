import { Point, ShapePath } from './Geometry'

export interface StrokeShapePathProps {
  graphicContext: CanvasRenderingContext2D
  shapePath: ShapePath
  pathStyle: {
    lineWidth: number
    strokeStyle: CanvasFillStrokeStyles['strokeStyle']
  }
}

export const strokeShapePath = (props: StrokeShapePathProps) => {
  const { graphicContext, shapePath, pathStyle } = props
  graphicContext.beginPath()
  shapePath.forEach((point: Point) => {
    graphicContext.lineTo(point.x, point.y)
  })
  graphicContext.closePath()
  graphicContext.lineWidth = pathStyle.lineWidth
  graphicContext.strokeStyle = pathStyle.strokeStyle
  graphicContext.stroke()
}
