// Game Configuration & Default Level Data

export const CONFIG = {
  // Player Settings
  PLAYER: {
    HEIGHT: 1.7,
    CROUCH_HEIGHT: 0.9,
    RADIUS: 0.4,
    WALK_SPEED: 3.2,
    SPRINT_SPEED: 6.2,
    CROUCH_SPEED: 1.6,
    GRAVITY: 9.8,
    STAMINA_MAX: 100,
    STAMINA_DRAIN: 22,
    STAMINA_RECOVERY: 16
  },
  
  // Environment Dimensions
  WALL_HEIGHT: 3.0,
  GRID_SIZE: 2.0,
  
  // Default Lighting & Atmosphere matching reference image
  ATMOSPHERE: {
    FOG_COLOR: 0x3b3523,
    FOG_DENSITY: 0.016, // Extended corridor visibility down hallways
    AMBIENT_COLOR: 0x61573c,
    AMBIENT_INTENSITY: 0.58, // Bright warm Backrooms yellow illumination
    BLOOM_STRENGTH: 0.35,
    VIGNETTE_STRENGTH: 0.55,
    GRAIN_STRENGTH: 0.035
  },
  
  // Audio Config
  AUDIO: {
    HUM_VOLUME: 0.14,
    DRONE_VOLUME: 0.10,
    FOOTSTEP_INTERVAL_WALK: 0.48,
    FOOTSTEP_INTERVAL_SPRINT: 0.30,
    FOOTSTEP_INTERVAL_CROUCH: 0.68
  },

  // Dreamcore Bright Artificial Environment Config (Matching Reference Image 2)
  DREAMCORE_ATMOSPHERE: {
    FOG_COLOR: "#d6e8e2",
    FOG_DENSITY: 0.002, // Ultra-clear distant visibility
    AMBIENT_COLOR: "#ffffff",
    AMBIENT_INTENSITY: 2.2, // High artificial brightness
    HEMI_SKY: "#ffffff",
    HEMI_GROUND: "#c2d6ce",
    HEMI_INTENSITY: 1.8
  }
};

// Default Level 0 Layout JSON Data matching reference image
export const DEFAULT_LEVEL = {
  version: 2,
  name: "Level 0 - The Yellow Rooms",
  environment: {
    fogColor: "#3b3523",
    fogDensity: 0.016,
    ambientColor: "#61573c",
    ambientIntensity: 0.58
  },
  playerSpawn: { x: 0, y: 1.7, z: 0, rotationY: 0 },
  exit: { x: 18, y: 0, z: -18, rotationY: 0 },
  objects: [
    // Outer boundary walls
    { id: "wall_N1", type: "wall", x: 0, y: 1.5, z: -25, scaleX: 50, scaleY: 3, scaleZ: 0.4, rotationY: 0 },
    { id: "wall_S1", type: "wall", x: 0, y: 1.5, z: 25, scaleX: 50, scaleY: 3, scaleZ: 0.4, rotationY: 0 },
    { id: "wall_W1", type: "wall", x: -25, y: 1.5, z: 0, scaleX: 0.4, scaleY: 3, scaleZ: 50, rotationY: 0 },
    { id: "wall_E1", type: "wall", x: 25, y: 1.5, z: 0, scaleX: 0.4, scaleY: 3, scaleZ: 50, rotationY: 0 },

    // Maze partition walls & corridors
    { id: "wall_m1", type: "wall", x: -10, y: 1.5, z: -12, scaleX: 18, scaleY: 3, scaleZ: 0.4, rotationY: 0 },
    { id: "wall_m2", type: "wall", x: 8, y: 1.5, z: -8, scaleX: 0.4, scaleY: 3, scaleZ: 18, rotationY: 0 },
    { id: "wall_m3", type: "wall", x: -4, y: 1.5, z: 8, scaleX: 22, scaleY: 3, scaleZ: 0.4, rotationY: 0 },
    { id: "wall_m4", type: "wall", x: 12, y: 1.5, z: 10, scaleX: 0.4, scaleY: 3, scaleZ: 20, rotationY: 0 },
    { id: "wall_m5", type: "wall", x: -14, y: 1.5, z: 14, scaleX: 0.4, scaleY: 3, scaleZ: 14, rotationY: 0 },

    // Thick Square Pillars matching reference image
    { id: "pillar_1", type: "pillar", x: -6, y: 1.5, z: -4, scaleX: 2.2, scaleY: 3, scaleZ: 2.2, rotationY: 0 },
    { id: "pillar_2", type: "pillar", x: 4, y: 1.5, z: -2, scaleX: 2.2, scaleY: 3, scaleZ: 2.2, rotationY: 0 },
    { id: "pillar_3", type: "pillar", x: 4, y: 1.5, z: 14, scaleX: 2.2, scaleY: 3, scaleZ: 2.2, rotationY: 0 },
    { id: "pillar_4", type: "pillar", x: -12, y: 1.5, z: 2, scaleX: 2.2, scaleY: 3, scaleZ: 2.2, rotationY: 0 },
    { id: "pillar_5", type: "pillar", x: 14, y: 1.5, z: -14, scaleX: 2.2, scaleY: 3, scaleZ: 2.2, rotationY: 0 },
    { id: "pillar_6", type: "pillar", x: -16, y: 1.5, z: -16, scaleX: 2.2, scaleY: 3, scaleZ: 2.2, rotationY: 0 },

    // Permanent BLUE DOOR (Entrance to the DREAMCORE Dimension)
    { id: "door_blue_dreamcore", type: "door", x: 0, y: 0, z: 24.6, scaleX: 1.6, scaleY: 2.6, scaleZ: 0.2, rotationY: Math.PI, isBlueDoor: true },

    // Red Door (The iconic Red Door of The Last Door)
    { id: "door_red_1", type: "door", x: 8, y: 0, z: -1, scaleX: 1.6, scaleY: 2.6, scaleZ: 0.2, rotationY: 0, isRedDoor: true },
    { id: "door_2", type: "door", x: -4, y: 0, z: 8, scaleX: 1.6, scaleY: 2.6, scaleZ: 0.2, rotationY: Math.PI / 2, isRedDoor: false },

    // Props
    { id: "prop_chair1", type: "prop", x: -8, y: 0.4, z: -16, scaleX: 0.8, scaleY: 0.8, scaleZ: 0.8, rotationY: 0.4 },
    { id: "prop_table1", type: "prop", x: -8, y: 0.5, z: -17, scaleX: 1.6, scaleY: 0.8, scaleZ: 1.0, rotationY: 0.1 },

    // Entity Spawn Point
    { id: "entity_spawn_1", type: "entity_spawn", x: -18, y: 0, z: -18 }
  ]
};
