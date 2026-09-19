import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { Header } from './components/common/Header';
import { VoiceFloatingMic } from './components/common/VoiceFloatingMic';

import { AuthPage } from './pages/AuthPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { HomePage } from './pages/HomePage';
import { CertificatesPage } from './pages/CertificatesPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { SchemesPage } from './pages/SchemesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { AssistantPage } from './pages/AssistantPage';
import { AdminPage } from './pages/AdminPage';
import { InfoPage } from './pages/InfoPage';
import { PaymentsPage } from './pages/PaymentsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, token } = useAccessibility();

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-slate-900 pb-20">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      {/* Floating Mic Available on Every Screen */}
      <VoiceFloatingMic />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AccessibilityProvider>
      <Router>
        <AppContent />
      </Router>
    </AccessibilityProvider>
  );
};

export default App;
