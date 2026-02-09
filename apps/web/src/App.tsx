import { BrowserRouter, Routes, Route } from 'react-router'
import ReqRoutes from './configs/routes'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import ProtectedLayout from './layouts/ProtectedLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout />}>
          <Route index element={<ReqRoutes.Dashboard />} />
          <Route path="/processes" element={<ReqRoutes.Processes />} />
          <Route path="/docker" element={<ReqRoutes.Docker />} />
          <Route path="/logs" element={<ReqRoutes.Logs />} />
          <Route path="/nodejs" element={<ReqRoutes.Nodejs />} />
          <Route path="/services" element={<ReqRoutes.Services />} />
          <Route path="/users" element={<ReqRoutes.Users />} />
          <Route path="/profile" element={<ReqRoutes.Profile />} />
          <Route path="/notifications" element={<ReqRoutes.Notifications />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<ReqRoutes.Login />} />
          <Route path="register" element={<ReqRoutes.Register />} />
        </Route>

        <Route path="*" element={<ReqRoutes.PageNotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
