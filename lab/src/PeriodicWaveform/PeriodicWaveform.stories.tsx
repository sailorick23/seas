import React, { useEffect, useRef } from 'react'

export default {
  title: 'PeriodicWaveform',
  component: () => null,
}

export const Basic = () => {
  const periodicWaveform = { magnitudeX: 1, magnitudeY: 1, phase: 0 }
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const graphicsContext = canvasRef.current?.getContext('2d')
    if (graphicsContext) {
      const unitWaveformEllipse = ellipse({
        center: { x: 0, y: 0 },
        radiusX: periodicWaveform.magnitudeX,
        radiusY: periodicWaveform.magnitudeY,
        rotation: periodicWaveform.phase,
      })
      const unitWaveformSamples = ellipsePerimeterSamples({
        someEllipse: unitWaveformEllipse,
        sampleCount: 96,
      })
      const targetCanvas = graphicsContext.canvas
      const canvasRectangle = rectangle({
        anchor: { x: 0, y: 0 },
        width: targetCanvas.width,
        height: targetCanvas.height,
      })
      const canvasRoot = rectangleRoot(canvasRectangle)
      const targetPadding = canvasRoot / 8
      const targetRoot = canvasRoot - 2 * targetPadding
      const targetRectangle = rectangle({
        anchor: { x: targetPadding, y: targetPadding },
        width: targetRoot,
        height: targetRoot,
      })
      const targetCenter = rectangleCenter(targetRectangle)
      const maxTargetRadius = targetRoot / 2
      const projectedSample = (unitEllipseSample: Point) => ({
        x: maxTargetRadius * unitEllipseSample.x + targetCenter.x,
        y: maxTargetRadius * unitEllipseSample.y + targetCenter.y,
      })
      const projectedWaveformSamples = unitWaveformSamples.map(projectedSample)
      strokePathPoints({
        graphicsContext,
        pathPoints: projectedWaveformSamples,
      })
    }
  }, [])
  return <canvas ref={canvasRef} width={256} height={256} />
}

interface Point {
  x: number
  y: number
}

interface Ellipse {
  center: Point
  radiusX: number
  radiusY: number
  rotation: number
}

const ellipse = (someEllipse: Ellipse) => someEllipse

interface EllipsePerimeterPointProps {
  someEllipse: Ellipse
  angleIndex: number
}

// https://math.stackexchange.com/questions/22064/calculating-a-point-that-lies-on-an-ellipse-given-an-angle
const ellipsePerimeterPoint = (props: EllipsePerimeterPointProps) => {
  const { someEllipse, angleIndex } = props
  const relativeAngle = 2 * Math.PI * angleIndex
  const rotationAngle = 2 * Math.PI * someEllipse.rotation
  const baseX =
    (someEllipse.radiusX * someEllipse.radiusY * Math.cos(relativeAngle)) /
    Math.sqrt(
      Math.pow(someEllipse.radiusY * Math.cos(relativeAngle), 2) +
        Math.pow(someEllipse.radiusX * Math.sin(relativeAngle), 2)
    )
  const baseY =
    (someEllipse.radiusX * someEllipse.radiusY * Math.sin(relativeAngle)) /
    Math.sqrt(
      Math.pow(someEllipse.radiusY * Math.cos(relativeAngle), 2) +
        Math.pow(someEllipse.radiusX * Math.sin(relativeAngle), 2)
    )
  const rotatedX =
    baseX * Math.cos(rotationAngle) - baseY * Math.sin(rotationAngle)
  const rotatedY =
    baseX * Math.sin(rotationAngle) + baseY * Math.cos(rotationAngle)
  return {
    x: rotatedX + someEllipse.center.x,
    y: rotatedY + someEllipse.center.y,
  }
}

interface EllipsePerimeterSamplesProps {
  someEllipse: Ellipse
  sampleCount: number
}

const ellipsePerimeterSamples = (props: EllipsePerimeterSamplesProps) => {
  const { someEllipse, sampleCount } = props
  const angleIndexStep = 1 / sampleCount
  return Array(sampleCount)
    .fill(undefined)
    .map((_, sampleIndex) =>
      ellipsePerimeterPoint({
        someEllipse,
        angleIndex: sampleIndex * angleIndexStep,
      })
    )
}

interface Rectangle {
  anchor: Point
  width: number
  height: number
}

const rectangle = (someRectangle: Rectangle) => someRectangle

const rectangleCenter = (someRectangle: Rectangle) => ({
  x: someRectangle.anchor.x + someRectangle.width / 2,
  y: someRectangle.anchor.y + someRectangle.height / 2,
})

const rectangleRoot = (someRectangle: Rectangle) =>
  Math.min(someRectangle.width, someRectangle.height)

interface StrokePathPointsProps {
  graphicsContext: CanvasRenderingContext2D
  pathPoints: Point[]
}

const strokePathPoints = (props: StrokePathPointsProps) => {
  const { graphicsContext, pathPoints } = props
  graphicsContext.beginPath()
  pathPoints.forEach((point: Point) => {
    graphicsContext.lineTo(point.x, point.y)
  })
  graphicsContext.closePath()
  graphicsContext.lineWidth = 2
  graphicsContext.strokeStyle = 'black'
  graphicsContext.stroke()
}
