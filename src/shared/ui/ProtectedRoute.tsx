import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/entities/user/model/authStore';

export default function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return accessToken ? <Outlet /> : <Navigate to='/login' replace />;
}
