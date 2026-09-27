import React from 'react';
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
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

function MainLayout() {
  const { activeTab, toastMessage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'teachers' && <TeachersView />}
          {activeTab === 'students' && <StudentsView />}
          {activeTab === 'courses' && <CoursesView />}
          {activeTab === 'duties' && <DutyDistributionView />}
          {activeTab === 'commission' && <CommissionEditView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SchoolSettingsView />}
          {activeTab === 'backup' && <BackupView />}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 no-print">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-3 text-xs sm:text-sm font-semibold backdrop-blur-md ${
              toastMessage.type === 'error'
                ? 'bg-red-500/90 text-white border-red-600'
                : toastMessage.type === 'info'
                ? 'bg-slate-900/90 text-white border-slate-700'
                : 'bg-emerald-600/95 text-white border-emerald-500 shadow-emerald-600/20'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : toastMessage.type === 'info' ? (
              <Info className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span>{toastMessage.message}</span>
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
