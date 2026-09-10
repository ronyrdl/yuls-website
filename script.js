import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

const canvas = document.getElementById('bg');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  innerWidth / innerHeight,
  0.1,
  100
);

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));


/* ---------- Luces ---------- */

scene.add(
  new THREE.AmbientLight(0xffffff, 0.45)
);

const pinkLight = new THREE.PointLight(
  0xff7eb6,
  2.6,
  20
);

pinkLight.position.set(2.5, 1.5, 3.5);

scene.add(pinkLight);


const whiteLight = new THREE.PointLight(
  0xffffff,
  1.2,
  20
);

whiteLight.position.set(-3, -1.5, 4);

scene.add(whiteLight);


const backLight = new THREE.PointLight(
  0xff9dc6,
  1.8,
  16
);

backLight.position.set(0, 0, -3.5);

scene.add(backLight);


/* ---------- Corazón blanco ---------- */

function createHeartGeometry() {

  const shape = new THREE.Shape();

  shape.moveTo(5, 5);

  shape.bezierCurveTo(
    5, 5,
    4, 0,
    0, 0
  );

  shape.bezierCurveTo(
    -6, 0,
    -6, 7,
    -6, 7
  );

  shape.bezierCurveTo(
    -6, 11,
    -3, 15.4,
    5, 19
  );

  shape.bezierCurveTo(
    12, 15.4,
    16, 11,
    16, 7
  );

  shape.bezierCurveTo(
    16, 7,
    16, 0,
    10, 0
  );

  shape.bezierCurveTo(
    7, 0,
    5, 5,
    5, 5
  );

  const geometry = new THREE.ExtrudeGeometry(
    shape,
    {
      depth: 1.6,
      bevelEnabled: true,
      bevelThickness: 0.55,
      bevelSize: 0.55,
      bevelSegments: 6,
      curveSegments: 32,
      steps: 1
    }
  );

  geometry.center();

  return geometry;
}


const group = new THREE.Group();


const heart = new THREE.Mesh(
  createHeartGeometry(),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.3,
    emissive: 0x3a1030,
    emissiveIntensity: 0.4
  })
);

group.add(heart);


const heartRim = new THREE.Mesh(
  createHeartGeometry(),
  new THREE.MeshStandardMaterial({
    color: 0xff7eb6,
    roughness: 0.5,
    metalness: 0.2,
    transparent: true,
    opacity: 0.22
  })
);

heartRim.scale.setScalar(1.06);

group.add(heartRim);

scene.add(group);


/* ---------- Partículas ---------- */

const count = innerWidth < 768 ? 800 : 1400;

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

const pink = new THREE.Color(0xff7eb6);


for (let i = 0; i < count; i++) {

  positions[i * 3] =
    (Math.random() - 0.5) * 18;

  positions[i * 3 + 1] =
    (Math.random() - 0.5) * 12;

  positions[i * 3 + 2] =
    (Math.random() - 0.5) * 14;


  const c =
    Math.random() < 0.18
      ? pink.clone().multiplyScalar(
          0.75 + Math.random() * 0.45
        )
      : new THREE.Color().setScalar(
          0.65 + Math.random() * 0.35
        );


  colors[i * 3] = c.r;
  colors[i * 3 + 1] = c.g;
  colors[i * 3 + 2] = c.b;
}


const particlesGeo = new THREE.BufferGeometry();

particlesGeo.setAttribute(
  'position',
  new THREE.BufferAttribute(
    positions,
    3
  )
);

particlesGeo.setAttribute(
  'color',
  new THREE.BufferAttribute(
    colors,
    3
  )
);


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


window.addEventListener(
  'mousemove',
  (e) => {

    targetX =
      (e.clientX / innerWidth - 0.5) * 2;

    targetY =
      (e.clientY / innerHeight - 0.5) * 2;
  }
);


window.addEventListener(
  'touchmove',
  (e) => {

    const touch = e.touches[0];

    targetX =
      (touch.clientX / innerWidth - 0.5) * 2;

    targetY =
      (touch.clientY / innerHeight - 0.5) * 2;
  },
  {
    passive: true
  }
);


/* ---------- Responsivo ---------- */

let heartScale = 0.18;


function layout() {

  const small = innerWidth < 768;

  heartScale = small
    ? 0.14
    : 0.18;

  heart.position.y =
    small
      ? -0.45
      : -0.35;

  camera.position.z =
    small
      ? 6.2
      : 5;
}


layout();


/* ---------- Animación ---------- */

const clock = new THREE.Clock();


function animate() {

  const t = clock.getElapsedTime();


  heart.rotation.z =
    Math.sin(t * 0.45) * 0.1;

  heartRim.rotation.z =
    heart.rotation.z;


  const pulse =
    1 + Math.sin(t * 1.6) * 0.05;


  heart.scale.setScalar(
    heartScale * pulse
  );

  heartRim.scale.setScalar(
    heartScale * 1.06 * pulse
  );


  group.rotation.y +=
    (
      targetX * 0.35 -
      group.rotation.y
    ) * 0.05;


  group.rotation.x +=
    (
      targetY * 0.25 -
      group.rotation.x
    ) * 0.05;


  particles.rotation.y =
    t * 0.02;

  particles.position.y =
    Math.sin(t * 0.5) * 0.25;


  renderer.render(
    scene,
    camera
  );
}


renderer.setAnimationLoop(animate);


/* ---------- Redimensionar ---------- */

window.addEventListener(
  'resize',
  () => {

    camera.aspect =
      innerWidth / innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      innerWidth,
      innerHeight
    );

    layout();
  }
);


/* ---------- Audio ---------- */

const audio =
  document.getElementById('audio');

let audioStarted = false;
let audioStarting = false;


function startAudio() {

  if (
    !audio ||
    audioStarted ||
    audioStarting
  ) {
    return;
  }


  audioStarting = true;

  // Comenzamos prácticamente inaudible
  audio.volume = 0.01;


  const playPromise =
    audio.play();


  if (playPromise !== undefined) {

    playPromise
      .then(() => {

        audioStarted = true;
        audioStarting = false;


        /* ---------- Fade in ---------- */

        let volume = 0.01;

        const ramp = setInterval(() => {

          volume += 0.03;

          if (volume >= 0.4) {

            volume = 0.4;

            clearInterval(ramp);
          }

          audio.volume = volume;

        }, 100);


        console.log(
          '🎵 Música iniciada'
        );

      })
      .catch((error) => {

        audioStarting = false;

        console.log(
          'No se pudo reproducir la música:',
          error
        );
      });
  }
}


/* ---------- Fade del hero y fondo al hacer scroll ---------- */

const hero =
  document.getElementById('hero');

const bg =
  document.getElementById('bg');


function onScroll() {

  const progress =
    Math.min(
      scrollY / (innerHeight * 0.9),
      1
    );


  hero.style.opacity =
    (1 - progress).toFixed(3);


  bg.style.opacity =
    (
      0.9 -
      progress * 0.72
    ).toFixed(3);
}


window.addEventListener(
  'scroll',
  onScroll,
  {
    passive: true
  }
);


onScroll();


/* ---------- Iniciar música con la primera interacción ---------- */

// iPhone / Safari
window.addEventListener(
  'touchstart',
  startAudio,
  {
    once: true,
    passive: true
  }
);


// Escritorio con rueda del mouse
window.addEventListener(
  'wheel',
  startAudio,
  {
    once: true,
    passive: true
  }
);


// Clic
window.addEventListener(
  'click',
  startAudio,
  {
    once: true
  }
);


// Teclado
window.addEventListener(
  'keydown',
  startAudio,
  {
    once: true
  }
);


/* ---------- Reveal al hacer scroll ---------- */

const observer =
  new IntersectionObserver(
    (entries) => {

      entries.forEach(
        (entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              'visible'
            );

            observer.unobserve(
              entry.target
            );
          }
        }
      );
    },
    {
      threshold: 0.25,
      rootMargin:
        '0px 0px -10% 0px'
    }
  );


document
  .querySelectorAll('.reveal')
  .forEach((el) => {

    observer.observe(el);

  });


/* ---------- Pausar en pestañas ocultas ---------- */

document.addEventListener(
  'visibilitychange',
  () => {

    renderer.setAnimationLoop(
      document.hidden
        ? null
        : animate
    );

  }
);