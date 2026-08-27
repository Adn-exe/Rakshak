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
  none: 'text-muted-foreground',
  minor: 'text-green-600',
  moderate: 'text-amber-600',
  severe: 'text-red-600',
  visible: 'text-orange-600',
  suspected: 'text-amber-500',
  cannot_determine: 'text-muted-foreground',
};

const SEVERITY_BG: Record<string, string> = {
  none: 'bg-muted',
  minor: 'bg-green-50',
  moderate: 'bg-amber-50',
  severe: 'bg-red-50',
  visible: 'bg-orange-50',
  suspected: 'bg-amber-50',
  cannot_determine: 'bg-muted',
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
