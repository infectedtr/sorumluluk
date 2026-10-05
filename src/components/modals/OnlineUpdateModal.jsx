import React from "react";
import { Download, Sparkles, X, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from "lucide-react";

export default function OnlineUpdateModal({ isOpen, onClose, updateInfo, isManualCheck = false }) {
  if (!isOpen || !updateInfo) return null;

  const { hasUpdate, currentVersion, latestVersion, releaseNotes, downloadUrl, error } = updateInfo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn no-print">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Üst Bar */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600/30 to-amber-500/20 text-rose-400 border border-rose-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Sürüm Güncelleme Masası</h3>
              <p className="text-[11px] text-slate-400">MEB Sorumluluk Sınavları Sistemi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gövde */}
        <div className="p-6 space-y-4">
          
          {/* Hata Durumu */}
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-white mb-0.5">Bağlantı Hatası</strong>
                <span>Güncelleme denetlenirken sunucuya ulaşılamadı: {error}</span>
              </div>
            </div>
          )}

          {/* Güncelleme Var */}
          {hasUpdate ? (
            <div className="space-y-4">
              
              {/* Sürüm Karşılaştırma Rozeti */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-purple-500/15 to-blue-500/10 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Mevcut Sürüm</span>
                  <p className="text-base font-extrabold text-slate-300">v{currentVersion}</p>
                </div>
                <span className="text-xl text-slate-500 font-bold">➡️</span>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Yeni Sürüm</span>
                  <p className="text-base font-extrabold text-emerald-400 animate-pulse">v{latestVersion}</p>
                </div>
              </div>

              {/* Yenilikler ve Notlar */}
              <div className="p-4 bg-slate-800/70 border border-slate-700/60 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span>📝</span> Bu Sürümdeki Yenilikler
                </h4>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto pr-1">
                  {releaseNotes || "Performans iyileştirmeleri, e-Okul şablon güncellemeleri ve mevzuat uyumluluğu eklendi."}
                </div>
              </div>

              {/* Bilgilendirme Notu */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Güncelleme kurulumu mevcut verilerinizi ve lisansınızı korur, hiçbir veri silinmez.</span>
              </div>

              {/* İndirme Butonu */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (downloadUrl) {
                      window.open(downloadUrl, "_blank");
                    } else {
                      alert("İndirme bağlantısı henüz tanımlanmamış. Lütfen yazılım sağlayıcınızla iletişime geçin.");
                    }
                  }}
                  className="w-full flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Yeni Sürümü İndir ve Güncelle
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Daha Sonra
                </button>
              </div>

            </div>
          ) : (
            /* Güncelleme Yok - Sistem Güncel */
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Sisteminiz Tamamen Güncel</h4>
                <p className="text-xs text-slate-400 mt-1">
                  En son kararlı sürümü (v{currentVersion}) kullanıyorsunuz. Şu an için yeni bir güncelleme bulunmuyor.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
              >
                Anladım
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
