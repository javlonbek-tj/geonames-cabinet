import type { GeoJSON, GeographicObject } from '@/types';

export function downloadApplicationGeoJson(
  applicationNumber: string,
  geoObjects: GeographicObject[],
): void {
  const features = geoObjects
    .filter((o) => o.geometry)
    .map((o) => ({
      type: 'Feature',
      properties: {
        id: o.id,
        name_uz: o.nameUz ?? null,
        name_krill: o.nameKrill ?? null,
        object_type_id: o.objectTypeId ?? null,
        object_type: o.objectType?.nameUz ?? null,
        registry_number: o.registryNumber ?? null,
        exists_in_registry: o.existsInRegistry,
        region: o.region?.nameUz ?? null,
        district: o.district?.nameUz ?? null,
      },
      geometry: extractRawGeometry(o.geometry as GeoJSON),
    }));
  const blob = new Blob(
    [JSON.stringify({ type: 'FeatureCollection', features }, null, 2)],
    { type: 'application/geo+json' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${applicationNumber}.geojson`;
  a.click();
  URL.revokeObjectURL(url);
}

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
