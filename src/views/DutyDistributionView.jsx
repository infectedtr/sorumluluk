import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToExcel } from '../utils/excelParser';
import {
  Scale,
  Sparkles,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Calendar,
  Eye,
  Award
} from 'lucide-react';

export default function DutyDistributionView() {
  const {
    teachers,
    teacherStats,
    schedule,
    runAutoAssignment,
    setActiveTab
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const filteredStats = teacherStats.filter((t) => {
    if (search) {
      const q = search.toLocaleLowerCase('tr-TR');
      if (!(t.name || '').toLocaleLowerCase('tr-TR').includes(q)) return false;
      if (!(t.branch || '').toLocaleLowerCase('tr-TR').includes(q)) return false;
    }
    return true;
  });

  const totalDuties = teacherStats.reduce((sum, t) => sum + t.count, 0);
  const activeTeachers = teacherStats.filter((t) => t.active);
  const maxDuty = Math.max(0, ...teacherStats.map((t) => t.count));
  const minDuty = activeTeachers.length > 0 ? Math.min(...activeTeachers.map((t) => t.count)) : 0;
  const avgDuty = activeTeachers.length > 0 ? (totalDuties / activeTeachers.length).toFixed(1) : 0;

  const handleExportExcel = () => {
    const exportData = filteredStats.map((t, idx) => ({
      'Sıra': idx + 1,
      'Öğretmen Adı Soyadı': t.name,
      'Branşı': t.branch,
      'Durum': t.active ? 'Aktif' : 'Pasif',
      'Toplam Görev Sayısı': t.count,
      'Görev Dağılımı': t.assignments.map((a) => `${a.ders} (${a.tarih} ${a.saat})`).join('; ')
    }));
    exportToExcel(exportData, 'Ogretmen_Gorev_Dagilim_Cizelgesi');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Scale className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Öğretmen Komisyon Görev Dağılım Çizelgesi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Öğretmenlerin sınav komisyonlarındaki eşit görev dağılımı ve ek ders tahakkuku takibi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={runAutoAssignment}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Görevleri Eşit Dağıt</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel İndir</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Tebliğ & Ücret Onay Çıktısı</span>
          </button>
        </div>
      </div>

      {/* Duty Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Toplam Komisyon Görevi</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalDuties}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tüm sınav oturumlarında</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Öğretmen Başına Ortalama</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {avgDuty} Sınav
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{activeTeachers.length} aktif öğretmen</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-medium text-slate-500">En Çok Görev Alan</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {maxDuty} Görev
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Maksimum sınır</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-medium text-slate-500">En Az Görev Alan</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {minDuty} Görev
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {maxDuty - minDuty <= 1 ? (
              <span className="text-emerald-500 font-semibold">✓ Dağılım Mükemmel Dengeli</span>
            ) : (
              <span className="text-amber-500">Dengeleme önerilir</span>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Öğretmen veya branş ara..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5">Öğretmen Adı Soyadı</th>
                <th className="p-3.5">Branşı</th>
                <th className="p-3.5 text-center">Durum</th>
                <th className="p-3.5 text-center">Görev Sayısı</th>
                <th className="p-3.5">Görev Grafiği</th>
                <th className="p-3.5 text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStats.map((t, idx) => (
                <tr
                  key={`duty_${t.id || t.name}_${idx}`}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3.5 text-center font-medium text-slate-400">
                    {idx + 1}
                  </td>

                  <td className="p-3.5 font-bold text-slate-900 dark:text-white text-sm">
                    {t.name}
                  </td>

                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {t.branch}
                  </td>

                  <td className="p-3.5 text-center">
                    {t.active ? (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">İzinli</span>
                    )}
                  </td>

                  <td className="p-3.5 text-center font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                    {t.count}
                  </td>

                  <td className="p-3.5 w-48">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (t.count / Math.max(1, maxDuty)) * 100)}%`
                        }}
                      />
                    </div>
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedTeacher(t)}
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Görevleri</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Duty Detail Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedTeacher.name} ({selectedTeacher.count} Görev)
                </h3>
              </div>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {selectedTeacher.assignments && selectedTeacher.assignments.length > 0 ? (
                selectedTeacher.assignments.map((asg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{asg.ders} ({asg.seviye}. Sınıf)</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        {asg.role}
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 flex items-center space-x-3 pt-1">
                      <span>📅 {asg.tarih}</span>
                      <span>⏰ {asg.saat}</span>
                      <span>📍 {asg.salon}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Bu öğretmene henüz bir sınav görevi atanmamıştır.
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedTeacher(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
