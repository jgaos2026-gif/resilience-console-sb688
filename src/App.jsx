import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import SiteLayout from '@/components/SiteLayout';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import JGALayout from '@/components/jga/JGALayout';
import DemoCouncil from './pages/jga/DemoCouncil';
import SystemSpine from './pages/jga/SystemSpine';
import NodeMesh from './pages/jga/NodeMesh';
import VerificationGates from './pages/jga/VerificationGates';
import MemoryBraid from './pages/jga/MemoryBraid';
import SelfHealingDemo from './pages/jga/SelfHealingDemo';
import JGABusinessOS from './pages/jga/JGABusinessOS';
import ClientPortal from './pages/jga/ClientPortal';
import ContractorPortal from './pages/jga/ContractorPortal';
import ProofVault from './pages/jga/ProofVault';
import DailyReportsPage from './pages/jga/DailyReports';
import RiskCompliance from './pages/jga/RiskCompliance';
import RoadmapPage from './pages/jga/RoadmapPage';
import JGASettings from './pages/jga/JGASettings';
import JGAAbout from './pages/jga/JGAAbout';
import Console from './pages/Console';
import SB688Console from './pages/SB688Console';
import JGALive from './pages/JGALive';
import PublicObserver from './pages/PublicObserver';
import JGAStory from './pages/JGAStory.jsx';
import BraidAnalytics from './pages/BraidAnalytics';
import WhitePaperTimeline from './pages/WhitePaperTimeline';
import HowItWorks from './pages/HowItWorks';
import IndustryComparison from './pages/IndustryComparison';
import AIBrain from './pages/AIBrain';
import AIIntegrationGateway from './pages/AIIntegrationGateway';
import QuantumBraidPower from './pages/QuantumBraidPower';
import ResilienceCouncil from './pages/ResilienceCouncil';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route element={<JGALayout />}>
          <Route path="/" element={<DemoCouncil />} />
          <Route path="/system-spine" element={<SystemSpine />} />
          <Route path="/node-mesh" element={<NodeMesh />} />
          <Route path="/verification-gates" element={<VerificationGates />} />
          <Route path="/memory-braid" element={<MemoryBraid />} />
          <Route path="/self-healing" element={<SelfHealingDemo />} />
          <Route path="/business-os" element={<JGABusinessOS />} />
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/contractor-portal" element={<ContractorPortal />} />
          <Route path="/proof-vault" element={<ProofVault />} />
          <Route path="/daily-reports" element={<DailyReportsPage />} />
          <Route path="/risk-compliance" element={<RiskCompliance />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/jga-settings" element={<JGASettings />} />
          <Route path="/jga-about" element={<JGAAbout />} />
        </Route>
        <Route path="/legacy-console" element={<Console />} />
        <Route path="/sb688" element={<SB688Console />} />
        <Route path="/jga-live" element={<JGALive />} />
        <Route path="/observe" element={<PublicObserver />} />
        <Route path="/jga-story" element={<JGAStory />} />
        <Route path="/braid-analytics" element={<BraidAnalytics />} />
        <Route path="/whitepaper-timeline" element={<WhitePaperTimeline />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/industry-comparison" element={<IndustryComparison />} />
        <Route path="/ai-brain" element={<AIBrain />} />
        <Route path="/ai-gateway" element={<AIIntegrationGateway />} />
        <Route path="/quantum-braid" element={<QuantumBraidPower />} />
        <Route path="/resilience-council" element={<ResilienceCouncil />} />
        <Route path="*" element={<PageNotFound />} />
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