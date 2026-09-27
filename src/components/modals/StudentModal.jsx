import React, { useState, useEffect } from 'react';
import { X, GraduationCap } from 'lucide-react';
import { EXAM_TYPES, normalizeExamType } from '../../utils/examTypes';

export default function StudentModal({ isOpen, onClose, onSave, student }) {
  const [sinif, setSinif] = useState('');
  const [no, setNo] = useState('');
  const [adSoyad, setAdSoyad] = useState('');
  const [ders, setDers] = useState('');
  const [seviye, setSeviye] = useState(9);
  const [sinavTuru, setSinavTuru] = useState(EXAM_TYPES[0]);

  useEffect(() => {
    if (student) {
      setSinif(student.sinif || '');
      setNo(student.no || '');
      setAdSoyad(student.adSoyad || '');
      setDers(student.ders || '');
      setSeviye(Number(student.seviye) || 9);
      setSinavTuru(normalizeExamType(student.sinavTuru));
    } else {
      setSinif('10/A');
      setNo('');
      setAdSoyad('');
      setDers('');
      setSeviye(9);
      setSinavTuru(EXAM_TYPES[0]);
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!adSoyad.trim() || !ders.trim()) return;

    onSave({
      sinif: sinif.trim().toLocaleUpperCase('tr-TR'),
      no: no.trim(),
      adSoyad: adSoyad.trim().toLocaleUpperCase('tr-TR'),
      ders: ders.trim().toLocaleUpperCase('tr-TR'),
      seviye: Number(seviye),
      sinavTuru
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {student ? 'Öğrenci Sorumluluk Kaydını Düzenle' : 'Yeni Öğrenci Sorumluluk Kaydı'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sınıf / Şube *
              </label>
              <input
                type="text"
                required
                value={sinif}
                onChange={(e) => setSinif(e.target.value)}
                placeholder="Örn: AMP-10A"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Okul No *
              </label>
              <input
                type="text"
                required
                value={no}
                onChange={(e) => setNo(e.target.value)}
                placeholder="Örn: 50"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Öğrenci Adı Soyadı *
            </label>
            <input
              type="text"
              required
              value={adSoyad}
              onChange={(e) => setAdSoyad(e.target.value)}
              placeholder="Örn: AHMET DEMİR"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sorumlu Olunan Ders *
              </label>
              <input
                type="text"
                required
                value={ders}
                onChange={(e) => setDers(e.target.value)}
                placeholder="Örn: MATEMATİK"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dersin Seviyesi (Sınıfı)
              </label>
              <select
                value={seviye}
                onChange={(e) => setSeviye(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value={9}>9. Sınıf Dersi</option>
                <option value={10}>10. Sınıf Dersi</option>
                <option value={11}>11. Sınıf Dersi</option>
                <option value={12}>12. Sınıf Dersi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sınav Türü
            </label>
            <select
              value={sinavTuru}
              onChange={(e) => setSinavTuru(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              {EXAM_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
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
              {student ? 'Değişiklikleri Kaydet' : 'Öğrenciyi Kaydet'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
