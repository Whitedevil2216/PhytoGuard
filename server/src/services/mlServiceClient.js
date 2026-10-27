import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export async function checkMlServiceHealth() {
  try {
    const headers = {};
    if (env.internalApiKey) {
      headers['X-Internal-API-Key'] = env.internalApiKey;
    }

    const res = await fetch(`${env.modelServiceUrl}/health`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) {
      return {
        reachable: true,
        modelReady: false,
        modelVersion: null,
        numClasses: 0,
        status: `http_${res.status}`,
      };
    }

    const data = await res.json();
    const isGenuineMlService =
      typeof data?.modelReady === 'boolean' ||
      typeof data?.model_ready === 'boolean' ||
      typeof data?.numClasses === 'number';

    if (!isGenuineMlService) {
      return {
        reachable: false,
        modelReady: false,
        modelVersion: null,
        numClasses: 0,
        status: 'offline',
      };
    }

    return {
      reachable: true,
      modelReady: Boolean(data.modelReady ?? data.model_ready),
      modelVersion: data.modelVersion || data.model_version || null,
      numClasses: Number(data.numClasses ?? data.num_classes ?? 0),
      status: data.status || 'ok',
    };
  } catch {
    return {
      reachable: false,
      modelReady: false,
      modelVersion: null,
      numClasses: 0,
      status: 'offline',
    };
  }
}

export async function requestCnnPrediction(imageBuffer, filename = 'leaf.jpg') {
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
  formData.append('file', blob, filename);

  const headers = {};
  if (env.internalApiKey) {
    headers['X-Internal-API-Key'] = env.internalApiKey;
  }

  let response;
  try {
    response = await fetch(`${env.modelServiceUrl}/predict`, {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new ApiError(
      503,
      `Python FastAPI CNN service is unreachable at ${env.modelServiceUrl}. Start the ML microservice (uvicorn app.main:app --port 8000) with trained PlantVillage weights to run real CNN inference.`,
      'MODEL_SERVICE_UNAVAILABLE'
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detailMsg =
      payload?.detail?.message ||
      (typeof payload?.detail === 'string' ? payload.detail : null) ||
      payload?.message ||
      'FastAPI CNN model service returned an error.';

    if (response.status === 404) {
      throw new ApiError(
        503,
        `Python FastAPI CNN service is not active at ${env.modelServiceUrl}. Start ml-service (uvicorn app.main:app --port 8000) with trained PlantVillage weights, or explicitly toggle Simulated UI Walkthrough Mode for interface testing.`,
        'MODEL_SERVICE_UNAVAILABLE'
      );
    }

    if (response.status === 503) {
      throw new ApiError(
        503,
        detailMsg,
        payload?.detail?.errorCode || 'MODEL_NOT_TRAINED'
      );
    }

    throw new ApiError(
      response.status >= 400 && response.status < 500 ? 400 : 502,
      detailMsg,
      'ML_INFERENCE_FAILED'
    );
  }

  return payload;
}
