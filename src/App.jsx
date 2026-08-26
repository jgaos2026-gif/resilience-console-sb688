import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import SiteLayout from '@/components/SiteLayout';
import JGALayout from '@/components/jga/JGALayout';

// Operational pages only
import OperationsCenter from './pages/OperationsCenter';
import Login            from './pages/Login';
import SystemSpine      from './pages/jga/SystemSpine';
import NodeMesh         from './pages/jga/NodeMesh';
import VerificationGates from './pages/jga/VerificationGates';
import MemoryBraid      from './pages/jga/MemoryBraid';
import SelfHealingPanel from './pages/jga/SelfHealingDemo';
import ProofVault       from './pages/jga/ProofVault';
import DailyReports     from './pages/jga/DailyReports';
import RiskCompliance   from './pages/jga/RiskCompliance';
import JGASettings      from './pages/jga/JGASettings';
import AVAControlRoom   from './pages/AVAControlRoom';
import SB688Console     from './pages/SB688Console';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Public login route — no auth needed
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<SiteLayout />}>
        <Route element={<JGALayout />}>
          <Route path="/"                    element={<OperationsCenter />} />
          <Route path="/system-spine"        element={<SystemSpine />} />
          <Route path="/node-mesh"           element={<NodeMesh />} />
          <Route path="/verification-gates"  element={<VerificationGates />} />
          <Route path="/memory-braid"        element={<MemoryBraid />} />
          <Route path="/self-healing"        element={<SelfHealingPanel />} />
          <Route path="/proof-vault"         element={<ProofVault />} />
          <Route path="/daily-reports"       element={<DailyReports />} />
          <Route path="/risk-compliance"     element={<RiskCompliance />} />
          <Route path="/jga-settings"        element={<JGASettings />} />
          <Route path="/ava"                 element={<AVAControlRoom />} />
        </Route>
        <Route path="/sb688" element={<SB688Console />} />
        <Route path="*"      element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
