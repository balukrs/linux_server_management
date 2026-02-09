import { lazy } from 'react'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const Processes = lazy(() => import('../pages/Processes'))
const Docker = lazy(() => import('../pages/Docker'))
const Logs = lazy(() => import('../pages/Logs'))
const Nodejs = lazy(() => import('../pages/Nodejs'))
const Services = lazy(() => import('../pages/Services'))
const Users = lazy(() => import('../pages/Users'))
const Profile = lazy(() => import('../pages/Profile'))
const Notifications = lazy(() => import('../pages/Notifications'))
const PageNotFound = lazy(() => import('../components/common/PageNotFound'))

export default {
  Dashboard,
  Login,
  Register,
  Processes,
  Docker,
  Logs,
  Nodejs,
  Services,
  Users,
  Profile,
  Notifications,
  PageNotFound,
}
