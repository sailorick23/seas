import { ObjectSchema, Schema } from 'yup'

export interface Form<SomeFormSchema extends FormSchema> {
  schema: SomeFormSchema
  values: FormValues<SomeFormSchema>
  setValue: FormValueSetter<SomeFormSchema>
  validate: () => ReturnType<
    ObjectSchema<FormTargets<SomeFormSchema>>['validate']
  >
  errors: FormErrors<SomeFormSchema>
  setErrors: (errors: FormErrors<SomeFormSchema>) => void
}

export interface FormSchema {
  [key: string]: FieldSchema
}

export const makeFormSchema = <SomeFormSchema extends FormSchema>(
  someFormSchema: SomeFormSchema
): SomeFormSchema => someFormSchema

export type FormSchemaFieldProperty<
  SomeFormSchema extends FormSchema,
  SomeFieldSchemaKey extends keyof FieldSchema
> = {
  [FieldKey in keyof SomeFormSchema]: FieldSchemaProperty<
    SomeFormSchema,
    FieldKey,
    SomeFieldSchemaKey
  >
}

export type FieldSchemaProperty<
  SomeFormSchema extends FormSchema,
  SomeFieldKey extends keyof SomeFormSchema,
  SomeFieldSchemaKey extends keyof SomeFormSchema[SomeFieldKey]
> = SomeFormSchema[SomeFieldKey][SomeFieldSchemaKey]

export type FormValues<
  SomeFormSchema extends FormSchema
> = FormSchemaFieldProperty<SomeFormSchema, 'initialValue'>

export type FormValueSchemas<
  SomeFormSchema extends FormSchema
> = FormSchemaFieldProperty<SomeFormSchema, 'valueSchema'>

export type FormTargets<SomeFormSchema extends FormSchema> = {
  [FieldKey in keyof SomeFormSchema]: FieldSchemaProperty<
    SomeFormSchema,
    FieldKey,
    'valueSchema'
  > extends Schema<infer SomeTargetValue>
    ? SomeTargetValue
    : never
}

export type FormErrors<SomeFormSchema extends FormSchema> = {
  [FieldKey in keyof SomeFormSchema]?: string
}

export type FormValueSetter<
  SomeFormSchema extends FormSchema,
  FieldSetterProps = {
    [FieldKey in keyof SomeFormSchema]: {
      fieldKey: FieldKey
      fieldValue: FieldSchemaProperty<SomeFormSchema, FieldKey, 'initialValue'>
    }
  }
> = (props: FieldSetterProps[keyof FieldSetterProps]) => void

export type FieldSchema = TextFieldSchema<number> | TextFieldSchema<string>

export interface TextFieldSchema<TargetValue>
  extends BaseFieldSchema<'text', string, TargetValue> {}

export const makeTextFieldSchema = <TargetValue>(
  partialFieldSchema: Pick<
    TextFieldSchema<TargetValue>,
    'key' | 'valueSchema' | 'order'
  >
): TextFieldSchema<TargetValue> => ({
  variant: 'text',
  initialValue: '',
  ...partialFieldSchema,
  name: partialFieldSchema.key,
  label: partialFieldSchema.key.replace(
    /([A-Z])/g,
    (matchedValue) => ` ${matchedValue.toLowerCase()}`
  ),
})

export interface BaseFieldSchema<
  SomeFieldVariant extends FieldVariant,
  InputValue,
  TargetValue
> {
  key: string
  name: string
  variant: SomeFieldVariant
  initialValue: InputValue
  valueSchema: Schema<TargetValue>
  label: string
  order: number
}

export type FieldVariant = 'text'
