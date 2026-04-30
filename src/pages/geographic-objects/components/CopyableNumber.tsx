import { useState } from 'react';
import { Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

export default function CopyableNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <Tooltip title={copied ? 'Nusxalandi!' : 'Nusxalash'}>
      <span
        onClick={copy}
        className='inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold cursor-pointer select-none transition-colors'
        style={{
          background: copied ? '#dcfce7' : '#e8efff',
          color: copied ? '#166534' : '#1565c0',
        }}
      >
        {value}
        {copied ? (
          <CheckOutlined style={{ fontSize: 10 }} />
        ) : (
          <CopyOutlined style={{ fontSize: 10 }} />
        )}
      </span>
    </Tooltip>
  );
}
