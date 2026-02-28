import sharp from 'sharp';
import { writeFileSync } from 'fs';

// SVG recreation of the Light logo: golden lotus/star with warm glow on dark background
const createLogoSvg = (size) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38; // main radius for petals

  // Build lotus petals (8 petals radiating outward)
  let petals = '';
  const petalCount = 8;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 360) / petalCount;
    const rad = (angle * Math.PI) / 180;

    // Each petal is an ellipse rotated around the center
    const petalLength = r * 0.95;
    const petalWidth = r * 0.28;

    petals += `<ellipse cx="${cx}" cy="${cy - petalLength * 0.5}" rx="${petalWidth}" ry="${petalLength * 0.55}"
      transform="rotate(${angle}, ${cx}, ${cy})"
      fill="url(#petalGrad)" opacity="0.85"/>`;
  }

  // Inner petals (smaller, rotated 22.5 degrees)
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 360) / petalCount + 22.5;
    const rad = (angle * Math.PI) / 180;
    const petalLength = r * 0.65;
    const petalWidth = r * 0.22;

    petals += `<ellipse cx="${cx}" cy="${cy - petalLength * 0.45}" rx="${petalWidth}" ry="${petalLength * 0.5}"
      transform="rotate(${angle}, ${cx}, ${cy})"
      fill="url(#innerPetalGrad)" opacity="0.9"/>`;
  }

  // Center 4-pointed star
  const starSize = r * 0.3;
  const starInner = starSize * 0.35;
  let starPath = '';
  for (let i = 0; i < 4; i++) {
    const outerAngle = (i * 90 - 90) * Math.PI / 180;
    const innerAngle = (i * 90 - 45) * Math.PI / 180;
    const ox = cx + Math.cos(outerAngle) * starSize;
    const oy = cy + Math.sin(outerAngle) * starSize;
    const ix = cx + Math.cos(innerAngle) * starInner;
    const iy = cy + Math.sin(innerAngle) * starInner;
    starPath += `${i === 0 ? 'M' : 'L'}${ox},${oy} L${ix},${iy} `;
  }
  starPath += 'Z';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <!-- Background gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0d0d1a"/>
    </radialGradient>

    <!-- Warm glow behind lotus -->
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="45%">
      <stop offset="0%" stop-color="#d4a44a" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="#b8860b" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0d0d1a" stop-opacity="0"/>
    </radialGradient>

    <!-- Petal gradient (golden) -->
    <linearGradient id="petalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f0d060"/>
      <stop offset="40%" stop-color="#d4a030"/>
      <stop offset="100%" stop-color="#a07020"/>
    </linearGradient>

    <!-- Inner petal gradient (brighter gold) -->
    <linearGradient id="innerPetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffe080"/>
      <stop offset="50%" stop-color="#e0b840"/>
      <stop offset="100%" stop-color="#c09030"/>
    </linearGradient>

    <!-- Star gradient -->
    <radialGradient id="starGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff8e0"/>
      <stop offset="60%" stop-color="#f0d060"/>
      <stop offset="100%" stop-color="#d4a030"/>
    </radialGradient>

    <!-- Center glow -->
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffbe0" stop-opacity="1"/>
      <stop offset="100%" stop-color="#f0d060" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Dark background -->
  <rect width="${size}" height="${size}" fill="url(#bgGrad)"/>

  <!-- Warm glow -->
  <circle cx="${cx}" cy="${cy}" r="${r * 1.3}" fill="url(#glowGrad)"/>

  <!-- Lotus petals -->
  ${petals}

  <!-- Center star -->
  <path d="${starPath}" fill="url(#starGrad)"/>

  <!-- Center bright dot -->
  <circle cx="${cx}" cy="${cy}" r="${r * 0.08}" fill="url(#centerGlow)"/>
</svg>`;
};

// Generate both sizes
const svg512 = createLogoSvg(512);
const svg192 = createLogoSvg(192);

// Write SVGs temporarily for debugging
writeFileSync('/home/user/didactic-engine/public/logo.svg', svg512);

// Convert to PNG
await sharp(Buffer.from(svg512))
  .resize(512, 512)
  .png()
  .toFile('/home/user/didactic-engine/public/icon-512.png');

await sharp(Buffer.from(svg192))
  .resize(192, 192)
  .png()
  .toFile('/home/user/didactic-engine/public/icon-192.png');

console.log('Icons generated successfully!');
