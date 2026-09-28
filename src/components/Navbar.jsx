import React from 'react';
import { useApp } from '../context/AppContext';
import {
  School,
  Moon,
  Sun,
  AlertTriangle,
  Printer,
  Calendar,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function Navbar() {
  const {
    schoolInfo,
    darkMode,
    setDarkMode,
    conflicts,
    setActiveTab,
    runAutoAssignment
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & School Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                MEB Sorumluluk Sınavları Sistemi
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                {schoolInfo.donem || 'ŞUBAT'} DÖNEMİ
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
              {schoolInfo.okulAdi} • {schoolInfo.ogretimYili}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Conflict Alert Indicator */}
          {conflicts.hasErrors || conflicts.hasWarnings ? (
            <button
              onClick={() => setActiveTab('schedule')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/20 transition-all animate-pulse"
              title="Çakışma tespit edildi! Çözmek için tıklayın"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">
                {conflicts.teacherConflicts.length + conflicts.roomConflicts.length + conflicts.studentConflicts.length + conflicts.warnings.length} Çakışma / Uyarı
              </span>
            </button>
          ) : (
            <div className="hidden lg:flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Çakışma Yok</span>
            </div>
          )}

          {/* Quick Auto-Assign Button */}
          <button
            onClick={runAutoAssignment}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800/50 transition-all"
            title="Öğretmenlere sınav görevlerini dengeli ve branşa göre otomatik dağıt"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Otomatik Dağıt</span>
          </button>

          {/* Print Quick Access */}
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all"
            title="Resmi MEB Raporları ve Baskı Merkezi"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="hidden md:inline">Raporlar & Yazdır</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Açık Mod' : 'Karanlık Mod'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
}
