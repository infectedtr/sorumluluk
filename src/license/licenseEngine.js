/**
 * MEB Sorumluluk Sinavlari - Online Lisans Motoru v2.0
 * Supabase uzerinden dogrulama + 7 gunluk offline cache
 */

import { createClient } from "@supabase/supabase-js";

// Supabase baglantisi (Vite env degiskenleri)
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

function getSupabase() {
  if (!SUPA_URL || SUPA_URL.includes("BURAYA")) return null;
  return createClient(SUPA_URL, SUPA_KEY);
}

// LocalStorage anahtarlari
const LS_LICENSE = "mebss_lic_v2";
const LS_CACHE   = "mebss_cache_v2";

const CACHE_DAYS = 7; // offline tolerans (gun)

// ─── Yardimci ────────────────────────────────────────────────────────────────

function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

const B32 = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function toBase32(num) {
  let r = "";
  for (let i = 0; i < 8; i++) { r = B32[num % 32] + r; num = Math.floor(num / 32); }
  return r;
}

/** Donanim parmak izi: Electron ortaminda CPU+Disk, web fallback */
export async function getHardwareFingerprint() {
  if (window.electronBridge?.getHardwareId) {
    try {
      const id = await window.electronBridge.getHardwareId();
      if (id && id !== "fallback0") return id;
    } catch (_) {}
  }
  const parts = [
    navigator.hardwareConcurrency || "4",
    navigator.language || "tr",
    screen.width + "x" + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.platform || "Win32",
  ];
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("MEB-2026", 2, 15);
    parts.push(canvas.toDataURL().slice(-40));
  } catch (_) {}
  return djb2(parts.join("|")).toString(16).padStart(8, "0");
}

// ─── Lisans Format Kontrolu ───────────────────────────────────────────────────

export function validateLicenseFormat(key) {
  if (!key || typeof key !== "string") return { ok: false, reason: "Lisans anahtarı boş bırakılamaz." };
  const cleanKey = key.trim().toUpperCase().replace(/\s/g, "");
  const parts = cleanKey.split("-");
  
  if (parts.length < 4 || parts.length > 5) {
    return { ok: false, reason: "Geçersiz format. Örn: MEBSS-2026-XXXX-XXXX veya MEBSS-XXXX-XXXX-XXXX-XXXX" };
  }
  
  const prefix = parts[0];
  if (prefix !== "MEBSS" && prefix !== "PROJ") {
    return { ok: false, reason: "Lisans anahtarı 'MEBSS' veya 'PROJ' ile başlamalıdır." };
  }

  return { ok: true, cleanKey };
}

// ─── Supabase Online Dogrulama (RPC + HWID Kilitleme) ───────────────────────────

async function checkOnline(licenseKey) {
  const sb = getSupabase();
  if (!sb) return { online: false, reason: "Supabase bağlantısı yapılandırılmamış." };

  try {
    const cleanKey = licenseKey.trim().toUpperCase();
    const hwid = await getHardwareFingerprint();

    // 1. Öncelikli olarak Stored RPC 'verify_license' çağır (HWID kilitleme dahil)
    const { data: rpcRes, error: rpcErr } = await sb.rpc("verify_license", {
      p_license_key: cleanKey,
      p_hwid: hwid
    });

    if (!rpcErr && rpcRes) {
      if (rpcRes.valid) {
        return {
          online: true,
          valid: true,
          school: rpcRes.school || rpcRes.school_name || "MEB Okulu",
          owner: rpcRes.owner || rpcRes.school,
          planType: rpcRes.plan_type || "ANNUAL",
          expiresAt: rpcRes.expires_at,
          message: rpcRes.message || "Lisans başarıyla doğrulandı."
        };
      } else {
        return {
          online: true,
          valid: false,
          reason: rpcRes.message || "Lisans doğrulanamadı."
        };
      }
    }

    // 2. RPC yoksa veya hata verdiyse Geriye Dönük Uyumluluk (Legacy Tablo Sorgusu)
    const { data, error } = await sb
      .from("licenses")
      .select("id, key, school, owner, active, is_active, hwid, expires_at")
      .or(`key.eq.${cleanKey},license_key.eq.${cleanKey}`)
      .maybeSingle();

    if (error) return { online: false, reason: "Sunucu hatası: " + error.message };
    if (!data) return { online: true, valid: false, reason: "Bu lisans anahtarı sistemde kayıtlı değil." };
    
    const isActive = data.active !== undefined ? data.active : data.is_active;
    if (isActive === false) {
      return { online: true, valid: false, reason: "Bu lisans iptal edilmiştir. Lütfen satıcıyla iletişime geçin." };
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { online: true, valid: false, reason: "Lisans süreniz dolmuştur." };
    }

    // HWID Kontrolü (Legacy)
    if (!data.hwid) {
      await sb.from("licenses").update({ hwid: hwid, last_check: new Date().toISOString() }).eq("id", data.id);
    } else if (data.hwid !== hwid) {
      return { online: true, valid: false, reason: "Bu lisans başka bir bilgisayarda aktif edilmiştir! (HWID Uyuşmazlığı)" };
    } else {
      await sb.from("licenses").update({ last_check: new Date().toISOString() }).eq("id", data.id);
    }

    return {
      online: true,
      valid: true,
      school: data.school || "MEB Okulu",
      owner: data.owner,
      expiresAt: data.expires_at
    };
  } catch (err) {
    return { online: false, reason: "Bağlantı hatası: " + err.message };
  }
}

// ─── Cache Yönetimi ───────────────────────────────────────────────────────────

function saveCache(licenseKey, school, owner, planType, expiresAt) {
  localStorage.setItem(LS_CACHE, JSON.stringify({
    key: licenseKey,
    school,
    owner,
    planType,
    expiresAt: expiresAt || new Date(Date.now() + CACHE_DAYS * 86400000).toISOString(),
    checkedAt: new Date().toISOString(),
  }));
}

function loadCache() {
  try {
    const raw = localStorage.getItem(LS_CACHE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function isCacheValid(cache, licenseKey) {
  if (!cache) return false;
  if (cache.key !== licenseKey.trim().toUpperCase()) return false;
  return new Date(cache.expiresAt) > new Date();
}

// ─── Ana Doğrulama Fonksiyonu ─────────────────────────────────────────────────

/**
 * Lisansı doğrula: önce online (HWID ile), başarısız olursa çevrimdışı cache'e bak.
 * @returns {{ valid: boolean, reason: string, school?: string, offline?: boolean }}
 */
export async function validateLicense(licenseKey) {
  const fmt = validateLicenseFormat(licenseKey);
  if (!fmt.ok) return { valid: false, reason: fmt.reason };

  const cleanKey = fmt.cleanKey;

  // 1. Online kontrol dene (HWID ile)
  const online = await checkOnline(cleanKey);

  if (online.online) {
    if (online.valid) {
      saveCache(cleanKey, online.school, online.owner, online.planType, online.expiresAt);
      return {
        valid: true,
        reason: online.message || "Lisans geçerli.",
        school: online.school,
        expiresAt: online.expiresAt
      };
    } else {
      // Online onaylanmadı - cache'i temizle
      localStorage.removeItem(LS_CACHE);
      return { valid: false, reason: online.reason };
    }
  }

  // 2. İnternet yok — çevrimdışı cache'e bak
  const cache = loadCache();
  if (isCacheValid(cache, cleanKey)) {
    const daysLeft = Math.ceil((new Date(cache.expiresAt) - new Date()) / 86400000);
    return {
      valid: true,
      offline: true,
      reason: `Çevrimdışı mod (${daysLeft} gün kaldı).`,
      school: cache.school,
    };
  }

  // 3. Ne online ne cache
  return {
    valid: false,
    reason: online.reason || `İnternet bağlantısı yok ve ${CACHE_DAYS} günlük çevrimdışı süre doldu. Lütfen internete bağlanın.`,
  };
}

// ─── LocalStorage ─────────────────────────────────────────────────────────────

export function saveLicense(key) {
  localStorage.setItem(LS_LICENSE, JSON.stringify({
    key: key.trim().toUpperCase(),
    savedAt: new Date().toISOString(),
    version: "2.5",
  }));
}

export function loadLicense() {
  try {
    const raw = localStorage.getItem(LS_LICENSE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearLicense() {
  localStorage.removeItem(LS_LICENSE);
  localStorage.removeItem(LS_CACHE);
}