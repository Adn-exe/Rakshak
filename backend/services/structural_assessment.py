import os
import re
import json
import base64
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

ASSESSMENT_PROMPT = """You are a senior civil & structural engineering inspector for Rakshak, evaluating critical infrastructure (river embankments, canal banks, dams, road slopes, and railway embankments).

Carefully inspect this photograph at pixel level for structural defects, distress mechanisms, and visual defects.

For each of the following 4 structural indicators, assess the severity:

1. CRACKS: Look for visible cracks on surfaces, concrete, walls, slopes, embankment crests
   Severity: "none" | "minor" | "moderate" | "severe"

2. EROSION: Look for soil loss, surface erosion, wash-away, exposed foundations, scouring, toe erosion
   Severity: "none" | "minor" | "moderate" | "severe"

3. SEEPAGE: Look for water coming through structure, moisture stains, wet patches, piping boils
   Severity: "none" | "suspected" | "visible" | "severe"

4. SETTLEMENT: Look for sinking, depressions, uneven surfaces, tilting, slope slump, embankment subsidence
   Severity: "none" | "minor" | "moderate" | "severe"

For each finding, provide:
- severity: strictly one of the allowed severity strings above
- confidence: 0.0 to 1.0 (how confident you are in this assessment)
- explanation: detailed, professional engineering description of what you observe in the photo (1-2 sentences)

Also identify any additional visible issues from this list:
- surface erosion, slope deformation, vegetation-related damage, surface collapse
- drainage problems, scouring, structural surface damage, debris obstruction
- exposed soil, other visible concerns

{user_context}

Respond ONLY with a valid JSON object:
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


def _extract_json(text: str) -> dict:
    """Robustly extract and parse JSON object from LLM response (handling think tags and markdown)."""
    cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    try:
        return json.loads(cleaned)
    except Exception:
        pass
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
    first_brace = cleaned.find('{')
    last_brace = cleaned.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        return json.loads(cleaned[first_brace:last_brace + 1])
    raise ValueError(f"Could not parse valid JSON from model output: {text[:150]}...")


def _assess_with_groq(image_bytes: bytes, prompt: str) -> dict | None:
    """Fallback photo assessment using Groq Vision API with robust JSON extraction."""
    if not GROQ_API_KEY:
        return None
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        base64_image = base64.b64encode(image_bytes).decode("utf-8")

        models = ["qwen/qwen3.8-27b", "qwen/qwen3.6-27b"]
        for m in models:
            try:
                completion = client.chat.completions.create(
                    model=m,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a senior civil & geotechnical structural inspection expert for critical flood & water infrastructure. Return ONLY a valid JSON object. Do not output verbose thinking.",
                        },
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_image}"
                                    }
                                }
                            ]
                        }
                    ],
                    temperature=0.1,
                    max_tokens=4096,
                    response_format={"type": "json_object"}
                )
                text = completion.choices[0].message.content.strip()
                result = _extract_json(text)
                logger.info(f"Successfully completed AI photo assessment using Groq ({m})")
                return result
            except Exception as e:
                logger.warning(f"Groq model {m} failed: {e}")
                continue
        return None
    except Exception as e:
        logger.error(f"Groq vision assessment error: {e}")
        return None


async def assess_structure(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    asset_name: str = "",
    asset_type: str = "",
    description: str = "",
    observations: dict | None = None,
) -> dict:
    """
    Perform structural assessment on an infrastructure image using Gemini with Groq fallback.
    
    Returns:
        dict with cracks, erosion, seepage, settlement findings,
        additional_issues list, and summary.
    """
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
                obs_parts.append(f"User field observations: {val}")
        if obs_parts:
            context_parts.append("; ".join(obs_parts))

    user_context = ""
    if context_parts:
        user_context = "Additional context provided by reporter:\n" + "\n".join(context_parts)

    prompt = ASSESSMENT_PROMPT.format(user_context=user_context)

    # 1. Try primary AI vision engine: Google Gemini
    if GEMINI_API_KEY:
        try:
            import io
            from PIL import Image
            import google.generativeai as genai

            genai.configure(api_key=GEMINI_API_KEY)
            pil_image = Image.open(io.BytesIO(image_bytes))
            gemini_models = ["gemini-flash-latest", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.7-flash"]

            for m_name in gemini_models:
                try:
                    model = genai.GenerativeModel(m_name)
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
                    result = _extract_json(text)
                    logger.info(f"Successfully completed AI photo assessment using {m_name}")
                    return _normalize_assessment(result)
                except Exception as m_err:
                    logger.warning(f"Gemini model {m_name} failed: {m_err}")
                    continue
        except Exception as e:
            logger.warning(f"Gemini photo assessment failed ({e}), failing over to Groq AI...")

    # 2. Try secondary AI vision engine: Groq (Vision)
    if GROQ_API_KEY:
        groq_result = _assess_with_groq(image_bytes, prompt)
        if groq_result:
            return _normalize_assessment(groq_result)

    # 3. Fallback if both primary and secondary AI engines fail
    logger.warning("No AI vision service available, using observation fallback")
    return _demo_fallback(observations)


def _normalize_assessment(result: dict) -> dict:
    """Ensure assessment result has all required fields with accurate severity values."""
    valid_severities = {"none", "minor", "moderate", "severe", "visible", "suspected", "cannot_determine"}

    for field in ["cracks", "erosion", "seepage", "settlement"]:
        val = result.get(field)
        if isinstance(val, str):
            # Model returned a text explanation instead of a dict — intelligently infer severity
            text_lower = val.lower()
            if any(k in text_lower for k in ["severe", "major", "heavy", "significant", "deep", "fissure", "collapse", "critical"]):
                inferred_sev = "severe"
            elif any(k in text_lower for k in ["moderate", "visible", "distinct", "noticeable", "clear", "evident", "multiple", "branching"]):
                inferred_sev = "visible" if field == "seepage" else "moderate"
            elif any(k in text_lower for k in ["minor", "slight", "hairline", "suspected", "small", "shallow"]):
                inferred_sev = "suspected" if field == "seepage" else "minor"
            elif any(k in text_lower for k in ["no ", "none", "not visible", "no visible", "absent", "no signs", "no evidence"]):
                inferred_sev = "none"
            else:
                inferred_sev = "moderate" if len(text_lower) > 15 else "none"

            result[field] = {
                "severity": inferred_sev,
                "confidence": 0.88,
                "explanation": val,
            }
        elif isinstance(val, dict):
            sev = str(val.get("severity", "cannot_determine")).lower().strip()
            if sev not in valid_severities:
                sev = "cannot_determine"
            result[field]["severity"] = sev
            result[field].setdefault("confidence", 0.85)
            result[field].setdefault("explanation", "")
        else:
            result[field] = {
                "severity": "none",
                "confidence": 0.5,
                "explanation": "No significant visual defect observed.",
            }

    result.setdefault("additional_issues", [])
    result.setdefault("summary", "Structural assessment completed from photographic visual evidence.")

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
