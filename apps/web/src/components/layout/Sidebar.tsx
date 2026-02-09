import MainLogo from '@/components/logos/MainLogo'
import { Link, useLocation } from 'react-router'
import sidebarconfig from '../../configs/sidebar'
import { TextAlignJustify } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

type props = {
  isOpen: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Sidebar = ({ isOpen, setOpen }: props) => {
  const { pathname } = useLocation()
  const [isTransition, setisTransition] = useState(false)
  const ismobile = useIsMobile(768)

  useEffect(() => {
    if (ismobile) setOpen(false)
  }, [ismobile, setOpen])

  return (
    <aside
      className={`${isOpen ? 'translate-x-0 w-60' : '-translate-x-full md:translate-x-0 md:w-16'} h-full py-4 bg-sidebar md:relative fixed top-0 left-0 z-50 transition-all duration-150`}
      onTransitionEnd={() => setisTransition(true)}
      onTransitionStart={() => setisTransition(false)}
    >
      <div className="flex items-center gap-2 mb-4 justify-between border-b pb-4 border-b-sidebar-border px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <MainLogo size={22} color="black" />
            {isOpen && <h1 className="text-xl">ServerSys</h1>}
          </div>
          <TextAlignJustify className="md:hidden cursor-pointer" onClick={() => setOpen(!isOpen)} />
        </div>
      </div>
      <nav className="px-2">
        {sidebarconfig
          .filter((x) => x.visble)
          .map((item) => {
            const isactive = item.path === pathname
            return (
              <div
                className={`flex gap-2 mb-4 py-2 px-2  ${isactive && 'bg-sidebar-ring/20 rounded-lg'} ${isTransition && !isOpen && 'justify-center'}`}
              >
                <Link to={item.path} className="flex gap-2">
                  <item.icon size={22} />
                  {isOpen && item.name}
                </Link>
              </div>
            )
          })}
      </nav>
    </aside>
  )
}

export default Sidebar
