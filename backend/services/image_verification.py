"""Image relevance verification using Google Gemini multimodal API."""

import os
import json
import base64
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Valid infrastructure categories for the platform
VALID_CATEGORIES = [
    "river_embankment",
    "canal_embankment",
    "road_embankment",
    "railway_embankment",
    "dam_structure",
    "retaining_wall",
    "slope_structure",
    "damaged_infrastructure",
    "flood_infrastructure",
]

RELEVANCE_PROMPT = """You are an image classification system for JalRaksha, an infrastructure health monitoring platform.

Analyze this image and determine if it shows infrastructure relevant to embankment/infrastructure inspection.

VALID subjects include:
- River embankments, canal banks, flood embankments
- Road embankments, railway embankments
- Dam structures, reservoir walls
- Retaining walls, slope structures
- Any visibly damaged infrastructure (cracks, erosion, seepage, settlement)
- Construction/civil engineering structures near water bodies

INVALID subjects include:
- People, selfies, portraits
- Animals (cats, dogs, etc.)
- Food, vehicles (interiors or full), household items
- Screenshots, text documents
- Random landscapes with no infrastructure
- Unrelated buildings (homes, offices without visible damage)
- Abstract images, memes

Respond ONLY with a valid JSON object (no markdown, no code fences):
{
  "is_relevant": true/false,
  "confidence": 0.0 to 1.0,
  "category": "one of: river_embankment, canal_embankment, road_embankment, railway_embankment, dam_structure, retaining_wall, slope_structure, damaged_infrastructure, flood_infrastructure, not_relevant",
  "reason": "brief explanation"
}"""


async def verify_image_relevance(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Check if an image is relevant to infrastructure inspection using Gemini.
    
    Returns:
        dict with is_relevant, confidence, category, reason
    """
    if not GEMINI_API_KEY:
        logger.warning("No GEMINI_API_KEY configured, using demo fallback")
        return _demo_fallback()

    try:
        import io
        from PIL import Image
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-3.6-flash")

        pil_image = Image.open(io.BytesIO(image_bytes))

        response = model.generate_content(
            [
                RELEVANCE_PROMPT,
                pil_image,
            ],
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1,
                max_output_tokens=256,
            ),
        )

        text = response.text.strip()
        result = json.loads(text)
        return {
            "is_relevant": bool(result.get("is_relevant", False)),
            "confidence": float(result.get("confidence", 0.0)),
            "category": result.get("category", "not_relevant"),
            "reason": result.get("reason", ""),
        }

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response: {e}")
        return _demo_fallback()
    except Exception as e:
        logger.error(f"Gemini relevance check failed: {e}")
        return _demo_fallback()


def _demo_fallback() -> dict:
    """Fallback response for demo when API is unavailable."""
    return {
        "is_relevant": True,
        "confidence": 0.85,
        "category": "river_embankment",
        "reason": "Demo mode: image accepted as relevant infrastructure.",
        "is_fallback": True,
    }
