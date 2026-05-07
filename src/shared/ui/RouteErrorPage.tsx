import { Button, Result } from 'antd';
import { useRouteError } from 'react-router';

export default function RouteErrorPage() {
  const error = useRouteError() as { status?: number };

  if (error?.status === 404) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Result
          status="404"
          title="404"
          subTitle="Sahifa topilmadi"
          extra={
            <Button type="primary" onClick={() => (window.location.href = '/')}>
              Bosh sahifaga
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Result
        status="error"
        title="Xatolik yuz berdi"
        subTitle="Sahifani yangilang yoki keyinroq urinib ko'ring"
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Yangilash
          </Button>
        }
      />
    </div>
  );
}
