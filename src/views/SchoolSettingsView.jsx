import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  School,
  Clock,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle2
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
    deleteRoom
  } = useApp();

  const [formData, setFormData] = useState({ ...schoolInfo });
  const [newHour, setNewHour] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState(30);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'hours_rooms' | 'official_text'

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
          Kurum bilgileri, sınav dönemi, sınav saatleri, salonları ve resmi yazışma şablonları
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
          onClick={() => setActiveTab('official_text')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'official_text'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resmi Yazışma & Makam Oluru</span>
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
                placeholder="Örn: AFYONKARAHİSAR VALİLİĞİ"
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

      {/* TAB 3: Official Letter Text Template */}
      {activeTab === 'official_text' && (
        <form onSubmit={handleSaveInfo} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resmi Antet Başlığı (Kaşe Üstü)
              </label>
              <textarea
                rows={3}
                name="antet"
                value={formData.antet || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resmi Yazı Sayısı
                </label>
                <input
                  type="text"
                  name="sayi"
                  value={formData.sayi || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resmi Yazı Konusu
                </label>
                <input
                  type="text"
                  name="konu"
                  value={formData.konu || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Yazı İlgisi (Mevzuat Maddesi)
              </label>
              <input
                type="text"
                name="ilgi"
                value={formData.ilgi || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Makam Olur Yazısı Gövde Metni
              </label>
              <textarea
                rows={6}
                name="govde"
                value={formData.govde || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Şube / İlçe Müdürü Onay Makamı
                </label>
                <input
                  type="text"
                  name="onay2Makam"
                  value={formData.onay2Makam || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Son Olur Makamı (Vali / Kaymakam)
                </label>
                <input
                  type="text"
                  name="olurMakam"
                  value={formData.olurMakam || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Resmi Şablonu Kaydet</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
