import type { IpcMain } from "electron";
import { app } from "electron";
import { restartPrintSpooler, collectDiagnostics } from "./windows-service.js";
import { postToN8n } from "../config/n8n-webhook.js";
import { readLicense } from "../config/license.js";
import { isElevated, relaunchAsAdmin } from "./elevation.js";

const FIXES: Record<string, () => Promise<{ ok: boolean; message: string; output?: string; needsRemote?: boolean }>> = {
  "restart-print-spooler": async () => {
    const r = await restartPrintSpooler();
    return r.ok
      ? { ok: true, message: "Print Spooler restarted successfully." }
      : { ok: false, message: r.message, output: r.output, needsRemote: true };
  },
  "free-disk-space": async () => ({
    ok: false,
    message: "Disk-space tooling is not implemented yet. A technician will follow up.",
    needsRemote: true,
  }),
  "flush-dns": async () => ({
    ok: false,
    message: "DNS flush is not implemented yet. A technician will follow up.",
    needsRemote: true,
  }),
  "slow-system": async () => ({
    ok: false,
    message: "Slow-system analysis needs the LLM step (not wired yet). A technician will follow up.",
    needsRemote: true,
  }),
  "general-diagnostics": async () => {
    const diag = await collectDiagnostics();
    return {
      ok: true,
      message: "Diagnostics collected — sending to JJL for review.",
      output: JSON.stringify(diag, null, 2),
    };
  },
};

export function registerIpcHandlers(ipcMain: IpcMain): void {
  ipcMain.handle("jjl:run-fix", async (_event, actionId: string) => {
    const fn = FIXES[actionId];
    if (!fn) {
      return { ok: false, message: `Unknown action: ${actionId}`, needsRemote: true };
    }
    return await fn();
  });

  ipcMain.handle("jjl:collect-diagnostics", async () => {
    return await collectDiagnostics();
  });

  ipcMain.handle("jjl:send-n8n", async (_event, payload) => {
    return await postToN8n(payload);
  });

  ipcMain.handle("jjl:get-version", () => app.getVersion());

  ipcMain.handle("jjl:license-status", () => readLicense());

  ipcMain.handle("jjl:is-elevated", async () => await isElevated());

  ipcMain.handle("jjl:relaunch-as-admin", () => relaunchAsAdmin());
}
