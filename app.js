// Enhanced Three.js Background with Cursor Responsive Elements
function initThreeJS() {
  const canvas = document.getElementById("three-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create a grid floor to represent spatial environment
  const gridHelper = new THREE.GridHelper(40, 40, 0x4a6cf7, 0x1a2238);
  gridHelper.position.y = -8;
  scene.add(gridHelper);

  // Create floating geometric shapes representing virtual objects
  const geometries = [
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.SphereGeometry(0.8, 16, 16),
    new THREE.ConeGeometry(0.7, 1.8, 8),
    new THREE.TorusGeometry(0.9, 0.3, 16, 32),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.CylinderGeometry(0.6, 0.6, 1.8, 16),
    new THREE.DodecahedronGeometry(0.9, 0),
    new THREE.IcosahedronGeometry(0.8, 0),
  ];

  const materials = [
    new THREE.MeshBasicMaterial({ color: 0x4a6cf7, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x6d8aff, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x8aa2ff, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0xa6b9ff, wireframe: true }),
  ];

  const objects = [];
  const objectCount = 15;

  for (let i = 0; i < objectCount; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    const object = new THREE.Mesh(geometry, material);

    // Position objects in a semi-circle formation
    const radius = 10 + Math.random() * 6;
    const angle = (i / objectCount) * Math.PI * 2;

    object.position.x = Math.cos(angle) * radius;
    object.position.y = Math.random() * 6 - 3;
    object.position.z = Math.sin(angle) * radius;

    object.rotation.x = Math.random() * Math.PI;
    object.rotation.y = Math.random() * Math.PI;

    // Store animation properties
    object.userData = {
      initialY: object.position.y,
      speed: 0.5 + Math.random() * 1,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      },
      pulseSpeed: 1 + Math.random(),
      hoverRadius: 0.5 + Math.random() * 1,
    };

    scene.add(object);
    objects.push(object);
  }

  // Create connection lines between objects
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x4a6cf7,
    transparent: true,
    opacity: 0.15,
  });

  let lines = [];

  function createConnections() {
    // Remove existing lines
    lines.forEach((line) => scene.remove(line));
    lines = [];

    // Create connections between nearby objects
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const distance = objects[i].position.distanceTo(objects[j].position);

        if (distance < 12) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            objects[i].position,
            objects[j].position,
          ]);

          const line = new THREE.Line(geometry, lineMaterial);
          scene.add(line);
          lines.push(line);
        }
      }
    }
  }

  // Add a central data core element
  const coreGeometry = new THREE.SphereGeometry(2, 32, 32);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x4a6cf7,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });

  const dataCore = new THREE.Mesh(coreGeometry, coreMaterial);
  scene.add(dataCore);

  // Add particles around the core (scattering burst of dots)
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 500;
  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(posArray, 3)
  );

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    color: 0x6d8aff,
    transparent: true,
    opacity: 0.6,
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x4a6cf7, 0.1);
  scene.add(ambientLight);

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0x6d8aff, 0.5);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  camera.position.z = 18;
  camera.position.y = 5;

  // Mouse interaction for parallax effect
  const mouse = new THREE.Vector2();
  const targetCameraPosition = new THREE.Vector3(0, 5, 18);

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update target camera position based on mouse
    targetCameraPosition.x = mouse.x * 3;
    targetCameraPosition.y = 5 + mouse.y * 2;
  }

  window.addEventListener("mousemove", onMouseMove, false);

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Animate objects with floating motion
    objects.forEach((object) => {
      object.position.y =
        object.userData.initialY +
        Math.sin(elapsedTime * object.userData.speed) *
          object.userData.hoverRadius;

      object.rotation.x += object.userData.rotationSpeed.x;
      object.rotation.y += object.userData.rotationSpeed.y;
      object.rotation.z += object.userData.rotationSpeed.z;

      // Pulsing effect for some objects
      if (object.userData.pulseSpeed > 1.5) {
        const scale =
          1 + Math.sin(elapsedTime * object.userData.pulseSpeed) * 0.1;
        object.scale.set(scale, scale, scale);
      }
    });

    // Animate data core
    dataCore.rotation.y = elapsedTime * 0.3;
    dataCore.rotation.x = elapsedTime * 0.1;

    // Animate particles
    particlesMesh.rotation.y = elapsedTime * 0.1;

    // Update connections
    createConnections();

    // Smooth camera movement
    camera.position.x += (targetCameraPosition.x - camera.position.x) * 0.05;
    camera.position.y += (targetCameraPosition.y - camera.position.y) * 0.05;
    camera.position.z += (targetCameraPosition.z - camera.position.z) * 0.05;

    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Interactive Workspace Visualization
function initWorkspaceThreeJS() {
  const canvas = document.getElementById("workspace-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create a simple workspace environment
  const gridHelper = new THREE.GridHelper(20, 20, 0x4a6cf7, 0x1a1b2e);
  gridHelper.position.y = -2;
  scene.add(gridHelper);

  // Create floating UI elements
  const uiElements = [];
  const geometries = [
    new THREE.BoxGeometry(2, 0.1, 1.5),
    new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32),
    new THREE.SphereGeometry(0.8, 16, 16),
  ];

  const colors = [0x4a6cf7, 0x8a4fff, 0x00d4ff];

  for (let i = 0; i < 6; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.8,
    });

    const element = new THREE.Mesh(geometry, material);

    element.position.x = (Math.random() - 0.5) * 10;
    element.position.y = Math.random() * 4;
    element.position.z = (Math.random() - 0.5) * 10;

    element.rotation.x = Math.random() * Math.PI;
    element.rotation.y = Math.random() * Math.PI;

    scene.add(element);
    uiElements.push(element);
  }

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0x4a6cf7, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  // Camera position
  camera.position.set(0, 5, 12);
  camera.lookAt(0, 0, 0);

  // Animation
  const clock = new THREE.Clock();
  let animationId;

  function animate() {
    animationId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Animate UI elements
    uiElements.forEach((element, index) => {
      element.rotation.y += 0.01;
      element.position.y = 1 + Math.sin(elapsedTime * 0.5 + index) * 0.5;
    });

    // Slowly rotate camera around the scene
    camera.position.x = Math.sin(elapsedTime * 0.1) * 10;
    camera.position.z = Math.cos(elapsedTime * 0.1) * 10;
    camera.lookAt(0, 2, 0);

    renderer.render(scene, camera);
  }

  // Handle resize
  function onResize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  window.addEventListener("resize", onResize);
  animate();

  // Clean up
  window.addEventListener("beforeunload", () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
}

// Spatial Mapping Visualization
function initSpatialThreeJS() {
  const canvas = document.getElementById("spatial-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create a room-like environment
  const roomGeometry = new THREE.BoxGeometry(15, 8, 15);
  const roomMaterial = new THREE.MeshBasicMaterial({
    color: 0x1a1b2e,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });
  const room = new THREE.Mesh(roomGeometry, roomMaterial);
  scene.add(room);

  // Create point cloud representing spatial mapping
  const pointCount = 300;
  const points = new THREE.BufferGeometry();
  const pointPositions = new Float32Array(pointCount * 3);
  const pointColors = new Float32Array(pointCount * 3);

  for (let i = 0; i < pointCount * 3; i += 3) {
    // Distribute points on surfaces of the room
    const surface = Math.floor(Math.random() * 6);
    let x, y, z;

    switch (surface) {
      case 0: // floor
        x = (Math.random() - 0.5) * 14;
        y = -4;
        z = (Math.random() - 0.5) * 14;
        break;
      case 1: // ceiling
        x = (Math.random() - 0.5) * 14;
        y = 4;
        z = (Math.random() - 0.5) * 14;
        break;
      case 2: // front wall
        x = (Math.random() - 0.5) * 14;
        y = (Math.random() - 0.5) * 7;
        z = -7;
        break;
      case 3: // back wall
        x = (Math.random() - 0.5) * 14;
        y = (Math.random() - 0.5) * 7;
        z = 7;
        break;
      case 4: // left wall
        x = -7;
        y = (Math.random() - 0.5) * 7;
        z = (Math.random() - 0.5) * 14;
        break;
      case 5: // right wall
        x = 7;
        y = (Math.random() - 0.5) * 7;
        z = (Math.random() - 0.5) * 14;
        break;
    }

    pointPositions[i] = x;
    pointPositions[i + 1] = y;
    pointPositions[i + 2] = z;

    // Color based on surface
    const color = new THREE.Color();
    color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.7);
    pointColors[i] = color.r;
    pointColors[i + 1] = color.g;
    pointColors[i + 2] = color.b;
  }

  points.setAttribute("position", new THREE.BufferAttribute(pointPositions, 3));
  points.setAttribute("color", new THREE.BufferAttribute(pointColors, 3));

  const pointMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
  });

  const pointCloud = new THREE.Points(points, pointMaterial);
  scene.add(pointCloud);

  // Add objects in the room
  const objects = [];
  const objectGeometries = [
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.CylinderGeometry(1, 1, 3, 8),
    new THREE.SphereGeometry(1.5, 16, 16),
  ];

  for (let i = 0; i < 4; i++) {
    const geometry =
      objectGeometries[Math.floor(Math.random() * objectGeometries.length)];
    const material = new THREE.MeshBasicMaterial({
      color: 0x4a6cf7,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });

    const object = new THREE.Mesh(geometry, material);

    object.position.x = (Math.random() - 0.5) * 10;
    object.position.y = (Math.random() - 0.5) * 3;
    object.position.z = (Math.random() - 0.5) * 10;

    scene.add(object);
    objects.push(object);
  }

  // Camera position
  camera.position.set(0, 0, 20);
  camera.lookAt(0, 0, 0);

  // Animation
  const clock = new THREE.Clock();
  let animationId;

  function animate() {
    animationId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Rotate room and objects
    room.rotation.y = elapsedTime * 0.1;

    objects.forEach((object, index) => {
      object.rotation.y = elapsedTime * (0.2 + index * 0.05);
    });

    // Slowly orbit camera
    camera.position.x = Math.sin(elapsedTime * 0.05) * 20;
    camera.position.z = Math.cos(elapsedTime * 0.05) * 20;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  // Handle resize
  function onResize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  window.addEventListener("resize", onResize);
  animate();

  // Clean up
  window.addEventListener("beforeunload", () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
}

// Hand Tracking Visualization
function initHandThreeJS() {
  const canvas = document.getElementById("hand-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create a simplified hand model
  const handGroup = new THREE.Group();
  scene.add(handGroup);

  // Palm
  const palmGeometry = new THREE.SphereGeometry(1, 16, 16);
  const palmMaterial = new THREE.MeshBasicMaterial({
    color: 0x4a6cf7,
    transparent: true,
    opacity: 0.8,
  });
  const palm = new THREE.Mesh(palmGeometry, palmMaterial);
  handGroup.add(palm);

  // Fingers
  const fingerGeometry = new THREE.CylinderGeometry(0.2, 0.1, 1.5, 8);
  const fingerMaterial = new THREE.MeshBasicMaterial({
    color: 0x8a4fff,
    transparent: true,
    opacity: 0.8,
  });

  const fingers = [];
  const fingerPositions = [
    [1.2, 0, 0], // thumb
    [0.5, 1.2, 0], // index
    [0, 1.4, 0], // middle
    [-0.5, 1.2, 0], // ring
    [-1, 0.8, 0], // pinky
  ];

  fingerPositions.forEach((pos, i) => {
    const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
    finger.position.set(pos[0], pos[1], pos[2]);

    // Rotate fingers to point outward
    if (i === 0) {
      // thumb
      finger.rotation.z = -0.5;
    } else {
      finger.rotation.z = 0.2;
    }

    handGroup.add(finger);
    fingers.push(finger);
  });

  // Add a virtual object to interact with
  const objectGeometry = new THREE.IcosahedronGeometry(0.8, 0);
  const objectMaterial = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    wireframe: true,
    transparent: true,
    opacity: 0.7,
  });
  const virtualObject = new THREE.Mesh(objectGeometry, objectMaterial);
  virtualObject.position.set(3, 0, 0);
  scene.add(virtualObject);

  // Add connection lines between fingers and object (simulating interaction)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x4a6cf7,
    transparent: true,
    opacity: 0.5,
  });

  const lines = [];
  for (let i = 0; i < 5; i++) {
    const lineGeometry = new THREE.BufferGeometry();
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    lines.push(line);
  }

  // Camera position
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  // Animation
  const clock = new THREE.Clock();
  let animationId;

  function animate() {
    animationId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Animate hand gestures
    fingers.forEach((finger, i) => {
      // Simulate finger movement
      const bend = Math.sin(elapsedTime * 2 + i) * 0.3;
      finger.rotation.x = bend;

      // Update connection lines
      if (lines[i]) {
        const points = [];
        points.push(
          new THREE.Vector3(
            finger.position.x + handGroup.position.x,
            finger.position.y + handGroup.position.y,
            finger.position.z + handGroup.position.z
          )
        );
        points.push(
          new THREE.Vector3(
            virtualObject.position.x,
            virtualObject.position.y,
            virtualObject.position.z
          )
        );

        lines[i].geometry.setFromPoints(points);
      }
    });

    // Move virtual object as if being manipulated
    virtualObject.position.x = 3 + Math.sin(elapsedTime) * 1.5;
    virtualObject.position.y = Math.sin(elapsedTime * 1.5) * 1;
    virtualObject.rotation.x = elapsedTime * 0.5;
    virtualObject.rotation.y = elapsedTime * 0.7;

    // Slight hand rotation
    handGroup.rotation.z = Math.sin(elapsedTime * 0.3) * 0.2;

    renderer.render(scene, camera);
  }

  // Handle resize
  function onResize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  window.addEventListener("resize", onResize);
  animate();

  // Clean up
  window.addEventListener("beforeunload", () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
}

// Initialize all Three.js scenes when the page loads
window.addEventListener("load", function () {
  initThreeJS();

  // Initialize interactive visualizations after a short delay
  setTimeout(() => {
    initWorkspaceThreeJS();
    initSpatialThreeJS();
    initHandThreeJS();
  }, 500);
});

// Enhanced Scroll Animations
document.addEventListener("DOMContentLoaded", function () {
  // Header scroll effect
  const header = document.getElementById("header");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  document.querySelectorAll(".fade-in").forEach(function (element) {
    observer.observe(element);
  });

  // Animate stats counters
  function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);

      if (end % 1 === 0) {
        element.textContent = value.toLocaleString();
      } else {
        element.textContent = value.toFixed(1);
      }

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  // Animate stats when they come into view
  const statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const numberElement = entry.target.querySelector(".stat-number");
          const target = parseFloat(numberElement.getAttribute("data-target"));
          animateValue(numberElement, 0, target, 1500);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll(".stat-item").forEach(function (stat) {
    statObserver.observe(stat);
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", function () {
      navLinks.classList.toggle("active");
      mobileMenuBtn.textContent = navLinks.classList.contains("active")
        ? "✕"
        : "☰";
    });
  }

  // Handle window resize for mobile menu
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      navLinks.classList.remove("active");
      mobileMenuBtn.textContent = "☰";
    }
  });
});
