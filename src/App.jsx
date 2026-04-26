import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
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
      <Route path="/" element={<Console />} />
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
      <Route path="*" element={<PageNotFound />} />
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