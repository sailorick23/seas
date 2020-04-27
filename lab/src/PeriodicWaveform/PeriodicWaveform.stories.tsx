import React, { useEffect, useRef } from 'react'

export default {
  title: 'PeriodicWaveform',
  component: () => null,
}

export const Basic = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const graphicsContext = canvasRef.current?.getContext('2d')
    if (graphicsContext) {
      const targetCanvas = graphicsContext.canvas
    }
  }, [])
  return <canvas ref={canvasRef} width={256} height={256} />
}
