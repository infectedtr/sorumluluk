import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  CalendarDays,
  Users,
  Printer,
  ShieldCheck,
  BookOpen,
  X,
  Compass
} from 'lucide-react';

export const ONBOARDING_STORAGE_KEY = 'mebss_onboarding_completed_v1';

export function hasCompletedOnboarding() {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(completed = true) {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, completed ? 'true' : 'false');
  } catch (_) {}
}

export default function OnboardingWizard({ isOpen, onClose, onOpenGuide, onNavigateTab }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  const steps = [
    {
      id: 'welcome',
      badge: 'Başlangıç',
      title: 'MEB Sorumluluk Sınavları Sistemine Hoş Geldiniz!',
      desc: 'Ortaöğretim kurumları sorumluluk sınavlarını mevzuata uygun, adil ve saniyeler içinde planlamanız için hazırlandı.',
      icon: Sparkles,
      iconColor: 'text-amber-400',
      gradient: 'from-rose-500/20 via-orange-500/20 to-amber-500/10',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Bu hızlı rehber, programı en verimli şekilde kullanarak sınav programınızı ve resmi MEB evraklarınızı 
            <strong> 4 basit adımda</strong> nasıl tamamlayacağınızı gösterecektir.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-1">
                <ShieldCheck className="w-4 h-4" /> %100 Çevrimdışı Güvenlik
              </div>
              <p className="text-[11px] text-slate-400">Öğrenci T.C. ve verileri asla buluta gitmez, cihazınızda kalır.</p>
            </div>
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                <CheckCircle2 className="w-4 h-4" /> Sıfır Çakışma Garantisi
              </div>
              <p className="text-[11px] text-slate-400">Aynı öğrenci veya öğretmene aynı saatte iki görev verilmez.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'import',
      badge: '1. Adım',
      title: 'e-Okul & MEBBİS Excel Listelerini Yükleyin',
      desc: 'Tek tek elle öğrenci ve öğretmen girmekle vakit kaybetmeyin.',
      icon: FileSpreadsheet,
      iconColor: 'text-emerald-400',
      gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/10',
      content: (
        <div className="space-y-3">
          <div className="p-3.5 bg-slate-800/70 border border-slate-700/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>1. Öğrenci Sorumluluk Listesi</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">e-Okul Raporu</span>
            </div>
            <p className="text-xs text-slate-400">
              e-Okul ➡️ Öğrenci İşlemleri ➡️ Raporlar bölümünden aldığınız Excel dosyasını sol menüdeki 
              <strong className="text-slate-200"> "Öğrenci Sorumluluk Listesi"</strong> sekmesine yükleyin.
            </p>
          </div>
          <div className="p-3.5 bg-slate-800/70 border border-slate-700/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>2. Öğretmen Kadro Listesi</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">MEBBİS / e-Okul</span>
            </div>
            <p className="text-xs text-slate-400">
              Öğretmen listesini sol menüdeki <strong className="text-slate-200">"Öğretmenler & Komisyon"</strong> sekmesine aktarın. Branşlar otomatik ayrıştırılır.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'schedule',
      badge: '2. Adım',
      title: 'Tarih Aralığı ve Oturum Saatlerini Belirleyin',
      desc: 'Sınavların hangi günlerde ve saat kaçta yapılacağını ayarlayın.',
      icon: CalendarDays,
      iconColor: 'text-sky-400',
      gradient: 'from-sky-500/20 via-blue-500/20 to-indigo-500/10',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Sol menüdeki <strong className="text-white">"Sınav Programı & Takvim"</strong> sekmesine giderek:
          </p>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-sky-400 font-bold">•</span>
              <span><strong>Sınav Tarihleri:</strong> Sınav dönemi başlangıç ve bitiş tarihlerini seçin (örneğin 1 hafta).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400 font-bold">•</span>
              <span><strong>Günlük Oturum Saatleri:</strong> Günlük 09:00, 11:00, 14:00, 16:00 gibi sınav oturum saatlerini tanımlayın.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400 font-bold">•</span>
              <span><strong>Salon ve Kapasite:</strong> Sınav salonu kapasitesini (örn: 25 öğrenci) belirleyin. Sistem gerekirse otomatik salonlara böler.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'auto-assign',
      badge: '3. Adım',
      title: 'Akıllı Komisyon & Gözetmen Dağıtımını Çalıştırın',
      desc: 'Yapay zeka kural motoru tüm sınav görevlerini adil ve dengeli paylaştırır.',
      icon: Users,
      iconColor: 'text-violet-400',
      gradient: 'from-violet-500/20 via-purple-500/20 to-fuchsia-500/10',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Üst menü çubuğunda bulunan mor <strong className="text-violet-400">"Otomatik Dağıt"</strong> butonuna tek tıkla basın. Algoritma şu kuralları otomatik uygular:
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1">
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/60 rounded-xl text-xs text-slate-300">
              <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center font-bold text-[10px]">1</span>
              <span>Dersin komisyonuna öncelikle o dersin branş öğretmenleri atanır.</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/60 rounded-xl text-xs text-slate-300">
              <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center font-bold text-[10px]">2</span>
              <span>Öğretmenlerin toplam görev sayıları eşitlenir (kul hakkı ve adalet korunur).</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/60 rounded-xl text-xs text-slate-300">
              <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center font-bold text-[10px]">3</span>
              <span>İstenen sınavda manuel değişiklik yapmak için <strong>"Komisyon Manuel Düzenle"</strong> sekmesini kullanabilirsiniz.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      badge: '4. Adım',
      title: 'Resmi MEB Evraklarını ve Raporları Alın',
      desc: 'Bakanlık formatında 9 farklı resmi evrak yazdırmaya hazır.',
      icon: Printer,
      iconColor: 'text-rose-400',
      gradient: 'from-rose-500/20 via-red-500/20 to-orange-500/10',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Sol menüdeki <strong className="text-rose-400">"MEB Resmi Raporları"</strong> sekmesine giderek dilediğiniz belgeyi tek tıkla PDF olarak kaydedin veya yazdırın:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
            <div className="p-2 bg-slate-800/60 rounded-lg">📜 İlçe MEM Resmi Olur Yazısı</div>
            <div className="p-2 bg-slate-800/60 rounded-lg">📅 Sınav İlan Takvimi (Pano)</div>
            <div className="p-2 bg-slate-800/60 rounded-lg">🎫 Öğrenci Sınav Giriş Belgeleri</div>
            <div className="p-2 bg-slate-800/60 rounded-lg">📝 Sınav Yoklama ve İmza Listesi</div>
            <div className="p-2 bg-slate-800/60 rounded-lg">📑 Soru ve Cevap Kağıdı Şablonu</div>
            <div className="p-2 bg-slate-800/60 rounded-lg">📊 Sınav Tutanağı & Not Çizelgesi</div>
          </div>
        </div>
      )
    }
  ];

  const current = steps[currentStep];

  function handleComplete() {
    if (dontShowAgain) {
      setOnboardingCompleted(true);
    }
    if (onClose) onClose();
  }

  function handleOpenGuide() {
    handleComplete();
    if (onOpenGuide) onOpenGuide();
  }

  function handleJumpToSection(tabId) {
    handleComplete();
    if (onNavigateTab) onNavigateTab(tabId);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Üst Bar & Adım İlerlemesi */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400">
              <Compass className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Hızlı Başlangıç Rehberi</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {steps.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'w-6 bg-rose-500'
                      : idx < currentStep
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-700'
                  }`}
                  title={`${idx + 1}. Adım: ${s.title}`}
                />
              ))}
            </div>
            
            <button
              onClick={handleComplete}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gövde */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Adım Başlığı ve İkon */}
          <div className={`p-4 rounded-2xl bg-gradient-to-r ${current.gradient} border border-slate-700/50 flex items-start gap-4`}>
            <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-lg">
              <current.icon className={`w-6 h-6 ${current.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-slate-800 text-slate-300 mb-1">
                {current.badge}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight leading-snug">{current.title}</h3>
              <p className="text-xs text-slate-300/80 mt-0.5">{current.desc}</p>
            </div>
          </div>

          {/* Adım İçeriği */}
          <div className="pt-1">
            {current.content}
          </div>
        </div>

        {/* Alt Çubuk (Aksiyon Butonları) */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Bir daha gösterme kutusu */}
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none self-start sm:self-center">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-rose-600 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Bir daha otomatik açma</span>
          </label>

          {/* İleri / Geri / Bitir butonları */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Geri
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                Sonraki Adım <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenGuide}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-sky-300 hover:text-white hover:bg-sky-950/60 border border-sky-500/30 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Kılavuzu İncele
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hemen Başla
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
