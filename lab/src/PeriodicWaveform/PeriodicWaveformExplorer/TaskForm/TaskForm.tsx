import React, { useMemo } from 'react'
import { ValidationError } from 'yup'
import { FormErrors, FormSchema, FormTargets } from '../../shared/Form'
import { StupidButton } from '../../shared/StupidButton'
import styles from './TaskForm.module.css'
import { TextField } from './TextField'
import { useForm } from './useForm'

export interface TaskFormProps<SomeFormSchema extends FormSchema> {
  label: string
  formSchema: SomeFormSchema
  onCancel: () => void
  onSubmit: (formValues: FormTargets<SomeFormSchema>) => void
}

export const TaskForm = <SomeFormSchema extends FormSchema>(
  props: TaskFormProps<SomeFormSchema>
) => {
  const { formSchema, label, onCancel, onSubmit } = props
  const form = useForm(formSchema)
  const sortedFieldSchemas = useMemo(
    () =>
      Object.values<FormSchema[string]>(form.schema).sort(
        (fieldSchemaA, fieldSchemaB) => fieldSchemaA.order - fieldSchemaB.order
      ),
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
              value={form.values[fieldSchema.key]}
              errorMessage={form.errors[fieldSchema.key]}
              autoFocus={fieldSchema.order === 0}
              onChange={(changeEvent) => {
                form.setValue({
                  fieldKey: changeEvent.currentTarget.name,
                  fieldValue: changeEvent.currentTarget.value,
                })
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
              form
                .validate()
                .then((validValues) => {
                  onSubmit(validValues)
                })
                .catch((validationError: ValidationError) => {
                  const nextFormErrors = validationError.inner.reduce<
                    FormErrors<SomeFormSchema>
                  >((formErrorsResult, fieldError) => {
                    const fieldKey: keyof SomeFormSchema = fieldError.path
                    formErrorsResult[fieldKey] = fieldError.message
                    return formErrorsResult
                  }, {})
                  form.setErrors(nextFormErrors)
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
