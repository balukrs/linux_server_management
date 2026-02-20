import AuthBlock from '@/components/auth/AuthBlock'
import { CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { extractErrorMessage } from '@/utils/error'
import { LoginRequestKeys } from '@linux-mgmt/shared'

import { login } from '@/api/services/auth'
import { useNavigate } from 'react-router'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'

const Login = () => {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: login,
    onSettled: (data) => {
      if (data?.success) {
        navigate('/')
      }
    },
  })

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        await mutateAsync(value)
        formApi.reset()
      } catch (err: unknown) {
        const { fields, validation } = extractErrorMessage(err)
        if (validation) {
          formApi.setErrorMap({ onSubmit: { fields } })
        }
      }
    },
  })

  return (
    <AuthBlock>
      <CardContent>
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name={LoginRequestKeys.email}
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Email is required'
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email'
                  return undefined
                },
              }}
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter Email"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError
                        errors={field.state.meta.errors.map((e) => ({ message: String(e) }))}
                      />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name={LoginRequestKeys.password}
              validators={{
                onChange: ({ value }) => (!value ? 'Password is required' : undefined),
              }}
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter Password"
                      autoComplete="off"
                      type="password"
                    />
                    {isInvalid && (
                      <FieldError
                        errors={field.state.meta.errors.map((e) => ({ message: String(e) }))}
                      />
                    )}
                  </Field>
                )
              }}
            />
            <Field>
              <Button
                className="w-full"
                type="submit"
                form="login-form"
                disabled={!form.state.isValid}
              >
                {isPending ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Loading...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </AuthBlock>
  )
}

export default Login
