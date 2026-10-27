import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '../context/AuthContext';
import { AssistantProvider } from '../context/AssistantContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import UploadForm from '../components/UploadForm';
import ResultCard from '../components/ResultCard';
import HistoryTable from '../components/HistoryTable';
import ProtectedRoute from '../components/ProtectedRoute';
import VoiceAssistant from '../components/VoiceAssistant';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  setFallbackAuthToken: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockRejectedValue(new Error('Unauthenticated'));
  global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/leaf-preview');
  global.URL.revokeObjectURL = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('Frontend Component & Workflow Test Suite', () => {
  it('validates login and registration forms before API submission', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    const signInBtn = screen.getByRole('button', { name: /^sign in$/i });
    fireEvent.click(signInBtn);

    expect(
      await screen.findByText(/please enter both your email address and password/i)
    ).toBeInTheDocument();

    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText(/full name must be at least 2 characters/i)
    ).toBeInTheDocument();
  });

  it('rejects unsupported upload types and renders preview for valid leaf images', async () => {
    const handleSubmit = vi.fn();
    const { container } = render(<UploadForm onSubmitImage={handleSubmit} />);

    const fileInput = container.querySelector('input[type="file"][accept*="image/jpeg"]');
    const invalidTxt = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [invalidTxt] } });

    expect(await screen.findByText(/unsupported image format/i)).toBeInTheDocument();

    const validLeaf = new File([new Uint8Array([1, 2, 3])], 'tomato_leaf.jpg', {
      type: 'image/jpeg',
    });
    fireEvent.change(fileInput, { target: { files: [validLeaf] } });

    expect(await screen.findByText('tomato_leaf.jpg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /predict disease/i })).not.toBeDisabled();
  });

  it('displays prediction result confidence, symptoms, and calibration disclaimer', () => {
    const samplePrediction = {
      id: 'pred_1',
      cropName: 'Tomato',
      diseaseName: 'Early Blight',
      classLabel: 'Tomato___Early_blight',
      confidence: 0.892,
      status: 'completed',
      isDemo: false,
      imageUrl: '/uploads/leaf_1.jpg',
      modelVersion: 'plantvillage-cnn-v1.0.0',
      createdAt: '2026-10-27T06:00:00.000Z',
    };

    const sampleDisease = {
      id: 'dis_1',
      cropName: 'Tomato',
      diseaseName: 'Early Blight',
      scientificName: 'Alternaria linariae',
      description: 'Common fungal disease affecting older lower tomato leaves.',
      symptoms: ['Concentric target rings on lower leaves'],
      prevention: ['Apply organic mulch to prevent rain splash'],
      management: ['Irrigate strictly at the soil base'],
    };

    render(
      <MemoryRouter>
        <ResultCard prediction={samplePrediction} disease={sampleDisease} />
      </MemoryRouter>
    );

    expect(screen.getByText('Early Blight')).toBeInTheDocument();
    expect(screen.getByText('89.2%')).toBeInTheDocument();
    expect(screen.getByText(/concentric target rings on lower leaves/i)).toBeInTheDocument();
    expect(screen.getByText(/does not guarantee field diagnostic accuracy/i)).toBeInTheDocument();
  });

  it('renders prediction history rows and opens delete confirmation dialog', () => {
    const onDelete = vi.fn();
    const rows = [
      {
        id: 'hist_1',
        cropName: 'Potato',
        diseaseName: 'Late Blight',
        classLabel: 'Potato___Late_blight',
        confidence: 0.94,
        status: 'completed',
        isDemo: false,
        imageUrl: '/uploads/leaf_potato.jpg',
        createdAt: '2026-10-27T05:30:00.000Z',
      },
    ];

    render(
      <MemoryRouter>
        <HistoryTable predictions={rows} onDelete={onDelete} />
      </MemoryRouter>
    );

    expect(screen.getByText('Late Blight')).toBeInTheDocument();
    expect(screen.getByText('94.0%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /delete prediction/i }));
    expect(screen.getByText(/delete prediction record\?/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated visitors away from ProtectedRoute pages', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Private Grower Workspace</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Redirect Destination</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Redirect Destination')).toBeInTheDocument();
    });
  });

  it('provides working typed-chat fallback in Crop Assistant when speech recognition is absent', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AssistantProvider>
            <VoiceAssistant />
          </AssistantProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    const openBtn = await screen.findByRole('button', {
      name: /open crop assistant/i,
    });
    fireEvent.click(openBtn);

    expect(
      screen.getByText(/browser speech recognition is unavailable here/i)
    ).toBeInTheDocument();

    const chatInput = screen.getByLabelText(/type command for crop assistant/i);
    fireEvent.change(chatInput, { target: { value: 'Read my result' } });
    fireEvent.submit(chatInput.closest('form'));

    expect(
      await screen.findByText(/no prediction result or disease entry is currently open/i)
    ).toBeInTheDocument();
  });
});
