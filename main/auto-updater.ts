import { app, dialog } from "electron";

export function initAutoUpdater(): void {
  if (!app.isPackaged) {
    console.log("[auto-updater] dev mode — skipping update check");
    return;
  }
  // Defer the require so dev mode doesn't pull in the dep when it isn't needed.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { autoUpdater } = require("electron-updater");

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on("error", (err: Error) => {
      console.log("[auto-updater] error:", err.message);
    });
    autoUpdater.on("update-available", (info: { version: string }) => {
      console.log("[auto-updater] update available:", info.version, "— downloading in background");
    });
    autoUpdater.on("update-not-available", () => {
      console.log("[auto-updater] no update available");
    });
    autoUpdater.on("update-downloaded", (info: { version: string }) => {
      console.log("[auto-updater] update downloaded:", info.version);
      const choice = dialog.showMessageBoxSync({
        type: "info",
        buttons: ["Restart and install", "Later"],
        defaultId: 0,
        cancelId: 1,
        title: "Update Ready",
        message: `JJL Troubleshooter ${info.version} is ready to install.`,
        detail: "Restart now to apply the update, or choose Later and it will install next time the app quits.",
      });
      if (choice === 0) {
        autoUpdater.quitAndInstall();
      }
    });

    autoUpdater.checkForUpdates().catch(() => {
      // already logged via the error event
    });
  } catch (err) {
    console.log("[auto-updater] init failed:", err);
  }
}
