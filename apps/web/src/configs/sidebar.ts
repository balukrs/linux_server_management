import {
  LayoutDashboard,
  Activity,
  Server,
  Container,
  FileText,
  Hexagon,
  Users,
  User,
  Bell,
} from 'lucide-react'

export default [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/', visble: true },
  { name: 'Processes', icon: Activity, path: '/processes', visble: true },
  { name: 'Services', icon: Server, path: '/services', visble: true },
  { name: 'Docker', icon: Container, path: '/docker', visble: true },
  { name: 'Node.js', icon: Hexagon, path: '/nodejs', visble: true },
  { name: 'Logs', icon: FileText, path: '/logs', visble: true },
  { name: 'Users', icon: Users, path: '/users', visble: true },
  { name: 'Profile', icon: User, path: '/profile', visble: false },
  { name: 'Notifications', icon: Bell, path: '/notifications', visble: false },
]
