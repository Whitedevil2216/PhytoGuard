import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AssistantProvider } from './context/AssistantContext';
import PublicLayout from './layouts/PublicLayout';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import ProtectedRoute from './components/ProtectedRoute';
import VoiceAssistant from './components/VoiceAssistant';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DiseaseLibraryPage from './pages/DiseaseLibraryPage';
import DiseaseDetailsPage from './pages/DiseaseDetailsPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import PredictionResultPage from './pages/PredictionResultPage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AssistantProvider>
          <Routes>
            {/* Public Agronomy & Authentication Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/diseases" element={<DiseaseLibraryPage />} />
              <Route path="/diseases/:id" element={<DiseaseDetailsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Protected Grower & Administrator Workspace Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <WorkspaceLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/predictions/:id" element={<PredictionResultPage />} />
              <Route path="/history" element={<PredictionHistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>

          {/* Persistent Floating Browser Web Speech + Typed Crop Assistant */}
          <VoiceAssistant />
        </AssistantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
