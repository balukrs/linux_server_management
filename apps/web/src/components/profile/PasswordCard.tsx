import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '../ui/button'

const PasswordCard = () => {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="text-xl">Password</CardTitle>
        <CardDescription>
          Change your password here. After saving, you'll be logged out.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Current Password</FieldLabel>
            <Input placeholder="Enter Password" autoComplete="off" type="password" />
          </Field>
          <Field>
            <FieldLabel>New Password</FieldLabel>
            <Input placeholder="Enter Password" autoComplete="off" type="password" />
          </Field>
          <Field>
            <FieldLabel>Confirm Password</FieldLabel>
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

export default PasswordCard
