import React, { useState } from 'react';
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
  MapPin
} from 'lucide-react';
import ExamModal from '../components/modals/ExamModal';
import ImportExcelModal from '../components/modals/ImportExcelModal';

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

  // Group exams by date
  const sortedSchedule = [...schedule].sort((a, b) => {
    const da = `${a.tarih || ''} ${a.saat || ''}`;
    const db = `${b.tarih || ''} ${b.saat || ''}`;
    return da.localeCompare(db);
  });

  const totalDutiesAssigned = teacherStats.reduce((sum, t) => sum + t.count, 0);
  const activeTeacherCount = teachers.filter((t) => t.active).length;
  const avgDutiesPerTeacher = activeTeacherCount > 0 ? (totalDutiesAssigned / activeTeacherCount).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-800 via-rose-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-rose-200">
              <span>{schoolInfo.valilik}</span>
              <span>•</span>
              <span>{schoolInfo.ogretimYili} EĞİTİM ÖĞRETİM YILI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {schoolInfo.okulAdi}
            </h1>
            <p className="text-rose-100/80 text-sm leading-relaxed">
              {schoolInfo.donem} Dönemi Sorumluluk Sınavları Yönetim, Takvim Planlama ve Resmi Belge Merkezi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>e-Okul Excel Yükle</span>
            </button>
            <button
              onClick={runAutoAssignment}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-900/30 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Akıllı Görev Dağıt</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500 shadow-sm hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-1">
              <span>Listele</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {students.length}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Sorumlu Öğrenci Kaydı
          </div>
        </div>

        {/* Total Courses */}
        <div
          onClick={() => setActiveTab('courses')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500 shadow-sm hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center space-x-1">
              <span>İncele</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {courses.length}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Farklı Sorumluluk Dersi
          </div>
        </div>

        {/* Total Exam Sessions */}
        <div
          onClick={() => setActiveTab('schedule')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500 shadow-sm hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-1">
              <span>Takvim</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {schedule.length}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Planlanan Sınav Oturumu
          </div>
        </div>

        {/* Teachers and Commission Duties */}
        <div
          onClick={() => setActiveTab('teachers')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500 shadow-sm hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
              <span>{totalDutiesAssigned} Görev</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {teachers.length}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Öğretmen (Ort. {avgDutiesPerTeacher} Görev)
          </div>
        </div>

      </div>

      {/* Conflict Box (if any) */}
      {conflicts.hasErrors || conflicts.hasWarnings ? (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Dikkat: Sınav Takviminde Çakışma veya Uyarılar Var!</span>
            </div>
            <button
              onClick={() => setActiveTab('schedule')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all shadow-sm"
            >
              Takvime Git & Düzelt
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-800 dark:text-amber-300">
            {conflicts.teacherConflicts.map((tc, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-amber-200 dark:border-amber-900/50">
                <span className="font-bold">{tc.teacher}:</span> {tc.message}
              </div>
            ))}
            {conflicts.roomConflicts.map((rc, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-amber-200 dark:border-amber-900/50">
                <span className="font-bold">{rc.salon}:</span> {rc.message}
              </div>
            ))}
            {conflicts.studentConflicts.map((sc, idx) => (
              <div key={`student-${idx}`} className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-amber-200 dark:border-amber-900/50">
                {sc.message}
              </div>
            ))}
            {conflicts.warnings.map((warning, idx) => (
              <div key={`warning-${warning.examId}-${warning.type}-${idx}`} className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-amber-200 dark:border-amber-900/50">
                {warning.message}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Sınav takviminde öğretmen veya salon çakışması bulunmamaktadır. Program kurallara uygundur.</span>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Rapor Al</span>
          </button>
        </div>
      )}

      {/* Main Grid: Upcoming Schedule & Teacher Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Sınav Programı Önizleme */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Sınav Programı Akışı
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExamModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Oturum Ekle</span>
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Tümünü Gör ({schedule.length})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedSchedule.slice(0, 6).map((exam) => (
              <div
                key={exam.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 rounded-xl px-2 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {exam.seviye}. Sınıf
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {exam.ders}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({exam.ogrenciSayisi || 0} Öğrenci)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>{exam.tarih || 'Tarih Belirlenmedi'} - {exam.saat || '10:00'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>{exam.salon || 'Derslik'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    <span className="font-semibold text-slate-900 dark:text-white">Komisyon:</span>{' '}
                    {[exam.uye1, exam.uye2].filter(Boolean).join(', ') || 'Atanmadı'}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    <span className="font-semibold text-slate-900 dark:text-white">Gözcü:</span>{' '}
                    {getExamObservers(exam).join(', ') || 'Atanmadı'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {schedule.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              Henüz sınav oturumu eklenmedi. "Oturum Ekle" butonuyla veya e-Okul listesi aktararak başlayabilirsiniz.
            </div>
          )}
        </div>

        {/* Right Column: Görev Dağılım Dengesi (Komisyon) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Görev Dağılımı
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('duties')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Detaylı Föy
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Öğretmenlerin sınav komisyonlarındaki eşit görev yükü durumu:
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {teacherStats.slice(0, 8).map((t) => (
              <div key={t.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                    {t.name}
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    {t.count} Görev
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (t.count / Math.max(1, teacherStats[0]?.count || 1)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">Ortalama Görev:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{avgDutiesPerTeacher} Sınav / Öğretmen</span>
          </div>
        </div>

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
