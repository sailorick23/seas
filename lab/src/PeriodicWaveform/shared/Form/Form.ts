import { ObjectSchema, Schema } from 'yup'

export interface Form<SomeFormSchema extends FormSchema> {
  schema: SomeFormSchema
  inputValues: FormValues<SomeFormSchema>
  setValue: FormValueSetter<SomeFormSchema>
  validationSchema: ObjectSchema<FormTargets<SomeFormSchema>>
  errors: FormErrors<SomeFormSchema>
  setErrors: (errors: FormErrors<SomeFormSchema>) => void
}

export interface FormSchema {
  [key: string]: FieldSchema
}

export const makeFormSchema = <SomeFormSchema extends FormSchema>(
  formSchema: SomeFormSchema
): SomeFormSchema => formSchema

export type FormValues<SomeFormSchema extends FormSchema> = {
  [FieldKey in keyof SomeFormSchema]: SomeFormSchema[FieldKey]['valueSchema']
}

export type FormErrors<SomeFormSchema extends FormSchema> = {
  [FieldKey in keyof SomeFormSchema]?: string
}

export type FormTargets<SomeFormSchema extends FormSchema> = {
  [FieldKey in keyof SomeFormSchema]: ReturnType<
    SomeFormSchema[FieldKey]['valueSchema']['validateSync']
  >
}

export type FormValueSetter<
  SomeFormSchema extends FormSchema,
  FieldSetterProps = {
    [FieldKey in keyof SomeFormSchema]: {
      fieldKey: FieldKey
      fieldValue: SomeFormSchema[FieldKey]['initialValue']
    }
  },
  FieldSetterPropsUnion = FieldSetterProps[keyof FieldSetterProps]
> = (props: FieldSetterPropsUnion) => void

export type FieldSchema = TextFieldSchema<number>

export interface TextFieldSchema<TargetValue>
  extends BaseFieldSchema<'text', string, TargetValue> {}

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
