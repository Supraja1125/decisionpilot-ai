import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Interactions } from './views/Interactions';
import { AIAnalysis } from './views/AIAnalysis';
import { Recommendations } from './views/Recommendations';
import { Memory } from './views/Memory';
import { HumanApproval } from './views/HumanApproval';
import { Settings } from './views/Settings';
import { LiveAgentExecutionModal } from './components/LiveAgentExecutionModal';
import { supabase } from './lib/supabaseClient';

// Simple Route Guard for demo authentication
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuth = localStorage.getItem('dp_auth') === 'true';
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Layout component wrapping main dashboard view pages
const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#020617]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-8 py-8 w-[calc(100%-16rem)] ml-64">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="interactions" element={<Interactions />} />
            <Route path="analysis" element={<AIAnalysis />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="memory" element={<Memory />} />
            <Route path="approvals" element={<HumanApproval />} />
            <Route path="settings" element={<Settings />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const navigate = useNavigate();
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [pipelineAccountId, setPipelineAccountId] = useState('1');

  useEffect(() => {
    // Subscribe to Supabase Auth state changes if active
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          localStorage.setItem('dp_auth', 'true');
        } else {
          localStorage.setItem('dp_auth', 'false');
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    const handleTriggerAgent = (e: Event) => {
      const customEvent = e as CustomEvent<{ accountId: string }>;
      if (customEvent.detail && customEvent.detail.accountId) {
        setPipelineAccountId(customEvent.detail.accountId);
      } else {
        setPipelineAccountId('1'); // Default fallback
      }
      setIsPipelineModalOpen(true);
    };

    window.addEventListener('trigger-agent-run', handleTriggerAgent);
    return () => {
      window.removeEventListener('trigger-agent-run', handleTriggerAgent);
    };
  }, []);

  const handlePipelineComplete = () => {
    setIsPipelineModalOpen(false);
    navigate('/recommendations');
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/*" 
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          } 
        />
      </Routes>

      {/* Global Live Agent Execution Overlay */}
      <LiveAgentExecutionModal 
        isOpen={isPipelineModalOpen}
        accountId={pipelineAccountId}
        onComplete={handlePipelineComplete}
      />
    </>
  );
};

export default App;
