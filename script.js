import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

const canvas = document.getElementById('bg');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

/* ---------- Luces Cálidas ---------- */
scene.add(new THREE.AmbientLight(0xfff6dd, 0.65));

// Luz principal cálida / solar
const sunLight = new THREE.PointLight(0xffbe1a, 2.8, 25);
sunLight.position.set(2.5, 2.5, 4.0);
scene.add(sunLight);

// Luz de relleno ámbar
const amberLight = new THREE.PointLight(0xf59e0b, 1.8, 20);
amberLight.position.set(-3.0, -2.0, 3.5);
scene.add(amberLight);

// Luz trasera para realzar contornos dorados
const rimLight = new THREE.PointLight(0xfde047, 1.8, 16);
rimLight.position.set(0, 2.5, -3.0);
scene.add(rimLight);

// Luz focal suave en el centro de la flor
const centerLight = new THREE.PointLight(0xffedd5, 1.0, 8);
centerLight.position.set(0, 0, 1.4);
scene.add(centerLight);

/* ---------- Geometría de Pétalos de Flor Amarilla ---------- */
function createPetalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.26, 0.4, 0.52, 1.1, 0.54, 1.85);
  shape.bezierCurveTo(0.52, 2.45, 0.26, 2.95, 0, 3.25);
  shape.bezierCurveTo(-0.26, 2.95, -0.52, 2.45, -0.54, 1.85);
  shape.bezierCurveTo(-0.52, 1.1, -0.26, 0.4, 0, 0);

  const extrudeSettings = {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 3,
    curveSegments: 20,
    steps: 1
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // Curvatura natural del pétalo en Z (ondulación orgánica)
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const curve = Math.sin((y / 3.25) * Math.PI) * 0.16;
    pos.setZ(i, z + curve);
  }
  geom.computeVertexNormals();
  return geom;
}

/* ---------- Grupo de la Flor Amarilla Principal ---------- */
const flowerGroup = new THREE.Group();
const petalGeo = createPetalGeometry();

// Materiales de pétalos
const outerPetalMat = new THREE.MeshStandardMaterial({
  color: 0xf5ba18,
  roughness: 0.38,
  metalness: 0.08,
  emissive: 0x5a3500,
  emissiveIntensity: 0.28,
  side: THREE.DoubleSide
});

const innerPetalMat = new THREE.MeshStandardMaterial({
  color: 0xffd53f,
  roughness: 0.32,
  metalness: 0.06,
  emissive: 0x6e4500,
  emissiveIntensity: 0.24,
  side: THREE.DoubleSide
});

// Capa exterior de pétalos (18 pétalos abiertos)
const outerCount = 18;
const outerRadius = 0.72;

for (let i = 0; i < outerCount; i++) {
  const angle = (i / outerCount) * Math.PI * 2;
  const pivot = new THREE.Group();
  pivot.position.set(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius, 0);
  pivot.rotation.z = angle - Math.PI / 2;

  const petal = new THREE.Mesh(petalGeo, outerPetalMat);
  petal.rotation.x = 0.14; // Inclinación suave hacia atrás
  const sc = 0.96 + Math.sin(i * 3.3) * 0.04;
  petal.scale.set(sc, sc, sc);
  pivot.add(petal);
  flowerGroup.add(pivot);
}

// Capa interior de pétalos (16 pétalos más erguidos y brillantes)
const innerCount = 16;
const innerRadius = 0.65;

for (let i = 0; i < innerCount; i++) {
  const angle = ((i + 0.5) / innerCount) * Math.PI * 2;
  const pivot = new THREE.Group();
  pivot.position.set(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius, 0.09);
  pivot.rotation.z = angle - Math.PI / 2;

  const petal = new THREE.Mesh(petalGeo, innerPetalMat);
  petal.rotation.x = 0.28; // Copa hacia adelante
  const sc = 0.88 + Math.cos(i * 2.7) * 0.04;
  petal.scale.set(sc, sc, sc);
  pivot.add(petal);
  flowerGroup.add(pivot);
}

// Botón / Centro aterciopelado del girasol
const centerGeo = new THREE.SphereGeometry(0.85, 36, 18);
centerGeo.scale(1, 1, 0.32);
const centerMat = new THREE.MeshStandardMaterial({
  color: 0x3a1e0d,
  roughness: 0.88,
  metalness: 0.05,
  emissive: 0x1f0e04,
  emissiveIntensity: 0.35
});
const centerMesh = new THREE.Mesh(centerGeo, centerMat);
centerMesh.position.z = 0.14;
flowerGroup.add(centerMesh);

// Corona exterior de polen dorado
const outerRingGeo = new THREE.TorusGeometry(0.78, 0.07, 16, 44);
const ringMat = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  roughness: 0.45,
  metalness: 0.12,
  emissive: 0xb45309,
  emissiveIntensity: 0.45
});
const outerRing = new THREE.Mesh(outerRingGeo, ringMat);
outerRing.position.z = 0.19;
flowerGroup.add(outerRing);

// Anillo interior de detalles florales
const innerRingGeo = new THREE.TorusGeometry(0.45, 0.05, 16, 36);
const innerRingMat = new THREE.MeshStandardMaterial({
  color: 0xd97706,
  roughness: 0.55,
  metalness: 0.1,
  emissive: 0x92400e,
  emissiveIntensity: 0.35
});
const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
innerRing.position.z = 0.22;
flowerGroup.add(innerRing);

// Sépalos verdes del cáliz (detrás de los pétalos)
const sepalGeo = new THREE.ConeGeometry(0.24, 1.2, 5);
sepalGeo.rotateX(-Math.PI / 2);
const sepalMat = new THREE.MeshStandardMaterial({
  color: 0x4d7c0f,
  roughness: 0.7,
  emissive: 0x1f3605,
  emissiveIntensity: 0.2
});
const sepalCount = 10;
for (let i = 0; i < sepalCount; i++) {
  const angle = (i / sepalCount) * Math.PI * 2;
  const pivot = new THREE.Group();
  pivot.position.set(Math.cos(angle) * 0.52, Math.sin(angle) * 0.52, -0.08);
  pivot.rotation.z = angle - Math.PI / 2;
  const sepal = new THREE.Mesh(sepalGeo, sepalMat);
  sepal.rotation.x = -0.22;
  pivot.add(sepal);
  flowerGroup.add(pivot);
}

// Tallo orgánico descendente
const stemCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, -0.5, -0.15),
  new THREE.Vector3(0.1, -1.8, -0.35),
  new THREE.Vector3(-0.08, -3.4, -0.55),
  new THREE.Vector3(0.04, -5.2, -0.75)
]);
const stemGeo = new THREE.TubeGeometry(stemCurve, 20, 0.12, 10, false);
const stemMat = new THREE.MeshStandardMaterial({
  color: 0x3f6212,
  roughness: 0.65,
  metalness: 0.05
});
const stemMesh = new THREE.Mesh(stemGeo, stemMat);
flowerGroup.add(stemMesh);

// Halo de resplandor dorado suave
const haloGeo = new THREE.RingGeometry(0.4, 3.8, 36);
const haloMat = new THREE.MeshBasicMaterial({
  color: 0xfbbf24,
  transparent: true,
  opacity: 0.12,
  side: THREE.DoubleSide
});
const haloMesh = new THREE.Mesh(haloGeo, haloMat);
haloMesh.position.z = -0.25;
flowerGroup.add(haloMesh);

scene.add(flowerGroup);

/* ---------- Pétalos Flotantes en 3D (Lluvia romántica) ---------- */
const floatingPetals = [];
const floatCount = innerWidth < 768 ? 22 : 36;
const floatGeo = petalGeo.clone();
floatGeo.scale(0.24, 0.24, 0.24);

const floatMatA = new THREE.MeshStandardMaterial({
  color: 0xffd53f,
  roughness: 0.35,
  emissive: 0x6e4500,
  emissiveIntensity: 0.2,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.88
});

const floatMatB = new THREE.MeshStandardMaterial({
  color: 0xf5ba18,
  roughness: 0.4,
  emissive: 0x5a3500,
  emissiveIntensity: 0.25,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.88
});

for (let i = 0; i < floatCount; i++) {
  const mesh = new THREE.Mesh(floatGeo, i % 2 === 0 ? floatMatA : floatMatB);
  mesh.position.set(
    (Math.random() - 0.5) * 15,
    (Math.random() - 0.5) * 14,
    (Math.random() - 0.5) * 8
  );
  mesh.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  );
  mesh.userData = {
    speedY: 0.007 + Math.random() * 0.012,
    speedX: (Math.random() - 0.5) * 0.005,
    rotX: (Math.random() - 0.5) * 0.016,
    rotY: (Math.random() - 0.5) * 0.02,
    rotZ: (Math.random() - 0.5) * 0.014,
    wobbleSpeed: 0.8 + Math.random() * 1.4,
    wobbleAmp: 0.005 + Math.random() * 0.006,
    phase: Math.random() * Math.PI * 2
  };
  scene.add(mesh);
  floatingPetals.push(mesh);
}

/* ---------- Partículas de Luz y Polen Dorado ---------- */
const particleCount = innerWidth < 768 ? 650 : 1200;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const colorYellow = new THREE.Color(0xffd53f);
const colorGold = new THREE.Color(0xf59e0b);
const colorBright = new THREE.Color(0xfde047);
const colorIvory = new THREE.Color(0xfffbeb);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 18;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

  const rand = Math.random();
  let c;
  if (rand < 0.4) {
    c = colorYellow.clone().multiplyScalar(0.8 + Math.random() * 0.3);
  } else if (rand < 0.7) {
    c = colorGold.clone().multiplyScalar(0.75 + Math.random() * 0.35);
  } else if (rand < 0.9) {
    c = colorBright.clone().multiplyScalar(0.85 + Math.random() * 0.3);
  } else {
    c = colorIvory.clone().multiplyScalar(0.9 + Math.random() * 0.2);
  }

  colors[i * 3] = c.r;
  colors[i * 3 + 1] = c.g;
  colors[i * 3 + 2] = c.b;
}

const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({
    size: 0.024,
    vertexColors: true,
    transparent: true,
    opacity: 0.75
  })
);
scene.add(particles);

/* ---------- Interacción Mouse / Táctil (Heliotropismo) ---------- */
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (e) => {
  targetX = (e.clientX / innerWidth - 0.5) * 2;
  targetY = (e.clientY / innerHeight - 0.5) * 2;
});

window.addEventListener(
  'touchmove',
  (e) => {
    const touch = e.touches[0];
    targetX = (touch.clientX / innerWidth - 0.5) * 2;
    targetY = (touch.clientY / innerHeight - 0.5) * 2;
  },
  { passive: true }
);

/* ---------- Responsivo ---------- */
let flowerScale = 0.46;

function layout() {
  const small = innerWidth < 768;
  flowerScale = small ? 0.36 : 0.46;
  flowerGroup.position.y = small ? -0.32 : -0.25;
  camera.position.z = small ? 6.2 : 5;
}

/* ---------- Bucle de Animación ---------- */
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  // Suave balanceo orgánico con la brisa
  flowerGroup.rotation.z = Math.sin(t * 0.5) * 0.05;

  // Respiración y florecimiento
  const pulse = 1 + Math.sin(t * 1.5) * 0.035;
  flowerGroup.scale.setScalar(flowerScale * pulse);
  haloMesh.scale.setScalar(1 + Math.sin(t * 1.5) * 0.06);

  // Heliotropismo: la flor orienta sutilmente su cáliz hacia el cursor
  flowerGroup.rotation.y += (targetX * 0.38 - flowerGroup.rotation.y) * 0.05;
  flowerGroup.rotation.x += (-targetY * 0.28 - flowerGroup.rotation.x) * 0.05;

  // Animación de los pétalos flotantes cayendo
  for (let i = 0; i < floatingPetals.length; i++) {
    const p = floatingPetals[i];
    const u = p.userData;
    p.position.y -= u.speedY;
    p.position.x += Math.sin(t * u.wobbleSpeed + u.phase) * u.wobbleAmp + u.speedX;
    p.rotation.x += u.rotX;
    p.rotation.y += u.rotY;
    p.rotation.z += u.rotZ;

    if (p.position.y < -7.5) {
      p.position.y = 7.5;
      p.position.x = (Math.random() - 0.5) * 15;
      p.position.z = (Math.random() - 0.5) * 8;
    }
  }

  // Rotación pausada de partículas de polen
  particles.rotation.y = t * 0.015;
  particles.position.y = Math.sin(t * 0.4) * 0.2;

  renderer.render(scene, camera);
}

layout();
renderer.setAnimationLoop(animate);

/* ---------- Redimensionar Ventana ---------- */
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  layout();
});

/* ---------- Control de Audio y Botón Toggle ---------- */
const audio = document.getElementById('audio');
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');
let isPlaying = false;

function updateMusicUI(playing) {
  isPlaying = playing;
  if (musicToggle) {
    musicToggle.classList.toggle('playing', playing);
  }
  if (musicIcon) {
    musicIcon.textContent = playing ? '🌻' : '🎵';
  }
}

function startAudio() {
  if (!audio || isPlaying) return;
  audio.volume = 0.01;
  audio
    .play()
    .then(() => {
      updateMusicUI(true);
      const ramp = setInterval(() => {
        audio.volume = Math.min(0.9, audio.volume + 0.08);
        if (audio.volume >= 0.9) clearInterval(ramp);
      }, 150);
    })
    .catch(() => {
      updateMusicUI(false);
    });
}

function toggleAudio() {
  if (!audio) return;
  if (audio.paused) {
    audio.volume = 0.8;
    audio.play().then(() => updateMusicUI(true)).catch(() => updateMusicUI(false));
  } else {
    audio.pause();
    updateMusicUI(false);
  }
}

if (musicToggle) {
  musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudio();
  });
}

/* Interacción de inicio táctil o clic general */
['touchstart', 'click', 'keydown'].forEach((evt) =>
  window.addEventListener(
    evt,
    () => {
      if (!isPlaying && audio && audio.paused) {
        startAudio();
      }
    },
    { passive: true }
  )
);

/* ---------- Fade del Hero y Fondo al Scroll ---------- */
const hero = document.getElementById('hero');
const bg = document.getElementById('bg');

function onScroll() {
  if (!isPlaying && scrollY > 8) startAudio();

  const progress = Math.min(scrollY / (innerHeight * 0.85), 1);
  hero.style.opacity = (1 - progress).toFixed(3);
  bg.style.opacity = (0.95 - progress * 0.65).toFixed(3);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Reveal al Scroll ---------- */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

/* ---------- Pausar en Pestañas Ocultas ---------- */
document.addEventListener('visibilitychange', () => {
  renderer.setAnimationLoop(document.hidden ? null : animate);
});