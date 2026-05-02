import { Layout, Menu, Badge } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import { menuItems } from '@/constants/menu';
import { useMyApplicationsCount } from '@/hooks/applications/useMyApplicationsCount';
import type { UserRole } from '@/types';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: myCount } = useMyApplicationsCount();

  const activeKey =
    menuItems
      .map((item) => item.key)
      .filter(
        (key) =>
          location.pathname === key ||
          location.pathname.startsWith(key + '/'),
      )
      .sort((a, b) => b.length - a.length)[0] ?? location.pathname;

  const visibleItems = menuItems
    .filter(
      (item) => !item.roles || item.roles.includes(user?.role as UserRole),
    )
    .map(({ key, icon, label }) => ({
      key,
      icon,
      label:
        key === '/applications' && myCount ? (
          <Badge count={myCount} offset={[6, -2]} size='small'>
            {label}
          </Badge>
        ) : (
          label
        ),
    }));

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      className='bg-white dark:bg-[#141414] border-r border-gray-200 dark:border-[#303030] fixed h-screen overflow-auto left-0 top-0 bottom-0'
    >
      <div className='h-16 flex items-center justify-center overflow-hidden border-b border-gray-200 dark:border-[#303030]'>
        <span className='text-gray-800 dark:text-gray-200 font-bold tracking-widest uppercase text-sm truncate px-4'>
          {collapsed ? 'GN' : 'Geonomlar'}
        </span>
      </div>
      <Menu
        mode='inline'
        selectedKeys={[activeKey]}
        onClick={({ key }) => void navigate(key)}
        items={visibleItems}
        className='border-none'
      />
    </Sider>
  );
}
