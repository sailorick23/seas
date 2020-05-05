import React from 'react'
import { WaveformGraphicProps, WaveformGraphicStyle } from '../../shared/BaseWaveformGraphic'
import { CosineTimelineGraphic } from './CosineTimelineGraphic'
import { SineTimelineGraphic } from './SineTimelineGraphic'
import { StructureGraphic } from './StructureGraphic'
import { TimeloopGraphic } from './TimeloopGraphic'
import styles from './WaveformGraphics.module.css'

export const WaveformGraphics = (props: WaveformGraphicsProps) => {
  const { graphicData } = props
  return (
    <div className={styles.rootContainer}>
      {!graphicData.length ? (
        <div className={styles.emptyWaveformNotice}>empty waveform</div>
      ) : null}
      <div className={styles.graphicsContainerA}>
        <StructureGraphic
          graphicSize={GRAPHIC_SIZE}
          graphicStyle={GRAPHIC_STYLE}
          {...props}
        />
        <div className={styles.graphicsContainerB}>
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
    </div>
  )
}

export interface WaveformGraphicsProps
  extends Pick<WaveformGraphicProps, 'graphicData'> {}

const GRAPHIC_SIZE = { width: 128, height: 128 }

const GRAPHIC_STYLE: WaveformGraphicStyle = {
  backgroundStyle: 'white',
  pathStyle: 'black',
  pathWidth: 2,
}
