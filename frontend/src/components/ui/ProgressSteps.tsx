'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { Check, Loader2, Circle } from 'lucide-react';

interface Step {
  key: string; // translation key
  status: 'done' | 'active' | 'pending';
}

interface ProgressStepsProps {
  steps: Step[];
}

export function ProgressSteps({ steps }: ProgressStepsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div key={step.key} className="flex items-center gap-3">
          {step.status === 'done' && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
              <Check className="h-3.5 w-3.5 text-green-600" />
            </div>
          )}
          {step.status === 'active' && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
            </div>
          )}
          {step.status === 'pending' && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <Circle className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          <span
            className={`text-sm ${
              step.status === 'done'
                ? 'text-foreground'
                : step.status === 'active'
                ? 'text-primary font-medium'
                : 'text-muted-foreground'
            }`}
          >
            {t(`processing.${step.key}`)}
          </span>
        </div>
      ))}
    </div>
  );
}
