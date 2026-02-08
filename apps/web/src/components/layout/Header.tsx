import { TextAlignJustify, Bell } from 'lucide-react'
import { Button } from '../ui/button'

import { Badge } from '@/components/ui/badge'
import ProfileIcon from './ProfileIcon'

type props = {
  isOpen: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Header = ({ isOpen, setOpen }: props) => {
  return (
    <header className="flex items-center justify-between py-4 px-4 border-b">
      <div className="flex items-center gap-3">
        <TextAlignJustify
          className="cursor-pointer"
          onClick={() => {
            setOpen(!isOpen)
          }}
        />
        <h1 className=" text-xl">Server Manager</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="relative">
          <Bell />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-2 bg-none rounded-full w-2 h-4.5"
          >
            2
          </Badge>
        </Button>
        <ProfileIcon />
      </div>
    </header>
  )
}

export default Header
