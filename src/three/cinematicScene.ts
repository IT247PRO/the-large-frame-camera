import * as THREE from 'three';

export interface CinematicSceneObjects {
  group: THREE.Group;
  oceanMesh: THREE.Mesh;
  oceanGeometry: THREE.PlaneGeometry;
  galleyShip: THREE.Group;
  lanternLight: THREE.PointLight;
  moonMesh: THREE.Mesh;
  moonLight: THREE.DirectionalLight;
  foregroundRocks: THREE.Group;
  update: (time: number) => void;
}

export function buildCinematicScene(): CinematicSceneObjects {
  const group = new THREE.Group();
  group.name = 'CinematicFinaleScene';
  group.position.set(0, 0, 0);

  // 1. Ocean Surface with Wave Displacements
  const oceanWidth = 260;
  const oceanSegments = 100;
  const oceanGeometry = new THREE.PlaneGeometry(oceanWidth, oceanWidth, oceanSegments, oceanSegments);
  oceanGeometry.rotateX(-Math.PI / 2);

  // Deep midnight oceanic water material
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x05131e,
    roughness: 0.12,
    metalness: 0.88,
    flatShading: true,
  });

  const oceanMesh = new THREE.Mesh(oceanGeometry, oceanMat);
  oceanMesh.position.set(0, -2.5, 70);
  oceanMesh.receiveShadow = true;
  group.add(oceanMesh);

  // 2. Moon & Celestial Sky
  const moonGroup = new THREE.Group();
  moonGroup.position.set(25, 42, 160);

  const moonGeo = new THREE.SphereGeometry(7.5, 32, 32);
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xf4f1ea });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);
  moonGroup.add(moonMesh);

  // Lunar glow corona
  const coronaGeo = new THREE.SphereGeometry(9.0, 24, 24);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0x8fc8eb,
    transparent: true,
    opacity: 0.18,
    side: THREE.BackSide,
  });
  const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
  moonGroup.add(coronaMesh);
  group.add(moonGroup);

  // Moon Directional Light
  const moonLight = new THREE.DirectionalLight(0xd1e8ff, 1.8);
  moonLight.position.set(25, 45, 160);
  moonLight.target.position.set(0, 0, 35);
  group.add(moonLight);
  group.add(moonLight.target);

  // 3. Ancient Wooden Galley Ship (Midground centerpiece: z ~ 35..40)
  const galleyShip = new THREE.Group();
  galleyShip.position.set(0, -1.8, 42);

  // Procedural Wood Material
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x1f1610,
    roughness: 0.75,
    metalness: 0.1,
  });

  const lightWoodMat = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.65,
    metalness: 0.08,
  });

  const sailMat = new THREE.MeshStandardMaterial({
    color: 0xc8c0b0,
    roughness: 0.9,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  // Hull Geometry (elongated, curved bow and stern)
  const hullGeo = new THREE.BoxGeometry(4.2, 2.6, 18);
  const hull = new THREE.Mesh(hullGeo, woodMat);
  hull.position.y = 0.5;
  hull.castShadow = true;
  galleyShip.add(hull);

  // Raised Poop Deck / Sterncastle
  const sternGeo = new THREE.BoxGeometry(4.0, 2.0, 5.0);
  const stern = new THREE.Mesh(sternGeo, lightWoodMat);
  stern.position.set(0, 2.2, -7.0);
  stern.castShadow = true;
  galleyShip.add(stern);

  // Pointed Bow / Forecastle with Ram
  const bowGeo = new THREE.ConeGeometry(2.4, 5.5, 4);
  const bow = new THREE.Mesh(bowGeo, woodMat);
  bow.rotation.x = Math.PI / 2;
  bow.position.set(0, 1.2, 10.5);
  bow.castShadow = true;
  galleyShip.add(bow);

  // Three Ancient Masts (Main, Fore, Mizzen)
  const mastGeo = new THREE.CylinderGeometry(0.18, 0.24, 15, 16);

  // Main Mast
  const mainMast = new THREE.Mesh(mastGeo, lightWoodMat);
  mainMast.position.set(0, 7.5, 0);
  mainMast.castShadow = true;
  galleyShip.add(mainMast);

  // Fore Mast
  const foreMastGeo = new THREE.CylinderGeometry(0.15, 0.2, 12, 16);
  const foreMast = new THREE.Mesh(foreMastGeo, lightWoodMat);
  foreMast.position.set(0, 6.2, 5.5);
  galleyShip.add(foreMast);

  // Yard Arms (Cross spars)
  const sparGeo = new THREE.CylinderGeometry(0.08, 0.08, 8.5, 12);
  const mainSpar = new THREE.Mesh(sparGeo, woodMat);
  mainSpar.rotation.z = Math.PI / 2;
  mainSpar.position.set(0, 11.5, 0);
  galleyShip.add(mainSpar);

  // Square Furled Canvas Sail
  const sailGeo = new THREE.PlaneGeometry(8.0, 6.5, 8, 8);
  // Add curve to sail for billowing wind
  const sailPos = sailGeo.attributes.position;
  for (let i = 0; i < sailPos.count; i++) {
    const y = sailPos.getY(i);
    sailPos.setZ(i, Math.sin((y + 3) / 6 * Math.PI) * 0.9);
  }
  sailGeo.computeVertexNormals();
  const sail = new THREE.Mesh(sailGeo, sailMat);
  sail.position.set(0, 8.2, 0.2);
  sail.castShadow = true;
  galleyShip.add(sail);

  // Galley Oars extending on port and starboard
  const oarGeo = new THREE.CylinderGeometry(0.04, 0.06, 6.5, 8);
  for (let o = -5; o <= 5; o += 1.8) {
    // Port oar
    const oarL = new THREE.Mesh(oarGeo, lightWoodMat);
    oarL.rotation.z = 0.55;
    oarL.rotation.x = -0.15;
    oarL.position.set(-3.5, 0.2, o);
    galleyShip.add(oarL);

    // Starboard oar
    const oarR = new THREE.Mesh(oarGeo, lightWoodMat);
    oarR.rotation.z = -0.55;
    oarR.rotation.x = -0.15;
    oarR.position.set(3.5, 0.2, o);
    galleyShip.add(oarR);
  }

  // Stern Lantern (Warm amber cinema glow)
  const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
  const lanternMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), lanternMat);
  lanternMesh.position.set(0, 3.6, -9.6);
  galleyShip.add(lanternMesh);

  const lanternLight = new THREE.PointLight(0xe8a33d, 2.5, 25);
  lanternLight.position.set(0, 3.6, -9.6);
  galleyShip.add(lanternLight);

  group.add(galleyShip);

  // 4. Foreground Rocks and Coastal Rigging (Distance z ~ 6..12 for shallow rack focus)
  const foregroundRocks = new THREE.Group();

  // Dark jagged crag material
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x121417,
    roughness: 0.88,
    metalness: 0.15,
    flatShading: true,
  });

  // Left foreground crag
  const rockLGeo = new THREE.DodecahedronGeometry(2.4, 1);
  const rockL = new THREE.Mesh(rockLGeo, rockMat);
  rockL.position.set(-4.5, -0.6, 9.0);
  rockL.scale.set(1.4, 2.2, 1.2);
  rockL.rotation.set(0.4, 0.8, -0.2);
  rockL.castShadow = true;
  foregroundRocks.add(rockL);

  // Foreground Mooring Post & Rigging Ropes on right
  const postGeo = new THREE.CylinderGeometry(0.2, 0.28, 4.5, 12);
  const post = new THREE.Mesh(postGeo, woodMat);
  post.position.set(3.8, 0.2, 7.5);
  post.rotation.z = -0.12;
  post.castShadow = true;
  foregroundRocks.add(post);

  // Coiled nautical rope on post
  const ropeTorusGeo = new THREE.TorusGeometry(0.35, 0.08, 12, 24);
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x5a4a35, roughness: 0.9 });
  for (let r = 0; r < 4; r++) {
    const ropeRing = new THREE.Mesh(ropeTorusGeo, ropeMat);
    ropeRing.rotation.x = Math.PI / 2 + 0.1;
    ropeRing.position.set(3.8, 0.6 + r * 0.15, 7.5);
    foregroundRocks.add(ropeRing);
  }

  // Taut foreground rigging rope stretching into distance
  const guideRopeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.8, 2.2, 7.5),
    new THREE.Vector3(2.5, 0.5, 14.0),
    new THREE.Vector3(1.2, -1.0, 22.0),
  ]);
  const guideRopeGeo = new THREE.TubeGeometry(guideRopeCurve, 20, 0.035, 8, false);
  const guideRope = new THREE.Mesh(guideRopeGeo, ropeMat);
  foregroundRocks.add(guideRope);

  group.add(foregroundRocks);

  // 5. Distant Coastal Island Silhouettes (z ~ 120..150)
  for (let s = 0; s < 4; s++) {
    const islandGeo = new THREE.ConeGeometry(14 + s * 5, 20 + s * 6, 5);
    const island = new THREE.Mesh(islandGeo, new THREE.MeshBasicMaterial({ color: 0x06090f }));
    island.position.set(-60 + s * 40, -4, 130 + s * 15);
    island.rotation.y = s * 1.3;
    group.add(island);
  }

  // Animation logic for wave undulating and ship rocking
  const posAttr = oceanGeometry.attributes.position;
  const initialPositions = posAttr.array.slice();

  const update = (time: number) => {
    // 1. Animate ocean waves
    for (let i = 0; i < posAttr.count; i++) {
      const u = initialPositions[i * 3];
      const w = initialPositions[i * 3 + 2];
      // Multi-frequency wave synthesis
      const wave =
        Math.sin(u * 0.12 + time * 1.8) * 0.45 +
        Math.cos(w * 0.09 + time * 1.4) * 0.55 +
        Math.sin((u + w) * 0.05 + time * 0.9) * 0.35;
      posAttr.setY(i, wave);
    }
    posAttr.needsUpdate = true;

    // 2. Galley Ship gentle roll and pitch on waves
    galleyShip.rotation.z = Math.sin(time * 0.9) * 0.045; // roll
    galleyShip.rotation.x = Math.cos(time * 0.75) * 0.035; // pitch
    galleyShip.position.y = -1.8 + Math.sin(time * 1.4) * 0.22; // heave
  };

  return {
    group,
    oceanMesh,
    oceanGeometry,
    galleyShip,
    lanternLight,
    moonMesh,
    moonLight,
    foregroundRocks,
    update,
  };
}
