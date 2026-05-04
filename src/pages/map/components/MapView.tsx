import { useMapLayers, type MapLayersProps } from '../hooks/useMapLayers';
import { TILES, type TileKey } from '../utils/mapConstants';

export type { MapLayersProps as MapViewProps };

export default function MapView(props: MapLayersProps) {
  const { containerRef, tileKey, setTileKey, hoveredStreet } =
    useMapLayers(props);

  return (
    <div className='relative w-full h-full' style={{ minHeight: 0 }}>
      <div ref={containerRef} className='w-full h-full' />

      {hoveredStreet && (
        <div className='absolute top-3 right-3 z-1000 pointer-events-none w-56'>
          <div className='bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-xl border border-gray-100 dark:border-[#303030] overflow-hidden'>
            <div className='h-1.5 bg-linear-to-r from-[#eab308] to-[#fde047]' />
            <div className='px-4 pt-3 pb-3.5'>
              <span className='inline-block text-[10px] font-bold text-[#ca8a04] dark:text-yellow-400 uppercase tracking-widest mb-1.5'>
                {hoveredStreet.objectType ?? "Ko'cha"}
              </span>
              <p className='text-sm font-bold text-[#0f1f3d] dark:text-gray-100 leading-snug'>
                {hoveredStreet.name || (
                  <span className='text-gray-400 dark:text-gray-500 italic font-normal'>
                    Nomi kiritilmagan
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <TileSwitcher tileKey={tileKey} onChange={setTileKey} />
    </div>
  );
}

function TileSwitcher({
  tileKey,
  onChange,
}: {
  tileKey: TileKey;
  onChange: (k: TileKey) => void;
}) {
  const options = Object.keys(TILES) as TileKey[];
  const labels: Record<TileKey, string> = {
    osm: 'Xarita',
    satellite: 'Satellite',
  };

  return (
    <div className='absolute bottom-6 right-3 z-1000 flex rounded-lg overflow-hidden shadow border border-gray-200 dark:border-[#303030] text-xs font-medium'>
      {options.map((key, i) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={[
            'px-3 py-1.5 cursor-pointer transition-colors',
            i > 0 ? 'border-l border-gray-200 dark:border-[#303030]' : '',
            tileKey === key
              ? 'bg-[#1D4ED8] text-white'
              : 'bg-white dark:bg-[#1f1f1f] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {labels[key]}
        </button>
      ))}
    </div>
  );
}
