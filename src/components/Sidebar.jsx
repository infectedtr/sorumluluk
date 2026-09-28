import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  GraduationCap,
  BookOpen,
  Link2,
  Scale,
  ClipboardEdit,
  FileText,
  Settings,
  Database,
  AlertCircle
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    teachers,
    students,
    courses,
    schedule,
    conflicts
  } = useApp();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Gösterge Paneli',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'schedule',
      label: 'Sınav Programı & Takvim',
      icon: CalendarDays,
      badge: schedule.length,
      hasAlert: conflicts.hasErrors
    },
    {
      id: 'teachers',
      label: 'Öğretmenler & Komisyon',
      icon: Users,
      badge: teachers.length
    },
    {
      id: 'students',
      label: 'Öğrenci Sorumluluk Listesi',
      icon: GraduationCap,
      badge: students.length
    },
    {
      id: 'courses',
      label: 'Dersler & Seviyeler',
      icon: BookOpen,
      badge: courses.length
    },
    {
      id: 'course-branches',
      label: 'Ders - Branş Eşleştirme',
      icon: Link2,
      badge: null
    },
    {
      id: 'duties',
      label: 'Görev Dağılım Çizelgesi',
      icon: Scale,
      badge: null
    },
    {
      id: 'commission',
      label: 'Komisyon Manuel Düzenle',
      icon: ClipboardEdit,
      badge: null
    },
    {
      id: 'reports',
      label: 'MEB Resmi Raporları',
      icon: FileText,
      badge: '9 Evrak',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    },
    {
      id: 'settings',
      label: 'Okul Bilgileri & Ayarlar',
      icon: Settings,
      badge: null
    },
    {
      id: 'backup',
      label: 'Yedekleme & Veri',
      icon: Database,
      badge: null
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between transition-colors no-print">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Menü
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shadow-sm shadow-rose-500/10 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {item.hasAlert && (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                  )}
                  {item.badge !== null && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.badgeColor ||
                        (isActive
                          ? 'bg-rose-200/70 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Access Database Origin Info */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Veriler Aktif</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Access 2025 veritabanı tam entegre çalışmaktadır.
          </p>
        </div>
      </div>
    </aside>
  );
}
