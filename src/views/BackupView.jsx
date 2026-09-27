import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { downloadJsonBackup } from '../data/storage';
import { exportToExcel } from '../utils/excelParser';
import { getExamObservers } from '../utils/examRoles';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function BackupView() {
  const context = useApp();
  const fileInputRef = useRef(null);

  // Confirm Modal state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Sil',
    confirmStyle: 'danger'
  });

  const handleDownloadBackup = () => {
    downloadJsonBackup({
      schoolInfo: context.schoolInfo,
      teachers: context.teachers,
      hours: context.hours,
      rooms: context.rooms,
      courses: context.courses,
      students: context.students,
      schedule: context.schedule
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        context.handleImportJson(parsed);
      } catch (err) {
        context.showToast('Yedek dosyası okunamadı (Geçersiz JSON).', 'error');
      }
    };
    reader.readAsText(file, 'utf8');
  };

  const handleExportFullExcel = () => {
    const scheduleData = context.schedule.map((ex, idx) => ({
      'Sıra': idx + 1,
      'Tarih': ex.tarih,
      'Saat': ex.saat,
      'Seviye': `${ex.seviye}. Sınıf`,
      'Ders': ex.ders,
      'Öğrenci': ex.ogrenciSayisi,
      'Salon': ex.salon,
      '1. Üye': ex.uye1,
      '2. Üye': ex.uye2,
      'Gözcü': getExamObservers(ex)[0] || '',
      'Diğer Gözcüler': getExamObservers(ex).slice(1).join(', ')
    }));
    exportToExcel(scheduleData, 'MEB_Tam_Sinav_Programi');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <Database className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          <span>Veri Yönetimi, Yedekleme ve Sıfırlama Merkezi</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Sistem kayıtlarının yedeğini alma, geri yükleme ve tablo verilerini tek tek veya topluca sıfırlama işlemleri
        </p>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Backup Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
            <Download className="w-6 h-6" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Sistem Yedeğini İndir (.JSON)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Okul bilgileri, öğretmenler, öğrenci sorumluluk kayıtları ve hazırladığınız sınav takvimi tek bir yedek dosyasına kaydedilir.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleDownloadBackup}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Tam Yedek Dosyası İndir</span>
            </button>

            <button
              onClick={handleExportFullExcel}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Tüm Programı Excel İndir</span>
            </button>
          </div>
        </div>

        {/* Restore Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
            <Upload className="w-6 h-6" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Yedekten Geri Yükle
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Daha önce aldığınız bir yedek (.json) dosyasını sisteme yükleyerek tüm verilerinizi anında geri getirebilirsiniz.
          </p>

          <div className="pt-2">
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Yedek Dosyası Seç ve Yükle</span>
            </button>
          </div>
        </div>

        {/* Claude AI Library Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-900/50 p-6 shadow-sm space-y-4 md:col-span-2 bg-gradient-to-r from-purple-50/50 to-indigo-50/30 dark:from-purple-950/20 dark:to-indigo-950/20">
          <div className="flex items-center space-x-3 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-6 h-6" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Claude AI İçin Tam Proje Kütüphane Dosyası (.md)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
            Tüm program mimarisini, veri modellerini, algoritmaları (MEB Madde 58 komisyon dağıtımı, e-Okul Makro2, Sütun I/J aktarımı ve 12. sınıf kısaltmaları) ve projenin eksiksiz kaynak kodlarını içeren tek parça kütüphane dosyasıdır. Claude Projects veya Claude web arayüzüne dosya olarak yükleyebilirsiniz.
          </p>

          <div className="pt-1 flex flex-wrap gap-3">
            <a
              href="/CLAUDE_PROJECT_LIBRARY.md"
              download="CLAUDE_PROJECT_LIBRARY.md"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Claude Proje Kütüphanesini İndir (CLAUDE_PROJECT_LIBRARY.md)</span>
            </a>
          </div>
        </div>

      </div>

      {/* Program Data Reset Center */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
          <Trash2 className="w-5 h-5" />
          <h2 className="font-bold text-slate-900 dark:text-white text-base">
            Tablo ve Program Verilerini Sıfırlama Düğmeleri
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          İhtiyacınıza göre belirli bir tabloyu veya tüm sınav verilerini güvenle sıfırlayabilirsiniz:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          
          {/* 1. Sınav Takvimini Sıfırla */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Sınav Programını Sıfırla
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tüm sınav oturumlarını ({context.schedule.length} oturum) siler. Öğrenci ve öğretmenler korunur.
              </p>
            </div>
            <button
              onClick={() => {
                setConfirmState({
                  isOpen: true,
                  title: 'Sınav Programını Sıfırla',
                  message: 'Sınav takvimindeki tüm oturumlar silinecektir. Onaylıyor musunuz?',
                  confirmText: 'Programı Sıfırla',
                  confirmStyle: 'danger',
                  onConfirm: () => context.clearAllExams()
                });
              }}
              className="w-full py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-semibold transition-all"
            >
              Sınav Takvimini Sil
            </button>
          </div>

          {/* 2. Sadece Komisyon Görevlerini Sıfırla */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Komisyon Görevlerini Sıfırla
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Sınav oturumlarını korur, yalnızca öğretmen atamalarını (Üye 1, 2, 3) boşaltır.
              </p>
            </div>
            <button
              onClick={() => {
                setConfirmState({
                  isOpen: true,
                  title: 'Komisyon Görevlerini Temizle',
                  message: 'Sınavlardaki tüm öğretmen görev atamaları boşaltılacak. Oturumlar korunacaktır. Onaylıyor musunuz?',
                  confirmText: 'Görevleri Temizle',
                  confirmStyle: 'warning',
                  onConfirm: () => context.clearCommissionAssignments()
                });
              }}
              className="w-full py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-semibold transition-all"
            >
              Görevlendirmeleri Temizle
            </button>
          </div>

          {/* 3. Öğrenci Listesini Sıfırla */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Öğrenci Listesini Sıfırla
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Kayıtlı tüm öğrencileri ({context.students.length} kayıt) temizler. Yeni liste yüklemek için kullanılır.
              </p>
            </div>
            <button
              onClick={() => {
                setConfirmState({
                  isOpen: true,
                  title: 'Öğrenci Listesini Sıfırla',
                  message: 'Kayıtlı tüm öğrenci sorumluluk verileri silinecektir. Onaylıyor musunuz?',
                  confirmText: 'Öğrencileri Sil',
                  confirmStyle: 'danger',
                  onConfirm: () => context.clearAllStudents()
                });
              }}
              className="w-full py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-semibold transition-all"
            >
              Öğrenci Listesini Sil
            </button>
          </div>

          {/* 4. Öğretmen Listesini Sıfırla */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Öğretmen Listesini Sıfırla
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Kayıtlı tüm öğretmenleri ({context.teachers.length} öğretmen) siler.
              </p>
            </div>
            <button
              onClick={() => {
                setConfirmState({
                  isOpen: true,
                  title: 'Öğretmen Listesini Sıfırla',
                  message: 'Kayıtlı tüm öğretmenler sistemden silinecektir. Onaylıyor musunuz?',
                  confirmText: 'Öğretmenleri Sil',
                  confirmStyle: 'danger',
                  onConfirm: () => context.clearAllTeachers()
                });
              }}
              className="w-full py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-semibold transition-all"
            >
              Öğretmenleri Sil
            </button>
          </div>

          {/* 5. Ders Listesini Sıfırla */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Ders Listesini Sıfırla
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Kayıtlı sorumluluk derslerini ({context.courses.length} ders) temizler.
              </p>
            </div>
            <button
              onClick={() => {
                setConfirmState({
                  isOpen: true,
                  title: 'Ders Listesini Sıfırla',
                  message: 'Kayıtlı tüm sorumluluk dersleri silinecektir. Onaylıyor musunuz?',
                  confirmText: 'Dersleri Sil',
                  confirmStyle: 'danger',
                  onConfirm: () => context.clearAllCourses()
                });
              }}
              className="w-full py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-semibold transition-all"
            >
              Dersleri Sil
            </button>
          </div>

          {/* 6. Tüm Dönem Sınav Verilerini Sıfırla (Yeni Dönem Hazırlığı) */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-amber-900 dark:text-amber-200">
                Yeni Dönem İçin Programı Sıfırla
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Öğretmenler ve okul ayarları kalır; öğrenciler, dersler ve sınav takvimi tamamen temizlenir.
              </p>
            </div>
            <button
              onClick={() => {
                setConfirmState({
                  isOpen: true,
                  title: 'Yeni Dönem İçin Programı Sıfırla',
                  message: 'Öğretmenleriniz ve okul bilgileriniz korunacaktır. Öğrenci listesi, dersler ve sınav programı tamamen silinecektir. Onaylıyor musunuz?',
                  confirmText: 'Evet, Yeni Döneme Hazırla',
                  confirmStyle: 'warning',
                  onConfirm: () => context.clearAllProgramData()
                });
              }}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
            >
              Yeni Döneme Hazırla
            </button>
          </div>

        </div>

        {/* Factory Reset Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <strong>Orijinal Access Veritabanı:</strong> İlk yüklenen 35 öğretmen, 103 öğrenci ve 22 ders verilerine geri dönebilirsiniz.
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setConfirmState({
                  isOpen: true,
                  title: 'Orijinal Access Verilerine Dön',
                  message: 'Tüm mevcut veriler silinip orijinal Access dosyasındaki ilk haline getirilecek. Onaylıyor musunuz?',
                  confirmText: 'Orijinal Haline Sıfırla',
                  confirmStyle: 'warning',
                  onConfirm: () => context.handleResetToAccess()
                });
              }}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Orijinal Access Haline Dön</span>
            </button>

            <button
              onClick={() => {
                setConfirmState({
                  isOpen: true,
                  title: 'Sistemi Tamamen Sıfırla',
                  message: 'DİKKAT: Öğretmenler, öğrenciler, dersler ve sınav programı dahil TÜM VERİLER silinecektir! Bu işlem geri alınamaz. Onaylıyor musunuz?',
                  confirmText: 'Tüm Sistemi Temizle',
                  confirmStyle: 'danger',
                  onConfirm: () => context.clearEntireSystem()
                });
              }}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Sistemi Tamamen Sıfırla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        confirmStyle={confirmState.confirmStyle}
      />

    </div>
  );
}
