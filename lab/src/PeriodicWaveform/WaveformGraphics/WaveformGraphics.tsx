import React from 'react'
import { WaveformGraphicProps } from './BaseWaveformGraphic'
import { CosineTimelineGraphic } from './CosineTimelineGraphic'
import { SineTimelineGraphic } from './SineTimelineGraphic'
import { StructureGraphic } from './StructureGraphic'
import { TimeloopGraphic } from './TimeloopGraphic'

export const WaveformGraphics = (props: WaveformGraphicsProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
    >
      <StructureGraphic
        graphicSize={GRAPHIC_SIZE}
        graphicStyle={GRAPHIC_STYLE}
        {...props}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <TimeloopGraphic
          graphicSize={GRAPHIC_SIZE}
          graphicStyle={GRAPHIC_STYLE}
          {...props}
        />
        <CosineTimelineGraphic
          graphicSize={GRAPHIC_SIZE}
          graphicStyle={GRAPHIC_STYLE}
          {...props}
        />
      </div>
      <SineTimelineGraphic
        graphicSize={GRAPHIC_SIZE}
        graphicStyle={GRAPHIC_STYLE}
        {...props}
      />
    </div>
  )
}

export interface WaveformGraphicsProps
  extends Pick<WaveformGraphicProps, 'graphicData'> {}

const GRAPHIC_SIZE = { width: 128, height: 128 }

const GRAPHIC_STYLE = {
  backgroundStyle: 'white',
  pathStyle: 'black',
  pathWidth: 2,
}
