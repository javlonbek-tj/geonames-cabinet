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
import { STATUS_LABELS, STATUS_COLORS, APP_STATUS } from '@/constants';
import {
  buildFeatureCollection,
  downloadApplicationGeoJson,
} from '@/lib/geoUtils';
import { useNameEdits } from './hooks/useNameEdits';
import ApplicationInfoCard from './components/ApplicationInfoCard';
import GeoObjectsTable from './components/GeoObjectsTable';
import ApplicationHistory from './components/ApplicationHistory';
import DiscussionResultsCard from './components/DiscussionResultsCard';
import CommissionPanel from './components/CommissionPanel';
import ApplicationActions from './components/ApplicationActions';
import DocumentsCard from './components/DocumentsCard';
import type { ApplicationStatus } from '@/types';

const { Title } = Typography;

const DISCUSSION_VISIBLE_STATUSES: ApplicationStatus[] = [
  APP_STATUS.DISTRICT_COMMISSION,
  APP_STATUS.REGIONAL_COMMISSION,
  APP_STATUS.REGIONAL_HOKIMLIK,
  APP_STATUS.KADASTR_AGENCY,
  APP_STATUS.DKP_CENTRAL,
  APP_STATUS.KADASTR_AGENCY_FINAL,
  APP_STATUS.REGIONAL_HOKIMLIK_FINAL,
  APP_STATUS.DISTRICT_HOKIMLIK_FINAL,
  APP_STATUS.COMPLETED,
];

const FLAG_VISIBLE_STATUSES: ApplicationStatus[] = [
  APP_STATUS.KADASTR_AGENCY_FINAL,
  APP_STATUS.REGIONAL_HOKIMLIK_FINAL,
  APP_STATUS.DISTRICT_HOKIMLIK_FINAL,
  APP_STATUS.COMPLETED,
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
    app?.currentStatus === APP_STATUS.DISTRICT_COMMISSION;
  const isDiscussionStep = app?.currentStatus === APP_STATUS.PUBLIC_DISCUSSION;
  const hasDiscussion =
    isDiscussionStep ||
    (!!app?.currentStatus &&
      DISCUSSION_VISIBLE_STATUSES.includes(app.currentStatus));

  const { data: discussionResults } = useDiscussionResults(
    appId,
    hasDiscussion,
  );

  const isKadastrFlagStep =
    app?.currentStatus === APP_STATUS.DKP_CENTRAL &&
    user?.role === ROLES.DKP_CENTRAL;
  const canViewFlags =
    !isKadastrFlagStep &&
    !!app?.currentStatus &&
    FLAG_VISIBLE_STATUSES.includes(app.currentStatus);

  const canEnterNames =
    user?.role === ROLES.DISTRICT_HOKIMLIK &&
    app?.currentStatus === APP_STATUS.DISTRICT_HOKIMLIK &&
    geoObjects.some((o) => o.existsInRegistry === false);

  const needsDocumentUpload =
    user?.role === ROLES.DISTRICT_HOKIMLIK &&
    app?.currentStatus === APP_STATUS.DISTRICT_HOKIMLIK_FINAL &&
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
            <div className='overflow-hidden rounded-lg border border-gray-200 dark:border-[#303030]'>
              <div className='flex items-center justify-between px-3 py-2 bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-[#303030]'>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Xaritada ko&apos;rish
                </span>
                <Space size={8}>
                  {canDownloadGeoJson && (
                    <Button
                      size='small'
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        downloadApplicationGeoJson(
                          app.applicationNumber,
                          geoObjects,
                        )
                      }
                    >
                      GeoJSON yuklab olish
                    </Button>
                  )}
                  <button
                    onClick={() => setMapFullscreen(true)}
                    className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border border-[#d1d9e8] dark:border-[#303030] bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-[#1565c0] dark:text-[#4096ff]'
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
