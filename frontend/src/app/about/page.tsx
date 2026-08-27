'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Shield, Camera, CheckCircle2, Cpu, FileText, Bell, AlertTriangle,
  Layers, Activity, Info, ArrowRight, Waves, Mountain, Landmark
} from 'lucide-react';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-10 px-4 bg-muted/20">
      <div className="mx-auto max-w-4xl space-y-10">

        {/* ------------------------------------------------------------
            1. HEADER BANNER
           ------------------------------------------------------------ */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <Shield className="h-4 w-4" />
            <span>{t('app.name')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t('about.title')}
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Mission Card */}
        <Card className="border-primary/20 shadow-xs bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Landmark className="h-5 w-5 text-primary" />
              {t('about.overviewTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t('about.overviewText')}
            </p>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------
            2. STEP-BY-STEP WORKFLOW DIAGRAM
           ------------------------------------------------------------ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t('about.workflowTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {/* Step 1 */}
            <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
              <CardContent className="p-4 space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                  <Camera className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-foreground leading-snug">
                  {t('about.step1Title')}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('about.step1Desc')}
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
              <CardContent className="p-4 space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-foreground leading-snug">
                  {t('about.step2Title')}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('about.step2Desc')}
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
              <CardContent className="p-4 space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-foreground leading-snug">
                  {t('about.step3Title')}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('about.step3Desc')}
                </p>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
              <CardContent className="p-4 space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-foreground leading-snug">
                  {t('about.step4Title')}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('about.step4Desc')}
                </p>
              </CardContent>
            </Card>

            {/* Step 5 */}
            <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
              <CardContent className="p-4 space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
                  <Bell className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-foreground leading-snug">
                  {t('about.step5Title')}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('about.step5Desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ------------------------------------------------------------
            3. KEY FAILURE INDICATORS GUIDE
           ------------------------------------------------------------ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t('about.indicatorsTitle')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Erosion */}
            <Card className="border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-semibold">
                    {t('healthCard.erosion')}
                  </Badge>
                  <h3 className="text-sm font-bold text-foreground">{t('about.erosionTitle')}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('about.erosionDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Seepage */}
            <Card className="border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">
                    {t('healthCard.seepage')}
                  </Badge>
                  <h3 className="text-sm font-bold text-foreground">{t('about.seepageTitle')}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('about.seepageDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Cracks */}
            <Card className="border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs font-semibold">
                    {t('healthCard.cracks')}
                  </Badge>
                  <h3 className="text-sm font-bold text-foreground">{t('about.cracksTitle')}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('about.cracksDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Settlement */}
            <Card className="border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
                    {t('healthCard.settlement')}
                  </Badge>
                  <h3 className="text-sm font-bold text-foreground">{t('about.settlementTitle')}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('about.settlementDesc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ------------------------------------------------------------
            4. WEIGHTED RISK METHODOLOGY DIAGRAM
           ------------------------------------------------------------ */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              {t('about.methodologyTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('about.methodologyDesc')}
            </p>

            {/* Visual Weight Bar */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded-lg overflow-hidden flex text-[10px] font-bold text-white text-center leading-4">
                <div className="bg-orange-500 w-[25%]" title="Erosion (25%)">25%</div>
                <div className="bg-red-500 w-[25%]" title="Cracks (25%)">25%</div>
                <div className="bg-blue-500 w-[20%]" title="Seepage (20%)">20%</div>
                <div className="bg-purple-500 w-[15%]" title="Settlement (15%)">15%</div>
                <div className="bg-amber-500 w-[10%]" title="Additional (10%)">10%</div>
                <div className="bg-emerald-500 w-[5%]" title="Community (5%)">5%</div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Erosion (25%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Cracks (25%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Seepage (20%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Settlement (15%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Additional (10%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Community (5%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------
            5. SUPPORTED ASSETS
           ------------------------------------------------------------ */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Mountain className="h-5 w-5 text-primary" />
              {t('about.targetAssetsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('about.targetAssetsDesc')}
            </p>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------
            6. DISCLAIMER
           ------------------------------------------------------------ */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-900 mb-1">{t('about.noteTitle')}</h3>
              <p className="text-xs text-amber-800 leading-relaxed">{t('about.noteText')}</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
