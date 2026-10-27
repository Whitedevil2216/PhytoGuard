"""CLI utility to test single-image CNN inference directly from Windows PowerShell or bash."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

SERVICE_ROOT = Path(__file__).resolve().parent.parent
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

from app.predictor import CropDiseasePredictor, ModelNotReadyError


def main() -> None:
    parser = argparse.ArgumentParser(description="Run single-leaf CNN inference from CLI.")
    parser.add_argument("--image", required=True, help="Path to leaf image (.jpg/.png/.webp)")
    parser.add_argument("--model-path", default="models/plantvillage_cnn.keras")
    parser.add_argument("--labels-path", default="class_labels.json")
    args = parser.parse_args()

    image_path = Path(args.image)
    if not image_path.exists():
        print(f"ERROR: Image file not found at {image_path}", file=sys.stderr)
        sys.exit(1)

    predictor = CropDiseasePredictor(
        model_path=SERVICE_ROOT / args.model_path,
        class_labels_path=SERVICE_ROOT / args.labels_path,
    )
    predictor.load()

    try:
        output = predictor.predict_bytes(image_path.read_bytes(), top_k=3)
        print(json.dumps(output, indent=2))
    except ModelNotReadyError as exc:
        print(f"MODEL NOT READY: {exc}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
