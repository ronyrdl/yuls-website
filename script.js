import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

const canvas = document.getElementById('bg');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

/* ---------- Luces ---------- */
scene.add(new THREE.AmbientLight(0xeef0ff, 0.45));

const purpleLight = new THREE.PointLight(0xb07af7, 2.6, 20);
purpleLight.position.set(2.5, 1.5, 3.5);
scene.add(purpleLight);

const blueLight = new THREE.PointLight(0x8aa8ff, 1.2, 20);
blueLight.position.set(-3, -1.5, 4);
scene.add(blueLight);

const greenLight = new THREE.PointLight(0x5eebc0, 1.8, 16);
greenLight.position.set(0, 0, -3.5);
scene.add(greenLight);

/* ---------- Corazón blanco ---------- */
function createHeartGeometry() {
  const shape = new THREE.Shape();

  shape.moveTo(5, 5);
  shape.bezierCurveTo(5, 5, 4, 0, 0, 0);
  shape.bezierCurveTo(-6, 0, -6, 7, -6, 7);
  shape.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
  shape.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
  shape.bezierCurveTo(16, 7, 16, 0, 10, 0);
  shape.bezierCurveTo(7, 0, 5, 5, 5, 5);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1.6,
    bevelEnabled: true,
    bevelThickness: 0.55,
    bevelSize: 0.55,
    bevelSegments: 6,
    curveSegments: 32,
    steps: 1
  });

  geometry.center();
  return geometry;
}

const group = new THREE.Group();

const heart = new THREE.Mesh(
  createHeartGeometry(),
  new THREE.MeshStandardMaterial({
    color: 0xeae8ff,
    roughness: 0.3,
    metalness: 0.3,
    emissive: 0x2a1040,
    emissiveIntensity: 0.4
  })
);
group.add(heart);

const heartRim = new THREE.Mesh(
  createHeartGeometry(),
  new THREE.MeshStandardMaterial({
    color: 0x6e93fb,
    roughness: 0.5,
    metalness: 0.2,
    transparent: true,
    opacity: 0.22
  })
);
group.add(heartRim);

scene.add(group);

/* ---------- Partículas ---------- */
const count = innerWidth < 768 ? 800 : 1400;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

const purple = new THREE.Color(0xb07af7);

for (let i = 0; i < count; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 18;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 14;

  const c =
    Math.random() < 0.18
      ? purple.clone().multiplyScalar(0.75 + Math.random() * 0.45)
      : new THREE.Color().setScalar(0.65 + Math.random() * 0.35);

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
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.6
  })
);
scene.add(particles);

/* ---------- Interacción con el mouse / táctil ---------- */
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
let heartScale = 0.18;

function layout() {
  const small = innerWidth < 768;

  heartScale = small ? 0.14 : 0.18;
  heart.position.y = small ? -0.45 : -0.35;

  camera.position.z = small ? 6.2 : 5;
}

/* ---------- Animación ---------- */
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  heart.rotation.z = Math.sin(t * 0.45) * 0.1;
  heartRim.rotation.z = heart.rotation.z;

  const pulse = 1 + Math.sin(t * 1.6) * 0.05;
  heart.scale.setScalar(heartScale * pulse);
  heartRim.scale.setScalar(heartScale * 1.06 * pulse);

  group.rotation.y += (targetX * 0.35 - group.rotation.y) * 0.05;
  group.rotation.x += (targetY * 0.25 - group.rotation.x) * 0.05;

  particles.rotation.y = t * 0.02;
  particles.position.y = Math.sin(t * 0.5) * 0.25;

  renderer.render(scene, camera);
}

layout();
renderer.setAnimationLoop(animate);

/* ---------- Redimensionar ---------- */
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  layout();
});

/* ---------- Audio al empezar a hacer scroll ---------- */
const audio = document.getElementById('audio');
let audioStarted = false;

function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  audio.volume = 0.001;
  audio
    .play()
    .then(() => {
      const ramp = setInterval(() => {
        audio.volume = Math.min(0.9, audio.volume + 0.08);
        if (audio.volume >= 0.9) clearInterval(ramp);
      }, 150);
    })
    .catch(() => {
      audioStarted = false;
      audio.pause();
    });
}

/* ---------- Fade del hero y fondo al hacer scroll ---------- */
const hero = document.getElementById('hero');
const bg = document.getElementById('bg');

function onScroll() {
  if (!audioStarted && scrollY > 8) startAudio();

  const progress = Math.min(scrollY / (innerHeight * 0.9), 1);
  hero.style.opacity = (1 - progress).toFixed(3);
  bg.style.opacity = (0.9 - progress * 0.72).toFixed(3);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Fallback táctil / de clic (iOS usa touchstart) ---------- */
['touchstart', 'touchend', 'click', 'keydown'].forEach((evt) =>
  window.addEventListener(evt, () => {
    if (!audioStarted) startAudio();
  })
);

/* ---------- Reveal al hacer scroll ---------- */
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

/* ---------- Pausar en pestañas ocultas ---------- */
document.addEventListener('visibilitychange', () => {
  renderer.setAnimationLoop(document.hidden ? null : animate);
});