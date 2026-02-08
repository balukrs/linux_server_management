import { Command } from 'lucide-react'

type Props = {
  size: number
  color: string
}

const MainLogo = ({ size, color }: Props) => {
  return (
    <div className="bg-primary inline-flex w-9 h-9 justify-center items-center rounded-md">
      <Command size={size} color={color} />
    </div>
  )
}

export default MainLogo
