"""Seeded demo data for realistic Rakshak presentations.

Provides:
- 6 pre-built infrastructure assets representing River, Canal, Road, Railway, and Dam structures
- Community report records for each asset
- Engineer inspection records for each asset
- Fuzzy name matching for asset lookup
"""

from difflib import SequenceMatcher


# ============================================================
# Seeded Demo Assets
# ============================================================

DEMO_ASSETS = [
    {
        "id": "JR-2026-00401",
        "assetName": "Krishna River Embankment",
        "assetType": "river_embankment",
        "latitude": 16.5062,
        "longitude": 80.6480,
        "address": "Vijayawada, Andhra Pradesh",
        "riskScore": 68,
        "riskLevel": "high",
        "communityReports": 18,
        "unresolvedReports": 4,
        "engineerReports": 3,
        "observations": {
            "cracks": "moderate",
            "erosion": "severe",
            "seepage": "visible",
            "settlement": "minor",
        },
        "additionalIssues": ["surface erosion", "vegetation growth"],
        "recommendedAction": "Prioritize field inspection within 24–48 hours. Inspect the eroded slope and suspected seepage area.",
        "status": "new",
    },
    {
        "id": "JR-2026-00402",
        "assetName": "Musi River Embankment",
        "assetType": "river_embankment",
        "latitude": 17.3616,
        "longitude": 78.4747,
        "address": "Hyderabad, Telangana",
        "riskScore": 87,
        "riskLevel": "critical",
        "communityReports": 26,
        "unresolvedReports": 8,
        "engineerReports": 5,
        "observations": {
            "cracks": "severe",
            "erosion": "severe",
            "seepage": "severe",
            "settlement": "moderate",
        },
        "additionalIssues": [
            "surface erosion",
            "slope deformation",
            "drainage problems",
            "scouring",
            "exposed soil",
        ],
        "recommendedAction": "Immediate professional assessment recommended. Restrict access to the affected area.",
        "status": "inspection_required",
    },
    {
        "id": "JR-2026-00403",
        "assetName": "Cauvery Canal Bank",
        "assetType": "canal_embankment",
        "latitude": 12.4244,
        "longitude": 76.6637,
        "address": "Mysuru, Karnataka",
        "riskScore": 42,
        "riskLevel": "moderate",
        "communityReports": 9,
        "unresolvedReports": 2,
        "engineerReports": 2,
        "observations": {
            "cracks": "minor",
            "erosion": "moderate",
            "seepage": "suspected",
            "settlement": "none",
        },
        "additionalIssues": ["vegetation growth", "minor surface damage"],
        "recommendedAction": "Schedule inspection and continue community monitoring.",
        "status": "under_review",
    },
    {
        "id": "JR-2026-00404",
        "assetName": "NH-44 Hosur Road Slope",
        "assetType": "road_embankment",
        "latitude": 12.5266,
        "longitude": 78.2144,
        "address": "Hosur, Tamil Nadu",
        "riskScore": 74,
        "riskLevel": "high",
        "communityReports": 14,
        "unresolvedReports": 3,
        "engineerReports": 4,
        "observations": {
            "cracks": "moderate",
            "erosion": "severe",
            "seepage": "none",
            "settlement": "minor",
        },
        "additionalIssues": ["slope instability", "exposed soil"],
        "recommendedAction": "Inspect highway embankment slope stability after heavy rainfall.",
        "status": "action_recommended",
    },
    {
        "id": "JR-2026-00405",
        "assetName": "Tungabhadra Earthen Dam Structure",
        "assetType": "dam_reservoir",
        "latitude": 15.2689,
        "longitude": 76.3892,
        "address": "Hosapete, Karnataka",
        "riskScore": 38,
        "riskLevel": "moderate",
        "communityReports": 7,
        "unresolvedReports": 1,
        "engineerReports": 3,
        "observations": {
            "cracks": "none",
            "erosion": "minor",
            "seepage": "suspected",
            "settlement": "none",
        },
        "additionalIssues": ["minor seepage at spillway base"],
        "recommendedAction": "Monitor downstream seepage sensors and clear drainage spillways.",
        "status": "under_review",
    },
    {
        "id": "JR-2026-00406",
        "assetName": "Konkan Railway Hillside Slope",
        "assetType": "railway_embankment",
        "latitude": 16.9902,
        "longitude": 73.3120,
        "address": "Ratnagiri, Maharashtra",
        "riskScore": 18,
        "riskLevel": "low",
        "communityReports": 4,
        "unresolvedReports": 0,
        "engineerReports": 3,
        "observations": {
            "cracks": "none",
            "erosion": "minor",
            "seepage": "none",
            "settlement": "none",
        },
        "additionalIssues": [],
        "recommendedAction": "Routine pre-monsoon railway slope monitoring.",
        "status": "resolved",
    },
]


# ============================================================
# Community Report Data
# ============================================================

COMMUNITY_DATA = {
    "Krishna River Embankment": {
        "assetName": "Krishna River Embankment",
        "communityReports": 18,
        "unresolvedReports": 4,
        "resolvedReports": 14,
        "lastReport": "12 days ago",
        "averageSeverity": "moderate",
    },
    "Musi River Embankment": {
        "assetName": "Musi River Embankment",
        "communityReports": 26,
        "unresolvedReports": 8,
        "resolvedReports": 18,
        "lastReport": "3 days ago",
        "averageSeverity": "high",
    },
    "Cauvery Canal Bank": {
        "assetName": "Cauvery Canal Bank",
        "communityReports": 9,
        "unresolvedReports": 2,
        "resolvedReports": 7,
        "lastReport": "21 days ago",
        "averageSeverity": "moderate",
    },
    "NH-44 Hosur Road Slope": {
        "assetName": "NH-44 Hosur Road Slope",
        "communityReports": 14,
        "unresolvedReports": 3,
        "resolvedReports": 11,
        "lastReport": "5 days ago",
        "averageSeverity": "high",
    },
    "Tungabhadra Earthen Dam Structure": {
        "assetName": "Tungabhadra Earthen Dam Structure",
        "communityReports": 7,
        "unresolvedReports": 1,
        "resolvedReports": 6,
        "lastReport": "15 days ago",
        "averageSeverity": "moderate",
    },
    "Konkan Railway Hillside Slope": {
        "assetName": "Konkan Railway Hillside Slope",
        "communityReports": 4,
        "unresolvedReports": 0,
        "resolvedReports": 4,
        "lastReport": "40 days ago",
        "averageSeverity": "low",
    },
}


# ============================================================
# Engineer Report Data
# ============================================================

ENGINEER_REPORTS = {
    "Krishna River Embankment": [
        {
            "id": "EN-204",
            "date": "14 Aug 2026",
            "finding": "Moderate toe erosion observed along a 120 m section.",
            "status": "Monitoring",
            "recommended": "Reinforce drainage and inspect after heavy rainfall.",
        },
        {
            "id": "EN-187",
            "date": "02 Aug 2026",
            "finding": "Minor surface cracking with no significant deformation observed.",
            "status": "Routine Monitoring",
            "recommended": None,
        },
    ],
    "Musi River Embankment": [
        {
            "id": "EN-221",
            "date": "20 Aug 2026",
            "finding": "Severe erosion along 200 m section. Multiple seepage points identified.",
            "status": "Critical",
            "recommended": "Immediate reinforcement required.",
        },
    ],
    "Cauvery Canal Bank": [
        {
            "id": "EN-195",
            "date": "05 Aug 2026",
            "finding": "Minor erosion at canal bend. Vegetation overgrowth partially stabilizing.",
            "status": "Monitoring",
            "recommended": "Trim vegetation, monitor erosion.",
        },
    ],
    "NH-44 Hosur Road Slope": [
        {
            "id": "EN-210",
            "date": "16 Aug 2026",
            "finding": "Soil erosion along highway slope embankment due to runoff.",
            "status": "Action Recommended",
            "recommended": "Install geotextile matting and rock riprap.",
        },
    ],
    "Tungabhadra Earthen Dam Structure": [
        {
            "id": "EN-205",
            "date": "11 Aug 2026",
            "finding": "Spillway base inspection. Minor dampness noted near left abutment.",
            "status": "Monitoring",
            "recommended": "Check piezometer readings weekly.",
        },
    ],
    "Konkan Railway Hillside Slope": [
        {
            "id": "EN-199",
            "date": "08 Aug 2026",
            "finding": "Routine inspection. Slope mesh in tact, no rockfall hazard.",
            "status": "Routine Monitoring",
            "recommended": None,
        },
    ],
}


def get_all_demo_assets() -> list[dict]:
    """Return all seeded demo assets."""
    return DEMO_ASSETS


def find_matching_asset(asset_name: str) -> dict | None:
    """Find a demo asset by fuzzy name matching."""
    if not asset_name:
        return None

    best_match = None
    best_ratio = 0.0

    all_names = list(COMMUNITY_DATA.keys()) + [a["assetName"] for a in DEMO_ASSETS]
    all_names = list(set(all_names))

    for name in all_names:
        ratio = SequenceMatcher(None, asset_name.lower(), name.lower()).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_match = name

    if best_ratio >= 0.6:
        return best_match
    return None


def get_community_data(asset_name: str) -> dict | None:
    """Get community report data for an asset (with fuzzy matching)."""
    if asset_name in COMMUNITY_DATA:
        return COMMUNITY_DATA[asset_name]

    matched_name = find_matching_asset(asset_name)
    if matched_name and matched_name in COMMUNITY_DATA:
        return COMMUNITY_DATA[matched_name]

    return None


def get_engineer_reports(asset_name: str) -> list[dict]:
    """Get engineer inspection reports for an asset (with fuzzy matching)."""
    if asset_name in ENGINEER_REPORTS:
        return ENGINEER_REPORTS[asset_name]

    matched_name = find_matching_asset(asset_name)
    if matched_name and matched_name in ENGINEER_REPORTS:
        return ENGINEER_REPORTS[matched_name]

    return []
