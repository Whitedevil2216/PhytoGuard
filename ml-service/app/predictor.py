"""Singleton Keras CNN model loader and PlantVillage inference engine."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, List

from .preprocessing import parse_class_label, validate_and_preprocess_image

SERVICE_ROOT = Path(__file__).resolve().parent.parent


class ModelNotReadyError(RuntimeError):
    """Raised when CNN weights or class labels are not yet trained or loaded."""


class CropDiseasePredictor:
    """Loads a trained Keras CNN once at startup and serves deterministic inference."""

    def __init__(
        self,
        model_path: Path,
        class_labels_path: Path,
        model_version: str = "plantvillage-cnn-v1.0.0",
        image_size: int = 224,
        rescale_input: bool = True,
    ) -> None:
        self.model_path = Path(model_path)
        self.class_labels_path = Path(class_labels_path)
        self.model_version = model_version
        self.image_size = int(image_size)
        self.rescale_input = bool(rescale_input)
        self.class_labels: List[str] = []
        self.metadata: Dict[str, Any] = {}
        self._model = None
        self.load_error: str | None = None

    def load(self) -> None:
        """Load class_labels.json, optional model_metadata.json, and trained Keras model."""
        if not self.class_labels_path.exists():
            self.load_error = f"Missing class labels file at {self.class_labels_path}"
            return

        with self.class_labels_path.open("r", encoding="utf-8") as fp:
            labels = json.load(fp)
        if not isinstance(labels, list) or not labels:
            self.load_error = "class_labels.json must contain a non-empty JSON list of strings."
            return
        self.class_labels = [str(item) for item in labels]

        metadata_path = self.model_path.parent / "model_metadata.json"
        if metadata_path.exists():
            try:
                with metadata_path.open("r", encoding="utf-8") as meta_fp:
                    self.metadata = json.load(meta_fp)
                    if "image_size" in self.metadata:
                        self.image_size = int(self.metadata["image_size"])
                    if "rescale_input" in self.metadata:
                        self.rescale_input = bool(self.metadata["rescale_input"])
                    if "model_version" in self.metadata:
                        self.model_version = str(self.metadata["model_version"])
            except Exception:
                self.metadata = {}

        if not self.model_path.exists():
            self.load_error = (
                f"Trained Keras model file not found at {self.model_path}. "
                "Run `python training/train.py` inside ml-service to train and save weights."
            )
            return

        try:
            import tensorflow as tf

            self._model = tf.keras.models.load_model(str(self.model_path), compile=False)
            self.load_error = None
        except Exception as exc:
            self._model = None
            self.load_error = f"Failed to load Keras model ({type(exc).__name__}): {exc}"

    @property
    def is_ready(self) -> bool:
        return self._model is not None and len(self.class_labels) > 0

    def get_info(self) -> Dict[str, Any]:
        return {
            "modelReady": self.is_ready,
            "modelVersion": self.model_version,
            "modelPath": str(self.model_path),
            "imageSize": self.image_size,
            "rescaleInput": self.rescale_input,
            "numClasses": len(self.class_labels),
            "classLabels": self.class_labels,
            "trainingMetadata": self.metadata,
            "setupNotice": self.load_error,
        }

    def predict_bytes(self, raw_bytes: bytes, top_k: int = 3) -> Dict[str, Any]:
        if not self.is_ready:
            raise ModelNotReadyError(
                self.load_error
                or "CNN model weights are not loaded. Train or place plantvillage_cnn.keras in ml-service/models/."
            )

        import numpy as np

        batch = validate_and_preprocess_image(
            raw_bytes,
            target_size=self.image_size,
            rescale_0_to_1=self.rescale_input,
        )

        raw_preds = self._model.predict(batch, verbose=0)
        probs = np.asarray(raw_preds[0], dtype=np.float64)

        # Apply numerically stable softmax if model output logits instead of normalized probabilities
        prob_sum = float(np.sum(probs))
        if prob_sum < 0.98 or prob_sum > 1.02 or np.any(probs < 0.0):
            shifted = probs - np.max(probs)
            exp_scores = np.exp(shifted)
            probs = exp_scores / np.sum(exp_scores)

        if len(probs) != len(self.class_labels):
            raise RuntimeError(
                f"Model output dimension ({len(probs)}) does not match class_labels.json count ({len(self.class_labels)})."
            )

        ranked_indices = np.argsort(probs)[::-1][: max(1, top_k)]
        top_predictions = []
        for idx in ranked_indices:
            label = self.class_labels[int(idx)]
            crop_name, disease_name = parse_class_label(label)
            top_predictions.append(
                {
                    "classLabel": label,
                    "cropName": crop_name,
                    "diseaseName": disease_name,
                    "confidence": round(float(probs[int(idx)]), 4),
                }
            )

        best = top_predictions[0]
        return {
            "success": True,
            "classLabel": best["classLabel"],
            "cropName": best["cropName"],
            "diseaseName": best["diseaseName"],
            "confidence": best["confidence"],
            "topPredictions": top_predictions,
            "modelVersion": self.model_version,
        }


def build_predictor_from_env() -> CropDiseasePredictor:
    raw_model_path = os.getenv("MODEL_PATH", "models/plantvillage_cnn.keras")
    raw_labels_path = os.getenv("CLASS_LABELS_PATH", "class_labels.json")
    model_version = os.getenv("MODEL_VERSION", "plantvillage-cnn-v1.0.0")
    image_size = int(os.getenv("IMAGE_SIZE", "224"))
    rescale_flag = os.getenv("RESCALE_INPUT", "true").strip().lower() in ("1", "true", "yes")

    model_path = Path(raw_model_path)
    if not model_path.is_absolute():
        model_path = SERVICE_ROOT / model_path

    labels_path = Path(raw_labels_path)
    if not labels_path.is_absolute():
        labels_path = SERVICE_ROOT / labels_path

    predictor = CropDiseasePredictor(
        model_path=model_path,
        class_labels_path=labels_path,
        model_version=model_version,
        image_size=image_size,
        rescale_input=rescale_flag,
    )
    predictor.load()
    return predictor
