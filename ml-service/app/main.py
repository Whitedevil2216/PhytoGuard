"""FastAPI application serving PlantVillage CNN inference to the Express backend."""

from __future__ import annotations

from contextlib import asynccontextmanager
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile, status

from .predictor import CropDiseasePredictor, ModelNotReadyError, build_predictor_from_env
from .preprocessing import InvalidLeafImageError

load_dotenv()

MAX_UPLOAD_BYTES = 8 * 1024 * 1024
_predictor_singleton: Optional[CropDiseasePredictor] = None


def get_predictor() -> CropDiseasePredictor:
    global _predictor_singleton
    if _predictor_singleton is None:
        _predictor_singleton = build_predictor_from_env()
    return _predictor_singleton


def verify_internal_api_key(
    x_internal_api_key: Optional[str] = Header(default=None),
) -> None:
    expected = (os.getenv("INTERNAL_API_KEY") or "").strip()
    if not expected or "replace_with_" in expected:
        return
    if x_internal_api_key != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "errorCode": "INVALID_INTERNAL_KEY",
                "message": "Invalid or missing X-Internal-API-Key header.",
            },
        )


@asynccontextmanager
async def lifespan(_app: FastAPI):
    get_predictor()
    yield


app = FastAPI(
    title="PhytoGuard Crop Disease CNN Service",
    description="Dedicated Python FastAPI + TensorFlow/Keras CNN inference service for crop leaf classification.",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
def health_check(predictor: CropDiseasePredictor = Depends(get_predictor)):
    return {
        "status": "ok" if predictor.is_ready else "degraded_weights_missing",
        "modelReady": predictor.is_ready,
        "modelVersion": predictor.model_version,
        "numClasses": len(predictor.class_labels),
        "setupNotice": predictor.load_error,
    }


@app.get("/model-info", dependencies=[Depends(verify_internal_api_key)])
def model_info(predictor: CropDiseasePredictor = Depends(get_predictor)):
    return predictor.get_info()


@app.post("/predict", dependencies=[Depends(verify_internal_api_key)])
async def predict_leaf(
    file: UploadFile = File(...),
    predictor: CropDiseasePredictor = Depends(get_predictor),
):
    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "errorCode": "FILE_TOO_LARGE",
                "message": "Image exceeds maximum allowed size for ML inference.",
            },
        )

    try:
        result = predictor.predict_bytes(raw_bytes, top_k=3)
        return result
    except InvalidLeafImageError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "errorCode": "INVALID_LEAF_IMAGE",
                "message": str(exc),
            },
        ) from exc
    except ModelNotReadyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "errorCode": "MODEL_NOT_TRAINED",
                "message": str(exc),
            },
        ) from exc
