import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { GeographicObject } from '@/entities/geographic-object/model/types';
import gerbPng from '@/shared/assets/gerb.png';
import gerbWebp from '@/shared/assets/gerb.webp';

interface Props {
  obj: GeographicObject | null;
  qrUrl: string;
  issueDate: string;
}

function Gerb() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className='w-[90px] h-[90px] relative flex items-center justify-center'>
      <img
        src={gerbWebp}
        alt=''
        className={`absolute w-[90px] h-[90px] object-contain transition-opacity duration-200 ${loaded ? 'opacity-0' : 'opacity-100'}`}
      />
      <img
        src={gerbPng}
        alt="O'zbekiston Respublikasi gerbi"
        width={90}
        height={90}
        onLoad={() => setLoaded(true)}
        className={`object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}

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
        className={`w-[44%] px-3.5 py-2.75 align-middle text-[12.5px] font-semibold text-[#1e3a6e] tracking-[0.01em] border-b border-r border-slate-300 ${even ? 'bg-[#f0f4fa]' : 'bg-[#f8fafc]'}`}
      >
        {label}
      </td>
      <td
        className={`px-3.5 py-2.75 align-middle text-[12.5px] border-b border-slate-200 ${even ? 'bg-[#f8fbff]' : 'bg-white'} ${value ? 'text-gray-900' : 'text-gray-400 italic'}`}
      >
        {value || '—'}
      </td>
    </tr>
  );
}

export default function KochirmaDocument({ obj, qrUrl, issueDate }: Props) {
  const address = [
    obj?.region?.nameUz,
    obj?.district?.nameUz,
    obj?.affiliation ?? undefined,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="bg-white px-9 py-5">
      {/* Header */}
      <div className="text-center mb-2.5">
        <div className="flex justify-center mb-2">
          <Gerb />
        </div>
        <div className="text-[13px] text-gray-600 tracking-[0.06em] uppercase mb-0.5">
          O&apos;zbekiston Respublikasi
        </div>
        <div className="text-[15px] font-bold text-[#1e3a6e] leading-tight max-w-125 mx-auto">
          Urbanizatsiya va uy-joy bozorini barqaror rivojlantirish milliy
          qo&apos;mitasi huzuridagi Kadastr agentligining
          <br />
          Davlat kadastrlari palatasi
        </div>
      </div>

      {/* Divider — dual-border requires inline style */}
      <div
        className="my-2.5"
        style={{
          borderTop: '3px solid #1e3a6e',
          borderBottom: '1px solid #1e3a6e',
          height: 5,
        }}
      />

      {/* Title */}
      <div className="text-center mb-6">
        <div className="text-[14px] font-bold text-[#1e3a6e] mb-0.5 tracking-[0.01em]">
          Geografik obyektlar nomlari davlat reyestridan
        </div>
        <div className="text-[17px] font-extrabold tracking-[0.14em] text-gray-900 uppercase">
          Ko&apos;chirma
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-slate-300 mb-3.5 rounded-md overflow-hidden">
        <tbody>
          <Row
            even={false}
            label="Geografik obyekt nomi (lotin)"
            value={obj?.nameUz}
          />
          <Row
            even
            label="Geografik obyekt nomi (kirill)"
            value={obj?.nameKrill}
          />
          <Row
            even={false}
            label="Geografik obyektning tarixiy nomi"
            value={obj?.historicalName}
          />
          <Row
            even
            label="Geografik obyekt guruhi"
            value={obj?.objectType?.category?.nameUz}
          />
          <Row
            even={false}
            label="Geografik obyekt turi"
            value={obj?.objectType?.nameUz}
          />
          <Row even label="Geografik obyekt manzili" value={address || null} />
          <Row
            even={false}
            label="Ro'yxatdan o'tgan raqami"
            value={obj?.registryNumber}
          />
          <Row even label="Me'yoriy hujjat" value={obj?.basisDocument} />
        </tbody>
      </table>

      {/* QR code */}
      <div className="flex flex-col items-end gap-1.5 mb-3.5">
        <div className="border border-gray-300 rounded-lg p-2.5 bg-white inline-block">
          <QRCodeSVG value={qrUrl} size={100} level="M" />
        </div>
        <div className="text-[10px] text-gray-500 text-center">
          Tekshirish uchun QR kodni skanerlang
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-2.5">
        <div className="text-xs text-gray-700 mb-1.5">
          Berilgan sana: <strong>{issueDate}</strong>
        </div>
        <div className="text-[10.5px] text-gray-500 leading-relaxed">
          Ushbu ko&apos;chirma Geografik obyektlar nomlari davlat reyestridan
          rasmiy ravishda berilgan va elektron imzo bilan tasdiqlangan.
        </div>
      </div>
    </div>
  );
}
