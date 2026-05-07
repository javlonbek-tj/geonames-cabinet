import { Result, Button } from 'antd';
import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Result
        status="404"
        title="404"
        subTitle="Kechirasiz, siz izlagan sahifa topilmadi."
        extra={
          <Link to="/">
            <Button type="primary" style={{ background: '#1565c0' }}>
              Bosh sahifaga qaytish
            </Button>
          </Link>
        }
      />
    </div>
  );
}
