import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { CONFIG } from './config.js';

export const FastHorrorAtmosphereShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'time': { value: 0 },
    'vignetteDarkness': { value: CONFIG.ATMOSPHERE.VIGNETTE_STRENGTH },
    'grainIntensity': { value: CONFIG.ATMOSPHERE.GRAIN_STRENGTH }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float vignetteDarkness;
    uniform float grainIntensity;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      vec4 texColor = texture2D(tDiffuse, uv);
      vec3 color = texColor.rgb;

      // 1. Fast Light Panel Glow (Matches glowing square lights in reference photo)
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      if (luminance > 0.75) {
        color += (color - 0.75) * 0.45;
      }

      // 2. Subtle Corner Vignette
      vec2 distFromCenter = uv - vec2(0.5);
      float dist = length(distFromCenter);
      float vignette = smoothstep(0.85, 0.25, dist * vignetteDarkness);
      color *= vignette;

      // 3. VHS Camera Grain
      float noise = (rand(uv + vec2(time * 0.04)) - 0.5) * grainIntensity;
      color += noise;

      // 4. Iconic Backrooms Yellow VHS Color Grading (Matching reference image)
      vec3 warmTint = color * vec3(1.08, 1.05, 0.88);
      color = mix(color, warmTint, 0.35);

      gl_FragColor = vec4(color, texColor.a);
    }
  `
};

export class AtmospherePostProcessor {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;

    this.composer = new EffectComposer(renderer);
    
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    this.atmospherePass = new ShaderPass(FastHorrorAtmosphereShader);
    this.composer.addPass(this.atmospherePass);
  }

  render(time) {
    if (this.enabled) {
      if (this.atmospherePass.uniforms['time']) {
        this.atmospherePass.uniforms['time'].value = time;
      }
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  setSize(width, height) {
    this.composer.setSize(width, height);
  }

  setCamera(camera) {
    this.camera = camera;
    this.renderPass.camera = camera;
  }
}
