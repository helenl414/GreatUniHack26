import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { Readable } from 'node:stream';

// In production, /api/* are Vercel Functions (../api/*.ts).
// In dev, this plugin runs the same files so `npm run dev` has working voice.
// Put ELEVENLABS_API_KEY in frontend/.env.local (git-ignored).
function localApi(env) {
  const apiDir = path.resolve(__dirname, '../api');
  return {
    name: 'sothis-local-api',
    configureServer(server) {
      for (const [k, v] of Object.entries(env)) if (k.startsWith('ELEVENLABS_')) process.env[k] = v;
      server.middlewares.use(async (req, res, next) => {
        const match = req.url && req.url.match(/^\/api\/(tts|stt)(\?|$)/);
        if (!match || req.method !== 'POST') return next();
        try {
          const mod = await server.ssrLoadModule(path.join(apiDir, `${match[1]}.ts`));
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const request = new Request(`http://localhost${req.url}`, {
            method: 'POST',
            headers: req.headers,
            body: Buffer.concat(chunks),
          });
          const response = await mod.POST(request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          if (response.body) Readable.fromWeb(response.body).pipe(res);
          else res.end();
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  return {
    plugins: [react(), localApi(env)],
    server: { port: 5173 },
  };
});
