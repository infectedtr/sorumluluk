import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { parseEOkulExcel, parsePastedStudentText } from '../../utils/excelParser';
import { X, UploadCloud, FileSpreadsheet, Clipboard, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { animateModalOpen } from '../../utils/animeEffects';

export default function ImportExcelModal({ isOpen, onClose }) {
  const { bulkAddStudents, clearAllStudents, syncCoursesFromStudents } = useApp();

  const [activeMode, setActiveMode] = useState('file'); // 'file' | 'paste'
  const [pasteText, setPasteText] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);
  const [fileName, setFileName] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const backdropRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      animateModalOpen(modalRef.current, backdropRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setErrorMsg('');

    const res = await parseEOkulExcel(file);
    setIsProcessing(false);

    if (res.success && res.students.length > 0) {
      setParsedPreview(res.students);
      setSheetName(res.sheetName || '');
    } else {
      setErrorMsg(res.error || 'Dosyadan öğrenci kaydı okunamadı. Lütfen sütunları kontrol edin.');
    }
  };

  const handleParseText = () => {
    setErrorMsg('');
    const list = parsePastedStudentText(pasteText);
    if (list.length > 0) {
      setParsedPreview(list);
    } else {
      setErrorMsg('Yapıştırılan metinden uygun öğrenci satırları ayrıştırılamadı.');
    }
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;

    if (replaceExisting) {
      clearAllStudents();
    }

    setTimeout(() => {
      bulkAddStudents(parsedPreview);
      if (autoSync) {
        setTimeout(() => {
          syncCoursesFromStudents();
        }, 150);
      }
    }, 50);

    onClose();
    setParsedPreview([]);
    setPasteText('');
    setFileName('');
    setSheetName('');
  };

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-excel-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <h2 id="import-excel-modal-title" className="font-bold text-slate-900 dark:text-white text-base">
              e-Okul Sorumluluk Listesi İçe Aktarma (Makro2 Algoritmalı)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            aria-label="Pencereyi kapat"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>


        {/* Tab selection */}
        <div className="px-6 pt-4 flex space-x-2 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveMode('file')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 text-sm font-semibold transition-all ${
              activeMode === 'file'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Excel Dosyası (.xlsm, .xlsx, .xls)</span>
          </button>
          <button
            onClick={() => setActiveMode('paste')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 text-sm font-semibold transition-all ${
              activeMode === 'paste'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            <span>Kopyala - Yapıştır</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center space-x-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeMode === 'file' ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-8 text-center transition-all bg-slate-50/50 dark:bg-slate-800/30">
              <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                e-Okul Excel dosyasını (.xlsm, .xlsx, .xls) seçin
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                "e-okul sorumluluk listesi öğenci.xlsm" veya doğrudan e-Okul HTML5 / OOK12001R010 raporu dosyasını yükleyebilirsiniz. Öğrenci numaraları, adları ve dersleri otomatik eşleştirilir.
              </p>
              <label className="inline-block mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 transition-all">
                {isProcessing ? 'İşleniyor...' : 'Dosya Seç'}
                <input
                  type="file"
                  accept=".xlsm, .xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {fileName && (
                <div className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ {fileName} {sheetName ? `(${sheetName} Sayfası)` : ''}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                e-Okul Tablosundan veya Excel'den Kopyalanan Satırları Yapıştırın:
              </label>
              <textarea
                rows={6}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Örnek:&#10;10-A	50	ÖRNEK ÖĞRENCİ	COĞRAFYA	9&#10;10-A	50	ÖRNEK ÖĞRENCİ	MATEMATİK	9"
                className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={handleParseText}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Metni Çözümle ve Önizle
              </button>
            </div>
          )}

          {/* Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Toplam {parsedPreview.length} Öğrenci Sorumluluk Kaydı Başarıyla Okundu</span>
                </span>
                <span className="text-[11px] text-slate-500">İlk 5 Kayıt Gösteriliyor</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-2">Sınıf</th>
                      <th className="p-2">No</th>
                      <th className="p-2">Ad Soyad</th>
                      <th className="p-2">Ders</th>
                      <th className="p-2">Seviye</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedPreview.slice(0, 5).map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2 font-medium">{p.sinif}</td>
                        <td className="p-2 font-bold">{p.no}</td>
                        <td className="p-2 font-semibold">{p.adSoyad}</td>
                        <td className="p-2 text-rose-600 dark:text-rose-400 font-bold">{p.ders}</td>
                        <td className="p-2">{p.seviye}. Sınıf</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Options */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="replace-checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <label
                    htmlFor="replace-checkbox"
                    className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <strong>Mevcut öğrenci listesini temizle</strong> ve bu yeni {parsedPreview.length} kaydı yükle (Önerilen)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-sync-checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <label
                    htmlFor="auto-sync-checkbox"
                    className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Aktarımla birlikte <strong>Dersler ve Sınav Programı oturumlarını</strong> otomatik senkronize et
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Kapat
            </button>
            <button
              type="button"
              disabled={parsedPreview.length === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{parsedPreview.length} Kaydı Sisteme Aktar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
