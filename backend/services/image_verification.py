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


import re


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


def _verify_with_groq(image_bytes: bytes) -> dict | None:
    """Fallback image relevance check using Groq Vision API with robust JSON extraction."""
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
                            "content": "You are a civil & geotechnical infrastructure classification expert. Return ONLY a valid JSON object.",
                        },
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": RELEVANCE_PROMPT},
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
                    max_tokens=2048,
                    response_format={"type": "json_object"}
                )
                text = completion.choices[0].message.content.strip()
                result = _extract_json(text)
                return {
                    "is_relevant": bool(result.get("is_relevant", False)),
                    "confidence": float(result.get("confidence", 0.0)),
                    "category": result.get("category", "not_relevant"),
                    "reason": result.get("reason", ""),
                }
            except Exception as e:
                logger.warning(f"Groq model {m} relevance check failed: {e}")
                continue
        return None
    except Exception as e:
        logger.error(f"Groq relevance check error: {e}")
        return None


async def verify_image_relevance(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Check if an image is relevant to infrastructure inspection using Gemini with Groq fallback.
    
    Returns:
        dict with is_relevant, confidence, category, reason
    """
    # 1. Try Gemini 3.6 Flash
    if GEMINI_API_KEY:
        try:
            import io
            from PIL import Image
            import google.generativeai as genai

            genai.configure(api_key=GEMINI_API_KEY)
            pil_image = Image.open(io.BytesIO(image_bytes))
            gemini_models = ["gemini-3.6-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-flash-latest"]

            for m_name in gemini_models:
                try:
                    model = genai.GenerativeModel(m_name)
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
                except Exception as m_err:
                    logger.warning(f"Gemini relevance model {m_name} failed: {m_err}")
                    continue
        except Exception as e:
            logger.warning(f"Gemini relevance check failed ({e}), failing over to Groq AI...")

    # 2. Try Groq (Llama 3.2 Vision)
    if GROQ_API_KEY:
        groq_result = _verify_with_groq(image_bytes)
        if groq_result:
            return groq_result

    # 3. Fallback if both primary and secondary AI engines fail
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
