// Generates the PWA / home-screen icons as PNGs with no extra dependencies.
// Motif: uneven income bars with one steady line running through them.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const BG = [0x5b, 0x3e, 0x96];
const BAR = [0xb9, 0xc6, 0xe8];
const LINE = [0xff, 0xff, 0xff];

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, px) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const i = y * (size * 4 + 1) + 1 + x * 4;
      const p = px(x, y);
      raw[i] = p[0]; raw[i + 1] = p[1]; raw[i + 2] = p[2]; raw[i + 3] = p[3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Shape sampled in unit space (0..1). `pad` shrinks the motif for maskable safe zone.
function sample(u, v, pad) {
  const s = (t) => (t - pad) / (1 - 2 * pad);
  const x = s(u), y = s(v);
  const heights = [0.42, 0.68, 0.3, 0.58];
  const barW = 0.13, gap = 0.07, x0 = 0.2, base = 0.8;
  let col = BG;
  heights.forEach((h, i) => {
    const bx = x0 + i * (barW + gap);
    if (x >= bx && x <= bx + barW && y <= base && y >= base - h) col = BAR;
  });
  // steady line, gently curved
  const ly = 0.46 - 0.025 * Math.sin((x - 0.14) / 0.72 * Math.PI * 2);
  if (x >= 0.14 && x <= 0.86 && Math.abs(y - ly) < 0.035) col = LINE;
  // round line ends
  for (const ex of [0.14, 0.86]) {
    const ey = 0.46 - 0.025 * Math.sin((ex - 0.14) / 0.72 * Math.PI * 2);
    if ((x - ex) ** 2 + (y - ey) ** 2 < 0.035 ** 2) col = LINE;
  }
  return col;
}

function render(size, { pad = 0, rounded = false }) {
  const SS = 4;
  return png(size, (px, py) => {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const u = (px + (sx + 0.5) / SS) / size, v = (py + (sy + 0.5) / SS) / size;
      if (rounded) {
        const rad = 0.22, cx = Math.min(Math.max(u, rad), 1 - rad), cy = Math.min(Math.max(v, rad), 1 - rad);
        if ((u - cx) ** 2 + (v - cy) ** 2 > rad * rad) continue;
      }
      const c = sample(u, v, pad);
      r += c[0]; g += c[1]; b += c[2]; a += 255;
    }
    const n = SS * SS;
    const alpha = a / n;
    const k = a ? n * 255 / a : 0;
    return [Math.round(r / n * k), Math.round(g / n * k), Math.round(b / n * k), Math.round(alpha)];
  });
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', render(192, { rounded: true }));
writeFileSync('public/icons/icon-512.png', render(512, { rounded: true }));
writeFileSync('public/icons/maskable-512.png', render(512, { pad: 0.12 }));
writeFileSync('public/icons/apple-touch-icon.png', render(180, {}));
writeFileSync('public/favicon.png', render(64, { rounded: true }));
console.log('icons written');
