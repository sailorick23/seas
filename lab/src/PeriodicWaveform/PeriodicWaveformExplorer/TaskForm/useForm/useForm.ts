import { useMemo, useState } from 'react'
import * as yup from 'yup'
import { FieldSchema, Form, FormErrors, FormSchema, FormValues } from '../../../shared/Form'

export const useForm = <SomeFormSchema extends FormSchema>(
  formSchema: SomeFormSchema
): Form<SomeFormSchema> => {
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
  const [formValues, setFormValues] = useState<FormValues<SomeFormSchema>>(
    initialValues
  )
  const [formErrors, setFormErrors] = useState<FormErrors<SomeFormSchema>>({})
  return {
    schema: formSchema,
    inputValues: formValues,
    validationSchema: yup.object().shape(validationSchema),
    errors: formErrors,
    setValue: ({ fieldKey, fieldValue }) => {
      setFormValues({ ...formValues, [fieldKey]: fieldValue })
    },
    setErrors: setFormErrors,
  }
}
