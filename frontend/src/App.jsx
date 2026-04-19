import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ToastContainer from './components/ToastNotification'

// User Pages
import Portal        from './pages/Portal'
import Home          from './pages/user/Home'
import LostItems     from './pages/user/LostItems'
import FoundItems    from './pages/user/FoundItems'
import HowItWorks    from './pages/user/HowItWorks'
import UserLogin     from './pages/user/Login'
import UserRegister  from './pages/user/Register'
import ReportItem    from './pages/user/ReportItem'
import ItemDetail    from './pages/user/ItemDetail'
import UserDashboard from './pages/user/Dashboard'

// Admin Pages
import AdminLogin     from './pages/admin/AdminLogin'
import AdminLayout    from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLostItems  from './pages/admin/AdminLostItems'
import AdminFoundItems from './pages/admin/AdminFoundItems'
import AdminClaims    from './pages/admin/AdminClaims'
import AdminUsers     from './pages/admin/AdminUsers'
import AdminReports   from './pages/admin/AdminReports'

// Guards
const UserRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/user/login" replace />
}

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken')
  return token ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      {/* 🎯 Global Toast — displays center-screen notifications */}
      <ToastContainer />

      <Routes>
        {/* Portal chooser */}
        <Route path="/"             element={<Portal />} />

        {/* User Auth */}
        <Route path="/user/login"    element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />

        {/* User Portal */}
        <Route path="/user"          element={<Home />} />
        <Route path="/user/lost"     element={<LostItems />} />
        <Route path="/user/found"    element={<FoundItems />} />
        <Route path="/user/how"      element={<HowItWorks />} />
        <Route path="/user/item/:id" element={<ItemDetail />} />
        <Route path="/user/report"   element={<UserRoute><ReportItem /></UserRoute>} />
        <Route path="/user/dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />

        {/* Admin Auth */}
        <Route path="/admin/login"   element={<AdminLogin />} />

        {/* Admin Portal */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index              element={<AdminDashboard />} />
          <Route path="lost"        element={<AdminLostItems />} />
          <Route path="found"       element={<AdminFoundItems />} />
          <Route path="claims"      element={<AdminClaims />} />
          <Route path="users"       element={<AdminUsers />} />
          <Route path="reports"     element={<AdminReports />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}