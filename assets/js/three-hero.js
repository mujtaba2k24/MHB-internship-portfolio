
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

export async function initHero3D(containerId) {
  const container = document.getElementById(containerId);
  if (!container || prefersReducedMotion) return;

  try {
    const THREE = await import(
      "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js"
    );

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 300);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      width / height,
      0.1,
      100
    );
    camera.position.set(0, 0.15, 10);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Warm, painterly light
    scene.add(new THREE.AmbientLight(0xffeed8, 2.0));

    const sunlight = new THREE.DirectionalLight(0xffd99b, 2.4);
    sunlight.position.set(-3, 5, 7);
    scene.add(sunlight);

    const fillLight = new THREE.PointLight(0xd9a77d, 45, 18);
    fillLight.position.set(4, 1, 5);
    scene.add(fillLight);

    const garden = new THREE.Group();
    scene.add(garden);

    const materials = {
      sage: new THREE.MeshStandardMaterial({
        color: 0x788064,
        roughness: 1,
      }),
      leaf: new THREE.MeshStandardMaterial({
        color: 0x92936a,
        roughness: 1,
      }),
      stem: new THREE.MeshStandardMaterial({
        color: 0x66714d,
        roughness: 1,
      }),
      cream: new THREE.MeshStandardMaterial({
        color: 0xf1dba9,
        roughness: 1,
      }),
      blush: new THREE.MeshStandardMaterial({
        color: 0xc98672,
        roughness: 1,
      }),
      rose: new THREE.MeshStandardMaterial({
        color: 0xb86f67,
        roughness: 1,
      }),
      lavender: new THREE.MeshStandardMaterial({
        color: 0xa69ab7,
        roughness: 1,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: 0xd6ad58,
        roughness: 1,
      }),
    };

    // Soft sun, like late-afternoon light in an old painting
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0xf1d39a })
    );
    sun.position.set(2.7, 1.65, -2.5);
    garden.add(sun);

    // Painterly distant hills
    function makeHill(x, y, z, sx, sy, sz, color) {
      const hill = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 24),
        new THREE.MeshStandardMaterial({
          color,
          roughness: 1,
          flatShading: true,
        })
      );
      hill.position.set(x, y, z);
      hill.scale.set(sx, sy, sz);
      garden.add(hill);
      return hill;
    }

    makeHill(-2.8, -1.25, -3.3, 3.2, 1.2, 0.65, 0xb6b18a);
    makeHill(1.4, -1.45, -3.8, 3.6, 1.0, 0.6, 0xc5a486);
    makeHill(0, -2.15, -1.4, 5.4, 1.0, 0.65, 0x8e9770);

    const stemGeometry = new THREE.CylinderGeometry(
      0.018,
      0.035,
      1,
      7
    );
    const leafGeometry = new THREE.SphereGeometry(1, 10, 8);
    const petalGeometry = new THREE.SphereGeometry(1, 12, 10);
    const centerGeometry = new THREE.SphereGeometry(0.105, 12, 10);

    const flowers = [];
    const petalMaterials = [
      materials.cream,
      materials.blush,
      materials.rose,
      materials.lavender,
      materials.gold,
    ];

    function makeFlower(x, baseY, z, size, colorIndex) {
      const flower = new THREE.Group();
      flower.position.set(x, baseY, z);
      flower.userData.phase = Math.random() * Math.PI * 2;
      flower.userData.sway = 0.035 + Math.random() * 0.035;

      const stemHeight = size * (1.7 + Math.random() * 0.6);
      const stem = new THREE.Mesh(stemGeometry, materials.stem);
      stem.scale.set(1, stemHeight, 1);
      stem.position.y = stemHeight / 2;
      flower.add(stem);

      const bloom = new THREE.Group();
      bloom.position.y = stemHeight;
      flower.add(bloom);

      const petalMaterial = petalMaterials[colorIndex % petalMaterials.length];

      for (let i = 0; i < 7; i += 1) {
        const angle = (i / 7) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        petal.position.set(
          Math.cos(angle) * size * 0.34,
          Math.sin(angle) * size * 0.34,
          0
        );
        petal.scale.set(size * 0.34, size * 0.19, size * 0.12);
        petal.rotation.z = angle;
        bloom.add(petal);
      }

      const center = new THREE.Mesh(centerGeometry, materials.gold);
      center.scale.setScalar(size * 0.75);
      bloom.add(center);

      // Two softly angled leaves
      for (let i = 0; i < 2; i += 1) {
        const leaf = new THREE.Mesh(
          leafGeometry,
          i === 0 ? materials.sage : materials.leaf
        );
        leaf.position.set(
          i === 0 ? -size * 0.18 : size * 0.18,
          stemHeight * (i === 0 ? 0.35 : 0.58),
          0.02
        );
        leaf.scale.set(size * 0.36, size * 0.13, size * 0.08);
        leaf.rotation.z = i === 0 ? -0.48 : 0.48;
        flower.add(leaf);
      }

      garden.add(flower);
      flowers.push(flower);
    }

    // Foreground and middle-distance flowers
    const flowerPositions = [
      [-3.2, -2.0, 0.2, 0.85, 0],
      [-2.5, -2.0, 0.7, 1.05, 1],
      [-1.65, -2.0, -0.2, 0.72, 2],
      [-0.75, -2.0, 0.4, 0.92, 3],
      [0.1, -2.0, 0.1, 0.78, 0],
      [1.05, -2.0, 0.65, 1.05, 4],
      [2.05, -2.0, 0.2, 0.84, 1],
      [3.0, -2.0, 0.45, 1.08, 2],
      [-3.0, -1.6, -1.0, 0.68, 4],
      [-1.9, -1.6, -1.3, 0.7, 0],
      [-0.8, -1.6, -1.0, 0.65, 1],
      [0.5, -1.6, -1.25, 0.7, 3],
      [1.8, -1.6, -1.0, 0.7, 0],
      [2.8, -1.6, -1.2, 0.65, 4],
    ];

    flowerPositions.forEach((item) => makeFlower(...item));

    // A few tiny drifting pollen lights, kept deliberately subtle
    const pollen = [];
    const pollenMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe5b2,
      transparent: true,
      opacity: 0.65,
    });

    for (let i = 0; i < 16; i += 1) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.025 + Math.random() * 0.025, 8, 8),
        pollenMaterial
      );
      dot.position.set(
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.2) * 3,
        Math.random() * 1.5
      );
      dot.userData.phase = Math.random() * Math.PI * 2;
      garden.add(dot);
      pollen.push(dot);
    }

    let targetX = 0;
    let targetY = 0;
    let frameId;
    let animationTime = 0;

    const onPointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.12;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.08;
    };

    container.addEventListener("pointermove", onPointerMove);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      animationTime += 0.008;

      flowers.forEach((flower) => {
        flower.rotation.z =
          Math.sin(animationTime + flower.userData.phase) *
          flower.userData.sway;
      });

      pollen.forEach((dot) => {
        dot.position.y += 0.0015;
        dot.position.x += Math.sin(animationTime + dot.userData.phase) * 0.001;

        if (dot.position.y > 2.5) dot.position.y = -1.8;
      });

      garden.rotation.y += (targetX - garden.rotation.y) * 0.025;
      garden.rotation.x += (-targetY - garden.rotation.x) * 0.025;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 300);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    // Keep the animation paused while the browser tab is hidden.
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
      } else {
        cancelAnimationFrame(frameId);
        animate();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
  } catch (error) {
    console.error("The 3D garden could not be loaded:", error);
    container.innerHTML = "";
  }
}
