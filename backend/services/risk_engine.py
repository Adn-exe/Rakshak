"""Risk scoring engine — calculates explainable risk scores from structured findings.

Scoring weights (from spec):
    Cracks:            25%
    Erosion:           25%
    Seepage:           20%
    Settlement:        15%
    Additional issues: 10%
    Community reports:  5%

Severity → Score mapping:
    none / cannot_determine = 0
    minor / suspected       = 25
    moderate / visible      = 50
    severe                  = 100
"""

# Severity to numeric score mapping
SEVERITY_SCORES = {
    "none": 0,
    "cannot_determine": 0,
    "minor": 25,
    "suspected": 25,
    "moderate": 50,
    "visible": 50,
    "severe": 100,
}

# Weights for each factor
WEIGHTS = {
    "cracks": 0.25,
    "erosion": 0.25,
    "seepage": 0.20,
    "settlement": 0.15,
    "additional": 0.10,
    "community": 0.05,
}

# Risk level thresholds
RISK_THRESHOLDS = [
    (0, 24, "low"),
    (25, 49, "moderate"),
    (50, 74, "high"),
    (75, 100, "critical"),
]


def severity_to_score(severity: str) -> float:
    """Convert a severity string to a numeric score (0-100)."""
    return SEVERITY_SCORES.get(severity.lower(), 0)


def calculate_additional_score(issues: list[str]) -> float:
    """Score additional issues: 0 issues = 0, 1-2 = 25, 3-4 = 50, 5+ = 100."""
    count = len(issues)
    if count == 0:
        return 0
    elif count <= 2:
        return 25
    elif count <= 4:
        return 50
    else:
        return 100


def calculate_community_score(
    community_reports: int = 0,
    unresolved_reports: int = 0,
) -> float:
    """
    Score community data:
        0 reports = 0
        1-5 reports = 25
        6-15 reports = 50
        16+ reports or 3+ unresolved = 75-100
    """
    if community_reports == 0:
        return 0

    base = 0
    if community_reports <= 5:
        base = 25
    elif community_reports <= 15:
        base = 50
    else:
        base = 75

    # Boost for unresolved reports
    if unresolved_reports >= 5:
        base = min(base + 25, 100)
    elif unresolved_reports >= 3:
        base = min(base + 15, 100)

    return base


def classify_risk(score: float) -> str:
    """Convert numeric score to risk level string."""
    score = max(0, min(100, score))
    for low, high, level in RISK_THRESHOLDS:
        if low <= score <= high:
            return level
    return "critical"


def calculate_risk(
    assessment: dict,
    community_reports: int = 0,
    unresolved_reports: int = 0,
) -> dict:
    """
    Calculate explainable risk score from structured assessment findings.
    
    Args:
        assessment: dict with cracks, erosion, seepage, settlement findings
        community_reports: number of previous community reports
        unresolved_reports: number of unresolved community reports
    
    Returns:
        dict with individual scores, total score, and risk level
    """
    # Extract severity scores
    cracks_score = severity_to_score(
        assessment.get("cracks", {}).get("severity", "none")
    )
    erosion_score = severity_to_score(
        assessment.get("erosion", {}).get("severity", "none")
    )
    seepage_score = severity_to_score(
        assessment.get("seepage", {}).get("severity", "none")
    )
    settlement_score = severity_to_score(
        assessment.get("settlement", {}).get("severity", "none")
    )
    additional_score = calculate_additional_score(
        assessment.get("additional_issues", [])
    )
    community_score = calculate_community_score(
        community_reports, unresolved_reports
    )

    # Calculate weighted total
    weighted_total = (
        cracks_score * WEIGHTS["cracks"]
        + erosion_score * WEIGHTS["erosion"]
        + seepage_score * WEIGHTS["seepage"]
        + settlement_score * WEIGHTS["settlement"]
        + additional_score * WEIGHTS["additional"]
        + community_score * WEIGHTS["community"]
    )

    # Single severity floor rule:
    # Severe damage (100) on ANY single indicator MUST trigger Critical/High risk (floor 80)
    # Moderate/visible damage (50) on ANY single indicator MUST trigger High risk (floor 52)
    max_single = max(cracks_score, erosion_score, seepage_score, settlement_score)

    if max_single >= 100:
        total = max(weighted_total + 40, 80)
    elif max_single >= 50:
        total = max(weighted_total + 20, 52)
    else:
        total = weighted_total

    # Clamp to 0-100
    total = max(0, min(100, round(total)))

    return {
        "cracksScore": cracks_score,
        "erosionScore": erosion_score,
        "seepageScore": seepage_score,
        "settlementScore": settlement_score,
        "additionalScore": additional_score,
        "communityScore": community_score,
        "totalScore": total,
        "riskLevel": classify_risk(total),
    }


def generate_recommendation(risk_level: str, assessment: dict) -> str:
    """Generate recommended action text specifying department notice & community safety instructions."""
    if risk_level == "critical":
        return (
            "🚨 CRITICAL ACTION REQUIRED:\n"
            "• Department Notice: Immediately send notice to local Irrigation & Disaster Response Authorities via the button below.\n"
            "• Community Safety: Alert nearby residents, temporary shelter holders, and downstream occupants to stay away from the slope.\n"
            "• Field Inspection: Immediate emergency site deployment within 12–24 hours required."
        )
    elif risk_level == "high":
        concerns = []
        if assessment.get("erosion", {}).get("severity") in ("severe", "moderate"):
            concerns.append("eroded slope")
        if assessment.get("seepage", {}).get("severity") in ("visible", "severe"):
            concerns.append("suspected seepage area")
        if assessment.get("cracks", {}).get("severity") in ("severe", "moderate"):
            concerns.append("cracking patterns")

        specifics = f" ({', '.join(concerns)})" if concerns else ""

        return (
            "⚠️ HIGH PRIORITY ACTION:\n"
            "• Department Notice: Submit this Health Card notice to local department authorities for field dispatch.\n"
            "• Community Safety: Notify nearby residents and temporary occupants near the embankment to monitor for leaks.\n"
            f"• Field Inspection: Prioritize site inspection within 24–48 hours{specifics}."
        )
    elif risk_level == "moderate":
        return (
            "⚡ MODERATE ACTION RECOMMENDED:\n"
            "• Department Notice: Send notice to local authorities for routine inspection scheduling.\n"
            "• Community Safety: Advise nearby residents to report any worsening cracks or water seepage.\n"
            "• Field Inspection: Schedule site visit within 3–5 days."
        )
    else:
        return (
            "✅ ROUTINE MONITORING:\n"
            "• Department Notice: Saved for routine record-keeping.\n"
            "• Community Safety: No immediate evacuation needed. Report if visual damage worsens.\n"
            "• Field Inspection: Standard quarterly inspection recommended."
        )
