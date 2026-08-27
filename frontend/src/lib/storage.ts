/**
 * localStorage wrapper for Rakshak report persistence.
 */

import type { Report, DemoAsset } from '@/types';

const REPORTS_KEY = 'rakshak_reports';
const OLD_REPORTS_KEY = 'jalraksha_reports';
const DEMO_INIT_KEY = 'rakshak_demo_initialized_v2';

// ============================================================
// Report CRUD
// ============================================================

export function getReports(): Report[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(REPORTS_KEY) || localStorage.getItem(OLD_REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getReport(id: string): Report | null {
  const reports = getReports();
  return reports.find((r) => r.id === id) || null;
}

export function saveReport(report: Report): void {
  if (typeof window === 'undefined') return;
  const reports = getReports();
  const existingIndex = reports.findIndex((r) => r.id === report.id);
  if (existingIndex >= 0) {
    reports[existingIndex] = report;
  } else {
    reports.unshift(report);
  }
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function updateReportStatus(id: string, status: Report['status']): void {
  if (typeof window === 'undefined') return;
  const reports = getReports();
  const report = reports.find((r) => r.id === id);
  if (report) {
    report.status = status;
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }
}

export function deleteReport(id: string): void {
  if (typeof window === 'undefined') return;
  const reports = getReports();
  const filtered = reports.filter((r) => r.id !== id);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(filtered));
}

export function generateReportId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RK-${year}-${random}`;
}

// ============================================================
// Demo Data Initialization
// ============================================================

export function isDemoInitialized(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_INIT_KEY) === 'true';
}

export function initDemoData(demoAssets: DemoAsset[]): void {
  if (typeof window === 'undefined') return;

  const demoReports: Report[] = demoAssets.map((asset) => ({
    id: asset.id,
    assetName: asset.assetName,
    assetType: asset.assetType,
    location: {
      latitude: asset.latitude,
      longitude: asset.longitude,
      address: asset.address,
    },
    image: '',
    observations: asset.observations as Report['observations'],
    additionalIssues: asset.additionalIssues,
    communityReports: asset.communityReports,
    unresolvedCommunityReports: asset.unresolvedReports,
    engineerReports: asset.engineerReports,
    riskScore: asset.riskScore,
    riskLevel: asset.riskLevel,
    recommendedAction: asset.recommendedAction,
    status: asset.status,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    submittedToAuthority: true,
  }));

  const existing = getReports();
  const demoIds = new Set(demoReports.map((d) => d.id));

  // Preserve user-submitted custom reports
  const userReports = existing.filter((r) => !demoIds.has(r.id));

  // Always keep demo assets fresh & updated
  const updatedReports = [...demoReports, ...userReports];

  localStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));
  localStorage.setItem(DEMO_INIT_KEY, 'true');
}
