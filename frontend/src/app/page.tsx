'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { initDemoData } from '@/lib/storage';
import { DEMO_ASSETS } from '@/lib/demoData';
import { RiskBadge } from '@/components/ui/RiskBadge';
import {
  ArrowRight, Shield, Camera, MapPin, CheckCircle2, AlertTriangle,
  FileCheck, ShieldAlert, Sparkles, Layers
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Initialize demo data on mount
  useEffect(() => {
    initDemoData(DEMO_ASSETS);
  }, []);

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ------------------------------------------------------------
          HERO SECTION (Vibrant, Animated, Clean & Punchy)
         ------------------------------------------------------------ */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-border/60">
        {/* Soft background glow gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/10 via-amber-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t('app.shortTagline')}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] max-w-3xl mx-auto">
              {t('hero.title')}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3.5 justify-center">
              <Link href="/report">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-md gap-2 font-semibold">
                  {t('hero.cta')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/health-cards">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-6 h-12 border-border gap-2 font-medium">
                  <FileCheck className="h-4 w-4 text-primary" />
                  {t('hero.ctaSecondary')}
                </Button>
              </Link>
            </div>

            {/* Quick Field Instructions (Clear & Concise) */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">1</div>
                <span className="text-xs font-medium text-foreground leading-snug">{t('hero.step1')}</span>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">2</div>
                <span className="text-xs font-medium text-foreground leading-snug">{t('hero.step2')}</span>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">3</div>
                <span className="text-xs font-medium text-foreground leading-snug">{t('hero.step3')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------
          MAIN UPLOAD AREA SECTION
         ------------------------------------------------------------ */}
      <section className="py-16 px-4 bg-muted/30 flex-1">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t('upload.title')}
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t('upload.hint')}
            </p>
          </div>

          <ImageUpload
            onImageSelected={handleImageSelected}
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onRemove={handleRemove}
          />

          {selectedFile && (
            <div className="text-center pt-4">
              <Link
                href="/report"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    (window as unknown as Record<string, File>).__rakshak_pending_file = selectedFile;
                  }
                }}
              >
                <Button size="lg" className="px-10 h-12 text-base shadow-md font-semibold gap-2">
                  {t('upload.continue')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer / Disclaimer */}
      <footer className="py-6 px-4 border-t border-border bg-card">
        <div className="mx-auto max-w-4xl text-center space-y-2">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('app.disclaimer')}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground/60">
            © {new Date().getFullYear()} {t('app.name')} · Citizen Infrastructure Safety Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
