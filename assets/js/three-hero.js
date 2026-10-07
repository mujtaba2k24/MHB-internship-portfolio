const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export async function initHero3D(containerId) {
  if (prefersReducedMotion) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, Math.max(container.clientHeight, 240));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(1.1, 0.25, 140, 24);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8ac7ff,
      roughness: 0.28,
      metalness: 0.5,
      transparent: true,
      opacity: 0.58,
    });

    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    const lightA = new THREE.PointLight(0x9fe1cf, 1.1, 30);
    lightA.position.set(3, 2, 4);
    scene.add(lightA);

    const lightB = new THREE.PointLight(0x7dc4ff, 0.7, 30);
    lightB.position.set(-3, -2, 4);
    scene.add(lightB);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const animate = () => {
      knot.rotation.x += 0.0028;
      knot.rotation.y += 0.0034;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      const width = container.clientWidth;
      const height = Math.max(container.clientHeight, 240);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", onResize);
  } catch {
    container.innerHTML = "";
  }
}
