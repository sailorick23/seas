export interface Point {
  x: number
  y: number
}

export const makePoint = (somePoint: Point) => somePoint

export interface Ellipse {
  center: Point
  radiusX: number
  radiusY: number
  rotation: number
}

export const makeEllipse = (someEllipse: Ellipse) => someEllipse

// https://math.stackexchange.com/questions/22064/calculating-a-point-that-lies-on-an-ellipse-given-an-angle
export const getEllipsePerimeterPoint = (props: EllipsePerimeterPointProps) => {
  const perimeterVector = getEllipsePerimeterVector(props)
  const { someEllipse } = props
  return {
    x: perimeterVector.x + someEllipse.center.x,
    y: perimeterVector.y + someEllipse.center.y,
  }
}

export interface EllipsePerimeterPointProps extends EllipsePerimeterProps {}

export const getEllipsePerimeterCosine = (props: EllipsePerimeterCosineProps) =>
  getEllipsePerimeterVector(props).x

export interface EllipsePerimeterCosineProps extends EllipsePerimeterProps {}

export const getEllipsePerimeterSine = (props: EllipsePerimeterSineProps) =>
  getEllipsePerimeterVector(props).y

export interface EllipsePerimeterSineProps extends EllipsePerimeterProps {}

export const getEllipsePerimeterVector = (
  props: EllipsePerimeterVectorProps
) => {
  const perimeterBase = getBaseEllipsePerimeterVector(props)
  const { someEllipse } = props
  const rotationAngle = 2 * Math.PI * someEllipse.rotation
  const rotatedX =
    perimeterBase.x * Math.cos(rotationAngle) -
    perimeterBase.y * Math.sin(rotationAngle)
  const rotatedY =
    perimeterBase.x * Math.sin(rotationAngle) +
    perimeterBase.y * Math.cos(rotationAngle)
  return {
    x: rotatedX,
    y: rotatedY,
  }
}

export interface EllipsePerimeterVectorProps extends EllipsePerimeterProps {}

export const getBaseEllipsePerimeterVector = (
  props: BaseEllipsePerimeterVectorProps
) => {
  const { someEllipse, angleIndex } = props
  const relativeAngle = 2 * Math.PI * angleIndex
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
  return {
    x: baseX,
    y: baseY,
  }
}

export interface BaseEllipsePerimeterVectorProps
  extends EllipsePerimeterProps {}

export interface EllipsePerimeterProps {
  someEllipse: Ellipse
  angleIndex: number
}

export interface Region {
  anchor: Point
  width: number
  height: number
}

export const makeRegion = (someRegion: Region) => someRegion

export const getRegionCenter = (someRegion: Region) => ({
  x: someRegion.anchor.x + someRegion.width / 2,
  y: someRegion.anchor.y + someRegion.height / 2,
})

export const getRegionRoot = (someRegion: Region) =>
  Math.min(someRegion.width, someRegion.height)

export type PathType = SequencePath | ShapePath

export interface SequencePath extends BasePath<'sequence'> {}

export interface ShapePath extends BasePath<'shape'> {}

export interface BasePath<Variant extends PathVariant> {
  variant: Variant
  data: Array<Point>
}

export type PathVariant = 'sequence' | 'shape'
