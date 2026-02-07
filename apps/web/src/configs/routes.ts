import { lazy } from 'react'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))

export default { Dashboard, Login, Register }
