import React, { useState } from "react";
import { BookLock, Copy, Check, Terminal } from "lucide-react";

const GOLD = "#C9A84C";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const READ_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/agent/status",
    desc: "Overall status, every node and room with its state, SB688 / SB689 / AVA module states, current ledger head hash, timestamp.",
  },
  {
    method: "GET",
    path: "/api/agent/ledger?limit=N",
    desc: "The most recent N append-only ledger entries. N is 1–200 and defaults to 25.",
  },
  {
    method: "GET",
    path: "/api/agent/health",
    desc: "Uptime, the last verification result, and ledger head.",
  },
];

const CONTROL_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/agent/verify",
    body: "—",
    desc: "Run the system verification / pulse check now and return the result. Audited to the ledger first.",
  },
  {
    method: "POST",
    path: "/api/agent/ledger/append",
    body: '{ "type": "string", "payload": {} }',
    desc: "Append one entry to the append-only ledger. Audited first. Payload is capped at 8000 characters.",
  },
  {
    method: "POST",
    path: "/api/agent/quarantine",
    body: '{ "node_id": 3 }',
    desc: "Move a node into quarantine. Audited first.",
  },
  {
    method: "POST",
    path: "/api/agent/restore",
    body: '{ "node_id": 3 }',
    desc: "Return a node to active duty — only if its braid chain still verifies at 100%. Otherwise 409 and the node stays quarantined.",
  },
];

function EndpointTable({ rows, showBody }) {
  return (
    <div className="space-y-2">
      {rows.map(r => (
        <div key={`${r.method}${r.path}`} className="rounded-xl border p-3 space-y-1.5"
          style={{ borderColor: `${GOLD}18`, background: "rgba(0,0,0,.28)" }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest"
              style={{ background: r.method === "GET" ? "rgba(96,165,250,.15)" : "rgba(240,180,41,.15)", color: r.method === "GET" ? "#60a5fa" : "#f0b429" }}>
              {r.method}
            </span>
            <span className="text-[11px] font-mono break-all" style={{ color: "rgba(232,217,176,.92)" }}>{r.path}</span>
          </div>
          {showBody && (
            <p className="text-[10px] font-mono text-muted-foreground break-all">
              body: {r.body}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">{r.desc}</p>
        </div>
      ))}
    </div>
  );
}

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const text = Array.isArray(children) ? children.join("") : children;

  return (
    <div className="relative">
      <pre className="text-[11px]"><code>{text}</code></pre>
      <button
        onClick={async () => {
          try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
          catch (_) { setCopied(false); }
        }}
        className="absolute top-2 right-2 px-2 py-1 rounded-md text-[9px] font-black uppercase border"
        style={{ color: GOLD, borderColor: `${GOLD}35`, background: "rgba(0,0,0,.6)" }}>
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

export default function AgentApiDocs() {
  const curlStatus = `curl -s \\
  -H "Authorization: Bearer $AGENT_READ_TOKEN" \\
  ${API_BASE}/api/agent/status`;

  const curlVerify = `curl -s -X POST \\
  -H "Authorization: Bearer $AGENT_CONTROL_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{}' \\
  ${API_BASE}/api/agent/verify`;

  const curlAppend = `curl -s -X POST \\
  -H "Authorization: Bearer $AGENT_CONTROL_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"MUSE_NOTE","payload":{"note":"external agent heartbeat"}}' \\
  ${API_BASE}/api/agent/ledger/append`;

  const curlQuarantine = `curl -s -X POST \\
  -H "Authorization: Bearer $AGENT_CONTROL_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"node_id":3}' \\
  ${API_BASE}/api/agent/quarantine`;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="rounded-3xl border p-5 sm:p-6 space-y-3"
        style={{ background: "linear-gradient(135deg,#080808,#111,#0e0c00)", borderColor: `${GOLD}32` }}>
        <div className="flex items-center gap-3">
          <BookLock className="w-7 h-7 flex-shrink-0" style={{ color: GOLD }} />
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: `${GOLD}80` }}>External agent control api</p>
            <h1 className="text-2xl sm:text-4xl font-black font-cinzel gold-shimmer">Agent API</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Server-to-server only. Authenticate with <span className="font-mono" style={{ color: GOLD }}>Authorization: Bearer &lt;token&gt;</span>.
          A missing or invalid token returns 401; the right token with the wrong scope returns 403.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-muted-foreground">Base URL:</span>
          <span className="font-mono rounded-md px-2 py-1" style={{ background: "rgba(0,0,0,.5)", color: GOLD }}>{API_BASE}</span>
          <span className="text-muted-foreground">— this is wherever the console backend runs.</span>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>
          Read endpoints — scope: read
        </h2>
        <EndpointTable rows={READ_ENDPOINTS} />
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>
          Control endpoints — scope: control
        </h2>
        <EndpointTable rows={CONTROL_ENDPOINTS} showBody />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>Examples</h2>
        <p className="text-[11px] text-muted-foreground">Read status:</p>
        <CodeBlock>{curlStatus}</CodeBlock>

        <p className="text-[11px] text-muted-foreground">Run a verification pulse:</p>
        <CodeBlock>{curlVerify}</CodeBlock>

        <p className="text-[11px] text-muted-foreground">Append a ledger entry:</p>
        <CodeBlock>{curlAppend}</CodeBlock>

        <p className="text-[11px] text-muted-foreground">Quarantine a node:</p>
        <CodeBlock>{curlQuarantine}</CodeBlock>
      </section>

      <section className="rounded-2xl border p-4 space-y-2" style={{ background: "#090909", borderColor: `${GOLD}20` }}>
        <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: GOLD }}>Rules the API enforces</p>
        <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-4">
          <li>No endpoint deletes anything. The ledger has no edit or delete path at all.</li>
          <li>No endpoint changes user accounts, passwords, or these API settings. Token management requires a console admin session and is unreachable with an agent token.</li>
          <li>Every control action writes its audit entry — actor <span className="font-mono">muse-external-agent</span>, the action, and the timestamp — before the action runs.</li>
          <li>Failed authentication and scope violations are recorded to the ledger as <span className="font-mono">SECURITY</span> events.</li>
          <li>The API does not self-certify. Verification results are returned as data; certification stays with the governed trust flow.</li>
          <li>Restore re-verifies the node first. A node whose chain is not pristine stays quarantined — repair is owner-only.</li>
          <li>Agent routes are rate limited per IP.</li>
        </ul>
      </section>

      <section className="rounded-2xl border p-4 space-y-2" style={{ background: "#090909", borderColor: `${GOLD}20` }}>
        <p className="text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5" style={{ color: GOLD }}>
          <Terminal className="w-3 h-3" /> Token management
        </p>
        <p className="text-[11px] text-muted-foreground">
          Generate, rotate, and revoke tokens on the Agent Access page. Those routes require a console admin
          session, which is what keeps a leaked agent token from ever reaching the settings that govern it.
        </p>
      </section>
    </div>
  );
}