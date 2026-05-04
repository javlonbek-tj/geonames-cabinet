import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapFeatureCollection, MapFeature } from '@/api/map.api';
import { TILES, TILE_ATTRIBUTIONS, type TileKey } from '../utils/mapConstants';
import {
  buildRegionLayer,
  buildDistrictLayer,
  buildMfyLayer,
  buildStreetLayers,
  buildOtherLayer,
  partitionRegistryFeatures,
} from '../utils/mapLayerBuilders';

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !regionFeatures) return;

    if (layersRef.current.regions) {
      map.removeLayer(layersRef.current.regions);
      layersRef.current.regions = null;
    }

    const drilled = selectedRegionId !== null;
    const layer = buildRegionLayer(
      regionFeatures as GeoJSON.GeoJsonObject,
      drilled,
      onRegionClick,
    ).addTo(map);

    layersRef.current.regions = layer;
    if (!drilled) {
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [regionFeatures, selectedRegionId, onRegionClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current.districts) {
      map.removeLayer(layersRef.current.districts);
      layersRef.current.districts = null;
    }

    if (!districtFeatures || selectedRegionId === null) {
      lastFitDistrictRef.current = null;
      return;
    }

    const drilled = selectedDistrictId !== null;
    const layer = buildDistrictLayer(
      districtFeatures as GeoJSON.GeoJsonObject,
      selectedDistrictId,
      drilled,
      onDistrictClick,
    ).addTo(map);

    layersRef.current.districts = layer;
    if (!drilled) {
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [districtFeatures, selectedRegionId, selectedDistrictId, onDistrictClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current.objects) {
      map.removeLayer(layersRef.current.objects);
      layersRef.current.objects = null;
    }

    if (!registryObjects || selectedDistrictId === null) return;

    const base = registryObjects as GeoJSON.FeatureCollection;
    const toCollection = (features: GeoJSON.Feature[]) =>
      ({ ...base, features }) as GeoJSON.GeoJsonObject;

    const { mfy: mfyFeatures, streets: streetFeatures, other: otherFeatures } =
      partitionRegistryFeatures(base.features);

    const mfyLayer = buildMfyLayer(mfyFeatures, toCollection, tileKey);
    const { streetVisual, streetHit } = buildStreetLayers(
      streetFeatures,
      toCollection,
      setHoveredStreet,
    );
    const otherLayer = buildOtherLayer(otherFeatures, toCollection);

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    const options: L.TileLayerOptions = {
      attribution: TILE_ATTRIBUTIONS[tileKey],
    };
    if (tileKey === 'satellite') options.maxNativeZoom = 17;
    tileLayerRef.current = L.tileLayer(TILES[tileKey], options).addTo(map);
    tileLayerRef.current.bringToBack();
  }, [tileKey]);

  return { containerRef, tileKey, setTileKey, hoveredStreet };
}
