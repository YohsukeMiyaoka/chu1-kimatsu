// ホーム画面用のアイコン（PNG）を作る。画像ツールなしで動くよう、PNGを直接書き出す。
// 使い方: node scripts/make-icons.mjs
import fs from 'node:fs';
import zlib from 'node:zlib';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(size, pixel) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x / size, y / size);
      const i = y * (size * 3 + 1) + 1 + x * 3;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}


// 紺の背景に白いノート（罫線）と赤い○
const BG = [58, 91, 217], WHITE = [255, 255, 255], LINE = [190, 205, 240], RED = [230, 40, 60];
function pixel(x, y) {
  const dx = x - 0.62, dy = y - 0.6, r = Math.sqrt(dx * dx + dy * dy);
  if (r > 0.17 && r < 0.21) return RED;
  if (x > 0.24 && x < 0.76 && y > 0.18 && y < 0.82) {
    if (Math.abs(((y - 0.3) % 0.1)) < 0.012 && y > 0.28) return LINE;
    return WHITE;
  }
  return BG;
}

fs.mkdirSync('public/icons', { recursive: true });
for (const [name, size] of [['icon-192', 192], ['icon-512', 512], ['apple-touch-icon', 180]]) {
  fs.writeFileSync(`public/icons/${name}.png`, png(size, pixel));
}
console.log('icons written');
