import React, { useState, useEffect } from "react";
import {
  getHardwareFingerprint,
  validateLicense,
  saveLicense,
  loadLicense,
} from "./licenseEngine";
import {
  Shield, Key, CheckCircle2, XCircle, Loader2, Lock,
  Wifi, WifiOff, RefreshCw, Copy
} from "lucide-react";

export default function LicenseGate({ children }) {
  const [status, setStatus]   = useState("checking");
  const [inputKey, setInputKey] = useState("");
  const [hwId, setHwId]       = useState("");
  const [error, setError]     = useState("");
  const [info, setInfo]       = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [offline, setOffline] = useState(false);
  const [school, setSchool]   = useState("");

  useEffect(() => {
    async function check() {
      const fp = await getHardwareFingerprint();
      setHwId(fp);
      const saved = loadLicense();
      if (!saved) { setStatus("input"); return; }
      const result = await validateLicense(saved.key);
      if (result.valid) {
        setOffline(!!result.offline);
        setSchool(result.school || "");
        if (result.offline) setInfo(result.reason);
        setStatus("valid");
      } else {
        setStatus("input");
        setError(result.reason);
      }
    }
    check();
  }, []);

  async function handleActivate() {
    setError(""); setInfo("");
    if (!inputKey.trim()) { setError("Lisans anahtari bos birakilamaz."); return; }
    setLoading(true);
    const result = await validateLicense(inputKey.trim());
    setLoading(false);
    if (result.valid) {
      saveLicense(inputKey.trim());
      setOffline(!!result.offline);
      setSchool(result.school || "");
      if (result.offline) setInfo(result.reason);
      setStatus("valid");
    } else {
      setError(result.reason);
    }
  }

  function copyHwId() {
    navigator.clipboard.writeText(hwId).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  // ---- Gecerli lisans: uygulamayi goster ----
  if (status === "valid") {
    return (
      <>
        {children}
        {/* Cevrimdisi uyarisi */}
        {offline && (
          <div className="fixed top-16 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-amber-500/90 text-white text-xs font-semibold rounded-xl shadow-lg backdrop-blur no-print">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>{info}</span>
          </div>
        )}
      </>
    );
  }

  // ---- Yukleniyor ----
  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          <p className="text-sm">Lisans dogrulanıyor...</p>
        </div>
      </div>
    );
  }

  // ---- Lisans giris ekrani ----
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-600/20 border border-rose-500/30 mb-4">
            <Shield className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">MEB Sorumluluk Sinavlari</h1>
          <p className="text-sm text-slate-400">Yonetim Sistemi — Lisans Aktivasyonu</p>
        </div>

        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl space-y-5">
          {/* Bilgisayar ID */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Key className="w-3.5 h-3.5" /> Bilgisayar Kimlik Kodu
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono tracking-widest">
                {hwId || "hesaplaniyor..."}
              </code>
              <button
                onClick={copyHwId}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs text-slate-300 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Bu kodu satıcıya iletin — size lisans anahtarınız gönderilecektir.
            </p>
          </div>

          {/* Lisans Anahtari */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" /> Lisans Anahtari
            </label>
            <input
              type="text"
              value={inputKey}
              onChange={e => { setInputKey(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleActivate()}
              placeholder="MEBSS-XXXX-XXXX-XXXX-XXXX"
              spellCheck={false}
              className="w-full bg-slate-800 border border-slate-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder-slate-600 outline-none transition-all"
            />
            {error && (
              <div className="flex items-start gap-2 mt-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}
          </div>

          {/* Aktivasyon Butonu */}
          <button
            onClick={handleActivate}
            disabled={loading || !hwId}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/20"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Dogrulanıyor...</>
              : <><Wifi className="w-4 h-4" />Lisansı Etkinlestir</>
            }
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          Lisans, internet uzerinden dogrulanir.<br />
          Cevrimdisi kullanim icin 7 gunluk sure taninir.
        </p>
      </div>
    </div>
  );
}