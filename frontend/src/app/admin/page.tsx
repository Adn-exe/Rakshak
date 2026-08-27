'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { getReports, updateReportStatus, deleteReport } from '@/lib/storage';
import { initDemoData } from '@/lib/storage';
import { DEMO_ASSETS } from '@/lib/demoData';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Report, ReportStatus, MapMarkerData } from '@/types';
import {
  AlertTriangle, Shield, CheckCircle, ChevronRight, MapPin, Filter, ClipboardList, Trash2
} from 'lucide-react';

const InfrastructureMap = dynamic(
  () => import('@/components/map/InfrastructureMap'),
  { ssr: false, loading: () => <div className="h-[560px] bg-muted animate-pulse rounded-xl" /> }
);

const STATUSES: ReportStatus[] = [
  'new',
  'manual_inspection_needed',
  'under_review',
  'inspection_required',
  'action_recommended',
  'resolved',
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    initDemoData(DEMO_ASSETS);
    setReports(getReports());
  }, []);

  // Only display reports officially submitted to local authorities (submittedToAuthority !== false)
  const authorityReports = reports.filter((r) => r.submittedToAuthority !== false);

  const sortedReports = [...authorityReports].sort((a, b) => b.riskScore - a.riskScore);
  const critical = authorityReports.filter((r) => r.riskLevel === 'critical').length;
  const high = authorityReports.filter((r) => r.riskLevel === 'high').length;
  const manualNeeded = authorityReports.filter((r) => r.status === 'manual_inspection_needed').length;
  const moderate = authorityReports.filter((r) => r.riskLevel === 'moderate').length;
  const low = authorityReports.filter((r) => r.riskLevel === 'low').length;

  const handleStatusChange = (id: string, status: ReportStatus) => {
    updateReportStatus(id, status);
    setReports(getReports());
    setStatusMessage(t('dashboard.statusUpdated'));
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleDeleteReport = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Remove report ${id} (${name})?`)) {
      deleteReport(id);
      setReports(getReports());
      setStatusMessage('Report removed successfully');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const markers: MapMarkerData[] = authorityReports.map((r) => ({
    id: r.id,
    assetName: r.assetName,
    latitude: r.location.latitude,
    longitude: r.location.longitude,
    riskScore: r.riskScore,
    riskLevel: r.riskLevel,
    assetType: r.assetType,
  }));

  const filteredReports = statusFilter === 'all'
    ? sortedReports
    : sortedReports.filter((r) => r.status === statusFilter);

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Shield className="h-6 w-6 text-primary" />
              {t('dashboard.title')}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || 'all')}>
              <SelectTrigger className="h-9 text-xs w-52 bg-card">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Statuses ({reports.length})</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {t(`status.${s}`)} ({reports.filter((r) => r.status === s).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <Card className="border-border shadow-xs"><CardContent className="p-3.5 text-center"><p className="text-2xl font-extrabold">{reports.length}</p><p className="text-xs text-muted-foreground">{t('dashboard.totalReports')}</p></CardContent></Card>
          <Card className="border-red-200 bg-red-50/50 shadow-xs"><CardContent className="p-3.5 text-center"><p className="text-2xl font-extrabold text-red-600">{critical}</p><p className="text-xs text-red-800 font-medium">{t('dashboard.criticalCount')}</p></CardContent></Card>
          <Card className="border-orange-200 bg-orange-50/50 shadow-xs"><CardContent className="p-3.5 text-center"><p className="text-2xl font-extrabold text-orange-600">{high}</p><p className="text-xs text-orange-800 font-medium">{t('dashboard.highCount')}</p></CardContent></Card>
          
          {/* Manual Inspection Needed KPI */}
          <Card className={`border-amber-300 bg-amber-50 shadow-xs ${manualNeeded > 0 ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}>
            <CardContent className="p-3.5 text-center">
              <p className="text-2xl font-extrabold text-amber-700">{manualNeeded}</p>
              <p className="text-xs text-amber-900 font-bold flex items-center justify-center gap-1">
                <ClipboardList className="h-3.5 w-3.5" />
                <span>Manual Review Needed</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50 shadow-xs"><CardContent className="p-3.5 text-center"><p className="text-2xl font-extrabold text-amber-600">{moderate}</p><p className="text-xs text-amber-800 font-medium">{t('dashboard.moderateCount')}</p></CardContent></Card>
          <Card className="border-emerald-200 bg-emerald-50/50 shadow-xs"><CardContent className="p-3.5 text-center"><p className="text-2xl font-extrabold text-emerald-600">{low}</p><p className="text-xs text-emerald-800 font-medium">{t('dashboard.lowCount')}</p></CardContent></Card>
        </div>

        {/* Status Toast Notification */}
        {statusMessage && (
          <div className="p-3 bg-emerald-100/90 border border-emerald-300 rounded-lg flex items-center gap-2 text-sm text-emerald-900 font-medium animate-in fade-in duration-300">
            <CheckCircle className="h-4 w-4 text-emerald-600" /> {statusMessage}
          </div>
        )}

        {/* 50/50 SPLIT SCREEN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* LEFT 50%: PRIORITY ALERTS & REPORTS LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                {t('dashboard.priorityAlerts')} & Reports
              </h2>
              <span className="text-xs text-muted-foreground font-medium">
                Click any report to open immediately
              </span>
            </div>

            {filteredReports.length > 0 ? (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {filteredReports.map((report) => {
                  const isManualNeeded = report.status === 'manual_inspection_needed';
                  const riskBorderClass =
                    report.riskLevel === 'critical'
                      ? 'border-l-4 border-l-red-500'
                      : report.riskLevel === 'high'
                      ? 'border-l-4 border-l-orange-500'
                      : report.riskLevel === 'moderate'
                      ? 'border-l-4 border-l-amber-500'
                      : 'border-l-4 border-l-emerald-500';

                  return (
                    <Card
                      key={report.id}
                      onClick={() => router.push(`/admin/health-card/${report.id}`)}
                      className={`cursor-pointer hover:shadow-md transition-all border-border hover:border-primary/50 group bg-card ${riskBorderClass} ${
                        isManualNeeded ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <CardContent className="p-5 space-y-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <RiskBadge level={report.riskLevel} size="sm" />
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
                                isManualNeeded
                                  ? 'bg-amber-500 text-white animate-pulse'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {t(`status.${report.status}`)}
                              </span>
                            </div>
                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                              {report.assetName}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                              <span className="truncate">{report.location.address || `${report.location.latitude.toFixed(3)}°, ${report.location.longitude.toFixed(3)}°`}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <div className="text-right">
                              <span className="text-xs text-muted-foreground block">{t('risk.score')}</span>
                              <span className="text-xl font-extrabold text-foreground">{report.riskScore}</span>
                            </div>
                          </div>
                        </div>

                        {/* Primary Damage Concerns & Chevron Arrow */}
                        <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap text-muted-foreground">
                            {report.observations.erosion !== 'none' && <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-medium">{t(`severity.${report.observations.erosion}`)} erosion</span>}
                            {report.observations.seepage !== 'none' && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">{t(`severity.${report.observations.seepage}`)} seepage</span>}
                            {report.observations.cracks !== 'none' && <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-medium">{t(`severity.${report.observations.cracks}`)} cracks</span>}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">{t('dashboard.noAlerts')}</p></CardContent></Card>
            )}
          </div>

          {/* RIGHT 50%: FULL INTERACTIVE MAP */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                Live Geo-Spatial Health Map
              </h2>
              <Link href="/admin/map">
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                  <span>Full Screen Map</span>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <Card className="overflow-hidden border-border shadow-xs">
              <CardContent className="p-0">
                <InfrastructureMap markers={markers} height="560px" zoom={5} />
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
