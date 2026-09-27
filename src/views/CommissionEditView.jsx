import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { exportToExcel } from "../utils/excelParser";
import { isAssignableTeacher } from "../utils/teacherEligibility";
import { getExamObservers } from "../utils/examRoles";
import {
  ClipboardEdit, Save, Search, MapPin, UserPlus, UserMinus,
  FileSpreadsheet, Sparkles, CheckCircle2, AlertTriangle, Eye, EyeOff,
} from "lucide-react";

// Branş-ders uyum kontrolü (scheduler.js ile aynı inline mantık)
function branshUygunMu(teacherBranch, dersAdi) {
  if (!teacherBranch || !dersAdi) return false;
  const tb = teacherBranch.toLocaleUpperCase("tr-TR");
  const dn = dersAdi.toLocaleUpperCase("tr-TR");
  if (dn.includes(tb) || tb.includes(dn)) return true;
  const MAP = [
    { ders: ["TURK DILI","TURKCE","EDEBIYAT","DIL VE ANLATIM"], brans: ["TURK DILI VE EDEBIYATI","TURKCE"] },
    { ders: ["MATEMATIK","TEMEL MATEMATIK"], brans: ["MATEMATIK"] },
    { ders: ["FIZIK"], brans: ["FIZIK"] },
    { ders: ["KIMYA"], brans: ["KIMYA"] },
    { ders: ["BIYOLOJI"], brans: ["BIYOLOJI"] },
    { ders: ["TARIH","INKILAP","CAGDAS TURK"], brans: ["TARIH"] },
    { ders: ["COGRAFYA"], brans: ["COGRAFYA"] },
    { ders: ["FELSEFE","PSIKOLOJI","SOSYOLOJI","MANTIK"], brans: ["FELSEFE"] },
    { ders: ["DIN KULTURU","AHLAK BILGISI"], brans: ["DIN KULTURU VE AHLAK BILGISI","IMAM HATIP"] },
    { ders: ["YABANCI DIL","INGILIZCE","ALMANCA","FRANSIZCA","ARAPCA"], brans: ["INGILIZCE","ALMANCA","FRANSIZCA","YABANCI DIL","ARAPCA"] },
    { ders: ["BEDEN EGITIMI","SPOR"], brans: ["BEDEN EGITIMI"] },
    { ders: ["MUZIK"], brans: ["MUZIK"] },
    { ders: ["GORSEL SANATLAR","RESIM"], brans: ["GORSEL SANATLAR","RESIM"] },
    { ders: ["BILISIM","BILGISAYAR","PROGRAMLAMA","WEB TASARIM","YAZILIM"], brans: ["BILISIM TEKNOLOJILERI","BILGISAYAR"] },
    { ders: ["ELEKTRIK","ELEKTRONIK","OTOMASYON","PLC","ENERJI"], brans: ["ELEKTRIK-ELEKTRONIK TEKNOLOJISI","ELEKTRIK"] },
    { ders: ["MAKINE","MOTOR","OTOMOTIV","MOTORLU ARAC","KAYNAKCILIK","CNC"], brans: ["MAKINE TEKNOLOJISI","MOTORLU ARACLAR TEKNOLOJISI","METAL TEKNOLOJISI"] },
    { ders: ["METAL","CELIK","DOKUM"], brans: ["METAL TEKNOLOJISI"] },
    { ders: ["MOBILYA","IC MEKAN","AHSAP","MARANGOZ"], brans: ["MOBILYA VE IC MEKAN TASARIMI"] },
    { ders: ["GIDA","MUTFAK","YIYECEK","PASTANE","ASCILIK"], brans: ["GIDA TEKNOLOJISI","ASCILIK"] },
    { ders: ["SAGLIK","HEMSIRELIK","ILK YARDIM"], brans: ["SAGLIK HIZMETLERI","HEMSIRELIK"] },
    { ders: ["MUHASEBE","FINANS","PAZARLAMA","BANKACILIK","TICARET"], brans: ["MUHASEBE VE FINANSMAN","MUHASEBE"] },
    { ders: ["TURIZM","OTELCILIK","SEYAHAT"], brans: ["TURIZM VE OTEL ISLETMECILIGI"] },
    { ders: ["GRAFIK","MEDYA","TASARIM","FOTOGRAF"], brans: ["GRAFIK VE FOTOGRAF","MEDYA VE ILETISIM"] },
  ];
  // Normalize both strings (remove Turkish chars)
  const norm = (s) => s.replace(/[İIŞŞÇÇĞĞÜÜÖÖ]/g,"").replace(/[işçğüö]/gi,"");
  const tbN = norm(tb); const dnN = norm(dn);
  for (const entry of MAP) {
    if (entry.ders.some((d) => dnN.includes(norm(d)))) {
      if (entry.brans.some((b) => tbN.includes(norm(b)) || norm(b).includes(tbN))) return true;
    }
  }
  return false;
}

// Teacher Select Dropdown — branşa uygun olanları üstte gösterir
function TeacherSelect({ value, onChange, teachers, dersAdi, exclude = [], label }) {
  const uygun = teachers.filter((t) => branshUygunMu(t.branch, dersAdi) && !exclude.includes(t.name));
  const diger = teachers.filter((t) => !branshUygunMu(t.branch, dersAdi) && !exclude.includes(t.name));
  const selectedTeacher = teachers.find((t) => t.name === value);
  const isMatch = value ? branshUygunMu(selectedTeacher?.branch, dersAdi) : null;
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-colors ${
          isMatch === true ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
          : isMatch === false ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        }`}
      >
        <option value="">— Seçiniz —</option>
        {uygun.length > 0 && (
          <optgroup label={`✓ Bransla Uygun (${uygun.length})`}>
            {uygun.map((t) => <option key={t.id} value={t.name}>{t.name} · {t.branch}</option>)}
          </optgroup>
        )}
        {diger.length > 0 && (
          <optgroup label={`Diger Ogretmenler (${diger.length})`}>
            {diger.map((t) => <option key={t.id} value={t.name}>{t.name} · {t.branch}</option>)}
          </optgroup>
        )}
      </select>
    </div>
  );
}

// Tek sınav satırı düzenleme kartı
function ExamRow({ exam, teachers, onSave, showBranshHint }) {
  const [uye1, setUye1] = useState(exam.uye1 || "");
  const [uye2, setUye2] = useState(exam.uye2 || "");
  const [uye3, setUye3] = useState(exam.uye3 || "");
  const [gozcu, setGozcu] = useState(exam.gozcu || "");
  const [salon, setSalon] = useState(exam.salon || "");
  const [extraGozcular, setExtraGozcular] = useState(exam.extraGozcular || []);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const m = (fn) => { fn(); setDirty(true); setSaved(false); };
  const komisyonTam = uye1 && uye2;
  const u1match = uye1 ? branshUygunMu(teachers.find((t) => t.name === uye1)?.branch, exam.ders) : null;
  const u2match = uye2 ? branshUygunMu(teachers.find((t) => t.name === uye2)?.branch, exam.ders) : null;
  const handleSave = () => {
    onSave(exam.id, { uye1, uye2, uye3, gozcu, salon, extraGozcular: extraGozcular.filter(Boolean) });
    setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  };
  const allEx = [uye1, uye2, uye3, gozcu, ...extraGozcular].filter(Boolean);
  return (
    <div className={`rounded-2xl border p-4 space-y-3 transition-all ${dirty ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-900 dark:text-white">{exam.ders}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">{exam.seviye}. Sinif</span>
          {exam.tarih && <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">{exam.tarih} · {exam.saat}</span>}
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">{exam.ogrenciSayisi || 0} ogrenci</span>
          {komisyonTam
            ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold"><CheckCircle2 className="w-3 h-3" />Komisyon Tam</span>
            : <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-[10px] font-semibold"><AlertTriangle className="w-3 h-3" />Eksik Uye</span>}
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ Kaydedildi</span>}
          <button onClick={handleSave} disabled={!dirty} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs font-semibold transition-all active:scale-95">
            <Save className="w-3.5 h-3.5" />Kaydet
          </button>
        </div>
      </div>
      {/* Salon */}
      <div className="flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input type="text" value={salon} onChange={(e) => m(() => setSalon(e.target.value))}
          placeholder="Sinav yeri / salon adi yazin..."
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
      </div>
      {/* Komisyon grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <TeacherSelect label="1. Komisyon Uyesi *" value={uye1} onChange={(v) => m(() => setUye1(v))} teachers={teachers} dersAdi={exam.ders} exclude={[uye2,uye3,gozcu,...extraGozcular].filter(Boolean)} />
          {showBranshHint && uye1 && <p className={`text-[9px] mt-0.5 ${u1match ? "text-emerald-600" : "text-amber-600"}`}>{u1match ? "✓ Bransa uygun" : "⚠ Brans farkli"}</p>}
        </div>
        <div>
          <TeacherSelect label="2. Komisyon Uyesi *" value={uye2} onChange={(v) => m(() => setUye2(v))} teachers={teachers} dersAdi={exam.ders} exclude={[uye1,uye3,gozcu,...extraGozcular].filter(Boolean)} />
          {showBranshHint && uye2 && <p className={`text-[9px] mt-0.5 ${u2match ? "text-emerald-600" : "text-amber-600"}`}>{u2match ? "✓ Bransa uygun" : "⚠ Brans farkli"}</p>}
        </div>
        <TeacherSelect label="Gozcu" value={uye3} onChange={(v) => m(() => setUye3(v))} teachers={teachers} dersAdi={exam.ders} exclude={[uye1,uye2,gozcu,...extraGozcular].filter(Boolean)} />
        <TeacherSelect label="Diger Gozcu" value={gozcu} onChange={(v) => m(() => setGozcu(v))} teachers={teachers} dersAdi={exam.ders} exclude={[uye1,uye2,uye3,...extraGozcular].filter(Boolean)} />
      </div>
      {/* Ek gözcüler */}
      {extraGozcular.map((g, idx) => (
        <div key={idx} className="flex items-end gap-2">
          <div className="flex-1">
            <TeacherSelect label={`Ek Gozcu ${idx + 1}`} value={g} onChange={(v) => m(() => setExtraGozcular((prev) => prev.map((x, i) => i===idx ? v : x)))} teachers={teachers} dersAdi={exam.ders} exclude={[uye1,uye2,uye3,gozcu,...extraGozcular.filter((_,i)=>i!==idx)].filter(Boolean)} />
          </div>
          <button onClick={() => m(() => setExtraGozcular((prev) => prev.filter((_,i)=>i!==idx)))} className="mb-0.5 p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40">
            <UserMinus className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => m(() => setExtraGozcular((prev) => [...prev,""]))} className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline">
        <UserPlus className="w-3.5 h-3.5" />Ek Gozcu Ogretmen Ekle
      </button>
    </div>
  );
}

// Ana sayfa
export default function CommissionEditView() {
  const { schedule, teachers, schoolInfo, updateExam, runAutoAssignment } = useApp();
  const [search, setSearch] = useState("");
  const [filterSeviye, setFilterSeviye] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [showBranshHint, setShowBranshHint] = useState(true);
  const activeTeachers = useMemo(
    () => teachers.filter((teacher) => isAssignableTeacher(teacher, schoolInfo.okulMuduru)),
    [teachers, schoolInfo.okulMuduru]
  );
  const uniqueDates = useMemo(() => Array.from(new Set(schedule.map((e) => e.tarih).filter(Boolean))).sort(), [schedule]);
  const filtered = useMemo(() => schedule.filter((ex) => {
    if (search && !(ex.ders||"").toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))) return false;
    if (filterSeviye !== "all" && Number(ex.seviye) !== Number(filterSeviye)) return false;
    if (filterDate && ex.tarih !== filterDate) return false;
    return true;
  }).sort((a,b) => `${a.tarih}_${a.saat}_${a.ders}`.localeCompare(`${b.tarih}_${b.saat}_${b.ders}`,"tr-TR")), [schedule,search,filterSeviye,filterDate]);
  const eksikKomisyon = schedule.filter((e) => !e.uye1 || !e.uye2).length;
  const handleExportExcel = () => {
    exportToExcel(filtered.map((ex,i) => ({
      "Sira": i+1, "Tarih": ex.tarih, "Saat": ex.saat, "Seviye": `${ex.seviye}. Sinif`,
      "Ders": ex.ders, "Ogrenci Sayisi": ex.ogrenciSayisi||0, "Sinav Yeri": ex.salon||"",
      "1. Komisyon Uyesi": ex.uye1||"", "2. Komisyon Uyesi": ex.uye2||"",
      "Gozcu": getExamObservers(ex)[0] || "", "Diger Gozculer": getExamObservers(ex).slice(1).join(", "),
    })), "Komisyon_Programi");
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <ClipboardEdit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Komisyon Manuel Duzenleme</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {schedule.length} sinav oturumu &middot;{" "}
            {eksikKomisyon > 0
              ? <span className="text-rose-600 font-semibold">{eksikKomisyon} oturumda komisyon eksik</span>
              : <span className="text-emerald-600 font-semibold">Tum oturumlarda komisyon atanmis</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowBranshHint((p)=>!p)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            {showBranshHint ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>Brans Ipucu</span>
          </button>
          <button onClick={runAutoAssignment} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/20 active:scale-95 transition-all">
            <Sparkles className="w-4 h-4" />Otomatik Dagit
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60 transition-all">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />Excel Indir
          </button>
        </div>
      </div>
      {/* Filtreler */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Ders adi ara..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <select value={filterSeviye} onChange={(e)=>setFilterSeviye(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none">
          <option value="all">Tum Siniflar</option>
          <option value="9">9. Sinif</option><option value="10">10. Sinif</option>
          <option value="11">11. Sinif</option><option value="12">12. Sinif</option>
        </select>
        <select value={filterDate} onChange={(e)=>setFilterDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none">
          <option value="">Tum Tarihler</option>
          {uniqueDates.map((d)=><option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      {/* Renk legend */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 px-1">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 inline-block" />Bransa uygun ogretmen</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-amber-300 bg-amber-50 dark:bg-amber-950/30 inline-block" />Brans farkli (gecerli)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-indigo-300 bg-indigo-50 dark:bg-indigo-950/20 inline-block" />Degisiklik var (kaydedilmedi)</span>
      </div>
      {/* Kartlar */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-600">
          <ClipboardEdit className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">Sinav oturumu bulunamadi.</p>
          <p className="text-xs mt-1">Once Sinav Programi sayfasindan oturumlari ekleyin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exam)=>(
            <ExamRow key={exam.id} exam={exam} teachers={activeTeachers} onSave={updateExam} showBranshHint={showBranshHint} />
          ))}
        </div>
      )}
    </div>
  );
}
