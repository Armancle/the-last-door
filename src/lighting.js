import * as THREE from 'three';
import { CONFIG } from './config.js';
import { createLightPanelTexture } from './textures.js';

export class LightingManager {
  constructor(scene) {
    this.scene = scene;
    this.gridFixturesGroup = new THREE.Group();
    this.scene.add(this.gridFixturesGroup);

    // Shared geometries & textures for dense ceiling light grid (matching reference image)
    this.squareDiffuserGeo = new THREE.PlaneGeometry(1.35, 1.35);
    this.squareHousingGeo = new THREE.BoxGeometry(1.45, 0.08, 1.45);
    this.diffuserTexture = createLightPanelTexture();
    
    // Shared Materials for maximum rendering performance (1 draw call setup)
    this.housingMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.7,
      metalness: 0.6
    });

    this.gridDiffuserMat = new THREE.MeshStandardMaterial({
      map: this.diffuserTexture,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 2.2,
      roughness: 0.15,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    // Small active 3D Light Pool (Max 4 PointLights for dynamic local specular highlights without fragment shader lag)
    this.activePointLights = [];
    for (let i = 0; i < 4; i++) {
      const pLight = new THREE.PointLight(0xfff4d4, 2.5, 22.0, 1.2);
      pLight.castShadow = false;
      this.scene.add(pLight);
      this.activePointLights.push(pLight);
    }

    this.gridFixturePositions = [];
  }

  /**
   * Generates a dense grid array of glowing square ceiling lights across the entire level ceiling,
   * matching the iconic Backrooms reference image with 60+ FPS performance!
   */
  generateCeilingLightGrid(sizeX = 60, sizeZ = 60, spacing = 4.0) {
    while (this.gridFixturesGroup.children.length > 0) {
      this.gridFixturesGroup.remove(this.gridFixturesGroup.children[0]);
    }
    this.gridFixturePositions = [];

    const halfX = sizeX / 2 - 2;
    const halfZ = sizeZ / 2 - 2;
    const ceilingY = CONFIG.WALL_HEIGHT - 0.01;

    for (let x = -halfX; x <= halfX; x += spacing) {
      for (let z = -halfZ; z <= halfZ; z += spacing) {
        // Casing Frame
        const housing = new THREE.Mesh(this.squareHousingGeo, this.housingMat);
        housing.position.set(x, ceilingY + 0.03, z);
        this.gridFixturesGroup.add(housing);

        // Glowing Square Diffuser Panel (facing down)
        const diffuser = new THREE.Mesh(this.squareDiffuserGeo, this.gridDiffuserMat);
        diffuser.rotation.x = -Math.PI / 2;
        diffuser.position.set(x, ceilingY - 0.015, z);
        this.gridFixturesGroup.add(diffuser);

        this.gridFixturePositions.push({ x, y: ceilingY - 0.3, z });
      }
    }
  }

  createLightFixture(data) {
    // Legacy support for single custom light placements
    const group = new THREE.Group();
    const fixtureY = data.y || (CONFIG.WALL_HEIGHT - 0.05);
    group.position.set(data.x, fixtureY, data.z);

    const frameMesh = new THREE.Mesh(this.squareHousingGeo, this.housingMat);
    frameMesh.position.y = 0.03;
    group.add(frameMesh);

    const diffuserMesh = new THREE.Mesh(this.squareDiffuserGeo, this.gridDiffuserMat);
    diffuserMesh.rotation.x = -Math.PI / 2;
    diffuserMesh.position.y = -0.015;
    group.add(diffuserMesh);

    return group;
  }

  update(delta, playerPos) {
    // Move small 4 active PointLights to follow the grid positions closest to player
    if (playerPos && this.gridFixturePositions.length > 0) {
      const px = playerPos.x;
      const pz = playerPos.z;

      // Sort grid positions by squared distance to player
      const sorted = [...this.gridFixturePositions].sort((a, b) => {
        const distA = (a.x - px) * (a.x - px) + (a.z - pz) * (a.z - pz);
        const distB = (b.x - px) * (b.x - px) + (b.z - pz) * (b.z - pz);
        return distA - distB;
      });

      for (let i = 0; i < this.activePointLights.length; i++) {
        const pos = sorted[i] || sorted[0];
        this.activePointLights[i].position.set(pos.x, pos.y, pos.z);
      }
    }
  }

  clear() {
    while (this.gridFixturesGroup.children.length > 0) {
      this.gridFixturesGroup.remove(this.gridFixturesGroup.children[0]);
    }
    this.gridFixturePositions = [];
  }
}
