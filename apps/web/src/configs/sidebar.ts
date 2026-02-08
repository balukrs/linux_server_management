import {
  LayoutDashboard,
  Activity,
  Server,
  Container,
  FileText,
  Hexagon,
  Users,
} from 'lucide-react'

export default [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Processes', icon: Activity, path: '/processes' },
  { name: 'Services', icon: Server, path: '/services' },
  { name: 'Docker', icon: Container, path: '/docker' },
  { name: 'Node.js', icon: Hexagon, path: 'nodejs' },
  { name: 'Logs', icon: FileText, path: '/logs' },
  { name: 'Users', icon: Users, path: '/users' },
]
