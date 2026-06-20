import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const GOLD = "#C9A84C";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: "jgaos2026@outlook.com",
      subject: `JGA Contact Form — ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
    });
    setSent(true);
    setSending(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">

        {/* Header */}
        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.5em] uppercase font-bold" style={{ color: `${GOLD}60` }}>
            Contact
          </p>
          <h1 className="text-3xl sm:text-4xl font-black font-cinzel leading-tight" style={{ color: GOLD }}>
            Contact JGA Enterprises
          </h1>
          <div className="h-px max-w-xs" style={{ background: `linear-gradient(90deg, ${GOLD}60, transparent)` }} />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ready to start a project, ask about the system, or connect with Jay directly? Reach out below.
          </p>
        </div>

        {/* Direct contact methods */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Phone", value: "779-396-6934", href: "tel:7793966934", icon: "📞" },
            { label: "Email", value: "jgaos2026@outlook.com", href: "mailto:jgaos2026@outlook.com", icon: "✉️" },
            { label: "Location", value: "Mendota, IL", href: null, icon: "📍" },
          ].map((c, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-1 text-center"
              style={{ background: "linear-gradient(135deg, #0e0c00, #111111)", borderColor: `${GOLD}22` }}>
              <div className="text-xl">{c.icon}</div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{c.label}</p>
              {c.href
                ? <a href={c.href} className="text-xs font-bold block hover:opacity-75 transition" style={{ color: GOLD }}>{c.value}</a>
                : <p className="text-xs font-bold" style={{ color: GOLD }}>{c.value}</p>
              }
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="rounded-2xl border p-6 sm:p-8 space-y-5"
          style={{ background: "linear-gradient(135deg, #0e0c00, #111111)", borderColor: `${GOLD}28` }}>
          <h2 className="text-sm font-black font-cinzel" style={{ color: GOLD }}>Send a Message</h2>

          {sent ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-2xl">✅</p>
              <p className="font-black" style={{ color: GOLD }}>Message sent.</p>
              <p className="text-xs text-muted-foreground">Jay will respond as soon as possible. Thank you for reaching out.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none border"
                  style={{ background: "#0a0a0a", borderColor: `${GOLD}25`, color: "rgba(232,217,176,0.88)" }}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Your Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none border"
                  style={{ background: "#0a0a0a", borderColor: `${GOLD}25`, color: "rgba(232,217,176,0.88)" }}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none border resize-none"
                  style={{ background: "#0a0a0a", borderColor: `${GOLD}25`, color: "rgba(232,217,176,0.88)" }}
                  placeholder="Tell Jay about your project or question…"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition hover:opacity-85 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6018)`, color: "#080808" }}>
                {sending ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>

        {/* Nav */}
        <div className="flex flex-wrap gap-3">
          <Link to="/"
            className="text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition hover:opacity-80"
            style={{ color: GOLD, borderColor: `${GOLD}35`, background: `${GOLD}08` }}>
            ← Back to Demo Council
          </Link>
          <Link to="/about"
            className="text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition hover:opacity-80"
            style={{ color: GOLD, borderColor: `${GOLD}35`, background: `${GOLD}08` }}>
            About JGA →
          </Link>
        </div>

      </div>
    </div>
  );
}