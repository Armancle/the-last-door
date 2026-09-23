import * as THREE from 'three';
import { CONFIG } from './config.js';
import { createWallpaperTexture, createCarpetTexture, createCeilingTexture, createLightPanelTexture } from './textures.js';
import { EntitySystem } from './entity.js';

export class World {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.FOG_COLOR);
    this.scene.fog = new THREE.FogExp2(CONFIG.FOG_COLOR, 0.04);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.9;
    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

    // Materials Cache
    this.materials = {
      wall: new THREE.MeshStandardMaterial({
        map: createWallpaperTexture(),
        roughness: 0.85,
        metalness: 0.05
      }),
      floor: new THREE.MeshStandardMaterial({
        map: createCarpetTexture(),
        roughness: 0.95,
        metalness: 0.02
      }),
      ceiling: new THREE.MeshStandardMaterial({
        map: createCeilingTexture(),
        roughness: 0.9,
        metalness: 0.1
      }),
      lightPanel: new THREE.MeshBasicMaterial({
        map: createLightPanelTexture()
      }),
      pillar: new THREE.MeshStandardMaterial({
        map: createWallpaperTexture(),
        roughness: 0.85
      }),
      door: new THREE.MeshStandardMaterial({
        color: 0x4a3b2c,
        roughness: 0.7,
        metalness: 0.2
      }),
      prop: new THREE.MeshStandardMaterial({
        color: 0x3d352c,
        roughness: 0.8
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

    // World Containers & Bounding Boxes for Collisions
    this.objectsGroup = new THREE.Group();
    this.scene.add(this.objectsGroup);
    
    this.colliders = []; // Array of THREE.Box3 for player collision
    this.lights = [];    // Array of point lights for flickering effects
    this.entitySystem = new EntitySystem(this.scene);

    // Environment Meshes (Floor & Ceiling)
    this.floorMesh = null;
    this.ceilingMesh = null;
    this.exitObject = null;
    this.playerSpawnObject = null;

    // Ambient Lighting
    this.ambientLight = new THREE.AmbientLight(CONFIG.AMBIENT_COLOR, CONFIG.AMBIENT_INTENSITY);
    this.scene.add(this.ambientLight);

    // Window Resize Handler
    window.addEventListener('resize', () => this.onWindowResize());
  }

  buildEnvironment(sizeX = 60, sizeZ = 60) {
    // Clean old floor & ceiling
    if (this.floorMesh) this.scene.remove(this.floorMesh);
    if (this.ceilingMesh) this.scene.remove(this.ceilingMesh);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(sizeX, sizeZ);
    this.floorMesh = new THREE.Mesh(floorGeo, this.materials.floor);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.floorMesh.receiveShadow = true;
    this.scene.add(this.floorMesh);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(sizeX, sizeZ);
    this.ceilingMesh = new THREE.Mesh(ceilingGeo, this.materials.ceiling);
    this.ceilingMesh.rotation.x = Math.PI / 2;
    this.ceilingMesh.position.y = CONFIG.WALL_HEIGHT;
    this.scene.add(this.ceilingMesh);
  }

  loadLevel(levelData) {
    // Clear previous objects
    while (this.objectsGroup.children.length > 0) {
      const child = this.objectsGroup.children[0];
      this.objectsGroup.remove(child);
    }
    this.colliders = [];
    this.lights = [];
    this.entitySystem.clear();

    this.buildEnvironment(60, 60);

    // Rebuild objects from levelData JSON
    levelData.objects.forEach(obj => {
      this.createObjectInWorld(obj);
    });

    // Create Exit Object
    if (levelData.exit) {
      this.createExitObject(levelData.exit.x, levelData.exit.z);
    }

    // Create Player Spawn Indicator
    if (levelData.playerSpawn) {
      this.createPlayerSpawnMarker(levelData.playerSpawn.x, levelData.playerSpawn.z);
    }
  }

  createObjectInWorld(data) {
    let mesh = null;

    switch (data.type) {
      case 'wall': {
        const geo = new THREE.BoxGeometry(data.scaleX || 1, data.scaleY || CONFIG.WALL_HEIGHT, data.scaleZ || 1);
        mesh = new THREE.Mesh(geo, this.materials.wall);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        break;
      }
      case 'pillar': {
        const geo = new THREE.BoxGeometry(data.scaleX || 1.2, data.scaleY || CONFIG.WALL_HEIGHT, data.scaleZ || 1.2);
        mesh = new THREE.Mesh(geo, this.materials.pillar);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        break;
      }
      case 'door': {
        const group = new THREE.Group();
        const frameGeo = new THREE.BoxGeometry(1.6, 2.6, 0.2);
        const frame = new THREE.Mesh(frameGeo, this.materials.door);
        frame.position.y = 1.3;
        group.add(frame);
        mesh = group;
        break;
      }
      case 'light': {
        const group = new THREE.Group();
        // Ceiling Fixture Frame
        const fixGeo = new THREE.BoxGeometry(1.2, 0.1, 0.6);
        const fixture = new THREE.Mesh(fixGeo, this.materials.lightPanel);
        fixture.position.y = CONFIG.WALL_HEIGHT - 0.05;
        group.add(fixture);

        // Point Light Source
        const pLight = new THREE.PointLight(0xfff5cc, 1.4, 14, 1.8);
        pLight.position.y = CONFIG.WALL_HEIGHT - 0.25;
        pLight.castShadow = true;
        pLight.shadow.mapSize.width = 512;
        pLight.shadow.mapSize.height = 512;
        group.add(pLight);

        pLight.userData = { flicker: data.flicker || false, initialIntensity: 1.4 };
        this.lights.push(pLight);

        mesh = group;
        break;
      }
      case 'prop': {
        const geo = new THREE.BoxGeometry(data.scaleX || 1, data.scaleY || 1, data.scaleZ || 1);
        mesh = new THREE.Mesh(geo, this.materials.prop);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
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

      // Register collision bounding box if physical object
      if (['wall', 'pillar', 'door', 'prop'].includes(data.type)) {
        const box = new THREE.Box3().setFromObject(mesh);
        this.colliders.push({ box, mesh });
      }
    }
  }

  createExitObject(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Glowing Exit Door Portal Frame
    const doorGeo = new THREE.BoxGeometry(1.8, 2.8, 0.3);
    const door = new THREE.Mesh(doorGeo, this.materials.exit);
    door.position.y = 1.4;
    group.add(door);

    // Glowing PointLight
    const exitLight = new THREE.PointLight(0x00ff88, 2.0, 8);
    exitLight.position.y = 1.4;
    group.add(exitLight);

    group.userData = { type: 'exit' };
    this.scene.add(group);
    this.exitObject = group;
  }

  createPlayerSpawnMarker(x, z) {
    if (this.playerSpawnObject) this.scene.remove(this.playerSpawnObject);

    const geo = new THREE.CylinderGeometry(0.5, 0.5, 1.7, 12);
    const marker = new THREE.Mesh(geo, this.materials.spawnMarker);
    marker.position.set(x, 0.85, z);
    marker.userData = { type: 'playerSpawn' };
    this.scene.add(marker);
    this.playerSpawnObject = marker;
  }

  update(time, delta) {
    // Update Flickering Fluorescent Lights
    this.lights.forEach(light => {
      if (light.userData.flicker && Math.random() < 0.08) {
        light.intensity = Math.random() < 0.3 ? 0.1 : light.userData.initialIntensity * (0.4 + Math.random() * 0.8);
      } else {
        light.intensity = light.userData.initialIntensity;
      }
    });

    // Update Entities
    this.entitySystem.update(time);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
