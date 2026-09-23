// Game Configuration & Default Level Data

export const CONFIG = {
  // Player Settings
  PLAYER: {
    HEIGHT: 1.7,
    CROUCH_HEIGHT: 0.9,
    RADIUS: 0.4,
    WALK_SPEED: 3.5,
    SPRINT_SPEED: 6.5,
    CROUCH_SPEED: 1.8,
    GRAVITY: 9.8,
    STAMINA_MAX: 100,
    STAMINA_DRAIN: 25, // per second when sprinting
    STAMINA_RECOVERY: 15 // per second when resting
  },
  
  // Environment Dimensions
  WALL_HEIGHT: 3.0,
  GRID_SIZE: 2.0, // Snap grid size for editor
  
  // Lighting & Atmosphere
  FOG_COLOR: 0x11130d,
  FOG_NEAR: 2.0,
  FOG_FAR: 22.0,
  AMBIENT_COLOR: 0x4d4936,
  AMBIENT_INTENSITY: 0.45,
  
  // Audio Config
  AUDIO: {
    HUM_VOLUME: 0.15,
    FOOTSTEP_INTERVAL_WALK: 0.45,
    FOOTSTEP_INTERVAL_SPRINT: 0.28,
    FOOTSTEP_INTERVAL_CROUCH: 0.65
  }
};

// Default Level 0 Layout JSON Data
export const DEFAULT_LEVEL = {
  version: 1,
  name: "Level 0 - The Yellow Rooms",
  playerSpawn: { x: 0, y: 1.7, z: 0, rotationY: 0 },
  exit: { x: 14, y: 0, z: -14, rotationY: 0 },
  objects: [
    // Outer boundary walls
    { id: "wall_N1", type: "wall", x: 0, y: 1.5, z: -20, scaleX: 40, scaleY: 3, scaleZ: 0.4, rotationY: 0 },
    { id: "wall_S1", type: "wall", x: 0, y: 1.5, z: 20, scaleX: 40, scaleY: 3, scaleZ: 0.4, rotationY: 0 },
    { id: "wall_W1", type: "wall", x: -20, y: 1.5, z: 0, scaleX: 0.4, scaleY: 3, scaleZ: 40, rotationY: 0 },
    { id: "wall_E1", type: "wall", x: 20, y: 1.5, z: 0, scaleX: 0.4, scaleY: 3, scaleZ: 40, rotationY: 0 },

    // Maze partition walls & corridors
    { id: "wall_m1", type: "wall", x: -10, y: 1.5, z: -10, scaleX: 16, scaleY: 3, scaleZ: 0.4, rotationY: 0 },
    { id: "wall_m2", type: "wall", x: 6, y: 1.5, z: -8, scaleX: 0.4, scaleY: 3, scaleZ: 14, rotationY: 0 },
    { id: "wall_m3", type: "wall", x: -4, y: 1.5, z: 6, scaleX: 18, scaleY: 3, scaleZ: 0.4, rotationY: 0 },
    { id: "wall_m4", type: "wall", x: 10, y: 1.5, z: 8, scaleX: 0.4, scaleY: 3, scaleZ: 16, rotationY: 0 },
    { id: "wall_m5", type: "wall", x: -12, y: 1.5, z: 12, scaleX: 0.4, scaleY: 3, scaleZ: 12, rotationY: 0 },

    // Pillars
    { id: "pillar_1", type: "pillar", x: -6, y: 1.5, z: -4, scaleX: 1.2, scaleY: 3, scaleZ: 1.2, rotationY: 0 },
    { id: "pillar_2", type: "pillar", x: 2, y: 1.5, z: -2, scaleX: 1.2, scaleY: 3, scaleZ: 1.2, rotationY: 0 },
    { id: "pillar_3", type: "pillar", x: 4, y: 1.5, z: 12, scaleX: 1.2, scaleY: 3, scaleZ: 1.2, rotationY: 0 },

    // Fluorescent Lights
    { id: "light_1", type: "light", x: 0, y: 2.85, z: 0, flicker: true },
    { id: "light_2", type: "light", x: -10, y: 2.85, z: -5, flicker: false },
    { id: "light_3", type: "light", x: 10, y: 2.85, z: -14, flicker: true },
    { id: "light_4", type: "light", x: -6, y: 2.85, z: 12, flicker: false },
    { id: "light_5", type: "light", x: 12, y: 2.85, z: 10, flicker: false },
    { id: "light_6", type: "light", x: 14, y: 2.85, z: -14, flicker: true },

    // Props
    { id: "prop_chair1", type: "prop", x: -8, y: 0.4, z: -14, scaleX: 0.8, scaleY: 0.8, scaleZ: 0.8, rotationY: 0.4 },
    { id: "prop_table1", type: "prop", x: -8, y: 0.5, z: -15, scaleX: 1.6, scaleY: 0.8, scaleZ: 1.0, rotationY: 0.1 },

    // Entity Spawn Point
    { id: "entity_spawn_1", type: "entity_spawn", x: -14, y: 0, z: -14 }
  ]
};
