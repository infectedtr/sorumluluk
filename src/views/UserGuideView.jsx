import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Search,
  Printer,
  Compass,
  FileSpreadsheet,
  CalendarDays,
  Users,
  ShieldCheck,
  Database,
  HelpCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Scale
} from 'lucide-react';

export default function UserGuideView({ onRelaunchTour }) {
  const { setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('quickstart');

  const guideSections = [
    {
      id: 'quickstart',
      title: 'Hızlı Başlangıç & 4 Adımlı İş Akışı',
      icon: Sparkles,
      color: 'text-amber-500',
      badge: 'Temel Rehber',
      content: (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
            <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Sorumluluk Sınav Dönemi Nasıl Tamamlanır?
            </h4>
            <p className="text-xs leading-relaxed opacity-90">
              MEB Ortaöğretim Kurumları Yönetmeliği Madde 58 uyarınca okullarda yapılan sorumluluk sınavları süreci programımızda 4 temel aşamada hatasız şekilde sonuçlandırılır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold text-xs">1</span>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">Veri Yükleme (e-Okul)</h5>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                e-Okul'dan aldığınız Öğrenci Sorumluluk Listesi ve Öğretmen Kadro Listesi Excel dosyalarını sisteme sürükleyip bırakın.
              </p>
              <button
                onClick={() => setActiveTab('students')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1"
              >
                Öğrenci Listesine Git <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-emerald-600/20 text-emerald-500 flex items-center justify-center font-bold text-xs">2</span>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">Takvim & Saatler</h5>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Sınavların yapılacağı tarih aralığını ve günlük oturum saatlerini (örn. 09:00, 11:00, 14:00, 16:00) ayarlayın.
              </p>
              <button
                onClick={() => setActiveTab('schedule')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
              >
                Takvim Planlamaya Git <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-violet-600/20 text-violet-500 flex items-center justify-center font-bold text-xs">3</span>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">Otomatik Komisyon Dağıtımı</h5>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Üst menüdeki "Otomatik Dağıt" butonuna basın. Algoritma branş önceliği ve görev adaletini gözeterek komisyonları atar.
              </p>
              <button
                onClick={() => setActiveTab('commission')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline pt-1"
              >
                Komisyon Yönetimine Git <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center font-bold text-xs">4</span>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">Resmi Evrakları Yazdırın</h5>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                İlçe MEM Olur Yazısı, Sınav Giriş Belgeleri, Tutanaklar ve Soru/Cevap Kağıtlarını tek tıkla resmi formatta PDF/Yazıcı çıktısı alın.
              </p>
              <button
                onClick={() => setActiveTab('reports')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline pt-1"
              >
                Rapor Merkezine Git <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'import',
      title: 'e-Okul & MEBBİS Veri Yükleme Kılavuzu',
      icon: FileSpreadsheet,
      color: 'text-emerald-500',
      badge: 'Veri Aktarımı',
      content: (
        <div className="space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> e-Okul Excel Dosyası Nasıl İndirilir?
            </h4>
            <ol className="list-decimal list-inside space-y-1 mt-2 text-slate-600 dark:text-slate-300">
              <li>MEB e-Okul sistemine kurum şifrenizle giriş yapın.</li>
              <li><strong>Ortaöğretim Öğrenci İşlemleri ➡️ Raporlar</strong> menüsüne tıklayın.</li>
              <li>Rapor listesinden <strong>"Sorumluluk Sınavı Öğrenci Listesi"</strong> raporunu seçin ve açın.</li>
              <li>Açılan rapor ekranının sol üst köşesindeki <strong>Disket (Kaydet)</strong> simgesine tıklayın ve format olarak <strong>Excel (.xls veya .xlsx)</strong> seçeneğini işaretleyip indirin.</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-sm text-slate-900 dark:text-white">Programımıza Yükleme Adımları:</h5>
            <p>
              1. Sol menüdeki <strong>"Öğrenci Sorumluluk Listesi"</strong> sekmesini açın.<br />
              2. İndirdiğiniz e-Okul Excel dosyasını ekrandaki yükleme alanına sürükleyin veya "Dosya Seç" ile yükleyin.<br />
              3. Program otomatik olarak öğrencinin T.C. kimlik numarasını, okul numarasını, adını, soyadını, sınıfını ve sorumlu olduğu dersleri ayıklar.
            </p>
          </div>

          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <strong className="text-blue-900 dark:text-blue-200">Öğretmen Kadro Listesi Yükleme:</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                Aynı şekilde MEBBİS veya e-Okul'dan indirdiğiniz öğretmen listesini <strong>"Öğretmenler & Komisyon"</strong> sekmesine yükleyerek kadronuzu ve branşları anında içeri aktarabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'schedule',
      title: 'Sınav Takvimi & Salon Dağıtımı Planlama',
      icon: CalendarDays,
      color: 'text-sky-500',
      badge: 'Planlama',
      content: (
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            <strong>"Sınav Programı & Takvim"</strong> sekmesi, sınavların gün ve saatlere göre dağıtıldığı ve olası öğrenci/öğretmen çakışmalarının anlık olarak kontrol edildiği alandır.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <strong className="block text-slate-900 dark:text-white mb-1">Tarih Aralığı</strong>
              <span>Sınav dönemi için başlangıç ve bitiş tarihlerini belirleyin. Hafta sonu günlerini isteğe göre açıp kapatabilirsiniz.</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <strong className="block text-slate-900 dark:text-white mb-1">Oturum Saatleri</strong>
              <span>Günde kaç oturum yapılacağını ve saatlerini tanımlayın (Örn: 09:00, 11:00, 14:00, 16:00).</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <strong className="block text-slate-900 dark:text-white mb-1">Salon Kapasitesi</strong>
              <span>Bir salona atanacak maksimum öğrenci sayısını (örn. 25) ayarlayın. Öğrenci sayısı fazla olan dersler otomatik salonlara ayrılır.</span>
            </div>
          </div>

          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <strong className="text-rose-900 dark:text-rose-200">Otomatik Çakışma Kontrolü:</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                Eğer bir öğrenci aynı saatte yapılan iki farklı dersten sorumluysa (örn: 9. Sınıf Matematik ve 10. Sınıf Tarih aynı saatte ise), program takvim üzerinde kırmızı uyarı rozeti gösterir ve sınavı başka bir saate taşımanızı önerir.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'assignment',
      title: 'Akıllı Komisyon & Adil Görev Dağıtımı',
      icon: Users,
      color: 'text-violet-500',
      badge: 'Yapay Zeka Dağıtım',
      content: (
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Sistemdeki yapay zeka algoritması, okul idarecilerinin saatlerce uğraştığı komisyon görevlendirme tablosunu saniyeler içinde oluşturur.
          </p>

          <div className="space-y-2">
            <h5 className="font-bold text-sm text-slate-900 dark:text-white">Dağıtım Motorunun Temel Kuralları:</h5>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Branş Önceliği:</strong> Sınav komisyonuna öncelikle o dersin branş öğretmenleri atanır (Örn: Matematik sınavına Matematik öğretmenleri).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Görev Sayısı Eşitliği:</strong> Tüm öğretmenlerin toplam komisyon ve gözetmenlik görev sayıları dengelenir; hiçbir öğretmene haksız fazla görev yüklenmez.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Zaman Çakışma Engeli:</strong> Bir öğretmene aynı saat diliminde iki farklı sınav görevi verilmesi kesin olarak engellenir.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Manuel Müdahale:</strong> Raporlu, izinli veya mazeretli öğretmenleri <em>"Komisyon Manuel Düzenle"</em> ekranından tek tıkla değiştirebilirsiniz.</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'Resmi MEB Evrakları ve Rapor Baskı Merkezi',
      icon: FileText,
      color: 'text-rose-500',
      badge: 'Resmi Çıktılar',
      content: (
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Programımız, MEB mevzuatına ve resmi yazışma kurallarına tam uyumlu <strong>9 farklı resmi evrak</strong> üretir:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'İlçe MEM Olur Yazısı', desc: 'Sınav komisyon onay üst yazısı ve kaymakamlık/MEM onay blokları.' },
              { title: 'Sınav İlan Takvimi', desc: 'Öğrenci ve veli duyuru panolarına asılacak resmi onaylı takvim.' },
              { title: 'Sınav Giriş Belgeleri', desc: 'Öğrencilere dağıtılacak fotoğraflı/bilgili bireysel giriş kartları.' },
              { title: 'Yoklama & İmza Sirküsü', desc: 'Sınav salonunda öğrencilerin imzalayacağı resmi liste.' },
              { title: 'Soru & Cevap Kağıtları', desc: 'MEB standart antetli ve puanlama tablolu sınav kağıtları.' },
              { title: 'Sınav Tutanakları', desc: 'Komisyon üyelerinin sınav notlarını işleyip imzalayacağı tutanak.' },
              { title: 'Görev Tebliğ Çizelgesi', desc: 'Öğretmenlere görevlerin tebliğ edildiğine dair imza tutanağı.' },
              { title: 'Öğretmen Bazlı Program', desc: 'Her öğretmenin kendi sınav gün ve saatlerini gösteren kişisel liste.' },
              { title: 'Uygulama Değerlendirme', desc: 'Edebiyat ve Yabancı Dil uygulama sınavları resmi kriter ölçeği.' },
            ].map((r) => (
              <div key={r.title} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <strong className="block text-slate-900 dark:text-white mb-0.5">{r.title}</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'kvkk',
      title: 'KVKK ve Kişisel Veri Güvenliği Rehberi',
      icon: ShieldCheck,
      color: 'text-blue-500',
      badge: '6698 Sayılı Kanun',
      content: (
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl space-y-2">
            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Kanuni Güvenceler ve Veri İzolasyonu
            </h4>
            <p className="text-slate-600 dark:text-slate-300">
              MEB Sorumluluk Sınavları Sistemi, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) Madde 10 ve Madde 12 hükümlerine göre en yüksek güvenlik standardı olan <strong>"Yerel Veri İzolasyonu"</strong> esasına göre çalışır.
            </p>
          </div>

          <div className="space-y-2">
            <strong className="block text-sm text-slate-900 dark:text-white">Güvenlik İlkelerimiz:</strong>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
              <li><strong>Sıfır Bulut İletimi:</strong> Öğrencilerin T.C. kimlik numaraları, okul numaraları, adları ve sınav notları hiçbir şekilde harici bir sunucuya iletilmez.</li>
              <li><strong>Veri Sorumlusu:</strong> KVKK kapsamında veri sorumlusu doğrudan okul müdürlüğünüzdür.</li>
              <li><strong>Offline Mimarisi:</strong> Program internet bağlantısı kesildiğinde dahi tamamen yerel olarak çalışır.</li>
              <li><strong>İmha ve Silme:</strong> Dönem bitiminde "Yedekleme & Veri" menüsünden tüm verileri tek tıkla silebilir veya yeni döneme aktarabilirsiniz.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'backup',
      title: 'Yedekleme, Geri Yükleme ve Çoklu Bilgisayar',
      icon: Database,
      color: 'text-teal-500',
      badge: 'Veri Güvenliği',
      content: (
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Bilgisayar arızaları, formatlama veya idareciler arasında veri paylaşımı durumunda sınav hazırlıklarınızın kaybolmaması için gelişmiş yedekleme altyapısı sunulmuştur.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
              <strong className="block text-slate-900 dark:text-white">Yedek Alma (JSON İndir)</strong>
              <p className="text-slate-500 dark:text-slate-400">
                Sol menüdeki <em>"Yedekleme & Veri"</em> sekmesinden "Yedek Al" butonuna tıklayarak sınav takviminizi tek bir dosya olarak USB belleğinize kaydedebilirsiniz.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
              <strong className="block text-slate-900 dark:text-white">Yedekten Geri Yükleme</strong>
              <p className="text-slate-500 dark:text-slate-400">
                Farklı bir bilgisayara programı kurup yedek dosyasını yüklediğinizde tüm sınav programı, öğretmenler ve komisyonlar anında geri gelir.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Sıkça Sorulan Sorular ve Sorun Giderme (S.S.S.)',
      icon: HelpCircle,
      color: 'text-indigo-500',
      badge: 'Yardım & Destek',
      content: (
        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {[
            {
              q: 'e-Okul Excel dosyasını yüklerken format hatası alıyorum?',
              a: 'e-Okul raporunu indirirken Web Sayfası (.htm) değil, Excel (.xls/.xlsx) formatında indirdiğinizden emin olun. Dosyayı Excel programında açıp "Farklı Kaydet ➡️ .xlsx" yaparak tekrar deneyin.'
            },
            {
              q: 'Aynı saatte iki sınavı olan bir öğrenci olursa program ne yapar?',
              a: 'Program çakışmayı tespit eder ve Takvim ekranında kırmızı uyarı rozeti verir. Sınavlardan birini başka bir saate taşıyarak çakışmayı anında çözebilirsiniz.'
            },
            {
              q: 'Bir öğretmen raporlu veya izinli olduğunda komisyon nasıl güncellenir?',
              a: 'Sol menüdeki "Komisyon Manuel Düzenle" sekmesinden ilgili sınava gelin. Raporlu öğretmenin yerine listeden müsait olan başka bir öğretmeni seçin.'
            },
            {
              q: 'İnternet bağlantım kesilirse program çalışır mı?',
              a: 'Evet. Program ilk lisans aktivasyonundan sonra 7 gün boyunca kesintisiz çevrimdışı (offline) çalışabilir.'
            },
            {
              q: 'Yazdırma yaparken sayfa düzeni nasıl ayarlanmalıdır?',
              a: 'Tüm raporlarımız standart A4 boyutuna göre tasarlanmıştır. Yazdır penceresinde sayfa yönünü Dikey (veya Takvim için Yatay) ve kenar boşluklarını "Varsayılan" olarak bırakmanız yeterlidir.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <strong className="text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-indigo-500 font-extrabold">S:</span> {item.q}
              </strong>
              <p className="text-slate-600 dark:text-slate-400 pl-4">{item.a}</p>
            </div>
          ))}
        </div>
      )
    }
  ];

  // Arama filtresi
  const filteredSections = guideSections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sec.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sec.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeContent = guideSections.find((s) => s.id === activeSection) || guideSections[0];

  function handlePrintGuide() {
    window.print();
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Üst Başlık ve Hızlı Aksiyonlar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-rose-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" /> Kullanım Kılavuzu & Mevzuat Rehberi
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              MEB Sorumluluk Sınavları Sistemi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Sınav planlama, e-Okul aktarımı, akıllı komisyon dağıtımı ve resmi evrak tanzimi hakkında detaylı kullanım rehberi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onRelaunchTour && (
              <button
                type="button"
                onClick={onRelaunchTour}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                Hızlı Turu Başlat
              </button>
            )}

            <button
              type="button"
              onClick={handlePrintGuide}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Printer className="w-4 h-4" />
              Kılavuzu Yazdır
            </button>
          </div>
        </div>

        {/* Canlı Arama Kutusu */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Konularda ara (örn: e-okul, komisyon, çakışma, raporlar, kvkk)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* İki Sütunlu Kılavuz Navigasyonu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sol Menü: Konular */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 mb-2">
            Rehber Konuları ({filteredSections.length})
          </h3>
          
          <div className="space-y-1.5">
            {filteredSections.map((sec) => {
              const isSelected = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 border ${
                    isSelected
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 font-bold shadow-sm'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${sec.color}`}>
                    <sec.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate leading-tight">{sec.title}</p>
                    <span className="text-[10px] text-slate-400 font-normal">{sec.badge}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSelected ? 'translate-x-0.5 text-rose-500' : ''}`} />
                </button>
              );
            })}
          </div>

          {/* Hızlı İpucu Kartı */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-xs text-slate-600 dark:text-slate-400 mt-4 space-y-2">
            <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" /> Mevzuat Dayanağı
            </span>
            <p className="text-[11px] leading-relaxed">
              MEB Ortaöğretim Kurumları Yönetmeliği Madde 58: "Sorumluluk sınavları, ders yılı başında, ikinci dönemin başında ve ders yılı sonunda okul müdürlüğünce belirlenen günlerde yapılır."
            </p>
          </div>
        </div>

        {/* Sağ Alan: Seçili Konunun Detay İçeriği */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 ${activeContent.color}`}>
                  <activeContent.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {activeContent.badge}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeContent.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* İçerik */}
            <div>
              {activeContent.content}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
