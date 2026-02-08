import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type props = {
  Icon?: LucideIcon
  RenderComponent?: ReactNode
  title: string
}

const InfoCard = ({ Icon, RenderComponent, title }: props) => {
  return (
    <div className="border border-accent rounded-sm p-5 h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm text-accent-foreground">{title}</h3>
        {Icon && <Icon size={15} />}
      </div>
      {RenderComponent}
    </div>
  )
}

export default InfoCard
