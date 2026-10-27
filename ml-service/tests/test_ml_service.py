"""Unit and endpoint tests for the PhytoGuard ML microservice."""

from __future__ import annotations

import io
import json
from pathlib import Path
import sys
import tempfile
import unittest

SERVICE_ROOT = Path(__file__).resolve().parent.parent
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

from app.predictor import CropDiseasePredictor, ModelNotReadyError
from app.preprocessing import (
    InvalidLeafImageError,
    parse_class_label,
    validate_and_preprocess_image,
)
from training.prepare_dataset import split_dataset

try:
    import numpy as np
    from PIL import Image

    HAS_PIL_NUMPY = True
except ImportError:
    HAS_PIL_NUMPY = False

try:
    from fastapi.testclient import TestClient
    from app.main import app

    HAS_FASTAPI = True
except ImportError:
    HAS_FASTAPI = False


class TestClassLabelsAndPureLogic(unittest.TestCase):
    def test_class_labels_schema_and_alphabetical_order(self) -> None:
        labels_path = SERVICE_ROOT / "class_labels.json"
        self.assertTrue(labels_path.exists(), "class_labels.json must exist")

        labels = json.loads(labels_path.read_text(encoding="utf-8"))
        self.assertIsInstance(labels, list)
        self.assertEqual(len(labels), 21)
        self.assertEqual(len(set(labels)), 21, "Class labels must be unique")
        self.assertEqual(
            labels,
            sorted(labels),
            "class_labels.json must match Keras alphabetical directory order",
        )

    def test_parse_class_label_formatting(self) -> None:
        crop, disease = parse_class_label("Tomato___Early_blight")
        self.assertEqual(crop, "Tomato")
        self.assertEqual(disease, "Early Blight")

        crop_corn, disease_corn = parse_class_label("Corn_(maize)___healthy")
        self.assertEqual(crop_corn, "Corn")
        self.assertEqual(disease_corn, "Healthy Corn Leaf")

    def test_predictor_raises_honest_error_when_weights_missing(self) -> None:
        predictor = CropDiseasePredictor(
            model_path=SERVICE_ROOT / "models" / "nonexistent_weights.keras",
            class_labels_path=SERVICE_ROOT / "class_labels.json",
        )
        predictor.load()
        self.assertFalse(predictor.is_ready)
        with self.assertRaises(ModelNotReadyError):
            predictor.predict_bytes(b"fake_bytes")

    def test_leak_free_dataset_splitter(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_root = Path(tmp)
            raw_dir = tmp_root / "raw"
            out_dir = tmp_root / "split"

            for cls_name in ("Tomato___Early_blight", "Tomato___healthy"):
                cls_dir = raw_dir / cls_name
                cls_dir.mkdir(parents=True)
                for idx in range(20):
                    (cls_dir / f"leaf_{idx:03d}.jpg").write_bytes(b"\xff\xd8\xff\xe0test")

            stats = split_dataset(raw_dir=raw_dir, output_dir=out_dir, seed=42)
            self.assertEqual(stats["totals"]["train"], 28)
            self.assertEqual(stats["totals"]["val"], 6)
            self.assertEqual(stats["totals"]["test"], 6)

            train_names = {p.name for p in (out_dir / "train" / "Tomato___healthy").iterdir()}
            val_names = {p.name for p in (out_dir / "val" / "Tomato___healthy").iterdir()}
            test_names = {p.name for p in (out_dir / "test" / "Tomato___healthy").iterdir()}
            self.assertTrue(train_names.isdisjoint(val_names))
            self.assertTrue(train_names.isdisjoint(test_names))
            self.assertTrue(val_names.isdisjoint(test_names))


@unittest.skipUnless(HAS_PIL_NUMPY, "Pillow and NumPy not installed in current Python runtime")
class TestImagePreprocessing(unittest.TestCase):
    def test_valid_rgb_resize_and_normalization(self) -> None:
        img = Image.new("RGB", (340, 260), color=(40, 140, 60))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")

        batch = validate_and_preprocess_image(buf.getvalue(), target_size=224, rescale_0_to_1=True)
        self.assertEqual(batch.shape, (1, 224, 224, 3))
        self.assertEqual(str(batch.dtype), "float32")
        self.assertGreaterEqual(float(np.min(batch)), 0.0)
        self.assertLessEqual(float(np.max(batch)), 1.0)

    def test_rejects_non_image_bytes(self) -> None:
        with self.assertRaises(InvalidLeafImageError):
            validate_and_preprocess_image(b"not-a-valid-image-payload-at-all")


@unittest.skipUnless(HAS_FASTAPI, "FastAPI not installed in current Python runtime")
class TestFastApiEndpoints(unittest.TestCase):
    def test_health_and_model_info_endpoints(self) -> None:
        client = TestClient(app)
        health = client.get("/health")
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.json()["numClasses"], 21)

        info = client.get("/model-info")
        self.assertEqual(info.status_code, 200)
        self.assertIn("classLabels", info.json())


if __name__ == "__main__":
    unittest.main()
