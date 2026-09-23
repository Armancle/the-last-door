import * as THREE from 'three';

// Entity Placeholder & Spawn Marker System

export class EntitySystem {
  constructor(scene) {
    this.scene = scene;
    this.entities = [];
    this.spawnMarkers = [];
  }

  createSpawnMarker(x, z, id = 'entity_spawn') {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Semi-transparent red glowing ring on floor
    const ringGeo = new THREE.RingGeometry(0.5, 0.7, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff1111,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.02;
    group.add(ring);

    // Vertical indicator line
    const lineGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.6 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.y = 1.25;
    group.add(line);

    group.userData = { id, type: 'entity_spawn' };
    this.scene.add(group);
    this.spawnMarkers.push(group);

    // Also spawn a visual placeholder entity at this marker
    this.spawnPlaceholderEntity(x, z, id);
    return group;
  }

  spawnPlaceholderEntity(x, z, id) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Dark tall eerie silhouette geometry
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.25, 2.2, 12);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x080808,
      roughness: 0.9,
      metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1;
    group.add(body);

    // Eerie glowing red eyes
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 1.9, 0.25);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1, 1.9, 0.25);
    group.add(rightEye);

    group.userData = { id: `entity_${id}`, type: 'entity' };
    this.scene.add(group);
    this.entities.push(group);
  }

  update(time) {
    // Subtle idle bobbing animation for entities
    this.entities.forEach((entity, index) => {
      entity.position.y = Math.sin(time * 2 + index) * 0.06;
      entity.rotation.y = Math.sin(time * 0.8 + index) * 0.2;
    });
  }

  clear() {
    this.spawnMarkers.forEach(m => this.scene.remove(m));
    this.entities.forEach(e => this.scene.remove(e));
    this.spawnMarkers = [];
    this.entities = [];
  }
}
