export interface Action {
  id: string;
  label: string;
  description: string;
}

const ACTIONS: Action[] = [
  {
    id: "restart-print-spooler",
    label: "Printer not working",
    description: "Restart the print queue (Print Spooler service). Safe — only affects printing.",
  },
  {
    id: "slow-system",
    label: "Computer is running slow",
    description: "Gather diagnostics and flag for technician review.",
  },
  {
    id: "flush-dns",
    label: "Can't reach a website",
    description: "Flush DNS cache and renew the network connection.",
  },
  {
    id: "free-disk-space",
    label: "Low disk space warning",
    description: "Look at where the space is going and offer cleanup.",
  },
  {
    id: "restart-print-spooler",
    label: "Restart a stuck service",
    description: "Restart Windows services that may be hung. (Currently: Print Spooler only)",
  },
  {
    id: "general-diagnostics",
    label: "Something else",
    description: "Collect a full diagnostic snapshot for JJL to review.",
  },
];

export function TroubleshootingMenu({ onPick }: { onPick: (a: Action) => void }) {
  return (
    <ul className="menu">
      {ACTIONS.map((a, idx) => (
        <li key={`${a.id}-${idx}`}>
          <button onClick={() => onPick(a)} className="menu-item">
            <span className="menu-item-label">{a.label}</span>
            <span className="menu-item-desc">{a.description}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
