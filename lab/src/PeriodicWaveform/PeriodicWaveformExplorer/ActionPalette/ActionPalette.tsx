import React from 'react'
import { StupidButton, StupidButtonProps } from '../../shared/StupidButton'
import styles from './ActionPalette.module.css'

export const ActionPalette = (props: ActionPaletteProps) => {
  const { actions } = props
  return (
    <div className={styles.rootContainer}>
      {actions.map((actionProps) => {
        const { label, disabled, onClick } = actionProps
        return (
          <div key={label} className={styles.buttonContainer}>
            <StupidButton key={label} disabled={disabled} onClick={onClick}>
              {label}
            </StupidButton>
          </div>
        )
      })}
    </div>
  )
}

export interface ActionPaletteProps {
  actions: ActionProps[]
}

export interface ActionProps
  extends Pick<StupidButtonProps, 'disabled' | 'onClick'> {
  label: string
}
