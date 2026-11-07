// POST /api/tts  { text }  ->  audio/mpeg
// Turns already-calculated plan text into speech with ElevenLabs.
// The API key lives only in the server environment (ELEVENLABS_API_KEY), never in the browser.

const MAX_CHARS = 1200; // protects credits: a spoken briefing is ~400 characters

export async function POST(request: Request): Promise<Response> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return json({ error: 'Voice is not configured' }, 503);

  let text = '';
  try {
    const body = await request.json();
    text = String(body?.text ?? '').trim();
  } catch {
    return json({ error: 'Send JSON: { text }' }, 400);
  }
  if (!text) return json({ error: 'No text' }, 400);
  if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS);

  const voice = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
  const model = process.env.ELEVENLABS_TTS_MODEL || 'eleven_multilingual_v2';

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },
      }),
    },
  );

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    return json({ error: 'Voice service error', status: upstream.status, detail: detail.slice(0, 300) }, 502);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
  });
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
