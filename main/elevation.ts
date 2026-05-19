import { app } from "electron";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Returns true if the current process has Windows admin rights.
 * `net session` requires elevation; it exits 0 when elevated, non-zero otherwise.
 * Non-Windows always returns false (admin is a Windows-only concept here).
 */
export async function isElevated(): Promise<boolean> {
  if (process.platform !== "win32") return false;
  try {
    await execFileAsync("net", ["session"], {
      windowsHide: true,
      timeout: 3000,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Relaunch the current Electron app with admin rights via UAC.
 * Uses PowerShell's Start-Process -Verb RunAs which pops the Windows UAC dialog.
 * If the user accepts, a new elevated instance starts; we then quit the current
 * non-elevated instance. If they cancel, nothing happens and we stay running.
 */
export function relaunchAsAdmin(): { triggered: boolean; reason?: string } {
  if (process.platform !== "win32") {
    return { triggered: false, reason: "Not Windows" };
  }
  const exe = process.execPath;
  try {
    const child = spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-WindowStyle",
        "Hidden",
        "-Command",
        `Start-Process -FilePath "${exe}" -Verb RunAs`,
      ],
      { detached: true, stdio: "ignore", windowsHide: true }
    );
    child.unref();
    // Give Windows a moment to fire the UAC prompt before we kill ourselves.
    setTimeout(() => {
      (app as any).isQuitting = true;
      app.quit();
    }, 800);
    return { triggered: true };
  } catch (err) {
    return { triggered: false, reason: (err as Error).message };
  }
}
