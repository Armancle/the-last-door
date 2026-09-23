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

    this.initControls();
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

    switch (event.code) {
      case 'KeyW': case 'ArrowUp': this.keys.forward = true; break;
      case 'KeyS': case 'ArrowDown': this.keys.backward = true; break;
      case 'KeyA': case 'ArrowLeft': this.keys.left = true; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = true; break;
      case 'ControlLeft': case 'ControlRight': case 'KeyC': this.keys.crouch = true; break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW': case 'ArrowUp': this.keys.forward = false; break;
      case 'KeyS': case 'ArrowDown': this.keys.backward = false; break;
      case 'KeyA': case 'ArrowLeft': this.keys.left = false; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = false; break;
      case 'ControlLeft': case 'ControlRight': case 'KeyC': this.keys.crouch = false; break;
    }
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

    // Transform direction to match player camera Y rotation
    const cameraRotationY = this.euler.y;
    const moveX = (this.direction.x * Math.cos(cameraRotationY) - this.direction.z * Math.sin(cameraRotationY)) * currentSpeed * delta;
    const moveZ = (this.direction.x * Math.sin(cameraRotationY) + this.direction.z * Math.cos(cameraRotationY)) * currentSpeed * delta;

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
