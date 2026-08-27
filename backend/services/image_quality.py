"""Image quality assessment using OpenCV Laplacian variance for blur detection."""

import cv2
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

# Configurable thresholds from environment
BLUR_THRESHOLD = float(os.getenv("BLUR_THRESHOLD", "100"))
BLUR_BORDERLINE_THRESHOLD = float(os.getenv("BLUR_BORDERLINE_THRESHOLD", "50"))


def assess_image_quality(image_bytes: bytes) -> dict:
    """
    Assess image quality using Laplacian variance.
    
    Pipeline:
        Image → Grayscale → Laplacian → Variance → Blur Score
    
    Returns:
        dict with blur_score, blur_status ('good', 'borderline', 'blurry')
    """
    # Decode image from bytes
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {
            "blur_score": 0.0,
            "blur_status": "blurry",
            "message": "Could not decode image.",
        }

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Calculate Laplacian variance (higher = sharper)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    blur_score = float(laplacian.var())

    # Classify blur status
    if blur_score >= BLUR_THRESHOLD:
        blur_status = "good"
        message = "Photo quality looks good."
    elif blur_score >= BLUR_BORDERLINE_THRESHOLD:
        blur_status = "borderline"
        message = "This photo may be slightly unclear. A clearer photo will produce a better assessment."
    else:
        blur_status = "blurry"
        message = "This photo is too blurry to assess reliably."

    return {
        "blur_score": round(blur_score, 2),
        "blur_status": blur_status,
        "message": message,
    }
