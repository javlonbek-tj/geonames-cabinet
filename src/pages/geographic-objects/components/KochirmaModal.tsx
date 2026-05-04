import { useRef, useState } from 'react';
import { Modal, Button } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import type { GeographicObject } from '@/types';

interface Props {
  obj: GeographicObject | null;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Coat of arms — served from /public/gerb.png
// ---------------------------------------------------------------------------
function Gerb({ size = 100 }: { size?: number }) {
  return (
    <img
      src='/gerb.png'
      alt="O'zbekiston Respublikasi gerbi"
      width={size}
      height={size}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
}

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------
function Row({
  label,
  value,
  even,
}: {
  label: string;
  value?: string | null;
  even?: boolean;
}) {
  return (
    <tr>
      <td
        style={{
          padding: '11px 14px',
          fontWeight: 600,
          color: '#1e3a6e',
          width: '44%',
          borderBottom: '1px solid #e2e8f0',
          borderRight: '1px solid #cbd5e1',
          fontSize: 12.5,
          verticalAlign: 'middle',
          background: even ? '#f0f4fa' : '#f8fafc',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: '11px 14px',
          color: value ? '#111827' : '#9ca3af',
          borderBottom: '1px solid #e2e8f0',
          fontSize: 12.5,
          verticalAlign: 'middle',
          background: even ? '#f8fbff' : '#fff',
          fontStyle: value ? 'normal' : 'italic',
        }}
      >
        {value || '—'}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
export default function KochirmaModal({ obj, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const qrUrl = `${window.location.origin}/geographic-objects/${obj?.id ?? ''}`;

  const issueDate = new Date().toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const buildHtml = () => {
    const content = printRef.current;
    if (!content) return null;
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Ko'chirma — ${obj?.registryNumber ?? ''}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Times New Roman', Times, serif; background: #fff; color: #111; }
      @media print { @page { size: A4; margin: 15mm 15mm 20mm 15mm; } }
    </style>
  </head>
  <body>${content.innerHTML}</body>
</html>`;
  };

  const handlePrint = () => {
    const html = buildHtml();
    if (!html) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const handleDownload = async () => {
    const el = printRef.current;
    if (!el) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      let y = 0;
      if (imgH <= pageH) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
      } else {
        while (y < imgH) {
          pdf.addImage(imgData, 'PNG', 0, -y, imgW, imgH);
          y += pageH;
          if (y < imgH) pdf.addPage();
        }
      }
      pdf.save(`kochirma-${obj?.registryNumber ?? obj?.id ?? 'obyekt'}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      open={!!obj}
      onCancel={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>Yopish</Button>
          <Button
            icon={<DownloadOutlined />}
            loading={downloading}
            onClick={() => void handleDownload()}
          >
            Yuklab olish
          </Button>
          <Button type='primary' icon={<PrinterOutlined />} onClick={handlePrint}>
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
        <div
          style={{
            background: '#fff',
            fontFamily: "'Times New Roman', Times, serif",
            padding: '20px 36px 20px',
          }}
        >
          {/* ── Header ── */}
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <Gerb size={90} />
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#4b5563',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 3,
              }}
            >
              O&apos;zbekiston Respublikasi
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#1e3a6e',
                lineHeight: 1.25,
                maxWidth: 500,
                margin: '0 auto',
              }}
            >
              Urbanizatsiya va uy-joy bozorini barqaror rivojlantirish milliy
              qo&apos;mitasi huzuridagi Kadastr agentligining
              <br />
              Davlat kadastrlari palatasi
            </div>
          </div>

          {/* ── Divider ── */}
          <div
            style={{
              borderTop: '3px solid #1e3a6e',
              borderBottom: '1px solid #1e3a6e',
              height: 5,
              marginTop: 10,
              marginBottom: 10,
            }}
          />

          {/* ── Title ── */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#1e3a6e',
                marginBottom: 3,
                letterSpacing: '0.01em',
              }}
            >
              Geografik obyektlar nomlari davlat reyestridan
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '0.14em',
                color: '#111827',
                textTransform: 'uppercase',
              }}
            >
              Ko&apos;chirma
            </div>
          </div>

          {/* ── Data table ── */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #cbd5e1',
              marginBottom: 14,
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <tbody>
              <Row even={false} label='Geografik obyekt nomi (lotin)' value={obj?.nameUz} />
              <Row even label='Geografik obyekt nomi (kirill)' value={obj?.nameKrill} />
              <Row even={false} label='Geografik obyektning tarixiy nomi' value={obj?.historicalName} />
              <Row even label='Geografik obyekt guruhi' value={obj?.objectType?.category?.nameUz} />
              <Row even={false} label='Geografik obyekt turi' value={obj?.objectType?.nameUz} />
              <Row
                even
                label='Geografik obyekt manzili'
                value={[
                  obj?.region?.nameUz,
                  obj?.district?.nameUz,
                  obj?.affiliation ?? undefined,
                ]
                  .filter(Boolean)
                  .join(', ')}
              />
              <Row even={false} label="Ro'yxatdan o'tgan raqami" value={obj?.registryNumber} />
              <Row even label="Me'yoriy hujjat" value={obj?.basisDocument} />
            </tbody>
          </table>

          {/* ── QR code centered below table ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                border: '1.5px solid #d1d5db',
                borderRadius: 8,
                padding: 10,
                background: '#fff',
                display: 'inline-block',
              }}
            >
              <QRCodeSVG value={qrUrl} size={110} level='M' />
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', textAlign: 'center' }}>
              Tekshirish uchun QR kodni skanerlang
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              borderTop: '1.5px solid #d1d5db',
              paddingTop: 10,
            }}
          >
            <div style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>
              Berilgan sana:{' '}
              <strong>{issueDate}</strong>
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: '#6b7280',
                lineHeight: 1.5,
              }}
            >
              Ushbu ko&apos;chirma Geografik obyektlar nomlari davlat reyestridan
              rasmiy ravishda berilgan va elektron imzo bilan tasdiqlangan.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
