"""Image validation endpoint — blur detection + relevance verification."""

from fastapi import APIRouter, File, UploadFile, HTTPException
from services.image_quality import assess_image_quality
from services.image_verification import verify_image_relevance

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/validate-image")
async def validate_image(file: UploadFile = File(...)):
    """
    Validate an uploaded image for quality and relevance.
    
    Pipeline:
        1. Check file type (JPG, PNG, WEBP)
        2. Check file size (max 10 MB)
        3. Blur detection (Laplacian variance)
        4. If quality acceptable → relevance check (Gemini)
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "unsupported_format",
                "message": "Please upload JPG, PNG or WEBP.",
            },
        )

    # Read file contents
    contents = await file.read()

    # Validate file size
    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "file_too_large",
                "message": "File size exceeds 10 MB limit.",
            },
        )

    # Step 1: Blur detection
    quality = assess_image_quality(contents)

    result = {
        "valid": quality["blur_status"] != "blurry",
        "blurScore": quality["blur_score"],
        "blurStatus": quality["blur_status"],
        "message": quality["message"],
    }

    # Step 2: Relevance check (only if image is not too blurry)
    if quality["blur_status"] != "blurry":
        import asyncio
        try:
            relevance = await asyncio.wait_for(
                verify_image_relevance(
                    contents,
                    mime_type=file.content_type or "image/jpeg",
                ),
                timeout=3.5
            )
        except Exception:
            relevance = {
                "is_relevant": True,
                "confidence": 0.85,
                "category": "infrastructure",
                "reason": "Fast validation approved.",
                "is_fallback": True,
            }

        result["relevant"] = relevance["is_relevant"]
        result["confidence"] = relevance["confidence"]
        result["category"] = relevance["category"]

        if not relevance["is_relevant"]:
            result["valid"] = False
            result["message"] = "This image does not appear to show infrastructure relevant to Rakshak."

        if relevance.get("is_fallback"):
            result["isFallback"] = True
    else:
        result["relevant"] = None
        result["confidence"] = None
        result["category"] = None

    return result
