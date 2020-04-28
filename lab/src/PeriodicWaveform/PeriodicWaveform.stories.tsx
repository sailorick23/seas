import React, { useEffect, useRef } from 'react'

export default {
  title: 'PeriodicWaveform',
  component: () => null,
}

const SAMPLE_COUNT = 128

export const Basic = () => {
  const compositeWaveform = [
    { magnitudeX: 1, magnitudeY: 0.5, phase: 1 / 3 },
    { magnitudeX: 0.5, magnitudeY: 0.25, phase: 1 / 3 / 2 },
    { magnitudeX: 0.25, magnitudeY: 0.125, phase: 1 / 3 / 2 / 3 },
  ]
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const graphicsContext = canvasRef.current?.getContext('2d')
    if (graphicsContext) {
      const {
        baseHarmonicsGeometry,
        baseMaxCompositeRadius,
      } = compositeWaveform.reduce(
        (baseGeometryResult, harmonicWaveform, harmonicIndex) => {
          const previousGeometry =
            baseGeometryResult.baseHarmonicsGeometry[harmonicIndex - 1]
          const baseCenter = previousGeometry
            ? previousGeometry.sampler(-previousGeometry.ellipse.rotation)
            : point({ x: 0, y: 0 })
          const baseEllipse = ellipse({
            center: baseCenter,
            radiusX: harmonicWaveform.magnitudeX,
            radiusY: harmonicWaveform.magnitudeY,
            rotation: harmonicWaveform.phase,
          })
          const baseSampler = (angleIndex: number) =>
            ellipsePerimeterPoint({
              angleIndex,
              someEllipse: baseEllipse,
            })
          const baseMaxCompositeRadius =
            baseGeometryResult.baseMaxCompositeRadius +
            Math.max(baseEllipse.radiusX, baseEllipse.radiusY)
          baseGeometryResult.baseHarmonicsGeometry.push({
            ellipse: baseEllipse,
            sampler: baseSampler,
          })
          baseGeometryResult.baseMaxCompositeRadius = baseMaxCompositeRadius
          return baseGeometryResult
        },
        {
          baseHarmonicsGeometry: [],
          baseMaxCompositeRadius: 0,
        } as {
          baseHarmonicsGeometry: HarmonicGeometry[]
          baseMaxCompositeRadius: number
        }
      )
      const targetCanvas = graphicsContext.canvas
      const canvasRectangle = rectangle({
        anchor: point({ x: 0, y: 0 }),
        width: targetCanvas.width,
        height: targetCanvas.height,
      })
      const canvasRoot = rectangleRoot(canvasRectangle)
      const targetPadding = canvasRoot / 8
      const targetRoot = canvasRoot - 2 * targetPadding
      const targetRectangle = rectangle({
        anchor: point({ x: targetPadding, y: targetPadding }),
        width: targetRoot,
        height: targetRoot,
      })
      const targetCenter = rectangleCenter(targetRectangle)
      const maxTargetRadius = targetRoot / 2
      const sampleIndexStep = 1 / SAMPLE_COUNT
      const projectedHarmonicsPaths = Array(SAMPLE_COUNT)
        .fill(undefined)
        .reduce<Point[][]>(
          (harmonicsPathsResult, _, sampleIndex) => {
            const sampleAngleIndex = sampleIndex * sampleIndexStep
            harmonicsPathsResult.forEach(
              (projectedHarmonicPath, harmonicIndex) => {
                const baseGeometry = baseHarmonicsGeometry[harmonicIndex]
                const baseSample = baseGeometry.sampler(sampleAngleIndex)
                const projectedSample = point({
                  x:
                    (maxTargetRadius * baseSample.x) / baseMaxCompositeRadius +
                    targetCenter.x,
                  y:
                    (maxTargetRadius * baseSample.y) / baseMaxCompositeRadius +
                    targetCenter.y,
                })
                projectedHarmonicPath.push(projectedSample)
              }
            )
            return harmonicsPathsResult
          },
          baseHarmonicsGeometry.map(() => [])
        )
      projectedHarmonicsPaths.forEach((harmonicPath) => {
        strokePathPoints({
          graphicsContext,
          pathPoints: harmonicPath,
        })
      })
    }
  }, [])
  return <canvas ref={canvasRef} width={256} height={256} />
}

interface HarmonicGeometry {
  ellipse: Ellipse
  sampler: (angleIndex: number) => Point
}

interface Point {
  x: number
  y: number
}

const point = (somePoint: Point) => somePoint

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
