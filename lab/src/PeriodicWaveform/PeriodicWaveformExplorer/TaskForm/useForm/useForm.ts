import { useEffect, useMemo, useState } from 'react'
import * as yup from 'yup'

export const useForm = <T extends FormSchema>(formSchema: T): Form<T> => {
  const { initialValues, validationSchema } = useMemo(
    () =>
      Object.values<FieldSchema>(formSchema).reduce<any>(
        (formValuesResult, fieldSchema) => {
          formValuesResult.initialValues[fieldSchema.key] =
            fieldSchema.initialValue
          formValuesResult.validationSchema[fieldSchema.key] =
            fieldSchema.valueSchema
          return formValuesResult
        },
        {
          initialValues: {},
          validationSchema: {},
        }
      ),
    [formSchema]
  )
  const [formValues, setFormValues] = useState(initialValues)
  const [formErrors, setFormErrors] = useState<any>({})
  useEffect(() => {
    setFormValues(initialValues)
    setFormErrors({})
  }, [initialValues])
  return {
    schema: formSchema,
    inputValues: formValues,
    validationSchema: yup.object().shape(validationSchema),
    errors: formErrors,
    setValue: (fieldKey: string, fieldValue: string) => {
      setFormValues({ ...formValues, [fieldKey]: fieldValue })
    },
    setErrors: setFormErrors,
  }
}

export const makeFormSchema = <T extends FormSchema>(formSchema: T): T =>
  formSchema

export interface FormSchema {
  [key: string]: FieldSchema
}

export type InputValues<T extends FormSchema> = {
  [K in keyof T]: T[K]['valueSchema']
}

export type TargetValues<T extends FormSchema> = {
  [K in keyof T]: ReturnType<T[K]['valueSchema']['validateSync']>
}

export interface Form<T extends FormSchema> {
  schema: T
  inputValues: InputValues<T>
  errors: any
  validationSchema: yup.Schema<TargetValues<T>>
  setValue: (fieldKey: string, fieldValue: string) => void
  setErrors: (errors: any) => void
}

type FieldVariant = 'text'

type FieldSchema = BaseFieldSchema<'text', string, number>

interface BaseFieldSchema<
  fieldVariant extends FieldVariant,
  InputValue,
  TargetValue
> {
  key: string
  name: string
  variant: fieldVariant
  initialValue: InputValue
  valueSchema: yup.Schema<TargetValue>
  label: string
  order: number
}
