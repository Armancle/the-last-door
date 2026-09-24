import * as THREE from 'three';
import { CONFIG } from './config.js';
import {
  createWallpaperTexture,
  createCarpetTexture,
  createCeilingTexture,
  createRedDoorTexture,
  createRedDoorBumpTexture,
  createBlueDoorTexture
} from './textures.js';
import { EntitySystem } from './entity.js';
import { LightingManager } from './lighting.js';
import { AtmosphereManager } from './atmosphere.js';
import { DreamcoreWorld } from './dreamcore.js';

export class World {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.currentDimension = 'main';

    // High Performance Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

    // Atmosphere & Lighting Managers
    this.atmosphereManager = new AtmosphereManager(this.scene);
    this.lightingManager = new LightingManager(this.scene);

    // Atmospheric Materials Cache
    this.wallpaperTex = createWallpaperTexture();
    this.carpetTex = createCarpetTexture();
    this.ceilingTex = createCeilingTexture();
    this.redDoorTex = createRedDoorTexture();
    this.redDoorBumpTex = createRedDoorBumpTexture();
    this.blueDoorTex = createBlueDoorTexture();

    this.materials = {
      wall: new THREE.MeshStandardMaterial({
        map: this.wallpaperTex,
        roughness: 0.85,
        metalness: 0.02
      }),
      floor: new THREE.MeshStandardMaterial({
        map: this.carpetTex,
        roughness: 0.92,
        metalness: 0.01
      }),
      ceiling: new THREE.MeshStandardMaterial({
        map: this.ceilingTex,
        roughness: 0.9,
        metalness: 0.05
      }),
      pillar: new THREE.MeshStandardMaterial({
        map: this.wallpaperTex,
        roughness: 0.85
      }),
      redDoor: new THREE.MeshStandardMaterial({
        map: this.redDoorTex,
        bumpMap: this.redDoorBumpTex,
        bumpScale: 0.03,
        roughness: 0.75,
        metalness: 0.12
      }),
      blueDoor: new THREE.MeshStandardMaterial({
        map: this.blueDoorTex,
        bumpMap: this.redDoorBumpTex,
        bumpScale: 0.03,
        roughness: 0.5,
        metalness: 0.2
      }),
      doorFrame: new THREE.MeshStandardMaterial({
        color: 0x3d2b1f,
        roughness: 0.8,
        metalness: 0.1
      }),
      blueDoorFrame: new THREE.MeshStandardMaterial({
        color: 0x0a2436,
        roughness: 0.6,
        metalness: 0.3
      }),
      doorHandle: new THREE.MeshStandardMaterial({
        color: 0xb59a57,
        roughness: 0.35,
        metalness: 0.85
      }),
      silverHandle: new THREE.MeshStandardMaterial({
        color: 0xd0d0d0,
        roughness: 0.2,
        metalness: 0.9
      }),
      prop: new THREE.MeshStandardMaterial({
        color: 0x3d352c,
        roughness: 0.82
      }),
      exit: new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00aa44,
        emissiveIntensity: 0.8,
        roughness: 0.2
      }),
      spawnMarker: new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        wireframe: true
      })
    };

    // World Containers & Bounding Boxes
    this.objectsGroup = new THREE.Group();
    this.scene.add(this.objectsGroup);
    
    this.colliders = [];
    this.blueDoorObjects = [];
    this.entitySystem = new EntitySystem(this.scene);
    this.dreamcoreWorld = null;

    // Environment Meshes
    this.floorMesh = null;
    this.ceilingMesh = null;
    this.exitObject = null;
    this.playerSpawnObject = null;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  buildEnvironment(sizeX = 60, sizeZ = 60) {
    if (this.floorMesh) this.scene.remove(this.floorMesh);
    if (this.ceilingMesh) this.scene.remove(this.ceilingMesh);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(sizeX, sizeZ);
    this.floorMesh = new THREE.Mesh(floorGeo, this.materials.floor);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.floorMesh);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(sizeX, sizeZ);
    this.ceilingMesh = new THREE.Mesh(ceilingGeo, this.materials.ceiling);
    this.ceilingMesh.rotation.x = Math.PI / 2;
    this.ceilingMesh.position.y = CONFIG.WALL_HEIGHT;
    this.scene.add(this.ceilingMesh);

    // Generate dense array of square ceiling lights matching the reference image!
    this.lightingManager.generateCeilingLightGrid(sizeX, sizeZ, 4.0);
  }

  loadLevel(levelData) {
    this.currentDimension = 'main';
    if (this.dreamcoreWorld) {
      this.dreamcoreWorld.clear();
    }

    while (this.objectsGroup.children.length > 0) {
      const child = this.objectsGroup.children[0];
      this.objectsGroup.remove(child);
    }
    this.colliders = [];
    this.blueDoorObjects = [];
    this.entitySystem.clear();

    this.buildEnvironment(60, 60);

    if (levelData.environment) {
      this.atmosphereManager.applySettings(levelData.environment);
    }

    levelData.objects.forEach(obj => {
      this.createObjectInWorld(obj);
    });

    if (levelData.exit) {
      this.createExitObject(levelData.exit.x, levelData.exit.z);
    }

    if (levelData.playerSpawn) {
      this.createPlayerSpawnMarker(levelData.playerSpawn.x, levelData.playerSpawn.z);
    }
  }

  loadDreamcoreDimension() {
    this.currentDimension = 'dreamcore';

    // Clear main level objects & environment
    while (this.objectsGroup.children.length > 0) {
      this.objectsGroup.remove(this.objectsGroup.children[0]);
    }
    if (this.floorMesh) this.scene.remove(this.floorMesh);
    if (this.ceilingMesh) this.scene.remove(this.ceilingMesh);
    this.lightingManager.clear();
    this.entitySystem.clear();
    this.colliders = [];

    // Build Dreamcore Connected World
    this.dreamcoreWorld = new DreamcoreWorld(this.scene);
    const data = this.dreamcoreWorld.build();

    this.colliders = data.colliders;
    this.blueDoorObjects = data.blueDoors;

    // Apply Dreamcore Atmospheric Lighting & Fog
    this.atmosphereManager.applySettings(CONFIG.DREAMCORE_ATMOSPHERE);
  }

  createObjectInWorld(data) {
    let mesh = null;

    switch (data.type) {
      case 'wall': {
        const geo = new THREE.BoxGeometry(data.scaleX || 1, data.scaleY || CONFIG.WALL_HEIGHT, data.scaleZ || 1);
        mesh = new THREE.Mesh(geo, this.materials.wall);
        break;
      }
      case 'pillar': {
        const geo = new THREE.BoxGeometry(data.scaleX || 2.2, data.scaleY || CONFIG.WALL_HEIGHT, data.scaleZ || 2.2);
        mesh = new THREE.Mesh(geo, this.materials.pillar);
        break;
      }
      case 'door': {
        const group = new THREE.Group();

        const isBlue = !!data.isBlueDoor;
        const frameMat = isBlue ? this.materials.blueDoorFrame : this.materials.doorFrame;
        const panelMat = isBlue ? this.materials.blueDoor : this.materials.redDoor;
        const handleMat = isBlue ? this.materials.silverHandle : this.materials.doorHandle;

        const frameGeo = new THREE.BoxGeometry(1.6, 2.6, 0.2);
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.y = 1.3;
        group.add(frame);

        const panelGeo = new THREE.BoxGeometry(1.4, 2.4, 0.12);
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(0, 1.3, 0.01);
        group.add(panel);

        const handleGeo = new THREE.SphereGeometry(0.06, 10, 10);
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.set(0.55, 1.2, 0.1);
        group.add(handle);

        if (isBlue) {
          // Subtle glowing cyan backlight above blue door
          const doorLight = new THREE.PointLight(0x00b4ff, 1.5, 6);
          doorLight.position.set(0, 2.4, 0.4);
          group.add(doorLight);
          this.blueDoorObjects.push(group);
        }

        mesh = group;
        break;
      }
      case 'light': {
        mesh = this.lightingManager.createLightFixture(data);
        this.objectsGroup.add(mesh);
        return;
      }
      case 'prop': {
        const geo = new THREE.BoxGeometry(data.scaleX || 1, data.scaleY || 1, data.scaleZ || 1);
        mesh = new THREE.Mesh(geo, this.materials.prop);
        break;
      }
      case 'entity_spawn': {
        this.entitySystem.createSpawnMarker(data.x, data.z, data.id);
        return;
      }
    }

    if (mesh) {
      mesh.position.set(data.x, data.y, data.z);
      if (data.rotationY) mesh.rotation.y = data.rotationY;
      mesh.userData = { ...data };
      this.objectsGroup.add(mesh);

      if (['wall', 'pillar', 'door', 'prop'].includes(data.type)) {
        const box = new THREE.Box3().setFromObject(mesh);
        this.colliders.push({ box, mesh });
      }
    }
  }

  createExitObject(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const doorGeo = new THREE.BoxGeometry(1.8, 2.8, 0.3);
    const door = new THREE.Mesh(doorGeo, this.materials.exit);
    door.position.y = 1.4;
    group.add(door);

    const exitLight = new THREE.PointLight(0x00ff88, 2.0, 8);
    exitLight.position.y = 1.4;
    group.add(exitLight);

    group.userData = { type: 'exit' };
    this.scene.add(group);
    this.exitObject = group;
  }

  createPlayerSpawnMarker(x, z) {
    if (this.playerSpawnObject) this.scene.remove(this.playerSpawnObject);

    const geo = new THREE.CylinderGeometry(0.5, 0.5, 1.7, 10);
    const marker = new THREE.Mesh(geo, this.materials.spawnMarker);
    marker.position.set(x, 0.85, z);
    marker.userData = { type: 'playerSpawn' };
    this.scene.add(marker);
    this.playerSpawnObject = marker;
  }

  update(time, delta, playerPos) {
    if (this.currentDimension === 'dreamcore' && this.dreamcoreWorld) {
      this.dreamcoreWorld.update(time, delta, playerPos);
      this.atmosphereManager.update(delta);
    } else {
      this.atmosphereManager.update(delta);
      this.lightingManager.update(delta, playerPos);
      this.entitySystem.update(time);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
  }
}

