import React, { useRef, useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import ScheduleView from './views/ScheduleView';
import TeachersView from './views/TeachersView';
import StudentsView from './views/StudentsView';
import CoursesView from './views/CoursesView';
import DutyDistributionView from './views/DutyDistributionView';
import ReportsView from './views/ReportsView';
import SchoolSettingsView from './views/SchoolSettingsView';
import BackupView from './views/BackupView';
import CommissionEditView from './views/CommissionEditView';
import CourseBranchMappingView from './views/CourseBranchMappingView';
import UserGuideView from './views/UserGuideView';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { animateViewTransition, animateToastEntrance } from './utils/animeEffects';
import UpdateNotifier from './components/UpdateNotifier';
import OnboardingWizard, { hasCompletedOnboarding } from './components/OnboardingWizard';
import OnlineUpdateModal from './components/modals/OnlineUpdateModal';
import { checkOnlineUpdate } from './utils/updateChecker';

function MainLayout() {
  const { activeTab, setActiveTab, toastMessage } = useApp();
  const [showOnboarding, setShowOnboarding] = useState(() => !hasCompletedOnboarding());
  const [onlineUpdateInfo, setOnlineUpdateInfo] = useState(null);
  const [showOnlineUpdateModal, setShowOnlineUpdateModal] = useState(false);
  const mainRef = useRef(null);
  const toastRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      animateViewTransition(mainRef.current);
    }
  }, [activeTab]);

  useEffect(() => {
    if (toastMessage && toastRef.current) {
      animateToastEntrance(toastRef.current);
    }
  }, [toastMessage]);

  // Supabase Online Guncelleme Kontrolu (Arka planda ve Manuel)
  useEffect(() => {
    // 3.5 saniye sonra sessiz kontrol
    const timer = setTimeout(async () => {
      try {
        const res = await checkOnlineUpdate();
        if (res && res.hasUpdate) {
          setOnlineUpdateInfo(res);
          setShowOnlineUpdateModal(true);
        }
      } catch (_) {}
    }, 3500);

    // Manuel kontrol olayi dinleyici
    const handleManualCheck = async () => {
      try {
        const res = await checkOnlineUpdate();
        setOnlineUpdateInfo(res);
        setShowOnlineUpdateModal(true);
      } catch (_) {}
    };

    window.addEventListener("check-app-update", handleManualCheck);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("check-app-update", handleManualCheck);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* Ambient background gradient (subtle) */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(244,63,94,0.04) 0%, transparent 70%)'
        }}
        aria-hidden="true"
      />

      {/* Accessibility: Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-rose-600 focus:text-white focus:font-semibold focus:rounded-xl focus:shadow-2xl focus:ring-2 focus:ring-white focus:outline-none"
      >
        Ana İçeriğe Atla
      </a>

      <UpdateNotifier />
      <Navbar />

      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main
          id="main-content"
          ref={mainRef}
          tabIndex="-1"
          className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto focus:outline-none min-w-0"
        >
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'teachers' && <TeachersView />}
          {activeTab === 'students' && <StudentsView />}
          {activeTab === 'courses' && <CoursesView />}
          {activeTab === 'course-branches' && <CourseBranchMappingView />}
          {activeTab === 'duties' && <DutyDistributionView />}
          {activeTab === 'commission' && <CommissionEditView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SchoolSettingsView />}
          {activeTab === 'backup' && <BackupView />}
          {activeTab === 'guide' && (
            <UserGuideView onRelaunchTour={() => setShowOnboarding(true)} />
          )}
        </main>
      </div>

      {/* Onboarding Wizard / İlk Açılış Rehberi */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onOpenGuide={() => {
          setShowOnboarding(false);
          setActiveTab('guide');
        }}
        onNavigateTab={(tab) => {
          setShowOnboarding(false);
          setActiveTab(tab);
        }}
      />

      {/* Supabase Tabanli Online Guncelleme Penceresi */}
      <OnlineUpdateModal
        isOpen={showOnlineUpdateModal}
        onClose={() => setShowOnlineUpdateModal(false)}
        updateInfo={onlineUpdateInfo}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          ref={toastRef}
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 no-print max-w-xs"
        >
          <div
            className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold shadow-2xl backdrop-blur-xl"
            style={
              toastMessage.type === 'error'
                ? {
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95))',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(239,68,68,0.4)',
                    color: 'white'
                  }
                : toastMessage.type === 'info'
                ? {
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    color: 'white'
                  }
                : {
                    background: 'linear-gradient(135deg, rgba(5,150,105,0.95), rgba(16,185,129,0.95))',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
                    color: 'white'
                  }
            }
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            ) : toastMessage.type === 'info' ? (
              <Info className="w-5 h-5 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
            )}
            <span className="leading-tight">{toastMessage.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}


export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
