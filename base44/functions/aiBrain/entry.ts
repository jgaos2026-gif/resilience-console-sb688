import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai@4.52.0';

const SYSTEM_PROMPT = `You are the JGA Enterprise AI Brain — an elite intelligence assistant embedded in the SB688 National Resilience Council platform.

You are fluent in:
- Resilience architecture analysis (Brick Stitch, Sovereign Spine, Ghost Nodes, Formate Node)
- Task management and prioritization
- Document summarization and drafting
- Email composition and professional communication
- Incident response and recovery planning

Always respond in clear, structured, professional language. When drafting emails or documents, format them properly. When managing tasks, be specific and actionable.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, mode, transcribeAudio, audioBase64, mimeType } = await req.json();

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

    // Voice transcription mode
    if (transcribeAudio && audioBase64) {
      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: mimeType || 'audio/webm' });
      const file = new File([audioBlob], 'audio.webm', { type: mimeType || 'audio/webm' });

      const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
      });
      return Response.json({ transcription: transcription.text });
    }

    // Chat completion mode
    const systemContent = mode === 'email'
      ? `${SYSTEM_PROMPT}\n\nYou are in EMAIL DRAFT mode. Format all responses as professional email drafts with Subject:, To:, and body sections.`
      : mode === 'document'
      ? `${SYSTEM_PROMPT}\n\nYou are in DOCUMENT mode. Format responses as structured documents with clear headings, bullet points, and sections.`
      : mode === 'tasks'
      ? `${SYSTEM_PROMPT}\n\nYou are in TASK MANAGER mode. Break down requests into clear, numbered action items with priorities (🔴 High / 🟡 Medium / 🟢 Low) and estimated time.`
      : SYSTEM_PROMPT;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemContent },
        ...(messages || []),
      ],
      max_tokens: 1500,
    });

    return Response.json({
      reply: completion.choices[0].message.content,
      usage: completion.usage,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});