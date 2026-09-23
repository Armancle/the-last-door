import { World } from './world.js';
import { PlayerController } from './player.js';
import { LevelEditor } from './editor.js';
import { audioEngine } from './audio.js';
import { DEFAULT_LEVEL } from './config.js';

class GameApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.mode = 'PLAY'; // 'PLAY' or 'EDITOR'
    this.activeLevelData = JSON.parse(JSON.stringify(DEFAULT_LEVEL));
    this.hasExited = false;

    // Initialize 3D World
    this.world = new World(this.container);
    this.world.loadLevel(this.activeLevelData);

    // Initialize Player Controller
    this.player = new PlayerController(this.world.camera, this.world.renderer.domElement, this.world);
    if (this.activeLevelData.playerSpawn) {
      this.player.setPosition(
        this.activeLevelData.playerSpawn.x,
        this.activeLevelData.playerSpawn.y,
        this.activeLevelData.playerSpawn.z
      );
    }

    // Initialize Level Editor
    this.editor = new LevelEditor(this.world, (updatedLevel) => {
      this.activeLevelData = updatedLevel;
    });

    this.initUI();
    this.setMode('PLAY');

    // Start Game Loop
    this.clock = new THREE.Clock();
    this.animate();
  }

  initUI() {
    // Mode Switcher Buttons
    const btnPlayMode = document.getElementById('btn-play-mode');
    const btnEditorMode = document.getElementById('btn-editor-mode');

    btnPlayMode?.addEventListener('click', () => this.setMode('PLAY'));
    btnEditorMode?.addEventListener('click', () => this.setMode('EDITOR'));

    // Global Mode Toggle Key (Tab key)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        this.setMode(this.mode === 'PLAY' ? 'EDITOR' : 'PLAY');
      }
    });

    // Exit Screen Buttons
    document.getElementById('btn-exit-editor')?.addEventListener('click', () => {
      document.getElementById('exit-modal').style.display = 'none';
      this.hasExited = false;
      this.setMode('EDITOR');
    });

    document.getElementById('btn-exit-restart')?.addEventListener('click', () => {
      document.getElementById('exit-modal').style.display = 'none';
      this.hasExited = false;
      if (this.activeLevelData.playerSpawn) {
        this.player.setPosition(
          this.activeLevelData.playerSpawn.x,
          this.activeLevelData.playerSpawn.y,
          this.activeLevelData.playerSpawn.z
        );
      }
    });
  }

  setMode(newMode) {
    this.mode = newMode;
    const hudPlay = document.getElementById('hud-play');
    const hudEditor = document.getElementById('hud-editor');
    const btnPlayMode = document.getElementById('btn-play-mode');
    const btnEditorMode = document.getElementById('btn-editor-mode');

    if (newMode === 'PLAY') {
      this.editor.deactivate();
      if (hudPlay) hudPlay.style.display = 'block';
      if (hudEditor) hudEditor.style.display = 'none';
      btnPlayMode?.classList.add('active');
      btnEditorMode?.classList.remove('active');

      // Set Player Position to Spawn
      if (this.activeLevelData.playerSpawn) {
        this.player.setPosition(
          this.activeLevelData.playerSpawn.x,
          this.activeLevelData.playerSpawn.y,
          this.activeLevelData.playerSpawn.z
        );
      }

      // Initialize Audio on First User Interaction
      audioEngine.init();
      audioEngine.resume();
    } else {
      // Release Pointer Lock
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      this.editor.activate();
      if (hudPlay) hudPlay.style.display = 'none';
      if (hudEditor) hudEditor.style.display = 'flex';
      btnPlayMode?.classList.remove('active');
      btnEditorMode?.classList.add('active');
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Update World (Lighting & Entities)
    this.world.update(elapsedTime, delta);

    if (this.mode === 'PLAY') {
      // Update Player First Person Controls & Physics
      this.player.update(delta);

      // Render First Person Camera
      this.world.renderer.render(this.world.scene, this.world.camera);

      // Check Exit Condition
      this.checkExitTrigger();
    } else {
      // Render Editor Camera
      this.world.renderer.render(this.world.scene, this.editor.editorCamera);
    }
  }

  checkExitTrigger() {
    if (this.hasExited || !this.world.exitObject) return;

    const exitPos = this.world.exitObject.position;
    const dist = this.player.position.distanceTo(new THREE.Vector3(exitPos.x, 1.7, exitPos.z));

    if (dist < 2.0) {
      this.hasExited = true;
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      document.getElementById('exit-modal').style.display = 'flex';
    }
  }
}

// Global Three.js import for editor script references
import * as THREE from 'three';
window.THREE = THREE;

// Start Application on Load
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
