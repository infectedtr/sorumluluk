const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronBridge", {
  getHardwareId:    () => ipcRenderer.invoke("get-hardware-id"),
  downloadUpdate:   () => ipcRenderer.invoke("download-update"),
  installUpdate:    () => ipcRenderer.invoke("install-update"),
  checkForUpdate:   () => ipcRenderer.invoke("check-for-update"),
  onUpdateStatus:   (cb) => ipcRenderer.on("update-status", (_, data) => cb(data)),
  offUpdateStatus:  () => ipcRenderer.removeAllListeners("update-status"),
});