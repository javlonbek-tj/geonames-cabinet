import { useState } from 'react';
import { useUpdateObjectNames } from '@/hooks/geographic-objects/useUpdateObjectNames';
import { latinToKrill } from '@/lib/transliterate';
import type { GeographicObject } from '@/types';

export function useNameEdits(geoObjects: GeographicObject[], appId: number) {
  const [nameEdits, setNameEdits] = useState<
    Record<number, { nameUz: string; nameKrill: string }>
  >({});
  const [krillManual, setKrillManual] = useState<Record<number, boolean>>({});
  const { mutate: saveNames, isPending: isSavingNames } =
    useUpdateObjectNames(appId);

  const getEdit = (geo: GeographicObject) =>
    nameEdits[geo.id] ?? {
      nameUz: geo.nameUz ?? '',
      nameKrill: geo.nameKrill ?? '',
    };

  const updateNameUz = (geo: GeographicObject, value: string) => {
    setNameEdits((prev) => {
      const current = prev[geo.id] ?? {
        nameUz: geo.nameUz ?? '',
        nameKrill: geo.nameKrill ?? '',
      };
      const nameKrill = krillManual[geo.id]
        ? current.nameKrill
        : latinToKrill(value);
      return { ...prev, [geo.id]: { ...current, nameUz: value, nameKrill } };
    });
  };

  const updateNameKrill = (geo: GeographicObject, value: string) => {
    setKrillManual((prev) => ({ ...prev, [geo.id]: true }));
    setNameEdits((prev) => {
      const current = prev[geo.id] ?? {
        nameUz: geo.nameUz ?? '',
        nameKrill: geo.nameKrill ?? '',
      };
      return { ...prev, [geo.id]: { ...current, nameKrill: value } };
    });
  };

  const handleSaveNames = () => {
    const objects = geoObjects.map((geo) => {
      const edit = getEdit(geo);
      return {
        id: geo.id,
        nameUz: edit.nameUz.trim(),
        nameKrill: edit.nameKrill.trim() || undefined,
        objectTypeId: geo.objectTypeId!,
      };
    });
    saveNames(objects, {
      onSuccess: () => {
        setNameEdits({});
        setKrillManual({});
      },
    });
  };

  const hasUnsavedEdits = Object.keys(nameEdits).length > 0;
  const allNamed = geoObjects
    .filter((o) => o.existsInRegistry === false)
    .every((o) => {
      const edit = getEdit(o);
      return edit.nameUz.trim().length > 0 && edit.nameKrill.trim().length > 0;
    });

  return {
    getEdit,
    updateNameUz,
    updateNameKrill,
    handleSaveNames,
    isSavingNames,
    hasUnsavedEdits,
    allNamed,
  };
}
