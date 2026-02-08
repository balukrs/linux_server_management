import { useEffect, useMemo, useState } from 'react'

export function useIsMobile(breakpoint: number) {
  const mql = useMemo(() => window.matchMedia(`(max-width: ${breakpoint - 1}px)`), [breakpoint])

  const [isMobile, setIsMobile] = useState(mql.matches)

  useEffect(() => {
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)

    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [mql])

  return isMobile
}
