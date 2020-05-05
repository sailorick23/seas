import React, { useMemo } from 'react'
import * as yup from 'yup'
import { StupidButton } from '../../shared/StupidButton'
import styles from './TaskForm.module.css'
import { TextField } from './TextField'
import { Form, FormSchema, useForm } from './useForm'

export const TaskForm = <T extends FormSchema>(props: TaskFormProps<T>) => {
  const { formSchema, label, onCancel, onSubmit } = props
  const form = useForm(formSchema)
  const sortedFieldSchemas = useMemo(
    () => Object.values<any>(form.schema).sort((a, b) => a.order - b.order),
    [form.schema]
  )
  const fields = useMemo(
    () =>
      sortedFieldSchemas.map((fieldSchema) => {
        const {
          key,
          initialValue,
          valueSchema,
          ...textFieldProps
        } = fieldSchema
        return (
          <div key={key} className={styles.fieldContainer}>
            <TextField
              {...textFieldProps}
              value={form.inputValues[fieldSchema.key]}
              errorMessage={form.errors[fieldSchema.key]}
              autoFocus={fieldSchema.order === 0}
              onChange={(changeEvent) => {
                form.setValue(
                  changeEvent.currentTarget.name,
                  changeEvent.currentTarget.value
                )
              }}
            />
          </div>
        )
      }),
    [form, sortedFieldSchemas]
  )
  return (
    <div className={styles.rootContainer}>
      <div className={styles.label}>{label}</div>
      <div className={styles.fieldsContainer}>{fields}</div>
      <div className={styles.buttonsContainer}>
        <div className={styles.buttonContainer}>
          <StupidButton
            onClick={() => {
              form.validationSchema
                .validate(form.inputValues, {
                  abortEarly: false,
                  stripUnknown: true,
                })
                .then((validatedValues) => {
                  onSubmit(validatedValues)
                })
                .catch((validationError: yup.ValidationError) => {
                  const formErrors = validationError.inner.reduce<any>(
                    (formErrorsResult, fieldError) => {
                      formErrorsResult[fieldError.path] = fieldError.message
                      return formErrorsResult
                    },
                    {}
                  )
                  form.setErrors(formErrors)
                })
            }}
          >
            submit
          </StupidButton>
        </div>
        <div className={styles.buttonContainer}>
          <StupidButton onClick={onCancel}>cancel</StupidButton>
        </div>
      </div>
    </div>
  )
}

export interface TaskFormProps<T extends FormSchema> {
  label: string
  formSchema: T
  onCancel: () => void
  onSubmit: (
    formValues: ReturnType<Form<T>['validationSchema']['validateSync']>
  ) => void
}
