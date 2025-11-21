import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const baseDir = path.join(process.cwd(), 'public', 'games');
const outName = 'thumb.png';
const width = 800; // wide banner style
const height = 450;

function humanize(name) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function colorForKey(key) {
  // Simple deterministic palette based on key hash
  const colors = [
    '#1e3a8a', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#84cc16', '#fb7185', '#3b82f6',
  ];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return colors[hash % colors.length];
}

async function createThumb(dirName) {
  const gameDir = path.join(baseDir, dirName);
  const dest = path.join(gameDir, outName);
  if (fs.existsSync(dest)) {
    return; // keep existing custom thumbnail
  }
  const bg = colorForKey(dirName);
  const toInt = (hex) => {
    // hex like #RRGGBB -> 0xRRGGBBAA (alpha=FF)
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
    if (!m) return 0xffffffff;
    const r = parseInt(m[1], 16);
    const g = parseInt(m[2], 16);
    const b = parseInt(m[3], 16);
    return (r << 24) | (g << 16) | (b << 8) | 0xff;
  };
  const name = humanize(dirName);
  const initial = name[0] || '?';
  // Build an SVG overlay with text (initial + name)
  const svg = `<?xml version="1.0"?>
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bg}" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Segoe UI, Arial, sans-serif" font-size="180" fill="#ffffff" opacity="0.9">${initial}</text>
      <text x="50%" y="88%" dominant-baseline="middle" text-anchor="middle"
            font-family="Segoe UI, Arial, sans-serif" font-size="48" fill="#ffffff">${name}</text>
    </svg>`;
  const img = await sharp({ create: { width, height, channels: 3, background: bg } })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toFile(dest);
  console.log('Wrote', dest);
}

async function run() {
  if (!fs.existsSync(baseDir)) {
    console.error('Games directory not found:', baseDir);
    process.exit(1);
  }
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const d of entries) {
    if (d.isDirectory()) {
      // Only create thumbnail where index.html exists
      const hasIndex = fs.existsSync(path.join(baseDir, d.name, 'index.html'));
      if (!hasIndex) continue;
      await createThumb(d.name);
    }
  }
}

run().catch((e) => {
  console.error('Failed generating thumbnails:', e);
  process.exit(1);
});