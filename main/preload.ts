import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("jjl", {
  runFix: (actionId: string) => ipcRenderer.invoke("jjl:run-fix", actionId),
  collectDiagnostics: () => ipcRenderer.invoke("jjl:collect-diagnostics"),
  sendToN8n: (payload: unknown) => ipcRenderer.invoke("jjl:send-n8n", payload),
  getVersion: () => ipcRenderer.invoke("jjl:get-version"),
  getLicenseStatus: () => ipcRenderer.invoke("jjl:license-status"),
  isElevated: () => ipcRenderer.invoke("jjl:is-elevated"),
  relaunchAsAdmin: () => ipcRenderer.invoke("jjl:relaunch-as-admin"),
});

declare global {
  interface Window {
    jjl: {
      runFix: (actionId: string) => Promise<FixResult>;
      collectDiagnostics: () => Promise<Diagnostics>;
      sendToN8n: (payload: unknown) => Promise<N8nResponse>;
      getVersion: () => Promise<string>;
      getLicenseStatus: () => Promise<LicenseStatus>;
      isElevated: () => Promise<boolean>;
      relaunchAsAdmin: () => Promise<{ triggered: boolean; reason?: string }>;
    };
  }
}

export interface FixResult {
  ok: boolean;
  message: string;
  output?: string;
  needsRemote?: boolean;
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

export interface N8nResponse {
  ok: boolean;
  message?: string;
  needsRemote?: boolean;
}

export interface LicenseStatus {
  valid: boolean;
  customer: string | null;
  lastPhoneHome: string | null;
}
