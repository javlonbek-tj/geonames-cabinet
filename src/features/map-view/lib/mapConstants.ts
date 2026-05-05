export const TILES = {
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
} as const;

export type TileKey = keyof typeof TILES;

export const TILE_ATTRIBUTIONS: Record<TileKey, string> = {
  osm: '© OpenStreetMap',
  satellite: '© Esri, Maxar, Earthstar Geographics',
};

const BORDER = '#0000FF';

export const MFY_COLORS: Record<TileKey, string> = {
  satellite: '#67e8f9',
  osm: '#06b6d4',
};

export const STYLES = {
  region: { color: BORDER, weight: 2.5, opacity: 1, fillOpacity: 0 },
  regionHover: { color: BORDER, weight: 4, opacity: 1, fillOpacity: 0 },
  regionFaded: { color: BORDER, weight: 1, opacity: 0.3, fillOpacity: 0 },
  district: { color: BORDER, weight: 2, opacity: 1, fillOpacity: 0 },
  districtHover: { color: BORDER, weight: 3.5, opacity: 1, fillOpacity: 0 },
  districtFaded: { color: BORDER, weight: 1, opacity: 0.25, fillOpacity: 0 },
  districtSelected: { color: BORDER, weight: 3, opacity: 1, fillOpacity: 0.06 },
  mfy: { color: '#06b6d4', weight: 2.5, opacity: 1, fillOpacity: 0 },
  mfyHover: { color: '#0891b2', weight: 4, opacity: 1, fillOpacity: 0 },
  street: { color: '#eab308', weight: 2, opacity: 0.9 },
  registry: { color: '#16a34a', weight: 2, opacity: 0.85, fillOpacity: 0.15 },
  registryHover: { color: '#15803d', weight: 3, opacity: 1, fillOpacity: 0.28 },
} as const;
