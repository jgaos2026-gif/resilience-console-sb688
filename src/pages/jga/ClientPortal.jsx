import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Users, CheckCircle2, Upload, FileText, Shield } from "lucide-react";
import { toast } from "sonner";

const GOLD = "#C9A84C";
const STYLES = ["professional", "luxury", "bold", "streetwear", "corporate", "playful", "elegant", "aggressive", "minimal", "vintage", "futuristic"];
const SERVICES = ["logo", "branding", "flyer", "banner", "social_media", "packaging", "web_design", "custom"];

export default function ClientPortal() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", business_name: "", industry: "", target_audience: "",
    preferred_colors: "", colors_to_avoid: "", logo_style: "", emotional_feel: "",
    competitors: "", budget_range: "", deadline: "", notes: "",
  });
  const [service, setService] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const createClient = useMutation({
    mutationFn: (data) => base44.entities.BusinessClient.create(data),
    onSuccess: () => {
      toast.success("Design request submitted!");
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createClient.mutate({ ...form, intake_date: new Date().toISOString().split("T")[0] });
  };

  const update = (field, value) => setForm(p => ({ ...p, [field]: value }));

  if (submitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4 mt-12">
        <CheckCircle2 className="w-16 h-16 mx-auto" style={{ color: "#4ade80" }} />
        <h2 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Request Submitted</h2>
        <p className="text-sm text-muted-foreground">Your design request has been received and entered into the verification pipeline. A team member will review your brief and provide a quote.</p>
        <div className="rounded-xl border border-border p-4 text-xs space-y-2 text-left" style={{ background: "hsl(220,18%,7%)" }}>
          <h3 className="font-bold" style={{ color: GOLD }}>What happens next:</h3>
          <p className="text-muted-foreground">• 35% deposit required to begin work</p>
          <p className="text-muted-foreground">• 24-hour full refund window after deposit</p>
          <p className="text-muted-foreground">• Proof will be sent with watermark</p>
          <p className="text-muted-foreground">• Final files released after full payment</p>
        </div>
        <Button onClick={() => setSubmitted(false)} variant="outline" className="text-xs">Submit Another Request</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-cinzel" style={{ color: GOLD }}>Client Portal</h1>
        <p className="text-xs text-muted-foreground">Submit your design request and answer brand discovery questions</p>
      </div>

      {/* Policies */}
      <div className="rounded-xl border p-4 space-y-2" style={{ background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.15)" }}>
        <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: GOLD }}><Shield className="w-3.5 h-3.5" /> Policies</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-muted-foreground">
          <p>• 35% deposit required upfront</p>
          <p>• 24-hour full refund window</p>
          <p>• Watermarked proofs until final payment</p>
          <p>• Three revision rounds included</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-border p-5 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
          <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Your Name *" value={form.name} onChange={e => update("name", e.target.value)} required className="text-xs bg-secondary border-border" />
            <Input placeholder="Email *" type="email" value={form.email} onChange={e => update("email", e.target.value)} required className="text-xs bg-secondary border-border" />
            <Input placeholder="Phone" value={form.phone} onChange={e => update("phone", e.target.value)} className="text-xs bg-secondary border-border" />
            <Input placeholder="Business Name" value={form.business_name} onChange={e => update("business_name", e.target.value)} className="text-xs bg-secondary border-border" />
          </div>
        </div>

        <div className="rounded-xl border border-border p-5 space-y-4" style={{ background: "hsl(220,18%,7%)" }}>
          <h2 className="text-sm font-bold font-cinzel" style={{ color: GOLD }}>Brand Discovery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Industry" value={form.industry} onChange={e => update("industry", e.target.value)} className="text-xs bg-secondary border-border" />
            <Input placeholder="Target Audience" value={form.target_audience} onChange={e => update("target_audience", e.target.value)} className="text-xs bg-secondary border-border" />
            <Input placeholder="Preferred Colors" value={form.preferred_colors} onChange={e => update("preferred_colors", e.target.value)} className="text-xs bg-secondary border-border" />
            <Input placeholder="Colors to Avoid" value={form.colors_to_avoid} onChange={e => update("colors_to_avoid", e.target.value)} className="text-xs bg-secondary border-border" />
            <Input placeholder="Logo / Font Style" value={form.logo_style} onChange={e => update("logo_style", e.target.value)} className="text-xs bg-secondary border-border" />
            <Input placeholder="Competitors" value={form.competitors} onChange={e => update("competitors", e.target.value)} className="text-xs bg-secondary border-border" />
            <Input placeholder="Budget Range" value={form.budget_range} onChange={e => update("budget_range", e.target.value)} className="text-xs bg-secondary border-border" />
            <Input placeholder="Deadline" type="date" value={form.deadline} onChange={e => update("deadline", e.target.value)} className="text-xs bg-secondary border-border" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Emotional Feel</label>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map(s => (
                <button key={s} type="button" onClick={() => update("emotional_feel", s)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-all"
                  style={form.emotional_feel === s ? { background: "rgba(201,168,76,0.15)", color: GOLD, borderColor: "rgba(201,168,76,0.4)" } : { borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Service Type</label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger className="text-xs bg-secondary border-border"><SelectValue placeholder="Choose service" /></SelectTrigger>
              <SelectContent>{SERVICES.map(s => <SelectItem key={s} value={s} className="text-xs">{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Textarea placeholder="Additional notes, must-have text, where design will be used..." value={form.notes} onChange={e => update("notes", e.target.value)} className="text-xs bg-secondary border-border h-24" />
        </div>

        <Button type="submit" disabled={createClient.isPending} className="w-full text-sm font-bold h-11 font-cinzel"
          style={{ background: "linear-gradient(135deg, #C9A84C, #a07828)", color: "#0a0c10" }}>
          {createClient.isPending ? "Submitting…" : "Submit Design Request"}
        </Button>
      </form>
    </div>
  );
}