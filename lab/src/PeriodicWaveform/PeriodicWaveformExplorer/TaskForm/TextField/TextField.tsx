import React from 'react'
import styles from './TextField.module.css'

export const TextField = (props: TextFieldProps) => {
  const { label, errorMessage, ...inputProps } = props
  return (
    <div className={styles.rootContainer}>
      <div className={styles.label}>{label}</div>
      <div className={styles.inputContainer}>
        <input {...inputProps} />
      </div>
      <div className={styles.errorMessage}>{errorMessage}</div>
    </div>
  )
}

export interface TextFieldProps
  extends Pick<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    'autoFocus' | 'name' | 'value' | 'onChange'
  > {
  label: string
  errorMessage?: string
}
