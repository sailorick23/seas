import { useEffect, useMemo, useState } from 'react'
import * as Yup from 'yup'
import {
    Form, FormErrors, FormSchema, FormTargets, FormValues, FormValueSchemas
} from '../../../shared/Form'

export const useForm = <SomeFormSchema extends FormSchema>(
  formSchema: SomeFormSchema
): Form<SomeFormSchema> => {
  const { initialValues, valueSchemas, emptyFormErrors } = useMemo(
    () => ({
      initialValues: makeInitialValues(formSchema),
      valueSchemas: makeValueSchemas(formSchema),
      emptyFormErrors: {} as FormErrors<SomeFormSchema>,
    }),
    [formSchema]
  )
  const [formValues, setFormValues] = useState(initialValues)
  const [formErrors, setFormErrors] = useState(emptyFormErrors)
  useEffect(() => {
    setFormValues(initialValues)
    setFormErrors(emptyFormErrors)
  }, [initialValues, emptyFormErrors])
  return {
    schema: formSchema,
    values: formValues,
    setValue: ({ fieldKey, fieldValue }) => {
      setFormValues({ ...formValues, [fieldKey]: fieldValue })
    },
    validate: () =>
      Yup.object().shape(valueSchemas).validate(formValues, {
        abortEarly: false,
        stripUnknown: true,
      }),
    errors: formErrors,
    setErrors: setFormErrors,
  }
}

const makeInitialValues = <SomeFormSchema extends FormSchema>(
  formSchema: SomeFormSchema
): FormValues<SomeFormSchema> =>
  Object.values(formSchema).reduce<Partial<FormValues<SomeFormSchema>>>(
    (initialValuesResult, fieldSchema) => {
      const fieldKey: keyof SomeFormSchema = fieldSchema.key
      initialValuesResult[fieldKey] = fieldSchema.initialValue
      return initialValuesResult
    },
    {}
  ) as FormValues<SomeFormSchema>

const makeValueSchemas = <SomeFormSchema extends FormSchema>(
  formSchema: SomeFormSchema
): Yup.ObjectSchemaDefinition<FormTargets<SomeFormSchema>> =>
  (Object.values(formSchema).reduce<Partial<FormValueSchemas<SomeFormSchema>>>(
    (valueSchemasResult, fieldSchema) => {
      const fieldKey: keyof SomeFormSchema = fieldSchema.key
      valueSchemasResult[fieldKey] = fieldSchema.valueSchema
      return valueSchemasResult
    },
    {}
  ) as FormValueSchemas<SomeFormSchema>) as Yup.ObjectSchemaDefinition<
    FormTargets<SomeFormSchema>
  >
