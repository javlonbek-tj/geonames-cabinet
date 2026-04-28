import type { GeoJSON, GeographicObject } from '@/types';

export function extractRawGeometry(geometry: GeoJSON): GeoJSON | null {
  if (!geometry) return null;
  if (geometry.type === 'Feature') return geometry.geometry ?? null;
  if (geometry.type === 'FeatureCollection') return geometry;
  return geometry;
}

export function buildFeatureCollection(
  objects: GeographicObject[],
): GeoJSON | null {
  const features = objects
    .filter((o) => o.geometry)
    .map((o) => ({
      type: 'Feature',
      properties: {
        name: o.nameUz ?? null,
        objectType: o.objectType?.nameUz ?? null,
        category: o.objectType?.category?.nameUz ?? null,
      },
      geometry: extractRawGeometry(o.geometry as GeoJSON),
    }))
    .filter((f) => f.geometry !== null);
  if (features.length === 0) return null;
  return { type: 'FeatureCollection', features };
}
