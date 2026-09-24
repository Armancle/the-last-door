import * as THREE from 'three';
import { World } from './world.js';
import { PlayerController } from './player.js';
import { audioEngine } from './audio.js';
import { DEFAULT_LEVEL } from './config.js';
import { AtmospherePostProcessor } from './postprocess.js';

window.THREE = THREE;

class GameApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.activeLevelData = JSON.parse(JSON.stringify(DEFAULT_LEVEL));
    this.hasExited = false;

    // Initialize 3D World
    this.world = new World(this.container);
    this.world.loadLevel(this.activeLevelData);

    // Initialize Post Processing Composer
    this.postProcessor = new AtmospherePostProcessor(
      this.world.renderer,
      this.world.scene,
      this.world.camera
    );

    // Handle Window Resize
    window.addEventListener('resize', () => {
      this.postProcessor.setSize(window.innerWidth, window.innerHeight);
    });

    // Initialize Player Controller
    this.player = new PlayerController(this.world.camera, this.world.renderer.domElement, this.world);
    if (this.activeLevelData.playerSpawn) {
      this.player.setPosition(
        this.activeLevelData.playerSpawn.x,
        this.activeLevelData.playerSpawn.y,
        this.activeLevelData.playerSpawn.z
      );
    }

    // Blue Door Interaction Event Handler
    this.player.onInteractDoor = (doorGroup) => this.handleDoorInteraction(doorGroup);

    this.initUI();

    // Start Game Loop
    this.clock = new THREE.Clock();
    this.animate();
  }

  handleDoorInteraction(doorGroup) {
    const fadeOverlay = document.getElementById('fade-overlay');
    if (fadeOverlay) fadeOverlay.classList.add('active');

    // Play subtle interaction click/sound
    audioEngine.playFlashlightClick();

    setTimeout(() => {
      if (this.world.currentDimension === 'main') {
        // Transition from Main Room -> Dreamcore Dimension
        this.world.loadDreamcoreDimension();
        this.player.setPosition(0, 1.7, 0);
        this.player.euler.set(0, 0, 0, 'YXZ');
      } else {
        // Return from Dreamcore -> Main Room
        this.world.loadLevel(this.activeLevelData);
        this.player.setPosition(0, 1.7, 22.0);
        this.player.euler.set(0, Math.PI, 0, 'YXZ');
      }

      // Update postprocessor camera reference
      this.postProcessor.setCamera(this.world.camera);

      // Fade screen back in
      setTimeout(() => {
        if (fadeOverlay) fadeOverlay.classList.remove('active');
      }, 100);
    }, 400);
  }

  initUI() {
    // User Interaction Audio Init
    window.addEventListener('click', () => {
      audioEngine.init();
      audioEngine.resume();
    }, { once: true });

    // Restart Button on Exit Modal
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

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Update World (Lighting, Entities, Atmosphere)
    this.world.update(elapsedTime, delta, this.player.position);

    // Update Player First Person Controls & Physics
    this.player.update(delta);

    // Render First Person Camera with Post Processing
    this.postProcessor.setCamera(this.world.camera);
    this.postProcessor.render(elapsedTime, this.world.currentDimension);

    // Check Exit Trigger Condition (Main Room only)
    if (this.world.currentDimension === 'main') {
      this.checkExitTrigger();
    }
  }

  checkExitTrigger() {
    if (this.hasExited || !this.world.exitObject) return;

    const exitPos = this.world.exitObject.position;
    const dist = this.player.position.distanceTo(new THREE.Vector3(exitPos.x, 1.7, exitPos.z));

    if (dist < 2.0) {
      this.hasExited = true;
      if (document.pointerLockElement) {
        try { document.exitPointerLock(); } catch (err) {}
      }
      const exitModal = document.getElementById('exit-modal');
      if (exitModal) exitModal.style.display = 'flex';
    }
  }
}

// Start Application on Load
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
