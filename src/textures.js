import * as THREE from 'three';

// Procedural PBR Canvas Texture Generators for Backrooms Level 0

export function createWallpaperTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base aged yellow color
  ctx.fillStyle = '#b8a65c';
  ctx.fillRect(0, 0, 512, 512);

  // Vertical subtle stripe pattern
  ctx.fillStyle = 'rgba(155, 136, 60, 0.25)';
  const stripeWidth = 16;
  for (let x = 0; x < 512; x += stripeWidth * 2) {
    ctx.fillRect(x, 0, stripeWidth, 512);
  }

  // Moisture stains & grime noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle moisture dark spots
  ctx.fillStyle = 'rgba(60, 50, 20, 0.08)';
  for (let i = 0; i < 15; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const r = 20 + Math.random() * 60;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

export function createCarpetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base dirty beige carpet color
  ctx.fillStyle = '#615841';
  ctx.fillRect(0, 0, 512, 512);

  // Fiber noise & speckles
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 35;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // Dirty damp spots
  ctx.fillStyle = 'rgba(30, 25, 15, 0.18)';
  for (let i = 0; i < 25; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const rx = 30 + Math.random() * 80;
    const ry = 20 + Math.random() * 50;
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

export function createCeilingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base acoustic tile gray/off-white color
  ctx.fillStyle = '#8f8b78';
  ctx.fillRect(0, 0, 512, 512);

  // Noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Grid lines (Drop ceiling frame)
  ctx.strokeStyle = '#3a382e';
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, 512, 512);
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(0, 256); ctx.lineTo(512, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

export function createLightPanelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Metallic frame border
  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, 256, 256);

  // Bright glowing white center
  ctx.fillStyle = '#fffdf0';
  ctx.fillRect(16, 16, 224, 224);

  // Diffuser grill lines
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  for (let x = 32; x < 240; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 16);
    ctx.lineTo(x, 240);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
