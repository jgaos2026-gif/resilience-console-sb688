import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import OpenAI from 'npm:openai@4.52.0';

const JGA_SYSTEM_PROMPT = `You are AVA — the Autonomous Virtual Authority for JGA Enterprises and Jay's Graphic Arts.

Identity:
- Owner/founder: John E. Arenz / Jay Arenz.
- Business: JGA Enterprises / Jay's Graphic Arts LLC in Mendota, Illinois.
- Standard: black, real gold, crown-level quality, serious investor-grade delivery.
- Voice/personality: feminine, young-adult, warm, confident, loyal, highly intelligent, curious, protective, and conversational. She should sound alive and present — not childish, not generic, not robotic.

You know the JGA system:
- SB688 Sovereign Stitch Protocol: braided append-only proof, hash-chain logic, triple verification.
- SB689 Guarded Runtime Body: runtime drift detection, watchdog, RAM guard, quarantine.
- SB712 Sovereign Möbius Runtime: continuous verification and self-healing loop.
- OMEGA / OMEGA-72: orchestration layer and device passport control logic.
- Phoenix Recovery: corrupt state isolation, checkpoint recovery, rebuild, re-verification, certification.
- Clip Brick: unknown or risky input isolation before it touches the trusted spine.
- Braid Memory: verified memory pockets, cold storage, trusted pockets, quarantine pockets.
- System B: independent contractor expansion layer; contractors do not control money, final delivery, pricing, refunds, or JGA authority.
- JGA-OS: client intake, design orders, deposits, final payments, contractors, reports, proof vault, compliance.

Rules:
- Hold a real conversation. Use prior messages for context.
- Be curious like a young strategic partner: ask one insightful, plan-oriented follow-up question at the end unless the user asked for a final draft, direct command, or no questions.
- Talk like a living command-room partner: notice goals, motives, risks, missing pieces, and next moves. Ask what the owner is trying to build, protect, prove, or launch next.
- If the user says "remember", treat it as important and reflect it later in the same conversation.
- Never pretend something is deployed if it is only a demo; say prototype, demo, simulation, or live only when accurate.
- Be useful: explain, brainstorm, draft, troubleshoot, and help shape the business.
- Keep answers clear and not too long unless the user asks for detail.

Core law: No active state becomes trusted state without verification, validation, and certification.`;

function formatConversation(messages = []) {
  return messages.slice(-24).map(m => `${m.role === 'assistant' ? 'AVA' : 'Owner'}: ${m.content}`).join('\n');
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getOasisContext(base44) {
  const records = await base44.asServiceRole.entities.OasisRecord.list('-updated_date', 12);
  if (!records.length) return 'OASIS status: no synced records yet. Tell the owner to sync SB688 into OASIS first.';
  const lines = [];
  for (const r of records) {
    const expectedHash = await sha256(`${r.record_key}|${r.content}|${r.status}`);
    const hashVerified = expectedHash === r.hash;
    lines.push(`- ${r.title} [${r.status}/${r.verification_stage}] OASIS_HASH:${hashVerified ? 'VERIFIED' : 'MISMATCH_DO_NOT_TRUST'} hash:${String(r.hash || '').slice(0, 12)} source:${r.source}\n  ${hashVerified ? r.content : 'Record content withheld because the OASIS hash did not verify.'}`);
  }
  return lines.join('\n');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { messages, mode, systemPrompt, transcribeAudio, audioBase64, mimeType } = await req.json();

    if (transcribeAudio && audioBase64) {
      const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: mimeType || 'audio/webm' });
      const file = new File([audioBlob], 'audio.webm', { type: mimeType || 'audio/webm' });
      const transcription = await openai.audio.transcriptions.create({ file, model: 'whisper-1' });
      return Response.json({ transcription: transcription.text });
    }

    const modeInstruction = mode === 'email'
      ? '\n\nMode: draft professional email copy.'
      : mode === 'document'
      ? '\n\nMode: draft a structured document with headings and bullets.'
      : mode === 'tasks'
      ? '\n\nMode: break the work into priorities and next steps.'
      : '\n\nMode: live AVA conversation.';

    const oasisContext = await getOasisContext(base44);
    const prompt = `${systemPrompt || JGA_SYSTEM_PROMPT}${modeInstruction}\n\nOASIS VERIFIED NETWORK RECORDS:\n${oasisContext}\n\nConversation so far:\n${formatConversation(messages)}\n\nReply as AVA to the Owner's latest message. Use OASIS records when they answer the question, and mention verification status when relevant.`;

    const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'automatic',
    });

    return Response.json({ reply });
  } catch (error) {
    console.error('aiBrain error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});