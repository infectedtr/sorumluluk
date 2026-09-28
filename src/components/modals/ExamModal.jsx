import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, AlertTriangle, UserCheck, MapPin } from 'lucide-react';
import { EXAM_TYPES, normalizeExamType } from '../../utils/examTypes';
import { isAssignableTeacher } from '../../utils/teacherEligibility';
import { getExamObservers } from '../../utils/examRoles';
import { animateModalOpen } from '../../utils/animeEffects';

export default function ExamModal({ isOpen, onClose, onSave, exam }) {
  const { teachers, hours, rooms, courses, schedule, schoolInfo } = useApp();

  const [tarih, setTarih] = useState('');
  const [saat, setSaat] = useState('10:00');
  const [seviye, setSeviye] = useState(9);
  const [ders, setDers] = useState('');
  const [sinavTuru, setSinavTuru] = useState(EXAM_TYPES[0]);
  const [ogrenciSayisi, setOgrenciSayisi] = useState(0);
  const [salon, setSalon] = useState('');
  const [uye1, setUye1] = useState('');
  const [uye2, setUye2] = useState('');
  const [uye3, setUye3] = useState('');
  const [gozcu, setGozcu] = useState('');
  const [aciklama, setAciklama] = useState('');

  const backdropRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      animateModalOpen(modalRef.current, backdropRef.current);
    }
  }, [isOpen]);


  useEffect(() => {
    if (exam) {
      setTarih(exam.tarih || '2025-02-03');
      setSaat(exam.saat || '10:00');
      setSeviye(Number(exam.seviye) || 9);
      setDers(exam.ders || '');
      setSinavTuru(normalizeExamType(exam.sinavTuru));
      setOgrenciSayisi(exam.ogrenciSayisi || 0);
      setSalon(exam.salon || (rooms[0]?.name || 'Derslik 1'));
      setUye1(exam.uye1 || '');
      setUye2(exam.uye2 || '');
      setUye3(exam.uye3 || '');
      setGozcu(exam.gozcu || '');
      setAciklama(exam.aciklama || '');
    } else {
      setTarih('2025-02-03');
      setSaat(hours[0] || '10:00');
      setSeviye(9);
      setDers('');
      setSinavTuru(EXAM_TYPES[0]);
      setOgrenciSayisi(0);
      setSalon(rooms[0]?.name || 'Derslik 1');
      setUye1('');
      setUye2('');
      setUye3('');
      setGozcu('');
      setAciklama('');
    }
  }, [exam, isOpen, rooms, hours]);

  if (!isOpen) return null;

  // Conflict warning check for selected slot and teachers
  const conflictingTeachers = [];
  const selectedTeachers = [uye1, uye2, ...getExamObservers({ uye3, gozcu })].filter(Boolean);

  if (tarih && saat) {
    schedule.forEach((ex) => {
      if (exam && ex.id === exam.id) return; // ignore current
      if (ex.tarih === tarih && ex.saat === saat) {
        selectedTeachers.forEach((st) => {
          if ([ex.uye1, ex.uye2, ...getExamObservers(ex)].includes(st)) {
            conflictingTeachers.push(`${st} (${ex.ders} sınavında da görevli!)`);
          }
        });
      }
    });
  }

  // Room conflict check
  let roomConflict = null;
  if (tarih && saat && salon) {
    const conflict = schedule.find(
      (ex) => (!exam || ex.id !== exam.id) && ex.tarih === tarih && ex.saat === saat && ex.salon === salon
    );
    if (conflict) {
      roomConflict = `${salon} salonunda aynı saatte "${conflict.ders}" sınavı da planlanmış!`;
    }
  }

  const handleCourseChange = (selectedCourseName) => {
    setDers(selectedCourseName);
    const matched =
      courses.find(
        (c) =>
          c.name === selectedCourseName &&
          Number(c.seviye) === Number(seviye) &&
          normalizeExamType(c.sinavTuru) === sinavTuru
      ) ||
      courses.find((c) => c.name === selectedCourseName && Number(c.seviye) === Number(seviye));
    if (matched && matched.ogrenciSayisi) {
      setOgrenciSayisi(matched.ogrenciSayisi);
    }
    if (matched) setSinavTuru(normalizeExamType(matched.sinavTuru));
  };

  const handleExamTypeChange = (selectedType) => {
    setSinavTuru(selectedType);
    const matched = courses.find(
      (c) =>
        c.name === ders &&
        Number(c.seviye) === Number(seviye) &&
        normalizeExamType(c.sinavTuru) === selectedType
    );
    if (matched) setOgrenciSayisi(matched.ogrenciSayisi || 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ders.trim()) return;

    onSave({
      tarih,
      saat,
      seviye: Number(seviye),
      ders: ders.trim().toLocaleUpperCase('tr-TR'),
      sinavTuru,
      ogrenciSayisi: Number(ogrenciSayisi) || 0,
      salon,
      uye1,
      uye2,
      uye3,
      gozcu,
      aciklama
    });
    onClose();
  };

  const activeTeachers = teachers.filter((teacher) =>
    isAssignableTeacher(teacher, schoolInfo.okulMuduru)
  );

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            <h2 id="exam-modal-title" className="font-bold text-slate-900 dark:text-white text-base">
              {exam ? 'Sınav Oturumunu Düzenle' : 'Yeni Sınav Oturumu Planla'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
            aria-label="Pencereyi kapat"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>


        {/* Live Warnings */}
        {(conflictingTeachers.length > 0 || roomConflict) && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-semibold flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Oturum Çakışma Uyarısı!</span>
            </div>
            {conflictingTeachers.map((ct, idx) => (
              <p key={idx}>• {ct}</p>
            ))}
            {roomConflict && <p>• {roomConflict}</p>}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sınav Tarihi *
              </label>
              <input
                type="date"
                required
                value={tarih}
                onChange={(e) => setTarih(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sınav Türü
              </label>
              <select
                value={sinavTuru}
                onChange={(e) => handleExamTypeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                {EXAM_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sınav Saati *
              </label>
              <select
                value={saat}
                onChange={(e) => setSaat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sınıf Seviyesi
              </label>
              <select
                value={seviye}
                onChange={(e) => setSeviye(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                <option value={9}>9. Sınıf</option>
                <option value={10}>10. Sınıf</option>
                <option value={11}>11. Sınıf</option>
                <option value={12}>12. Sınıf</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ders Adı *
              </label>
              <input
                type="text"
                required
                list="courses-list"
                value={ders}
                onChange={(e) => handleCourseChange(e.target.value)}
                placeholder="Örn: TÜRK DİLİ VE EDEBİYATI"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase"
              />
              <datalist id="courses-list">
                {courses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.seviye}. Sınıf - {normalizeExamType(c.sinavTuru)} ({c.ogrenciSayisi} Öğrenci)
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Öğrenci Sayısı
              </label>
              <input
                type="number"
                min="0"
                value={ogrenciSayisi}
                onChange={(e) => setOgrenciSayisi(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sınav Salonu / Yeri
            </label>
            <select
              value={salon}
              onChange={(e) => setSalon(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name} {r.capacity ? `(Kapasite: ${r.capacity})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Commission Members Section */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Sınav Komisyon Üyeleri & Gözetmenler
              </span>
              <span className="text-[11px] text-slate-500">MEB Madde 58: En az 2 alan öğretmeni</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  1. Komisyon Üyesi (Alan Öğretmeni)
                </label>
                <select
                  value={uye1}
                  onChange={(e) => setUye1(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="">-- Öğretmen Seçin --</option>
                  {activeTeachers.map((t, idx) => (
                    <option key={`opt_u1_${t.id || t.name}_${idx}`} value={t.name}>
                      {t.name} ({t.branch})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  2. Komisyon Üyesi (Alan Öğretmeni)
                </label>
                <select
                  value={uye2}
                  onChange={(e) => setUye2(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="">-- Öğretmen Seçin --</option>
                  {activeTeachers.map((t, idx) => (
                    <option key={`opt_u2_${t.id || t.name}_${idx}`} value={t.name}>
                      {t.name} ({t.branch})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Gözcü (Gerektiğinde)
                </label>
                <select
                  value={uye3}
                  onChange={(e) => setUye3(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="">-- Boş (Yok) --</option>
                  {activeTeachers.map((t, idx) => (
                    <option key={`opt_u3_${t.id || t.name}_${idx}`} value={t.name}>
                      {t.name} ({t.branch})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Diğer Gözcü
                </label>
                <select
                  value={gozcu}
                  onChange={(e) => setGozcu(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="">-- Boş (Yok) --</option>
                  {activeTeachers.map((t, idx) => (
                    <option key={`opt_gz_${t.id || t.name}_${idx}`} value={t.name}>
                      {t.name} ({t.branch})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Özel Açıklama / Not
            </label>
            <input
              type="text"
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Örn: Uygulama sınavı atölyede yapılacaktır"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-md shadow-rose-600/20 transition-all"
            >
              {exam ? 'Oturumu Güncelle' : 'Oturumu Kaydet'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
