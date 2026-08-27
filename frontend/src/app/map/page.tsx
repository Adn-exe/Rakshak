'use client';

import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { getReports } from '@/lib/storage';
import { initDemoData } from '@/lib/storage';
import { DEMO_ASSETS } from '@/lib/demoData';
import type { MapMarkerData, Report } from '@/types';
import { MapPin } from 'lucide-react';

const InfrastructureMap = dynamic(
  () => import('@/components/map/InfrastructureMap'),
  { ssr: false, loading: () => <div className="h-[calc(100vh-4rem)] bg-muted animate-pulse rounded-lg" /> }
);

function MapContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');

  const [markers, setMarkers] = useState<MapMarkerData[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  useEffect(() => {
    initDemoData(DEMO_ASSETS);
    const reports = getReports();

    const mapMarkers: MapMarkerData[] = reports.map((r: Report) => {
      const mainIssues: string[] = [];
      if (r.observations.erosion !== 'none' && r.observations.erosion !== 'cannot_determine')
        mainIssues.push(`${t('healthCard.erosion')}: ${t(`severity.${r.observations.erosion}`)}`);
      if (r.observations.seepage !== 'none' && r.observations.seepage !== 'cannot_determine')
        mainIssues.push(`${t('healthCard.seepage')}: ${t(`severity.${r.observations.seepage}`)}`);
      if (r.observations.cracks !== 'none' && r.observations.cracks !== 'cannot_determine')
        mainIssues.push(`${t('healthCard.cracks')}: ${t(`severity.${r.observations.cracks}`)}`);

      return {
        id: r.id,
        assetName: r.assetName,
        latitude: r.location.latitude,
        longitude: r.location.longitude,
        riskScore: r.riskScore,
        riskLevel: r.riskLevel,
        assetType: r.assetType,
        mainIssues,
      };
    });

    setMarkers(mapMarkers);

    // If targetId is passed in URL query, center on that asset!
    if (targetId) {
      const target = mapMarkers.find((m) => m.id === targetId);
      if (target) {
        setMapCenter([target.latitude, target.longitude]);
        setMapZoom(13);
      }
    }
  }, [t, targetId]);

  return (
    <div className="min-h-screen">
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {t('map.title')}
        </h1>
        {targetId && (
          <span className="text-xs font-mono px-2.5 py-1 bg-primary/10 text-primary rounded-full font-semibold">
            Targeting ID: {targetId}
          </span>
        )}
      </div>
      <div className="relative">
        <InfrastructureMap
          markers={markers}
          center={mapCenter}
          zoom={mapZoom}
          height="calc(100vh - 8rem)"
          selectedId={targetId || undefined}
        />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-muted animate-pulse" />}>
      <MapContent />
    </Suspense>
  );
}
