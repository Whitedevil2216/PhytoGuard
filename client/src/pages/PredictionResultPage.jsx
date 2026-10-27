import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAssistantContext } from '../context/AssistantContext';
import { extractErrorMessage } from '../utils/formatters';

export default function PredictionResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const { setDiagnosticContext, openAssistantWithPrompt } = useAssistantContext();

  const initialPayload = location.state?.initialData || null;
  const [prediction, setPrediction] = useState(initialPayload?.prediction || null);
  const [disease, setDisease] = useState(initialPayload?.disease || null);
  const [disclaimer, setDisclaimer] = useState(initialPayload?.disclaimer || '');
  const [loading, setLoading] = useState(!initialPayload);
  const [error, setError] = useState('');

  const fetchPrediction = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/predictions/${id}`);
      setPrediction(data.prediction);
      setDisease(data.disease || null);
      setDisclaimer(data.disclaimer || '');
      setDiagnosticContext(data.prediction, data.disease || null);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to load prediction record.'));
    } finally {
      setLoading(false);
    }
  }, [id, setDiagnosticContext]);

  useEffect(() => {
    if (initialPayload?.prediction?.id === id) {
      setDiagnosticContext(initialPayload.prediction, initialPayload.disease || null);
      setLoading(false);
      return;
    }
    fetchPrediction();
  }, [id, initialPayload, fetchPrediction, setDiagnosticContext]);

  if (loading) {
    return <LoadingSpinner label="Loading leaf diagnosis report..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#526056] hover:text-[#17231A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Prediction History
        </Link>
      </div>

      {error ? (
        <ErrorMessage
          title="Could Not Load Prediction"
          message={error}
          onRetry={fetchPrediction}
        />
      ) : (
        <ResultCard
          prediction={prediction}
          disease={disease}
          disclaimer={disclaimer}
          onSpeakSummary={() => openAssistantWithPrompt('Read my result')}
        />
      )}
    </div>
  );
}
