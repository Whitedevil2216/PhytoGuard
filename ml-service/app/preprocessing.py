"""Image validation, RGB normalization, and PlantVillage label parsing utilities."""

from __future__ import annotations

import io
from typing import Tuple


class InvalidLeafImageError(ValueError):
    """Raised when uploaded bytes cannot be decoded as a valid RGB leaf image."""


def parse_class_label(raw_label: str) -> Tuple[str, str]:
    """Convert a PlantVillage class label (e.g. 'Tomato___Early_blight') into (crop, disease)."""
    cleaned = str(raw_label or "").strip()
    if "___" in cleaned:
        crop_part, disease_part = cleaned.split("___", 1)
    else:
        crop_part, disease_part = "Unknown Crop", cleaned

    crop_map = {
        "Corn_(maize)": "Corn",
        "Pepper,_bell": "Pepper",
    }
    crop_name = crop_map.get(crop_part, crop_part.replace("_", " ").strip())

    raw_disease = disease_part.replace("_", " ").strip()
    if raw_disease.lower() == "healthy":
        disease_name = f"Healthy {crop_name} Leaf"
    else:
        disease_name = " ".join(word.capitalize() if word.islower() else word for word in raw_disease.split())

    return crop_name, disease_name


def validate_and_preprocess_image(
    raw_bytes: bytes,
    target_size: int = 224,
    rescale_0_to_1: bool = True,
):
    """
    Validate binary image data with Pillow, convert to 3-channel RGB, resize to
    (target_size, target_size), and return a float32 NumPy batch of shape (1, H, W, 3).
    """
    if not raw_bytes or len(raw_bytes) < 16:
        raise InvalidLeafImageError("Uploaded image payload is empty or truncated.")

    try:
        import numpy as np
        from PIL import Image, ImageOps
    except ImportError as exc:
        raise RuntimeError(
            "Pillow and NumPy are required for image preprocessing. Install requirements.txt."
        ) from exc

    try:
        with Image.open(io.BytesIO(raw_bytes)) as img_probe:
            img_probe.verify()

        with Image.open(io.BytesIO(raw_bytes)) as img:
            img = ImageOps.exif_transpose(img)
            width, height = img.size
            if width < 32 or height < 32:
                raise InvalidLeafImageError(
                    f"Image dimensions ({width}x{height}) are smaller than minimum 32x32 pixels."
                )

            rgb_img = img.convert("RGB")
            resample_mode = getattr(Image, "Resampling", Image).BILINEAR
            resized = rgb_img.resize((target_size, target_size), resample=resample_mode)
            arr = np.asarray(resized, dtype=np.float32)
    except InvalidLeafImageError:
        raise
    except Exception as exc:
        raise InvalidLeafImageError(
            "Uploaded file could not be decoded as a valid image."
        ) from exc

    if rescale_0_to_1:
        arr = arr / 255.0

    batch = np.expand_dims(arr, axis=0)
    return batch
