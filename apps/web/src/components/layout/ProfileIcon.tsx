import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigate } from 'react-router'
import { me, logout } from '@/api/services/auth'
import { queryClient } from '@/lib/queryClient'
import { useQuery, useMutation } from '@tanstack/react-query'

function ProfileIcon() {
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: me,
    staleTime: 1000 * 60 * 10,
  })

  const { mutate } = useMutation({ mutationFn: logout })

  const user = data?.data

  const handleLogut = () => {
    mutate(undefined, {
      onSettled: () => {
        queryClient.clear()
        navigate('/login')
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-xs" align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex flex-col items-start">
            <p>{user?.username}</p>
            <p>{user?.email}</p>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={() => handleLogut()}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileIcon
