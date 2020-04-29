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

export interface EllipsePerimeterPointProps {
  someEllipse: Ellipse
  angleIndex: number
}

// https://math.stackexchange.com/questions/22064/calculating-a-point-that-lies-on-an-ellipse-given-an-angle
export const getEllipsePerimeterPoint = (props: EllipsePerimeterPointProps) => {
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

export interface ShapePath extends Array<Point> {}
