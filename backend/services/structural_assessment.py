"""Structural assessment using Google Gemini multimodal API."""

import os
import json
import base64
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

ASSESSMENT_PROMPT = """You are a structural assessment system for JalRaksha, an infrastructure health monitoring platform.

Analyze this infrastructure photograph for visible structural conditions. Be honest — only report what you can actually see. Do NOT fabricate findings.

For each of the following, assess the severity:

1. CRACKS: Look for visible cracks on surfaces, walls, slopes
   Severity: "none" | "minor" | "moderate" | "severe" | "cannot_determine"

2. EROSION: Look for soil loss, surface erosion, wash-away, exposed foundations
   Severity: "none" | "minor" | "moderate" | "severe" | "cannot_determine"

3. SEEPAGE: Look for water coming through structure, moisture stains, wet patches
   Severity: "none" | "suspected" | "visible" | "severe" | "cannot_determine"

4. SETTLEMENT: Look for sinking, depressions, uneven surfaces, tilting
   Severity: "none" | "minor" | "moderate" | "severe" | "cannot_determine"

For each finding, provide:
- severity: one of the options above
- confidence: 0.0 to 1.0 (how confident you are in this assessment)
- explanation: brief description of what you observe (1-2 sentences)

Also identify any additional visible issues from this list:
- surface erosion, slope deformation, vegetation-related damage, surface collapse
- drainage problems, scouring, structural surface damage, debris obstruction
- exposed soil, other visible concerns

IMPORTANT: Clearly distinguish between what is OBSERVED and what is NOT visually determinable.

{user_context}

Respond ONLY with a valid JSON object (no markdown, no code fences):
{{
  "cracks": {{
    "severity": "...",
    "confidence": 0.0,
    "explanation": "..."
  }},
  "erosion": {{
    "severity": "...",
    "confidence": 0.0,
    "explanation": "..."
  }},
  "seepage": {{
    "severity": "...",
    "confidence": 0.0,
    "explanation": "..."
  }},
  "settlement": {{
    "severity": "...",
    "confidence": 0.0,
    "explanation": "..."
  }},
  "additional_issues": ["issue1", "issue2"],
  "summary": "Brief overall assessment summary (2-3 sentences)"
}}"""


async def assess_structure(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    asset_name: str = "",
    asset_type: str = "",
    description: str = "",
    observations: dict | None = None,
) -> dict:
    """
    Perform structural assessment on an infrastructure image using Gemini.
    
    Returns:
        dict with cracks, erosion, seepage, settlement findings,
        additional_issues list, and summary.
    """
    if not GEMINI_API_KEY:
        logger.warning("No GEMINI_API_KEY configured, using demo fallback")
        return _demo_fallback(observations)

    try:
        import io
        from PIL import Image
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-3.6-flash")

        # Build user context from provided metadata
        context_parts = []
        if asset_name:
            context_parts.append(f"Asset: {asset_name}")
        if asset_type:
            context_parts.append(f"Type: {asset_type}")
        if description:
            context_parts.append(f"User description: {description}")
        if observations:
            obs_parts = []
            for key, val in observations.items():
                if val and val != "not_sure":
                    obs_parts.append(f"User observed {key}: {val}")
            if obs_parts:
                context_parts.append("User field observations: " + "; ".join(obs_parts))

        user_context = ""
        if context_parts:
            user_context = "Additional context provided by reporter:\n" + "\n".join(context_parts)

        prompt = ASSESSMENT_PROMPT.format(user_context=user_context)

        # Open PIL image for native Gemini Multimodal analysis
        pil_image = Image.open(io.BytesIO(image_bytes))

        response = model.generate_content(
            [
                prompt,
                pil_image,
            ],
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1,
                max_output_tokens=1024,
            ),
        )

        text = response.text.strip()
        result = json.loads(text)
        logger.info("Successfully completed AI multimodal photo assessment using gemini-3.6-flash")

        # Validate and normalize the response
        return _normalize_assessment(result)

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini assessment response: {e}")
        return _demo_fallback(observations)
    except Exception as e:
        logger.error(f"Gemini structural assessment failed: {e}")
        return _demo_fallback(observations)


def _normalize_assessment(result: dict) -> dict:
    """Ensure assessment result has all required fields with valid values."""
    valid_crack_severities = {"none", "minor", "moderate", "severe", "cannot_determine"}
    valid_seepage_severities = {"none", "suspected", "visible", "severe", "cannot_determine"}

    for field in ["cracks", "erosion", "settlement"]:
        if field not in result or not isinstance(result[field], dict):
            result[field] = {
                "severity": "cannot_determine",
                "confidence": 0.0,
                "explanation": "Could not assess from the provided image.",
            }
        else:
            sev = result[field].get("severity", "cannot_determine")
            if sev not in valid_crack_severities:
                result[field]["severity"] = "cannot_determine"
            result[field].setdefault("confidence", 0.5)
            result[field].setdefault("explanation", "")

    # Seepage has different severity levels
    if "seepage" not in result or not isinstance(result["seepage"], dict):
        result["seepage"] = {
            "severity": "cannot_determine",
            "confidence": 0.0,
            "explanation": "Could not assess from the provided image.",
        }
    else:
        sev = result["seepage"].get("severity", "cannot_determine")
        if sev not in valid_seepage_severities:
            result["seepage"]["severity"] = "cannot_determine"
        result["seepage"].setdefault("confidence", 0.5)
        result["seepage"].setdefault("explanation", "")

    result.setdefault("additional_issues", [])
    result.setdefault("summary", "Assessment completed based on visual analysis.")

    return result


def _demo_fallback(observations: dict | None = None) -> dict:
    """Generate realistic demo assessment data when API is unavailable."""
    # Use user observations to influence the demo assessment
    cracks_sev = "moderate"
    erosion_sev = "severe"
    seepage_sev = "visible"
    settlement_sev = "minor"

    if observations:
        if observations.get("cracks") == "yes":
            cracks_sev = "moderate"
        elif observations.get("cracks") == "no":
            cracks_sev = "none"

        if observations.get("seepage") == "yes":
            seepage_sev = "visible"
        elif observations.get("seepage") == "no":
            seepage_sev = "none"

        if observations.get("settlement") == "yes":
            settlement_sev = "moderate"
        elif observations.get("settlement") == "no":
            settlement_sev = "none"

        if observations.get("erosion") == "yes":
            erosion_sev = "severe"
        elif observations.get("erosion") == "no":
            erosion_sev = "none"

    return {
        "cracks": {
            "severity": cracks_sev,
            "confidence": 0.84,
            "explanation": "Visible linear cracking appears on the upper slope surface."
            if cracks_sev != "none"
            else "No visible cracks detected in the image.",
        },
        "erosion": {
            "severity": erosion_sev,
            "confidence": 0.91,
            "explanation": "Significant soil loss is visible along the lower edge of the embankment."
            if erosion_sev != "none"
            else "No significant erosion visible.",
        },
        "seepage": {
            "severity": seepage_sev,
            "confidence": 0.73,
            "explanation": "Possible moisture and seepage visible near the base of the structure."
            if seepage_sev != "none"
            else "No seepage indicators observed.",
        },
        "settlement": {
            "severity": settlement_sev,
            "confidence": 0.62,
            "explanation": "Localized surface depression may indicate minor settlement."
            if settlement_sev != "none"
            else "No settlement observed in the visible area.",
        },
        "additional_issues": ["surface erosion", "vegetation growth"],
        "summary": "Significant surface erosion is visible along the lower slope. Localized seepage is also suspected near the base.",
        "is_fallback": True,
    }
