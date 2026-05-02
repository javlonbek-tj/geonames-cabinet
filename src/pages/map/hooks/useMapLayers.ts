import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapFeatureCollection, MapFeature } from '@/api/map.api';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TILES = {
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
} as const;

export type TileKey = keyof typeof TILES;

const TILE_ATTRIBUTIONS: Record<TileKey, string> = {
  osm: '© OpenStreetMap',
  satellite: '© Esri, Maxar, Earthstar Geographics',
};

const BORDER = '#0000FF';

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

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface MapLayersProps {
  regionFeatures: MapFeatureCollection | undefined;
  districtFeatures: MapFeatureCollection | undefined;
  registryObjects: MapFeatureCollection | undefined;
  onRegionClick: (feature: MapFeature) => void;
  onDistrictClick: (feature: MapFeature) => void;
  selectedRegionId: number | null;
  selectedDistrictId: number | null;
}

export function useMapLayers({
  regionFeatures,
  districtFeatures,
  registryObjects,
  onRegionClick,
  onDistrictClick,
  selectedRegionId,
  selectedDistrictId,
}: MapLayersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layersRef = useRef<{
    regions: L.GeoJSON | null;
    districts: L.GeoJSON | null;
    objects: L.LayerGroup | null;
  }>({ regions: null, districts: null, objects: null });
  const lastFitDistrictRef = useRef<number | null>(null);

  const [tileKey, setTileKey] = useState<TileKey>('satellite');
  const [hoveredStreet, setHoveredStreet] = useState<{
    name: string;
    objectType: string | null;
  } | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [41.3, 63.5],
      zoom: 6,
      zoomControl: true,
      attributionControl: false,
    });

    tileLayerRef.current = L.tileLayer(TILES.osm, {
      attribution: TILE_ATTRIBUTIONS.osm,
    }).addTo(map);

    const updateZoomClass = () => {
      containerRef.current?.classList.toggle(
        'zoom-street-labels',
        map.getZoom() >= 16,
      );
    };
    map.on('zoomend', updateZoomClass);
    updateZoomClass();

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Region layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !regionFeatures) return;

    if (layersRef.current.regions) {
      map.removeLayer(layersRef.current.regions);
      layersRef.current.regions = null;
    }

    const drilled = selectedRegionId !== null;

    const layer = L.geoJSON(regionFeatures as GeoJSON.GeoJsonObject, {
      style: drilled ? STYLES.regionFaded : STYLES.region,
      onEachFeature: (feature, lyr) => {
        const f = feature as MapFeature;
        if (!drilled) {
          lyr.on('mouseover', () =>
            (lyr as L.Path).setStyle(STYLES.regionHover),
          );
          lyr.on('mouseout', () => (lyr as L.Path).setStyle(STYLES.region));
          lyr.on('click', () => onRegionClick(f));
          lyr.bindTooltip(f.properties.nameUz ?? '', {
            sticky: true,
            className: 'map-tooltip',
          });
        }
      },
    }).addTo(map);

    layersRef.current.regions = layer;

    if (!drilled) {
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [regionFeatures, selectedRegionId, onRegionClick]);

  // District layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current.districts) {
      map.removeLayer(layersRef.current.districts);
      layersRef.current.districts = null;
    }

    if (!districtFeatures || selectedRegionId === null) return;

    const drilled = selectedDistrictId !== null;

    const layer = L.geoJSON(districtFeatures as GeoJSON.GeoJsonObject, {
      style: (feature) => {
        const f = feature as MapFeature;
        const isSelected = f.properties.districtDbId === selectedDistrictId;
        if (drilled) {
          return isSelected ? STYLES.districtSelected : STYLES.districtFaded;
        }
        return STYLES.district;
      },
      onEachFeature: (feature, lyr) => {
        const f = feature as MapFeature;
        const isSelected = f.properties.districtDbId === selectedDistrictId;

        lyr.on('mouseover', () => {
          if (!isSelected) (lyr as L.Path).setStyle(STYLES.districtHover);
        });
        lyr.on('mouseout', () => {
          if (!isSelected) {
            (lyr as L.Path).setStyle(
              drilled ? STYLES.districtFaded : STYLES.district,
            );
          }
        });
        lyr.on('click', () => onDistrictClick(f));
        lyr.bindTooltip(f.properties.nameUz ?? '', {
          permanent: !drilled,
          direction: 'center',
          className: 'map-label',
        });
      },
    }).addTo(map);

    layersRef.current.districts = layer;

    if (!drilled) {
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [districtFeatures, selectedRegionId, selectedDistrictId, onDistrictClick]);

  // Objects layer (MFY + streets + extra)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current.objects) {
      map.removeLayer(layersRef.current.objects);
      layersRef.current.objects = null;
    }

    if (!registryObjects || selectedDistrictId === null) return;

    const mfyColor = tileKey === 'satellite' ? '#67e8f9' : STYLES.mfy.color;
    const mfyStyle = { ...STYLES.mfy, color: mfyColor };
    const mfyHoverStyle = { ...STYLES.mfyHover, color: mfyColor };

    const base = registryObjects as GeoJSON.FeatureCollection;
    const toCollection = (features: GeoJSON.Feature[]) =>
      ({ ...base, features }) as GeoJSON.GeoJsonObject;

    const mfyFeatures = base.features.filter(
      (f) => (f as MapFeature).properties.isMfy,
    );
    const streetFeatures = base.features.filter(
      (f) => (f as MapFeature).properties.isStreet,
    );
    const otherFeatures = base.features.filter((f) => {
      const p = (f as MapFeature).properties;
      return !p.isMfy && !p.isStreet;
    });

    const mfyLayer = L.geoJSON(toCollection(mfyFeatures), {
      style: mfyStyle,
      pointToLayer: (_f, latlng) =>
        L.circleMarker(latlng, { radius: 5, color: mfyColor, fillOpacity: 0.7 }),
      onEachFeature: (feature, lyr) => {
        const f = feature as MapFeature;
        lyr.on('mouseover', () => (lyr as L.Path).setStyle(mfyHoverStyle));
        lyr.on('mouseout', () => (lyr as L.Path).setStyle(mfyStyle));
        if (f.properties.nameUz) {
          lyr.bindTooltip(`${f.properties.nameUz} MFY`, {
            permanent: true,
            direction: 'center',
            className: 'map-label',
          });
        }
      },
    });

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
            { permanent: true, direction: 'center', className: 'map-street-label' },
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
          setHoveredStreet({
            name: f.properties.nameUz ?? '',
            objectType: f.properties.objectType ?? null,
          });
        });
        lyr.on('mouseout', () => {
          streetVisualMap.get(id)?.setStyle(STYLES.street);
          setHoveredStreet(null);
        });
      },
    });

    const otherLayer = L.geoJSON(toCollection(otherFeatures), {
      style: STYLES.registry,
      pointToLayer: (_f, latlng) =>
        L.circleMarker(latlng, {
          radius: 6,
          color: STYLES.registry.color,
          fillOpacity: 0.6,
        }),
      onEachFeature: (feature, lyr) => {
        const f = feature as MapFeature;
        lyr.on('mouseover', () =>
          (lyr as L.Path).setStyle(STYLES.registryHover),
        );
        lyr.on('mouseout', () => (lyr as L.Path).setStyle(STYLES.registry));
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

    const group = L.layerGroup([
      otherLayer,
      streetVisual,
      mfyLayer,
      streetHit,
    ]).addTo(map);

    layersRef.current.objects = group;

    if (selectedDistrictId !== lastFitDistrictRef.current) {
      lastFitDistrictRef.current = selectedDistrictId;
      const bounds = L.latLngBounds([]);
      if (mfyLayer.getBounds().isValid()) bounds.extend(mfyLayer.getBounds());
      if (streetVisual.getBounds().isValid())
        bounds.extend(streetVisual.getBounds());
      if (bounds.isValid())
        map.fitBounds(bounds, { padding: [16, 16], maxZoom: 14 });
    }
  }, [registryObjects, selectedDistrictId, tileKey]);

  // Tile layer switch
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    const options: L.TileLayerOptions = { attribution: TILE_ATTRIBUTIONS[tileKey] };
    if (tileKey === 'satellite') options.maxNativeZoom = 17;
    tileLayerRef.current = L.tileLayer(TILES[tileKey], options).addTo(map);
    tileLayerRef.current.bringToBack();
  }, [tileKey]);

  // Cleanup on drill-back
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedRegionId === null) {
      if (layersRef.current.districts) {
        map.removeLayer(layersRef.current.districts);
        layersRef.current.districts = null;
      }
      if (layersRef.current.objects) {
        map.removeLayer(layersRef.current.objects);
        layersRef.current.objects = null;
      }
    }
    if (selectedDistrictId === null && layersRef.current.objects) {
      map.removeLayer(layersRef.current.objects);
      layersRef.current.objects = null;
    }
  }, [selectedRegionId, selectedDistrictId]);

  return { containerRef, tileKey, setTileKey, hoveredStreet };
}
