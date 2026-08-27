'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import type { SeverityLevel } from '@/types';

interface HealthMetricProps {
  label: string; // translation key like 'healthCard.cracks'
  severity: SeverityLevel;
  explanation?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  none: 'text-emerald-700 dark:text-emerald-300 font-semibold',
  minor: 'text-blue-700 dark:text-blue-300 font-bold',
  moderate: 'text-amber-700 dark:text-amber-300 font-bold',
  severe: 'text-red-700 dark:text-red-300 font-bold',
  visible: 'text-orange-700 dark:text-orange-300 font-bold',
  suspected: 'text-amber-700 dark:text-amber-300 font-bold',
  cannot_determine: 'text-slate-600 dark:text-slate-400 font-medium',
};

const SEVERITY_BG: Record<string, string> = {
  none: 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30',
  minor: 'bg-blue-50/60 dark:bg-blue-950/30 border border-blue-500/30',
  moderate: 'bg-amber-50 dark:bg-amber-950/30 border border-amber-500/40',
  severe: 'bg-red-50 dark:bg-red-950/30 border border-red-500/40',
  visible: 'bg-orange-50 dark:bg-orange-950/30 border border-orange-500/40',
  suspected: 'bg-amber-50 dark:bg-amber-950/30 border border-amber-500/40',
  cannot_determine: 'bg-muted/40 border border-border/50',
};

export function HealthMetric({ label, severity, explanation }: HealthMetricProps) {
  const { t } = useTranslation();

  return (
    <Card className={`${SEVERITY_BG[severity] || 'bg-muted'} border-0 shadow-sm`}>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {t(label)}
        </p>
        <p className={`text-sm font-bold ${SEVERITY_COLORS[severity] || 'text-foreground'}`}>
          {t(`severity.${severity}`)}
        </p>
        {explanation && (
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {explanation}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
