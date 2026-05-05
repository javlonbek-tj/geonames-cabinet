import L from 'leaflet';
import type { MapFeature } from '@/features/map-view/api/map.api';
import { STYLES, MFY_COLORS, type TileKey } from './mapConstants';

type ToCollection = (features: GeoJSON.Feature[]) => GeoJSON.GeoJsonObject;

function addHover(lyr: L.Layer, style: L.PathOptions, hoverStyle: L.PathOptions) {
  lyr.on('mouseover', () => (lyr as L.Path).setStyle(hoverStyle));
  lyr.on('mouseout', () => (lyr as L.Path).setStyle(style));
}

export function partitionRegistryFeatures(features: GeoJSON.Feature[]) {
  const mfy: GeoJSON.Feature[] = [];
  const streets: GeoJSON.Feature[] = [];
  const other: GeoJSON.Feature[] = [];
  for (const f of features) {
    const p = (f as MapFeature).properties;
    if (p.isMfy) mfy.push(f);
    else if (p.isStreet) streets.push(f);
    else other.push(f);
  }
  return { mfy, streets, other };
}

export function buildRegionLayer(
  features: GeoJSON.GeoJsonObject,
  drilled: boolean,
  onRegionClick: (f: MapFeature) => void,
): L.GeoJSON {
  return L.geoJSON(features, {
    style: drilled ? STYLES.regionFaded : STYLES.region,
    onEachFeature: (feature, lyr) => {
      const f = feature as MapFeature;
      if (!drilled) {
        addHover(lyr, STYLES.region, STYLES.regionHover);
        lyr.on('click', () => onRegionClick(f));
        lyr.bindTooltip(f.properties.nameUz ?? '', {
          sticky: true,
          className: 'map-tooltip',
        });
      }
    },
  });
}

export function buildDistrictLayer(
  features: GeoJSON.GeoJsonObject,
  selectedDistrictId: number | null,
  drilled: boolean,
  onDistrictClick: (f: MapFeature) => void,
): L.GeoJSON {
  return L.geoJSON(features, {
    style: (feature) => {
      const f = feature as MapFeature;
      const isSelected = f.properties.districtDbId === selectedDistrictId;
      if (drilled)
        return isSelected ? STYLES.districtSelected : STYLES.districtFaded;
      return STYLES.district;
    },
    onEachFeature: (feature, lyr) => {
      const f = feature as MapFeature;
      const isSelected = f.properties.districtDbId === selectedDistrictId;
      const baseStyle = drilled ? STYLES.districtFaded : STYLES.district;
      if (!isSelected) addHover(lyr, baseStyle, STYLES.districtHover);
      lyr.on('click', () => onDistrictClick(f));
      lyr.bindTooltip(f.properties.nameUz ?? '', {
        permanent: !drilled,
        direction: 'center',
        className: 'map-label',
      });
    },
  });
}

export function buildMfyLayer(
  mfyFeatures: GeoJSON.Feature[],
  toCollection: ToCollection,
  tileKey: TileKey,
): L.GeoJSON {
  const color = MFY_COLORS[tileKey];
  const style = { ...STYLES.mfy, color };
  const hoverStyle = { ...STYLES.mfyHover, color };

  return L.geoJSON(toCollection(mfyFeatures), {
    style,
    pointToLayer: (_f, latlng) =>
      L.circleMarker(latlng, { radius: 5, color, fillOpacity: 0.7 }),
    onEachFeature: (feature, lyr) => {
      const f = feature as MapFeature;
      addHover(lyr, style, hoverStyle);
      if (f.properties.nameUz) {
        lyr.bindTooltip(`${f.properties.nameUz} MFY`, {
          permanent: true,
          direction: 'center',
          className: 'map-label',
        });
      }
    },
  });
}

export function buildStreetLayers(
  streetFeatures: GeoJSON.Feature[],
  toCollection: ToCollection,
  onHover: (data: { name: string; objectType: string | null } | null) => void,
): { streetVisual: L.GeoJSON; streetHit: L.GeoJSON } {
  const streetVisualMap = new Map<number, L.Path>();

  const streetVisual = L.geoJSON(toCollection(streetFeatures), {
    style: STYLES.street,
    interactive: false,
    onEachFeature: (feature, lyr) => {
      const f = feature as MapFeature;
      streetVisualMap.set(f.properties.id, lyr as L.Path);
      if (f.properties.nameUz) {
        lyr.bindTooltip(
          [f.properties.nameUz, f.properties.objectType?.toLowerCase()]
            .filter(Boolean)
            .join(' '),
          {
            permanent: true,
            direction: 'center',
            className: 'map-street-label',
          },
        );
      }
    },
  });

  const streetHit = L.geoJSON(toCollection(streetFeatures), {
    style: { color: '#000', weight: 14, opacity: 0.001, fillOpacity: 0 },
    onEachFeature: (feature, lyr) => {
      const f = feature as MapFeature;
      const id = f.properties.id;
      lyr.on('mouseover', () => {
        streetVisualMap
          .get(id)
          ?.setStyle({ ...STYLES.street, weight: 4, opacity: 1 });
        onHover({
          name: f.properties.nameUz ?? '',
          objectType: f.properties.objectType ?? null,
        });
      });
      lyr.on('mouseout', () => {
        streetVisualMap.get(id)?.setStyle(STYLES.street);
        onHover(null);
      });
    },
  });

  return { streetVisual, streetHit };
}

export function buildOtherLayer(
  otherFeatures: GeoJSON.Feature[],
  toCollection: ToCollection,
): L.GeoJSON {
  return L.geoJSON(toCollection(otherFeatures), {
    style: STYLES.registry,
    pointToLayer: (_f, latlng) =>
      L.circleMarker(latlng, {
        radius: 6,
        color: STYLES.registry.color,
        fillOpacity: 0.6,
      }),
    onEachFeature: (feature, lyr) => {
      const f = feature as MapFeature;
      addHover(lyr, STYLES.registry, STYLES.registryHover);
      if (f.properties.nameUz) {
        lyr.bindTooltip(
          [f.properties.nameUz, f.properties.objectType]
            .filter(Boolean)
            .join(' — '),
          { sticky: true, className: 'map-tooltip' },
        );
      }
    },
  });
}
