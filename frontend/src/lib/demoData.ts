/**
 * Demo data for client-side initialization.
 * This mirrors backend/services/demo_data.py for offline/local use.
 */

import type { DemoAsset, CommunityData, EngineerReport } from '@/types';

export const DEMO_ASSETS: DemoAsset[] = [
  {
    id: 'JR-2026-00401',
    assetName: 'Krishna River Embankment',
    assetType: 'river_embankment',
    latitude: 16.5062,
    longitude: 80.648,
    address: 'Vijayawada, Andhra Pradesh',
    riskScore: 68,
    riskLevel: 'high',
    communityReports: 18,
    unresolvedReports: 4,
    engineerReports: 3,
    observations: { cracks: 'moderate', erosion: 'severe', seepage: 'visible', settlement: 'minor' },
    additionalIssues: ['surface erosion', 'vegetation growth'],
    recommendedAction: '⚠️ HIGH PRIORITY ACTION:\n• Department Notice: Submit this Health Card notice to local department authorities for field dispatch.\n• Community Safety: Notify nearby residents and temporary occupants near the embankment to monitor for leaks.\n• Field Inspection: Prioritize site inspection within 24–48 hours.',
    status: 'new',
  },
  {
    id: 'JR-2026-00402',
    assetName: 'Musi River Embankment',
    assetType: 'river_embankment',
    latitude: 17.3616,
    longitude: 78.4747,
    address: 'Hyderabad, Telangana',
    riskScore: 87,
    riskLevel: 'critical',
    communityReports: 26,
    unresolvedReports: 8,
    engineerReports: 5,
    observations: { cracks: 'severe', erosion: 'severe', seepage: 'severe', settlement: 'moderate' },
    additionalIssues: ['surface erosion', 'slope deformation', 'drainage problems', 'scouring', 'exposed soil'],
    recommendedAction: '🚨 CRITICAL ACTION REQUIRED:\n• Department Notice: Immediately send notice to local Irrigation & Disaster Response Authorities via the button below.\n• Community Safety: Alert nearby residents, temporary shelter holders, and downstream occupants to stay away from the slope.\n• Field Inspection: Immediate emergency site deployment within 12–24 hours required.',
    status: 'inspection_required',
  },
  {
    id: 'JR-2026-00403',
    assetName: 'Cauvery Canal Bank',
    assetType: 'canal_embankment',
    latitude: 12.4244,
    longitude: 76.6637,
    address: 'Mysuru, Karnataka',
    riskScore: 42,
    riskLevel: 'moderate',
    communityReports: 9,
    unresolvedReports: 2,
    engineerReports: 2,
    observations: { cracks: 'minor', erosion: 'moderate', seepage: 'suspected', settlement: 'none' },
    additionalIssues: ['vegetation growth', 'minor surface damage'],
    recommendedAction: 'Schedule inspection and continue community monitoring.',
    status: 'under_review',
  },
  {
    id: 'JR-2026-00404',
    assetName: 'NH-44 Hosur Road Slope',
    assetType: 'road_embankment',
    latitude: 12.5266,
    longitude: 78.2144,
    address: 'Hosur, Tamil Nadu',
    riskScore: 74,
    riskLevel: 'high',
    communityReports: 14,
    unresolvedReports: 3,
    engineerReports: 4,
    observations: { cracks: 'moderate', erosion: 'severe', seepage: 'none', settlement: 'minor' },
    additionalIssues: ['slope instability', 'exposed soil'],
    recommendedAction: 'Inspect highway embankment slope stability after heavy rainfall.',
    status: 'action_recommended',
  },
  {
    id: 'JR-2026-00405',
    assetName: 'Tungabhadra Earthen Dam Structure',
    assetType: 'dam_reservoir',
    latitude: 15.2689,
    longitude: 76.3892,
    address: 'Hosapete, Karnataka',
    riskScore: 38,
    riskLevel: 'moderate',
    communityReports: 7,
    unresolvedReports: 1,
    engineerReports: 3,
    observations: { cracks: 'none', erosion: 'minor', seepage: 'suspected', settlement: 'none' },
    additionalIssues: ['minor seepage at spillway base'],
    recommendedAction: 'Monitor downstream seepage sensors and clear drainage spillways.',
    status: 'under_review',
  },
  {
    id: 'JR-2026-00406',
    assetName: 'Konkan Railway Hillside Slope',
    assetType: 'railway_embankment',
    latitude: 16.9902,
    longitude: 73.312,
    address: 'Ratnagiri, Maharashtra',
    riskScore: 18,
    riskLevel: 'low',
    communityReports: 4,
    unresolvedReports: 0,
    engineerReports: 3,
    observations: { cracks: 'none', erosion: 'minor', seepage: 'none', settlement: 'none' },
    additionalIssues: [],
    recommendedAction: 'Routine pre-monsoon railway slope monitoring.',
    status: 'resolved',
  },
];

export const COMMUNITY_DATA: Record<string, CommunityData> = {
  'Krishna River Embankment': {
    assetName: 'Krishna River Embankment',
    communityReports: 18,
    unresolvedReports: 4,
    resolvedReports: 14,
    lastReport: '12 days ago',
    averageSeverity: 'moderate',
  },
  'Musi River Embankment': {
    assetName: 'Musi River Embankment',
    communityReports: 26,
    unresolvedReports: 8,
    resolvedReports: 18,
    lastReport: '3 days ago',
    averageSeverity: 'high',
  },
  'Cauvery Canal Bank': {
    assetName: 'Cauvery Canal Bank',
    communityReports: 9,
    unresolvedReports: 2,
    resolvedReports: 7,
    lastReport: '21 days ago',
    averageSeverity: 'moderate',
  },
  'NH-44 Hosur Road Slope': {
    assetName: 'NH-44 Hosur Road Slope',
    communityReports: 14,
    unresolvedReports: 3,
    resolvedReports: 11,
    lastReport: '5 days ago',
    averageSeverity: 'high',
  },
  'Tungabhadra Earthen Dam Structure': {
    assetName: 'Tungabhadra Earthen Dam Structure',
    communityReports: 7,
    unresolvedReports: 1,
    resolvedReports: 6,
    lastReport: '15 days ago',
    averageSeverity: 'moderate',
  },
  'Konkan Railway Hillside Slope': {
    assetName: 'Konkan Railway Hillside Slope',
    communityReports: 4,
    unresolvedReports: 0,
    resolvedReports: 4,
    lastReport: '40 days ago',
    averageSeverity: 'low',
  },
};

export const ENGINEER_REPORTS: Record<string, EngineerReport[]> = {
  'Krishna River Embankment': [
    { id: 'EN-204', date: '14 Aug 2026', finding: 'Moderate toe erosion observed along a 120 m section.', status: 'Monitoring', recommended: 'Reinforce drainage and inspect after heavy rainfall.' },
    { id: 'EN-187', date: '02 Aug 2026', finding: 'Minor surface cracking with no significant deformation observed.', status: 'Routine Monitoring' },
    { id: 'EN-156', date: '18 Jul 2026', finding: 'Seepage detected at two locations near the base.', status: 'Under Observation', recommended: 'Install piezometers for continuous monitoring.' },
  ],
  'Musi River Embankment': [
    { id: 'EN-221', date: '20 Aug 2026', finding: 'Severe erosion along 200 m section. Multiple seepage points identified.', status: 'Critical', recommended: 'Immediate reinforcement required.' },
    { id: 'EN-209', date: '10 Aug 2026', finding: 'Progressive erosion confirmed. Settlement of 15 cm measured.', status: 'Critical', recommended: 'Restrict public access.' },
    { id: 'EN-198', date: '01 Aug 2026', finding: 'Moderate cracking pattern consistent with differential settlement.', status: 'Action Required', recommended: 'Clear drainage, install crack monitors.' },
  ],
  'Cauvery Canal Bank': [
    { id: 'EN-195', date: '05 Aug 2026', finding: 'Minor erosion at canal bend. Vegetation overgrowth partially stabilizing.', status: 'Monitoring', recommended: 'Trim vegetation, monitor erosion.' },
  ],
  'NH-44 Hosur Road Slope': [
    { id: 'EN-210', date: '16 Aug 2026', finding: 'Soil erosion along highway slope embankment due to runoff.', status: 'Action Recommended', recommended: 'Install geotextile matting and rock riprap.' },
    { id: 'EN-190', date: '30 Jul 2026', finding: 'Minor shoulder cracks noted after monsoon spell.', status: 'Monitoring' },
  ],
  'Tungabhadra Earthen Dam Structure': [
    { id: 'EN-205', date: '11 Aug 2026', finding: 'Spillway base inspection. Minor dampness noted near left abutment.', status: 'Monitoring', recommended: 'Check piezometer readings weekly.' },
    { id: 'EN-178', date: '22 Jul 2026', finding: 'Pre-monsoon dam safety check. Structure stable.', status: 'Routine Monitoring' },
  ],
  'Konkan Railway Hillside Slope': [
    { id: 'EN-199', date: '08 Aug 2026', finding: 'Routine inspection. Slope mesh in tact, no rockfall hazard.', status: 'Routine Monitoring' },
  ],
};

/** Get community data with simple fuzzy matching. */
export function getCommunityData(assetName: string): CommunityData | null {
  if (COMMUNITY_DATA[assetName]) return COMMUNITY_DATA[assetName];
  for (const key of Object.keys(COMMUNITY_DATA)) {
    if (
      assetName.toLowerCase().includes(key.toLowerCase().split(' ')[0]) &&
      assetName.toLowerCase().includes(key.toLowerCase().split(' ').slice(-1)[0])
    ) {
      return COMMUNITY_DATA[key];
    }
  }
  return null;
}

/** Get engineer reports with simple fuzzy matching. */
export function getEngineerReports(assetName: string): EngineerReport[] {
  if (ENGINEER_REPORTS[assetName]) return ENGINEER_REPORTS[assetName];
  for (const key of Object.keys(ENGINEER_REPORTS)) {
    if (
      assetName.toLowerCase().includes(key.toLowerCase().split(' ')[0]) &&
      assetName.toLowerCase().includes(key.toLowerCase().split(' ').slice(-1)[0])
    ) {
      return ENGINEER_REPORTS[key];
    }
  }
  return [];
}
