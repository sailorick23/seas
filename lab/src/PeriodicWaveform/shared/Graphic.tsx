import React, { useEffect, useRef } from 'react'

export const Graphic = <GraphicData, GraphicGeometry, GraphicStyle>(
  props: GraphicProps<GraphicData, GraphicGeometry, GraphicStyle>
) => {
  const { getGraphicGeometry, graphicData, drawGraphic, graphicStyle } = props
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const canvasElement = canvasRef.current
    const graphicContext = canvasElement?.getContext('2d')
    if (graphicContext) {
      const graphicGeometry = getGraphicGeometry({
        graphicData,
        targetCanvas: graphicContext.canvas,
      })
      drawGraphic({
        graphicContext,
        graphicStyle,
        graphicGeometry,
      })
    }
  }, [graphicData])
  return <canvas width={256} height={256} ref={canvasRef} />
}

export interface GraphicProps<GraphicData, GraphicGeometry, GraphicStyle> {
  graphicData: GraphicData
  getGraphicGeometry: (
    props: GetGraphicGeometryProps<GraphicData>
  ) => GraphicGeometry
  drawGraphic: (props: DrawGraphicProps<GraphicGeometry, GraphicStyle>) => void
  graphicStyle: GraphicStyle
}

export interface GetGraphicGeometryProps<GraphicData> {
  targetCanvas: HTMLCanvasElement
  graphicData: GraphicData
}

export interface DrawGraphicProps<GraphicGeometry, GraphicStyle> {
  graphicContext: CanvasRenderingContext2D
  graphicGeometry: GraphicGeometry
  graphicStyle: GraphicStyle
}
