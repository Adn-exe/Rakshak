'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import HealthCardPage from '@/app/health-card/[id]/page';
import { getReport, saveReport } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Report, ReportStatus, SeverityLevel } from '@/types';
import { CheckCircle2, ShieldAlert, Wrench, Send } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const SEVERITIES: SeverityLevel[] = ['none', 'minor', 'moderate', 'severe'];
const STATUSES: ReportStatus[] = [
  'new',
  'manual_inspection_needed',
  'under_review',
  'inspection_required',
  'action_recommended',
  'resolved',
];

export default function AdminHealthCardDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<Report | null>(null);

  // Manual inspection & status state
  const [cracks, setCracks] = useState<SeverityLevel>('none');
  const [erosion, setErosion] = useState<SeverityLevel>('none');
  const [seepage, setSeepage] = useState<SeverityLevel>('none');
  const [settlement, setSettlement] = useState<SeverityLevel>('none');
  const [status, setStatus] = useState<ReportStatus>('under_review');
  const [engineerFinding, setEngineerFinding] = useState('');
  const [actionNeeded, setActionNeeded] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const r = getReport(id);
    if (r) {
      setReport(r);
      setCracks(r.observations.cracks || 'none');
      setErosion(r.observations.erosion || 'none');
      setSeepage(r.observations.seepage || 'none');
      setSettlement(r.observations.settlement || 'none');
      setStatus(r.status);
      setActionNeeded(r.recommendedAction || '');
      if (r.engineerReportData && r.engineerReportData.length > 0) {
        setEngineerFinding(r.engineerReportData[0].finding || '');
      }
    }
  }, [id]);

  const handleSaveAssessment = () => {
    if (!report) return;

    const computeSevScore = (s: SeverityLevel) => s === 'severe' ? 25 : s === 'moderate' ? 18 : s === 'minor' ? 10 : 0;
    const newScore = Math.min(100, Math.max(10, computeSevScore(cracks) + computeSevScore(erosion) + computeSevScore(seepage) + computeSevScore(settlement) + 15));
    const newLevel = newScore >= 75 ? 'critical' : newScore >= 50 ? 'high' : newScore >= 30 ? 'moderate' : 'low';

    const updatedEngineerReport = [
      {
        id: `ENG-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        inspector: 'Authority Lead Engineer',
        finding: engineerFinding || 'Manual field inspection completed by Authority Officer.',
        status: status === 'resolved' ? 'Completed' : 'Active',
        recommended: actionNeeded || 'Site monitoring & stabilization',
      },
      ...(report.engineerReportData || []),
    ];

    const updated: Report = {
      ...report,
      observations: { cracks, erosion, seepage, settlement },
      riskScore: newScore,
      riskLevel: newLevel,
      status,
      recommendedAction: actionNeeded || report.recommendedAction,
      engineerReportData: updatedEngineerReport,
      engineerReports: updatedEngineerReport.length,
      summary: `Manual Inspection Completed: ${engineerFinding || 'Field conditions evaluated by Authority Officers.'}`,
    };

    saveReport(updated);
    setReport(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="pb-16">
      {/* 1. Main Health Card Report Information */}
      <HealthCardPage />

      {/* 2. AT THE VERY BOTTOM AFTER ALL INFO: Authority Manual Entry Section (Rendered ONLY for AI-Unavailable / Manual Inspection Needed Reports) */}
      {report?.status === 'manual_inspection_needed' && (
        <div className="mx-auto max-w-3xl mt-8 px-4">
          <Card className="border-2 border-amber-400 bg-card shadow-lg">
          <CardHeader className="py-4 px-5 border-b border-border bg-muted/40">
            <CardTitle className="text-base font-bold flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-foreground">
                <Wrench className="h-5 w-5 text-primary" />
                <span>Authority Status Update & Field Assessment Entry</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-normal">Current Status:</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
                  report?.status === 'manual_inspection_needed'
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {report ? t(`status.${report.status}`) : 'New Report'}
                </span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {report?.status === 'manual_inspection_needed' && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-3 text-xs text-amber-950 font-medium">
                <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Manual Review Required:</strong> AI assessment was unavailable during submission. Use the form below to update status, set structural severity levels, and save official engineer findings.
                </span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2 text-xs text-emerald-950 font-semibold animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Status & Official Authority Assessment Saved Successfully!</span>
              </div>
            )}

            {/* Change Status Dropdown */}
            <div className="p-4 bg-muted/30 rounded-xl border border-border/80 space-y-2">
              <label className="text-xs font-bold block text-foreground uppercase tracking-wide">
                1. Update Report Status (New Report, Under Review, Field Inspection Needed, Action Recommended, Resolved)
              </label>
              <Select value={status} onValueChange={(v) => setStatus(v as ReportStatus)}>
                <SelectTrigger className="h-10 text-sm bg-background font-semibold border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-sm font-medium">
                      {t(`status.${s}`)} ({s.replace(/_/g, ' ')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity Controls Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold block text-foreground uppercase tracking-wide">
                2. Field Severity Levels (Optional / Manual Override)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-medium text-muted-foreground block mb-1">Cracks</label>
                  <Select value={cracks} onValueChange={(v) => setCracks(v as SeverityLevel)}>
                    <SelectTrigger className="h-9 text-xs bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s} className="text-xs uppercase">{t(`severity.${s}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium text-muted-foreground block mb-1">Erosion</label>
                  <Select value={erosion} onValueChange={(v) => setErosion(v as SeverityLevel)}>
                    <SelectTrigger className="h-9 text-xs bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s} className="text-xs uppercase">{t(`severity.${s}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium text-muted-foreground block mb-1">Seepage</label>
                  <Select value={seepage} onValueChange={(v) => setSeepage(v as SeverityLevel)}>
                    <SelectTrigger className="h-9 text-xs bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s} className="text-xs uppercase">{t(`severity.${s}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium text-muted-foreground block mb-1">Settlement</label>
                  <Select value={settlement} onValueChange={(v) => setSettlement(v as SeverityLevel)}>
                    <SelectTrigger className="h-9 text-xs bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s} className="text-xs uppercase">{t(`severity.${s}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Engineer Notes & Recommended Action */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-foreground">3. Official Inspection Notes / Findings</label>
                <input
                  type="text"
                  value={engineerFinding}
                  onChange={(e) => setEngineerFinding(e.target.value)}
                  placeholder="e.g. Field inspection verified minor slope cracking near chainage 12+400..."
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-foreground">4. Recommended Action</label>
                <input
                  type="text"
                  value={actionNeeded}
                  onChange={(e) => setActionNeeded(e.target.value)}
                  placeholder="e.g. Dispatch repair crew for boulder pitching & crack filling..."
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Button size="lg" className="w-full text-sm font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" onClick={handleSaveAssessment}>
                <Send className="h-4 w-4" />
                <span>Save Official Status & Authority Assessment</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
}
