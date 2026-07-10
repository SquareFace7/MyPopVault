import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import toast, { Toaster as HotToaster } from 'react-hot-toast';
import { ThemeProvider } from '@/lib/ThemeContext';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useSearchParams } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import CommunityChat from './pages/CommunityChat';
import Login from './pages/Login';
import CollectorSearch from './pages/CollectorSearch';
import PublicVault from './pages/PublicVault';
import TradeManager from './pages/TradeManager';
import AdminPanel from './pages/AdminPanel';
import PopExplorer from './pages/PopExplorer';
import PopDetails from './pages/PopDetails';
import PopMessenger from './pages/PopMessenger';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import PrivateRoute from '@/components/PrivateRoute';
import PendingVerificationScreen from '@/components/PendingVerificationScreen';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user, logout, checkUserAuth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true' && user && user.isLoggedIn) {
      toast.success('✉️ Email verified successfully! Your vault is now unlocked.', {
        duration: 6000,
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
      checkUserAuth();
      setSearchParams({});
    }
  }, [searchParams, user, setSearchParams, checkUserAuth]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Intercept unverified logged-in users
  if (user && user.isLoggedIn && !user.isVerified) {
    return <PendingVerificationScreen user={user} logout={logout} checkUserAuth={checkUserAuth} />;
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
  // Custom Admin Route guard

  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => {
        const isPrivate = ['Dashboard', 'Collection'].includes(path);
        const pageElement = (
          <LayoutWrapper currentPageName={path}>
            <Page />
          </LayoutWrapper>
        );
        return (
          <Route
            key={path}
            path={`/${path}`}
            element={isPrivate ? <PrivateRoute>{pageElement}</PrivateRoute> : pageElement}
          />
        );
      })}
      <Route path="/CommunityChat" element={
        <LayoutWrapper currentPageName="CommunityChat">
          <CommunityChat />
        </LayoutWrapper>
      } />
      <Route path="/Login" element={
        <LayoutWrapper currentPageName="Login">
          <Login />
        </LayoutWrapper>
      } />
      <Route path="/forgot-password" element={
        <LayoutWrapper currentPageName="Login">
          <ForgotPassword />
        </LayoutWrapper>
      } />
      <Route path="/reset-password/:token" element={
        <LayoutWrapper currentPageName="Login">
          <ResetPassword />
        </LayoutWrapper>
      } />
      <Route path="/CollectorSearch" element={
        <PrivateRoute>
          <LayoutWrapper currentPageName="CollectorSearch">
            <CollectorSearch />
          </LayoutWrapper>
        </PrivateRoute>
      } />
      <Route path="/PublicVault" element={
        <LayoutWrapper currentPageName="PublicVault">
          <PublicVault />
        </LayoutWrapper>
      } />
      <Route path="/TradeManager" element={
        <PrivateRoute>
          <LayoutWrapper currentPageName="TradeManager">
            <TradeManager />
          </LayoutWrapper>
        </PrivateRoute>
      } />
      <Route path="/AdminPanel" element={
        user?.role === 'admin' ? (
          <LayoutWrapper currentPageName="AdminPanel">
            <AdminPanel />
          </LayoutWrapper>
        ) : (
          <Navigate to="/Dashboard" replace />
        )
      } />
      <Route path="/PopExplorer" element={
        <PrivateRoute>
          <LayoutWrapper currentPageName="PopExplorer">
            <PopExplorer />
          </LayoutWrapper>
        </PrivateRoute>
      } />
      <Route path="/Explorer" element={
        <PrivateRoute>
          <LayoutWrapper currentPageName="PopExplorer">
            <PopExplorer />
          </LayoutWrapper>
        </PrivateRoute>
      } />
      <Route path="/pop/:id" element={
        <PrivateRoute>
          <LayoutWrapper currentPageName="PopDetails">
            <PopDetails />
          </LayoutWrapper>
        </PrivateRoute>
      } />
      <Route path="/PopMessenger" element={
        <PrivateRoute>
          <LayoutWrapper currentPageName="PopMessenger">
            <PopMessenger />
          </LayoutWrapper>
        </PrivateRoute>
      } />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <HotToaster 
             position="top-right"
             toastOptions={{
               ariaLive: 'polite',
               role: 'status'
             }}
           />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App