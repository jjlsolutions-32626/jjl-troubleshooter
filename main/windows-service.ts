import { exec } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";

const execAsync = promisify(exec);

const PWSH = "powershell.exe";
const PWSH_ARGS = "-NoProfile -NonInteractive -ExecutionPolicy Bypass -Command";

function isWindows(): boolean {
  return process.platform === "win32";
}

export interface CommandResult {
  ok: boolean;
  message: string;
  output?: string;
}

/**
 * Restart the Windows Print Spooler service.
 * MVP: shells out to PowerShell. Will fail without admin rights — that's
 * expected for v0.1. The renderer turns a failure into "needs remote support".
 */
export async function restartPrintSpooler(): Promise<CommandResult> {
  if (!isWindows()) {
    return {
      ok: false,
      message: `Print Spooler restart is Windows-only (current platform: ${process.platform}). Stubbed for dev.`,
    };
  }
  try {
    const { stdout, stderr } = await execAsync(
      `${PWSH} ${PWSH_ARGS} "Restart-Service -Name Spooler -Force -ErrorAction Stop; Write-Host 'spooler-restarted'"`,
      { timeout: 20000 }
    );
    const combined = (stdout + stderr).trim();
    if (combined.includes("spooler-restarted")) {
      return { ok: true, message: "Print Spooler restarted.", output: combined };
    }
    return {
      ok: false,
      message: "Restart did not report success. Likely missing admin rights.",
      output: combined,
    };
  } catch (err) {
    const e = err as { stderr?: string; message?: string };
    return {
      ok: false,
      message: "Restart-Service failed. The user may need to run as administrator.",
      output: e.stderr || e.message,
    };
  }
}

export interface Diagnostics {
  platform: string;
  os: string;
  hostname: string;
  diskFreeGB?: number;
  diskTotalGB?: number;
  servicesSnapshot?: string;
  recentEventErrors?: string;
  collectedAt: string;
}

export async function collectDiagnostics(): Promise<Diagnostics> {
  const base: Diagnostics = {
    platform: process.platform,
    os: `${os.type()} ${os.release()}`,
    hostname: os.hostname(),
    collectedAt: new Date().toISOString(),
  };

  if (!isWindows()) {
    return base;
  }

  // Run the data-collection commands in parallel. Each one is best-effort.
  const drive = execAsync(
    `${PWSH} ${PWSH_ARGS} "$d = Get-PSDrive C -ErrorAction SilentlyContinue; if ($d) { @{ free = [math]::Round($d.Free/1GB,2); used = [math]::Round($d.Used/1GB,2); total = [math]::Round(($d.Free+$d.Used)/1GB,2) } | ConvertTo-Json -Compress }"`,
    { timeout: 10000 }
  ).catch(() => null);

  const svc = execAsync(
    `${PWSH} ${PWSH_ARGS} "Get-Service | Where-Object {$_.Status -eq 'Running'} | Select-Object -First 30 Name, DisplayName | ConvertTo-Json -Compress"`,
    { timeout: 10000 }
  ).catch(() => null);

  const events = execAsync(
    `${PWSH} ${PWSH_ARGS} "Get-EventLog -LogName System -Newest 10 -EntryType Error -ErrorAction SilentlyContinue | Select-Object TimeGenerated, Source, EventID, Message | ConvertTo-Json -Compress"`,
    { timeout: 15000 }
  ).catch(() => null);

  const [driveRes, svcRes, eventsRes] = await Promise.all([drive, svc, events]);

  if (driveRes?.stdout) {
    try {
      const parsed = JSON.parse(driveRes.stdout);
      base.diskFreeGB = parsed.free;
      base.diskTotalGB = parsed.total;
    } catch {
      // ignore
    }
  }
  if (svcRes?.stdout) base.servicesSnapshot = svcRes.stdout.trim();
  if (eventsRes?.stdout) base.recentEventErrors = eventsRes.stdout.trim();

  return base;
}
