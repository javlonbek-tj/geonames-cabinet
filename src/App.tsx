import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StyleProvider } from '@ant-design/cssinjs';
import { App as AntApp, ConfigProvider, Empty, theme as antTheme } from 'antd';
import uzUZ from 'antd/locale/uz_UZ';
import AppRouter from '@/router';
import { queryClient } from '@/lib/queryClient';
import { useThemeStore } from '@/store/themeStore';

export default function App() {
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <QueryClientProvider client={queryClient}>
      <StyleProvider layer>
        <ConfigProvider
          theme={{
            algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
            token: { fontFamily: "'Inter Variable', sans-serif" },
            components: {
              Menu: isDark
                ? { itemSelectedBg: 'rgba(22, 119, 255, 0.15)', itemSelectedColor: '#4096ff' }
                : {},
            },
          }}
          locale={{ ...uzUZ, Pagination: { ...uzUZ.Pagination, items_per_page: '' } }}
          renderEmpty={() => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Ma'lumot topilmadi" />}
        >
          <AntApp>
            <AppRouter />
          </AntApp>
        </ConfigProvider>
      </StyleProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
