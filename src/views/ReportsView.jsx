import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { normalizeExamType, requiresWrittenAndOralExams } from '../utils/examTypes';
import { getExamObservers, getExamStaff } from '../utils/examRoles';
import { createGradeSheetPdf } from '../utils/gradeSheetPdf';
import foreignGradeSheetTemplateUrl from '../../sablon/yabancınot.pdf?url';
import speakingGradeSheetTemplateUrl from '../../sablon/konusmadinleme.pdf?url';
import {
  FileText,
  Printer,
  Calendar,
  Users,
  GraduationCap,
  Mail,
  Award,
  Layers,
  CheckCircle,
  FileCheck,
  FileSpreadsheet,
  Download,
  Package,
  ClipboardList,
  Stamp,
  BookOpenCheck,
  Sparkles,
  Zap,
  CheckSquare,
  FileBadge,
  Edit3,
  Save,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { staggerEntrance } from '../utils/animeEffects';

const FEE_HOURS_PER_DUTY = 5;

function normalizeGradeSheetCourse(value) {
  return String(value || '')
    .toLocaleUpperCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

function getGradeSheetSubject(courseName) {
  const normalized = normalizeGradeSheetCourse(courseName);
  if (normalized.includes('TURKDILIVEEDEBIYATI')) return 'tde';
  return requiresWrittenAndOralExams(courseName) ? 'foreignLanguage' : null;
}

// ──────────────────────────────────────────────────────────
// RESMİ ŞABLON ALT BİLEŞENLERİ (BİREBİR A4 BASKI)
// ──────────────────────────────────────────────────────────

// 1. TUTANAK.PDF (Sınav Tutanağı)
function TutanakTemplate({ exam, examStudents, schoolInfo }) {
  const count = exam?.ogrenciSayisi || examStudents?.length || 0;
  return (
    <div className="w-full max-w-[210mm] text-black font-sans page-break-inside-avoid print:max-w-none print:w-full">
      <div className="border-2 border-black p-2.5 sm:p-3 relative" style={{ boxShadow: '2px 2px 0px #000' }}>
        {/* Başlık */}
        <div className="text-center pt-1 pb-2">
          <h2 className="text-[11pt] font-bold uppercase tracking-wider">{schoolInfo.valilik}</h2>
          <h1 className="text-[12pt] font-bold uppercase tracking-wide mt-0.5">{schoolInfo.okulAdi}</h1>
        </div>

        {/* Üst Bilgi Tablosu */}
        <table className="w-full text-[9pt] border-collapse border border-black mb-2 print-custom-table">
          <thead>
            <tr className="text-center font-normal">
              <th className="border border-black py-0.5 px-2 font-normal w-1/4 bg-transparent text-black">Öğretim Yılı</th>
              <th className="border border-black py-0.5 px-2 font-normal w-1/4 bg-transparent text-black">Sınav Dönemi</th>
              <th className="border border-black py-0.5 px-2 font-normal w-1/4 bg-transparent text-black">Dersin Adı</th>
              <th className="border border-black py-0.5 px-2 font-normal w-1/4 bg-transparent text-black">Sınav Tarihi</th>
            </tr>
            <tr className="text-center font-bold">
              <td className="border border-black py-1 px-2">{schoolInfo.ogretimYili}</td>
              <td className="border border-black py-1 px-2 uppercase">{schoolInfo.donem}</td>
              <td className="border border-black py-1 px-2 italic uppercase font-serif font-bold text-[9.5pt]">{exam.ders}</td>
              <td className="border border-black py-1 px-2">{exam.tarih || ''}</td>
            </tr>
          </thead>
        </table>

        {/* ── 1. BÖLÜM: SINAV HAZIRLIĞI ── */}
        <div className="border border-black mb-2">
          <table className="w-full text-[8.5pt] border-collapse print-custom-table">
            <tbody>
              <tr>
                <td rowSpan={2} className="border-r border-b border-black w-44 sm:w-48 text-center font-serif font-bold text-[11pt] tracking-wide p-2">
                  SINAV HAZIRLIĞI
                </td>
                <td className="border-r border-b border-black p-1.5 pl-2">Sınav komisyonunun toplandığı saat</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-semibold"></td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-1.5 pl-2 leading-tight">
                  Soruların ve cevap anahtarlarının hazırlanarak sınavın başlama durumuna geldiği saat
                </td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-semibold"></td>
              </tr>
            </tbody>
          </table>

          <div className="p-2 sm:p-2.5 text-[8pt] leading-snug">
            <p>1. Sınav komisyonu okul müdürünün başkanlığında toplanarak ekteki soruları ve cevap anahtarlarını hazırlamıştır.</p>
            <p className="mt-0.5">2. Sınav soru ve cevap anahtarları imzalanıp onaylandıktan sonra birinci nüshaları sınav komisyonu başkanlığına teslim edilmiştir.</p>

            <div className="mt-4 flex justify-between items-start px-6 sm:px-12">
              <div className="text-center">
                <p className="font-bold text-[8.5pt]">{schoolInfo.okulMuduru}</p>
                <p className="text-[7.5pt] mt-0.5">Komisyon Başkanı</p>
                <p className="text-[7.5pt]">{schoolInfo.unvan}</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-[8.5pt] mb-3">Komisyon Üyeleri</p>
                <div className="flex space-x-12 sm:space-x-16 text-center text-[8pt]">
                  <div>
                    <p className="font-bold">{exam.uye1 || '................................'}</p>
                    <p className="text-[7.5pt] text-slate-600">Üye</p>
                  </div>
                  <div>
                    <p className="font-bold">{exam.uye2 || '................................'}</p>
                    <p className="text-[7.5pt] text-slate-600">Üye</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. BÖLÜM: SINAVA BAŞLAMA, KATILMA ve SINAVLA İLGİLİ DİĞER BİLGİLER ── */}
        <div className="border border-black mb-2">
          <table className="w-full text-[8.5pt] border-collapse print-custom-table">
            <tbody>
              <tr>
                <td rowSpan={7} className="border-r border-b border-black w-44 sm:w-48 text-center font-serif font-bold text-[10pt] tracking-wide p-2 leading-tight">
                  SINAVA BAŞLAMA,<br />KATILMA ve<br />SINAVLA İLGİLİ<br />DİĞER BİLGİLER
                </td>
                <td className="border-r border-b border-black p-1 pl-2">Sınavın başladığı saat</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-bold">{exam.saat || ''}</td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-1 pl-2">Sınava katılan öğrenci sayısı</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-semibold"></td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-1 pl-2">Sınava katılmayan öğrenci sayısı</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-semibold"></td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-1 pl-2 font-semibold">Toplam öğrenci sayısı</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-bold text-[9pt]">{count}</td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-1 pl-2">Kullanılan sınav kağıdı sayısı</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-semibold"></td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-1 pl-2">Sınavın sona erdiği saat</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-semibold"></td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-1 pl-2">İncelemenin yapılacağı tarih ve saat</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-semibold"></td>
              </tr>
            </tbody>
          </table>

          <div className="p-2 sm:p-2.5 text-[8pt] leading-snug">
            <p>1. Sınav Yönetmelik hükümlerine göre uygun olarak yürütülmüştür.</p>
            <p className="mt-0.5">2. Bütün sınav evrakı incelemesi yapılmak üzere okul müdürlüğüne teslim edilmiştir.</p>

            <div className="mt-4 flex justify-between items-start px-6 sm:px-12">
              <div className="text-center">
                <p className="font-bold text-[8.5pt]">{schoolInfo.okulMuduru}</p>
                <p className="text-[7.5pt] mt-0.5">Komisyon Başkanı</p>
                <p className="text-[7.5pt]">{schoolInfo.unvan}</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-[8.5pt] mb-3">Komisyon Üyeleri</p>
                <div className="flex space-x-12 sm:space-x-16 text-center text-[8pt]">
                  <div>
                    <p className="font-bold">{exam.uye1 || '................................'}</p>
                    <p className="text-[7.5pt] text-slate-600">Üye</p>
                  </div>
                  <div>
                    <p className="font-bold">{exam.uye2 || '................................'}</p>
                    <p className="text-[7.5pt] text-slate-600">Üye</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. BÖLÜM: İNCELEME VE SONUÇ ── */}
        <div className="border border-black">
          <table className="w-full text-[8.5pt] border-collapse print-custom-table">
            <tbody>
              <tr>
                <td rowSpan={4} className="border-r border-b border-black w-44 sm:w-48 text-center font-serif font-bold text-[11pt] tracking-wide p-2 leading-tight">
                  İNCELEME<br />VE<br />SONUÇ
                </td>
                <td className="border-r border-b border-black p-1 pl-2">İncelemenin yapıldığı tarih ve saat</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-semibold"></td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-1 pl-2">İnceleme sonucu başarılı olan öğrenci sayısı</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-semibold"></td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-1 pl-2">İnceleme sonucu başarısız olan öğrenci sayısı</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-semibold"></td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-1 pl-2 font-semibold">Toplam öğrenci sayısı</td>
                <td className="border-b border-black w-36 sm:w-44 p-1 text-center font-bold text-[9pt]">{count}</td>
              </tr>
            </tbody>
          </table>

          <div className="p-2 sm:p-2.5 text-[8pt] leading-snug">
            <p>1. Sınav evrakı komisyon huzurunda okul müdürüne teslim edilmiştir.</p>

            <div className="mt-4 flex justify-between items-start px-6 sm:px-12">
              <div className="text-center">
                <p className="font-bold text-[8.5pt]">{schoolInfo.okulMuduru}</p>
                <p className="text-[7.5pt] mt-0.5">Komisyon Başkanı</p>
                <p className="text-[7.5pt]">{schoolInfo.unvan}</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-[8.5pt] mb-3">Komisyon Üyeleri</p>
                <div className="flex space-x-12 sm:space-x-16 text-center text-[8pt]">
                  <div>
                    <p className="font-bold">{exam.uye1 || '................................'}</p>
                    <p className="text-[7.5pt] text-slate-600">Üye</p>
                  </div>
                  <div>
                    <p className="font-bold">{exam.uye2 || '................................'}</p>
                    <p className="text-[7.5pt] text-slate-600">Üye</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// 2. SORU.PDF (Sınav Soru Kağıdı)
function SoruKagitTemplate({ exam, schoolInfo }) {
  return (
    <div className="w-full max-w-[210mm] text-black font-sans page-break-inside-avoid print:max-w-none print:w-full flex flex-col justify-between" style={{ minHeight: '270mm' }}>
      <div>
        <div className="text-center space-y-0.5 mb-5">
          <p className="font-bold text-[11pt] tracking-widest font-sans">T.C.</p>
          <p className="font-bold text-[11pt] uppercase tracking-wide">{schoolInfo.valilik}</p>
          <p className="font-bold text-[11pt] uppercase">{schoolInfo.okulAdi}</p>
          <p className="font-normal text-[12pt] uppercase mt-2 tracking-wide font-sans">
            {schoolInfo.ogretimYili} EĞİTİM ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ&nbsp;&nbsp;SORUMLULUK SINAVI
          </p>
          <p className="font-bold text-[10pt] uppercase italic font-serif mt-1">
            {exam.ders} DERSİ SINAV SORULARIDIR..
          </p>
        </div>

        <div className="flex justify-between items-start text-[8.5pt] font-serif mb-2 px-1">
          <div>
            <span className="font-bold">DERSİN ADI: </span>
            <span className="italic font-bold ml-2 uppercase">{exam.ders}</span>
          </div>
          <div className="text-right space-y-1">
            <div>SINAV SÜRESİ: <span className="italic">.............SAAT</span></div>
            <div>SINAV TARİHİ: <span className="font-bold ml-1">{exam.tarih || '........................'}</span></div>
          </div>
        </div>

        <div className="border-t border-black pt-1">
          <p className="font-bold text-[8.5pt] font-serif mb-3">SORULAR:</p>
          <div className="space-y-7 pt-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="text-[9pt] space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="font-bold">{i + 1}.</span>
                  <div className="border-b border-slate-300 flex-1 h-3"></div>
                </div>
                <div className="border-b border-slate-200 w-full h-3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <table className="w-full text-center border-collapse border border-black mb-5 print-custom-table">
          <thead>
            <tr>
              <th colSpan={16} className="border border-black py-1 font-bold text-[8pt] font-sans bg-transparent text-black">
                SORULAR VE PUANLARI
              </th>
            </tr>
            <tr className="font-bold text-[8pt]">
              {Array.from({ length: 15 }, (_, i) => (
                <th key={i} className="border border-black py-1 w-[5.5%] text-center bg-transparent text-black">{i + 1}</th>
              ))}
              <th className="border border-black py-1 text-center font-bold bg-transparent text-black">TOPLAM</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-7 text-[8.5pt]">
              {Array.from({ length: 15 }, (_, i) => (
                <td key={i} className="border border-black"></td>
              ))}
              <td className="border border-black font-bold text-[9pt] align-middle">100</td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-3 text-center text-[8pt] font-serif pt-1">
          <div>
            <p className="font-bold text-[8.5pt]">{schoolInfo.okulMuduru}</p>
            <p className="mt-0.5">Komisyon Başkanı</p>
            <p>{schoolInfo.unvan}</p>
          </div>
          <div>
            <p className="font-bold text-[8.5pt]">{exam.uye1 || '................................'}</p>
            <p className="mt-0.5">Üye</p>
          </div>
          <div>
            <p className="font-bold text-[8.5pt]">{exam.uye2 || '................................'}</p>
            <p className="mt-0.5">Üye</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. CEVAP.PDF (Sınav Cevap Anahtarı)
function CevapAnahtariTemplate({ exam, schoolInfo }) {
  return (
    <div className="w-full max-w-[210mm] text-black font-sans page-break-inside-avoid print:max-w-none print:w-full flex flex-col justify-between" style={{ minHeight: '270mm' }}>
      <div>
        <div className="text-center space-y-0.5 mb-5">
          <p className="font-bold text-[11pt] tracking-widest font-sans">T.C.</p>
          <p className="font-bold text-[11pt] uppercase tracking-wide">{schoolInfo.valilik}</p>
          <p className="font-bold text-[11pt] uppercase">{schoolInfo.okulAdi}</p>
          <p className="font-normal text-[12pt] uppercase mt-2 tracking-wide font-sans">
            {schoolInfo.ogretimYili} EĞİTİM ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ&nbsp;&nbsp;SORUMLULUK SINAVI
          </p>
          <p className="font-bold text-[10pt] uppercase italic font-serif mt-1">
            {exam.ders} DERSİ CEVAP ANAHTARIDIR.
          </p>
        </div>

        <div className="flex justify-between items-start text-[8.5pt] font-serif mb-3 px-1">
          <div>
            <span className="font-bold">DERSİN ADI: </span>
            <span className="italic font-bold ml-2 uppercase">{exam.ders}</span>
          </div>
          <div className="text-right space-y-1">
            <div>SINAV SÜRESİ: <span className="italic">.............SAAT</span></div>
            <div>SINAV TARİHİ: <span className="font-bold ml-1">{exam.tarih || '........................'}</span></div>
          </div>
        </div>

        <table className="w-full text-center border-collapse border border-black mb-4 print-custom-table">
          <thead>
            <tr>
              <th colSpan={16} className="border border-black py-1 font-bold text-[8pt] font-sans bg-transparent text-black">
                SORULAR VE PUANLARI
              </th>
            </tr>
            <tr className="font-bold text-[8pt]">
              {Array.from({ length: 15 }, (_, i) => (
                <th key={i} className="border border-black py-1 w-[5.5%] text-center bg-transparent text-black">{i + 1}</th>
              ))}
              <th className="border border-black py-1 text-center font-bold bg-transparent text-black">TOPLAM</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-7 text-[8.5pt]">
              {Array.from({ length: 15 }, (_, i) => (
                <td key={i} className="border border-black"></td>
              ))}
              <td className="border border-black font-bold text-[9pt] align-middle">100</td>
            </tr>
          </tbody>
        </table>

        <p className="text-justify text-[8pt] leading-relaxed mb-6 px-1 indent-6">
          Aşağıdaki isimlerden oluşan komisyonumuz {exam.tarih ? `${exam.tarih} günü ` : ''}saat {exam.saat ? `${exam.saat}'da ` : ".......... 'da "}okul müdürünün başkanlığında toplanarak: Bakanlığımızca uygulanan Sınıf Geçme ve Sınav Yönetmeliği; Sorumluluk/Ortalama Yükseltme Sınavları ile ilgili olan maddelerini incelemiş, hazırlanan sınav sorularına ait cevaplar aşağıya çıkarılmış olup, yukarıdaki puanlama baremine göre ayrıntılı olarak komisyonumuzca hazırlanmıştır..
        </p>

        <div className="grid grid-cols-3 text-center text-[8pt] font-serif mb-6 px-1">
          <div>
            <p className="font-bold text-[8.5pt]">{schoolInfo.okulMuduru}</p>
            <p className="mt-0.5">Komisyon Başkanı</p>
            <p>{schoolInfo.unvan}</p>
          </div>
          <div>
            <p className="font-bold text-[8.5pt]">{exam.uye1 || '................................'}</p>
            <p className="mt-0.5">Üye</p>
          </div>
          <div>
            <p className="font-bold text-[8.5pt]">{exam.uye2 || '................................'}</p>
            <p className="mt-0.5">Üye</p>
          </div>
        </div>

        <div className="border-t border-black pt-1">
          <p className="font-bold text-[8.5pt] font-serif mb-2">CEVAPLAR:</p>
          <div className="space-y-5 pt-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex items-baseline space-x-2 text-[8.5pt]">
                <span className="font-bold">{i + 1})</span>
                <div className="border-b border-dashed border-slate-300 flex-1 h-3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. SORUTUT.PDF (Sınav Soru Tutanağı)
function SoruTutanakTemplate({ exam, schoolInfo }) {
  return (
    <div className="w-full max-w-[210mm] text-black font-sans page-break-inside-avoid print:max-w-none print:w-full flex flex-col justify-between" style={{ minHeight: '270mm' }}>
      <div>
        <div className="text-center space-y-0.5 mb-4">
          <p className="font-bold text-[8pt] tracking-widest font-sans">T.C.</p>
          <p className="font-bold text-[11pt] uppercase tracking-wide">{schoolInfo.valilik}</p>
          <p className="font-bold text-[11pt] uppercase">{schoolInfo.okulAdi}</p>
          <p className="font-normal text-[12pt] uppercase mt-2 tracking-wide font-sans">
            {schoolInfo.ogretimYili} EĞİTİM ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ&nbsp;&nbsp;SORUMLULUK
          </p>
          <p className="font-normal text-[10pt] uppercase italic font-serif mt-1">
            SINAV SORU TUTANAĞIDIR.
          </p>
        </div>

        <div className="flex justify-between items-start text-[8.5pt] font-serif mb-4 px-1">
          <div>
            <span className="font-bold">DERSİN ADI: </span>
            <span className="italic font-bold ml-2 uppercase">{exam.ders}</span>
          </div>
          <div className="text-right space-y-1">
            <div>SINAV SÜRESİ: <span className="italic">.............SAAT</span></div>
            <div>SINAV TARİHİ: <span className="font-bold ml-1">{exam.tarih || '........................'}</span></div>
          </div>
        </div>

        <p className="text-justify text-[8pt] leading-relaxed mb-6 px-1 indent-6">
          Aşağıdaki isimlerden oluşan komisyonumuz {exam.tarih ? `${exam.tarih} günü ` : ''}saat {exam.saat ? `${exam.saat}'da ` : ".......... 'da "}okul müdürünün başkanlığında toplanarak:  Bakanlığımızca uygulanan Sınıf Geçme ve Sınav Yönetmeliği; Sorumluluk/Ortalama Yükseltme Sınavları ile ilgili  olan  maddelerini incelemiş, yapılan bu incelemeler sonunda dersin konularının bütününü kapsayacak  soru adedi, ünite adları ve sınav soruları aşağıya çıkarılmış olup puanlama baremi aşağıda belirtildiği şekilde kararlaştırılmıştır.
        </p>

        <div className="grid grid-cols-3 text-center text-[8pt] font-serif mb-8 px-1">
          <div>
            <p className="font-bold text-[8.5pt]">{schoolInfo.okulMuduru}</p>
            <p className="mt-0.5">Okul Müdürü</p>
            <p>Komisyon Başkanı</p>
          </div>
          <div>
            <p className="font-bold text-[8.5pt]">{exam.uye1 || '................................'}</p>
            <p className="mt-0.5">Üye</p>
          </div>
          <div>
            <p className="font-bold text-[8.5pt]">{exam.uye2 || '................................'}</p>
            <p className="mt-0.5">Üye</p>
          </div>
        </div>

        <div className="border-t border-black pt-2">
          <div className="flex justify-between items-center text-[8.5pt] font-bold font-serif px-3 mb-2">
            <span>ÜNİTENİN ADI</span>
            <span>SORULACAK SORU ADEDİ</span>
          </div>
          <div className="border-t border-black pt-3 space-y-4">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="flex justify-between items-baseline px-3 text-[8.5pt]">
                <div className="flex items-baseline space-x-2 flex-1 mr-8">
                  <span className="font-bold">{i + 1}.</span>
                  <div className="border-b border-dashed border-slate-300 flex-1 h-3"></div>
                </div>
                <div className="w-24 border-b border-dashed border-slate-300 h-3 text-center"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. ÖĞRENCİ İMZA ÇİZELGESİ (Yoklama Föyü)
function OgrenciImzaTemplate({ exam, examStudents, schoolInfo, datePlaceholder }) {
  const count = exam?.ogrenciSayisi || examStudents?.length || 0;
  return (
    <div className="w-full max-w-[210mm] text-black font-sans page-break-inside-avoid print:max-w-none print:w-full space-y-4">
      <div className="text-center space-y-0.5 pb-2">
        <p className="font-bold text-[10pt] tracking-widest font-sans">T.C.</p>
        <p className="font-bold text-[11pt] uppercase tracking-wide">{schoolInfo.valilik}</p>
        <p className="font-bold text-[12pt] uppercase">{schoolInfo.okulAdi}</p>
        <p className="font-bold text-[10pt] uppercase pt-0.5">
          {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ SORUMLULUK SINAVLARI
        </p>
        <p className="font-extrabold text-[11pt] uppercase font-serif tracking-wide pt-1">
          ÖĞRENCİ SINAV YOKLAMA VE İMZA ÇİZELGESİ
        </p>
      </div>

      <table className="w-full text-[9pt] border-collapse border border-black print-custom-table">
        <tbody>
          <tr>
            <td className="border border-black p-1.5 w-1/2">
              <span className="font-bold">Dersin Adı:</span> <span className="font-bold uppercase font-serif ml-1">{exam.ders}</span>
            </td>
            <td className="border border-black p-1.5 w-1/2">
              <span className="font-bold">Sınav Tarihi:</span> <span className="ml-1">{exam.tarih || datePlaceholder}</span>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1.5">
              <span className="font-bold">Sınıf Seviyesi:</span> <span className="ml-1">{exam.seviye}. Sınıf</span>
            </td>
            <td className="border border-black p-1.5">
              <span className="font-bold">Sınav Saati:</span> <span className="font-bold ml-1">{exam.saat}</span>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1.5">
              <span className="font-bold">Sınav Salonu:</span> <span className="ml-1">{exam.salon}</span>
            </td>
            <td className="border border-black p-1.5">
              <span className="font-bold">Sorumlu Öğrenci Sayısı:</span> <span className="font-bold ml-1">{count}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full text-[9pt] border-collapse border border-black print-custom-table">
        <thead>
          <tr className="bg-slate-100 font-bold text-[8.5pt]">
            <th className="border border-black p-1.5 w-8 text-center">S.No</th>
            <th className="border border-black p-1.5 w-16 text-center">Sınıfı</th>
            <th className="border border-black p-1.5 w-16 text-center">Okul No</th>
            <th className="border border-black p-1.5 text-left pl-2">Öğrencinin Adı Soyadı</th>
            <th className="border border-black p-1.5 w-24 text-center">Kağıt Adedi</th>
            <th className="border border-black p-1.5 w-36 text-center">Öğrenci İmzası</th>
            <th className="border border-black p-1.5 w-28 text-center">Açıklama (Girdi/Girmedi)</th>
          </tr>
        </thead>
        <tbody>
          {(examStudents && examStudents.length > 0 ? examStudents : Array.from({ length: 12 })).map((st, idx) => (
            <tr key={idx} className="h-7 page-break-inside-avoid">
              <td className="border border-black p-1 text-center font-medium">{idx + 1}</td>
              <td className="border border-black p-1 text-center font-semibold">{st?.sinif || ''}</td>
              <td className="border border-black p-1 text-center font-mono">{st?.no || ''}</td>
              <td className="border border-black p-1 font-bold pl-2">{st?.adSoyad || ''}</td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1 text-center text-xs"></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border border-black p-2 text-[8.5pt] flex justify-between items-center bg-slate-50 font-semibold">
        <span>Sınava Giren: ............</span>
        <span>Sınava Girmeyen: ............</span>
        <span>Toplam Sorumlu Öğrenci: {count}</span>
      </div>

      <div className="pt-4 text-[8.5pt] page-break-inside-avoid">
        <p className="text-center font-semibold mb-3">
          Yukarıda adı geçen öğrenciler sınav salonunda hazır bulunmuş ve sınav kağıtlarını teslim ederek imzalarını atmışlardır.
        </p>
        <div className="grid grid-cols-3 text-center gap-4">
          <div>
            <p className="font-bold text-[9pt]">{exam.uye1 || '................................'}</p>
            <p className="text-xs">1. Komisyon Üyesi</p>
            <p className="pt-6">İmza</p>
          </div>
          <div>
            <p className="font-bold text-[9pt]">{exam.uye2 || '................................'}</p>
            <p className="text-xs">2. Komisyon Üyesi</p>
            <p className="pt-6">İmza</p>
          </div>
          <div>
            <p className="font-bold text-[9pt]">{getExamObservers(exam).join(' / ') || '................................'}</p>
            <p className="text-xs">Gözcü / Salon Görevlisi</p>
            <p className="pt-6">İmza</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. ÖĞRENCİ NOT TAKDİR ÇİZELGESİ (Not Föyü)
function OgrenciNotTemplate({ exam, examStudents, schoolInfo, datePlaceholder }) {
  const count = exam?.ogrenciSayisi || examStudents?.length || 0;
  return (
    <div className="w-full max-w-[210mm] text-black font-sans page-break-inside-avoid print:max-w-none print:w-full space-y-4">
      <div className="text-center space-y-0.5 pb-2">
        <p className="font-bold text-[10pt] tracking-widest font-sans">T.C.</p>
        <p className="font-bold text-[11pt] uppercase tracking-wide">{schoolInfo.valilik}</p>
        <p className="font-bold text-[12pt] uppercase">{schoolInfo.okulAdi}</p>
        <p className="font-bold text-[10pt] uppercase pt-0.5">
          {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ SORUMLULUK SINAVLARI
        </p>
        <p className="font-extrabold text-[11pt] uppercase font-serif tracking-wide pt-1">
          ÖĞRENCİ NOT TAKDİR VE DEĞERLENDİRME ÇİZELGESİ
        </p>
      </div>

      <table className="w-full text-[9pt] border-collapse border border-black print-custom-table">
        <tbody>
          <tr>
            <td className="border border-black p-1.5 w-1/2">
              <span className="font-bold">Dersin Adı:</span> <span className="font-bold uppercase font-serif ml-1">{exam.ders}</span>
            </td>
            <td className="border border-black p-1.5 w-1/2">
              <span className="font-bold">Sınav Tarihi:</span> <span className="ml-1">{exam.tarih || datePlaceholder}</span>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1.5">
              <span className="font-bold">Sınıf Seviyesi:</span> <span className="ml-1">{exam.seviye}. Sınıf</span>
            </td>
            <td className="border border-black p-1.5">
              <span className="font-bold">Sınav Saati:</span> <span className="font-bold ml-1">{exam.saat}</span>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1.5">
              <span className="font-bold">Sınav Salonu:</span> <span className="ml-1">{exam.salon}</span>
            </td>
            <td className="border border-black p-1.5">
              <span className="font-bold">Sorumlu Öğrenci Sayısı:</span> <span className="font-bold ml-1">{count}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full text-[9pt] border-collapse border border-black print-custom-table">
        <thead>
          <tr className="bg-slate-100 font-bold text-[8.5pt]">
            <th className="border border-black p-1.5 w-8 text-center">S.No</th>
            <th className="border border-black p-1.5 w-16 text-center">Sınıfı</th>
            <th className="border border-black p-1.5 w-16 text-center">Okul No</th>
            <th className="border border-black p-1.5 text-left pl-2">Öğrencinin Adı Soyadı</th>
            <th className="border border-black p-1.5 w-24 text-center">Notu (Rakam)</th>
            <th className="border border-black p-1.5 w-32 text-center">Notu (Yazıyla)</th>
            <th className="border border-black p-1.5 w-20 text-center">Sonuç Notu</th>
            <th className="border border-black p-1.5 w-24 text-center">Durum (Geçti/Kaldı)</th>
          </tr>
        </thead>
        <tbody>
          {(examStudents && examStudents.length > 0 ? examStudents : Array.from({ length: 12 })).map((st, idx) => (
            <tr key={idx} className="h-7 page-break-inside-avoid">
              <td className="border border-black p-1 text-center font-medium">{idx + 1}</td>
              <td className="border border-black p-1 text-center font-semibold">{st?.sinif || ''}</td>
              <td className="border border-black p-1 text-center font-mono">{st?.no || ''}</td>
              <td className="border border-black p-1 font-bold pl-2">{st?.adSoyad || ''}</td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-center font-bold"></td>
              <td className="border border-black p-1 text-center font-semibold"></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border border-black p-2 text-[8.5pt] flex justify-between items-center bg-slate-50 font-semibold">
        <span>Sınava Giren: ............</span>
        <span>Başarılı (Geçti): ............</span>
        <span>Başarısız (Kaldı): ............</span>
        <span>Toplam: {count}</span>
      </div>

      <p className="text-[8.5pt] text-justify leading-snug pt-1">
        Milli Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği hükümleri gereğince yapılan değerlendirme sonucunda
        yukarıda kimliği yazılı öğrencilerin sınav kağıtları incelenmiş ve takdir edilen notlar çizelgeye işlenmiştir.
      </p>

      <div className="pt-4 text-[8.5pt] page-break-inside-avoid">
        <div className="grid grid-cols-3 text-center gap-4">
          <div>
            <p className="font-bold text-[9pt]">{schoolInfo.okulMuduru}</p>
            <p className="text-xs">Komisyon Başkanı</p>
            <p className="text-[7.5pt]">{schoolInfo.unvan}</p>
            <p className="pt-4">İmza</p>
          </div>
          <div>
            <p className="font-bold text-[9pt]">{exam.uye1 || '................................'}</p>
            <p className="text-xs">1. Komisyon Üyesi</p>
            <p className="text-[7.5pt]">Alan Öğretmeni</p>
            <p className="pt-4">İmza</p>
          </div>
          <div>
            <p className="font-bold text-[9pt]">{exam.uye2 || '................................'}</p>
            <p className="text-xs">2. Komisyon Üyesi</p>
            <p className="text-[7.5pt]">Alan Öğretmeni</p>
            <p className="pt-4">İmza</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. MAKAM OLUR YAZISI (olur.pdf BİREBİR EBYS A4 RESMİ FORMATI)
function MakamOlurTemplate({ schoolInfo, values, uniqueDates }) {
  const valilik = values?.valilik || schoolInfo?.valilik || '';
  const ilceMem = values?.ilceMem || schoolInfo?.ilceMem || 'İl Millî Eğitim Müdürlüğü';
  const okulAdi = values?.okulAdi || schoolInfo?.okulAdi || '';
  const ogretimYili = values?.ogretimYili || schoolInfo?.ogretimYili || '';
  const donem = values?.donem || schoolInfo?.donem || 'Eylül';

  const rawSayi = values?.sayi || schoolInfo?.sayi || '';
  const cleanSayi = rawSayi.replace(/^Sayı\s*:\s*/i, '').trim();
  const sayi = /\.{2,}/.test(cleanSayi) || !cleanSayi ? '' : cleanSayi;

  const tarih = values?.tarih || schoolInfo?.olurTarih || '';

  const defaultKonu = `${ogretimYili} Eğitim - Öğretim Yılı ${donem} Dönemi Sorumluluk Sınavları Ücret Oluru`;
  const rawKonu = values?.konu || schoolInfo?.konu || defaultKonu;
  const cleanKonu = rawKonu.replace(/^Konu\s*:\s*/i, '').trim();
  const konu = /\.{2,}/.test(cleanKonu) || !cleanKonu ? defaultKonu : cleanKonu;

  const sinavTarihAraligi = values?.sinavTarihAraligi || schoolInfo?.sinavTarihAraligi || (
    uniqueDates && uniqueDates.length > 1
      ? `${uniqueDates[0]} - ${uniqueDates[uniqueDates.length - 1]}`
      : ''
  );

  // 1. Kademe İmza (Okul Müdürü)
  const okulMuduru = values?.okulMuduru || schoolInfo?.okulMuduru || '';
  const unvan = values?.unvan || schoolInfo?.unvan || 'Müdür';

  // 2. Kademe İmza (Şube Müdürü)
  const onay2Not = values?.onay2Not || schoolInfo?.onay2 || 'Uygun görüşle arz ederim.';
  const onay2Ad = values?.onay2Ad || schoolInfo?.onay2Ad || '';
  const onay2Makam = values?.onay2Makam || schoolInfo?.onay2Makam || 'Şube Müdürü';

  // 3. Kademe İmza (İl / İlçe Millî Eğitim Müdürü)
  const onay3Not = values?.onay3Not || (schoolInfo?.olurMakam && schoolInfo.olurMakam !== 'Vali' ? schoolInfo.olurMakam : 'OLUR');
  const onay3Ad = values?.onay3Ad || schoolInfo?.onay3Ad || '';
  const onay3Makam = values?.onay3Makam || schoolInfo?.onay3Makam || 'İl Millî Eğitim Müdürü';

  return (
    <div
      className="w-full max-w-[210mm] mx-auto bg-white text-black font-sans page-break-inside-avoid print:max-w-none print:w-full print:p-0 print:m-0 p-6 sm:p-10 shadow-sm border border-slate-200 print:shadow-none print:border-none"
    >
      <div>
        {/* ── ÜST BAŞLIK VE RESMİ LOGOLAR ── */}
        <div className="flex items-center justify-between pt-1 pb-4">
          {/* MEB Hilal-Meşale Logosu */}
          <div className="w-20 flex-shrink-0 flex items-center justify-start">
            <img
              src="/ebys/meb_logo.png"
              alt="T.C. Millî Eğitim Bakanlığı"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Resmi Başlık Metni */}
          <div className="text-center flex-1 px-2 leading-tight">
            <p className="font-bold text-[10.5pt] tracking-widest font-sans">T.C.</p>
            <p className="font-bold text-[11pt] uppercase tracking-wide mt-0.5">{valilik}</p>
            <p className="font-bold text-[10.5pt] tracking-normal mt-0.5">{ilceMem}</p>
            <p className="font-bold text-[10.5pt] tracking-tight mt-0.5">{okulAdi}</p>
          </div>

          {/* Türkiye Yüzyılı 100 Logosu */}
          <div className="w-20 flex-shrink-0 flex items-center justify-end">
            <img
              src="/ebys/yuzyil_logo.png"
              alt="100 Eğitimin Yüzyılı"
              className="h-14 w-auto object-contain"
            />
          </div>
        </div>

        {/* ── SAYI, KONU, TARİH ── */}
        <div className="flex justify-between items-start text-[9.5pt] pt-2 pb-4">
          <div className="space-y-1">
            <p><span className="font-bold">Sayı :</span> {sayi}</p>
            <div className="flex items-start">
              <span className="font-bold whitespace-nowrap mr-1">Konu :</span>
              <span className="max-w-[360px] leading-snug">{konu}</span>
            </div>
          </div>
          <div className="text-right pt-0.5">
            <span className="font-medium text-[10pt]">{tarih}</span>
          </div>
        </div>

        {/* ── HİTAP ── */}
        <div className="text-center font-bold text-[11pt] tracking-wider pt-4 pb-4">
          MÜDÜRLÜK MAKAMINA
        </div>

        {/* ── İLGİ ── */}
        <div className="text-[9pt] leading-relaxed pt-1 pb-3">
          <div className="flex items-start">
            <span className="font-bold w-12 flex-shrink-0">İlgi :</span>
            <div className="space-y-0.5 flex-1">
              <p>a) Milli Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği.</p>
              <p>b) Milli Eğitim Bakanlığı Yönetici ve Öğretmenlerinin Ders ve Ek Ders Saatlerine İlişkin Karar.</p>
              <p>c) 27 Ağustos 2025 tarihli Resmi Gazete'de Yayımlanan Hizmet Kollarına Yönelik Mali ve Sosyal Haklara İlişkin 2026 ve 2027 Yıllarını Kapsayan 8.Dönem Toplu Sözleşme.</p>
            </div>
          </div>
        </div>

        {/* ── GÖVDE METNİ ── */}
        <div className="text-[9.5pt] text-justify leading-relaxed pt-2 space-y-3 font-normal">
          <p className="indent-8">
            3308 sayılı Mesleki Eğitim Kanunu ile ilgi (a) Ortaöğretim Kurumları Yönetmeliğinin 58. maddesi gereğince {ogretimYili} eğitim - öğretim yılı {donem.toLowerCase()} dönemi sorumluluk sınavlarının {sinavTarihAraligi} tarihleri arasında tüm sorumluluk okul müdürlüğünde olmak kaydıyla sınav programı doğrultusunda yapılması, ekli listede adı - soyadı belirtilen personelin sınav komisyonunda görevlendirilmesi ve görevlendirilen komisyon üyelerine ilgi (b) esaslar ilgi (c) sözleşme hükümleri gereğince ücret ödenmesi uygun görülmektedir.
          </p>
          <p className="indent-8">
            Makamlarınızca da uygun görülmesi halinde, olurlarınıza arz ederim.
          </p>
        </div>

        {/* ── 1. KADEME İMZA (SAĞDA OKUL MÜDÜRÜ) ── */}
        <div className="pt-6 flex justify-end">
          <div className="text-center min-w-[170px]">
            <p className="font-bold text-[10pt] uppercase tracking-wide">{okulMuduru}</p>
            <p className="text-[9pt] mt-0.5">{unvan}</p>
          </div>
        </div>

        {/* ── 2. KADEME İMZA (SOLDA ŞUBE MÜDÜRÜ) ── */}
        <div className="pt-5 flex justify-start pl-6">
          <div className="text-center min-w-[190px]">
            <p className="text-[9pt] italic font-medium">{onay2Not}</p>
            <p className="text-[8.5pt] text-slate-600 mt-0.5">{tarih}</p>
            <p className="font-bold text-[10pt] uppercase tracking-wide mt-2">{onay2Ad}</p>
            <p className="text-[9pt] mt-0.5">{onay2Makam}</p>
          </div>
        </div>

        {/* ── 3. KADEME İMZA (ORTADA İL/İLÇE MİLLİ EĞİTİM MÜDÜRÜ) ── */}
        <div className="pt-6 flex justify-center">
          <div className="text-center min-w-[210px]">
            <p className="font-extrabold text-[11pt] tracking-widest">{onay3Not}</p>
            <p className="text-[8.5pt] text-slate-600 mt-0.5">{tarih}</p>
            <p className="font-bold text-[10.5pt] uppercase tracking-wide mt-2">{onay3Ad}</p>
            <p className="text-[9pt] mt-0.5">{onay3Makam}</p>
          </div>
        </div>

        {/* ── EKLER ── */}
        <div className="pt-6 text-[8.5pt] space-y-0.5">
          <p className="font-bold">Ek:</p>
          <p>1 - Sınav Programı (2 Sayfa)</p>
          <p>2 - Ücret Çizelgesi (1 Sayfa)</p>
        </div>
      </div>
    </div>
  );
}


// ──────────────────────────────────────────────────────────
// ANA RAPORLAR GÖRÜNÜMÜ
// ──────────────────────────────────────────────────────────
export default function ReportsView() {
  const {
    schoolInfo,
    teachers,
    students,
    courses,
    schedule,
    teacherStats,
    updateSchoolInfo,
    showToast
  } = useApp();

  const [activeReport, setActiveReport] = useState('tutanak');
  const [selectedExamId, setSelectedExamId] = useState(schedule[0]?.id || null);
  const [selectedTeacherName, setSelectedTeacherName] = useState('all');
  const [selectedDate, setSelectedDate] = useState(schedule[0]?.tarih || '');
  const [preparingGradeReport, setPreparingGradeReport] = useState(null);
  
  // OLUR sekmesi durumu (program | makam_olur | ucret_onay)
  const [olurTab, setOlurTab] = useState('program');
  const [feeReportTab, setFeeReportTab] = useState('program');

  // Yazdırma Kapsamı: 'single' (sadece seçili sınav) veya 'all' (tüm 27 oturum toplu)
  const [printScope, setPrintScope] = useState('single');

  // Makam Olur Düzenleme ve İmzacı Makamlar Durumu
  const sanitizeSayi = (raw) => {
    if (!raw) return '';
    const c = String(raw).replace(/^Sayı\s*:\s*/i, '').trim();
    return /\.{2,}/.test(c) || !c ? '' : c;
  };

  const sanitizeKonu = (raw, y, d) => {
    const fallback = `${y || '............'} Eğitim - Öğretim Yılı ${d || '............'} Dönemi Sorumluluk Sınavları Ücret Oluru`;
    if (!raw) return fallback;
    const c = String(raw).replace(/^Konu\s*:\s*/i, '').trim();
    return /\.{2,}/.test(c) || !c ? fallback : c;
  };

  const [isEditingOlur, setIsEditingOlur] = useState(false);
  const [olurFormData, setOlurFormData] = useState({
    okulMuduru: schoolInfo?.okulMuduru || '',
    unvan: schoolInfo?.unvan || 'Müdür',
    onay2Ad: schoolInfo?.onay2Ad || '',
    onay2Makam: schoolInfo?.onay2Makam || 'Şube Müdürü',
    onay2Not: schoolInfo?.onay2 || 'Uygun görüşle arz ederim.',
    onay3Ad: schoolInfo?.onay3Ad || '',
    onay3Makam: schoolInfo?.onay3Makam || 'İl Millî Eğitim Müdürü',
    onay3Not: (schoolInfo?.olurMakam && schoolInfo.olurMakam !== 'Vali') ? schoolInfo.olurMakam : 'OLUR',
    sayi: sanitizeSayi(schoolInfo?.sayi),
    konu: sanitizeKonu(schoolInfo?.konu, schoolInfo?.ogretimYili, schoolInfo?.donem),
    tarih: schoolInfo?.olurTarih || '',
    sinavTarihAraligi: schoolInfo?.sinavTarihAraligi || '',
    bilgiIcin: schoolInfo?.bilgiIcin || '',
    bilgiUnvan: schoolInfo?.bilgiUnvan || 'Veri Hazırlama ve Kontrol İşletmeni',
    kepAdresi: schoolInfo?.kepAdresi || 'meb@hs01.kep.tr',
    ebysKodu: schoolInfo?.ebysKodu || '',
    valilik: schoolInfo?.valilik || '',
    ilceMem: schoolInfo?.ilceMem || 'İl Millî Eğitim Müdürlüğü',
    okulAdi: schoolInfo?.okulAdi || '',
    ogretimYili: schoolInfo?.ogretimYili || '',
    donem: schoolInfo?.donem || '',
  });

  useEffect(() => {
    if (schoolInfo) {
      setOlurFormData((prev) => ({
        ...prev,
        okulMuduru: schoolInfo.okulMuduru || prev.okulMuduru,
        unvan: schoolInfo.unvan || prev.unvan,
        onay2Ad: schoolInfo.onay2Ad || prev.onay2Ad,
        onay2Makam: schoolInfo.onay2Makam || prev.onay2Makam,
        onay2Not: schoolInfo.onay2 || prev.onay2Not,
        onay3Ad: schoolInfo.onay3Ad || prev.onay3Ad,
        onay3Makam: schoolInfo.onay3Makam || prev.onay3Makam,
        onay3Not: (schoolInfo.olurMakam && schoolInfo.olurMakam !== 'Vali') ? schoolInfo.olurMakam : prev.onay3Not,
        sayi: sanitizeSayi(schoolInfo.sayi) || prev.sayi,
        tarih: schoolInfo.olurTarih || prev.tarih,
        sinavTarihAraligi: schoolInfo.sinavTarihAraligi || prev.sinavTarihAraligi,
        bilgiIcin: schoolInfo.bilgiIcin || prev.bilgiIcin,
        bilgiUnvan: schoolInfo.bilgiUnvan || prev.bilgiUnvan,
        kepAdresi: schoolInfo.kepAdresi || prev.kepAdresi,
        ebysKodu: schoolInfo.ebysKodu || prev.ebysKodu,
        valilik: schoolInfo.valilik || prev.valilik,
        ilceMem: schoolInfo.ilceMem || prev.ilceMem,
        okulAdi: schoolInfo.okulAdi || prev.okulAdi,
        ogretimYili: schoolInfo.ogretimYili || prev.ogretimYili,
        donem: schoolInfo.donem || prev.donem,
      }));
    }
  }, [schoolInfo]);

  const handleSaveOlurSignatories = () => {
    updateSchoolInfo({
      okulMuduru: olurFormData.okulMuduru,
      unvan: olurFormData.unvan,
      onay2Ad: olurFormData.onay2Ad,
      onay2Makam: olurFormData.onay2Makam,
      onay2: olurFormData.onay2Not,
      onay3Ad: olurFormData.onay3Ad,
      onay3Makam: olurFormData.onay3Makam,
      olurMakam: olurFormData.onay3Not,
      sayi: olurFormData.sayi,
      olurTarih: olurFormData.tarih,
      sinavTarihAraligi: olurFormData.sinavTarihAraligi,
      bilgiIcin: olurFormData.bilgiIcin,
      bilgiUnvan: olurFormData.bilgiUnvan,
      kepAdresi: olurFormData.kepAdresi,
      ebysKodu: olurFormData.ebysKodu
    });
    if (showToast) {
      showToast('Makam Olur isimleri ve belge bilgileri başarıyla kaydedildi.');
    }
  };

  const handleResetOlurToPdf = () => {
    const defaults = {
      okulMuduru: '',
      unvan: 'Müdür',
      onay2Ad: '',
      onay2Makam: 'Şube Müdürü',
      onay2Not: 'Uygun görüşle arz ederim.',
      onay3Ad: '',
      onay3Makam: 'İl Millî Eğitim Müdürü',
      onay3Not: 'OLUR',
      sayi: '',
      tarih: '',
      sinavTarihAraligi: '',
      bilgiIcin: '',
      bilgiUnvan: 'Veri Hazırlama ve Kontrol İşletmeni',
      kepAdresi: 'meb@hs01.kep.tr',
      ebysKodu: '',
      valilik: '',
      ilceMem: 'İl Millî Eğitim Müdürlüğü',
      okulAdi: '',
      ogretimYili: '',
      donem: ''
    };
    setOlurFormData(defaults);
    updateSchoolInfo({
      okulMuduru: defaults.okulMuduru,
      unvan: defaults.unvan,
      onay2Ad: defaults.onay2Ad,
      onay2Makam: defaults.onay2Makam,
      onay2: defaults.onay2Not,
      onay3Ad: defaults.onay3Ad,
      onay3Makam: defaults.onay3Makam,
      olurMakam: defaults.onay3Not,
      sayi: defaults.sayi,
      olurTarih: defaults.tarih,
      sinavTarihAraligi: defaults.sinavTarihAraligi,
      bilgiIcin: defaults.bilgiIcin,
      bilgiUnvan: defaults.bilgiUnvan,
      kepAdresi: defaults.kepAdresi,
      ebysKodu: defaults.ebysKodu
    });
    if (showToast) {
      showToast('olur.pdf resmi şablon değerleri yüklendi.');
    }
  };

  const reportsGridRef = useRef(null);

  useEffect(() => {
    if (reportsGridRef.current) {
      staggerEntrance(reportsGridRef.current.children, { delay: 50, staggerDelay: 20 });
    }
  }, []);

  // ──────────────────────────────────────────────────────────
  // RAPOR LİSTELERİ - YUKARIDAKİ VE AŞAĞIDAKİ KUTULAR
  // ──────────────────────────────────────────────────────────
  // Yukarıdaki kutu: 1 - 10 nolu resmi sınav ve zarf evrakları
  const topReports = [
    { id: 'tutanak', label: '1. Sınav Tutanağı', sub: 'tutanak.pdf', icon: FileCheck, color: 'text-rose-600' },
    { id: 'soru_kagit', label: '2. Soru Kağıdı', sub: 'SORU.pdf', icon: BookOpenCheck, color: 'text-indigo-600' },
    { id: 'cevap_anahtari', label: '3. Cevap Anahtarı', sub: 'CEVAP.pdf', icon: Stamp, color: 'text-emerald-600' },
    { id: 'soru_tutanak', label: '4. Soru Tutanağı', sub: 'SoruTut.pdf', icon: ClipboardList, color: 'text-amber-600' },
    { id: 'ogrenci_imza', label: '5. Öğrenci İmza', sub: 'Yoklama Föyü', icon: CheckSquare, color: 'text-cyan-600' },
    { id: 'ogrenci_not', label: '6. Öğrenci Not', sub: 'Takdir Çizelgesi', icon: Users, color: 'text-teal-600' },
    { id: 'ogrenci_duyuru', label: '7. Öğrenci Duyuru', sub: 'Sınav Listesi', icon: GraduationCap, color: 'text-sky-600' },
    { id: 'soru_zarf', label: '8. Soru Zarfı', sub: 'Zarf Etiketi', icon: Package, color: 'text-purple-600' },
    { id: 'cevap_zarf', label: '9. Cevap Zarfı', sub: 'Zarf Etiketi', icon: Package, color: 'text-pink-600' },
    { id: 'genel_zarf', label: '10. Genel Zarf', sub: 'Evrak Zarfı', icon: Layers, color: 'text-slate-600' }
  ];

  // Aşağıdaki kutu: Kalanlar (OLUR Dosyası, Tebliğ, İmza ve Teslim evrakları)
  const bottomReports = [
    {
      id: 'olur_dosyasi',
      label: '⭐ OLUR Dosyası (Makam & Ücret Onayı)',
      sub: 'Sınav Programı, Makam Olur Yazısı ve Ücret Çizelgesi',
      icon: FileBadge,
      color: 'text-purple-600',
      isOlurBox: true
    },
    {
      id: 'ogretmen_teblig',
      label: '11. Öğretmen Görev Tebliğ Belgesi',
      sub: 'Öğretmenlere sınav görevleri ve komisyon/gözcü tebliği',
      icon: Mail,
      color: 'text-amber-600'
    },
    {
      id: 'gunluk_imza',
      label: '12. Günlük Görevli İmza Sirküsü',
      sub: 'Sınav gününde görevlilerin imzalayacağı günlük imza föyü',
      icon: FileText,
      color: 'text-teal-600'
    },
    {
      id: 'teslim_tutanak',
      label: '13. Sınav Evrakı Teslim Tutanağı',
      sub: 'Evrakların okul idaresine toplu teslim ve arşiv tutanağı',
      icon: CheckCircle,
      color: 'text-emerald-600'
    }
  ];

  // ──────────────────────────────────────────────────────────
  // VERİ HESAPLAMALARI
  // ──────────────────────────────────────────────────────────
  const selectedExam = schedule.find((e) => String(e.id) === String(selectedExamId)) || schedule[0] || {};
  
  const getStudentsForExam = (exam) => {
    if (!exam || !exam.ders) return [];
    return students.filter(
      (s) =>
        s.ders &&
        s.ders.toUpperCase() === exam.ders.toUpperCase() &&
        Number(s.seviye) === Number(exam.seviye)
    );
  };

  const currentExamStudents = getStudentsForExam(selectedExam);
  
  const noticeTeachers = selectedTeacherName === 'all'
    ? teacherStats.filter((teacher) => teacher.count > 0)
    : teacherStats.filter((teacher) => teacher.name === selectedTeacherName);
    
  const uniqueDates = Array.from(new Set(schedule.map((ex) => ex.tarih).filter(Boolean))).sort();
  
  const feeTeachers = teacherStats
    .filter((teacher) => teacher.count > 0)
    .map((teacher) => {
      const commissionCount = teacher.assignments.filter((a) => ['1. Üye', '2. Üye'].includes(a.role)).length;
      const invigilationCount = teacher.assignments.filter((a) => ['Gözcü', 'Ek Gözcü'].includes(a.role)).length;
      return { ...teacher, commissionCount, invigilationCount, totalHours: teacher.count * FEE_HOURS_PER_DUTY };
    });
    
  const feeTotals = feeTeachers.reduce(
    (totals, t) => ({
      commissionCount: totals.commissionCount + t.commissionCount,
      invigilationCount: totals.invigilationCount + t.invigilationCount,
      dutyCount: totals.dutyCount + t.count,
      totalHours: totals.totalHours + t.totalHours
    }),
    { commissionCount: 0, invigilationCount: 0, dutyCount: 0, totalHours: 0 }
  );
  
  const academicYearEnd =
    schoolInfo.ogretimYili?.split('-')[1]?.match(/\d{4}/)?.[0] || String(new Date().getFullYear());
  const datePlaceholder = `...../...../${academicYearEnd}`;

  // Resmi şablon mu kontrolü
  const isOfficialTemplate = ['tutanak', 'soru_kagit', 'cevap_anahtari', 'soru_tutanak', 'ogrenci_imza', 'ogrenci_not'].includes(activeReport);
  const isSessionBased = isOfficialTemplate || ['soru_zarf', 'cevap_zarf', 'genel_zarf'].includes(activeReport);

  // Yazdırma işlemi
  const handlePrint = () => {
    window.print();
  };

  // Toplu yazdırma otomasyonu
  const handleBatchPrint = () => {
    setPrintScope('all');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleGradeSheetPrint = async (subject) => {
    const subjectExams = schedule
      .filter((exam) => getGradeSheetSubject(exam.ders) === subject)
      .slice()
      .sort((a, b) => `${a.tarih}_${a.saat}_${a.seviye}_${a.ders}`.localeCompare(
        `${b.tarih}_${b.saat}_${b.seviye}_${b.ders}`,
        'tr-TR'
      ));

    if (!subjectExams.length) {
      const subjectLabel = subject === 'tde' ? 'Türk Dili ve Edebiyatı' : 'Yabancı Dil';
      showToast(`${subjectLabel} için sınav programında oturum bulunamadı.`, 'error');
      return;
    }

    let printWindow = null;
    try {
      printWindow = window.open('about:blank', '_blank');
    } catch (_) {}

    setPreparingGradeReport(subject);
    try {
      const title = subject === 'tde' ? 'Türk Dili ve Edebiyatı' : 'Yabancı Dil';
      const [foreignResponse, speakingResponse] = await Promise.all([
        fetch(foreignGradeSheetTemplateUrl),
        fetch(speakingGradeSheetTemplateUrl)
      ]);
      if (!foreignResponse.ok) {
        throw new Error(`Yabancı dil PDF şablonu yüklenemedi (HTTP ${foreignResponse.status}).`);
      }
      if (!speakingResponse.ok) {
        throw new Error(`Konuşma-dinleme PDF şablonu yüklenemedi (HTTP ${speakingResponse.status}).`);
      }

      const [foreignTemplateBytes, speakingTemplateBytes] = await Promise.all([
        foreignResponse.arrayBuffer(),
        speakingResponse.arrayBuffer()
      ]);
      const report = await createGradeSheetPdf({
        subject,
        exams: subjectExams,
        students,
        schoolInfo,
        foreignTemplateBytes,
        speakingTemplateBytes
      });
      const blob = new Blob([report.bytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);

      if (printWindow && !printWindow.closed) {
        printWindow.location.replace(pdfUrl);
      } else {
        // Doğrudan indirme / tarayıcıda açma desteği
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.target = '_blank';
        link.download = `${title.replace(/\s+/g, '_')}_Uygulama_Notu_Cizelgesi.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 5 * 60 * 1000);
      showToast(`${subjectExams.length} oturum için ${title} PDF'si hazırlandı.`);
    } catch (error) {
      if (printWindow && !printWindow.closed) {
        try { printWindow.close(); } catch (_) {}
      }
      console.error('Dil dersi uygulama notu yazdırma raporu oluşturulamadı:', error);
      showToast(
        error instanceof Error ? error.message : 'Yazdırma raporu oluşturulamadı.',
        'error'
      );
    } finally {
      setPreparingGradeReport(null);
    }
  };

  // ──────────────────────────────────────────────────────────
  // ŞABLON RENDER FONKSİYONU
  // ──────────────────────────────────────────────────────────
  const renderSingleTemplate = (exam) => {
    const examStudents = getStudentsForExam(exam);

    switch (activeReport) {
      case 'tutanak':
        return <TutanakTemplate exam={exam} examStudents={examStudents} schoolInfo={schoolInfo} datePlaceholder={datePlaceholder} />;
      case 'soru_kagit':
        return <SoruKagitTemplate exam={exam} schoolInfo={schoolInfo} />;
      case 'cevap_anahtari':
        return <CevapAnahtariTemplate exam={exam} schoolInfo={schoolInfo} />;
      case 'soru_tutanak':
        return <SoruTutanakTemplate exam={exam} schoolInfo={schoolInfo} />;
      case 'ogrenci_imza':
        return <OgrenciImzaTemplate exam={exam} examStudents={examStudents} schoolInfo={schoolInfo} datePlaceholder={datePlaceholder} />;
      case 'ogrenci_not':
        return <OgrenciNotTemplate exam={exam} examStudents={examStudents} schoolInfo={schoolInfo} datePlaceholder={datePlaceholder} />;
      default:
        return null;
    }
  };

  // ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in-scale">

      {/* Üst Başlık & Yazdırma Butonları */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)' }}>
              <Printer className="w-5 h-5 text-white" />
            </div>
            <span>MEB Sorumluluk Sınavı Rapor &amp; Şablon Merkezi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Resmi PDF şablonları, OLUR onay evrakları ve otomatik toplu yazdırma sistemi
          </p>
        </div>

        {/* Yazdırma Eylemleri */}
        <div className="flex items-center space-x-3">
          {/* Tekil Oturumu Yazdır */}
          <button
            onClick={() => { setPrintScope('single'); setTimeout(handlePrint, 50); }}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer bg-slate-800 hover:bg-slate-900"
          >
            <Printer className="w-4 h-4" />
            <span>Bu Sınavı Yazdır</span>
          </button>

          {/* ⚡ TOPLU YAZICI OTOMASYONU BUTONU */}
          {isSessionBased && (
            <button
              onClick={handleBatchPrint}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer group animate-glow-pulse"
              style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', boxShadow: '0 4px 18px rgba(225,29,72,0.45)' }}
            >
              <Zap className="w-4 h-4 group-hover:scale-125 transition-transform text-amber-300" />
              <span>Tüm Sınavları Toplu Yazdır ({schedule.length} Oturum)</span>
            </button>
          )}
        </div>
      </div>

      {/* ⭐ 1. KUTU: 1 - 10 NOLU SINAV VE ZARF EVRAKLARI */}
      <div className="no-print p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/70 via-amber-50/50 to-orange-50/60 dark:from-rose-950/25 dark:via-amber-950/15 dark:to-orange-950/20 border border-rose-200/80 dark:border-rose-900/40 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {topReports.map((item) => {
            const Icon = item.icon;
            const isSel = activeReport === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { setActiveReport(item.id); setPrintScope('single'); }}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                  isSel
                    ? 'bg-white dark:bg-slate-900 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                    : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-rose-300'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isSel ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 ' + item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className={`font-bold text-xs truncate ${isSel ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TÜRK DİLİ VE YABANCI DİL UYGULAMA NOTU RAPORLARI */}
      <div className="no-print p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-cyan-50/50 to-blue-50/60 dark:from-emerald-950/20 dark:via-cyan-950/15 dark:to-blue-950/20 border border-emerald-200/80 dark:border-emerald-900/40 shadow-sm">
        <div className="mb-2.5">
          <h2 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Uygulama Notu Çizelgeleri</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Programdaki okul, sınav ve öğrenci bilgilerini şablondaki çizelge düzeniyle yazdırın.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {[
            {
              id: 'tde',
              label: 'Türk Dili ve Edebiyatı',
              description: 'Kaynak PDF şablonlarında uygulama ve konuşma-dinleme çizelgeleri',
              icon: BookOpenCheck,
              color: 'emerald'
            },
            {
              id: 'foreignLanguage',
              label: 'Yabancı Dil',
              description: 'Kaynak PDF şablonlarında uygulama ve konuşma-dinleme çizelgeleri',
              icon: FileSpreadsheet,
              color: 'cyan'
            }
          ].map((report) => {
            const Icon = report.icon;
            const isPreparing = preparingGradeReport === report.id;
            return (
              <button
                key={report.id}
                type="button"
                disabled={preparingGradeReport !== null}
                onClick={() => handleGradeSheetPrint(report.id)}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all disabled:opacity-60 disabled:cursor-wait ${
                  report.color === 'emerald'
                    ? 'bg-white/90 dark:bg-slate-900/80 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 hover:shadow-md'
                    : 'bg-white/90 dark:bg-slate-900/80 border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 hover:shadow-md'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className={`p-2 rounded-lg shrink-0 ${
                    report.color === 'emerald'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">{report.label}</span>
                    <span className="block mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{report.description}</span>
                  </span>
                </span>
                <span className={`flex items-center gap-1 shrink-0 text-[10px] font-bold ${
                  report.color === 'emerald' ? 'text-emerald-700 dark:text-emerald-300' : 'text-cyan-700 dark:text-cyan-300'
                }`}>
                  {isPreparing ? 'PDF hazırlanıyor' : 'PDF aç / yazdır'}
                  <Printer className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ⭐ 2. KUTU: KALANLAR (OLUR DOSYASI, TEBLİĞ, İMZA VE TESLİM EVRAKLARI) */}
      <div ref={reportsGridRef} className="no-print p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-slate-50 dark:from-purple-950/25 dark:via-indigo-950/20 dark:to-slate-900/40 border border-purple-200/80 dark:border-purple-900/40 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {bottomReports.map((item) => {
            const Icon = item.icon;
            const isSel = activeReport === item.id;
            const isOlur = item.isOlurBox;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { setActiveReport(item.id); setPrintScope('single'); }}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                  isSel
                    ? (isOlur
                        ? 'bg-white dark:bg-slate-900 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                        : 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20')
                    : (isOlur
                        ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 hover:border-purple-400'
                        : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-indigo-300')
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${
                  isSel
                    ? (isOlur ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white')
                    : (isOlur ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600' : 'bg-slate-100 dark:bg-slate-800 ' + item.color)
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className={`font-bold text-xs truncate ${
                    isSel
                      ? (isOlur ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400')
                      : (isOlur ? 'text-purple-900 dark:text-purple-200' : 'text-slate-800 dark:text-slate-200')
                  }`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rapor Filtreleri & Oturum Seçici */}
      <div className="no-print bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Oturum seçici (Şablonlar ve zarflar için) */}
        {isSessionBased && (
          <div className="flex items-center space-x-2.5">
            <span className="font-bold text-slate-700 dark:text-slate-200">Sınav Oturumu Seç:</span>
            <select
              value={selectedExamId || ''}
              onChange={(e) => { setSelectedExamId(e.target.value); setPrintScope('single'); }}
              disabled={printScope === 'all'}
              className={`px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-xs text-slate-800 dark:text-slate-100 shadow-sm ${printScope === 'all' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {schedule.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.tarih} {ex.saat} – {ex.seviye}. Sınıf {ex.ders} ({ex.ogrenciSayisi || 0} Öğrenci)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Yazdırma Kapsamı Seçici (Tekil vs Toplu) */}
        {isSessionBased && (
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 px-2">Görünüm:</span>
            <button
              type="button"
              onClick={() => setPrintScope('single')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                printScope === 'single'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Tekil Sınav
            </button>
            <button
              type="button"
              onClick={() => setPrintScope('all')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center space-x-1 ${
                printScope === 'all'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Tüm Sınavlar ({schedule.length})</span>
            </button>
          </div>
        )}

        {/* Öğretmen seçici */}
        {activeReport === 'ogretmen_teblig' && (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">Öğretmen:</span>
            <select
              value={selectedTeacherName}
              onChange={(e) => setSelectedTeacherName(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-xs text-slate-800 dark:text-slate-100"
            >
              <option value="all">Tüm Öğretmenler (Toplu Tebliğ)</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>{t.name} ({t.branch})</option>
              ))}
            </select>
          </div>
        )}

        {/* Tarih seçici */}
        {activeReport === 'gunluk_imza' && (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">Sınav Tarihi:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-xs text-slate-800 dark:text-slate-100"
            >
              {uniqueDates.map((d) => <option key={d} value={d}>{d} Günü</option>)}
            </select>
          </div>
        )}

        <div className="text-slate-500 dark:text-slate-400 text-[11px] italic ml-auto flex items-center space-x-2">
          {printScope === 'all' ? (
            <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900">
              ⚡ Toplu Baskı Modu: Toplam {schedule.length} oturum ardışık sayfalanarak yazdırılacak
            </span>
          ) : (
            <span>Sayfa boyutu: A4 • Doğrudan yazdırabilir veya PDF indirebilirsiniz.</span>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* A4 BASKI VE ÖNİZLEME ALANI                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white text-black p-4 sm:p-8 rounded-2xl shadow-xl border border-slate-200 min-h-[920px] print:min-h-0 print:p-0 print:border-none print:shadow-none print:w-full flex flex-col items-center">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* RESMİ PDF ŞABLONLARI (TEKİL VEYA TOPLU BASKI)               */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {isOfficialTemplate && (
          printScope === 'all' ? (
            /* TÜM SINAVLARI TOPLU YAZDIRMA DÖNGÜSÜ */
            <div className="w-full space-y-8 print:space-y-0">
              {schedule.map((exam, idx) => (
                <div
                  key={exam.id}
                  className={`w-full flex justify-center ${idx < schedule.length - 1 ? 'page-break pb-8 print:pb-0' : ''}`}
                >
                  {renderSingleTemplate(exam)}
                </div>
              ))}
            </div>
          ) : (
            /* SEÇİLİ TEK SINAVIN BASKISI */
            <div className="w-full flex justify-center">
              {renderSingleTemplate(selectedExam)}
            </div>
          )
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ⭐ OLUR DOSYASI (PROGRAM + MAKAM OLURU + ÜCRET ONAYI)        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeReport === 'olur_dosyasi' && (
          <div className="w-full space-y-6">
            {/* OLUR İçi Sekmeler */}
            <div className="no-print p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xs text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  OLUR Dosyası Belgeleri:
                </span>
                <div className="flex space-x-1.5">
                  {[
                    { id: 'program', label: '1. Sınav Programı' },
                    { id: 'makam_olur', label: '2. Makam Olur Yazısı' },
                    { id: 'ucret_onay', label: '3. Ücret Çizelgesi' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setOlurTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        olurTab === tab.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-purple-200 dark:border-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Excel Çalışma Kitabı İndirme */}
              <a
                href="/reports/Sorumluluk%20YEN%C4%B0%20HAL%C4%B0.xlsm"
                download="Sorumluluk YENİ HALİ.xlsm"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 flex items-center space-x-1.5 transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resmi Excel Dosyasını İndir (.xlsm)</span>
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* OLUR ALTI 1: GENEL SINAV PROGRAMI */}
            {olurTab === 'program' && (
              <div className="w-full space-y-5">
                <div className="text-center space-y-0.5 pb-2">
                  <p className="font-bold text-[11px]">T.C.</p>
                  <p className="font-bold text-[11px]">{schoolInfo.valilik}</p>
                  <p className="font-bold text-sm">{schoolInfo.okulAdi}</p>
                  <p className="font-bold text-[11px] uppercase pt-0.5">
                    {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ
                  </p>
                  <p className="font-extrabold text-xs uppercase">SORUMLULUK SINAV PROGRAMI ÇİZELGESİ</p>
                </div>
                <table className="w-full text-[11px] border-collapse border border-black">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black p-1.5 w-7 text-center">S.No</th>
                      <th className="border border-black p-1.5 w-20 text-center">Tarih</th>
                      <th className="border border-black p-1.5 w-14 text-center">Saat</th>
                      <th className="border border-black p-1.5 w-16 text-center">Seviye</th>
                      <th className="border border-black p-1.5">Dersin Adı</th>
                      <th className="border border-black p-1.5 w-10 text-center">Öğr.</th>
                      <th className="border border-black p-1.5 w-20">Sınav Yeri</th>
                      <th className="border border-black p-1.5">1. Kom. Üyesi</th>
                      <th className="border border-black p-1.5">2. Kom. Üyesi</th>
                      <th className="border border-black p-1.5">Gözcü/Diğer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((ex, idx) => (
                      <tr key={ex.id} className="page-break-inside-avoid">
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5 text-center font-medium">{ex.tarih}</td>
                        <td className="border border-black p-1.5 text-center font-bold">{ex.saat}</td>
                        <td className="border border-black p-1.5 text-center">{ex.seviye}. Sınıf</td>
                        <td className="border border-black p-1.5 font-bold">{ex.ders}</td>
                        <td className="border border-black p-1.5 text-center">{ex.ogrenciSayisi || 0}</td>
                        <td className="border border-black p-1.5">{ex.salon}</td>
                        <td className="border border-black p-1.5">{ex.uye1 || '-'}</td>
                        <td className="border border-black p-1.5">{ex.uye2 || '-'}</td>
                        <td className="border border-black p-1.5">{getExamObservers(ex).join(', ') || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pt-8 flex justify-between items-end text-xs page-break-inside-avoid">
                  <div className="text-center">
                    <p>Düzenleyen</p>
                    <p className="font-bold pt-1">{schoolInfo.mudurYardimcisi}</p>
                    <p>Müdür Yardımcısı</p>
                  </div>
                  <div className="text-center">
                    <p>{datePlaceholder}</p>
                    <p className="font-bold">UYGUNDUR</p>
                    <p className="font-bold">{schoolInfo.okulMuduru}</p>
                    <p className="pt-1">{schoolInfo.unvan}</p>
                  </div>
                </div>
              </div>
            )}

            {/* OLUR ALTI 2: MAKAM OLUR RESMİ YAZISI (olur.pdf BİREBİR EBYS A4) */}
            {olurTab === 'makam_olur' && (
              <div className="w-full space-y-6">
                {/* ONAY VERECEK İSİMLERİ VE BELGE BİLGİLERİNİ DÜZENLEME PANELİ (SADECE EKRANDA GÖRÜNÜR) */}
                <div className="no-print w-full bg-slate-50 dark:bg-slate-900/90 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-inner">
                        <Edit3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <span>Makam Olur Belgesi ve Onay Verecek İsimler</span>
                          <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-700">
                            olur.pdf EBYS Standardı
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Onay makamlarındaki isimleri, unvanları ve resmi belge bilgilerini buradan güncelleyebilirsiniz
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingOlur(!isEditingOlur)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1.5 transition-all shadow-sm"
                      >
                        <span>{isEditingOlur ? 'Formu Kapat' : 'İsimleri Düzenle'}</span>
                        {isEditingOlur ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={handleResetOlurToPdf}
                        className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center space-x-1.5 transition-all"
                        title="olur.pdf orijinal değerlerine sıfırla"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Şablonu Sıfırla</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveOlurSignatories}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-600/20 flex items-center space-x-1.5 transition-all active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        <span>Sisteme Kaydet</span>
                      </button>
                    </div>
                  </div>

                  {/* Genişletilebilir Düzenleme Formu */}
                  {isEditingOlur && (
                    <div className="pt-4 border-t border-purple-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs animate-in fade-in duration-200">
                      
                      {/* 1. KADEME: OKUL MÜDÜRÜ */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-purple-100 dark:border-slate-700 space-y-2.5">
                        <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-bold border-b border-purple-50 dark:border-slate-700 pb-1.5">
                          <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px]">1</span>
                          <span>Okul Müdürü (Sağ İmza)</span>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Ad Soyad:
                          </label>
                          <input
                            type="text"
                            value={olurFormData.okulMuduru}
                            onChange={(e) => setOlurFormData({ ...olurFormData, okulMuduru: e.target.value })}
                            placeholder="Örn: Ad Soyad"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Unvan:
                          </label>
                          <input
                            type="text"
                            value={olurFormData.unvan}
                            onChange={(e) => setOlurFormData({ ...olurFormData, unvan: e.target.value })}
                            placeholder="Örn: Müdür"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Belge Sayısı (EBYS):
                          </label>
                          <input
                            type="text"
                            value={olurFormData.sayi}
                            onChange={(e) => setOlurFormData({ ...olurFormData, sayi: e.target.value })}
                            placeholder="Örn: E-.........."
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Belge Tarihi:
                          </label>
                          <input
                            type="text"
                            value={olurFormData.tarih}
                            onChange={(e) => setOlurFormData({ ...olurFormData, tarih: e.target.value })}
                            placeholder="Örn: 10.09.2026"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>

                      {/* 2. KADEME: ŞUBE MÜDÜRÜ */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-purple-100 dark:border-slate-700 space-y-2.5">
                        <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 font-bold border-b border-indigo-50 dark:border-slate-700 pb-1.5">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px]">2</span>
                          <span>Şube Müdürü (Sol İmza)</span>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Ad Soyad:
                          </label>
                          <input
                            type="text"
                            value={olurFormData.onay2Ad}
                            onChange={(e) => setOlurFormData({ ...olurFormData, onay2Ad: e.target.value })}
                            placeholder="Örn: Ad Soyad"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Unvan:
                          </label>
                          <input
                            type="text"
                            value={olurFormData.onay2Makam}
                            onChange={(e) => setOlurFormData({ ...olurFormData, onay2Makam: e.target.value })}
                            placeholder="Örn: Şube Müdürü"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Onay Notu:
                          </label>
                          <input
                            type="text"
                            value={olurFormData.onay2Not}
                            onChange={(e) => setOlurFormData({ ...olurFormData, onay2Not: e.target.value })}
                            placeholder="Uygun görüşle arz ederim."
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Sınav Tarih Aralığı:
                          </label>
                          <input
                            type="text"
                            value={olurFormData.sinavTarihAraligi}
                            onChange={(e) => setOlurFormData({ ...olurFormData, sinavTarihAraligi: e.target.value })}
                            placeholder="Örn: 14 - 18 Eylül 2026"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>

                      {/* 3. KADEME: İL / İLÇE MİLLİ EĞİTİM MÜDÜRÜ */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-purple-100 dark:border-slate-700 space-y-2.5">
                        <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-bold border-b border-rose-50 dark:border-slate-700 pb-1.5">
                          <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center text-[10px]">3</span>
                          <span>Millî Eğitim Müdürü (Orta İmza - OLUR)</span>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Ad Soyad:
                          </label>
                          <input
                            type="text"
                            value={olurFormData.onay3Ad}
                            onChange={(e) => setOlurFormData({ ...olurFormData, onay3Ad: e.target.value })}
                            placeholder="Örn: Ad Soyad"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Unvan:
                          </label>
                          <input
                            type="text"
                            value={olurFormData.onay3Makam}
                            onChange={(e) => setOlurFormData({ ...olurFormData, onay3Makam: e.target.value })}
                            placeholder="Örn: İl Millî Eğitim Müdürü"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Karar Başlığı:
                          </label>
                          <input
                            type="text"
                            value={olurFormData.onay3Not}
                            onChange={(e) => setOlurFormData({ ...olurFormData, onay3Not: e.target.value })}
                            placeholder="OLUR"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* RESMİ A4 MAKAM OLUR YAZISI (BİREBİR EBYS BASKI ŞABLONU) */}
                <div className="w-full flex justify-center">
                  <MakamOlurTemplate
                    schoolInfo={schoolInfo}
                    values={olurFormData}
                    uniqueDates={uniqueDates}
                  />
                </div>
              </div>
            )}

            {/* OLUR ALTI 3: ÖĞRETMEN SINAV ÜCRET ÇİZELGESİ */}
            {olurTab === 'ucret_onay' && (
              <div className="w-full space-y-6">
                <div className="text-center space-y-0.5 pb-2">
                  <p className="font-bold text-[11px]">T.C.</p>
                  <p className="font-bold text-[11px]">{schoolInfo.valilik}</p>
                  <p className="font-bold text-sm">{schoolInfo.okulAdi}</p>
                  <p className="font-bold text-[11px] uppercase pt-0.5">
                    {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ
                  </p>
                  <p className="font-extrabold text-xs uppercase">SORUMLULUK SINAVLARI GÖREV VE ÜCRET ÇİZELGESİ</p>
                </div>
                <table className="w-full text-[11px] border-collapse border border-black">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black p-1.5 w-8 text-center">S.No</th>
                      <th className="border border-black p-1.5">Öğretmenin Adı Soyadı</th>
                      <th className="border border-black p-1.5">Branşı</th>
                      <th className="border border-black p-1.5 w-24 text-center">Komisyon Görevi</th>
                      <th className="border border-black p-1.5 w-24 text-center">Gözcülük Görevi</th>
                      <th className="border border-black p-1.5 w-20 text-center">Toplam Görev</th>
                      <th className="border border-black p-1.5 w-24 text-center">Ücret Saati</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeTeachers.map((t, idx) => (
                      <tr key={t.id || idx} className="page-break-inside-avoid">
                        <td className="border border-black p-1 text-center">{idx + 1}</td>
                        <td className="border border-black p-1 font-bold">{t.name}</td>
                        <td className="border border-black p-1">{t.branch}</td>
                        <td className="border border-black p-1 text-center font-semibold">{t.commissionCount}</td>
                        <td className="border border-black p-1 text-center font-semibold">{t.invigilationCount}</td>
                        <td className="border border-black p-1 text-center font-bold">{t.count}</td>
                        <td className="border border-black p-1 text-center font-extrabold text-rose-800">{t.totalHours} Saat</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={3} className="border border-black p-1.5 text-right">TOPLAM:</td>
                      <td className="border border-black p-1.5 text-center">{feeTotals.commissionCount}</td>
                      <td className="border border-black p-1.5 text-center">{feeTotals.invigilationCount}</td>
                      <td className="border border-black p-1.5 text-center">{feeTotals.dutyCount}</td>
                      <td className="border border-black p-1.5 text-center text-rose-800">{feeTotals.totalHours} Saat</td>
                    </tr>
                  </tfoot>
                </table>
                <div className="pt-6 flex justify-between items-end text-xs">
                  <div className="text-center">
                    <p>Hazırlayan</p>
                    <p className="font-bold pt-1">{schoolInfo.mudurYardimcisi}</p>
                    <p>Müdür Yardımcısı</p>
                  </div>
                  <div className="text-center">
                    <p>{datePlaceholder}</p>
                    <p className="font-bold">ONAY</p>
                    <p className="font-bold">{schoolInfo.okulMuduru}</p>
                    <p>{schoolInfo.unvan}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── RAPOR 7: ÖĞRENCİ DUYURU ─── */}
        {activeReport === 'ogrenci_duyuru' && (
          <div className="w-full space-y-5">
            <div className="text-center space-y-0.5 pb-2">
              <p className="font-bold text-[11px]">T.C.</p>
              <p className="font-bold text-[11px]">{schoolInfo.valilik}</p>
              <p className="font-bold text-sm">{schoolInfo.okulAdi}</p>
              <p className="font-bold text-[11px] uppercase pt-0.5">
                {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ
              </p>
              <p className="font-extrabold text-xs uppercase">SORUMLULUK SINAVLARINA GİRECEK ÖĞRENCİ VE SINAV TAKVİMİ DUYURU ÇİZELGESİ</p>
            </div>
            <p className="text-[11px] text-center text-slate-600">
              Öğrencilerin sınav saatinden en az 15 dakika önce sınav salonunda hazır bulunmaları gerekmektedir.
            </p>
            <table className="w-full text-[11px] border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1.5 w-7">S.No</th>
                  <th className="border border-black p-1.5 w-16">Sınıfı</th>
                  <th className="border border-black p-1.5 w-14 text-center">Okul No</th>
                  <th className="border border-black p-1.5">Adı Soyadı</th>
                  <th className="border border-black p-1.5">Sorumlu Ders</th>
                  <th className="border border-black p-1.5 w-14 text-center">Seviye</th>
                  <th className="border border-black p-1.5 w-20 text-center">Tarih</th>
                  <th className="border border-black p-1.5 w-14 text-center">Saat</th>
                  <th className="border border-black p-1.5 w-20">Salon</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => {
                  const examInfo = schedule.find(
                    (ex) => ex.ders && st.ders && ex.ders.toUpperCase() === st.ders.toUpperCase() && Number(ex.seviye) === Number(st.seviye)
                  );
                  return (
                    <tr key={st.id || idx} className="page-break-inside-avoid">
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1 font-bold">{st.sinif}</td>
                      <td className="border border-black p-1 text-center">{st.no}</td>
                      <td className="border border-black p-1 font-bold">{st.adSoyad}</td>
                      <td className="border border-black p-1 font-semibold">{st.ders}</td>
                      <td className="border border-black p-1 text-center">{st.seviye}. Sınıf</td>
                      <td className="border border-black p-1 text-center">{examInfo?.tarih || '-'}</td>
                      <td className="border border-black p-1 text-center font-bold">{examInfo?.saat || '-'}</td>
                      <td className="border border-black p-1">{examInfo?.salon || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="pt-6 text-right text-xs">
              <p className="font-bold">{schoolInfo.okulMuduru}</p>
              <p>{schoolInfo.unvan}</p>
            </div>
          </div>
        )}

        {/* ─── RAPOR 8: SORU ZARFI ETİKETİ ─── */}
        {activeReport === 'soru_zarf' && selectedExam && (
          <div className="w-full max-w-[210mm] space-y-6">
            <div className="border-2 border-black page-break-inside-avoid" style={{ minHeight: '260px' }}>
              <div className="border-b-2 border-black p-3 bg-slate-100 text-center">
                <p className="font-bold text-sm tracking-wide">T.C.</p>
                <p className="font-bold text-sm uppercase">{schoolInfo.valilik}</p>
                <p className="font-bold text-base uppercase">{schoolInfo.okulAdi}</p>
              </div>

              <div className="p-4 text-center border-b-2 border-black">
                <p className="font-extrabold text-2xl tracking-widest">S O R U</p>
                <p className="font-bold text-sm mt-1">Z A R F I</p>
                <p className="text-xs uppercase mt-1">
                  {schoolInfo.ogretimYili} – {schoolInfo.donem} DÖNEMİ SORUMLULUK SINAVI
                </p>
              </div>

              <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <p><span className="font-bold">Dersin Adı :</span></p>
                  <p className="font-extrabold text-base mt-0.5">{selectedExam.ders}</p>
                </div>
                <div>
                  <p><span className="font-bold">Sınıf Seviyesi :</span></p>
                  <p className="font-extrabold text-base mt-0.5">{selectedExam.seviye}. Sınıf</p>
                </div>
                <div>
                  <p><span className="font-bold">Sınav Tarihi :</span></p>
                  <p className="font-semibold">{selectedExam.tarih || datePlaceholder}</p>
                </div>
                <div>
                  <p><span className="font-bold">Sınav Saati :</span></p>
                  <p className="font-semibold">{selectedExam.saat}</p>
                </div>
                <div>
                  <p><span className="font-bold">Sınav Salonu :</span></p>
                  <p className="font-semibold">{selectedExam.salon}</p>
                </div>
                <div>
                  <p><span className="font-bold">Öğrenci Sayısı :</span></p>
                  <p className="font-semibold">{selectedExam.ogrenciSayisi || currentExamStudents.length}</p>
                </div>
              </div>

              <div className="px-4 pb-4 text-sm border-t border-black pt-3">
                <p><span className="font-bold">Komisyon Üyeleri :</span>{' '}
                  {[selectedExam.uye1, selectedExam.uye2].filter(Boolean).join(' – ') || '......................................'}
                </p>
                <p className="mt-1"><span className="font-bold">Gözcü(ler) :</span>{' '}
                  {getExamObservers(selectedExam).join(' – ') || '......................................'}
                </p>
              </div>

              <div className="mx-4 mb-4 border-2 border-dashed border-black p-3 text-center text-xs">
                <p className="font-bold tracking-widest">OKUL MÜHRÜ ve İMZA</p>
                <div style={{ height: '36px' }} />
              </div>
            </div>
          </div>
        )}

        {/* ─── RAPOR 9: CEVAP KAĞIDI ZARFI ETİKETİ ─── */}
        {activeReport === 'cevap_zarf' && selectedExam && (
          <div className="w-full max-w-[210mm] space-y-6">
            <div className="border-2 border-black page-break-inside-avoid" style={{ minHeight: '280px' }}>
              <div className="border-b-2 border-black p-3 bg-slate-100 text-center">
                <p className="font-bold text-sm tracking-wide">T.C.</p>
                <p className="font-bold text-sm uppercase">{schoolInfo.valilik}</p>
                <p className="font-bold text-base uppercase">{schoolInfo.okulAdi}</p>
              </div>

              <div className="p-4 text-center border-b-2 border-black">
                <p className="font-extrabold text-2xl tracking-widest">C E V A P</p>
                <p className="font-bold text-sm mt-0.5">K A Ğ I D I &nbsp; Z A R F I</p>
                <p className="text-xs uppercase mt-1">
                  {schoolInfo.ogretimYili} – {schoolInfo.donem} DÖNEMİ SORUMLULUK SINAVI
                </p>
              </div>

              <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <p><span className="font-bold">Dersin Adı :</span></p>
                  <p className="font-extrabold text-base mt-0.5">{selectedExam.ders}</p>
                </div>
                <div>
                  <p><span className="font-bold">Sınıf Seviyesi :</span></p>
                  <p className="font-extrabold text-base mt-0.5">{selectedExam.seviye}. Sınıf</p>
                </div>
                <div>
                  <p><span className="font-bold">Sınav Tarihi :</span></p>
                  <p className="font-semibold">{selectedExam.tarih || datePlaceholder}</p>
                </div>
                <div>
                  <p><span className="font-bold">Sınav Saati :</span></p>
                  <p className="font-semibold">{selectedExam.saat}</p>
                </div>
                <div>
                  <p><span className="font-bold">Sınav Salonu :</span></p>
                  <p className="font-semibold">{selectedExam.salon}</p>
                </div>
                <div>
                  <p><span className="font-bold">Toplam Öğrenci :</span></p>
                  <p className="font-semibold">{selectedExam.ogrenciSayisi || currentExamStudents.length}</p>
                </div>
              </div>

              <div className="border border-black mx-4 p-3 text-sm space-y-1">
                <p><span className="font-bold">Sınava Giren Öğrenci Sayısı :</span> ..................</p>
                <p><span className="font-bold">Sınava Girmeyen Öğrenci Sayısı :</span> ..................</p>
                <p><span className="font-bold">Zarf İçindeki Cevap Kağıdı Sayısı :</span> ..................</p>
                <p><span className="font-bold">Geçen Öğrenci Sayısı :</span> ........&nbsp;&nbsp;&nbsp;<span className="font-bold">Kalan:</span> ........&nbsp;&nbsp;&nbsp;<span className="font-bold">Devamsız:</span> ........</p>
              </div>

              <div className="px-4 pb-4 pt-3 text-xs">
                <p className="font-bold mb-2">Komisyon Üyeleri ve İmzaları:</p>
                <div className="grid grid-cols-3 text-center gap-4">
                  {[
                    { name: selectedExam.uye1, role: '1. Üye' },
                    { name: selectedExam.uye2, role: '2. Üye' },
                    { name: getExamObservers(selectedExam)[0], role: 'Gözcü' }
                  ].map((p, i) => (
                    <div key={i}>
                      <p className="font-semibold">{p.name || '..............................'}</p>
                      <p>{p.role}</p>
                      <p className="pt-6">İmza</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── RAPOR 10: GENEL SINAV EVRAK ZARFI ─── */}
        {activeReport === 'genel_zarf' && selectedExam && (
          <div className="w-full max-w-[210mm] space-y-6">
            <div className="border-2 border-black page-break-inside-avoid" style={{ minHeight: '300px' }}>
              <div className="border-b-2 border-black p-3 bg-slate-100 text-center">
                <p className="font-bold text-sm">T.C.</p>
                <p className="font-bold text-sm uppercase">{schoolInfo.valilik}</p>
                <p className="font-bold text-base uppercase">{schoolInfo.okulAdi}</p>
              </div>

              <div className="p-4 text-center border-b-2 border-black">
                <p className="font-extrabold text-xl tracking-widest">G E N E L</p>
                <p className="font-bold text-base tracking-widest">S I N A V &nbsp; E V R A K &nbsp; Z A R F I</p>
                <p className="text-xs uppercase mt-1">
                  {schoolInfo.ogretimYili} – {schoolInfo.donem} DÖNEMİ SORUMLULUK SINAVI
                </p>
              </div>

              <div className="p-4 text-sm space-y-2">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  <p><span className="font-bold">Dersin Adı :</span> <span className="font-extrabold">{selectedExam.ders}</span></p>
                  <p><span className="font-bold">Seviye :</span> {selectedExam.seviye}. Sınıf</p>
                  <p><span className="font-bold">Sınav Tarihi :</span> {selectedExam.tarih || datePlaceholder}</p>
                  <p><span className="font-bold">Sınav Saati :</span> {selectedExam.saat}</p>
                  <p><span className="font-bold">Sınav Salonu :</span> {selectedExam.salon}</p>
                  <p><span className="font-bold">Öğrenci Sayısı :</span> {selectedExam.ogrenciSayisi || currentExamStudents.length}</p>
                </div>
                <p><span className="font-bold">Komisyon :</span>{' '}
                  {[selectedExam.uye1, selectedExam.uye2].filter(Boolean).join(' – ') || '......................................'}
                </p>
                <p><span className="font-bold">Gözcü(ler) :</span>{' '}
                  {getExamObservers(selectedExam).join(' – ') || '......................................'}
                </p>
              </div>

              <div className="border border-black mx-4 p-3 text-sm space-y-1">
                <p className="font-bold text-center mb-2">ZARF İÇERİĞİ</p>
                <p>☐ Soru Zarfı (Açılmamış/Mühürlü)</p>
                <p>☐ Cevap Kağıdı Zarfı (İmzalı/Mühürlü)</p>
                <p>☐ Öğrenci Yoklama ve Not Takdir Tutanağı</p>
                <p>☐ Sınav Soru Tutanağı (Soru ve barem)</p>
                <p>☐ Kullanılmayan / Artan Sınav Kağıtları</p>
              </div>

              <div className="px-4 pb-4 pt-3 text-xs">
                <div className="grid grid-cols-2 text-center gap-8 pt-2">
                  <div>
                    <p className="font-bold">TESLİM EDEN</p>
                    <p>{selectedExam.uye1 || '.....................................'}</p>
                    <p>1. Komisyon Üyesi</p>
                    <p className="pt-6">İmza</p>
                  </div>
                  <div>
                    <p className="font-bold">TESLİM ALAN</p>
                    <p className="font-bold">{schoolInfo.mudurYardimcisi || schoolInfo.okulMuduru}</p>
                    <p>Müdür Yrd. / Okul Müdürü</p>
                    <p className="pt-6">İmza</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── RAPOR 11: ÖĞRETMEN TEBLİĞ BELGESİ ─── */}
        {activeReport === 'ogretmen_teblig' && (
          <div className="w-full teblig-report">
            {noticeTeachers.map((t, idx) => (
              <section key={idx} className={`teblig-print-page ${idx < noticeTeachers.length - 1 ? 'teblig-page-break' : ''}`}>
                <div className="teblig-copies">
                  {[0, 1].map((copyIndex) => (
                    <div key={copyIndex} className="teblig-copy">
                      <div className="text-center space-y-0.5">
                        <p className="font-bold text-[10px]">T.C. – {schoolInfo.valilik}</p>
                        <p className="font-bold text-xs uppercase">{schoolInfo.okulAdi}</p>
                        <p className="font-bold text-[10px] uppercase">SORUMLULUK SINAVLARI GÖREV TEBLİĞ BELGESİ</p>
                        <p className="text-[10px]">{schoolInfo.ogretimYili} – {schoolInfo.donem} Dönemi</p>
                      </div>
                      <div className="teblig-copy-text text-[10px]">
                        <p><strong>Sayın:</strong> {t.name} ({t.branch})</p>
                        <p className="text-justify leading-snug mt-1">
                          {schoolInfo.ogretimYili} Eğitim-Öğretim Yılı {schoolInfo.donem} Dönemi Sorumluluk Sınavlarında aşağıda
                          belirtilen gün, saat ve derslerde sınav komisyon üyesi / gözcü olarak görevlendirilmiş bulunmaktasınız.
                          Her oturum için birlikte görev yapacağınız diğer görevliler belirtilmiştir.
                          Sınav evraklarının sınav saatinden 30 dakika önce idareden teslim alınması hususunda bilgilerinizi ve gereğini rica ederim.
                        </p>
                      </div>
                      <table className="teblig-duty-table w-full border-collapse border border-black">
                        <colgroup>
                          <col style={{ width: '5%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '8%' }} />
                          <col style={{ width: '28%' }} />
                          <col style={{ width: '9%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '9%' }} />
                          <col style={{ width: '19%' }} />
                        </colgroup>
                        <thead>
                          <tr className="bg-slate-100">
                            {['S.No', 'Tarih', 'Saat', 'Ders', 'Seviye', 'Yer', 'Görevi', 'Diğer Görevliler'].map((h) => (
                              <th key={h} className="border border-black p-0.5 text-center">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {t.assignments.map((asg, aIdx) => {
                            const exam = schedule.find((item) => String(item.id) === String(asg.examId));
                            const otherStaff = exam ? getExamStaff(exam).filter((n) => n !== t.name).join(', ') : '';
                            return (
                              <tr key={aIdx}>
                                <td className="border border-black p-0.5 text-center">{aIdx + 1}</td>
                                <td className="border border-black p-0.5 text-center">{asg.tarih}</td>
                                <td className="border border-black p-0.5 text-center font-bold">{asg.saat}</td>
                                <td className="border border-black p-0.5 font-bold">{asg.ders}</td>
                                <td className="border border-black p-0.5 text-center">{asg.seviye}. Sınıf</td>
                                <td className="border border-black p-0.5">{asg.salon}</td>
                                <td className="border border-black p-0.5 text-center font-semibold">{asg.role}</td>
                                <td className="border border-black p-0.5">{otherStaff || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="teblig-signatures grid grid-cols-2 pt-2">
                        <div>
                          <p className="font-bold">TEBELLÜĞ EDEN</p>
                          <p>{t.name}</p>
                          <p>İmza: .................</p>
                          <p>Tarih: {datePlaceholder}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">TEBLİĞ EDEN</p>
                          <p className="font-bold">{schoolInfo.okulMuduru}</p>
                          <p>{schoolInfo.unvan}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="teblig-cut-line" aria-hidden="true" />
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ─── RAPOR 12: GÜNLÜK İMZA SİRKÜSÜ ─── */}
        {activeReport === 'gunluk_imza' && (
          <div className="w-full space-y-5">
            <div className="text-center space-y-0.5 pb-2">
              <p className="font-bold text-[11px]">T.C.</p>
              <p className="font-bold text-[11px]">{schoolInfo.valilik}</p>
              <p className="font-bold text-sm">{schoolInfo.okulAdi}</p>
              <p className="font-bold text-[11px] uppercase pt-0.5">
                {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ
              </p>
              <p className="font-extrabold text-xs uppercase">{selectedDate} GÜNÜ SINAV GÖREVLİLERİ İMZA SİRKÜSÜ</p>
            </div>
            <table className="w-full text-[11px] border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1.5 w-7 text-center">S.No</th>
                  <th className="border border-black p-1.5 w-16 text-center">Saat</th>
                  <th className="border border-black p-1.5 w-14 text-center">Seviye</th>
                  <th className="border border-black p-1.5">Dersin Adı</th>
                  <th className="border border-black p-1.5 w-24">Salon</th>
                  <th className="border border-black p-1.5">Görevi</th>
                  <th className="border border-black p-1.5">Görevli Öğretmen</th>
                  <th className="border border-black p-1.5 w-24 text-center">İmza</th>
                </tr>
              </thead>
              <tbody>
                {schedule
                  .filter((ex) => ex.tarih === selectedDate)
                  .flatMap((ex) => [
                    { ...ex, staffName: ex.uye1, staffRole: '1. Komisyon Üyesi' },
                    { ...ex, staffName: ex.uye2, staffRole: '2. Komisyon Üyesi' },
                    ...getExamObservers(ex).map((obs) => ({ ...ex, staffName: obs, staffRole: 'Gözcü' }))
                  ])
                  .filter((item) => item.staffName)
                  .map((item, idx) => (
                    <tr key={idx} className="h-8 page-break-inside-avoid">
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1 text-center font-bold">{item.saat}</td>
                      <td className="border border-black p-1 text-center">{item.seviye}. Sınıf</td>
                      <td className="border border-black p-1 font-bold">{item.ders}</td>
                      <td className="border border-black p-1">{item.salon}</td>
                      <td className="border border-black p-1 text-xs">{item.staffRole}</td>
                      <td className="border border-black p-1 font-semibold">{item.staffName}</td>
                      <td className="border border-black p-1"></td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="pt-6 text-right text-xs">
              <p className="font-bold">{schoolInfo.okulMuduru}</p>
              <p>{schoolInfo.unvan}</p>
            </div>
          </div>
        )}

        {/* ─── RAPOR 13: TESLİM TUTANAĞI ─── */}
        {activeReport === 'teslim_tutanak' && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-0.5 pb-2">
              <p className="font-bold text-[11px]">T.C.</p>
              <p className="font-bold text-[11px]">{schoolInfo.valilik}</p>
              <p className="font-bold text-sm">{schoolInfo.okulAdi}</p>
              <p className="font-bold text-[11px] uppercase pt-0.5">
                {schoolInfo.ogretimYili} EĞİTİM-ÖĞRETİM YILI {schoolInfo.donem} DÖNEMİ
              </p>
              <p className="font-extrabold text-xs uppercase">SORUMLULUK SINAVLARI EVRAK TESLİM VE ARŞİV TUTANAĞI</p>
            </div>
            <p className="text-xs text-justify leading-relaxed">
              {schoolInfo.ogretimYili} Eğitim-Öğretim Yılı {schoolInfo.donem} Dönemi Sorumluluk Sınavlarına ait
              aşağıda listelenen tüm oturumların sınav soru kağıtları, cevap anahtarları, öğrenci cevap kağıtları
              ve sınav tutanakları sınav komisyonlarınca eksiksiz olarak okul idaresine teslim edilmiştir.
            </p>
            <table className="w-full text-[11px] border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1.5 w-7">S.No</th>
                  <th className="border border-black p-1.5 w-20">Tarih</th>
                  <th className="border border-black p-1.5 w-14">Saat</th>
                  <th className="border border-black p-1.5">Dersin Adı</th>
                  <th className="border border-black p-1.5 w-14 text-center">Öğr.</th>
                  <th className="border border-black p-1.5">1. Kom. Üyesi</th>
                  <th className="border border-black p-1.5">2. Kom. Üyesi</th>
                  <th className="border border-black p-1.5 w-20 text-center">Durum</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((ex, idx) => (
                  <tr key={ex.id} className="page-break-inside-avoid">
                    <td className="border border-black p-1 text-center">{idx + 1}</td>
                    <td className="border border-black p-1">{ex.tarih}</td>
                    <td className="border border-black p-1 font-bold">{ex.saat}</td>
                    <td className="border border-black p-1 font-semibold">{ex.ders}</td>
                    <td className="border border-black p-1 text-center">{ex.ogrenciSayisi || 0}</td>
                    <td className="border border-black p-1">{ex.uye1 || '-'}</td>
                    <td className="border border-black p-1">{ex.uye2 || '-'}</td>
                    <td className="border border-black p-1 text-center font-bold text-emerald-800">Teslim Alındı</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pt-8 flex justify-between items-end text-xs">
              <div className="text-center">
                <p>Teslim Eden</p>
                <p className="font-bold pt-1">{schoolInfo.mudurYardimcisi}</p>
                <p>Müdür Yardımcısı</p>
              </div>
              <div className="text-center">
                <p>{datePlaceholder}</p>
                <p className="font-bold">Teslim Alan</p>
                <p className="font-bold">{schoolInfo.okulMuduru}</p>
                <p>{schoolInfo.unvan}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
