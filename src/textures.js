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
