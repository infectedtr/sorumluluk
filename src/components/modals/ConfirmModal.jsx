import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { animateModalOpen } from '../../utils/animeEffects';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Silme Onayı',
  message = 'Bu kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
  confirmText = 'Evet, Sil',
  confirmStyle = 'danger' // 'danger' | 'warning' | 'primary'
}) {
  const backdropRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      animateModalOpen(modalRef.current, backdropRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const buttonColors = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 focus-visible:ring-rose-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 focus-visible:ring-amber-500',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 focus-visible:ring-blue-500'
  };

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="font-bold text-slate-900 dark:text-white text-base">
                {title}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors"
              aria-label="İşlemi iptal et ve kapat"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-transform ${
                buttonColors[confirmStyle] || buttonColors.danger
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

