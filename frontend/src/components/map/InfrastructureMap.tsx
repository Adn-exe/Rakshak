'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Button } from '@/components/ui/button';
import type { MapMarkerData, RiskLevel } from '@/types';

// Risk-colored circle markers
function createRiskIcon(level: RiskLevel): L.DivIcon {
  const colors: Record<RiskLevel, string> = {
    low: '#22c55e',
    moderate: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
  };
  const color = colors[level];

  return L.divIcon({
    className: 'custom-risk-marker',
    html: `<div style="
      width: 26px; height: 26px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 3px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

// Controller component to dynamically fly & center to targeted asset marker
function MapController({
  center,
  zoom,
  selectedId,
  markers,
}: {
  center: [number, number];
  zoom: number;
  selectedId?: string;
  markers: MapMarkerData[];
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedId && markers.length > 0) {
      const cleanTargetId = selectedId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const target = markers.find(
        (m) =>
          m.id.toLowerCase() === selectedId.toLowerCase() ||
          m.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cleanTargetId
      );

      if (target) {
        map.flyTo([target.latitude, target.longitude], 13, {
          duration: 1.2,
        });
        return;
      }
    }

    map.setView(center, zoom);
  }, [center, zoom, selectedId, markers, map]);

  return null;
}

// Marker component with automatic popup opening on targeting
function AutoOpenMarker({
  marker,
  isSelected,
  onMarkerClick,
  pathname,
  t,
}: {
  marker: MapMarkerData;
  isSelected: boolean;
  onMarkerClick?: (id: string) => void;
  pathname: string;
  t: (key: string) => string;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      const timer = setTimeout(() => {
        markerRef.current?.openPopup();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isSelected]);

  return (
    <Marker
      ref={markerRef}
      position={[marker.latitude, marker.longitude]}
      icon={createRiskIcon(marker.riskLevel)}
      eventHandlers={{
        click: () => onMarkerClick?.(marker.id),
      }}
    >
      <Popup>
        <div className="min-w-[210px] p-1 space-y-1.5">
          <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-1">{marker.assetName}</h3>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-500 font-mono">ID: {marker.id}</span>
            <RiskBadge level={marker.riskLevel} size="sm" showIcon={false} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">{t('map.riskLabel')}:</span>
            <span className="font-extrabold text-sm text-gray-900">{marker.riskScore} / 100</span>
          </div>
          {marker.mainIssues && marker.mainIssues.length > 0 && (
            <div className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded space-y-0.5">
              {marker.mainIssues.map((issue, i) => (
                <p key={i}>• {issue}</p>
              ))}
            </div>
          )}
          <Link href={pathname.startsWith('/admin') ? `/admin/health-card/${marker.id}` : `/health-card/${marker.id}`}>
            <Button size="sm" variant="default" className="w-full text-xs mt-1.5 font-medium">
              {t('map.viewHealthCard')}
            </Button>
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}

interface InfrastructureMapProps {
  markers: MapMarkerData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (id: string) => void;
  selectedId?: string;
}

export function InfrastructureMap({
  markers,
  center = [20.5937, 78.9629],
  zoom = 5,
  height = '500px',
  onMarkerClick,
  selectedId,
}: InfrastructureMapProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="bg-muted rounded-lg flex items-center justify-center"
      >
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      className="rounded-lg z-0"
    >
      <MapController center={center} zoom={zoom} selectedId={selectedId} markers={markers} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((marker) => {
        const isSelected = !!selectedId && (
          marker.id.toLowerCase() === selectedId.toLowerCase() ||
          marker.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === selectedId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
        );

        return (
          <AutoOpenMarker
            key={marker.id}
            marker={marker}
            isSelected={isSelected}
            onMarkerClick={onMarkerClick}
            pathname={pathname}
            t={t}
          />
        );
      })}
    </MapContainer>
  );
}

export default InfrastructureMap;
