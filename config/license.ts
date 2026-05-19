import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

export interface LicenseStatus {
  valid: boolean;
  customer: string | null;
  lastPhoneHome: string | null;
}

function licensePath(): string {
  // Stored in %APPDATA%/JJL Troubleshooter/license.json on Windows
  return path.join(app.getPath("userData"), "license.json");
}

export function readLicense(): LicenseStatus {
  try {
    const p = licensePath();
    if (!fs.existsSync(p)) {
      return { valid: false, customer: null, lastPhoneHome: null };
    }
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    return {
      valid: Boolean(data?.valid),
      customer: data?.customer ?? null,
      lastPhoneHome: data?.lastPhoneHome ?? null,
    };
  } catch (err) {
    console.log("[license] read failed:", (err as Error).message);
    return { valid: false, customer: null, lastPhoneHome: null };
  }
}

/**
 * Phase-1 stub. Real version will POST to the JJL license server every 7-14
 * days, sign the response with a JJL cert, and refuse to run if the response
 * is invalid or too old. For v0.1, just log the intent and proceed.
 */
export function initLicenseCheck(): void {
  const status = readLicense();
  console.log("[license] startup check — file present:", status.valid, "customer:", status.customer);
  console.log("[license] phase-1 stub: skipping phone-home, proceeding regardless.");
}
