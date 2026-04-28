import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Tag, Typography, Space, Spin, Empty } from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  ExpandOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import GeoJsonMap from '@/components/map/GeoJsonMap';
import {
  useApplication,
  useAvailableActions,
} from '@/hooks/applications/useApplication';
import { useDocuments } from '@/hooks/uploads/useDocuments';
import { useDiscussionResults } from '@/hooks/public/usePublicDiscussion';
import { useAuthStore } from '@/store/authStore';
import { ROLES } from '@/types/user';
import { STATUS_LABELS, STATUS_COLORS } from '@/constants';
import { buildFeatureCollection, extractRawGeometry } from '@/lib/geoUtils';
import { useNameEdits } from './hooks/useNameEdits';
import ApplicationInfoCard from './components/ApplicationInfoCard';
import GeoObjectsTable from './components/GeoObjectsTable';
import ApplicationHistory from './components/ApplicationHistory';
import DiscussionResultsCard from './components/DiscussionResultsCard';
import CommissionPanel from './components/CommissionPanel';
import ApplicationActions from './components/ApplicationActions';
import DocumentsCard from './components/DocumentsCard';
import type { ApplicationStatus, GeoJSON } from '@/types';

const { Title } = Typography;

const DISCUSSION_VISIBLE_STATUSES: ApplicationStatus[] = [
  'step_2_1_district_commission',
  'step_2_2_regional_commission',
  'step_3_regional_hokimlik',
  'step_4_kadastr_agency',
  'step_5_dkp_central',
  'step_6_kadastr_agency_final',
  'step_7_regional_hokimlik',
  'step_8_district_hokimlik',
  'completed',
];

const FLAG_VISIBLE_STATUSES: ApplicationStatus[] = [
  'step_6_kadastr_agency_final',
  'step_7_regional_hokimlik',
  'step_8_district_hokimlik',
  'completed',
];

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appId = Number(id);
  const user = useAuthStore((s) => s.user);

  const { data: app, isLoading } = useApplication(appId);
  const { data: actions = [] } = useAvailableActions(appId);
  const { data: documents = [] } = useDocuments(appId);

  const geoObjects = useMemo(() => app?.geographicObjects ?? [], [app]);
  const nameEdits = useNameEdits(geoObjects, appId);

  const [activeGeoIdx, setActiveGeoIdx] = useState<number | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);

  const isCommissionStep =
    app?.currentStatus === 'step_2_1_district_commission';
  const isDiscussionStep = app?.currentStatus === 'step_2_public_discussion';
  const hasDiscussion =
    isDiscussionStep ||
    (!!app?.currentStatus &&
      DISCUSSION_VISIBLE_STATUSES.includes(app.currentStatus));

  const { data: discussionResults } = useDiscussionResults(
    appId,
    hasDiscussion,
  );

  const isKadastrFlagStep =
    app?.currentStatus === 'step_5_dkp_central' &&
    user?.role === ROLES.DKP_CENTRAL;
  const canViewFlags =
    !isKadastrFlagStep &&
    !!app?.currentStatus &&
    FLAG_VISIBLE_STATUSES.includes(app.currentStatus);

  const canEnterNames =
    user?.role === ROLES.DISTRICT_HOKIMLIK &&
    app?.currentStatus === 'step_2_district_hokimlik' &&
    geoObjects.some((o) => o.existsInRegistry === false);

  const needsDocumentUpload =
    user?.role === ROLES.DISTRICT_HOKIMLIK &&
    app?.currentStatus === 'step_8_district_hokimlik' &&
    !documents.some((d) => d.uploader?.id === user?.id);

  const actionsBlocked =
    (canEnterNames && (!nameEdits.allNamed || nameEdits.hasUnsavedEdits)) ||
    needsDocumentUpload;

  const canDownloadGeoJson =
    user?.role === ROLES.DKP_REGIONAL || user?.role === ROLES.DKP_CENTRAL;

  const mapGeojson = useMemo(
    () => buildFeatureCollection(geoObjects),
    [geoObjects],
  );

  const handleDownloadGeoJson = () => {
    if (!app) return;
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
    a.download = `${app.applicationNumber}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spin size='large' />
      </div>
    );
  }
  if (!app) return <Empty description='Ariza topilmadi' />;

  return (
    <div className='flex flex-col gap-4'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Button
          type='text'
          icon={<ArrowLeftOutlined />}
          onClick={() => void navigate('/applications')}
        />
        <Title level={4} className='m-0'>
          {app.applicationNumber}
        </Title>
        <Tag color={STATUS_COLORS[app.currentStatus as ApplicationStatus]}>
          {STATUS_LABELS[app.currentStatus as ApplicationStatus]}
        </Tag>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Chap ustun */}
        <div className='lg:col-span-2 flex flex-col gap-4'>
          <ApplicationInfoCard app={app} geoObjects={geoObjects} />

          <GeoObjectsTable
            geoObjects={geoObjects}
            appId={appId}
            canEnterNames={canEnterNames}
            isKadastrFlagStep={isKadastrFlagStep}
            canViewFlags={canViewFlags}
            activeGeoIdx={activeGeoIdx}
            onActiveChange={setActiveGeoIdx}
            nameEdits={nameEdits}
          />

          {mapGeojson && (
            <div className='overflow-hidden rounded-lg border border-gray-200'>
              <div className='flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200'>
                <span className='text-sm font-medium text-gray-700'>
                  Xaritada ko&apos;rish
                </span>
                <Space size={8}>
                  {canDownloadGeoJson && (
                    <Button
                      size='small'
                      icon={<DownloadOutlined />}
                      onClick={handleDownloadGeoJson}
                    >
                      GeoJSON yuklab olish
                    </Button>
                  )}
                  <button
                    onClick={() => setMapFullscreen(true)}
                    className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border border-[#d1d9e8] bg-white hover:bg-gray-50 transition-colors'
                    style={{ color: '#1565c0' }}
                  >
                    <ExpandOutlined style={{ fontSize: 12 }} />
                    To&apos;liq ekran
                  </button>
                </Space>
              </div>
              <GeoJsonMap
                geojson={mapGeojson}
                height='380px'
                highlightedIndex={activeGeoIdx}
              />
            </div>
          )}

          <ApplicationHistory
            history={app.history ?? []}
            currentStatus={app.currentStatus as ApplicationStatus}
          />
        </div>

        {/* O'ng ustun */}
        <div className='flex flex-col gap-4'>
          {discussionResults && (
            <DiscussionResultsCard
              results={discussionResults}
              isDiscussionStep={isDiscussionStep}
            />
          )}

          <CommissionPanel appId={appId} isCommissionStep={isCommissionStep} />

          {actions.length > 0 && (
            <ApplicationActions
              appId={appId}
              actions={actions}
              actionsBlocked={actionsBlocked}
              needsDocumentUpload={needsDocumentUpload}
              hasUnsavedEdits={nameEdits.hasUnsavedEdits}
              allNamed={nameEdits.allNamed}
            />
          )}

          <DocumentsCard
            appId={appId}
            documents={documents}
            canModify={actions.length > 0}
            userId={user?.id}
          />
        </div>
      </div>

      {/* To'liq ekran xarita */}
      {mapFullscreen && mapGeojson && (
        <div
          className='fixed inset-0 z-9999 flex flex-col'
          style={{ background: '#000' }}
        >
          <div
            className='flex items-center justify-between px-4 py-3 shrink-0'
            style={{ background: '#0f1f3d' }}
          >
            <span className='text-white font-semibold text-sm'>
              {app.applicationNumber} — Xaritada ko&apos;rish
            </span>
            <button
              onClick={() => setMapFullscreen(false)}
              className='w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0 transition-colors'
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            >
              <CloseOutlined style={{ fontSize: 14 }} />
            </button>
          </div>
          <div className='flex-1'>
            <GeoJsonMap
              geojson={mapGeojson}
              height='100%'
              highlightedIndex={activeGeoIdx}
            />
          </div>
        </div>
      )}
    </div>
  );
}
