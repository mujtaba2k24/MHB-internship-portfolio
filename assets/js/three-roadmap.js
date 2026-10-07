const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export async function initRoadmap3D(container) {
  if (prefersReducedMotion || !container) {
    if (container) {
      container.innerHTML = "<p class=\"notice\">3D roadmap disabled due to reduced-motion preference.</p>";
    }
    return;
  }

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js");

    const width = container.clientWidth;
    const height = Math.max(container.clientHeight, 220);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x7dc4ff, emissive: 0x13314d });
    const nodeMaterial = new THREE.MeshStandardMaterial({ color: 0x9fe1cf, roughness: 0.3, metalness: 0.2 });

    for (let i = 0; i < 5; i += 1) {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 24), nodeMaterial);
      node.position.set(-2 + i, Math.sin(i * 0.7) * 0.25, 0);
      scene.add(node);

      if (i < 4) {
        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 12), lineMaterial);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(-1.5 + i, Math.sin(i * 0.7) * 0.15, 0);
        scene.add(bridge);
      }
    }

    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(2, 2, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const animate = () => {
      scene.rotation.y += 0.002;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 220);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);
  } catch {
    container.innerHTML = "<p class=\"notice\">3D roadmap unavailable; static roadmap remains accessible.</p>";
  }
}
