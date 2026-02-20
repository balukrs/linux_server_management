import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocation, Link } from 'react-router'
import MainLogo from '../logos/MainLogo'

type props = {
  children: React.ReactNode
}

const AuthBlock = ({ children }: props) => {
  const { pathname } = useLocation()

  const isLogin = pathname === '/login'

  return (
    <Card className="bg-background min-w-sm rounded-sm border-2 border-border">
      <CardHeader>
        <CardTitle className="flex justify-center items-center gap-2 mb-2">
          <MainLogo size={22} color="black" />
          <h2 className=" text-xl font-bold">ServerSys</h2>
        </CardTitle>
        <div>
          <h2 className="text-2xl font-bold mb-0.5">{isLogin ? 'Login' : 'Register'}</h2>
          <p className="text-sm text-muted-foreground">
            {isLogin
              ? 'Enter your email below to login to your account'
              : 'Enter details to register your account'}
          </p>
        </div>
      </CardHeader>
      {children}
      <CardFooter className="flex justify-center">
        <div>
          {isLogin ? (
            <p className="text-sm">
              Don't have an account?{' '}
              <Link className="underline" to="/register">
                Register
              </Link>
            </p>
          ) : (
            <p className="text-sm">
              Already have an account?{' '}
              <Link className="underline" to="/login">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default AuthBlock
