const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const os   = require("os");

// Guvenli Auto-updater yukleme (hata vermez, uygulamayi kitlemez)
let autoUpdater = null;
try {
  const updaterModule = require("electron-updater");
  autoUpdater = updaterModule.autoUpdater;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
} catch (err) {
  console.warn("Auto-updater modulu yuklenemedi (opsiyonel):", err.message);
}

// Hizli, sifir-bekleme ve engellemesiz Donanim ID Uretici
function getHardwareId() {
  try {
    const parts = [];
    const cpu = os.cpus();
    if (cpu && cpu.length > 0) parts.push(cpu[0].model.trim());
    parts.push(os.hostname() || "PC");
    parts.push(os.platform() || "win32");
    parts.push(os.arch() || "x64");
    
    // Benzersiz ag arayuzu MAC adresleri (hizli, 0ms)
    try {
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (!net.internal && net.mac && net.mac !== "00:00:00:00:00:00") {
            parts.push(net.mac);
          }
        }
      }
    } catch (_) {}

    // Hizli hash algoritmasi (djb2)
    let h = 5381;
    const raw = parts.join("|");
    for (let i = 0; i < raw.length; i++) {
      h = ((h << 5) + h) ^ raw.charCodeAt(i);
      h = h >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  } catch {
    return "hw_" + (os.hostname() || "default");
  }
}

const hwId = getHardwareId();
let mainWindow = null;

function setupAutoUpdater() {
  if (!autoUpdater) return;

  autoUpdater.on("checking-for-update", () => {
    mainWindow?.webContents.send("update-status", { type: "checking" });
  });

  autoUpdater.on("update-available", (info) => {
    mainWindow?.webContents.send("update-status", {
      type: "available",
      version: info.version,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on("update-not-available", () => {
    mainWindow?.webContents.send("update-status", { type: "not-available" });
  });

  autoUpdater.on("download-progress", (progress) => {
    mainWindow?.webContents.send("update-status", {
      type: "progress",
      percent: Math.round(progress.percent),
    });
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow?.webContents.send("update-status", { type: "downloaded" });
  });

  autoUpdater.on("error", (err) => {
    // Sessizce konsola logla, kullanici arayuzunu rahatsiz etmesin
    console.warn("Auto-updater bildirimi:", err.message);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "MEB Sorumluluk Sinavlari Yonetim Sistemi",
    icon: path.join(__dirname, "../public/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      sandbox: true,
    },
    autoHideMenuBar: true,
    backgroundColor: "#0f172a",
    show: false, // Ekran beyaz parlamasin, hazir olunca aninda acilsin
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    // Uretim modunda arka planda sessizce guncelleme kontrolu (30 sn sonra)
    setTimeout(() => {
      try {
        if (autoUpdater) autoUpdater.checkForUpdates();
      } catch (_) {}
    }, 30000);
  } else {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // PDF raporlari ve acilir pencereler icin izin ver
    if (url === "about:blank" || url.startsWith("blob:")) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 1024,
          height: 800,
          autoHideMenuBar: true,
          title: "PDF Raporu - MEB Sorumluluk Sinavlari",
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
          },
        },
      };
    }
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });
}

// IPC koprusu
ipcMain.handle("get-hardware-id", () => hwId);

ipcMain.handle("download-update", () => {
  if (autoUpdater) {
    try { autoUpdater.downloadUpdate(); } catch (_) {}
  }
  return true;
});

ipcMain.handle("install-update", () => {
  if (autoUpdater) {
    setImmediate(() => {
      try {
        app.removeAllListeners("window-all-closed");
        autoUpdater.quitAndInstall(false, true);
      } catch (_) {}
    });
  }
  return true;
});

ipcMain.handle("check-for-update", async () => {
  try {
    if (autoUpdater) {
      await autoUpdater.checkForUpdates();
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
});

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});