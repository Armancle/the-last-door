import * as THREE from 'three';
import { CONFIG, DEFAULT_LEVEL } from './config.js';

export class LevelEditor {
  constructor(world, onLevelChange) {
    this.world = world;
    this.onLevelChange = onLevelChange;

    this.active = false;
    this.currentLevelData = JSON.parse(JSON.stringify(DEFAULT_LEVEL));
    
    // Raycaster & Mouse Selection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedObject = null;
    this.selectionBox = null;

    // Editor Camera Controls (Orbit/Pan)
    this.editorCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    this.editorCamera.position.set(0, 25, 20);
    this.editorCamera.lookAt(0, 0, 0);

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    this.initSelectionBox();
    this.initUI();
  }

  initSelectionBox() {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
    this.selectionBox = new THREE.Mesh(boxGeo, boxMat);
    this.selectionBox.visible = false;
    this.world.scene.add(this.selectionBox);
  }

  initUI() {
    // Sidebar Action Buttons
    document.getElementById('btn-add-wall')?.addEventListener('click', () => this.addObject('wall'));
    document.getElementById('btn-add-light')?.addEventListener('click', () => this.addObject('light'));
    document.getElementById('btn-add-pillar')?.addEventListener('click', () => this.addObject('pillar'));
    document.getElementById('btn-add-door')?.addEventListener('click', () => this.addObject('door'));
    document.getElementById('btn-add-prop')?.addEventListener('click', () => this.addObject('prop'));
    document.getElementById('btn-add-entity')?.addEventListener('click', () => this.addObject('entity_spawn'));
    document.getElementById('btn-set-player-spawn')?.addEventListener('click', () => this.setPlayerSpawn());
    document.getElementById('btn-set-exit')?.addEventListener('click', () => this.setExit());

    // Object Modifiers
    document.getElementById('btn-delete-obj')?.addEventListener('click', () => this.deleteSelectedObject());
    document.getElementById('btn-duplicate-obj')?.addEventListener('click', () => this.duplicateSelectedObject());
    document.getElementById('btn-rotate-obj')?.addEventListener('click', () => this.rotateSelectedObject());

    // Atmosphere Controls
    document.getElementById('input-fog-density')?.addEventListener('input', (e) => this.updateEnvironmentSetting('fogDensity', parseFloat(e.target.value)));
    document.getElementById('input-fog-color')?.addEventListener('input', (e) => this.updateEnvironmentSetting('fogColor', e.target.value));
    document.getElementById('input-ambient-intensity')?.addEventListener('input', (e) => this.updateEnvironmentSetting('ambientIntensity', parseFloat(e.target.value)));
    document.getElementById('input-ambient-color')?.addEventListener('input', (e) => this.updateEnvironmentSetting('ambientColor', e.target.value));

    // File Operations
    document.getElementById('btn-save-level')?.addEventListener('click', () => this.saveLevel());
    document.getElementById('btn-load-level')?.addEventListener('click', () => this.loadLevel());
    document.getElementById('btn-reset-level')?.addEventListener('click', () => this.resetToDefaultLevel());

    // Canvas Events
    window.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.isDragging = false);
    window.addEventListener('wheel', (e) => this.onWheel(e));
  }

  activate() {
    this.active = true;
    this.world.loadLevel(this.currentLevelData);
    this.syncEnvironmentUI();
  }

  deactivate() {
    this.active = false;
    this.deselectObject();
    if (this.selectionBox) this.selectionBox.visible = false;
  }

  syncEnvironmentUI() {
    const env = this.currentLevelData.environment || {};
    const densityEl = document.getElementById('input-fog-density');
    const colorEl = document.getElementById('input-fog-color');
    const ambIntEl = document.getElementById('input-ambient-intensity');
    const ambColEl = document.getElementById('input-ambient-color');

    if (densityEl) densityEl.value = env.fogDensity || 0.038;
    if (colorEl) colorEl.value = env.fogColor || "#221e15";
    if (ambIntEl) ambIntEl.value = env.ambientIntensity || 0.38;
    if (ambColEl) ambColEl.value = env.ambientColor || "#3d3829";
  }

  updateEnvironmentSetting(key, value) {
    if (!this.currentLevelData.environment) {
      this.currentLevelData.environment = {};
    }
    this.currentLevelData.environment[key] = value;
    if (this.world && this.world.atmosphereManager) {
      this.world.atmosphereManager.applySettings(this.currentLevelData.environment);
    }
    this.onLevelChange(this.currentLevelData);
  }

  onPointerDown(e) {
    if (!this.active || !e.target || e.target.tagName !== 'CANVAS') return;

    if (e.button === 0) { // Left Click Select
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.editorCamera);
      const intersects = this.raycaster.intersectObjects(this.world.objectsGroup.children, true);

      if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target && target.parent && target.parent !== this.world.objectsGroup) {
          target = target.parent;
        }
        if (target) {
          this.selectObject(target);
        }
      } else {
        this.deselectObject();
      }
    } else if (e.button === 2 || e.button === 1) { // Right/Middle Mouse Orbit
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  }

  onPointerMove(e) {
    if (!this.active || !this.isDragging) return;

    const deltaX = e.clientX - this.previousMousePosition.x;
    const deltaY = e.clientY - this.previousMousePosition.y;

    const rotSpeed = 0.005;
    this.editorCamera.position.x += deltaX * rotSpeed * 2;
    this.editorCamera.position.z += deltaY * rotSpeed * 2;
    this.editorCamera.lookAt(0, 0, 0);

    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  onWheel(e) {
    if (!this.active) return;
    const zoomSpeed = 0.05;
    this.editorCamera.position.y = Math.max(5, Math.min(80, this.editorCamera.position.y + e.deltaY * zoomSpeed));
    this.editorCamera.lookAt(0, 0, 0);
  }

  selectObject(mesh) {
    this.selectedObject = mesh;
    if (!mesh) {
      if (this.selectionBox) this.selectionBox.visible = false;
      return;
    }

    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    if (this.selectionBox) {
      this.selectionBox.scale.copy(size.addScalar(0.1));
      this.selectionBox.position.copy(center);
      this.selectionBox.visible = true;
    }

    const inspectorEl = document.getElementById('editor-inspector');
    if (!inspectorEl || !mesh.userData) return;

    const data = mesh.userData;

    let html = `
      <strong>Selected:</strong> ${(data.type || 'OBJECT').toUpperCase()}<br>
      ID: <code>${data.id || 'N/A'}</code><br>
      Pos: <code>(${mesh.position.x.toFixed(1)}, ${mesh.position.z.toFixed(1)})</code>
      <hr class="editor-divider">
    `;

    if (data.type === 'light') {
      const item = this.currentLevelData.objects.find(o => o.id === data.id);
      const intensity = item?.intensity !== undefined ? item.intensity : 2.8;
      const color = item?.color || "#fff5d6";
      const range = item?.range !== undefined ? item.range : 20;
      const flickerEnabled = item?.flickerEnabled !== undefined ? item.flickerEnabled : (item?.flicker || false);
      const flickerChance = item?.flickerChance !== undefined ? item.flickerChance : 0.08;
      const state = item?.state || 'NORMAL';

      html += `
        <div class="inspector-field">
          <label>Light State:</label>
          <select id="insp-light-state">
            <option value="NORMAL" ${state === 'NORMAL' ? 'selected' : ''}>NORMAL</option>
            <option value="FLICKERING" ${state === 'FLICKERING' ? 'selected' : ''}>FLICKERING</option>
            <option value="DIM" ${state === 'DIM' ? 'selected' : ''}>DIM</option>
            <option value="OFF" ${state === 'OFF' ? 'selected' : ''}>OFF</option>
          </select>
        </div>
        <div class="inspector-field">
          <label>Flicker ON/OFF:</label>
          <input type="checkbox" id="insp-light-flicker" ${flickerEnabled ? 'checked' : ''}>
        </div>
        <div class="inspector-field">
          <label>Flicker Chance:</label>
          <input type="range" id="insp-light-chance" min="0.01" max="0.25" step="0.01" value="${flickerChance}">
        </div>
        <div class="inspector-field">
          <label>Intensity:</label>
          <input type="range" id="insp-light-intensity" min="0.2" max="5.0" step="0.1" value="${intensity}">
        </div>
        <div class="inspector-field">
          <label>Light Color:</label>
          <input type="color" id="insp-light-color" value="${color}">
        </div>
        <div class="inspector-field">
          <label>Light Range:</label>
          <input type="range" id="insp-light-range" min="5" max="35" step="1" value="${range}">
        </div>
      `;

      inspectorEl.innerHTML = html;

      document.getElementById('insp-light-state')?.addEventListener('change', (e) => {
        this.updateSelectedLightProperty('state', e.target.value);
      });
      document.getElementById('insp-light-flicker')?.addEventListener('change', (e) => {
        this.updateSelectedLightProperty('flickerEnabled', e.target.checked);
      });
      document.getElementById('insp-light-chance')?.addEventListener('input', (e) => {
        this.updateSelectedLightProperty('flickerChance', parseFloat(e.target.value));
      });
      document.getElementById('insp-light-intensity')?.addEventListener('input', (e) => {
        this.updateSelectedLightProperty('intensity', parseFloat(e.target.value));
      });
      document.getElementById('insp-light-color')?.addEventListener('input', (e) => {
        this.updateSelectedLightProperty('color', e.target.value);
      });
      document.getElementById('insp-light-range')?.addEventListener('input', (e) => {
        this.updateSelectedLightProperty('range', parseFloat(e.target.value));
      });
    } else {
      inspectorEl.innerHTML = html;
    }
  }

  updateSelectedLightProperty(prop, value) {
    if (!this.selectedObject || !this.selectedObject.userData) return;
    const id = this.selectedObject.userData.id;
    const item = this.currentLevelData.objects.find(o => o.id === id);
    if (item) {
      item[prop] = value;
      this.selectedObject.userData[prop] = value;
      this.world.loadLevel(this.currentLevelData);
      this.onLevelChange(this.currentLevelData);
    }
  }

  deselectObject() {
    this.selectedObject = null;
    if (this.selectionBox) this.selectionBox.visible = false;
    const inspectorEl = document.getElementById('editor-inspector');
    if (inspectorEl) inspectorEl.innerHTML = `<em>Click an object to select & edit.</em>`;
  }

  addObject(type) {
    const newId = `${type}_${Date.now()}`;
    const newObj = {
      id: newId,
      type: type,
      x: (Math.random() - 0.5) * 10,
      y: type === 'light' ? CONFIG.WALL_HEIGHT - 0.05 : (type === 'wall' || type === 'pillar' ? 1.5 : 0.4),
      z: (Math.random() - 0.5) * 10,
      scaleX: type === 'wall' ? 4 : 1.2,
      scaleY: type === 'wall' || type === 'pillar' ? 3 : 1,
      scaleZ: type === 'wall' ? 0.4 : 1.2,
      rotationY: 0,
      ...(type === 'light' ? {
        flickerEnabled: true,
        flickerChance: 0.08,
        intensity: 2.8,
        color: "#fff5d6",
        range: 20,
        state: "NORMAL"
      } : {})
    };

    this.currentLevelData.objects.push(newObj);
    this.world.loadLevel(this.currentLevelData);
    this.onLevelChange(this.currentLevelData);
  }

  setPlayerSpawn() {
    const targetX = this.selectedObject ? this.selectedObject.position.x : 0;
    const targetZ = this.selectedObject ? this.selectedObject.position.z : 0;
    this.currentLevelData.playerSpawn = { x: targetX, y: 1.7, z: targetZ, rotationY: 0 };
    this.world.loadLevel(this.currentLevelData);
    this.onLevelChange(this.currentLevelData);
  }

  setExit() {
    const targetX = this.selectedObject ? this.selectedObject.position.x : 12;
    const targetZ = this.selectedObject ? this.selectedObject.position.z : -12;
    this.currentLevelData.exit = { x: targetX, y: 0, z: targetZ, rotationY: 0 };
    this.world.loadLevel(this.currentLevelData);
    this.onLevelChange(this.currentLevelData);
  }

  deleteSelectedObject() {
    if (!this.selectedObject || !this.selectedObject.userData) return;
    const id = this.selectedObject.userData.id;
    this.currentLevelData.objects = this.currentLevelData.objects.filter(o => o.id !== id);
    this.deselectObject();
    this.world.loadLevel(this.currentLevelData);
    this.onLevelChange(this.currentLevelData);
  }

  rotateSelectedObject() {
    if (!this.selectedObject || !this.selectedObject.userData) return;
    const id = this.selectedObject.userData.id;
    const item = this.currentLevelData.objects.find(o => o.id === id);
    if (item) {
      item.rotationY = (item.rotationY || 0) + Math.PI / 4;
      this.world.loadLevel(this.currentLevelData);
      const reselected = this.world.objectsGroup.children.find(c => c.userData && c.userData.id === id);
      if (reselected) this.selectObject(reselected);
      this.onLevelChange(this.currentLevelData);
    }
  }

  duplicateSelectedObject() {
    if (!this.selectedObject || !this.selectedObject.userData) return;
    const id = this.selectedObject.userData.id;
    const item = this.currentLevelData.objects.find(o => o.id === id);
    if (item) {
      const copy = JSON.parse(JSON.stringify(item));
      copy.id = `${item.type}_${Date.now()}`;
      copy.x += 1.5;
      copy.z += 1.5;
      this.currentLevelData.objects.push(copy);
      this.world.loadLevel(this.currentLevelData);
      this.onLevelChange(this.currentLevelData);
    }
  }

  saveLevel() {
    try {
      const jsonStr = JSON.stringify(this.currentLevelData, null, 2);
      localStorage.setItem('the_last_door_saved_level', jsonStr);

      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'the_last_door_level.json';
      a.click();
      URL.revokeObjectURL(url);
      alert('Level configuration saved with full atmosphere settings & downloaded as JSON!');
    } catch (err) {
      console.error("Failed to save level JSON:", err);
      alert('Error saving level configuration.');
    }
  }

  loadLevel() {
    try {
      const saved = localStorage.getItem('the_last_door_saved_level');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.objects)) {
          this.currentLevelData = parsed;
          this.world.loadLevel(this.currentLevelData);
          this.syncEnvironmentUI();
          this.onLevelChange(this.currentLevelData);
          alert('Level loaded from LocalStorage!');
          return;
        }
      }
      alert('No valid saved level found in LocalStorage.');
    } catch (err) {
      console.error("Failed to load level JSON:", err);
      alert('Error loading level data.');
    }
  }

  resetToDefaultLevel() {
    this.currentLevelData = JSON.parse(JSON.stringify(DEFAULT_LEVEL));
    this.world.loadLevel(this.currentLevelData);
    this.syncEnvironmentUI();
    this.onLevelChange(this.currentLevelData);
  }
}
