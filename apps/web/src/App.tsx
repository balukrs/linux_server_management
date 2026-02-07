import { BrowserRouter, Routes, Route } from 'react-router'
import ReqRoutes from './configs/routes'

// Layouts
import AuthLayout from './layouts/AuthLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<ReqRoutes.Dashboard />} />

        <Route element={<AuthLayout />}>
          <Route path="login" element={<ReqRoutes.Login />} />
          <Route path="register" element={<ReqRoutes.Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
