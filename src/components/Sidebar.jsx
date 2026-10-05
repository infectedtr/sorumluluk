import React, { useState } from 'react';
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
  Lock,
  Unlock,
  AlertCircle,
  GripVertical,
  RotateCcw
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    teachers,
    students,
    courses,
    schedule,
    conflicts,
    sidebarReorderEnabled,
    setSidebarReorderEnabled,
    sidebarOrder,
    setSidebarOrder,
    resetSidebarOrder,
    DEFAULT_MENU_ORDER
  } = useApp();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Gösterge Paneli',
      icon: LayoutDashboard,
      badge: null,
      color: 'from-rose-500 to-orange-500'
    },
    {
      id: 'schedule',
      label: 'Sınav Programı & Takvim',
      icon: CalendarDays,
      badge: schedule.length,
      hasAlert: conflicts.hasErrors || conflicts.hasWarnings,
      color: 'from-rose-500 to-pink-500'
    },
    {
      id: 'teachers',
      label: 'Öğretmenler & Komisyon',
      icon: Users,
      badge: teachers.length,
      color: 'from-indigo-500 to-violet-500'
    },
    {
      id: 'students',
      label: 'Öğrenci Sorumluluk Listesi',
      icon: GraduationCap,
      badge: students.length,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'courses',
      label: 'Dersler & Seviyeler',
      icon: BookOpen,
      badge: courses.length,
      color: 'from-purple-500 to-fuchsia-500'
    },
    {
      id: 'course-branches',
      label: 'Ders - Branş Eşleştirme',
      icon: Link2,
      badge: null,
      color: 'from-teal-500 to-emerald-500'
    },
    {
      id: 'duties',
      label: 'Görev Dağılım Çizelgesi',
      icon: Scale,
      badge: null,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'commission',
      label: 'Komisyon Manuel Düzenle',
      icon: ClipboardEdit,
      badge: null,
      color: 'from-rose-500 to-red-500'
    },
    {
      id: 'reports',
      label: 'MEB Resmi Raporları',
      icon: FileText,
      badge: '9',
      badgeColor: 'emerald',
      color: 'from-emerald-500 to-green-500'
    },
    {
      id: 'settings',
      label: 'Okul Bilgileri & Ayarlar',
      icon: Settings,
      badge: null,
      color: 'from-slate-500 to-slate-600'
    },
    {
      id: 'backup',
      label: 'Yedekleme & Veri',
      icon: Database,
      badge: null,
      color: 'from-slate-500 to-slate-600'
    },
    {
      id: 'guide',
      label: 'Kullanım Kılavuzu & Rehber',
      icon: BookOpen,
      badge: 'Rehber',
      badgeColor: 'blue',
      color: 'from-sky-500 to-blue-600'
    }
  ];

  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const handleDragStart = (e, id) => {
    if (!sidebarReorderEnabled) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, id) => {
    if (!sidebarReorderEnabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e, targetId) => {
    if (!sidebarReorderEnabled) return;
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const currentOrder = [...sidebarOrder];
    const fromIndex = currentOrder.indexOf(draggedId);
    const toIndex = currentOrder.indexOf(targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      currentOrder.splice(fromIndex, 1);
      currentOrder.splice(toIndex, 0, draggedId);
      setSidebarOrder(currentOrder);
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const sortedMenuItems = [...menuItems].sort((a, b) => {
    const idxA = sidebarOrder.indexOf(a.id);
    const idxB = sidebarOrder.indexOf(b.id);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });

  return (
    <aside
      className="w-60 shrink-0 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800/80 flex flex-col justify-between transition-colors no-print"
      aria-label="Sol Menü Gezintisi"
      style={{ minHeight: 'calc(100vh - 4rem)' }}
    >
      <div className="p-3 space-y-0.5">
        <div className="px-3 pt-2 pb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
          <div className="flex items-center space-x-1.5">
            <span>Menü</span>
            {sidebarReorderEnabled ? (
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 text-[9px] font-semibold flex items-center space-x-1 normal-case tracking-normal">
                <Unlock className="w-2.5 h-2.5" />
                <span>Düzenleme Açık</span>
              </span>
            ) : (
              <span className="text-[9px] text-slate-400/80 flex items-center space-x-0.5 normal-case tracking-normal font-medium" title="Menü sıralaması sabitlendi / kilitlendi.">
                <Lock className="w-2.5 h-2.5" />
                <span>Sabit</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setSidebarReorderEnabled(!sidebarReorderEnabled)}
              title={sidebarReorderEnabled ? "Sıralamayı kilitle / sabitle" : "Sürükle-bırak ile sıralamayı aç"}
              className={`px-1.5 py-0.5 rounded transition-all flex items-center space-x-1 text-[9px] font-semibold normal-case tracking-normal ${
                sidebarReorderEnabled
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {sidebarReorderEnabled ? (
                <>
                  <Lock className="w-2.5 h-2.5" />
                  <span>Kilitle</span>
                </>
              ) : (
                <>
                  <Unlock className="w-2.5 h-2.5" />
                  <span>Düzenle</span>
                </>
              )}
            </button>

            {JSON.stringify(sidebarOrder) !== JSON.stringify(DEFAULT_MENU_ORDER) && (
              <button
                type="button"
                onClick={resetSidebarOrder}
                title="Varsayılan menü sıralamasına sıfırla"
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors flex items-center space-x-0.5 lowercase font-semibold text-[9px]"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Sıfırla</span>
              </button>
            )}
          </div>
        </div>
        <nav className="space-y-0.5" aria-label="Ana Gezinme">
          {sortedMenuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDragging = draggedId === item.id;
            const isDragOver = dragOverId === item.id && draggedId !== item.id;

            return (
              <button
                key={item.id}
                type="button"
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragLeave={() => { if (dragOverId === item.id) setDragOverId(null); }}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-all duration-150 relative cursor-grab active:cursor-grabbing select-none ${
                  item.id === 'schedule' ? 'schedule-spotlight' : ''
                } ${
                  isDragging
                    ? 'opacity-30 scale-95 border-2 border-dashed border-rose-400'
                    : isDragOver
                    ? 'ring-2 ring-rose-500/70 bg-rose-50/80 dark:bg-rose-950/50 scale-[1.02]'
                    : isActive
                    ? 'text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${
                    item.color.includes('rose') ? '#f43f5e, #f97316' :
                    item.color.includes('indigo') ? '#6366f1, #7c3aed' :
                    item.color.includes('blue') ? '#3b82f6, #06b6d4' :
                    item.color.includes('purple') ? '#a855f7, #d946ef' :
                    item.color.includes('teal') ? '#14b8a6, #10b981' :
                    item.color.includes('amber') ? '#f59e0b, #f97316' :
                    item.color.includes('emerald') ? '#10b981, #22c55e' :
                    '#64748b, #475569'
                  })`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                  animationDelay: `${index * 30}ms`
                } : {}}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <GripVertical
                    className="w-3 h-3 shrink-0 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity -mr-0.5 cursor-grab"
                    aria-hidden="true"
                  />
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  }`}>
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="truncate text-[11.5px] font-semibold">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {item.hasAlert && (
                    <AlertCircle
                      className="w-3.5 h-3.5 text-amber-400 animate-pulse"
                      aria-hidden="true"
                    />
                  )}
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold tabular-nums ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : item.badgeColor === 'emerald'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
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

      {/* Program Sahibi Info */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
        <div
          className="p-3 rounded-xl text-[10px] relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(244,63,94,0.06), rgba(251,191,36,0.06))',
            border: '1px solid rgba(244,63,94,0.12)'
          }}
        >
          {/* Subtle shimmer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite'
            }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-500 mb-1">
              <span
                className="w-1.5 h-1.5 rounded-full animate-glow-pulse"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                aria-hidden="true"
              />
              <span className="font-medium uppercase tracking-wider text-[9px]">Sürüm Bilgisi</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight font-mono">
                v1.0.0 (Release)
              </p>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                Kararlı
              </span>
            </div>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('check-app-update'))}
              className="mt-2 w-full py-1.5 px-2 rounded-lg bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              title="Yeni sürüm olup olmadığını kontrol et"
            >
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Güncellemeleri Denetle</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
