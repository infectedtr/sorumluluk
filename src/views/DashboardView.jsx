import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getExamObservers } from '../utils/examRoles';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Scale,
  Sparkles,
  FileSpreadsheet,
  Printer,
  AlertTriangle,
  CheckCircle,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  TrendingUp,
  Activity
} from 'lucide-react';
import ExamModal from '../components/modals/ExamModal';
import ImportExcelModal from '../components/modals/ImportExcelModal';
import Hero3DCanvas from '../components/3d/Hero3DCanvas';
import Tilt3DCard from '../components/3d/Tilt3DCard';
import AnimatedCounter from '../components/common/AnimatedCounter';
import { staggerEntrance } from '../utils/animeEffects';

export default function DashboardView() {
  const {
    schoolInfo,
    teachers,
    students,
    courses,
    schedule,
    conflicts,
    teacherStats,
    setActiveTab,
    runAutoAssignment,
    addExam
  } = useApp();

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const kpiGridRef = useRef(null);
  const scheduleRowsRef = useRef(null);

  // Group exams by date
  const sortedSchedule = [...schedule].sort((a, b) => {
    const da = `${a.tarih || ''} ${a.saat || ''}`;
    const db = `${b.tarih || ''} ${b.saat || ''}`;
    return da.localeCompare(db);
  });

  const totalDutiesAssigned = teacherStats.reduce((sum, t) => sum + t.count, 0);
  const activeTeacherCount = teachers.filter((t) => t.active).length;
  const avgDutiesPerTeacher = activeTeacherCount > 0 ? (totalDutiesAssigned / activeTeacherCount).toFixed(1) : 0;

  useEffect(() => {
    if (kpiGridRef.current) {
      staggerEntrance(kpiGridRef.current.children, { delay: 80, staggerDelay: 55 });
    }
    if (scheduleRowsRef.current) {
      staggerEntrance(scheduleRowsRef.current.children, { delay: 300, staggerDelay: 35 });
    }
  }, []);

  const kpiCards = [
    {
      label: 'Sorumlu Öğrenci',
      value: students.length,
      icon: GraduationCap,
      tab: 'students',
      action: 'Listele',
      gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      glow: 'rgba(59,130,246,0.25)',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      ariaLabel: (v) => `${v} sorumlu öğrenci kaydı, öğrenci listesine git`
    },
    {
      label: 'Sorumluluk Dersi',
      value: courses.length,
      icon: BookOpen,
      tab: 'courses',
      action: 'İncele',
      gradient: 'linear-gradient(135deg, #a855f7, #d946ef)',
      glow: 'rgba(168,85,247,0.25)',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      ariaLabel: (v) => `${v} farklı sorumluluk dersi`
    },
    {
      label: 'Sınav Oturumu',
      value: schedule.length,
      icon: CalendarDays,
      tab: 'schedule',
      action: 'Takvim',
      gradient: 'linear-gradient(135deg, #f43f5e, #f97316)',
      glow: 'rgba(244,63,94,0.25)',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      ariaLabel: (v) => `${v} planlanan sınav oturumu`
    },
    {
      label: 'Öğretmen',
      value: teachers.length,
      icon: Users,
      tab: 'teachers',
      action: `${totalDutiesAssigned} Görev`,
      gradient: 'linear-gradient(135deg, #10b981, #22c55e)',
      glow: 'rgba(16,185,129,0.25)',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      ariaLabel: (v) => `${v} öğretmen, toplam ${totalDutiesAssigned} görev`
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in-scale">

      {/* ──────────────────────────────────────────────
          HERO BANNER - 3D Interactive Welcome
          ────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl text-white shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1e0a14 0%, #3b0020 30%, #1a1035 70%, #0f172a 100%)',
          border: '1px solid rgba(244,63,94,0.2)'
        }}
      >
        {/* Mesh gradient blobs */}
        <div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.22) 0%, transparent 70%)', filter: 'blur(40px)' }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 right-1/3 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)', filter: 'blur(50px)' }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 -right-10 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }}
          aria-hidden="true"
        />

        {/* Scanline overlay for premium feel */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)',
            backgroundSize: '100% 4px'
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7">
          <div className="space-y-3 max-w-2xl">
            {/* Breadcrumb-style tag */}
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.13)',
                color: 'rgba(253,232,255,0.8)'
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#fb923c' }}
                aria-hidden="true"
              />
              <span>{schoolInfo.valilik}</span>
              <span className="opacity-50">•</span>
              <span>{schoolInfo.ogretimYili} EĞİTİM ÖĞRETİM YILI</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight text-balance">
              {schoolInfo.okulAdi}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,200,210,0.75)' }}>
              {schoolInfo.donem} Dönemi Sorumluluk Sınavları — Yönetim, Planlama ve Belge Merkezi
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                style={{
                  background: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  color: 'white',
                  backdropFilter: 'blur(8px)'
                }}
                aria-label="e-Okul Excel dosyasını sisteme yükle"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
                <span>e-Okul Excel Yükle</span>
              </button>
              <button
                type="button"
                onClick={runAutoAssignment}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #f43f5e)',
                  boxShadow: '0 4px 16px rgba(244,63,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
                aria-label="Sınav görevlerini branşa göre adil ve otomatik dağıt"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Akıllı Görev Dağıt</span>
              </button>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="relative w-full lg:w-64 h-44 lg:h-52 shrink-0 flex items-center justify-center">
            <Hero3DCanvas className="w-full h-full" />
            <div className="absolute bottom-1 right-2 text-[9px] font-mono tracking-widest uppercase"
              style={{ color: 'rgba(244,63,94,0.4)' }}
            >
              Spatial Engine
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          KPI CARDS - 3D Tilt + Animated Counters
          ────────────────────────────────────────────── */}
      <div ref={kpiGridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Tilt3DCard
              key={card.tab}
              onClick={() => setActiveTab(card.tab)}
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-shadow duration-300"
              tabIndex={0}
              role="button"
              aria-label={card.ariaLabel(card.value)}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3" style={{ transform: 'translateZ(12px)' }}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: card.gradient,
                    boxShadow: `0 4px 12px ${card.glow}`
                  }}
                >
                  <Icon className="w-4.5 h-4.5 text-white" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-bold flex items-center space-x-0.5" style={{
                  color: card.iconColor.includes('blue') ? '#3b82f6' :
                         card.iconColor.includes('purple') ? '#a855f7' :
                         card.iconColor.includes('rose') ? '#f43f5e' : '#10b981'
                }}>
                  <span>{card.action}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </span>
              </div>

              {/* Value */}
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white" style={{ transform: 'translateZ(18px)' }}>
                <AnimatedCounter value={card.value} />
              </div>

              {/* Label */}
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1" style={{ transform: 'translateZ(8px)' }}>
                {card.label}
              </div>

              {/* Bottom accent bar */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: card.gradient }}
                aria-hidden="true"
              />
            </Tilt3DCard>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────
          STATUS BANNER
          ────────────────────────────────────────────── */}
      {conflicts.hasErrors || conflicts.hasWarnings ? (
        <div
          role="region"
          aria-label="Sınav takvimi uyarı ve çakışmaları"
          className="p-4 rounded-xl space-y-3 animate-fade-in-up"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.06))',
            border: '1px solid rgba(245,158,11,0.25)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-sm text-amber-800 dark:text-amber-300">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </div>
              <span>Sınav Takviminde {totalDutiesAssigned ? '' : ''}Çakışma / Uyarı Tespit Edildi</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #d97706, #dc2626)' }}
              aria-label="Takvime git ve çakışmaları çöz"
            >
              Takvime Git
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-800 dark:text-amber-300">
            {conflicts.teacherConflicts.map((tc, idx) => (
              <div key={`tc-${idx}`} className="p-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                <span className="font-bold">{tc.teacher}:</span> {tc.message}
              </div>
            ))}
            {conflicts.roomConflicts.map((rc, idx) => (
              <div key={`rc-${idx}`} className="p-2 rounded-lg dark:bg-slate-900/70"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                <span className="font-bold">{rc.salon}:</span> {rc.message}
              </div>
            ))}
            {conflicts.warnings.map((warning, idx) => (
              <div key={`warning-${idx}`} className="p-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                {warning.message}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          role="status"
          className="p-4 rounded-xl flex items-center justify-between animate-fade-in-up"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(34,197,94,0.05))',
            border: '1px solid rgba(16,185,129,0.2)'
          }}
        >
          <div className="flex items-center space-x-3 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            </div>
            <span>Sınav takviminde çakışma bulunmamaktadır. Program resmi kurallara tam uygundur.</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-bold shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
            aria-label="MEB resmi raporlarını görüntüle"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Rapor Al</span>
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          MAIN GRID
          ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Schedule Stream */}
        <section
          aria-labelledby="heading-schedule-stream"
          className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                <CalendarDays className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              </div>
              <h2 id="heading-schedule-stream" className="font-bold text-slate-900 dark:text-white text-sm">
                Sınav Programı Akışı
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsExamModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 transition-colors"
                aria-label="Yeni sınav oturumu ekle"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Oturum Ekle</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                aria-label={`Tüm sınav takvimini gör`}
              >
                Tümü ({schedule.length})
              </button>
            </div>
          </div>

          <div ref={scheduleRowsRef} className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {sortedSchedule.slice(0, 6).map((exam) => (
              <div
                key={exam.id}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 tabular-nums">
                      {exam.seviye}.&nbsp;Sınıf
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {exam.ders}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      ({exam.ogrenciSayisi || 0}&nbsp;Öğr.)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1 tabular-nums">
                      <Clock className="w-3 h-3 text-rose-400" aria-hidden="true" />
                      <span>{exam.tarih || 'Tarih Yok'} — {exam.saat || '10:00'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-blue-400" aria-hidden="true" />
                      <span>{exam.salon || 'Derslik'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs shrink-0">
                  <div className="bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 max-w-[120px] truncate text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-white">K:</span>{' '}
                    {[exam.uye1, exam.uye2].filter(Boolean).join(', ') || '—'}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 max-w-[120px] truncate text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-white">G:</span>{' '}
                    {getExamObservers(exam).join(', ') || '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {schedule.length === 0 && (
            <div className="px-5 py-10 text-center">
              <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Henüz sınav oturumu eklenmedi.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                "Oturum Ekle" veya e-Okul listesi aktararak başlayabilirsiniz.
              </p>
            </div>
          )}
        </section>

        {/* Duty Balance */}
        <section
          aria-labelledby="heading-duties-balance"
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                <Scale className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              </div>
              <h2 id="heading-duties-balance" className="font-bold text-slate-900 dark:text-white text-sm">
                Görev Dağılımı
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('duties')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              aria-label="Detaylı görev dağılım föyünü aç"
            >
              Detaylı Föy
            </button>
          </div>

          <div className="px-5 py-3">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
              Öğretmenlerin sınav komisyonlarındaki görev yükü:
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {teacherStats.slice(0, 10).map((t, index) => {
                const maxCount = teacherStats[0]?.count || 1;
                const pct = Math.min(100, (t.count / maxCount) * 100);
                const colors = [
                  'from-rose-500 to-pink-500',
                  'from-indigo-500 to-violet-500',
                  'from-blue-500 to-cyan-500',
                  'from-emerald-500 to-teal-500',
                  'from-amber-500 to-orange-500',
                ];
                const colorClass = colors[index % colors.length];
                return (
                  <div key={t.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                        {t.name}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums text-[11px] ml-2 shrink-0"
                        style={{ color: '#6366f1' }}
                      >
                        {t.count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                  <span className="text-[11px] text-slate-500">Ort. Görev / Öğretmen</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white tabular-nums text-sm">
                  {avgDutiesPerTeacher}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                  <span className="text-[11px] text-slate-500">Toplam Görev</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white tabular-nums text-sm">
                  {totalDutiesAssigned}
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Modals */}
      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        onSave={addExam}
      />
      <ImportExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />
    </div>
  );
}
