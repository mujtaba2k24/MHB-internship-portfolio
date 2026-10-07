const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export async function initHero3D(containerId) {
  if (prefersReducedMotion) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js");

    const width = container.clientWidth;
    const height = Math.max(container.clientHeight, 300);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 8.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodePositions = [];
    const nodeCount = 28;
    for (let i = 0; i < nodeCount; i += 1) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 2.1 + Math.sin(i * 1.37) * 0.85;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle * 1.4) * 1.05;
      const z = Math.sin(i * 0.9) * 1.35;
      nodePositions.push(new THREE.Vector3(x, y, z));
    }

    const nodeGeometry = new THREE.SphereGeometry(0.07, 18, 18);
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0xb4dfe7,
      emissive: 0x234155,
      roughness: 0.35,
      metalness: 0.22,
    });

    nodePositions.forEach((position) => {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(position);
      nodeGroup.add(node);
    });

    const linePoints = [];
    for (let i = 0; i < nodePositions.length; i += 1) {
      const current = nodePositions[i];
      const next = nodePositions[(i + 1) % nodePositions.length];
      linePoints.push(current, next);
      if (i % 4 === 0) {
        const linked = nodePositions[(i + 8) % nodePositions.length];
        linePoints.push(current, linked);
      }
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x89a8c9,
      transparent: true,
      opacity: 0.45,
    });
    const networkLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    nodeGroup.add(networkLines);

    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);

    const key = new THREE.PointLight(0x9dcad2, 0.9, 30);
    key.position.set(3, 2, 5);
    scene.add(key);

    const fill = new THREE.PointLight(0x9db6d4, 0.65, 25);
    fill.position.set(-3, -1, 4);
    scene.add(fill);

    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      targetX = (px - 0.5) * 0.45;
      targetY = (py - 0.5) * 0.35;
    };

    container.addEventListener("pointermove", onPointerMove);

    const animate = () => {
      nodeGroup.rotation.y += 0.0018;
      nodeGroup.rotation.x += 0.0008;
      nodeGroup.rotation.y += (targetX - nodeGroup.rotation.y * 0.32) * 0.01;
      nodeGroup.rotation.x += (-targetY - nodeGroup.rotation.x * 0.45) * 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 300);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);
  } catch {
    container.innerHTML = "";
  }
}
