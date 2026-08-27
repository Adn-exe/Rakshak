/**
 * Client-side risk score calculation engine.
 * Mirrors the backend risk engine for offline/display purposes.
 */

import type { RiskLevel, RiskBreakdown, SeverityLevel } from '@/types';

// Severity → Score mapping
const SEVERITY_SCORES: Record<string, number> = {
  none: 0,
  cannot_determine: 0,
  minor: 25,
  suspected: 25,
  moderate: 50,
  visible: 50,
  severe: 100,
};

// Weights
const WEIGHTS = {
  cracks: 0.25,
  erosion: 0.25,
  seepage: 0.20,
  settlement: 0.15,
  additional: 0.10,
  community: 0.05,
};

export function severityToScore(severity: string): number {
  return SEVERITY_SCORES[severity?.toLowerCase()] ?? 0;
}

export function calculateAdditionalScore(issues: string[]): number {
  const count = issues.length;
  if (count === 0) return 0;
  if (count <= 2) return 25;
  if (count <= 4) return 50;
  return 100;
}

export function calculateCommunityScore(
  reports: number = 0,
  unresolved: number = 0
): number {
  if (reports === 0) return 0;
  let base = reports <= 5 ? 25 : reports <= 15 ? 50 : 75;
  if (unresolved >= 5) base = Math.min(base + 25, 100);
  else if (unresolved >= 3) base = Math.min(base + 15, 100);
  return base;
}

export function classifyRisk(score: number): RiskLevel {
  const clamped = Math.max(0, Math.min(100, score));
  if (clamped <= 24) return 'low';
  if (clamped <= 49) return 'moderate';
  if (clamped <= 74) return 'high';
  return 'critical';
}

export function calculateRisk(
  observations: {
    cracks: SeverityLevel;
    erosion: SeverityLevel;
    seepage: SeverityLevel;
    settlement: SeverityLevel;
  },
  additionalIssues: string[] = [],
  communityReports: number = 0,
  unresolvedReports: number = 0
): RiskBreakdown {
  const cracksScore = severityToScore(observations.cracks);
  const erosionScore = severityToScore(observations.erosion);
  const seepageScore = severityToScore(observations.seepage);
  const settlementScore = severityToScore(observations.settlement);
  const additionalScore = calculateAdditionalScore(additionalIssues);
  const communityScore = calculateCommunityScore(communityReports, unresolvedReports);

  const total = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        cracksScore * WEIGHTS.cracks +
          erosionScore * WEIGHTS.erosion +
          seepageScore * WEIGHTS.seepage +
          settlementScore * WEIGHTS.settlement +
          additionalScore * WEIGHTS.additional +
          communityScore * WEIGHTS.community
      )
    )
  );

  return {
    cracksScore,
    erosionScore,
    seepageScore,
    settlementScore,
    additionalScore,
    communityScore,
    totalScore: total,
    riskLevel: classifyRisk(total),
  };
}

/** Risk level → color mapping for UI. */
export const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'var(--risk-low)',
  moderate: 'var(--risk-moderate)',
  high: 'var(--risk-high)',
  critical: 'var(--risk-critical)',
};
