import * as THREE from 'three';
import {
  createBlueDoorTexture,
  createRedDoorBumpTexture,
  createHallwayWallTexture,
  createHallwayFloorTexture,
  createPoolTileTexture,
  createClassroomCarpetTexture,
  createWaterNormalTexture,
  createLightPanelTexture
} from './textures.js';

export class DreamcoreWorld {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.colliders = [];
    this.blueDoors = [];
    this.waterMesh = null;

    this.initMaterials();
  }

  initMaterials() {
    // Textures
    this.blueDoorTex = createBlueDoorTexture();
    this.blueDoorBumpTex = createRedDoorBumpTexture();
    this.hallwayWallTex = createHallwayWallTexture();
    this.hallwayFloorTex = createHallwayFloorTexture();
    this.poolTileTex = createPoolTileTexture();
    this.classroomCarpetTex = createClassroomCarpetTexture();
    this.waterNormalTex = createWaterNormalTexture();
    this.lightPanelTex = createLightPanelTexture();

    // Geometries
    this.squareHousingGeo = new THREE.BoxGeometry(1.4, 0.06, 1.4);
    this.squareDiffuserGeo = new THREE.PlaneGeometry(1.28, 1.28);

    // Materials
    this.materials = {
      blueDoor: new THREE.MeshStandardMaterial({
        map: this.blueDoorTex,
        bumpMap: this.blueDoorBumpTex,
        bumpScale: 0.03,
        roughness: 0.5,
        metalness: 0.2
      }),
      doorFrame: new THREE.MeshStandardMaterial({
        color: 0x1c2b36,
        roughness: 0.7,
        metalness: 0.2
      }),
      doorHandle: new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        roughness: 0.2,
        metalness: 0.9
      }),
      hallwayWall: new THREE.MeshStandardMaterial({
        map: this.hallwayWallTex,
        roughness: 0.75,
        metalness: 0.02
      }),
      hallwayFloor: new THREE.MeshStandardMaterial({
        map: this.hallwayFloorTex,
        roughness: 0.18, // High gloss reflective linoleum floor matching Reference 1
        metalness: 0.08
      }),
      hallwayCeiling: new THREE.MeshStandardMaterial({
        color: 0xebf2ee,
        roughness: 0.85
      }),
      hallwayDoorPanel: new THREE.MeshStandardMaterial({
        color: 0x3d3228,
        roughness: 0.8
      }),
      // Square Recessed Ceiling Light Materials (Matching Reference Image 2!)
      squareHousingMat: new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.6
      }),
      squareDiffuserMat: new THREE.MeshStandardMaterial({
        map: this.lightPanelTex,
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: 4.5,
        roughness: 0.1,
        metalness: 0.0,
        side: THREE.DoubleSide
      }),
      // Classroom Materials
      classroomWall: new THREE.MeshStandardMaterial({
        color: 0x3d4754,
        roughness: 0.85
      }),
      classroomCarpet: new THREE.MeshStandardMaterial({
        map: this.classroomCarpetTex,
        roughness: 0.92,
        metalness: 0.01
      }),
      classroomChairPlastic: new THREE.MeshStandardMaterial({
        color: 0x2b5488, // Blue plastic school chair matching Reference 3
        roughness: 0.4,
        metalness: 0.05
      }),
      classroomMetalLegs: new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.3,
        metalness: 0.8
      }),
      classroomDeskWood: new THREE.MeshStandardMaterial({
        color: 0x735742,
        roughness: 0.7
      }),
      signCanvas: new THREE.MeshBasicMaterial({
        color: 0xff4444
      }),

      // Pool Area Materials (Reference 2)
      poolTile: new THREE.MeshStandardMaterial({
        map: this.poolTileTex,
        color: 0xffffff,
        roughness: 0.22, // Glossy ceramic tile reflections matching Reference 2
        metalness: 0.05
      }),
      poolCeiling: new THREE.MeshStandardMaterial({
        map: this.poolTileTex,
        color: 0xffffff,
        roughness: 0.4
      }),
      poolWater: new THREE.MeshStandardMaterial({
        color: 0x00b8b0, // Vibrant turquoise/teal water matching Reference 2
        roughness: 0.05,
        metalness: 0.1,
        transparent: true,
        opacity: 0.82,
        normalMap: this.waterNormalTex,
        normalScale: new THREE.Vector2(0.4, 0.4)
      })
    };
  }

  build() {
    this.clear();

    // 1. Entrance & Return Blue Door
    this.buildEntranceBlueDoor();

    // 2. Area 1: Long Hallway (Reference 1)
    this.buildLongHallway();

    // 3. Area 3: Dark Classroom (Reference 3)
    this.buildDarkClassroom();

    // 4. Area 2: Indoor Pool (Reference 2)
    this.buildIndoorPool();

    // High Performance Regional Dynamic Light Pool (Bright Artificial Illumination - 60+ FPS)
    this.playerLight = new THREE.PointLight(0xfff8eb, 4.0, 45);
    this.playerLight.position.set(0, 2.4, 0);
    this.group.add(this.playerLight);

    this.poolLight1 = new THREE.PointLight(0xfff9ee, 4.5, 50);
    this.poolLight1.position.set(0, 3.8, -118);
    this.group.add(this.poolLight1);

    this.classroomLight = new THREE.PointLight(0xfff5e6, 3.5, 40);
    this.classroomLight.position.set(12.5, 2.8, -40);
    this.group.add(this.classroomLight);

    this.scene.add(this.group);
    return {
      group: this.group,
      colliders: this.colliders,
      blueDoors: this.blueDoors,
      waterMesh: this.waterMesh
    };
  }

  addCollider(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    this.colliders.push({ box, mesh });
  }

  createSquareCeilingLight(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const housing = new THREE.Mesh(this.squareHousingGeo, this.materials.squareHousingMat);
    housing.position.y = 0.03;
    group.add(housing);

    const diffuser = new THREE.Mesh(this.squareDiffuserGeo, this.materials.squareDiffuserMat);
    diffuser.rotation.x = -Math.PI / 2;
    diffuser.position.y = -0.015;
    group.add(diffuser);

    this.group.add(group);
    return group;
  }

  buildEntranceBlueDoor() {
    const doorGroup = this.createBlueDoorMesh();
    doorGroup.position.set(0, 0, 1.8);
    doorGroup.rotation.y = 0;
    doorGroup.userData = { isBlueDoor: true, isReturnDoor: true };

    this.group.add(doorGroup);
    this.blueDoors.push(doorGroup);

    // Wall behind return door to seal entrance corridor back
    const backWallGeo = new THREE.BoxGeometry(6, 3.5, 0.4);
    const backWall = new THREE.Mesh(backWallGeo, this.materials.hallwayWall);
    backWall.position.set(0, 1.75, 2.0);
    this.group.add(backWall);
    this.addCollider(backWall);
  }

  createBlueDoorMesh() {
    const group = new THREE.Group();

    // Frame
    const frameGeo = new THREE.BoxGeometry(1.6, 2.6, 0.2);
    const frame = new THREE.Mesh(frameGeo, this.materials.doorFrame);
    frame.position.y = 1.3;
    group.add(frame);

    // Panel
    const panelGeo = new THREE.BoxGeometry(1.4, 2.4, 0.12);
    const panel = new THREE.Mesh(panelGeo, this.materials.blueDoor);
    panel.position.set(0, 1.3, 0.01);
    group.add(panel);

    // Silver Handle
    const handleGeo = new THREE.SphereGeometry(0.06, 10, 10);
    const handle = new THREE.Mesh(handleGeo, this.materials.doorHandle);
    handle.position.set(0.55, 1.2, 0.1);
    group.add(handle);

    // Subtle blue glow light over door frame
    const doorLight = new THREE.PointLight(0x00aaff, 1.5, 8);
    doorLight.position.set(0, 2.4, 0.4);
    group.add(doorLight);

    return group;
  }

  /**
   * AREA 1 — LONG HALLWAY
   * Matching Reference Image 1 & 2: Pale white/slightly green walls, glossy floor,
   * repeating square recessed ceiling lights, repeating side doors.
   */
  buildLongHallway() {
    const hallwayLength = 90; // z: 2.0 to -88
    const width = 5.0;
    const height = 3.2;
    const halfW = width / 2;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(width, hallwayLength);
    const floor = new THREE.Mesh(floorGeo, this.materials.hallwayFloor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -hallwayLength / 2 + 2);
    this.group.add(floor);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(width, hallwayLength);
    const ceiling = new THREE.Mesh(ceilingGeo, this.materials.hallwayCeiling);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, height, -hallwayLength / 2 + 2);
    this.group.add(ceiling);

    // Left Wall
    const leftWallGeo = new THREE.BoxGeometry(0.4, height, hallwayLength);
    const leftWall = new THREE.Mesh(leftWallGeo, this.materials.hallwayWall);
    leftWall.position.set(-halfW - 0.2, height / 2, -hallwayLength / 2 + 2);
    this.group.add(leftWall);
    this.addCollider(leftWall);

    // Right Wall (with opening for Classroom Branch at z: -30 to -40)
    const rightWallSeg1Geo = new THREE.BoxGeometry(0.4, height, 32);
    const rightWallSeg1 = new THREE.Mesh(rightWallSeg1Geo, this.materials.hallwayWall);
    rightWallSeg1.position.set(halfW + 0.2, height / 2, -14);
    this.group.add(rightWallSeg1);
    this.addCollider(rightWallSeg1);

    const rightWallSeg2Geo = new THREE.BoxGeometry(0.4, height, 48);
    const rightWallSeg2 = new THREE.Mesh(rightWallSeg2Geo, this.materials.hallwayWall);
    rightWallSeg2.position.set(halfW + 0.2, height / 2, -64);
    this.group.add(rightWallSeg2);
    this.addCollider(rightWallSeg2);

    // Repeating Square Recessed Ceiling Light Panels (Matching Reference Image 2!)
    for (let z = 0; z > -86; z -= 4.5) {
      this.createSquareCeilingLight(0, height - 0.02, z, 0xfff4e0, 2.2, 18);
    }

    // Repeating Wooden Doors & Wall Panels along Hallway (Reference 1)
    for (let z = -8; z > -84; z -= 12) {
      // Left side doors
      const doorL = this.createSimpleHallwayDoor();
      doorL.position.set(-halfW + 0.05, 0, z);
      doorL.rotation.y = Math.PI / 2;
      this.group.add(doorL);

      // Right side doors (skip classroom opening around z = -35)
      if (z > -28 || z < -42) {
        const doorR = this.createSimpleHallwayDoor();
        doorR.position.set(halfW - 0.05, 0, z - 3);
        doorR.rotation.y = -Math.PI / 2;
        this.group.add(doorR);
      }
    }
  }

  createSimpleHallwayDoor() {
    const group = new THREE.Group();
    const frameGeo = new THREE.BoxGeometry(1.4, 2.5, 0.16);
    const frame = new THREE.Mesh(frameGeo, this.materials.doorFrame);
    frame.position.y = 1.25;
    group.add(frame);

    const panelGeo = new THREE.BoxGeometry(1.2, 2.3, 0.1);
    const panel = new THREE.Mesh(panelGeo, this.materials.hallwayDoorPanel);
    panel.position.set(0, 1.25, 0.01);
    group.add(panel);

    return group;
  }

  /**
   * AREA 3 — DARK CLASSROOM
   * Matching Reference Image 3: Patterned dark carpet, student desks and chairs,
   * square recessed ceiling lights, dark doorway with "PLEASE LEAVE" sign.
   */
  buildDarkClassroom() {
    const roomWidth = 20; // x: 2.5 to 22.5
    const roomLength = 24; // z: -28 to -52
    const height = 3.2;

    const centerX = 12.5;
    const centerZ = -40;

    // Connecting Branch Corridor from Hallway (x: 2.5 to 5, z: -32 to -38)
    const corrFloorGeo = new THREE.PlaneGeometry(5, 6);
    const corrFloor = new THREE.Mesh(corrFloorGeo, this.materials.classroomCarpet);
    corrFloor.rotation.x = -Math.PI / 2;
    corrFloor.position.set(5.0, 0, -35);
    this.group.add(corrFloor);

    // Classroom Floor (Dark Geometric Carpet - Reference 3)
    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const floor = new THREE.Mesh(floorGeo, this.materials.classroomCarpet);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(centerX, 0, centerZ);
    this.group.add(floor);

    // Classroom Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const ceiling = new THREE.Mesh(ceilingGeo, this.materials.classroomWall);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(centerX, height, centerZ);
    this.group.add(ceiling);

    // Square Recessed Ceiling Lights for Classroom
    for (let x of [8.0, 12.5, 17.0]) {
      for (let z of [-33.0, -41.0, -48.0]) {
        this.createSquareCeilingLight(x, height - 0.02, z, 0xfff0d6, 2.0, 16);
      }
    }

    // North Wall (z = -52) with Dark Doorway & "PLEASE LEAVE" sign (Reference 3)
    const northWallGeo1 = new THREE.BoxGeometry(8, height, 0.4);
    const nWall1 = new THREE.Mesh(northWallGeo1, this.materials.classroomWall);
    nWall1.position.set(6.5, height / 2, -52);
    this.group.add(nWall1);
    this.addCollider(nWall1);

    const northWallGeo2 = new THREE.BoxGeometry(8, height, 0.4);
    const nWall2 = new THREE.Mesh(northWallGeo2, this.materials.classroomWall);
    nWall2.position.set(18.5, height / 2, -52);
    this.group.add(nWall2);
    this.addCollider(nWall2);

    // Dark Doorway Opening at Center (x: 10.5 to 14.5)
    const darkDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(4.0, height, 0.4), this.materials.classroomWall);
    darkDoorFrame.position.set(12.5, height / 2, -52.2);
    this.group.add(darkDoorFrame);

    // Faint illuminated "PLEASE LEAVE ↑" sign above door (Reference 3)
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256; signCanvas.height = 64;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#222'; sCtx.fillRect(0, 0, 256, 64);
    sCtx.strokeStyle = '#555'; sCtx.lineWidth = 4; sCtx.strokeRect(2, 2, 252, 60);
    sCtx.fillStyle = '#ff6666'; sCtx.font = 'bold 22px sans-serif';
    sCtx.textAlign = 'center'; sCtx.textBaseline = 'middle';
    sCtx.fillText('PLEASE LEAVE ↑', 128, 32);
    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });

    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), signMat);
    signMesh.position.set(12.5, 2.7, -51.75);
    this.group.add(signMesh);

    // South Wall (z = -28)
    const southWallGeo = new THREE.BoxGeometry(roomWidth, height, 0.4);
    const southWall = new THREE.Mesh(southWallGeo, this.materials.classroomWall);
    southWall.position.set(centerX, height / 2, -28);
    this.group.add(southWall);
    this.addCollider(southWall);

    // East Outer Wall (x = 22.5)
    const eastWallGeo = new THREE.BoxGeometry(0.4, height, roomLength);
    const eastWall = new THREE.Mesh(eastWallGeo, this.materials.classroomWall);
    eastWall.position.set(centerX + roomWidth / 2, height / 2, centerZ);
    this.group.add(eastWall);
    this.addCollider(eastWall);

    // Structural Pillars in Classroom (Reference 3)
    const pillarGeo = new THREE.BoxGeometry(1.8, height, 1.8);
    const pillar1 = new THREE.Mesh(pillarGeo, this.materials.classroomWall);
    pillar1.position.set(7.5, height / 2, -44);
    this.group.add(pillar1);
    this.addCollider(pillar1);

    const pillar2 = new THREE.Mesh(pillarGeo, this.materials.classroomWall);
    pillar2.position.set(18.5, height / 2, -44);
    this.group.add(pillar2);
    this.addCollider(pillar2);

    // Classroom Desks & Blue Molded Plastic Chairs (Reference 3)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const deskX = 9.0 + col * 4.2;
        const deskZ = -34.0 - row * 4.5;
        const deskGroup = this.createClassroomDeskChair();
        deskGroup.position.set(deskX, 0, deskZ);
        deskGroup.rotation.y = (Math.random() - 0.5) * 0.3; // Slight natural misalignment
        this.group.add(deskGroup);
        this.addCollider(deskGroup);
      }
    }

    // Stacked blue chairs in corner (Reference 3)
    const stackX = 18.0, stackZ = -34.0;
    for (let i = 0; i < 4; i++) {
      const chair = this.createBlueSchoolChair();
      chair.position.set(stackX, i * 0.18, stackZ + i * 0.02);
      chair.rotation.y = 0.1;
      this.group.add(chair);
    }
  }

  /**
   * Classroom Desk & Blue Molded Plastic Chair Unit (Reference 3)
   */
  createClassroomDeskChair() {
    const group = new THREE.Group();

    // Chair
    const chair = this.createBlueSchoolChair();
    chair.position.set(0, 0, 0);
    group.add(chair);

    // Attached writing tablet arm desk (Reference 3)
    const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45);
    const arm = new THREE.Mesh(armGeo, this.materials.classroomMetalLegs);
    arm.position.set(0.32, 0.65, -0.2);
    group.add(arm);

    const tabletGeo = new THREE.BoxGeometry(0.45, 0.03, 0.4);
    const tablet = new THREE.Mesh(tabletGeo, this.materials.classroomDeskWood);
    tablet.position.set(0.32, 0.85, -0.2);
    group.add(tablet);

    return group;
  }

  /**
   * Blue Molded School Chair (Reference 3)
   */
  createBlueSchoolChair() {
    const group = new THREE.Group();

    // Blue plastic seat shell
    const seatGeo = new THREE.BoxGeometry(0.48, 0.06, 0.44);
    const seat = new THREE.Mesh(seatGeo, this.materials.classroomChairPlastic);
    seat.position.set(0, 0.45, 0);
    group.add(seat);

    // Blue plastic backrest with vertical vent slots
    const backGeo = new THREE.BoxGeometry(0.46, 0.45, 0.05);
    const back = new THREE.Mesh(backGeo, this.materials.classroomChairPlastic);
    back.position.set(0, 0.72, 0.2);
    group.add(back);

    // Metal tube legs
    const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45);
    const offsets = [
      [-0.2, 0.225, -0.18],
      [0.2, 0.225, -0.18],
      [-0.2, 0.225, 0.18],
      [0.2, 0.225, 0.18]
    ];

    offsets.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, this.materials.classroomMetalLegs);
      leg.position.set(x, y, z);
      group.add(leg);
    });

    return group;
  }

  /**
   * AREA 2 — INDOOR SWIMMING POOL
   * Matching Reference Image 2: Small square ceramic tiles covering walls and pillars,
   * dense grid of square recessed ceiling panel lights, huge deep turquoise water basin,
   * bright warm-white/teal ambient and point illumination across the entire pool room!
   */
  buildIndoorPool() {
    const poolRoomWidth = 44;  // x: -22 to +22
    const poolRoomLength = 60; // z: -88 to -148
    const height = 5.0;

    const centerZ = -118;

    // Floor / Raised Tiled Deck surrounding pool
    const deckGeo = new THREE.PlaneGeometry(poolRoomWidth, poolRoomLength);
    const deck = new THREE.Mesh(deckGeo, this.materials.poolTile);
    deck.rotation.x = -Math.PI / 2;
    deck.position.set(0, 0, centerZ);
    this.group.add(deck);

    // Ceiling covered in Small Square Tiles matching Reference Image 2!
    const ceilingGeo = new THREE.PlaneGeometry(poolRoomWidth, poolRoomLength);
    const ceiling = new THREE.Mesh(ceilingGeo, this.materials.poolCeiling);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, height, centerZ);
    this.group.add(ceiling);

    // DENSE GRID OF SQUARE RECESSED CEILING LIGHTS (Directly matching Reference Image 2!)
    const poolCeilingY = height - 0.02;
    for (let px = -16; px <= 16; px += 6.5) {
      for (let pz = -94; pz >= -144; pz -= 6.5) {
        this.createSquareCeilingLight(px, poolCeilingY, pz, 0xfff6e3, 2.5, 24);
      }
    }

    // Tiled Outer Walls
    // North Far Wall (z = -148) with Dark Archway Openings (Reference 2)
    const northWallGeo1 = new THREE.BoxGeometry(16, height, 0.4);
    const nWall1 = new THREE.Mesh(northWallGeo1, this.materials.poolTile);
    nWall1.position.set(-14, height / 2, -148);
    this.group.add(nWall1);
    this.addCollider(nWall1);

    const northWallGeo2 = new THREE.BoxGeometry(16, height, 0.4);
    const nWall2 = new THREE.Mesh(northWallGeo2, this.materials.poolTile);
    nWall2.position.set(14, height / 2, -148);
    this.group.add(nWall2);
    this.addCollider(nWall2);

    // Center Tiled Arch Structure between doorways
    const nWallCenter = new THREE.Mesh(new THREE.BoxGeometry(4, height, 0.4), this.materials.poolTile);
    nWallCenter.position.set(0, height / 2, -148);
    this.group.add(nWallCenter);
    this.addCollider(nWallCenter);

    // Dark Archway Voids (Reference 2)
    const voidMat = new THREE.MeshBasicMaterial({ color: 0x020405 });
    const void1 = new THREE.Mesh(new THREE.PlaneGeometry(4, 3.5), voidMat);
    void1.position.set(-5, 1.75, -147.7);
    this.group.add(void1);

    const void2 = new THREE.Mesh(new THREE.PlaneGeometry(4, 3.5), voidMat);
    void2.position.set(5, 1.75, -147.7);
    this.group.add(void2);

    // West Wall (x = -22)
    const westWallGeo = new THREE.BoxGeometry(0.4, height, poolRoomLength);
    const wWall = new THREE.Mesh(westWallGeo, this.materials.poolTile);
    wWall.position.set(-22, height / 2, centerZ);
    this.group.add(wWall);
    this.addCollider(wWall);

    // East Wall (x = +22)
    const eastWallGeo = new THREE.BoxGeometry(0.4, height, poolRoomLength);
    const eWall = new THREE.Mesh(eastWallGeo, this.materials.poolTile);
    eWall.position.set(22, height / 2, centerZ);
    this.group.add(eWall);
    this.addCollider(eWall);

    // Large Tiled Pillars standing around pool (Reference 2)
    const pillarGeo1 = new THREE.CylinderGeometry(1.4, 1.4, height, 24);
    const p1 = new THREE.Mesh(pillarGeo1, this.materials.poolTile);
    p1.position.set(-14, height / 2, -104);
    this.group.add(p1);
    this.addCollider(p1);

    const p2 = new THREE.Mesh(pillarGeo1, this.materials.poolTile);
    p2.position.set(14, height / 2, -104);
    this.group.add(p2);
    this.addCollider(p2);

    const pillarGeo2 = new THREE.BoxGeometry(2.4, height, 2.4);
    const p3 = new THREE.Mesh(pillarGeo2, this.materials.poolTile);
    p3.position.set(-14, height / 2, -136);
    this.group.add(p3);
    this.addCollider(p3);

    const p4 = new THREE.Mesh(pillarGeo2, this.materials.poolTile);
    p4.position.set(14, height / 2, -136);
    this.group.add(p4);
    this.addCollider(p4);

    // Huge Recessed Swimming Pool Basin (x: -12 to +12, z: -98 to -140, y: -2.0)
    const basinW = 24, basinL = 40, basinDepth = 2.0;

    // Basin Floor
    const basinFloorGeo = new THREE.PlaneGeometry(basinW, basinL);
    const basinFloor = new THREE.Mesh(basinFloorGeo, this.materials.poolTile);
    basinFloor.rotation.x = -Math.PI / 2;
    basinFloor.position.set(0, -basinDepth, -119);
    this.group.add(basinFloor);

    // Basin Side Walls
    const bWallW = new THREE.Mesh(new THREE.BoxGeometry(0.3, basinDepth, basinL), this.materials.poolTile);
    bWallW.position.set(-basinW / 2, -basinDepth / 2, -119);
    this.group.add(bWallW);

    const bWallE = new THREE.Mesh(new THREE.BoxGeometry(0.3, basinDepth, basinL), this.materials.poolTile);
    bWallE.position.set(basinW / 2, -basinDepth / 2, -119);
    this.group.add(bWallE);

    const bWallN = new THREE.Mesh(new THREE.BoxGeometry(basinW, basinDepth, 0.3), this.materials.poolTile);
    bWallN.position.set(0, -basinDepth / 2, -119 - basinL / 2);
    this.group.add(bWallN);

    const bWallS = new THREE.Mesh(new THREE.BoxGeometry(basinW, basinDepth, 0.3), this.materials.poolTile);
    bWallS.position.set(0, -basinDepth / 2, -119 + basinL / 2);
    this.group.add(bWallS);

    // Vibrant Deep Turquoise/Teal Water Surface Mesh (Reference 2)
    const waterGeo = new THREE.PlaneGeometry(basinW - 0.2, basinL - 0.2, 32, 32);
    this.waterMesh = new THREE.Mesh(waterGeo, this.materials.poolWater);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(0, -0.25, -119);
    this.group.add(this.waterMesh);

    // Subtle Underwater Glowing Point Light
    const poolLight = new THREE.PointLight(0x00f0e6, 3.0, 35);
    poolLight.position.set(0, -0.8, -119);
    this.group.add(poolLight);
  }

  update(time, delta, playerPos) {
    // Animate water normal map movement
    if (this.waterNormalTex) {
      this.waterNormalTex.offset.x = (time * 0.03) % 1;
      this.waterNormalTex.offset.y = (time * 0.02) % 1;
    }

    // Dynamic Player Following Light for Smooth 60+ FPS Local Illumination
    if (playerPos && this.playerLight) {
      this.playerLight.position.set(playerPos.x, 2.4, playerPos.z);
    }
  }

  clear() {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.colliders = [];
    this.blueDoors = [];
    this.waterMesh = null;
  }
}
