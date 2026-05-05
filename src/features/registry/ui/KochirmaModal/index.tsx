import { useRef, useState } from 'react';
import { Modal, Button } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import type { GeographicObject } from '@/entities/geographic-object/model/types';
import KochirmaDocument from './KochirmaDocument';
import { buildPrintHtml, downloadAsPdf } from './utils';

interface Props {
  obj: GeographicObject | null;
  onClose: () => void;
}

export default function KochirmaModal({ obj, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const qrUrl = `${window.location.origin}/geographic-objects/${obj?.id ?? ''}`;
  const d = new Date();
  const issueDate = [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('.');

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const html = buildPrintHtml(el, `Ko'chirma — ${obj?.registryNumber ?? ''}`);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'width=900,height=700');
    if (!win) return;
    win.addEventListener('load', () => {
      win.print();
      URL.revokeObjectURL(url);
    });
  };

  const handleDownload = async () => {
    const el = printRef.current;
    if (!el) return;
    setDownloading(true);
    try {
      await downloadAsPdf(
        el,
        `kochirma-${obj?.registryNumber ?? obj?.id ?? 'obyekt'}.pdf`
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      open={!!obj}
      onCancel={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Yopish</Button>
          <Button
            icon={<DownloadOutlined />}
            loading={downloading}
            onClick={() => void handleDownload()}
          >
            Yuklab olish
          </Button>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Chop etish
          </Button>
        </div>
      }
      width={720}
      title="Ko'chirma"
      styles={{ body: { padding: 0, maxHeight: '78vh', overflowY: 'auto' } }}
      centered
    >
      <div ref={printRef}>
        <KochirmaDocument obj={obj} qrUrl={qrUrl} issueDate={issueDate} />
      </div>
    </Modal>
  );
}
