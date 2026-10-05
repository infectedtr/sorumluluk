/**
 * MEB Sorumluluk Sinavlari - Supabase Akilli Guncelleme Denetleyicisi
 */
import { createClient } from "@supabase/supabase-js";

export const CURRENT_APP_VERSION = "1.0.1";

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || "https://qwjluzeabyxvlzkfscox.supabase.co";
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_hdmU_P82-KMGCEB3fV1qBw_9M56K6JR";

function getClient() {
  if (!SUPA_URL) return null;
  return createClient(SUPA_URL, SUPA_KEY);
}

export function isNewerVersion(current, latest) {
  if (!latest) return false;
  const c = current.replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  const l = latest.replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(c.length, l.length);
  for (let i = 0; i < len; i++) {
    const cv = c[i] || 0;
    const lv = l[i] || 0;
    if (lv > cv) return true;
    if (lv < cv) return false;
  }
  return false;
}

/**
 * Supabase uzerinden yeni bir surum olup olmadigini kontrol eder.
 * @returns {Promise<{ hasUpdate: boolean, currentVersion: string, latestVersion?: string, releaseNotes?: string, downloadUrl?: string, error?: string }>}
 */
export async function checkOnlineUpdate() {
  const sb = getClient();
  if (!sb) return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION, error: "Veritabani baglantisi yok." };

  try {
    const { data, error } = await sb
      .from("licenses")
      .select("school, owner, notes, active")
      .eq("key", "APP_VERSION_CONFIG")
      .maybeSingle();

    if (error) {
      return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION, error: error.message };
    }

    if (!data || !data.active) {
      return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION };
    }

    const latestVersion = (data.school || "").trim();
    const releaseNotes  = data.owner || "Yeni surum iyilestirmeleri ve duzeltmeler.";
    const downloadUrl   = data.notes || "";

    const hasUpdate = isNewerVersion(CURRENT_APP_VERSION, latestVersion);

    return {
      hasUpdate,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion,
      releaseNotes,
      downloadUrl,
    };
  } catch (err) {
    return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION, error: err.message };
  }
}
