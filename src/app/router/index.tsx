import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import GuestRoute from '@/shared/ui/GuestRoute';
import AppLayout from '@/widgets/layout/ui/AppLayout';
import RouteErrorPage from '@/shared/ui/RouteErrorPage';
import NotFoundPage from '@/pages/not-found/NotFoundPage';

const lazy = (path: () => Promise<{ default: React.ComponentType }>) => ({
  lazy: () => path().then((m) => ({ Component: m.default })),
});

const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/login', ...lazy(() => import('@/pages/auth/LoginPage')) },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/applications" replace /> },
          {
            path: '/applications',
            handle: { title: 'Arizalar' },
            ...lazy(() => import('@/pages/applications/ApplicationsPage')),
          },
          {
            path: '/applications/:id',
            handle: { title: 'Ariza' },
            ...lazy(() => import('@/pages/applications/ApplicationDetailPage')),
          },
          {
            path: '/geographic-objects',
            handle: { title: 'Reyestr' },
            ...lazy(() => import('@/pages/geographic-objects/RegistryPage')),
          },
          {
            path: '/geographic-objects/create',
            handle: { title: 'Obyekt yaratish' },
            ...lazy(
              () =>
                import('@/pages/geographic-objects/CreateGeographicObjectPage')
            ),
          },
          {
            path: '/geographic-objects/:id',
            handle: { title: 'Geografik obyekt' },
            ...lazy(
              () =>
                import('@/pages/geographic-objects/GeographicObjectDetailPage')
            ),
          },
          {
            path: '/admin/users',
            handle: { title: 'Foydalanuvchilar' },
            ...lazy(() => import('@/pages/admin/UsersPage')),
          },
          {
            path: '/admin/object-types',
            handle: { title: 'Obyekt turlari' },
            ...lazy(() => import('@/pages/admin/ObjectTypesPage')),
          },
          {
            path: '/non-compliant',
            handle: { title: 'Muvofiq emaslar' },
            ...lazy(() => import('@/pages/non-compliant/NonCompliantPage')),
          },
          {
            path: '/map',
            handle: { title: 'Xarita' },
            ...lazy(() => import('@/pages/map/MapPage')),
          },
          { path: '*', handle: { title: 'Sahifa topilmadi' }, element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
