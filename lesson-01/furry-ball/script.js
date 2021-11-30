console.clear();

let palette = [
  new THREE.Color("#00ffff"),
  new THREE.Color("#ff00ff"),
  new THREE.Color("#ffff00"),
  new THREE.Color("#ffffff"),
];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
if (window.devicePixelRatio > 1.5) {
  renderer.setPixelRatio(2);
}
document.body.appendChild(renderer.domElement);

camera.position.x = 4;
camera.position.y = 0;
camera.position.z = 12;

const linesMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
});
const particlesMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
});

const group = new THREE.Group();
scene.add(group);

let points = [];
const linesGeometry = new THREE.BufferGeometry();
const line = new THREE.LineSegments(linesGeometry, linesMaterial);
group.add(line);

class Particle {
  constructor() {
    this.center = new THREE.Vector3()
      .random()
      .subScalar(0.5)
      .multiplyScalar(40);
    this.r = Math.random() * 1 + 0.1;
    this.theta = Math.random() * Math.PI;
    this.phi = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 0.01 * (Math.random() > 0.5 ? 1 : -1);
    let x = this.center.x + this.r * Math.cos(this.theta) * Math.sin(this.phi);
    let y = this.center.y + this.r * Math.sin(this.theta) * Math.sin(this.phi);
    let z = this.center.z + this.r * Math.cos(this.phi);
    this.pos = new THREE.Vector3(x, y, z);
    x =
      this.center.x +
      this.r * Math.cos(this.theta - Math.PI) * Math.sin(this.phi);
    y =
      this.center.y +
      this.r * Math.sin(this.theta - Math.PI) * Math.sin(this.phi);
    z = this.center.z + this.r * Math.cos(this.phi);
    this.pos2 = new THREE.Vector3(x, y, z);
    this.color = palette[Math.floor(Math.random() * 4)];
    this.color2 = palette[Math.floor(Math.random() * 4)];
  }
  update() {
    this.theta += this.speed;
    this.phi += this.speed;
    let x = this.center.x + this.r * Math.cos(this.theta) * Math.sin(this.phi);
    let y = this.center.y + this.r * Math.sin(this.theta) * Math.sin(this.phi);
    let z = this.center.z + this.r * Math.cos(this.phi);
    this.pos = new THREE.Vector3(x, y, z);
    x =
      this.center.x +
      this.r * Math.cos(this.theta - Math.PI) * Math.sin(this.phi);
    y =
      this.center.y +
      this.r * Math.sin(this.theta - Math.PI) * Math.sin(this.phi);
    z = this.center.z + this.r * Math.cos(this.phi);
    this.pos2 = new THREE.Vector3(x, y, z);
  }
}

const particles = [];
const particlesGeometry = new THREE.BufferGeometry();
let particlesPositions = [];
const particlesColors = [];
for (let i = 0; i < 3000; i++) {
  const p = new Particle();
  if (p.pos.length() > 8) {
    particles.push(p);
    particlesColors.push(p.color.r, p.color.g, p.color.b);
    particlesColors.push(p.color2.r, p.color2.g, p.color2.b);
  }
}

particlesGeometry.setAttribute(
  "color",
  new THREE.Float32BufferAttribute(particlesColors, 3)
);
const particlesMesh = new THREE.LineSegments(
  particlesGeometry,
  particlesMaterial
);
group.add(particlesMesh);

var simplex = new SimplexNoise();

const garden = [];
class Grass {
  constructor() {
    this.theta = Math.random() * Math.PI;
    this.phi = Math.random() * Math.PI * 2;
    let u = Math.cos(this.theta);
    let x = 5.5 * Math.sqrt(1 - u * u) * Math.cos(this.phi);
    let y = 5.5 * Math.sqrt(1 - u * u) * Math.sin(this.phi);
    let z = 5.5 * u;
    this.pos = new THREE.Vector3(x, y, z);
    this.pos2 = new THREE.Vector3();
    this.scale = 5.8 + Math.random() * 0.8;
    let angle = simplex.noise4D(
      this.pos.x * 0.11,
      this.pos.y * 0.11,
      this.pos.z * 0.11,
      13
    );
    this.colorIndex = Math.floor(Math.abs(angle * 4));
    colors.push(
      palette[this.colorIndex].r,
      palette[this.colorIndex].g,
      palette[this.colorIndex].b
    );
    this.colorIndex += 1;
    colors.push(
      palette[this.colorIndex % 4].r,
      palette[this.colorIndex % 4].g,
      palette[this.colorIndex % 4].b
    );
  }

  update(a) {
    const angle =
      simplex.noise4D(this.pos.x * 0.2, this.pos.y * 0.2, this.pos.z * 0.2, a) *
      0.1;

    const u = Math.cos(this.theta + (angle + 0.01));
    this.pos2.x =
      this.scale *
      Math.sqrt(1 - u * u) *
      Math.cos(this.phi + Math.sin((angle + 0.01) * Math.PI));
    this.pos2.y =
      this.scale *
      Math.sqrt(1 - u * u) *
      Math.sin(this.phi + Math.sin((angle + 0.01) * Math.PI));
    this.pos2.z = this.scale * u;

    points.push(this.pos.x, this.pos.y, this.pos.z);
    points.push(this.pos2.x, this.pos2.y, this.pos2.z);
  }
}

let colors = [];
for (let i = 0; i < 40000; i++) {
  const grass = new Grass();
  garden.push(grass);
}
linesGeometry.setAttribute(
  "color",
  new THREE.Float32BufferAttribute(colors, 3)
);

gsap.to(camera.position, {
  x: 38,
  y: 0,
  z: 38,
  yoyoEase: "power2.inOut",
  duration: 10,
  repeat: -1,
  repeatDelay: 1,
});
gsap.to(line.rotation, {
  x: Math.PI * 2,
  z: Math.PI,
  ease: "power2.inOut",
  yoyo: true,
  duration: 10,
  repeat: -1,
  repeatDelay: 1,
});
gsap.to(particlesMesh.rotation, {
  x: -Math.PI,
  z: -Math.PI,
  ease: "power2.inOut",
  yoyo: true,
  duration: 10,
  repeat: -1,
  repeatDelay: 1,
});

function render(a) {
  requestAnimationFrame(render);

  points = [];
  garden.forEach((grass) => {
    grass.update(a * 0.0003);
  });
  linesGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points, 3)
  );

  particlesPositions = [];
  particles.forEach((p) => {
    p.update();
    particlesPositions.push(p.pos.x, p.pos.y, p.pos.z);
    particlesPositions.push(p.pos2.x, p.pos2.y, p.pos2.z);
  });
  particlesGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(particlesPositions, 3)
  );

  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
requestAnimationFrame(render);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
