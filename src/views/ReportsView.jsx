import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { normalizeExamType } from '../utils/examTypes';
import { getExamObservers, getExamStaff } from '../utils/examRoles';
import {
  FileText,
  Printer,
  Calendar,
  Users,
  GraduationCap,
  Mail,
  Award,
  Layers,
  CheckCircle,
  FileCheck,
  ChevronRight,
  FileSpreadsheet,
  Download
} from 'lucide-react';

const FEE_HOURS_PER_DUTY = 5;

export default function ReportsView() {
  const {
    schoolInfo,
    teachers,
    students,
    courses,
    schedule,
    teacherStats
  } = useApp();

  const [activeReport, setActiveReport] = useState('program');
  const [feeReportTab, setFeeReportTab] = useState('program');
  const [selectedExamId, setSelectedExamId] = useState(schedule[0]?.id || null);
  const [selectedTeacherName, setSelectedTeacherName] = useState('all');
  const [selectedDate, setSelectedDate] = useState(schedule[0]?.tarih || '');

  const reportsList = [
    {
      id: 'program',
      title: '1. Genel Sorumluluk Sınav Programı',
      desc: 'İdare ve okul panosu için onaylı tam sınav takvimi çizelgesi',
      icon: Calendar
    },
    {
      id: 'ogrenci_duyuru',
      title: '2. Öğrenci Sınav Duyuru Çizelgesi',
      desc: 'Öğrencilerin sınıf ve numarasına göre sınav tarih/saat listesi',
      icon: GraduationCap
    },
    {
      id: 'yoklama_tutanak',
      title: '3. Sınav Yoklama ve Not Tutanağı',
      desc: 'Her sınav oturumu için öğrenci imza ve not takdir föyü',
      icon: FileCheck
    },
    {
      id: 'ogretmen_teblig',
      title: '4. Öğretmen Sınav Görev Tebliğ Belgesi',
      desc: 'Öğretmenlere sınav görevleri ve aynı oturumdaki komisyon/gözcü isimlerinin tebliği (Tekil veya Toplu)',
      icon: Users
    },
    {
      id: 'gunluk_imza',
      title: '5. Günlük Sınav Görevli İmza Sirküsü',
      desc: 'Sınav gününde komisyon üyelerinin imzalayacağı günlük imza föyü',
      icon: FileText
    },
    {
      id: 'zarf_kapak',
      title: '6. Sınav Evrak Zarf Kapakları',
      desc: 'Soru, Cevap ve Genel Sınav Evrakı Zarf Etiketleri',
      icon: Layers
    },
    {
      id: 'teslim_tutanak',
      title: '7. Sınav Evrakı Teslim Tutanağı',
      desc: 'Soru ve cevap kağıtlarının idareye teslim edildiğine dair tutanak',
      icon: CheckCircle
    },
    {
      id: 'makam_olur',
      title: '8. Valilik / Kaymakamlık Makam Olur Yazısı',
      desc: 'İl/İlçe Milli Eğitim Müdürlüğü ve Mülki Amir onay resmi üst yazısı',
      icon: Mail
    },
    {
      id: 'ucret_onay',
      title: '9. Öğretmen Sınav Ücret Onay Çizelgesi',
      desc: 'PROGRAM ve SINAV ÜCRET ÇİZELGESİ sekmelerini ayrı ayrı yazdırın',
      icon: Award
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const selectedExam = schedule.find((e) => e.id === Number(selectedExamId)) || schedule[0];
  const noticeTeachers = selectedTeacherName === 'all'
    ? teacherStats.filter((teacher) => teacher.count > 0)
    : teacherStats.filter((teacher) => teacher.name === selectedTeacherName);
  const uniqueDates = Array.from(new Set(schedule.map((ex) => ex.tarih).filter(Boolean))).sort();
  const feeTeachers = teacherStats
    .filter((teacher) => teacher.count > 0)
    .map((teacher) => {
      const commissionCount = teacher.assignments.filter((assignment) =>
        ['1. Üye', '2. Üye'].includes(assignment.role)
      ).length;
      const invigilationCount = teacher.assignments.filter((assignment) =>
        ['Gözcü', 'Ek Gözcü'].includes(assignment.role)
      ).length;

      return {
        ...teacher,
        commissionCount,
        invigilationCount,
        totalHours: teacher.count * FEE_HOURS_PER_DUTY
      };
    });
  const feeTotals = feeTeachers.reduce(
    (totals, teacher) => ({
      commissionCount: totals.commissionCount + teacher.commissionCount,
      invigilationCount: totals.invigilationCount + teacher.invigilationCount,
      dutyCount: totals.dutyCount + teacher.count,
      totalHours: totals.totalHours + teacher.totalHours
    }),
    { commissionCount: 0, invigilationCount: 0, dutyCount: 0, totalHours: 0 }
  );
  const academicYearEnd =
    schoolInfo.ogretimYili?.split('-')[1]?.match(/\d{4}/)?.[0] || String(new Date().getFullYear());
  const datePlaceholder = `...../...../${academicYearEnd}`;
  const normalizedOlurBody = (schoolInfo.govde || '').replace(
    /İbrahim Evren Mesleki ve Teknik Anadolu Lisesi\s*i?/gi,
    schoolInfo.okulAdi || ''
  );

  // Filter students for the selected exam
  const examStudents = selectedExam
    ? students.filter(
        (s) =>
          s.ders &&
          selectedExam.ders &&
          s.ders.toUpperCase() === selectedExam.ders.toUpperCase() &&
          Number(s.seviye) === Number(selectedExam.seviye)
      )
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Printer className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <span>MEB Resmi Rapor & Evrak Merkezi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Yönetmeliğe uygun A4 baskı ve PDF formatında resmi sınav evrakları
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/25 active:scale-95 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>
            {activeReport === 'ucret_onay'
              ? `Seçili ${feeReportTab === 'program' ? 'PROGRAM' : 'SINAV ÜCRET ÇİZELGESİ'} Sekmesini Yazdır / PDF İndir`
              : 'Bu Belgeyi Yazdır / PDF İndir'}
          </span>
        </button>
      </div>

      {/* Report Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 no-print">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          const isActive = activeReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setActiveReport(rep.id)}
              className={`p-3 rounded-xl text-left border transition-all flex items-start space-x-3 ${
                isActive
                  ? 'bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-100 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isActive
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs leading-snug truncate">{rep.title}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{rep.desc}</div>
              </div>
            </button>
          );
        })}
        <a
          href="/reports/Sorumluluk%20YEN%C4%B0%20HAL%C4%B0.xlsm"
          download="Sorumluluk YENİ HALİ.xlsm"
          className="p-3 rounded-xl text-left border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 transition-all flex items-start space-x-3 hover:border-emerald-400 dark:hover:border-emerald-700"
        >
          <div className="p-2 rounded-lg shrink-0 bg-emerald-600 text-white">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs leading-snug">Ücret Oluru için Sorumluluk Listesi Dosyası</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
              Makro içeren Excel çalışma kitabını indir
            </div>
          </div>
          <Download className="w-4 h-4 shrink-0 mt-1" />
        </a>
      </div>

      {/* Sub-Filters for Specific Reports */}
      <div className="no-print bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl flex flex-wrap items-center gap-4 text-xs">
        {activeReport === 'ucret_onay' && (
          <div className="flex w-full flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Ücret onay raporu:</span>
            <button
              type="button"
              onClick={() => setFeeReportTab('program')}
              aria-pressed={feeReportTab === 'program'}
              className={`rounded-lg border px-3 py-1.5 font-semibold ${
                feeReportTab === 'program'
                  ? 'border-rose-600 bg-rose-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              PROGRAM
            </button>
            <button
              type="button"
              onClick={() => setFeeReportTab('fee')}
              aria-pressed={feeReportTab === 'fee'}
              className={`rounded-lg border px-3 py-1.5 font-semibold ${
                feeReportTab === 'fee'
                  ? 'border-rose-600 bg-rose-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              SINAV ÜCRET ÇİZELGESİ
            </button>
            <span className="ml-auto text-slate-500">Yazdır düğmesi yalnızca seçili sekmeyi basar.</span>
          </div>
        )}

        {activeReport === 'yoklama_tutanak' && (
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Sınav Oturumu Seçin:</span>
            <select
              value={selectedExamId || ''}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              {schedule.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.tarih} {ex.saat} - {ex.seviye}. Sınıf {ex.ders} ({ex.ogrenciSayisi} Öğr.)
                </option>
              ))}
            </select>
          </div>
        )}

        {activeReport === 'ogretmen_teblig' && (
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Öğretmen Seçin:</span>
            <select
              value={selectedTeacherName}
              onChange={(e) => setSelectedTeacherName(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="all">Tüm Öğretmenler (Toplu Tebliğ Sayfaları)</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.branch})
                </option>
              ))}
            </select>
          </div>
        )}

        {activeReport === 'gunluk_imza' && (
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Sınav Tarihi Seçin:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d} Günü
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* PAPER CANVAS: Printable Area */}
      <div className="bg-white text-black p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 min-h-[900px] print:min-h-0 print:p-0 print:border-none print:shadow-none">
        
        {/* ============================================================== */}
        {/* RAPOR 1: GENEL SORUMLULUK SINAV PROGRAMI ÇİZELGESİ */}
        {/* ============================================================== */}
        {activeReport === 'program' && (
          <div className="space-y-6">
            <div className="text-center space-y-1 pb-2">
              <h2 className="font-bold text-sm tracking-wide">T.C.</h2>
              <h2 className="font-bold text-sm tracking-wide">{schoolInfo.valilik}</h2>
              <h3 className="font-bold text-base">{schoolInfo.okulAdi}</h3>
              <h4 className="font-bold text-xs uppercase pt-1">
                {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ
                <br />
                SORUMLULUK SINAV PROGRAMI ÇİZELGESİ
              </h4>
            </div>

            <table className="w-full text-[11px] border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1.5 w-8 text-center">S.No</th>
                  <th className="border border-black p-1.5 w-24 text-center">Sınav Tarihi</th>
                  <th className="border border-black p-1.5 w-16 text-center">Saat</th>
                  <th className="border border-black p-1.5 w-16 text-center">Seviye</th>
                  <th className="border border-black p-1.5">Dersin Adı</th>
                  <th className="border border-black p-1.5 w-12 text-center">Öğr.</th>
                  <th className="border border-black p-1.5 w-24">Sınav Yeri</th>
                  <th className="border border-black p-1.5">1. Komisyon Üyesi</th>
                  <th className="border border-black p-1.5">2. Komisyon Üyesi</th>
                  <th className="border border-black p-1.5">Gözcü / Diğer Gözcüler</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((ex, idx) => (
                  <tr key={ex.id} className="page-break-inside-avoid">
                    <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                    <td className="border border-black p-1.5 text-center font-medium">{ex.tarih}</td>
                    <td className="border border-black p-1.5 text-center font-bold">{ex.saat}</td>
                    <td className="border border-black p-1.5 text-center">{ex.seviye}. Sınıf</td>
                    <td className="border border-black p-1.5 font-bold">{ex.ders}</td>
                    <td className="border border-black p-1.5 text-center">{ex.ogrenciSayisi || 0}</td>
                    <td className="border border-black p-1.5">{ex.salon}</td>
                    <td className="border border-black p-1.5 font-medium">{ex.uye1 || '-'}</td>
                    <td className="border border-black p-1.5 font-medium">{ex.uye2 || '-'}</td>
                    <td className="border border-black p-1.5">{getExamObservers(ex).join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Block */}
            <div className="pt-8 flex justify-between items-center text-xs page-break-inside-avoid">
              <div className="text-center space-y-1">
                <p>Düzenleyen</p>
                <p className="font-bold">{schoolInfo.mudurYardimcisi}</p>
                <p className="pt-8">Müdür Yardımcısı</p>
              </div>

              <div className="text-center space-y-1">
                <p>{datePlaceholder}</p>
                <p className="font-bold">UYGUNDUR</p>
                <p className="font-bold">{schoolInfo.okulMuduru}</p>
                <p className="pt-8">{schoolInfo.unvan}</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* RAPOR 2: ÖĞRENCİ SINAV TAKVİMİ & DUYURU LİSTESİ */}
        {/* ============================================================== */}
        {activeReport === 'ogrenci_duyuru' && (
          <div className="space-y-6">
            <div className="text-center space-y-1 pb-2">
              <h2 className="font-bold text-sm">T.C. - {schoolInfo.valilik}</h2>
              <h3 className="font-bold text-base">{schoolInfo.okulAdi}</h3>
              <h4 className="font-bold text-xs uppercase">
                {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ
                <br />
                SORUMLULUK SINAVLARINA GİRECEK ÖĞRENCİ VE SINAV TAKVİMİ DUYURU ÇİZELGESİ
              </h4>
              <p className="text-[11px] text-slate-600 pt-1">
                Öğrencilerin sınav saatinden en az 15 dakika önce sınav salonunda hazır bulunmaları gerekmektedir.
              </p>
            </div>

            <table className="w-full text-[11px] border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1.5 w-8 text-center">S.No</th>
                  <th className="border border-black p-1.5 w-20">Sınıfı</th>
                  <th className="border border-black p-1.5 w-16 text-center">Okul No</th>
                  <th className="border border-black p-1.5">Öğrencinin Adı Soyadı</th>
                  <th className="border border-black p-1.5">Sorumlu Olduğu Ders</th>
                  <th className="border border-black p-1.5 w-16 text-center">Seviye</th>
                  <th className="border border-black p-1.5 w-24 text-center">Sınav Tarihi</th>
                  <th className="border border-black p-1.5 w-16 text-center">Saat</th>
                  <th className="border border-black p-1.5 w-24">Sınav Salonu</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => {
                  const examInfo = schedule.find(
                    (ex) =>
                      ex.ders &&
                      st.ders &&
                      ex.ders.toUpperCase() === st.ders.toUpperCase() &&
                      Number(ex.seviye) === Number(st.seviye)
                  );

                  return (
                    <tr key={st.id || idx} className="page-break-inside-avoid">
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1 font-bold">{st.sinif}</td>
                      <td className="border border-black p-1 text-center">{st.no}</td>
                      <td className="border border-black p-1 font-bold">{st.adSoyad}</td>
                      <td className="border border-black p-1 font-semibold text-rose-800">{st.ders}</td>
                      <td className="border border-black p-1 text-center">{st.seviye}. Sınıf</td>
                      <td className="border border-black p-1 text-center">{examInfo?.tarih || '-'}</td>
                      <td className="border border-black p-1 text-center font-bold">{examInfo?.saat || '-'}</td>
                      <td className="border border-black p-1">{examInfo?.salon || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pt-8 text-right text-xs">
              <p className="font-bold">{schoolInfo.okulMuduru}</p>
              <p>{schoolInfo.unvan}</p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* RAPOR 3: SINAV YOKLAMA VE NOT TUTANAĞI */}
        {/* ============================================================== */}
        {activeReport === 'yoklama_tutanak' && selectedExam && (
          <div className="space-y-6">
            <div className="text-center space-y-1 pb-1">
              <h2 className="font-bold text-sm">T.C. - {schoolInfo.valilik}</h2>
              <h3 className="font-bold text-base">{schoolInfo.okulAdi}</h3>
              <h4 className="font-bold text-xs uppercase">
                {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ
                <br />
                SORUMLULUK SINAVI İMZA VE NOT TAKDİR ÇİZELGESİ
              </h4>
            </div>

            {/* Exam Details Box */}
            <div className="grid grid-cols-2 text-xs border border-black p-2 font-medium">
              <div>
                <p><strong>Dersin Adı:</strong> {selectedExam.ders}</p>
                <p><strong>Sınıf Seviyesi:</strong> {selectedExam.seviye}. Sınıf</p>
                <p><strong>Sınav Salonu:</strong> {selectedExam.salon}</p>
              </div>
              <div>
                <p><strong>Sınav Tarihi:</strong> {selectedExam.tarih}</p>
                <p><strong>Sınav Saati:</strong> {selectedExam.saat}</p>
                <p><strong>Sorumlu Öğrenci Sayısı:</strong> {examStudents.length}</p>
              </div>
            </div>

            {/* Student Attendance & Grades Table */}
            <table className="w-full text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1.5 w-8 text-center">S.No</th>
                  <th className="border border-black p-1.5 w-20">Sınıfı</th>
                  <th className="border border-black p-1.5 w-16 text-center">Okul No</th>
                  <th className="border border-black p-1.5">Öğrencinin Adı Soyadı</th>
                  <th className="border border-black p-1.5 w-28 text-center">Öğrenci İmzası</th>
                  <th className="border border-black p-1.5 w-16 text-center">Rakamla</th>
                  <th className="border border-black p-1.5 w-24 text-center">Yazıyla</th>
                  <th className="border border-black p-1.5 w-20 text-center">Sonuç</th>
                </tr>
              </thead>
              <tbody>
                {examStudents.length > 0 ? (
                  examStudents.map((st, idx) => (
                    <tr key={idx} className="h-8 page-break-inside-avoid">
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1 font-semibold">{st.sinif}</td>
                      <td className="border border-black p-1 text-center">{st.no}</td>
                      <td className="border border-black p-1 font-bold">{st.adSoyad}</td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1 text-center"></td>
                    </tr>
                  ))
                ) : (
                  Array.from({ length: 15 }).map((_, idx) => (
                    <tr key={idx} className="h-7 page-break-inside-avoid">
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Exam Commission Signatures */}
            <div className="pt-6 border-t border-black text-xs space-y-3 page-break-inside-avoid">
              <p className="font-semibold text-center">
                İşbu sınav tutanağı yukarıda adı belirtilen komisyonumuz marifetiyle tanzim ve imza altına alınmıştır.
              </p>
              <div className="grid grid-cols-3 text-center pt-4">
                <div>
                  <p className="font-bold">{selectedExam.uye1 || '1. Komisyon Üyesi'}</p>
                  <p className="text-[11px]">Alan Öğretmeni</p>
                  <p className="pt-8">İmza</p>
                </div>
                <div>
                  <p className="font-bold">{selectedExam.uye2 || '2. Komisyon Üyesi'}</p>
                  <p className="text-[11px]">Alan Öğretmeni</p>
                  <p className="pt-8">İmza</p>
                </div>
                <div>
                  <p className="font-bold">{getExamObservers(selectedExam).join(', ') || 'Gözcü'}</p>
                  <p className="text-[11px]">Gözcü / Gözcüler</p>
                  <p className="pt-8">İmza</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* RAPOR 4: ÖĞRETMEN SINAV GÖREV TEBLİĞ BELGESİ */}
        {/* ============================================================== */}
        {activeReport === 'ogretmen_teblig' && (
          <div className="teblig-report">
            {noticeTeachers.map((t, idx) => (
              <section
                key={idx}
                className={`teblig-print-page ${idx < noticeTeachers.length - 1 ? 'teblig-page-break' : ''}`}
              >
                <div className="teblig-copies">
                  {[0, 1].map((copyIndex) => (
                    <div key={copyIndex} className="teblig-copy">
                      <div className="text-center space-y-1">
                        <h2 className="font-bold text-xs">T.C. - {schoolInfo.valilik}</h2>
                        <h3 className="font-bold text-sm">{schoolInfo.okulAdi}</h3>
                        <h4 className="font-bold text-xs uppercase">
                          SORUMLULUK SINAVLARI GÖREV TEBLİĞ BELGESİ
                        </h4>
                        <p className="text-[11px]">{schoolInfo.ogretimYili} Eğitim-Öğretim Yılı {schoolInfo.donem} Dönemi</p>
                      </div>

                      <div className="teblig-copy-text text-xs">
                        <p><strong>Sayın:</strong> {t.name} ({t.branch})</p>
                        <p className="text-justify leading-relaxed">
                          {schoolInfo.ogretimYili} Eğitim-Öğretim Yılı {schoolInfo.donem} Dönemi Sorumluluk Sınavlarında aşağıda belirtilen gün, saat ve derslerde sınav komisyon üyesi / gözcü olarak görevlendirilmiş bulunmaktasınız. Her oturum için birlikte görev yapacağınız diğer komisyon üyeleri ve gözcüler de belirtilmiştir. Sınav evraklarının sınav saatinden 30 dakika önce idareden teslim alınarak sınavın mevzuat hükümlerine uygun yürütülmesi hususunda; Bilgilerinizi ve gereğini rica ederim.
                        </p>
                      </div>

                      <table className="teblig-duty-table w-full text-xs border-collapse border border-black">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-black p-1 text-center">S.No</th>
                            <th className="border border-black p-1 text-center">Tarih</th>
                            <th className="border border-black p-1 text-center">Saat</th>
                            <th className="border border-black p-1">Ders</th>
                            <th className="border border-black p-1 text-center">Seviye</th>
                            <th className="border border-black p-1">Yer</th>
                            <th className="border border-black p-1 text-center">Görev</th>
                            <th className="border border-black p-1">Diğer Görevliler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {t.assignments.map((asg, aIdx) => {
                            const exam = schedule.find((item) => String(item.id) === String(asg.examId));
                            const otherStaff = exam
                              ? getExamStaff(exam).filter((name) => name !== t.name).join(', ')
                              : '';
                            return (
                              <tr key={aIdx}>
                                <td className="border border-black p-1 text-center">{aIdx + 1}</td>
                                <td className="border border-black p-1 text-center font-medium">{asg.tarih}</td>
                                <td className="border border-black p-1 text-center font-bold">{asg.saat}</td>
                                <td className="border border-black p-1 font-bold">{asg.ders}</td>
                                <td className="border border-black p-1 text-center">{asg.seviye}. Sınıf</td>
                                <td className="border border-black p-1">{asg.salon}</td>
                                <td className="border border-black p-1 text-center font-semibold">{asg.role}</td>
                                <td className="border border-black p-1">{otherStaff || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div className="teblig-signatures grid grid-cols-2 pt-4 text-xs">
                        <div>
                          <p className="font-bold">TEBELLÜĞ EDEN</p>
                          <p>{t.name}</p>
                          <p>İmza: ........................</p>
                          <p>Tarih: {datePlaceholder}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">TEBLİĞ EDEN</p>
                          <p className="font-bold">{schoolInfo.okulMuduru}</p>
                          <p>{schoolInfo.unvan}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="teblig-cut-line" aria-hidden="true" />
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ============================================================== */}
        {/* RAPOR 5: GÜNLÜK SINAV GÖREVLİ İMZA SİRKÜSÜ */}
        {/* ============================================================== */}
        {activeReport === 'gunluk_imza' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="font-bold text-sm">T.C. - {schoolInfo.valilik}</h2>
              <h3 className="font-bold text-base">{schoolInfo.okulAdi}</h3>
              <h4 className="font-bold text-xs uppercase">
                {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ
                <br />
                {selectedDate || `.../.../${academicYearEnd}`} GÜNÜ SORUMLULUK SINAVLARI GÖREVLİ İMZA SİRKÜSÜ
              </h4>
            </div>

            <table className="w-full text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1.5 w-8 text-center">S.No</th>
                  <th className="border border-black p-1.5 w-16 text-center">Saat</th>
                  <th className="border border-black p-1.5">Sınav Dersi</th>
                  <th className="border border-black p-1.5 w-24">Sınav Salonu</th>
                  <th className="border border-black p-1.5">Görevli Öğretmenin Adı Soyadı</th>
                  <th className="border border-black p-1.5 w-24">Komisyon Görevi</th>
                  <th className="border border-black p-1.5 w-28 text-center">İmza</th>
                </tr>
              </thead>
              <tbody>
                {schedule
                  .filter((ex) => !selectedDate || ex.tarih === selectedDate)
                  .flatMap((ex) => [
                    { ...ex, teacher: ex.uye1, role: '1. Komisyon Üyesi' },
                    { ...ex, teacher: ex.uye2, role: '2. Komisyon Üyesi' },
                    ...getExamObservers(ex).map((teacher) => ({ ...ex, teacher, role: 'Gözcü' }))
                  ])
                  .filter((item) => Boolean(item.teacher))
                  .map((row, idx) => (
                    <tr key={idx} className="h-8 page-break-inside-avoid">
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1 text-center font-bold">{row.saat}</td>
                      <td className="border border-black p-1 font-bold">{row.ders} ({row.seviye}. Sınıf)</td>
                      <td className="border border-black p-1">{row.salon}</td>
                      <td className="border border-black p-1 font-bold">{row.teacher}</td>
                      <td className="border border-black p-1 text-slate-700">{row.role}</td>
                      <td className="border border-black p-1 text-center"></td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className="pt-8 text-right text-xs">
              <p className="font-bold">{schoolInfo.okulMuduru}</p>
              <p>{schoolInfo.unvan}</p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* RAPOR 6: SINAV EVRAK ZARF KAPAKLARI */}
        {/* ============================================================== */}
        {activeReport === 'zarf_kapak' && selectedExam && (
          <div className="space-y-8">
            {/* Zarf 1: Soru Zarfı */}
            <div className="border-2 border-black p-6 space-y-4 page-break-inside-avoid">
              <div className="text-center border-b border-black pb-3">
                <h3 className="font-bold text-sm">{schoolInfo.okulAdi}</h3>
                <h4 className="font-extrabold text-base tracking-wider mt-1">SORU ZARFI</h4>
                <p className="text-xs uppercase">{schoolInfo.ogretimYili} - {schoolInfo.donem} DÖNEMİ SORUMLULUK SINAVI</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <p>Dersin Adı: <span className="font-bold text-sm">{selectedExam.ders}</span></p>
                <p>Sınav Tarihi: <span>{selectedExam.tarih}</span></p>
                <p>Sınıf Seviyesi: <span>{selectedExam.seviye}. Sınıf</span></p>
                <p>Sınav Saati: <span>{selectedExam.saat}</span></p>
                <p>Öğrenci Sayısı: <span>{selectedExam.ogrenciSayisi}</span></p>
                <p>Sınav Salonu: <span>{selectedExam.salon}</span></p>
              </div>

              <div className="pt-2 text-xs">
                <p><strong>Komisyon Üyeleri:</strong> {[selectedExam.uye1, selectedExam.uye2].filter(Boolean).join(' - ')}</p>
                <p><strong>Gözcüler:</strong> {getExamObservers(selectedExam).join(' - ') || '-'}</p>
              </div>
            </div>

            {/* Zarf 2: Cevap Zarfı */}
            <div className="border-2 border-black p-6 space-y-4 page-break-inside-avoid">
              <div className="text-center border-b border-black pb-3">
                <h3 className="font-bold text-sm">{schoolInfo.okulAdi}</h3>
                <h4 className="font-extrabold text-base tracking-wider mt-1">CEVAP KAĞIDI ZARFI</h4>
                <p className="text-xs uppercase">{schoolInfo.ogretimYili} - {schoolInfo.donem} DÖNEMİ SORUMLULUK SINAVI</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <p>Dersin Adı: <span className="font-bold text-sm">{selectedExam.ders}</span></p>
                <p>Sınav Tarihi: <span>{selectedExam.tarih}</span></p>
                <p>Sınıf Seviyesi: <span>{selectedExam.seviye}. Sınıf</span></p>
                <p>Sınav Saati: <span>{selectedExam.saat}</span></p>
              </div>

              <div className="border border-black p-3 text-xs space-y-1">
                <p>Sınava Giren Öğrenci Sayısı: ...........</p>
                <p>Sınava Girmeyen Öğrenci Sayısı: ...........</p>
                <p>Zarf İçindeki Cevap Kağıdı Sayısı: ...........</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* RAPOR 7: SINAV EVRAKI TESLİM TUTANAĞI */}
        {/* ============================================================== */}
        {activeReport === 'teslim_tutanak' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="font-bold text-sm">T.C. - {schoolInfo.valilik}</h2>
              <h3 className="font-bold text-base">{schoolInfo.okulAdi}</h3>
              <h4 className="font-bold text-xs uppercase">
                {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ
                <br />
                SORUMLULUK SINAVLARI EVRAK TESLİM VE TESELLÜM TUTANAĞI
              </h4>
            </div>

            <p className="text-xs leading-relaxed text-justify">
              {schoolInfo.ogretimYili} Eğitim ve Öğretim Yılı {schoolInfo.donem} Dönemi Sorumluluk Sınavlarına ait sınav soruları, cevap anahtarları, soru kağıtları, öğrencilerin imzalı sınav yoklama çizelgesi ve değerlendirilmiş cevap kağıtları kapalı ve mühürlü zarf içerisinde okul idaresine eksiksiz olarak teslim edilmiştir.
            </p>

            <table className="w-full text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1 w-8 text-center">S.No</th>
                  <th className="border border-black p-1">Dersin Adı</th>
                  <th className="border border-black p-1 w-16 text-center">Seviye</th>
                  <th className="border border-black p-1 w-24 text-center">Sınav Tarihi</th>
                  <th className="border border-black p-1">Komisyon Üyeleri</th>
                  <th className="border border-black p-1 w-24 text-center">Teslim Alan İdareci</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((ex, idx) => (
                  <tr key={ex.id} className="page-break-inside-avoid">
                    <td className="border border-black p-1 text-center">{idx + 1}</td>
                    <td className="border border-black p-1 font-bold">{ex.ders}</td>
                    <td className="border border-black p-1 text-center">{ex.seviye}. Sınıf</td>
                    <td className="border border-black p-1 text-center">{ex.tarih}</td>
                    <td className="border border-black p-1">{[ex.uye1, ex.uye2].filter(Boolean).join(', ')}</td>
                    <td className="border border-black p-1 text-center">İmza</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================== */}
        {/* RAPOR 8: MAKAM ONUR / VALİLİK YAZISI */}
        {/* ============================================================== */}
        {activeReport === 'makam_olur' && (
          <div className="space-y-6 max-w-3xl mx-auto text-xs leading-relaxed">
            <div className="text-center space-y-1 font-bold">
              <p>T.C.</p>
              <p>{schoolInfo.valilik}</p>
              <p>{schoolInfo.okulAdi}</p>
              <p>{schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ</p>
            </div>

            <div className="flex justify-between pt-4 font-semibold">
              <div>
                <p>{schoolInfo.sayi}</p>
                <p>{schoolInfo.konu}</p>
              </div>
              <div>
                <p>Tarih: {datePlaceholder}</p>
              </div>
            </div>

            <div className="pt-6 font-bold text-center">
              <p>{schoolInfo.valilik.includes('VALİLİK') ? 'VALİLİK MAKAMINA' : 'KAYMAKAMLIK MAKAMINA'}</p>
              <p>({schoolInfo.ilceMem})</p>
            </div>

            <div className="pt-2 font-semibold">
              <p>{schoolInfo.ilgi}</p>
            </div>

            <div className="pt-2 text-justify space-y-3">
              <p>{normalizedOlurBody}</p>
              <p>Olurlarınıza arz ederim.</p>
            </div>

            <div className="pt-6 text-right">
              <p className="font-bold">{schoolInfo.okulMuduru}</p>
              <p>{schoolInfo.unvan}</p>
            </div>

            <div className="pt-10 space-y-8">
              <div className="text-center font-bold">
                <p>{schoolInfo.onay2}</p>
                <p>{datePlaceholder}</p>
                <p className="pt-4">{schoolInfo.onay2Makam}</p>
              </div>

              <div className="text-center font-bold">
                <p>O L U R</p>
                <p>{datePlaceholder}</p>
                <p className="pt-6">{schoolInfo.olurMakam}</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* RAPOR 9: ÖĞRETMEN SINAV ÜCRET ONAY ÇİZELGESİ */}
        {/* ============================================================== */}
        {activeReport === 'ucret_onay' && feeReportTab === 'program' && (
          <div className="space-y-5">
            <section className="space-y-5 fee-program-sheet">
              <div className="text-center space-y-1">
                <h2 className="font-bold text-sm">T.C.</h2>
                <h2 className="font-bold text-sm">{schoolInfo.valilik}</h2>
                <h3 className="font-bold text-base">{schoolInfo.okulAdi}</h3>
                <h4 className="font-bold text-xs uppercase pt-1">
                  {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ
                  <br />
                  SORUMLULUK SINAVI PROGRAMI
                </h4>
              </div>

              <table className="w-full text-[10px] border-collapse border border-black">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-black p-1 text-center">Sıra No</th>
                    <th className="border border-black p-1 text-center">Sınav Tarihi</th>
                    <th className="border border-black p-1 text-center">Sınav Saati</th>
                    <th className="border border-black p-1 text-center">Seviye</th>
                    <th className="border border-black p-1">Ders Adı</th>
                    <th className="border border-black p-1">Sınav Türü</th>
                    <th className="border border-black p-1 text-center">Öğrenci Sayısı</th>
                    <th className="border border-black p-1">Sınav Salonu</th>
                    <th className="border border-black p-1">Komisyon Üyeleri</th>
                    <th className="border border-black p-1">Gözcüler</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((exam, index) => (
                    <tr key={exam.id} className="page-break-inside-avoid">
                      <td className="border border-black p-1 text-center">{index + 1}</td>
                      <td className="border border-black p-1 text-center">{exam.tarih || '-'}</td>
                      <td className="border border-black p-1 text-center">{exam.saat || '-'}</td>
                      <td className="border border-black p-1 text-center">
                        {exam.seviye || '-'}
                      </td>
                      <td className="border border-black p-1">{exam.ders || '-'}</td>
                      <td className="border border-black p-1">{normalizeExamType(exam.sinavTuru)}</td>
                      <td className="border border-black p-1 text-center">{exam.ogrenciSayisi || 0}</td>
                      <td className="border border-black p-1">{exam.salon || '-'}</td>
                      <td className="border border-black p-1">
                        {[exam.uye1, exam.uye2].filter(Boolean).join(', ') || '-'}
                      </td>
                      <td className="border border-black p-1">
                        {getExamObservers(exam).join(', ') || '-'}
                      </td>
                    </tr>
                  ))}
                  {schedule.length === 0 && (
                    <tr>
                      <td className="border border-black p-2 text-center" colSpan={10}>
                        Sınav programında gösterilecek oturum bulunmamaktadır.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="pt-8 flex justify-between items-center text-xs page-break-inside-avoid">
                <div className="text-center space-y-1">
                  <p>Düzenleyen</p>
                  <p className="font-bold">{schoolInfo.mudurYardimcisi}</p>
                  <p>Müdür Yardımcısı</p>
                </div>
                <div className="text-center space-y-1">
                  <p>Uygundur</p>
                  <p className="font-bold">{schoolInfo.okulMuduru}</p>
                  <p>{schoolInfo.unvan}</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeReport === 'ucret_onay' && feeReportTab === 'fee' && (
          <div className="space-y-5">
            <section className="space-y-5 fee-summary-sheet">
              <div className="text-center space-y-1">
                <h2 className="font-bold text-sm">{schoolInfo.okulAdi}</h2>
                <h3 className="font-bold text-xs uppercase">
                  {schoolInfo.ogretimYili} {schoolInfo.donem} DÖNEMİ SORUMLULUK SINAV ÜCRET ÇİZELGESİ
                </h3>
              </div>

              <table className="w-full text-[10px] border-collapse border border-black">
                <thead>
                  <tr className="bg-slate-100">
                    <th rowSpan={2} className="border border-black p-1 text-center">Sıra No</th>
                    <th rowSpan={2} className="border border-black p-1">Öğretmenin Adı Soyadı</th>
                    <th rowSpan={2} className="border border-black p-1 text-center">
                      Sınav Komisyon Üyeliği Sayısı
                    </th>
                    <th rowSpan={2} className="border border-black p-1 text-center">
                      Gözcü / Ek Gözcü Sayısı
                    </th>
                    <th rowSpan={2} className="border border-black p-1 text-center">
                      Toplam Sınav Görevi Sayısı
                    </th>
                    <th rowSpan={2} className="border border-black p-1 text-center">
                      Bir Sınav Karşılığı Ücret Saati
                    </th>
                    <th colSpan={2} className="border border-black p-1 text-center">
                      Ücret Ödenecek
                    </th>
                  </tr>
                  <tr className="bg-slate-100">
                    <th className="border border-black p-1 text-center">Toplam Saat</th>
                    <th className="border border-black p-1">Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {feeTeachers.map((teacher, index) => (
                    <tr key={teacher.id} className="page-break-inside-avoid">
                      <td className="border border-black p-1 text-center">{index + 1}</td>
                      <td className="border border-black p-1 font-bold">{teacher.name}</td>
                      <td className="border border-black p-1 text-center">{teacher.commissionCount}</td>
                      <td className="border border-black p-1 text-center">{teacher.invigilationCount}</td>
                      <td className="border border-black p-1 text-center">{teacher.count}</td>
                      <td className="border border-black p-1 text-center">{FEE_HOURS_PER_DUTY}</td>
                      <td className="border border-black p-1 text-center font-bold">{teacher.totalHours}</td>
                      <td className="border border-black p-1"></td>
                    </tr>
                  ))}
                  {feeTeachers.length === 0 && (
                    <tr>
                      <td className="border border-black p-2 text-center" colSpan={8}>
                        Ücret çizelgesi oluşturmak için sınav programında öğretmen görevi bulunmalıdır.
                      </td>
                    </tr>
                  )}
                  <tr className="font-bold bg-slate-100 page-break-inside-avoid">
                    <td className="border border-black p-1 text-center" colSpan={2}>GENEL TOPLAM</td>
                    <td className="border border-black p-1 text-center">{feeTotals.commissionCount}</td>
                    <td className="border border-black p-1 text-center">{feeTotals.invigilationCount}</td>
                    <td className="border border-black p-1 text-center">{feeTotals.dutyCount}</td>
                    <td className="border border-black p-1 text-center">{FEE_HOURS_PER_DUTY}</td>
                    <td className="border border-black p-1 text-center">{feeTotals.totalHours}</td>
                    <td className="border border-black p-1"></td>
                  </tr>
                </tbody>
              </table>

              <p className="text-xs leading-relaxed text-justify">
                {schoolInfo.okulAdi} {schoolInfo.donem} dönemi sorumluluk sınavlarının, yukarıda
                durumları açıklanan öğretmenler tarafından yapılması uygun görülmüştür.
              </p>

              <div className="pt-8 flex justify-between items-center text-xs page-break-inside-avoid">
                <div className="text-center space-y-1">
                  <p>Düzenleyen</p>
                  <p className="font-bold">{schoolInfo.mudurYardimcisi}</p>
                  <p>Müdür Yardımcısı</p>
                </div>
                <div className="text-center space-y-1">
                  <p>Onaylayan</p>
                  <p className="font-bold">{schoolInfo.okulMuduru}</p>
                  <p>{schoolInfo.unvan}</p>
                </div>
              </div>
            </section>
          </div>
        )}

      </div>

    </div>
  );
}
