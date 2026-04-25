import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StyleProvider } from '@ant-design/cssinjs';
import { App as AntApp, ConfigProvider, Empty } from 'antd';
import uzUZ from 'antd/locale/uz_UZ';
import AppRouter from '@/router';
import { queryClient } from '@/lib/queryClient';

const theme = {
  token: {
    fontFamily: "'Inter Variable', sans-serif",
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StyleProvider layer>
        <ConfigProvider
          theme={theme}
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
