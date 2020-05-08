import React, { useRef, useState } from 'react'
import styles from './StupidButton.module.css'

export interface StupidButtonProps
  extends Pick<
    React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    'children' | 'disabled' | 'onClick'
  > {}

export const StupidButton = (props: StupidButtonProps) => {
  const { disabled, onClick, children } = props
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [focusToggledFlag, setFocusToggledFlag] = useState(false)
  const [mouseFocused, setMouseFocused] = useState(false)
  const buttonFocusable =
    buttonRef.current !== document.activeElement && !disabled && !mouseFocused
  return (
    <button
      className={styles.stupidButton}
      ref={buttonRef}
      onBlur={() => {
        setFocusToggledFlag(!focusToggledFlag)
      }}
      onFocusCapture={
        buttonFocusable
          ? (focusEvent) => {
              focusEvent.currentTarget.focus()
              setFocusToggledFlag(!focusToggledFlag)
            }
          : undefined
      }
      onMouseDown={() => {
        setMouseFocused(true)
      }}
      onMouseUp={() => {
        setMouseFocused(false)
      }}
      disabled={disabled}
      onClick={onClick}
    >
      <div
        className={styles.childrenContainer}
        tabIndex={buttonFocusable ? 0 : -1}
      >
        {children}
      </div>
    </button>
  )
}
