import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { registerIpcHandlers } from "./ipc-handlers.js";
import { initLicenseCheck } from "../config/license.js";
import { initAutoUpdater } from "./auto-updater.js";

// Squirrel installer integration (Windows)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const squirrelStartup = (() => {
  try {
    return require("electron-squirrel-startup");
  } catch {
    return false;
  }
})();
if (squirrelStartup) app.quit();

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function getAssetPath(relative: string): string {
  if (isDev) return path.join(__dirname, "..", "..", "assets", relative);
  return path.join(process.resourcesPath, "assets", relative);
}

function createMainWindow(): void {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }
  mainWindow = new BrowserWindow({
    width: 720,
    height: 560,
    show: false,
    resizable: true,
    title: "JJL Troubleshooter",
    icon: getAssetPath("jjl-logo.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const indexHtml = path.join(__dirname, "..", "renderer", "index.html");
  mainWindow.loadFile(indexHtml).catch((err) => {
    console.error("Failed to load renderer:", err);
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers(ipcMain);
  initLicenseCheck();
  initAutoUpdater();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
