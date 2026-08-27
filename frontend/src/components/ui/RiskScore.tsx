'use client';

import React from 'react';
import type { RiskLevel } from '@/types';

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

const LEVEL_COLORS: Record<RiskLevel, string> = {
  low: 'oklch(0.62 0.18 155)',
  moderate: 'oklch(0.78 0.16 85)',
  high: 'oklch(0.68 0.19 50)',
  critical: 'oklch(0.55 0.22 25)',
};

export function RiskScore({ score, level, size = 'md' }: RiskScoreProps) {
  const color = LEVEL_COLORS[level];
  const circumference = 2 * Math.PI * 42;
  const filled = (score / 100) * circumference;
  const dashOffset = circumference - filled;

  const dims = { sm: 80, md: 120, lg: 160 };
  const fontSizes = { sm: 'text-lg', md: 'text-3xl', lg: 'text-5xl' };
  const dim = dims[size];

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="oklch(0.92 0.005 75)"
          strokeWidth="8"
        />
        {/* Filled arc */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${fontSizes[size]} font-bold`} style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}
