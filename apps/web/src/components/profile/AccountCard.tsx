import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '../ui/button'

const AccountCard = () => {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="text-xl">Account</CardTitle>
        <CardDescription>
          Make changes to your account here. Click save when you're done.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input placeholder="Enter Username" autoComplete="off" />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input placeholder="Enter Password" autoComplete="off" type="password" />
          </Field>
          <Field>
            <Button className=" w-full" type="submit">
              Save Changes
            </Button>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

export default AccountCard
