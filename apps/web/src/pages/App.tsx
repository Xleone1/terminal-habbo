import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getMe } from '../api/authApi'
import Landing from './Landing'
import LoginPage from './LoginPage'
import UserDashboard from './UserDashboard'
import AdminDashboard from './admin/AdminDashboard'
import AuthGuard from '../components/auth/AuthGuard'

export default function App(){
  const { token, setUser } = useAuthStore()

  useEffect(() => {
    if (token) {
      getMe(token)
        .then((data) => {
          setUser(data.user)
        })
        .catch(() => {})
}

  }, [token, setUser])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <UserDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthGuard requiredRole="admin">
              <AdminDashboard />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
