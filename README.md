# JJL Troubleshooter (MVP Phase 1)

Self-service troubleshooting agent for JJL Computer Solutions clients. Lives in
the Windows system tray. Triage flow:

  quick local fix  →  n8n/Ollama analysis  →  RustDesk remote (later)

## Status

Phase 1 / v0.1 — only "Restart Print Spooler" is a working real fix. Everything
else gathers diagnostics and flags for technician follow-up. License check
and auto-updater are wired but stubbed (placeholder URLs).

## Dev

```
cd /home/jim/projects/jjl-troubleshooter
npm install
npm start                  # builds main + renderer, launches Electron
```

## Build a Windows installer

Requires the existing Wine64 + electron-builder setup on this CT.

```
LANG=C.UTF-8 LC_ALL=C.UTF-8 npm run package:win
```

Output lands in `dist-installer/`.

## Phase 1 deliberately stubbed

- RustDesk integration — not wired.
- License phone-home — reads local file, logs intent, proceeds.
- Auto-updater — points at a placeholder GitHub repo that doesn't exist.
- n8n webhook URL — defaults to a placeholder; falls back to a mock 200 OK.

## File map

| Path | Purpose |
|---|---|
| `main/main.ts` | Electron entry, tray, window mgmt |
| `main/preload.ts` | contextBridge → `window.jjl` API surface |
| `main/ipc-handlers.ts` | renderer→main action dispatch |
| `main/windows-service.ts` | PowerShell fixes + diagnostics |
| `main/auto-updater.ts` | electron-updater wiring (placeholder feed) |
| `config/license.ts` | reads `%APPDATA%/JJL Troubleshooter/license.json` |
| `config/n8n-webhook.ts` | axios POST wrapper with mock fallback |
| `renderer/App.tsx` | React state machine (idle/running/done) |
| `renderer/TroubleshootingMenu.tsx` | 6 hardcoded categories |
