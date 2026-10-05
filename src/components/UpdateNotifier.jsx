import React, { useState, useEffect } from "react";
import { Download, RefreshCw, X, CheckCircle2, Loader2 } from "lucide-react";

export default function UpdateNotifier() {
  const [update, setUpdate] = useState(null); // null | checking | available | progress | downloaded | error
  const [version, setVersion] = useState("");
  const [percent, setPercent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!window.electronBridge?.onUpdateStatus) return;

    window.electronBridge.onUpdateStatus((data) => {
      setDismissed(false);
      if (data.type === "available") {
        setVersion(data.version || "");
        setUpdate("available");
      } else if (data.type === "progress") {
        setPercent(data.percent || 0);
        setUpdate("progress");
      } else if (data.type === "downloaded") {
        setUpdate("downloaded");
      } else {
        // "error", "not-available", "checking" gibi durumlarda ekranda bos kutu olusmasin
        setUpdate(null);
      }
    });

    return () => window.electronBridge?.offUpdateStatus?.();
  }, []);

  if (!update || dismissed || !["available", "progress", "downloaded"].includes(update)) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80 no-print">
      <div
        className="rounded-2xl border shadow-2xl backdrop-blur-xl p-4"
        style={{
          background: "linear-gradient(135deg, rgba(15,23,42,0.97), rgba(30,41,59,0.97))",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        {update === "available" && (
          <>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-white">Yeni Gurcelleme Mevcut</p>
                {version && <p className="text-xs text-slate-400 mt-0.5">Surum: v{version}</p>}
              </div>
              <button onClick={() => setDismissed(true)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => { window.electronBridge.downloadUpdate(); setUpdate("progress"); }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" /> Indir ve Guncelle
            </button>
          </>
        )}

        {update === "progress" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
              <p className="text-sm font-bold text-white">Indiriliyor... %{percent}</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {update === "downloaded" && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-sm font-bold text-white">Guncelleme Hazir</p>
            </div>
            <p className="text-xs text-slate-400 mb-3">Uygulamay yeniden baslatarak guncelleyin.</p>
            <button
              onClick={() => window.electronBridge.installUpdate()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Yeniden Baslat ve Guncelle
            </button>
          </>
        )}
      </div>
    </div>
  );
}