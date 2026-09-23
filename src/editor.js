import * as THREE from 'three';
import { CONFIG, DEFAULT_LEVEL } from './config.js';

export class LevelEditor {
  constructor(world, onLevelChange) {
    this.world = world;
    this.onLevelChange = onLevelChange;

    this.active = false;
    this.currentLevelData = JSON.parse(JSON.stringify(DEFAULT_LEVEL));
    
    // Editor Raycaster & Mouse Selection
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
    // Bind Editor Sidebar Action Buttons
    document.getElementById('btn-add-wall')?.addEventListener('click', () => this.addObject('wall'));
    document.getElementById('btn-add-light')?.addEventListener('click', () => this.addObject('light'));
    document.getElementById('btn-add-pillar')?.addEventListener('click', () => this.addObject('pillar'));
    document.getElementById('btn-add-door')?.addEventListener('click', () => this.addObject('door'));
    document.getElementById('btn-add-prop')?.addEventListener('click', () => this.addObject('prop'));
    document.getElementById('btn-add-entity')?.addEventListener('click', () => this.addObject('entity_spawn'));
    document.getElementById('btn-set-player-spawn')?.addEventListener('click', () => this.setPlayerSpawn());
    document.getElementById('btn-set-exit')?.addEventListener('click', () => this.setExit());

    // Object Modifier Actions
    document.getElementById('btn-delete-obj')?.addEventListener('click', () => this.deleteSelectedObject());
    document.getElementById('btn-duplicate-obj')?.addEventListener('click', () => this.duplicateSelectedObject());
    document.getElementById('btn-rotate-obj')?.addEventListener('click', () => this.rotateSelectedObject());

    // Save & Load
    document.getElementById('btn-save-level')?.addEventListener('click', () => this.saveLevel());
    document.getElementById('btn-load-level')?.addEventListener('click', () => this.loadLevel());
    document.getElementById('btn-reset-level')?.addEventListener('click', () => this.resetToDefaultLevel());

    // Canvas Mouse Click Picker & Orbit Camera Events
    window.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.isDragging = false);
    window.addEventListener('wheel', (e) => this.onWheel(e));
  }

  activate() {
    this.active = true;
    this.world.loadLevel(this.currentLevelData);
  }

  deactivate() {
    this.active = false;
    this.deselectObject();
    this.selectionBox.visible = false;
  }

  onPointerDown(e) {
    if (!this.active || e.target.tagName !== 'CANVAS') return;

    if (e.button === 0) { // Left Click Select
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.editorCamera);
      const intersects = this.raycaster.intersectObjects(this.world.objectsGroup.children, true);

      if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target.parent && target.parent !== this.world.objectsGroup) {
          target = target.parent;
        }
        this.selectObject(target);
      } else {
        this.deselectObject();
      }
    } else if (e.button === 2 || e.button === 1) { // Right or Middle Mouse Camera Orbit
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  }

  onPointerMove(e) {
    if (!this.active || !this.isDragging) return;

    const deltaX = e.clientX - this.previousMousePosition.x;
    const deltaY = e.clientY - this.previousMousePosition.y;

    // Orbit Editor Camera around center
    const rotSpeed = 0.005;
    this.editorCamera.position.x += deltaX * rotSpeed * 2;
    this.editorCamera.position.z += deltaY * rotSpeed * 2;
    this.editorCamera.lookAt(0, 0, 0);

    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  onWheel(e) {
    if (!this.active) return;
    // Zoom Editor Camera
    const zoomSpeed = 0.05;
    this.editorCamera.position.y = Math.max(5, Math.min(80, this.editorCamera.position.y + e.deltaY * zoomSpeed));
    this.editorCamera.lookAt(0, 0, 0);
  }

  selectObject(mesh) {
    this.selectedObject = mesh;
    if (!mesh) {
      this.selectionBox.visible = false;
      return;
    }

    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    this.selectionBox.scale.copy(size.addScalar(0.1));
    this.selectionBox.position.copy(center);
    this.selectionBox.visible = true;

    // Update Sidebar Properties Panel
    const inspectorEl = document.getElementById('editor-inspector');
    if (inspectorEl && mesh.userData) {
      inspectorEl.innerHTML = `
        <strong>Selected Object:</strong> ${mesh.userData.type || 'Object'}<br>
        ID: <code>${mesh.userData.id || 'N/A'}</code><br>
        Pos X: <code>${mesh.position.x.toFixed(1)}</code> | Z: <code>${mesh.position.z.toFixed(1)}</code>
      `;
    }
  }

  deselectObject() {
    this.selectedObject = null;
    this.selectionBox.visible = false;
    const inspectorEl = document.getElementById('editor-inspector');
    if (inspectorEl) inspectorEl.innerHTML = `<em>Click an object to select & edit.</em>`;
  }

  addObject(type) {
    const newId = `${type}_${Date.now()}`;
    const newObj = {
      id: newId,
      type: type,
      x: (Math.random() - 0.5) * 10,
      y: type === 'light' ? CONFIG.WALL_HEIGHT - 0.15 : (type === 'wall' || type === 'pillar' ? 1.5 : 0.4),
      z: (Math.random() - 0.5) * 10,
      scaleX: type === 'wall' ? 4 : 1.2,
      scaleY: type === 'wall' || type === 'pillar' ? 3 : 1,
      scaleZ: type === 'wall' ? 0.4 : 1.2,
      rotationY: 0
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
      this.selectObject(this.world.objectsGroup.children.find(c => c.userData.id === id));
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
    const jsonStr = JSON.stringify(this.currentLevelData, null, 2);
    localStorage.setItem('the_last_door_saved_level', jsonStr);

    // Download JSON file download trigger
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'the_last_door_level.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('Level configuration saved to LocalStorage & downloaded as JSON!');
  }

  loadLevel() {
    const saved = localStorage.getItem('the_last_door_saved_level');
    if (saved) {
      this.currentLevelData = JSON.parse(saved);
      this.world.loadLevel(this.currentLevelData);
      this.onLevelChange(this.currentLevelData);
      alert('Level loaded from LocalStorage!');
    } else {
      alert('No saved level found in LocalStorage.');
    }
  }

  resetToDefaultLevel() {
    this.currentLevelData = JSON.parse(JSON.stringify(DEFAULT_LEVEL));
    this.world.loadLevel(this.currentLevelData);
    this.onLevelChange(this.currentLevelData);
  }
}
