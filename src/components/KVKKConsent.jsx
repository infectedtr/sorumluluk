import React, { useState, useEffect } from "react";
import { ShieldCheck, FileText, ChevronDown, ChevronUp, Check, Printer, Lock, Info, ExternalLink } from "lucide-react";

export const KVKK_STORAGE_KEY = "mebss_kvkk_consent_v1";

export function hasKVKKConsent() {
  try {
    const raw = localStorage.getItem(KVKK_STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data.accepted === true;
  } catch {
    return false;
  }
}

export function getKVKKDetails() {
  try {
    const raw = localStorage.getItem(KVKK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveKVKKConsent() {
  const record = {
    accepted: true,
    acceptedAt: new Date().toISOString(),
    version: "1.0",
    lawRef: "6698 Sayılı KVKK (Madde 10, 11, 12)",
    deviceHost: window.location.hostname || "localhost",
  };
  localStorage.setItem(KVKK_STORAGE_KEY, JSON.stringify(record));
  return record;
}

export default function KVKKConsent({ onAccept, onViewGuide }) {
  const [open, setOpen] = useState(false);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);

  useEffect(() => {
    if (hasKVKKConsent() && onAccept) {
      onAccept();
    }
  }, [onAccept]);

  function handleAccept() {
    if (!check1 || !check2) return;
    saveKVKKConsent();
    if (onAccept) onAccept();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      <div className="w-full max-w-2xl">
        
        {/* Başlık Alanı */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-rose-600/20 border border-blue-500/40 mb-4 shadow-xl shadow-blue-500/10 animate-pulse">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1.5">
            Kişisel Verilerin Korunması ve Güvenliği
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            6698 Sayılı KVKK ve MEB Bilgi Güvenliği Yönergesi Kapsamında Yasal Aydınlatma & Onay Metni
          </p>
        </div>

        {/* Ana Kart */}
        <div className="bg-slate-900/90 border border-slate-700/70 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          
          {/* Özet Güvence Rozetleri */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/40">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Sistem Güvenlik ve Gizlilik Prensipleri
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: "🏛️",
                  title: "Veri Sorumlusu Kurum",
                  desc: "Okul Müdürlüğünüz (Yetkili İdare)",
                  badge: "Yasal Zorunluluk",
                },
                {
                  icon: "💻",
                  title: "Sıfır Bulut Verisi",
                  desc: "Tüm kayıtlar yalnızca bu bilgisayarda saklanır",
                  badge: "100% Yerel Depolama",
                },
                {
                  icon: "🛡️",
                  title: "3. Taraf Paylaşım Yok",
                  desc: "Öğrenci T.C. ve notları asla internete sızdırılmaz",
                  badge: "Tam İzolasyon",
                },
                {
                  icon: "📋",
                  title: "Mevzuata Uygunluk",
                  desc: "MEB Ortaöğretim Kurumları Yönetmeliği Madde 58",
                  badge: "Resmi Format",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 p-3.5 bg-slate-800/60 border border-slate-700/50 rounded-2xl transition-all hover:border-slate-600"
                >
                  <span className="text-xl leading-none mt-0.5">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-slate-200 truncate">{item.title}</p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-700/70 text-slate-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tam Metin Açılır Panel */}
          <div className="border-b border-slate-800">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-blue-400" />
                Resmi Aydınlatma Metni & Hukuki Şartları Görüntüle
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                {open ? "Daralt" : "Genişlet"}
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {open && (
              <div className="px-6 pb-6 max-h-72 overflow-y-auto text-xs text-slate-300/90 leading-relaxed space-y-4 border-t border-slate-800/80 pt-4 bg-slate-950/60">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">1. Veri Sorumlusunun Kimliği ve Kapsam</h3>
                  <p>
                    6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, MEB Sorumluluk Sınavları Sistemi yazılımına aktarılan öğrenci ve öğretmen verileri açısından veri sorumlusu, yazılımı kullanan <strong>Okul Müdürlüğü</strong>'dür. Yazılım geliştiricisi veya dağıtıcısı, program içerisine işlenen kişisel verilere (öğrenci T.C. kimlik numaraları, ad-soyad, sınıf, numara, sınav notları, öğretmen iletişim bilgileri vb.) hiçbir şekilde erişemez, bunları uzaktan izleyemez veya kopyalayamaz.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1">2. İşlenen Kişisel Veri Kategorileri ve Amaçlar</h3>
                  <p>
                    Uygulamaya e-Okul veya MEBBİS üzerinden aktarılan veriler; yalnızca MEB Ortaöğretim Kurumları Yönetmeliği'nin 58. maddesi uyarınca sorumluluk sınavı takvimini oluşturmak, sınav komisyon ve gözetmenlerini adil biçimde atamak, sınav giriş belgeleri ve tutanakları tanzim etmek amacıyla işlenir.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1">3. Verilerin Saklandığı Ortam ve Güvenlik Tedbirleri</h3>
                  <p>
                    KVKK'nın 12. maddesinde öngörülen teknik ve idari tedbirler kapsamında:
                    Yazılım <strong>tamamen çevrimdışı (offline) ve yerel mimaride</strong> çalışır. Sisteme girilen veriler hiçbir harici bulut sunucusuna veya üçüncü şahıs analitik aracına iletilmez. Tüm kayıtlar kullanıcının kendi bilgisayarının yerel depolama alanında şifreli olarak barındırılır.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1">4. Veri Aktarımı ve Paylaşım Kısıtları</h3>
                  <p>
                    İşlenen kişisel veriler ticari, pazarlama veya herhangi bir üçüncü taraf faaliyeti amacıyla kullanılamaz, yurt içine ya da yurt dışına aktarılmaz. Belgeler sadece okul idaresinin kendi yazıcısından resmi evrak olarak basılmak üzere oluşturulur.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1">5. İlgili Kişilerin Hakları (KVKK Madde 11)</h3>
                  <p>
                    Verisi işlenen öğretmen ve öğrenciler, okul idaresine başvurarak verilerinin silinmesini veya düzeltilmesini talep edebilirler. Okul idarecisi, program içerisindeki "Öğrenci Düzenle", "Öğretmen Düzenle" veya "Yedekleme & Sıfırlama" menülerini kullanarak verileri dilediği an silebilir veya güncelleyebilir.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>Hukuki Dayanak: 6698 Sayılı KVKK Madde 5/2-ç ve 5/2-e</span>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Metni Yazdır
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Onaylama Kutuları ve Buton */}
          <div className="p-6 space-y-4 bg-slate-900/50">
            
            {/* Onay 1 */}
            <label className="flex items-start gap-3.5 cursor-pointer group select-none">
              <div
                onClick={() => setCheck1(!check1)}
                className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border-2 shrink-0 transition-all duration-200 ${
                  check1
                    ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-500/30"
                    : "border-slate-600 group-hover:border-blue-400 bg-slate-800/80"
                }`}
              >
                {check1 && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-white">
                  6698 Sayılı KVKK Aydınlatma Metnini okudum ve anladım.
                </span>{" "}
                Okul veri sorumlusu olarak kurumumuz bünyesindeki işlemlerin yasal mevzuata uygun yürütüleceğini beyan ederim.
              </div>
            </label>

            {/* Onay 2 */}
            <label className="flex items-start gap-3.5 cursor-pointer group select-none">
              <div
                onClick={() => setCheck2(!check2)}
                className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border-2 shrink-0 transition-all duration-200 ${
                  check2
                    ? "bg-emerald-600 border-emerald-600 shadow-md shadow-emerald-500/30"
                    : "border-slate-600 group-hover:border-emerald-400 bg-slate-800/80"
                }`}
              >
                {check2 && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-white">
                  Yerel Veri Saklama ve Güvenlik Koşullarını onaylıyorum.
                </span>{" "}
                Öğrenci ve öğretmen bilgilerinin yalnızca bu cihazda yerel olarak saklanacağını ve üçüncü taraflarla paylaşılmayacağını onaylıyorum.
              </div>
            </label>

            {/* Butonlar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleAccept}
                disabled={!check1 || !check2}
                className="w-full flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl transition-all duration-200 shadow-xl shadow-blue-600/20 active:scale-95 border border-blue-400/20"
              >
                <ShieldCheck className="w-4 h-4" />
                Şartları Kabul Ediyorum ve Başlat
              </button>

              {onViewGuide && (
                <button
                  type="button"
                  onClick={onViewGuide}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
                >
                  <Info className="w-4 h-4 text-sky-400" />
                  Kullanım Kılavuzunu Gör
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Alt Bilgi */}
        <p className="text-center text-[11px] text-slate-500 mt-4 leading-relaxed">
          Bu onay kaydı zaman damgasıyla yerel belleğe kaydedilir. Program içerisinde dilediğiniz an Ayarlar menüsünden tekrar erişebilirsiniz.
        </p>

      </div>
    </div>
  );
}
