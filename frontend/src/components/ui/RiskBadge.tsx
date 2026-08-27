'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n';
import type { RiskLevel } from '@/types';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const ICONS: Record<RiskLevel, React.ElementType> = {
  low: ShieldCheck,
  moderate: AlertTriangle,
  high: AlertOctagon,
  critical: ShieldAlert,
};

export function RiskBadge({ level, size = 'md', showIcon = true }: RiskBadgeProps) {
  const { t } = useTranslation();
  const Icon = ICONS[level];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const iconSizes = { sm: 12, md: 14, lg: 18 };

  return (
    <span
      className={`risk-badge risk-badge--${level} ${sizeClasses[size]}`}
      role="status"
      aria-label={`${t(`risk.${level}`)} risk`}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      <span className="uppercase tracking-wider font-bold">
        {t(`risk.${level}`)}
      </span>
    </span>
  );
}
