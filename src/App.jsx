import React, { useRef, useEffect } from 'react';
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
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { animateViewTransition, animateToastEntrance } from './utils/animeEffects';

function MainLayout() {
  const { activeTab, toastMessage } = useApp();
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
        </main>
      </div>

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
