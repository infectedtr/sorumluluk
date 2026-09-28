import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { exportToExcel } from "../utils/excelParser";
import { isAssignableTeacher } from "../utils/teacherEligibility";
import { getExamObservers } from "../utils/examRoles";
import { EXAM_TYPES, normalizeExamType } from "../utils/examTypes";
import { teacherMatchesCourse } from "../utils/courseBranchMapping";
import {
  ClipboardEdit, Save, Search, MapPin, UserPlus, UserMinus,
  FileSpreadsheet, Sparkles, CheckCircle2, AlertTriangle, Eye, EyeOff,
} from "lucide-react";

// Teacher Select Dropdown — branşa uygun olanları üstte gösterir
function TeacherSelect({ value, onChange, teachers, dersAdi, courseBranchMappings, exclude = [], label }) {
  const uygun = teachers.filter((t) => teacherMatchesCourse(t.branch, dersAdi, courseBranchMappings) && !exclude.includes(t.name));
  const diger = teachers.filter((t) => !teacherMatchesCourse(t.branch, dersAdi, courseBranchMappings) && !exclude.includes(t.name));
  const selectedTeacher = teachers.find((t) => t.name === value);
  const isMatch = value ? teacherMatchesCourse(selectedTeacher?.branch, dersAdi, courseBranchMappings) : null;
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
          <optgroup label={`✓ Branşla Uygun (${uygun.length})`}>
            {uygun
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'))
              .map((t, idx) => (
                <option key={`uygun_${t.id || t.name}_${idx}`} value={t.name}>
                  {t.name} · {t.branch}
                </option>
              ))}
          </optgroup>
        )}
        {diger.length > 0 && (
          <optgroup label={`Diğer Öğretmenler (${diger.length})`}>
            {diger
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'))
              .map((t, idx) => (
                <option key={`diger_${t.id || t.name}_${idx}`} value={t.name}>
                  {t.name} · {t.branch}
                </option>
              ))}
          </optgroup>
        )}
      </select>
    </div>
  );
}

// Tek sınav satırı düzenleme kartı
function ExamRow({ exam, colorIndex, teachers, rooms, hours, courses, courseBranchMappings, onSave, showBranshHint }) {
  const colorHue = (colorIndex * 137.508) % 360;
  const [tarih, setTarih] = useState(exam.tarih || "");
  const [saat, setSaat] = useState(exam.saat || hours[0] || "10:00");
  const [seviye, setSeviye] = useState(Number(exam.seviye) || 9);
  const [ders, setDers] = useState(exam.ders || "");
  const [sinavTuru, setSinavTuru] = useState(normalizeExamType(exam.sinavTuru));
  const [ogrenciSayisi, setOgrenciSayisi] = useState(exam.ogrenciSayisi || 0);
  const [uye1, setUye1] = useState(exam.uye1 || "");
  const [uye2, setUye2] = useState(exam.uye2 || "");
  const [uye3, setUye3] = useState(exam.uye3 || "");
  const [gozcu, setGozcu] = useState(exam.gozcu || "");
  const [salon, setSalon] = useState(exam.salon || "");
  const [extraGozcular, setExtraGozcular] = useState(exam.extraGozcular || []);
  const [aciklama, setAciklama] = useState(exam.aciklama || "");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const m = (fn) => { fn(); setDirty(true); setSaved(false); };
  const komisyonTam = uye1 && uye2;
  const u1match = uye1 ? teacherMatchesCourse(teachers.find((t) => t.name === uye1)?.branch, ders, courseBranchMappings) : null;
  const u2match = uye2 ? teacherMatchesCourse(teachers.find((t) => t.name === uye2)?.branch, ders, courseBranchMappings) : null;
  const handleCourseChange = (selectedCourseName) => {
    m(() => setDers(selectedCourseName));
    const matched = courses.find(
      (course) =>
        course.name === selectedCourseName &&
        Number(course.seviye) === Number(seviye) &&
        normalizeExamType(course.sinavTuru) === sinavTuru
    ) || courses.find(
      (course) => course.name === selectedCourseName && Number(course.seviye) === Number(seviye)
    );
    if (matched) {
      m(() => {
        setSinavTuru(normalizeExamType(matched.sinavTuru));
        setOgrenciSayisi(matched.ogrenciSayisi || 0);
      });
    }
  };
  const handleExamTypeChange = (selectedType) => {
    m(() => setSinavTuru(selectedType));
    const matched = courses.find(
      (course) =>
        course.name === ders &&
        Number(course.seviye) === Number(seviye) &&
        normalizeExamType(course.sinavTuru) === selectedType
    );
    if (matched) m(() => setOgrenciSayisi(matched.ogrenciSayisi || 0));
  };
  const handleSave = () => {
    if (!tarih || !saat || !ders.trim()) return;
    onSave(exam.id, {
      tarih,
      saat,
      seviye: Number(seviye),
      ders: ders.trim().toLocaleUpperCase("tr-TR"),
      sinavTuru,
      ogrenciSayisi: Number(ogrenciSayisi) || 0,
      uye1,
      uye2,
      uye3,
      gozcu,
      salon,
      extraGozcular: extraGozcular.filter(Boolean),
      aciklama
    });
    setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  };
  return (
    <div
      className={`rounded-2xl border p-4 space-y-3 transition-all ${dirty ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm" : "exam-card-color"}`}
      style={dirty ? undefined : { "--exam-card-hue": colorHue }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-900 dark:text-white">{ders || "Ders belirtilmedi"}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">{seviye}. Sinif</span>
          {tarih && <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">{tarih} · {saat}</span>}
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">{ogrenciSayisi || 0} ogrenci</span>
          {komisyonTam
            ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold"><CheckCircle2 className="w-3 h-3" />Komisyon Tam</span>
            : <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-[10px] font-semibold"><AlertTriangle className="w-3 h-3" />Eksik Uye</span>}
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ Kaydedildi</span>}
          <button onClick={handleSave} disabled={!dirty || !tarih || !saat || !ders.trim()} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs font-semibold transition-all active:scale-95">
            <Save className="w-3.5 h-3.5" />Kaydet
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          Sınav Tarihi
          <input type="date" value={tarih} onChange={(e) => m(() => setTarih(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          Sınav Saati
          <select value={saat} onChange={(e) => m(() => setSaat(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white">
            {!hours.includes(saat) && <option value={saat}>{saat}</option>}
            {hours.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          Sınıf Seviyesi
          <select value={seviye} onChange={(e) => m(() => setSeviye(Number(e.target.value)))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white">
            {[9, 10, 11, 12].map((level) => <option key={level} value={level}>{level}. Sinif</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          Sınav Türü
          <select value={sinavTuru} onChange={(e) => handleExamTypeChange(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white">
            {EXAM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 sm:col-span-2 lg:col-span-3">
          Ders Adı
          <input type="text" list={`exam-course-options-${exam.id}`} value={ders}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white uppercase" />
          <datalist id={`exam-course-options-${exam.id}`}>
            {courses.map((course) => <option key={course.id} value={course.name} />)}
          </datalist>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          Öğrenci Sayısı
          <input type="number" min="0" value={ogrenciSayisi}
            onChange={(e) => m(() => setOgrenciSayisi(parseInt(e.target.value, 10) || 0))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
        </label>
      </div>
      {/* Salon */}
      <div className="flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <div className="flex-1">
          <label htmlFor={`exam-room-${exam.id}`} className="mb-1 block text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Sınav Yeri / Salonu
          </label>
          <input
            id={`exam-room-${exam.id}`}
            type="text"
            list={`exam-room-options-${exam.id}`}
            value={salon}
            onChange={(e) => m(() => setSalon(e.target.value))}
            placeholder="Sınav yeri / salon adı yazın veya listeden seçin..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <datalist id={`exam-room-options-${exam.id}`}>
            {rooms.map((room) => <option key={room.id} value={room.name} />)}
          </datalist>
        </div>
      </div>
      {/* Komisyon grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <TeacherSelect label="1. Komisyon Uyesi *" value={uye1} onChange={(v) => m(() => setUye1(v))} teachers={teachers} dersAdi={ders} courseBranchMappings={courseBranchMappings} exclude={[uye2,uye3,gozcu,...extraGozcular].filter(Boolean)} />
          {showBranshHint && uye1 && <p className={`text-[9px] mt-0.5 ${u1match ? "text-emerald-600" : "text-amber-600"}`}>{u1match ? "✓ Bransa uygun" : "⚠ Brans farkli"}</p>}
        </div>
        <div>
          <TeacherSelect label="2. Komisyon Uyesi *" value={uye2} onChange={(v) => m(() => setUye2(v))} teachers={teachers} dersAdi={ders} courseBranchMappings={courseBranchMappings} exclude={[uye1,uye3,gozcu,...extraGozcular].filter(Boolean)} />
          {showBranshHint && uye2 && <p className={`text-[9px] mt-0.5 ${u2match ? "text-emerald-600" : "text-amber-600"}`}>{u2match ? "✓ Bransa uygun" : "⚠ Brans farkli"}</p>}
        </div>
        <TeacherSelect label="Gozcu" value={uye3} onChange={(v) => m(() => setUye3(v))} teachers={teachers} dersAdi={ders} courseBranchMappings={courseBranchMappings} exclude={[uye1,uye2,gozcu,...extraGozcular].filter(Boolean)} />
        <TeacherSelect label="Diger Gozcu" value={gozcu} onChange={(v) => m(() => setGozcu(v))} teachers={teachers} dersAdi={ders} courseBranchMappings={courseBranchMappings} exclude={[uye1,uye2,uye3,...extraGozcular].filter(Boolean)} />
      </div>
      {/* Ek gözcüler */}
      {extraGozcular.map((g, idx) => (
        <div key={idx} className="flex items-end gap-2">
          <div className="flex-1">
            <TeacherSelect label={`Ek Gozcu ${idx + 1}`} value={g} onChange={(v) => m(() => setExtraGozcular((prev) => prev.map((x, i) => i===idx ? v : x)))} teachers={teachers} dersAdi={ders} courseBranchMappings={courseBranchMappings} exclude={[uye1,uye2,uye3,gozcu,...extraGozcular.filter((_,i)=>i!==idx)].filter(Boolean)} />
          </div>
          <button onClick={() => m(() => setExtraGozcular((prev) => prev.filter((_,i)=>i!==idx)))} className="mb-0.5 p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40">
            <UserMinus className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => m(() => setExtraGozcular((prev) => [...prev,""]))} className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline">
        <UserPlus className="w-3.5 h-3.5" />Ek Gozcu Ogretmen Ekle
      </button>
      <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        Özel Açıklama / Not
        <input type="text" value={aciklama} onChange={(e) => m(() => setAciklama(e.target.value))}
          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
      </label>
    </div>
  );
}

// Ana sayfa
export default function CommissionEditView() {
  const { schedule, teachers, rooms, hours, courses, schoolInfo, courseBranchMappings, updateExam, runAutoAssignment } = useApp();
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
          {filtered.map((exam, index)=>(
            <ExamRow key={exam.id} exam={exam} colorIndex={index} teachers={activeTeachers} rooms={rooms} hours={hours} courses={courses} courseBranchMappings={courseBranchMappings} onSave={updateExam} showBranshHint={showBranshHint} />
          ))}
        </div>
      )}
    </div>
  );
}
