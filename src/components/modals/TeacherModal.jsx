import React, { useState, useEffect, useRef } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';
import { animateModalOpen } from '../../utils/animeEffects';

export default function TeacherModal({ isOpen, onClose, onSave, teacher }) {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');

  const backdropRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      animateModalOpen(modalRef.current, backdropRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (teacher) {
      setName(teacher.name || '');
      setBranch(teacher.branch || '');
      setActive(teacher.active !== undefined ? teacher.active : true);
      setNotes(teacher.notes || '');
    } else {
      setName('');
      setBranch('');
      setActive(true);
      setNotes('');
    }
  }, [teacher, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim().toLocaleUpperCase('tr-TR'),
      branch: branch.trim(),
      active,
      notes: notes.trim()
    });
    onClose();
  };

  const commonBranches = [
    'Beden Eğitimi',
    'Bilişim Teknolojileri',
    'Biyoloji',
    'Coğrafya',
    'Çocuk Gelişimi ve Eğitimi',
    'Din Kültürü ve Ahlâk Bilgisi',
    'El Sanatları Teknolojisi / Nakış',
    'Felsefe',
    'Fizik',
    'Gıda Teknolojisi',
    'Görsel Sanatlar',
    'Grafik ve Fotoğraf',
    'Güzellik Hizmetleri',
    'İngilizce',
    'Kimya',
    'Matematik',
    'Moda Tasarım Teknolojileri',
    'Müzik',
    'Rehberlik',
    'Tarih',
    'Türk Dili ve Edebiyatı',
    'Yiyecek İçecek Hizmetleri'
  ];

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            <h2 id="teacher-modal-title" className="font-bold text-slate-900 dark:text-white text-base">
              {teacher ? 'Öğretmen Bilgilerini Düzenle' : 'Yeni Öğretmen Ekle'}
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


        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Ad Soyad *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: AHMET YILMAZ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Branş
            </label>
            <input
              type="text"
              list="branches-list"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Örn: Türk Dili ve Edebiyatı"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            <datalist id="branches-list">
              {commonBranches.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="active-checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 dark:border-slate-700"
            />
            <label
              htmlFor="active-checkbox"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Komisyon Görevlendirmelerine Dahil Et (Aktif)
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Notlar / Açıklama
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Varsa özel durum veya sınav kısıtlaması..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
              {teacher ? 'Değişiklikleri Kaydet' : 'Öğretmeni Ekle'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
