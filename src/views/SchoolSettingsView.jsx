import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  School,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Menu,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  LayoutDashboard,
  CalendarDays,
  Users,
  GraduationCap,
  BookOpen,
  Link2,
  Scale,
  ClipboardEdit,
  FileText,
  Database
} from 'lucide-react';

export default function SchoolSettingsView() {
  const {
    schoolInfo,
    updateSchoolInfo,
    hours,
    addHour,
    deleteHour,
    rooms,
    addRoom,
    deleteRoom,
    sidebarReorderEnabled,
    setSidebarReorderEnabled,
    sidebarOrder,
    setSidebarOrder,
    resetSidebarOrder,
    DEFAULT_MENU_ORDER
  } = useApp();

  const [formData, setFormData] = useState({ ...schoolInfo });
  const [newHour, setNewHour] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState(30);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'hours_rooms' | 'menu'

  const MENU_ITEM_META = {
    dashboard: { label: 'Gösterge Paneli', icon: LayoutDashboard },
    schedule: { label: 'Sınav Programı & Takvim', icon: CalendarDays },
    teachers: { label: 'Öğretmenler & Komisyon', icon: Users },
    students: { label: 'Öğrenci Sorumluluk Listesi', icon: GraduationCap },
    courses: { label: 'Dersler & Seviyeler', icon: BookOpen },
    'course-branches': { label: 'Ders - Branş Eşleştirme', icon: Link2 },
    duties: { label: 'Görev Dağılım Çizelgesi', icon: Scale },
    commission: { label: 'Komisyon Manuel Düzenle', icon: ClipboardEdit },
    reports: { label: 'MEB Resmi Raporları', icon: FileText },
    settings: { label: 'Okul Bilgileri & Ayarlar', icon: Settings },
    backup: { label: 'Yedekleme & Veri', icon: Database }
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const newOrder = [...sidebarOrder];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setSidebarOrder(newOrder);
  };

  const handleMoveDown = (index) => {
    if (index >= sidebarOrder.length - 1) return;
    const newOrder = [...sidebarOrder];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setSidebarOrder(newOrder);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    updateSchoolInfo(formData);
  };

  const handleAddHour = (e) => {
    e.preventDefault();
    if (!newHour) return;
    addHour(newHour);
    setNewHour('');
  };

  const handleAddRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    addRoom({
      name: newRoomName.trim(),
      capacity: Number(newRoomCapacity) || 30
    });
    setNewRoomName('');
    setNewRoomCapacity(30);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          <span>Okul Bilgileri ve Sınav Ayarları</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kurum bilgileri, sınav dönemi, sınav saatleri, salonlar ve sol menü düzeni
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'general'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Kurum & Sınav Dönemi</span>
        </button>

        <button
          onClick={() => setActiveTab('hours_rooms')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'hours_rooms'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Sınav Saatleri & Salonlar</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'menu'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>Sol Menü Düzeni</span>
          {sidebarReorderEnabled ? (
            <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              🔓 Düzenleme Açık
            </span>
          ) : (
            <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              🔒 Sabit
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: General Info */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveInfo} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Okul / Kurum Tam Adı *
              </label>
              <input
                type="text"
                required
                name="okulAdi"
                value={formData.okulAdi || ''}
                onChange={handleChange}
                placeholder="Örn: Örnek Anadolu Lisesi"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bağlı Bulunulan Valilik / Kaymakamlık *
              </label>
              <input
                type="text"
                required
                name="valilik"
                value={formData.valilik || ''}
                onChange={handleChange}
                placeholder="Örn: ... VALİLİĞİ"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Milli Eğitim Müdürlüğü
              </label>
              <input
                type="text"
                name="ilceMem"
                value={formData.ilceMem || ''}
                onChange={handleChange}
                placeholder="Örn: İl Milli Eğitim Müdürlüğü"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Öğretim Yılı *
              </label>
              <input
                type="text"
                required
                name="ogretimYili"
                value={formData.ogretimYili || ''}
                onChange={handleChange}
                placeholder="Örn: 2024-2025"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sınav Dönemi *
              </label>
              <select
                name="donem"
                value={formData.donem || 'ŞUBAT'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="EYLÜL">EYLÜL (1. Dönem Başı)</option>
                <option value="ŞUBAT">ŞUBAT (2. Dönem Başı)</option>
                <option value="HAZİRAN">HAZİRAN (Ders Yılı Sonu)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Okul Müdürü Adı Soyadı *
              </label>
              <input
                type="text"
                required
                name="okulMuduru"
                value={formData.okulMuduru || ''}
                onChange={handleChange}
                placeholder="Örn: Ad Soyad"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Müdür Unvanı
              </label>
              <input
                type="text"
                name="unvan"
                value={formData.unvan || 'Okul Müdürü'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                İlgili Müdür Yardımcısı Adı Soyadı
              </label>
              <input
                type="text"
                name="mudurYardimcisi"
                value={formData.mudurYardimcisi || ''}
                onChange={handleChange}
                placeholder="Örn: Ayşe YILMAZ"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sınav Başlangıç Tarihi
              </label>
              <input
                type="date"
                name="sinavBaslangic"
                value={formData.sinavBaslangic || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gözcü Görevlendirme Öğrenci Eşiği
              </label>
              <input
                type="number"
                min="0"
                step="1"
                name="gozcuEsikOgrenciSayisi"
                value={formData.gozcuEsikOgrenciSayisi ?? 30}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Öğrenci sayısı bu değeri aştığında otomatik atamada gözcü eklenir. Varsayılan: 30.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Ayarları Kaydet</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Hours & Rooms */}
      {activeTab === 'hours_rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Exam Hours */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
              <Clock className="w-5 h-5" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Sınav Oturum Saatleri
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sınav planlarken seçilebilecek varsayılan oturum saatleri
            </p>

            <form onSubmit={handleAddHour} className="flex gap-2">
              <input
                type="time"
                required
                value={newHour}
                onChange={(e) => setNewHour(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs flex-1"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Saat Ekle
              </button>
            </form>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
              {hours.map((h) => (
                <div key={h} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {h}
                  </span>
                  <button
                    onClick={() => deleteHour(h)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Rooms */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <MapPin className="w-5 h-5" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Sınav Salonları & Yerleri
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sınavların uygulanacağı derslik, atölye, laboratuvar veya salonlar
            </p>

            <form onSubmit={handleAddRoom} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Salon Adı (Örn: Bilişim Atölyesi 1)"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs flex-1"
                />
                <input
                  type="number"
                  min="5"
                  value={newRoomCapacity}
                  onChange={(e) => setNewRoomCapacity(e.target.value)}
                  placeholder="Kapasite"
                  className="w-20 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Yeni Salon Ekle
              </button>
            </form>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
              {rooms.map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {r.name}
                    </span>
                    {r.capacity && (
                      <span className="ml-2 text-[11px] text-slate-400">
                        (Kapasite: {r.capacity} Kişi)
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteRoom(r.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Menu Reorder & Lock */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Lock / Unlock Toggle Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className={`p-3 rounded-2xl ${
                  sidebarReorderEnabled
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                }`}>
                  {sidebarReorderEnabled ? (
                    <Unlock className="w-6 h-6 animate-pulse" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Sol Menü Sürükle - Bırak Kilidi
                    </h2>
                    {sidebarReorderEnabled ? (
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        🔓 Düzenleme Açık
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        🔒 Menü Sabit (Kilitli)
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    {sidebarReorderEnabled
                      ? 'Menü şu an düzenlenebilir durumdadır. Sol menüdeki öğeleri sürükleyip bırakarak veya aşağıdaki ok tuşları ile sıralayabilirsiniz. Düzenlemeyi tamamladıktan sonra menüyü kilitleyebilirsiniz.'
                      : 'Menü öğelerinin kazara sürüklenip yer değiştirmesini önlemek için sürükle-bırak özelliği varsayılan olarak kilitlenmiştir. Sıralamayı değiştirmek istediğinizde kilidi açabilirsiniz.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
                <button
                  type="button"
                  onClick={() => setSidebarReorderEnabled(!sidebarReorderEnabled)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                    sidebarReorderEnabled
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {sidebarReorderEnabled ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Menüyü Kilitle (Sabitle)</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Düzenlemeyi Aç (Kilidi Kaldır)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetSidebarOrder}
                  className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
                  title="Varsayılan MEB menü sıralamasına döndürür"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sıralamayı Sıfırla</span>
                </button>
              </div>
            </div>
          </div>

          {/* Menu Items Reorder List Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                  <Menu className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span>Menü Öğeleri Sıralaması</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Öğelerin sırasını aşağıdaki <b>Yukarı (↑)</b> ve <b>Aşağı (↓)</b> butonları ile doğrudan ayarlayabilirsiniz.
                </p>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Toplam {sidebarOrder.length} Menü Başlığı
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
              {sidebarOrder.map((id, index) => {
                const meta = MENU_ITEM_META[id] || { label: id, icon: Menu };
                const IconComponent = meta.icon;
                const isFirst = index === 0;
                const isLast = index === sidebarOrder.length - 1;

                return (
                  <div
                    key={id}
                    className="p-3.5 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={isFirst}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${
                          isFirst
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 shadow-xs'
                        }`}
                        title={isFirst ? 'Zaten en üstte' : 'Yukarı Taşı'}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={isLast}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${
                          isLast
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 shadow-xs'
                        }`}
                        title={isLast ? 'Zaten en altta' : 'Aşağı Taşı'}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
