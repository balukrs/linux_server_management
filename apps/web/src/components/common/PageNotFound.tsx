import { Button } from '../ui/button'
import { useNavigate } from 'react-router'

const PageNotFound = () => {
  const navigate = useNavigate()
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-[8rem] font-bold leading-none">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate('/')}>Go back home</Button>
    </div>
  )
}

export default PageNotFound
