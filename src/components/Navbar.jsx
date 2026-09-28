import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  School,
  Moon,
  Sun,
  AlertTriangle,
  Printer,
  Sparkles
} from 'lucide-react';
import Status3DOrb from './3d/Status3DOrb';

export default function Navbar() {
  const {
    schoolInfo,
    darkMode,
    setDarkMode,
    conflicts,
    setActiveTab,
    runAutoAssignment
  } = useApp();

  const logoRef = useRef(null);

  const totalConflicts =
    conflicts.teacherConflicts.length +
    conflicts.roomConflicts.length +
    conflicts.studentConflicts.length +
    conflicts.warnings.length;

  const hasIssues = conflicts.hasErrors || conflicts.hasWarnings;

  // Subtle logo glow animation on mount
  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;
    el.style.animation = 'floatY 5s ease-in-out infinite';
  }, []);

  return (
    <header className="sticky top-0 z-30 no-print" style={{ willChange: 'transform' }}>
      {/* Premium gradient border bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.5), rgba(251,191,36,0.4), transparent)'
        }}
        aria-hidden="true"
      />
      <div className="bg-white/92 dark:bg-slate-950/92 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Brand & School Title */}
          <div className="flex items-center space-x-3">
            <div
              ref={logoRef}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/30 animate-glow-pulse"
              aria-hidden="true"
              style={{
                background: 'linear-gradient(135deg, #f43f5e, #dc2626, #f59e0b)',
                boxShadow: '0 0 16px rgba(244,63,94,0.4), inset 0 1px 0 rgba(255,255,255,0.25)'
              }}
            >
              <School className="w-5 h-5 drop-shadow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg truncate">
                  MEB Sorumluluk Sınavları
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, rgba(244,63,94,0.12), rgba(251,191,36,0.12))',
                    border: '1px solid rgba(244,63,94,0.25)',
                    color: '#be123c'
                  }}
                >
                  {schoolInfo.donem || 'ŞUBAT'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm leading-none mt-0.5">
                {schoolInfo.okulAdi}&nbsp;•&nbsp;{schoolInfo.ogretimYili}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">

            {/* 3D Dynamic Status Indicator */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 backdrop-blur-sm">
              <Status3DOrb hasIssues={hasIssues} count={totalConflicts} />
              <span className="text-[11px] font-semibold">
                {hasIssues ? (
                  <span className="text-amber-600 dark:text-amber-400">{totalConflicts}&nbsp;Uyarı</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">Sorunsuz</span>
                )}
              </span>
            </div>

            {/* Conflict Alert */}
            {hasIssues && (
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  color: '#d97706'
                }}
                title="Çakışma tespit edildi! Çözmek için tıklayın"
                aria-label={`${totalConflicts} çakışma ve uyarı var, takvimi aç`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" aria-hidden="true" />
                <span className="hidden sm:inline">{totalConflicts}&nbsp;Çakışma</span>
              </button>
            )}

            {/* Quick Auto-Assign Button */}
            <button
              type="button"
              onClick={runAutoAssignment}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
                border: '1px solid rgba(99,102,241,0.25)',
                color: '#6366f1'
              }}
              title="Öğretmenlere sınav görevlerini dengeli ve branşa göre otomatik dağıt"
              aria-label="Görevleri otomatik dağıt"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Otomatik Dağıt</span>
            </button>

            {/* Print Quick Access */}
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/40 transition-all duration-200 active:scale-95 backdrop-blur-sm"
              title="Resmi MEB Raporları ve Baskı Merkezi"
              aria-label="Raporlar ve Yazdırma Merkezini Aç"
            >
              <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              <span className="hidden md:inline">Raporlar</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: darkMode
                  ? 'rgba(251,191,36,0.1)'
                  : 'rgba(99,102,241,0.07)',
                border: darkMode
                  ? '1px solid rgba(251,191,36,0.25)'
                  : '1px solid rgba(99,102,241,0.15)',
                color: darkMode ? '#fbbf24' : '#6366f1'
              }}
              title={darkMode ? 'Açık Mod' : 'Karanlık Mod'}
              aria-label={darkMode ? 'Açık moda geç' : 'Karanlık moda geç'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
