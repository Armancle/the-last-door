import * as THREE from 'three';
import { CONFIG } from './config.js';
import { audioEngine } from './audio.js';

export class AtmosphereManager {
  constructor(scene) {
    this.scene = scene;
    
    // Ambient Light Setup
    this.ambientLight = new THREE.AmbientLight(
      CONFIG.ATMOSPHERE.AMBIENT_COLOR,
      CONFIG.ATMOSPHERE.AMBIENT_INTENSITY
    );
    this.scene.add(this.ambientLight);

    // Artificial Overhead Hemisphere Light (Simulates bright room ceiling reflection)
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xb8d0c8, 0.0);
    this.hemiLight.position.set(0, 10, 0);
    this.scene.add(this.hemiLight);

    // Exponential Fog Setup (Subtle murky distance fog)
    this.scene.background = new THREE.Color(CONFIG.ATMOSPHERE.FOG_COLOR);
    this.scene.fog = new THREE.FogExp2(
      CONFIG.ATMOSPHERE.FOG_COLOR,
      CONFIG.ATMOSPHERE.FOG_DENSITY
    );

    // Current Environment Settings Data State
    this.settings = {
      fogColor: "#221e15",
      fogDensity: 0.038,
      ambientColor: "#3d3829",
      ambientIntensity: 0.38
    };
  }

  applySettings(envData) {
    if (!envData) return;

    if (envData.fogColor !== undefined) {
      this.settings.fogColor = envData.fogColor;
      const color = new THREE.Color(envData.fogColor);
      this.scene.background = color;
      if (this.scene.fog) this.scene.fog.color = color;
    }

    if (envData.fogDensity !== undefined) {
      this.settings.fogDensity = envData.fogDensity;
      if (this.scene.fog) this.scene.fog.density = envData.fogDensity;
    }

    if (envData.ambientColor !== undefined) {
      this.settings.ambientColor = envData.ambientColor;
      this.ambientLight.color.setStyle(envData.ambientColor);
    }

    if (envData.ambientIntensity !== undefined) {
      this.settings.ambientIntensity = envData.ambientIntensity;
      this.ambientLight.intensity = envData.ambientIntensity;
    }

    if (envData.HEMI_INTENSITY !== undefined) {
      this.hemiLight.color.setStyle(envData.HEMI_SKY || "#ffffff");
      this.hemiLight.groundColor.setStyle(envData.HEMI_GROUND || "#c2d6ce");
      this.hemiLight.intensity = envData.HEMI_INTENSITY;
    } else {
      this.hemiLight.intensity = 0.0;
    }
  }

  getSettings() {
    return { ...this.settings };
  }

  update(delta) {
    // Update environmental audio background triggers
    audioEngine.update(delta);
  }
}
