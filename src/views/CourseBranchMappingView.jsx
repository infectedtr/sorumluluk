import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getUygunBranslar } from '../data/branchCourseMap';
import { normalizeCourseKey } from '../utils/courseBranchMapping';
import { BookOpen, Check, Link2, RotateCcw, Search } from 'lucide-react';

export default function CourseBranchMappingView() {
  const { courses, teachers, courseBranchMappings, updateCourseBranchMapping } = useApp();
  const [search, setSearch] = useState('');

  const branches = useMemo(
    () => [...new Set(teachers.map((teacher) => teacher.branch?.trim()).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b, 'tr-TR')
    ),
    [teachers]
  );
  const uniqueCourses = useMemo(() => {
    const byKey = new Map();
    courses.forEach((course) => {
      const key = normalizeCourseKey(course.name);
      if (!key) return;
      const existing = byKey.get(key);
      if (existing) {
        existing.levels.add(Number(course.seviye));
      } else {
        byKey.set(key, { key, name: course.name, levels: new Set([Number(course.seviye)]) });
      }
    });
    return [...byKey.values()]
      .map((course) => ({ ...course, levels: [...course.levels].filter(Boolean).sort((a, b) => a - b) }))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
  }, [courses]);

  const filteredCourses = uniqueCourses.filter((course) =>
    course.name.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR'))
  );

  const toggleBranch = (course, branch) => {
    const selected = courseBranchMappings?.[course.key] || [];
    const next = selected.includes(branch)
      ? selected.filter((item) => item !== branch)
      : [...selected, branch];
    updateCourseBranchMapping(course.name, next);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
          <Link2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          Ders - Öğretmen Branş Eşleştirme
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Derslere uygun bir veya daha fazla öğretmen branşı seçin. Eşleşmeler otomatik atamada kullanılır; manuel komisyon ekranında da uygun öğretmenleri öne çıkarıp branş uyumunu gösterir.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Ders ara..."
          aria-label="Ders ara"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {uniqueCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
          <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-50" />
          Eşleştirme yapabilmek için önce ders listesini oluşturun veya öğrenci dosyanızı içe aktarın.
        </div>
      ) : branches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
          Önce öğretmenleri içe aktarın veya öğretmen branşlarını tanımlayın.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCourses.map((course) => {
            const selected = courseBranchMappings?.[course.key] || [];
            const availableBranches = [...new Set([...branches, ...selected])].sort(
              (a, b) => a.localeCompare(b, 'tr-TR')
            );
            const suggested = getUygunBranslar(course.name);
            return (
              <section
                key={course.key}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{course.name}</h2>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {course.levels.length ? `${course.levels.join(', ')}. sınıf` : 'Seviye belirtilmemiş'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                      selected.length
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {selected.length ? 'Özel eşleşme' : 'Otomatik eşleşme'}
                    </span>
                    {selected.length > 0 && (
                      <button
                        type="button"
                        onClick={() => updateCourseBranchMapping(course.name, [])}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={`${course.name} özel eşleşmesini temizle`}
                      >
                        <RotateCcw className="h-3 w-3" />
                        Sıfırla
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {availableBranches.map((branch) => {
                    const checked = selected.includes(branch);
                    const isSuggested = suggested.some(
                      (item) => normalizeCourseKey(item) === normalizeCourseKey(branch)
                    );
                    return (
                      <label
                        key={branch}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                          checked
                            ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBranch(course, branch)}
                          className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span className="flex-1">{branch}</span>
                        {checked && <Check className="h-3.5 w-3.5" />}
                        {!selected.length && isSuggested && (
                          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Öneri</span>
                        )}
                      </label>
                    );
                  })}
                </div>
                <p className="mt-3 text-[10px] text-slate-400">
                  {selected.length
                    ? `Otomatik atamada yalnızca seçilen branşlar tercih edilir: ${selected.join(', ')}`
                    : suggested.length
                    ? `Özel eşleşme yok; sistem varsayılan ders-branş önerilerini kullanır: ${suggested.join(', ')}`
                    : 'Özel eşleşme yok; sistem ders adına göre genel branş eşleşmesi yapar.'}
                </p>
              </section>
            );
          })}
          {filteredCourses.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">Aramanızla eşleşen ders bulunamadı.</p>
          )}
        </div>
      )}
    </div>
  );
}
