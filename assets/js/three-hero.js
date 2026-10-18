
export async function initHero3D(containerId) {
  const container = document.getElementById(containerId);
  if (!container || container.dataset.hero3dInitialized === "true") return;

  container.dataset.hero3dInitialized = "true";

  let renderer;
  let frameId;
  let observer;
  let disposed = false;

  try {
    const THREE = await import(
      "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js"
    );

    if (!container.isConnected) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 2.1, 13.8);
    camera.lookAt(0, 1.7, 0);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff0d5, 0x76604d, 2.2));

    const sunlight = new THREE.DirectionalLight(0xffdfad, 3.0);
    sunlight.position.set(-5, 8, 7);
    scene.add(sunlight);

    const fill = new THREE.DirectionalLight(0xd8c5a4, 1.2);
    fill.position.set(5, 4, -4);
    scene.add(fill);

    const building = new THREE.Group();
    scene.add(building);

    const mat = (color, roughness = 0.94) =>
      new THREE.MeshStandardMaterial({ color, roughness });

    const stone = mat(0xd8c5a5);
    const lightStone = mat(0xe8d9bd);
    const shadowStone = mat(0xb39a78);
    const roofMat = mat(0x655044);
    const darkRoof = mat(0x49372f);
    const wood = mat(0x624638);
    const glass = mat(0x788064);
    const gold = mat(0xc4a568, 0.65);
    const groundMat = mat(0xc8b697);

    function addBox(parent, material, x, y, z, w, h, d) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        material
      );
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    }

    function addRoof(parent, x, y, z, w, h, d, material) {
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2, 0);
      shape.lineTo(0, h);
      shape.lineTo(w / 2, 0);
      shape.closePath();

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: d,
        bevelEnabled: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z - d / 2);
      parent.add(mesh);
      return mesh;
    }

    function addWindow(parent, x, y, z, scale = 1) {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.scale.setScalar(scale);
      parent.add(group);

      addBox(group, shadowStone, 0, 0, 0, 0.52, 0.9, 0.12);
      addBox(group, glass, 0, 0, 0.075, 0.36, 0.7, 0.04);
      addBox(group, lightStone, 0, 0.48, 0.03, 0.6, 0.1, 0.17);
      addBox(group, lightStone, 0, -0.48, 0.03, 0.6, 0.1, 0.17);
      addBox(group, lightStone, -0.25, 0, 0.03, 0.09, 0.9, 0.17);
      addBox(group, lightStone, 0.25, 0, 0.03, 0.09, 0.9, 0.17);
      addBox(group, wood, 0, 0, 0.105, 0.045, 0.7, 0.025);

      const arch = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        lightStone
      );
      arch.position.set(0, 0.42, 0.015);
      arch.scale.set(1, 0.6, 0.45);
      group.add(arch);

      return group;
    }

    // Main academic building
    addBox(building, stone, 0, 1.65, 0, 7.4, 3.0, 1.65);
    addBox(building, lightStone, 0, 3.2, 0, 7.65, 0.18, 1.82);
    addBox(building, shadowStone, 0, 0.2, 0, 7.7, 0.28, 1.95);
    addBox(building, lightStone, 0, 0.42, 0, 7.5, 0.12, 1.8);

    // Classic triangular pediment
    addRoof(building, 0, 3.27, 0, 7.7, 1.35, 1.9, roofMat);
    addBox(building, lightStone, 0, 3.32, 0.99, 7.4, 0.13, 0.12);

    // Central entrance and broad steps
    addBox(building, darkRoof, 0, 1.0, 0.9, 1.35, 1.75, 0.15);
    addBox(building, wood, 0, 0.94, 1.02, 0.83, 1.55, 0.12);
    addBox(building, gold, 0, 1.0, 1.1, 0.045, 1.45, 0.025);
    addBox(building, lightStone, 0, 1.85, 1.02, 1.55, 0.15, 0.22);
    addBox(building, shadowStone, 0, 0.15, 1.45, 2.4, 0.18, 1.0);
    addBox(building, lightStone, 0, 0.29, 1.35, 2.2, 0.12, 0.8);
    addBox(building, shadowStone, 0, 0.04, 1.65, 2.8, 0.12, 1.1);

    // Symmetrical windows
    [-3.0, -2.0, -1.0, 1.0, 2.0, 3.0].forEach((x) => {
      addWindow(building, x, 1.75, 0.85, 0.86);
      addBox(building, lightStone, x, 0.62, 0.86, 0.58, 0.16, 0.16);
    });

    // Architectural pilasters
    [-3.55, -2.45, -1.45, 1.45, 2.45, 3.55].forEach((x) => {
      addBox(building, lightStone, x, 1.8, 0.88, 0.11, 2.5, 0.13);
      addBox(building, shadowStone, x, 0.57, 0.91, 0.2, 0.12, 0.18);
      addBox(building, shadowStone, x, 3.0, 0.91, 0.2, 0.12, 0.18);
    });

    // Clock tower above the central roof
    const tower = new THREE.Group();
    tower.position.set(0, 4.05, 0);
    building.add(tower);

    addBox(tower, lightStone, 0, 0.55, 0, 1.6, 2.0, 1.5);
    addBox(tower, stone, 0, 1.65, 0, 1.85, 0.22, 1.72);

    // Clock face
    const clock = new THREE.Mesh(
      new THREE.CircleGeometry(0.43, 40),
      mat(0xf1e7d5)
    );
    clock.position.set(0, 0.85, 0.79);
    tower.add(clock);

    const clockRing = new THREE.Mesh(
      new THREE.RingGeometry(0.43, 0.49, 40),
      gold
    );
    clockRing.position.set(0, 0.85, 0.81);
    tower.add(clockRing);

    // Clock hands
    addBox(tower, wood, 0, 0.95, 0.825, 0.035, 0.22, 0.025);
    const hand = addBox(
      tower,
      wood,
      0.075,
      0.84,
      0.827,
      0.17,
      0.035,
      0.025
    );
    hand.rotation.z = -0.5;

    // Tower roof and finial
    addRoof(tower, 0, 1.78, 0, 2.05, 1.2, 1.9, darkRoof);

    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 10),
      gold
    );
    finial.position.set(0, 3.05, 0);
    tower.add(finial);

    // Small roofline details
    [-2.8, -1.4, 1.4, 2.8].forEach((x) => {
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 8),
        gold
      );
      cap.position.set(x, 3.55, 0.1);
      building.add(cap);
    });

    // Foreground courtyard
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(6.5, 64),
      groundMat
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.04, 1);
    building.add(ground);

    // A restrained pathway leading toward the entrance
    addBox(building, lightStone, 0, 0.015, 3.0, 1.25, 0.035, 3.8);

    // Two small formal garden shrubs
    [-4.25, 4.25].forEach((x) => {
      const shrub = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 14, 12),
        glass
      );
      shrub.scale.set(1.0, 0.75, 0.65);
      shrub.position.set(x, 0.34, 1.2);
      building.add(shrub);

      addBox(building, shadowStone, x, 0.08, 1.2, 0.85, 0.12, 0.65);
    });

    // Floating books: subtle academic details, not a game-like effect
    const books = new THREE.Group();
    scene.add(books);

    const bookColors = [
      mat(0x788064),
      mat(0x9a6b55),
      mat(0x49372f),
      mat(0xc2a36b),
    ];

    function addBook(x, y, z, rotation, colorIndex) {
      const book = new THREE.Group();
      book.position.set(x, y, z);
      book.rotation.set(0.08, rotation, -0.12);
      books.add(book);

      addBox(book, bookColors[colorIndex], 0, 0, 0, 0.62, 0.82, 0.13);
      addBox(book, lightStone, 0, 0, 0.075, 0.49, 0.69, 0.018);
      addBox(book, gold, 0, 0, 0.09, 0.04, 0.57, 0.015);
      addBox(book, wood, 0, -0.31, 0.1, 0.36, 0.025, 0.015);

      return book;
    }

    const floatingBooks = [
      addBook(-4.2, 2.7, 0.1, -0.35, 0),
      addBook(4.15, 3.1, -0.2, 0.42, 1),
      addBook(3.9, 0.9, 0.2, -0.2, 2),
    ];

    floatingBooks.forEach((book, i) => {
      book.userData.phase = i * 2.1;
      book.userData.baseY = book.position.y;
    });

    // Tiny antique-gold dust motes
    const dust = [];
    const dustMaterial = new THREE.MeshBasicMaterial({
      color: 0xd6c4a5,
      transparent: true,
      opacity: 0.65,
    });

    for (let i = 0; i < 14; i += 1) {
      const mote = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 8, 8),
        dustMaterial
      );
      mote.position.set(
        (Math.random() - 0.5) * 9,
        Math.random() * 5,
        (Math.random() - 0.5) * 2
      );
      mote.userData.phase = i * 0.7;
      mote.userData.baseY = mote.position.y;
      scene.add(mote);
      dust.push(mote);
    }

    let targetX = 0;
    let targetY = 0;
    let animationTime = 0;
    let isVisible = true;

    function resize() {
      if (!container.isConnected) return;
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 300);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    function animate() {
      if (disposed || !isVisible || document.hidden) return;

      frameId = requestAnimationFrame(animate);

      if (!reducedMotion) {
        animationTime += 0.008;

        building.rotation.y +=
          (targetX * 0.45 - building.rotation.y) * 0.025;
        building.rotation.x +=
          (-targetY * 0.2 - building.rotation.x) * 0.025;

        floatingBooks.forEach((book) => {
          book.position.y =
            book.userData.baseY +
            Math.sin(animationTime + book.userData.phase) * 0.07;
        });

        dust.forEach((mote) => {
          mote.position.y =
            mote.userData.baseY +
            Math.sin(animationTime + mote.userData.phase) * 0.12;
        });
      }

      renderer.render(scene, camera);
    }

    const onPointerMove = (event) => {
      if (reducedMotion) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.35;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.2;
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      cancelAnimationFrame(frameId);
      if (isVisible) animate();
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    observer = new ResizeObserver(resize);
    observer.observe(container);

    resize();
    animate();

    // Release resources if the hero container is removed.
    const cleanup = () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer?.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);

      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => material.dispose());
        }
      });

      renderer.dispose();
      renderer.domElement.remove();
      delete container.dataset.hero3dInitialized;
    };

    const removalObserver = new MutationObserver(() => {
      if (!container.isConnected) {
        removalObserver.disconnect();
        cleanup();
      }
    });

    removalObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } catch (error) {
    console.error("The 3D university scene could not be loaded:", error);
    container.dataset.hero3dInitialized = "false";
    // Keep the existing page and its content intact if WebGL is unavailable.
  }
}
