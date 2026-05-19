import axios from "axios";

/**
 * Replace this with the real n8n webhook URL once the workflow is built.
 * Format expected: https://n8n.jjlsolutions.com/webhook/troubleshooter-intake
 */
const N8N_WEBHOOK_URL =
  process.env.JJL_N8N_WEBHOOK_URL ||
  "https://n8n.jjlsolutions.com/webhook/troubleshooter-intake-placeholder";

export interface N8nResponse {
  ok: boolean;
  message?: string;
  needsRemote?: boolean;
}

/**
 * Phase-1 behaviour: try the POST; if it fails (placeholder URL, etc.) return
 * a mock success so the UI flow can be exercised end-to-end on Linux dev.
 */
export async function postToN8n(payload: unknown): Promise<N8nResponse> {
  try {
    const res = await axios.post<N8nResponse>(N8N_WEBHOOK_URL, payload, {
      timeout: 10000,
      validateStatus: () => true,
    });
    if (res.status >= 200 && res.status < 300 && res.data) {
      return res.data;
    }
    console.log("[n8n] POST returned status", res.status, "— falling back to mock");
  } catch (err) {
    console.log("[n8n] POST failed (placeholder URL is expected to 404 in v0.1):", (err as Error).message);
  }
  return {
    ok: true,
    message: "Diagnostics received (mock). A JJL technician will follow up shortly.",
    needsRemote: false,
  };
}
