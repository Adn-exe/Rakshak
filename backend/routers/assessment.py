"""Structural assessment endpoint — full analysis pipeline."""

import json
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from services.structural_assessment import assess_structure
from services.risk_engine import calculate_risk, generate_recommendation
from services.demo_data import get_community_data, get_engineer_reports
from typing import Optional

router = APIRouter()


@router.post("/analyze")
async def analyze_infrastructure(
    file: UploadFile = File(...),
    assetName: str = Form(...),
    assetType: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: Optional[str] = Form(None),
    observations: Optional[str] = Form(None),
    language: str = Form("en"),
):
    """
    Full infrastructure analysis pipeline:
        Image → Structural Assessment → Risk Engine → Health Card data
    
    Also retrieves matching community and engineer data.
    """
    contents = await file.read()

    # Parse observations JSON if provided
    obs_dict = None
    if observations:
        try:
            obs_dict = json.loads(observations)
        except json.JSONDecodeError:
            obs_dict = None

    # Step 1: Structural assessment (Gemini)
    try:
        assessment = await assess_structure(
            image_bytes=contents,
            mime_type=file.content_type or "image/jpeg",
            asset_name=assetName,
            asset_type=assetType,
            description=description or "",
            observations=obs_dict,
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "assessment_failed",
                "message": "Assessment service is temporarily unavailable. Please try again.",
            },
        )

    # Step 2: Get community data (fuzzy match)
    community = get_community_data(assetName)
    community_reports = community["communityReports"] if community else 0
    unresolved = community["unresolvedReports"] if community else 0

    # Step 3: Risk calculation
    risk = calculate_risk(
        assessment=assessment,
        community_reports=community_reports,
        unresolved_reports=unresolved,
    )

    # Step 4: Generate recommendation
    recommended_action = generate_recommendation(risk["riskLevel"], assessment)

    # Step 5: Get engineer reports
    engineer_reports = get_engineer_reports(assetName)

    # Build response
    response = {
        "assessment": {
            "cracks": assessment["cracks"],
            "erosion": assessment["erosion"],
            "seepage": assessment["seepage"],
            "settlement": assessment["settlement"],
            "additionalIssues": assessment.get("additional_issues", []),
            "summary": assessment.get("summary", ""),
        },
        "risk": risk,
        "recommendedAction": recommended_action,
    }

    if community:
        response["community"] = community

    if engineer_reports:
        response["engineerReports"] = engineer_reports

    if assessment.get("is_fallback"):
        response["isFallback"] = True

    return response
