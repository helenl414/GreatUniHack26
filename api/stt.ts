// POST /api/stt  (raw audio body, e.g. audio/webm)  ->  { text }
// Transcribes what someone says about their jobs, pay and bills with ElevenLabs Scribe.
// The text then goes through the same rules-based parser as typed input.

const MAX_BYTES = 8 * 1024 * 1024; // ~4 minutes of compressed speech

export async function POST(request: Request): Promise<Response> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return json({ error: 'Voice is not configured' }, 503);

  const type = request.headers.get('content-type') || 'audio/webm';
  const audio = await request.arrayBuffer();
  if (!audio.byteLength) return json({ error: 'No audio' }, 400);
  if (audio.byteLength > MAX_BYTES) return json({ error: 'Recording too long' }, 413);

  const ext = type.includes('mp4') ? 'mp4' : type.includes('ogg') ? 'ogg' : type.includes('wav') ? 'wav' : 'webm';
  const form = new FormData();
  form.append('model_id', process.env.ELEVENLABS_STT_MODEL || 'scribe_v1');
  form.append('language_code', 'en');
  form.append('tag_audio_events', 'false');
  form.append('file', new Blob([audio], { type }), `speech.${ext}`);

  const upstream = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': key },
    body: form,
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    return json({ error: 'Transcription error', status: upstream.status, detail: detail.slice(0, 300) }, 502);
  }
  const data = await upstream.json();
  return json({ text: String(data?.text ?? '').trim() }, 200);
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
