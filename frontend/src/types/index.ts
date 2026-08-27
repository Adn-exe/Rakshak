/**
 * JalRaksha Type Definitions
 * Central type system for the entire frontend application.
 */

// ============================================================
// Core Enums / Literals
// ============================================================

export type Language = 'en' | 'hi' | 'kn' | 'te' | 'ta';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type AssetType =
  | 'river_embankment'
  | 'canal_embankment'
  | 'road_embankment'
  | 'railway_embankment'
  | 'dam_reservoir';

export type ReportStatus =
  | 'new'
  | 'under_review'
  | 'inspection_required'
  | 'action_recommended'
  | 'manual_inspection_needed'
  | 'resolved';

export type BlurStatus = 'good' | 'borderline' | 'blurry';

export type SeverityLevel =
  | 'none'
  | 'minor'
  | 'moderate'
  | 'severe'
  | 'visible'
  | 'suspected'
  | 'cannot_determine';

// ============================================================
// Structural Assessment
// ============================================================

export interface StructuralFinding {
  severity: SeverityLevel;
  confidence: number;
  explanation: string;
}

export interface AssessmentResult {
  cracks: StructuralFinding;
  erosion: StructuralFinding;
  seepage: StructuralFinding;
  settlement: StructuralFinding;
  additionalIssues: string[];
  summary: string;
}

// ============================================================
// Risk
// ============================================================

export interface RiskBreakdown {
  cracksScore: number;
  erosionScore: number;
  seepageScore: number;
  settlementScore: number;
  additionalScore: number;
  communityScore: number;
  totalScore: number;
  riskLevel: RiskLevel;
}

// ============================================================
// Location
// ============================================================

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// ============================================================
// Community / Engineer Data
// ============================================================

export interface CommunityData {
  assetName: string;
  communityReports: number;
  unresolvedReports: number;
  resolvedReports: number;
  lastReport: string;
  averageSeverity: string;
}

export interface EngineerReport {
  id: string;
  date: string;
  finding: string;
  status: string;
  recommended?: string;
}

// ============================================================
// User Observations
// ============================================================

export interface UserObservations {
  seepage?: 'yes' | 'no' | 'not_sure';
  cracks?: 'yes' | 'no' | 'not_sure';
  settlement?: 'yes' | 'no' | 'not_sure';
  erosion?: 'yes' | 'no' | 'not_sure';
}

// ============================================================
// Report (Full Data Model)
// ============================================================

export interface Report {
  id: string;
  assetName: string;
  assetType: AssetType;
  location: Location;
  image: string; // data URL
  description?: string;
  observations: {
    cracks: SeverityLevel;
    erosion: SeverityLevel;
    seepage: SeverityLevel;
    settlement: SeverityLevel;
  };
  additionalIssues: string[];
  assessment?: AssessmentResult;
  communityReports: number;
  unresolvedCommunityReports: number;
  communityData?: CommunityData;
  engineerReports: number;
  engineerReportData?: EngineerReport[];
  riskScore: number;
  riskLevel: RiskLevel;
  riskBreakdown?: RiskBreakdown;
  recommendedAction: string;
  status: ReportStatus;
  createdAt: string;
  summary?: string;
  submittedToAuthority?: boolean;
  submittedAt?: string;
}

// ============================================================
// Demo Asset
// ============================================================

export interface DemoAsset {
  id: string;
  assetName: string;
  assetType: AssetType;
  latitude: number;
  longitude: number;
  address: string;
  riskScore: number;
  riskLevel: RiskLevel;
  communityReports: number;
  unresolvedReports: number;
  engineerReports: number;
  observations: {
    cracks: SeverityLevel;
    erosion: SeverityLevel;
    seepage: SeverityLevel;
    settlement: SeverityLevel;
  };
  additionalIssues: string[];
  recommendedAction: string;
  status: ReportStatus;
}

// ============================================================
// API Responses
// ============================================================

export interface ImageValidationResponse {
  valid: boolean;
  blurScore: number;
  blurStatus: BlurStatus;
  relevant?: boolean;
  confidence?: number;
  category?: string;
  message?: string;
  isFallback?: boolean;
}

export interface AnalysisResponse {
  assessment: AssessmentResult;
  risk: RiskBreakdown;
  community?: CommunityData;
  engineerReports?: EngineerReport[];
  recommendedAction: string;
  isFallback?: boolean;
}

// ============================================================
// Map Marker
// ============================================================

export interface MapMarkerData {
  id: string;
  assetName: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: RiskLevel;
  assetType: AssetType;
  mainIssues?: string[];
}
