import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PasswordCard from '@/components/profile/PasswordCard'
import AccountCard from '@/components/profile/AccountCard'

const Profile = () => {
  const [tab, setTab] = useState<'account' | 'password'>('account')
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div>
          <Avatar className="w-20 h-20">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" className="grayscale" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-xl font-semibold leading-none tracking-tight">Admin User</h2>
          <p className="text-sm text-muted-foreground font-light">admin@example.com</p>
          <Badge>Administrator</Badge>
        </div>
      </div>
      <Tabs
        defaultValue="account"
        className="mb-4"
        onValueChange={(val) => setTab(val as 'account' | 'password')}
      >
        <TabsList variant="line">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="max-w-lg md:max-w-2xl">
        {tab === 'account' ? <AccountCard /> : <PasswordCard />}
      </div>
    </div>
  )
}

export default Profile
