import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import UploadForm from '../components/UploadForm';
import ErrorMessage from '../components/ErrorMessage';
import { useAssistantContext } from '../context/AssistantContext';
import { extractErrorMessage } from '../utils/formatters';

export default function UploadPage() {
  const navigate = useNavigate();
  const { setDiagnosticContext } = useAssistantContext();

  const [mlStatus, setMlStatus] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchReadiness() {
      try {
        const [healthRes, diseasesRes] = await Promise.all([
          api.get('/health'),
          api.get('/diseases?limit=30'),
        ]);
        if (!active) return;
        setMlStatus(healthRes.data?.mlService || null);
        setAvailableClasses(diseasesRes.data?.diseases || []);
      } catch {
        // Ignore silent status precheck failure
      }
    }

    fetchReadiness();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmitImage = async ({ file, demoWalkthrough, demoClassLabel }) => {
    setSubmitting(true);
    setUploadProgress(5);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (demoWalkthrough) {
        formData.append('demoWalkthrough', 'true');
        formData.append('demoClassLabel', demoClassLabel);
      }

      const { data } = await api.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress(progressEvent) {
          if (progressEvent.total) {
            const pct = Math.min(
              100,
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
            setUploadProgress(pct);
          }
        },
      });

      setDiagnosticContext(data.prediction, data.disease);
      navigate(`/predictions/${data.prediction.id}`, {
        state: {
          initialData: data,
        },
      });
    } catch (err) {
      setSubmitError(
        extractErrorMessage(
          err,
          'Unable to complete leaf classification. Verify that the Python FastAPI service and trained model are running.'
        )
      );
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231A]">
          Diagnose a Crop Leaf Image
        </h1>
        <p className="text-sm text-[#526056]">
          Upload or capture a leaf photograph for binary security inspection, RGB normalization, and
          PlantVillage CNN classification.
        </p>
      </div>

      {submitError && (
        <ErrorMessage
          title="Prediction Request Could Not Complete"
          message={submitError}
        />
      )}

      <UploadForm
        onSubmitImage={handleSubmitImage}
        isSubmitting={submitting}
        uploadProgress={uploadProgress}
        mlServiceStatus={mlStatus}
        availableClasses={availableClasses}
      />

      <div className="rounded-2xl border border-[#DCE3DA] bg-white p-5 space-y-2 text-xs text-[#526056] leading-relaxed">
        <p className="font-semibold text-[#17231A]">
          Security &amp; Diagnostic Transparency
        </p>
        <p>
          Uploaded files are verified using binary magic numbers (JPEG, PNG, WebP), stripped of
          EXIF location metadata with Sharp, and stored under randomized UUID filenames. Model
          confidence reflects similarity to PlantVillage training samples and does not guarantee
          field diagnostic accuracy.
        </p>
      </div>
    </div>
  );
}
