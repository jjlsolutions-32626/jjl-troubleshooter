import { useEffect, useState } from "react";
import { TroubleshootingMenu, type Action } from "./TroubleshootingMenu";

type State =
  | { kind: "idle" }
  | { kind: "running"; actionLabel: string }
  | { kind: "done"; message: string; output?: string; needsRemote?: boolean };

export function App() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [version, setVersion] = useState<string>("?");
  const [customer, setCustomer] = useState<string | null>(null);
  const [elevated, setElevated] = useState<boolean | null>(null);
  const [relaunching, setRelaunching] = useState(false);

  useEffect(() => {
    void window.jjl.getVersion().then(setVersion);
    void window.jjl.getLicenseStatus().then((s) => setCustomer(s.customer));
    void window.jjl.isElevated().then(setElevated);
  }, []);

  async function runAction(action: Action) {
    setState({ kind: "running", actionLabel: action.label });
    try {
      const fix = await window.jjl.runFix(action.id);
      const diag = await window.jjl.collectDiagnostics();
      const n8n = await window.jjl.sendToN8n({ action: action.id, fix, diagnostics: diag });
      const needsRemote = Boolean(fix.needsRemote || n8n.needsRemote);
      let message: string;
      if (fix.ok && !needsRemote) {
        message = fix.message;
      } else if (needsRemote) {
        message = "I'm ready to connect for remote support. A JJL technician will be in touch shortly.";
      } else {
        message = fix.message;
      }
      setState({ kind: "done", message, output: fix.output, needsRemote });
    } catch (err) {
      setState({
        kind: "done",
        message: `Something went wrong: ${(err as Error).message}`,
        needsRemote: true,
      });
    }
  }

  async function elevate() {
    setRelaunching(true);
    const r = await window.jjl.relaunchAsAdmin();
    if (!r.triggered) {
      setRelaunching(false);
      alert(`Could not request admin rights: ${r.reason ?? "unknown reason"}`);
    }
    // If triggered === true, the app will quit itself shortly and a new
    // elevated instance will appear (or not, if the user cancels UAC).
  }

  return (
    <div className="app">
      <header>
        <h1>JJL Troubleshooter</h1>
        <div className="sub">
          Self-service support for {customer ?? "(unlicensed device)"} · v{version}
          {elevated === true && <span className="elevated-tag"> · admin</span>}
        </div>
      </header>

      {elevated === false && (
        <div className="admin-banner">
          <div>
            <strong>Most fixes need administrator rights.</strong>
            <p>Right now I can collect diagnostics but I can't restart services or change system settings. Click below to restart with admin rights — Windows will ask you to confirm.</p>
          </div>
          <button onClick={elevate} disabled={relaunching}>
            {relaunching ? "Requesting…" : "Restart as Administrator"}
          </button>
        </div>
      )}

      {state.kind === "idle" && (
        <>
          <p className="lead">Pick the issue you're seeing and I'll try the safest fix first.</p>
          <TroubleshootingMenu onPick={runAction} />
        </>
      )}

      {state.kind === "running" && (
        <div className="working">
          <div className="spinner" />
          <p>Working on: <strong>{state.actionLabel}</strong></p>
          <p className="muted">This shouldn't take more than a minute.</p>
        </div>
      )}

      {state.kind === "done" && (
        <div className={`result ${state.needsRemote ? "needs-remote" : "fixed"}`}>
          <h2>{state.needsRemote ? "Connecting you with a technician" : "Fixed!"}</h2>
          <p>{state.message}</p>
          {state.output && (
            <details>
              <summary>Technical details</summary>
              <pre>{state.output}</pre>
            </details>
          )}
          <button onClick={() => setState({ kind: "idle" })}>Try something else</button>
        </div>
      )}
    </div>
  );
}
