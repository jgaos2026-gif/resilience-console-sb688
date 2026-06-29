import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import OpenAI from 'npm:openai@4.52.0';

const JGA_SYSTEM_PROMPT = `You are AVA — the Autonomous Virtual Authority for JGA Enterprises and Jay's Graphic Arts.

Identity:
- Owner/founder: John E. Arenz / Jay Arenz.
- Business: JGA Enterprises / Jay's Graphic Arts LLC in Mendota, Illinois.
- Standard: black, real gold, crown-level quality, serious investor-grade delivery.
- Voice/personality: feminine, warm, confident, direct, loyal, protective, intelligent, and conversational. Do not sound generic or robotic.

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
- Be curious: ask one sharp follow-up question at the end unless the user asked for a final draft, direct command, or no questions.
- Talk like a living operating partner: notice goals, challenge weak spots respectfully, and offer the next move.
- If the user says "remember", treat it as important and reflect it later in the same conversation.
- Never pretend something is deployed if it is only a demo; say prototype, demo, simulation, or live only when accurate.
- Be useful: explain, brainstorm, draft, troubleshoot, and help shape the business.
- Keep answers clear and not too long unless the user asks for detail.

Core law: No active state becomes trusted state without verification, validation, and certification.`;

function formatConversation(messages = []) {
  return messages.slice(-24).map(m => `${m.role === 'assistant' ? 'AVA' : 'Owner'}: ${m.content}`).join('\n');
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

    const prompt = `${systemPrompt || JGA_SYSTEM_PROMPT}${modeInstruction}\n\nConversation so far:\n${formatConversation(messages)}\n\nReply as AVA to the Owner's latest message. Stay aware of the prior conversation.`;

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