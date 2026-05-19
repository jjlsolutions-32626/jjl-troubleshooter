import { app } from "electron";

/**
 * Phase-1 stub. electron-updater wiring is real but the feed URL points at a
 * placeholder GitHub repo that doesn't exist yet, so updates fail silently.
 * Replace with a real provider config once releases are published.
 */
export function initAutoUpdater(): void {
  if (!app.isPackaged) {
    console.log("[auto-updater] dev mode — skipping update check");
    return;
  }
  // Defer the require so dev mode doesn't pull in the dep when it isn't needed.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { autoUpdater } = require("electron-updater");
    autoUpdater.autoDownload = false;
    autoUpdater.on("error", (err: Error) => {
      console.log("[auto-updater] error (expected in v0.1 — feed URL is a placeholder):", err.message);
    });
    autoUpdater.on("update-available", (info: { version: string }) => {
      console.log("[auto-updater] update available:", info.version);
    });
    autoUpdater.on("update-not-available", () => {
      console.log("[auto-updater] no update available");
    });
    autoUpdater.checkForUpdates().catch(() => {
      // already logged via the error event
    });
  } catch (err) {
    console.log("[auto-updater] init failed:", err);
  }
}
