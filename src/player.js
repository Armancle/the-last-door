import * as THREE from 'three';
import { CONFIG } from './config.js';
import { audioEngine } from './audio.js';

export class PlayerController {
  constructor(camera, domElement, world) {
    this.camera = camera;
    this.domElement = domElement;
    this.world = world;

    // Movement Vectors & Position
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.position = new THREE.Vector3(0, CONFIG.PLAYER.HEIGHT, 0);

    // States
    this.isCrouching = false;
    this.isSprinting = false;
    this.stamina = CONFIG.PLAYER.STAMINA_MAX;
    this.targetHeight = CONFIG.PLAYER.HEIGHT;
    this.currentHeight = CONFIG.PLAYER.HEIGHT;

    // Input States
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      crouch: false
    };

    // Pointer Lock & Euler Camera Rotation
    this.isLocked = false;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    
    // Footstep Sound Timer
    this.footstepTimer = 0;

    // Flashlight Setup
    this.flashlightOn = true;
    this.initFlashlight();

    this.initControls();
  }

  initFlashlight() {
    // 3D SpotLight attached to player camera
    this.flashlight = new THREE.SpotLight(0xfff5ea, 5.0, 40, Math.PI / 6, 0.4, 1.8);
    this.flashlight.position.set(0.25, -0.2, 0.1);

    this.flashlightTarget = new THREE.Object3D();
    this.flashlightTarget.position.set(0, 0, -5);

    this.camera.add(this.flashlightTarget);
    this.flashlight.target = this.flashlightTarget;
    this.camera.add(this.flashlight);

    if (this.world && this.world.scene && !this.camera.parent) {
      this.world.scene.add(this.camera);
    }
  }

  toggleFlashlight() {
    this.flashlightOn = !this.flashlightOn;
    this.flashlight.visible = this.flashlightOn;
    audioEngine.playFlashlightClick();

    const statusEl = document.getElementById('flashlight-status');
    if (statusEl) {
      statusEl.textContent = this.flashlightOn ? 'ON' : 'OFF';
      statusEl.className = this.flashlightOn ? 'status-on' : 'status-off';
    }
  }

  initControls() {
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));

    this.domElement.addEventListener('click', () => {
      if (!this.isLocked && document.pointerLockElement !== this.domElement) {
        this.domElement.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = (document.pointerLockElement === this.domElement);
    });
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.camera.position.set(x, y, z);
  }

  onKeyDown(event) {
    if (!this.isLocked) return;

    const code = event.code;
    const key = event.key ? event.key.toLowerCase() : '';

    if (code === 'KeyF' || key === 'f') {
      this.toggleFlashlight();
      return;
    }

    if (code === 'KeyW' || code === 'ArrowUp' || key === 'w') this.keys.forward = true;
    else if (code === 'KeyS' || code === 'ArrowDown' || key === 's') this.keys.backward = true;
    else if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a') this.keys.left = true;
    else if (code === 'KeyD' || code === 'ArrowRight' || key === 'd') this.keys.right = true;
    else if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') this.keys.sprint = true;
    else if (code === 'ControlLeft' || code === 'ControlRight' || code === 'KeyC' || key === 'c' || key === 'control') this.keys.crouch = true;
  }

  onKeyUp(event) {
    const code = event.code;
    const key = event.key ? event.key.toLowerCase() : '';

    if (code === 'KeyW' || code === 'ArrowUp' || key === 'w') this.keys.forward = false;
    else if (code === 'KeyS' || code === 'ArrowDown' || key === 's') this.keys.backward = false;
    else if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a') this.keys.left = false;
    else if (code === 'KeyD' || code === 'ArrowRight' || key === 'd') this.keys.right = false;
    else if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') this.keys.sprint = false;
    else if (code === 'ControlLeft' || code === 'ControlRight' || code === 'KeyC' || key === 'c' || key === 'control') this.keys.crouch = false;
  }

  onMouseMove(event) {
    if (!this.isLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.euler.y -= movementX * 0.0022;
    this.euler.x -= movementY * 0.0022;

    // Clamp vertical camera pitch (look up/down limits)
    this.euler.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  }

  update(delta) {
    if (!this.isLocked) return;

    // Crouch Logic & Height Interpolation
    this.isCrouching = this.keys.crouch;
    this.targetHeight = this.isCrouching ? CONFIG.PLAYER.CROUCH_HEIGHT : CONFIG.PLAYER.HEIGHT;
    this.currentHeight += (this.targetHeight - this.currentHeight) * 12 * delta;

    // Sprint & Stamina Logic
    const isMoving = (this.keys.forward || this.keys.backward || this.keys.left || this.keys.right);
    if (this.keys.sprint && isMoving && !this.isCrouching && this.stamina > 0) {
      this.isSprinting = true;
      this.stamina = Math.max(0, this.stamina - CONFIG.PLAYER.STAMINA_DRAIN * delta);
    } else {
      this.isSprinting = false;
      this.stamina = Math.min(CONFIG.PLAYER.STAMINA_MAX, this.stamina + CONFIG.PLAYER.STAMINA_RECOVERY * delta);
    }

    // Determine Speed
    let currentSpeed = CONFIG.PLAYER.WALK_SPEED;
    if (this.isCrouching) currentSpeed = CONFIG.PLAYER.CROUCH_SPEED;
    else if (this.isSprinting) currentSpeed = CONFIG.PLAYER.SPRINT_SPEED;

    // Movement Direction Calculation
    this.direction.set(0, 0, 0);
    if (this.keys.forward) this.direction.z -= 1;
    if (this.keys.backward) this.direction.z += 1;
    if (this.keys.left) this.direction.x -= 1;
    if (this.keys.right) this.direction.x += 1;
    this.direction.normalize();

    // Transform direction to match player camera Y rotation accurately
    const moveVector = this.direction.clone();
    moveVector.applyEuler(new THREE.Euler(0, this.euler.y, 0, 'YXZ'));
    const moveX = moveVector.x * currentSpeed * delta;
    const moveZ = moveVector.z * currentSpeed * delta;

    // Proposed New Position with Axis-Independent Collision Detection
    const newPos = this.position.clone();

    // Move X & Check Collision
    newPos.x += moveX;
    if (!this.checkWallCollision(newPos)) {
      this.position.x = newPos.x;
    } else {
      newPos.x = this.position.x;
    }

    // Move Z & Check Collision
    newPos.z += moveZ;
    if (!this.checkWallCollision(newPos)) {
      this.position.z = newPos.z;
    } else {
      newPos.z = this.position.z;
    }

    // Update Camera Height
    this.position.y = this.currentHeight;
    this.camera.position.copy(this.position);

    // Footstep Sound Logic
    if (isMoving) {
      const interval = this.isCrouching ? CONFIG.AUDIO.FOOTSTEP_INTERVAL_CROUCH :
                       (this.isSprinting ? CONFIG.AUDIO.FOOTSTEP_INTERVAL_SPRINT : CONFIG.AUDIO.FOOTSTEP_INTERVAL_WALK);
      this.footstepTimer += delta;
      if (this.footstepTimer >= interval) {
        audioEngine.playFootstep(this.isSprinting, this.isCrouching);
        this.footstepTimer = 0;
      }
    } else {
      this.footstepTimer = 0;
    }

    // Update Stamina UI Bar
    const staminaBar = document.getElementById('stamina-fill');
    if (staminaBar) {
      staminaBar.style.width = `${(this.stamina / CONFIG.PLAYER.STAMINA_MAX) * 100}%`;
    }
  }

  checkWallCollision(pos) {
    const playerRadius = CONFIG.PLAYER.RADIUS;
    const playerMin = new THREE.Vector3(pos.x - playerRadius, 0.1, pos.z - playerRadius);
    const playerMax = new THREE.Vector3(pos.x + playerRadius, CONFIG.PLAYER.HEIGHT - 0.2, pos.z + playerRadius);
    const playerBox = new THREE.Box3(playerMin, playerMax);

    for (const item of this.world.colliders) {
      if (playerBox.intersectsBox(item.box)) {
        return true;
      }
    }
    return false;
  }
}
