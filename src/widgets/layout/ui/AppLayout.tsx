import { useState, useEffect } from 'react';
import { Layout, Button, Avatar, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useThemeStore } from '@/app/model/themeStore';
import { Outlet, useNavigate, useMatches } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/entities/user/model/authStore';
import { authApi } from '@/entities/user/api/auth.api';
import { ROLE_LABELS } from '@/shared/constants';
import { useIdleTimeout } from '@/shared/lib/useIdleTimeout';
import ChangePasswordModal from '@/features/auth/ui/ChangePasswordModal';

const { Header, Content } = Layout;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const navigate = useNavigate();

  const matches = useMatches();
  useEffect(() => {
    const match = [...matches]
      .reverse()
      .find((m) => (m.handle as { title?: string } | null)?.title);
    const pageTitle = (match?.handle as { title?: string } | null)?.title;
    document.title = pageTitle ? `${pageTitle} | Geonomlar` : 'Geonomlar';
  }, [matches]);

  const { mutate: logout } = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      void navigate('/login');
    },
  });

  useIdleTimeout(() => logout());

  const dropdownItems = [
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: "Parolni o'zgartirish",
      onClick: () => setChangePasswordOpen(true),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Chiqish',
      danger: true,
      onClick: () => logout(),
    },
  ];

  const siderWidth = collapsed ? 80 : 260;

  return (
    <Layout className='min-h-screen'>
      <Sidebar collapsed={collapsed} />
      <Layout
        style={{ marginLeft: siderWidth, transition: 'margin-left 0.2s' }}
      >
        <Header className='px-0 bg-white dark:bg-[#141414] flex items-center justify-between pr-4 border-b border-gray-200 dark:border-[#303030] sticky top-0 z-100 w-full'>
          <Button
            type='text'
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className='text-base w-16 h-16'
          />
          <div className='flex items-center gap-2'>
            <Button
              type='text'
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggle}
              className='text-base w-10 h-10'
            />
            <Dropdown
              menu={{ items: dropdownItems }}
              placement='bottomRight'
              arrow
            >
              <div className='flex items-center gap-2 cursor-pointer select-none'>
                <div className='text-right hidden sm:block'>
                  <div className='text-sm font-medium leading-tight'>
                    {user?.fullName ?? user?.username}
                  </div>
                  <div className='text-xs text-gray-400 leading-tight'>
                    {user?.role ? ROLE_LABELS[user.role] : ''}
                  </div>
                </div>
                <Avatar icon={<UserOutlined />} className='bg-[#1677ff]' />
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className='my-6 mx-4 p-6 min-h-70 bg-white dark:bg-[#141414] rounded-lg'>
          <Outlet />
        </Content>
      </Layout>
      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </Layout>
  );
}
