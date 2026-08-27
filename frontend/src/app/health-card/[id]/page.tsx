'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useTranslation, LANGUAGE_LABELS, LANGUAGES } from '@/lib/i18n';
import { getReport, saveReport, deleteReport } from '@/lib/storage';
import { calculateRisk } from '@/lib/risk';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { RiskScore } from '@/components/ui/RiskScore';
import { HealthMetric } from '@/components/ui/HealthMetric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Report, Language } from '@/types';
import {
  MapPin, FileText, Users, Wrench,
  AlertTriangle, ArrowLeft, Maximize2, X, Camera, CheckCircle2, Trash2, Send, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function HealthCardPage() {
  const { t, language, setLanguage } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [report, setReport] = useState<Report | null>(null);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [showEngineerDetails, setShowEngineerDetails] = useState(false);
  const [isSubmittingToAuth, setIsSubmittingToAuth] = useState(false);

  const handleSubmitToAuthority = () => {
    if (!report) return;
    setIsSubmittingToAuth(true);
    const updated: Report = {
      ...report,
      submittedToAuthority: true,
      submittedAt: new Date().toISOString(),
    };
    saveReport(updated);
    setReport(updated);
    setTimeout(() => {
      setIsSubmittingToAuth(false);
    }, 500);
  };

  useEffect(() => {
    const id = params.id as string;
    const r = getReport(id);
    setReport(r);
  }, [params.id]);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{t('errors.reportNotFound')}</p>
          <Button className="mt-4" onClick={() => router.push('/health-cards')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </Card>
      </div>
    );
  }

  const riskBreakdown = report.riskBreakdown || calculateRisk(
    report.observations,
    report.additionalIssues,
    report.communityReports,
    report.unresolvedCommunityReports
  );

  // Bar chart helper
  const RiskBar = ({ label, score, max = 100 }: { label: string; score: number; max?: number }) => {
    const pct = Math.max(0, Math.min(100, (score / max) * 100));
    const color = pct >= 75 ? 'bg-red-500' : pct >= 50 ? 'bg-orange-500' : pct >= 25 ? 'bg-amber-400' : 'bg-green-400';
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="w-44 text-muted-foreground text-xs truncate shrink-0" title={label}>{label}</span>
        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-medium w-8 text-right">{score}</span>
      </div>
    );
  };

  const formatIssueTag = (issue: string, assetType: string) => {
    const category = assetType.startsWith('river')
      ? 'river'
      : assetType.startsWith('canal')
      ? 'canal'
      : assetType.startsWith('road')
      ? 'road'
      : assetType.startsWith('railway')
      ? 'railway'
      : 'dam';

    const camelKey = issue.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const translated = t(`obs.${category}.${camelKey}`);
    if (translated && !translated.startsWith('obs.')) {
      return translated;
    }

    return issue
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const isAdminView = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t('common.back')}
          </Button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {pathname.startsWith('/admin') && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 font-semibold text-xs cursor-pointer"
                onClick={() => {
                  if (confirm(`Remove report ${report.id} (${report.assetName})?`)) {
                    deleteReport(report.id);
                    router.push('/admin');
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove Report</span>
              </Button>
            )}

            {/* Prominent Top View on Map Button */}
            <Link href={pathname.startsWith('/admin') ? `/admin/map?id=${report.id}` : `/map?id=${report.id}`}>
              <Button size="sm" className="gap-1.5 font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                <MapPin className="h-4 w-4" />
                <span>{t('healthCard.viewOnMap')}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Header Card */}
        <Card className="mb-6 overflow-hidden border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-mono text-muted-foreground">{t('healthCard.title')} · {report.id}</p>
                <h1 className="text-2xl font-bold mt-1 text-foreground">{report.assetName}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{report.location.address || `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <RiskBadge level={report.riskLevel} size="lg" />
                <RiskScore score={report.riskScore} level={report.riskLevel} size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clean Evidence Photo Card */}
        {report.image && (
          <Card className="mb-6 overflow-hidden border-border shadow-sm">
            <CardHeader className="py-3 px-4 border-b border-border/60 bg-muted/30 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Field Evidence Photograph</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 cursor-pointer"
                onClick={() => setIsFullscreenImage(true)}
              >
                <Maximize2 className="h-3 w-3" />
                <span>Full View</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0 relative bg-slate-950 flex items-center justify-center">
              <img
                src={report.image}
                alt={report.assetName}
                className="w-full max-h-[380px] sm:max-h-[440px] object-contain cursor-pointer transition-opacity hover:opacity-95"
                onClick={() => setIsFullscreenImage(true)}
              />
              
              {/* Photo Overlay Badges */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-mono border border-slate-700/60">
                <MapPin className="h-3 w-3 text-amber-400" />
                <span>{report.location.latitude.toFixed(4)}° N, {report.location.longitude.toFixed(4)}° E</span>
              </div>

              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur-md px-3 py-1 rounded-full text-emerald-300 text-xs font-medium border border-emerald-700/60">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Quality Verified</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fullscreen Lightbox Modal */}
        {isFullscreenImage && report.image && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsFullscreenImage(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white hover:bg-slate-800 rounded-full z-10"
                onClick={() => setIsFullscreenImage(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              <img
                src={report.image}
                alt={report.assetName}
                className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl border border-slate-800"
              />
              <p className="text-white/80 text-xs mt-3 font-mono">{report.assetName} · {report.id}</p>
            </div>
          </div>
        )}

        {/* Language Switcher */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs text-muted-foreground">{t('healthCard.language')}:</span>
          {LANGUAGES.map((lang) => (
            <Button
              key={lang}
              variant={language === lang ? 'default' : 'ghost'}
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setLanguage(lang as Language)}
            >
              {LANGUAGE_LABELS[lang as Language]}
            </Button>
          ))}
        </div>

        {/* Asset Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('healthCard.assetDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">{t('healthCard.healthCardId')}</p><p className="font-mono font-medium">{report.id}</p></div>
              <div><p className="text-xs text-muted-foreground">{t('healthCard.assetType')}</p><p className="font-medium">{t(`assetTypes.${report.assetType}`)}</p></div>
              <div><p className="text-xs text-muted-foreground">{t('healthCard.coordinates')}</p><p className="font-mono text-xs">{report.location.latitude.toFixed(4)}° N, {report.location.longitude.toFixed(4)}° E</p></div>
              <div><p className="text-xs text-muted-foreground">{t('healthCard.reportDate')}</p><p className="font-medium">{new Date(report.createdAt).toLocaleDateString()}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Structural Indicators */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">{t('healthCard.structuralIndicators')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <HealthMetric label={`assetIndicators.${report.assetType}.cracks`} severity={report.observations.cracks} explanation={report.assessment?.cracks?.explanation} />
              <HealthMetric label={`assetIndicators.${report.assetType}.erosion`} severity={report.observations.erosion} explanation={report.assessment?.erosion?.explanation} />
              <HealthMetric label={`assetIndicators.${report.assetType}.seepage`} severity={report.observations.seepage} explanation={report.assessment?.seepage?.explanation} />
              <HealthMetric label={`assetIndicators.${report.assetType}.settlement`} severity={report.observations.settlement} explanation={report.assessment?.settlement?.explanation} />
            </div>
          </CardContent>
        </Card>

        {/* Visible Issues / Additional Issues */}
        {report.additionalIssues && report.additionalIssues.length > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-sm">{t('healthCard.visibleIssues')}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {report.additionalIssues.map((issue, i) => (
                  <span key={i} className="px-2.5 py-1 bg-muted text-foreground text-xs rounded-md font-medium border border-border/60 shadow-2xs">
                    {formatIssueTag(issue, report.assetType)}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Community Reports */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('healthCard.communityReports')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.communityReports > 0 ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-2xl font-bold">{report.communityReports}</p><p className="text-xs text-muted-foreground">{t('healthCard.totalReports')}</p></div>
                <div><p className="text-2xl font-bold text-amber-600">{report.unresolvedCommunityReports}</p><p className="text-xs text-muted-foreground">{t('healthCard.unresolvedReports')}</p></div>
                <div><p className="text-sm font-medium">{report.communityData?.lastReport || '-'}</p><p className="text-xs text-muted-foreground">{t('healthCard.latestReport')}</p></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('healthCard.noCommunityData')}</p>
            )}
          </CardContent>
        </Card>

        {/* Engineer Reports */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              {t('healthCard.engineerReports')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.engineerReportData && report.engineerReportData.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-center mb-3">
                  <div><p className="text-2xl font-bold">{report.engineerReportData.length}</p><p className="text-xs text-muted-foreground">{t('healthCard.inspections')}</p></div>
                  <div><p className="text-sm font-medium">{report.engineerReportData[0].date}</p><p className="text-xs text-muted-foreground">{t('healthCard.latestInspection')}</p></div>
                  <div><p className="text-sm font-medium">{report.engineerReportData[0].status}</p><p className="text-xs text-muted-foreground">{t('healthCard.currentStatus')}</p></div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setShowEngineerDetails(!showEngineerDetails)}
                >
                  {showEngineerDetails ? 'Hide Past Inspections' : 'Show All Past Inspections'}
                </Button>

                {showEngineerDetails && (
                  <div className="space-y-2 pt-2 border-t">
                    {report.engineerReportData.map((er) => (
                      <div key={er.id} className="p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-medium">
                          <span>{er.id} · {er.date}</span>
                          <span className="text-primary">{er.status}</span>
                        </div>
                        <p className="text-muted-foreground">{er.finding}</p>
                        {er.recommended && (
                          <p className="text-primary font-medium">Action: {er.recommended}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('healthCard.noEngineerData')}</p>
            )}
          </CardContent>
        </Card>

        {/* Explainable Risk Score Breakdown */}
        {riskBreakdown && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-sm">{t('healthCard.riskExplanation')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <RiskBar label={t(`assetIndicators.${report.assetType}.erosion`)} score={riskBreakdown.erosionScore} />
              <RiskBar label={t(`assetIndicators.${report.assetType}.seepage`)} score={riskBreakdown.seepageScore} />
              <RiskBar label={t(`assetIndicators.${report.assetType}.cracks`)} score={riskBreakdown.cracksScore} />
              <RiskBar label={t(`assetIndicators.${report.assetType}.settlement`)} score={riskBreakdown.settlementScore} />
              <RiskBar label={t('healthCard.communityReports')} score={riskBreakdown.communityScore} />
            </CardContent>
          </Card>
        )}

        {/* Recommended Action */}
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              {t('healthCard.recommendedAction')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium leading-relaxed whitespace-pre-line">{report.recommendedAction}</p>
          </CardContent>
        </Card>

        {/* Submit to Authorities Action Panel (Citizen View Only) */}
        {!isAdminView && (
          <Card className={`mb-6 border-2 transition-all duration-300 ${
            report.submittedToAuthority
              ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-primary/50 bg-card shadow-md'
          }`}>
            <CardContent className="p-6 text-center space-y-4">
              {report.submittedToAuthority ? (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                    Report Dispatched to Department Authorities
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    This Health Card has been officially submitted to local irrigation & disaster response authorities for field action.
                    {report.submittedAt && ` (Submitted on ${new Date(report.submittedAt).toLocaleString()})`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                    <Send className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">
                      Submit Report to Local Authorities
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                      Send this verified Health Card directly to local irrigation officers & department authorities for immediate field inspection and official action.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    disabled={isSubmittingToAuth}
                    onClick={handleSubmitToAuthority}
                    className="w-full sm:w-auto px-8 font-bold gap-2 bg-primary text-primary-foreground shadow-md cursor-pointer hover:scale-[1.01] transition-transform"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmittingToAuth ? 'Submitting...' : 'Submit Report to Authorities'}</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="flex gap-2 p-3 bg-muted rounded-lg">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">{t('app.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
}
