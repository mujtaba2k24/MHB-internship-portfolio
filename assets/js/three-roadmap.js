const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export async function initRoadmap3D(container) {
  if (!container || prefersReducedMotion) return;

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js");

    const width = container.clientWidth;
    const height = Math.max(container.clientHeight, 250);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 7.4);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const points = [
      new THREE.Vector3(-3.2, 0.15, 0),
      new THREE.Vector3(-1.6, 0.75, -0.4),
      new THREE.Vector3(0, 0.2, 0.2),
      new THREE.Vector3(1.7, 0.9, -0.35),
      new THREE.Vector3(3.3, 0.25, 0),
    ];

    const curve = new THREE.CatmullRomCurve3(points);
    const curveGeometry = new THREE.TubeGeometry(curve, 90, 0.045, 12, false);
    const curveMaterial = new THREE.MeshStandardMaterial({
      color: 0x95b4d0,
      emissive: 0x1d2e3f,
      roughness: 0.42,
      metalness: 0.25,
    });

    const pathway = new THREE.Mesh(curveGeometry, curveMaterial);
    scene.add(pathway);

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    points.forEach((point, index) => {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 26, 26),
        new THREE.MeshStandardMaterial({
          color: 0xb2d7de,
          emissive: 0x22394a,
          roughness: 0.36,
          metalness: 0.24,
        })
      );
      node.position.copy(point);
      nodeGroup.add(node);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.26, 0.015, 12, 40),
        new THREE.MeshStandardMaterial({ color: 0x6ea6b0, transparent: true, opacity: 0.72 })
      );
      ring.position.copy(point);
      ring.rotation.x = Math.PI / 2;
      ring.rotation.y = index * 0.36;
      nodeGroup.add(ring);
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const light = new THREE.DirectionalLight(0xb8d6e2, 0.9);
    light.position.set(2, 2, 2);
    scene.add(light);

    let pointerX = 0;
    const onPointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.42;
    };
    container.addEventListener("pointermove", onPointerMove);

    const animate = () => {
      nodeGroup.rotation.y += 0.002;
      scene.rotation.y += (pointerX - scene.rotation.y) * 0.02;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 250);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);
  } catch {
    container.innerHTML = "";
  }
}
