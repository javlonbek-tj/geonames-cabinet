import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/entities/user/model/authStore';

export default function GuestRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return accessToken ? <Navigate to='/' replace /> : <Outlet />;
}
