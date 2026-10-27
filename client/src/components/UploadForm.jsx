import React, { useEffect, useRef, useState } from 'react';
import { Camera, FileImage, Loader2, ScanSearch, UploadCloud, Video, X } from 'lucide-react';
import ImagePreview from './ImagePreview';
import ErrorMessage from './ErrorMessage';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function UploadForm({
  onSubmitImage,
  isSubmitting = false,
  uploadProgress = 0,
  mlServiceStatus = null,
  availableClasses = [],
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Optional explicitly labeled & isolated walkthrough mode when Python FastAPI is offline
  const [demoWalkthrough, setDemoWalkthrough] = useState(false);
  const [demoClassLabel, setDemoClassLabel] = useState('Tomato___Early_blight');

  // Optional live camera modal
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const fileInputRef = useRef(null);
  const mobileCameraInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [previewUrl]);

  const validateAndSelectFile = (file) => {
    setValidationError('');
    if (!file) return;

    const mime = (file.type || '').toLowerCase();
    if (!ALLOWED_TYPES.includes(mime)) {
      setValidationError('Unsupported image format. Please choose a JPG, PNG, or WebP leaf photograph.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError('Image exceeds the 5 MB maximum upload limit. Please select a smaller photograph.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(nextUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isSubmitting) return;
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) validateAndSelectFile(dropped);
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl('');
    setValidationError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mobileCameraInputRef.current) mobileCameraInputRef.current.value = '';
  };

  const openWebcamModal = async () => {
    setValidationError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      mobileCameraInputRef.current?.click();
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = mediaStream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 60);
    } catch {
      // Fallback to native mobile camera file input if webcam permission denied or unavailable
      mobileCameraInputRef.current?.click();
    }
  };

  const closeWebcamModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const captureWebcamFrame = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const capturedFile = new File([blob], `camera_leaf_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          validateAndSelectFile(capturedFile);
        }
        closeWebcamModal();
      },
      'image/jpeg',
      0.92
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('Please select or capture a crop leaf image before predicting.');
      return;
    }
    onSubmitImage({
      file: selectedFile,
      demoWalkthrough,
      demoClassLabel,
    });
  };

  const mlOffline = mlServiceStatus && (!mlServiceStatus.reachable || !mlServiceStatus.modelReady);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hidden file & mobile camera inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => validateAndSelectFile(e.target.files?.[0])}
      />
      <input
        ref={mobileCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => validateAndSelectFile(e.target.files?.[0])}
      />

      {validationError && (
        <ErrorMessage title="Upload Validation" message={validationError} />
      )}

      {!selectedFile ? (
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-colors ${
            dragActive
              ? 'border-[#1E5631] bg-[#EEF5F0]'
              : 'border-[#CBD5C8] bg-white hover:border-[#1E5631]/60'
          }`}
        >
          <div className="mx-auto w-12 h-12 rounded-xl bg-[#EEF4EF] text-[#1E5631] flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6" aria-hidden="true" />
          </div>

          <h2 className="text-lg font-bold text-[#17231A]">
            Drag and drop a crop leaf photograph here
          </h2>
          <p className="text-sm text-[#526056] mt-1.5 max-w-md mx-auto">
            Place a single leaf flat against a plain background in clear daylight. Supports JPG,
            PNG, and WebP up to 5 MB.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1E5631] rounded-lg hover:bg-[#164225] transition-colors whitespace-nowrap cursor-pointer"
            >
              <FileImage className="w-4 h-4" aria-hidden="true" />
              Browse Leaf Photo
            </button>

            <button
              type="button"
              onClick={openWebcamModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#17231A] bg-[#F2F5F0] border border-[#DCE3DA] rounded-lg hover:bg-[#E6ECE4] transition-colors whitespace-nowrap cursor-pointer"
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              Capture with Camera
            </button>
          </div>
        </div>
      ) : (
        <ImagePreview
          previewUrl={previewUrl}
          fileName={selectedFile.name}
          fileSize={selectedFile.size}
          disabled={isSubmitting}
          onReplace={() => fileInputRef.current?.click()}
          onRemove={handleRemove}
        />
      )}

      {/* Honest ML Service Readiness Banner & Isolated Demo Walkthrough Switch */}
      {mlOffline && (
        <div className="rounded-xl border border-[#D97706]/35 bg-[#FFFBEB] p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-[#92400E]">
              Python CNN Inference Service Setup Notice
            </p>
            <p className="text-xs text-[#78350F] mt-1 leading-relaxed">
              {mlServiceStatus.statusMessage ||
                'The Python FastAPI TensorFlow service is not currently running on port 8000.'}{' '}
              Genuine CNN predictions require running <code className="font-mono">uvicorn app.main:app --port 8000</code> inside{' '}
              <code className="font-mono">ml-service/</code> with trained PlantVillage weights.
            </p>
          </div>

          <div className="pt-2 border-t border-[#D97706]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={demoWalkthrough}
                onChange={(e) => setDemoWalkthrough(e.target.checked)}
                className="mt-0.5 rounded border-[#B45309] text-[#1E5631] focus:ring-[#1E5631]"
              />
              <span className="text-xs text-[#78350F] leading-snug">
                <strong className="font-semibold">Enable Isolated UI Walkthrough Mode (Not Real AI):</strong>{' '}
                Test image security validation, Sharp normalization, MongoDB disease lookup, and
                Voice Assistant using a clearly labeled simulated record.
              </span>
            </label>

            {demoWalkthrough && availableClasses.length > 0 && (
              <select
                value={demoClassLabel}
                onChange={(e) => setDemoClassLabel(e.target.value)}
                aria-label="Simulated PlantVillage class for UI walkthrough"
                className="text-xs rounded-lg border border-[#D97706]/40 bg-white px-2.5 py-1.5 text-[#17231A] shrink-0"
              >
                {availableClasses.map((d) => (
                  <option key={d.classLabel} value={d.classLabel}>
                    {d.cropName} — {d.diseaseName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar during Upload & Inference */}
      {isSubmitting && (
        <div className="rounded-xl border border-[#DCE3DA] bg-white p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#17231A]">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#1E5631]" aria-hidden="true" />
              {uploadProgress < 100
                ? 'Uploading & validating binary image signature...'
                : 'Running leaf preprocessing & classification pipeline...'}
            </span>
            <span className="font-mono tabular-nums">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-[#E6ECE4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1E5631] transition-transform duration-150 origin-left"
              style={{ transform: `scaleX(${Math.max(0.08, uploadProgress / 100)})` }}
            />
          </div>
        </div>
      )}

      {/* Submit CTA */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={!selectedFile || isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#1E5631] rounded-lg hover:bg-[#164225] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Analyzing Leaf...
            </>
          ) : (
            <>
              <ScanSearch className="w-4 h-4" aria-hidden="true" />
              {demoWalkthrough ? 'Run Isolated UI Walkthrough' : 'Predict Disease'}
            </>
          )}
        </button>
      </div>

      {/* Live Camera Capture Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCE3DA] max-w-lg w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E2E7DF] flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#17231A]">
                <Video className="w-4 h-4 text-[#1E5631]" aria-hidden="true" />
                Capture Crop Leaf
              </span>
              <button
                type="button"
                onClick={closeWebcamModal}
                className="p-1 rounded-lg text-[#526056] hover:bg-[#F3F6F2]"
                aria-label="Close camera"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black aspect-video w-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeWebcamModal}
                className="px-4 py-2 text-sm font-medium text-[#526056] hover:text-[#17231A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureWebcamFrame}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#1E5631] rounded-lg hover:bg-[#164225]"
              >
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
