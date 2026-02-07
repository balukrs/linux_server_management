import AuthBlock from '@/components/auth/AuthBlock'
import { CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Login = () => {
  return (
    <AuthBlock>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input placeholder="Enter Email" autoComplete="off" />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input placeholder="Enter Password" autoComplete="off" type="password" />
          </Field>
          <Field>
            <Button className=" w-full" type="submit">
              Login
            </Button>
          </Field>
        </FieldGroup>
      </CardContent>
    </AuthBlock>
  )
}

export default Login
