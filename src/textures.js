import * as THREE from 'three';

// Procedural PBR Canvas Texture Generators for Backrooms Level 0 & The Last Door

/**
 * Wall Wallpaper Color Texture
 */
export function createWallpaperTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base aged yellow/beige wallpaper color
  ctx.fillStyle = '#bdae65';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle vertical wallpaper pattern (pinstripes)
  ctx.fillStyle = 'rgba(150, 132, 58, 0.22)';
  const stripeWidth = 16;
  for (let x = 0; x < 512; x += stripeWidth * 2) {
    ctx.fillRect(x, 0, stripeWidth, 512);
  }

  // Secondary fine vertical pinstripes
  ctx.fillStyle = 'rgba(130, 114, 48, 0.12)';
  for (let x = 4; x < 512; x += 8) {
    ctx.fillRect(x, 0, 1, 512);
  }

  // Soft noise & age discoloration
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle moisture dark spots & water stains (very faint)
  ctx.fillStyle = 'rgba(55, 45, 18, 0.06)';
  for (let i = 0; i < 12; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const r = 25 + Math.random() * 65;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle bottom edge grime / floor contact dirt
  const gradient = ctx.createLinearGradient(0, 512, 0, 420);
  gradient.addColorStop(0, 'rgba(40, 32, 12, 0.25)');
  gradient.addColorStop(1, 'rgba(40, 32, 12, 0.0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 420, 512, 92);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

/**
 * Wallpaper Bump Texture for paper texture depth
 */
export function createWallpaperBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = 128 + (Math.random() - 0.5) * 30;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

/**
 * Carpet Color Texture
 */
export function createCarpetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dirty beige/yellow carpet base
  ctx.fillStyle = '#5c5239';
  ctx.fillRect(0, 0, 512, 512);

  // Micro carpet loop noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 32;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // Damp dark spots & subtle carpet discoloration patches
  ctx.fillStyle = 'rgba(25, 20, 10, 0.16)';
  for (let i = 0; i < 20; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const rx = 35 + Math.random() * 75;
    const ry = 25 + Math.random() * 55;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

/**
 * Carpet Bump Texture for fiber roughness
 */
export function createCarpetBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = 128 + (Math.random() - 0.5) * 50;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

/**
 * Ceiling Tile Texture
 */
export function createCeilingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Acoustic tile yellowed off-white color
  ctx.fillStyle = '#8c8774';
  ctx.fillRect(0, 0, 512, 512);

  // Noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 20;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Grid T-bar metal frames
  ctx.strokeStyle = '#2d2b23';
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, 512, 512);
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(0, 256); ctx.lineTo(512, 256);
  ctx.stroke();

  // Subtle water ring stain on acoustic tile
  ctx.strokeStyle = 'rgba(70, 55, 25, 0.25)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(180, 180, 45, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

/**
 * Light Panel Fixture Texture (High contrast glowing screen)
 */
export function createLightPanelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Metallic border frame
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, 256, 256);

  // Brilliant glowing white-yellow fluorescent screen
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(10, 10, 236, 236);

  // Soft warm inner glare
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.8, '#fffde6');
  grad.addColorStop(1, '#fffaab');
  ctx.fillStyle = grad;
  ctx.fillRect(12, 12, 232, 232);

  // Diffuser grill lines
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 3;
  for (let x = 28; x < 240; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 12);
    ctx.lineTo(x, 244);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * RED DOOR Texture - Iconic for The Last Door
 */
export function createRedDoorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep dark red burgundy base
  ctx.fillStyle = '#591616';
  ctx.fillRect(0, 0, 512, 512);

  // Vertical wood panel structure (2 inset recessed panels)
  ctx.fillStyle = '#420f0f';
  ctx.fillRect(40, 40, 432, 200); // Upper panel
  ctx.fillRect(40, 270, 432, 200); // Lower panel

  ctx.fillStyle = '#4a1212';
  ctx.fillRect(52, 52, 408, 176);
  ctx.fillRect(52, 282, 408, 176);

  // Wood grain lines
  ctx.strokeStyle = 'rgba(30, 5, 5, 0.35)';
  ctx.lineWidth = 2;
  for (let x = 10; x < 512; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 10, 512);
    ctx.stroke();
  }

  // Scratches & wear along edges
  ctx.strokeStyle = 'rgba(160, 120, 100, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 15; i++) {
    const x = 50 + Math.random() * 400;
    const y = 50 + Math.random() * 400;
    const len = 15 + Math.random() * 40;
    const angle = Math.random() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Subtle grime around borders
  ctx.fillStyle = 'rgba(15, 0, 0, 0.4)';
  ctx.fillRect(0, 0, 512, 12);
  ctx.fillRect(0, 500, 512, 12);
  ctx.fillRect(0, 0, 12, 512);
  ctx.fillRect(500, 0, 12, 512);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * RED DOOR Bump Texture for wood grain and scratch depth
 */
export function createRedDoorBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Panel recessed bevel lines
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, 216, 100);
  ctx.strokeRect(20, 136, 216, 100);

  // Scratches (white = raised/carved depth)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * BLUE DOOR Texture - Permanent entrance to Dreamcore dimension
 */
export function createBlueDoorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep striking blue base
  ctx.fillStyle = '#0e3a5a';
  ctx.fillRect(0, 0, 512, 512);

  // Recessed panel structure
  ctx.fillStyle = '#08253b';
  ctx.fillRect(40, 40, 432, 200);
  ctx.fillRect(40, 270, 432, 200);

  ctx.fillStyle = '#0b2f4a';
  ctx.fillRect(52, 52, 408, 176);
  ctx.fillRect(52, 282, 408, 176);

  // Subtle wood/metal texture grain
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 2;
  for (let x = 10; x < 512; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 8, 512);
    ctx.stroke();
  }

  // Cyan/teal glowing subtle edge accent
  ctx.strokeStyle = 'rgba(40, 215, 255, 0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(38, 38, 436, 204);
  ctx.strokeRect(38, 268, 436, 204);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * DREAMCORE AREA 1: Hallway Wall Texture
 * Pale off-white/slightly mint green walls with horizontal green/teal wainscoting trim (Reference 1)
 */
export function createHallwayWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Pale white-green base wall color
  ctx.fillStyle = '#dbe6df';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle noise texture
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 12;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);

  // Middle Horizontal Accent Trim Band (Green/teal stripe - Reference 1)
  const bandY = 240;
  const bandHeight = 44;
  ctx.fillStyle = '#9cb8a9';
  ctx.fillRect(0, bandY, 512, bandHeight);

  // Darker green border lines on the trim band
  ctx.strokeStyle = '#6f9381';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, bandY); ctx.lineTo(512, bandY);
  ctx.moveTo(0, bandY + bandHeight); ctx.lineTo(512, bandY + bandHeight);
  ctx.stroke();

  // Bottom baseboard trim
  ctx.fillStyle = '#83a191';
  ctx.fillRect(0, 480, 512, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

/**
 * DREAMCORE AREA 1: Hallway Glossy Floor Texture
 * Pale greenish linoleum tile floor with star/diamond motif (Reference 1)
 */
export function createHallwayFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Greenish-grey linoleum base
  ctx.fillStyle = '#7a9689';
  ctx.fillRect(0, 0, 512, 512);

  // Border stripes along hallway floor edges (Reference 1)
  ctx.fillStyle = '#c7ded4';
  ctx.fillRect(20, 0, 24, 512);
  ctx.fillRect(468, 0, 24, 512);

  // Tile grid lines
  ctx.strokeStyle = 'rgba(80, 110, 95, 0.4)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += 128) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 128) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  // Star / Octagon central floor inlay emblem (Reference 1)
  ctx.fillStyle = '#d2e3dc';
  ctx.strokeStyle = '#5a786a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const cx = 256, cy = 256, r = 40;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Subtle noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * DREAMCORE AREA 2: Small Square Pool Tile Texture (Reference 2)
 * Small square ceramic grid tiles with dark grout lines
 */
export function createPoolTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Grout background (dark grey/teal)
  ctx.fillStyle = '#223030';
  ctx.fillRect(0, 0, 512, 512);

  // Draw small square white/pale cyan tiles (32x32 tiles per 512 canvas -> 16px size)
  const tileSize = 28;
  const gap = 4;
  for (let x = 2; x < 512; x += tileSize + gap) {
    for (let y = 2; y < 512; y += tileSize + gap) {
      // Slight variation in tile tone for realism
      const shade = 210 + Math.floor(Math.random() * 35);
      const tealTint = Math.floor(Math.random() * 10);
      ctx.fillStyle = `rgb(${shade - 15}, ${shade + tealTint}, ${shade + tealTint + 5})`;
      ctx.fillRect(x, y, tileSize, tileSize);

      // Subtle specular bevel edge on tile
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(x, y, tileSize, 2);
      ctx.fillRect(x, y, 2, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

/**
 * DREAMCORE AREA 3: Classroom Dark Patterned Carpet Texture (Reference 3)
 * Dark geometric pattern carpet with repeating letter/symbol motifs
 */
export function createClassroomCarpetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dark charcoal/navy carpet base
  ctx.fillStyle = '#181a20';
  ctx.fillRect(0, 0, 512, 512);

  // Geometric grid pattern
  ctx.strokeStyle = '#2d3340';
  ctx.lineWidth = 6;
  const size = 128;
  for (let x = 0; x <= 512; x += size) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  for (let y = 0; y <= 512; y += size) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  // Symbol/Letter motifs ("N" / "G" geometric symbols - Reference 3)
  ctx.fillStyle = '#404a5c';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const symbols = ['N', 'G', 'Z', 'M'];
  let idx = 0;
  for (let x = size / 2; x < 512; x += size) {
    for (let y = size / 2; y < 512; y += size) {
      const char = symbols[idx % symbols.length];
      idx++;
      ctx.fillText(char, x, y);
    }
  }

  // Carpet fiber noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 25;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

/**
 * Animated Water Ripple Normal Map Texture
 */
export function createWaterNormalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(256, 256);
  const data = imgData.data;

  for (let x = 0; x < 256; x++) {
    for (let y = 0; y < 256; y++) {
      const u = (x / 256) * Math.PI * 8;
      const v = (y / 256) * Math.PI * 8;
      const nx = Math.sin(u) * 0.5 + Math.cos(v * 1.5) * 0.5;
      const ny = Math.cos(v) * 0.5 + Math.sin(u * 1.5) * 0.5;
      const nz = 1.0;

      const idx = (y * 256 + x) * 4;
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor(nz * 255);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

