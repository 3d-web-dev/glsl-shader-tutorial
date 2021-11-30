const vshader = `
varying vec2 v_uv;
varying vec3 v_position;

void main() {	
  v_uv = uv;
  v_position = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
const fshader = `
#define PI 3.141592653589

varying vec2 v_uv;
varying vec3 v_position;

uniform sampler2D u_tex;
uniform float u_time;
uniform float u_duration;

void main (void)
{
  vec2 p = v_position.xy;
  float len = length(p);
  vec2 ripple = v_uv + p/len * 0.02*cos(len*20.0-u_time*4.0);
  float delta = (sin(mod(u_time, u_duration)*(2.0*PI/u_duration)+1.0)/2.0);
  vec2 uv = mix(ripple, v_uv, delta);
  vec3 color = texture2D(u_tex, uv).rgb;
  gl_FragColor = vec4(color, 1.0); 
}
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const geometry = new THREE.PlaneGeometry(2, 1.5);
const uniforms = {
  u_tex: { value: new THREE.TextureLoader().load("./image.jpg") },
  u_duration: { value: 8.0 },
  u_time: { value: 0.0 },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_resolution: { value: { x: 0, y: 0 } },
};

const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vshader,
  fragmentShader: fshader,
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 1;

onWindowResize();
if ("ontouchstart" in window) {
  document.addEventListener("touchmove", move);
} else {
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", move);
}

function move(evt) {
  uniforms.u_mouse.value.x = evt.touches ? evt.touches[0].clientX : evt.clientX;
  uniforms.u_mouse.value.y = evt.touches ? evt.touches[0].clientY : evt.clientY;
}

animate();

function onWindowResize(event) {
  const aspectRatio = window.innerWidth / window.innerHeight;
  let width, height;
  if (aspectRatio >= 2 / 1.5) {
    console.log("resize: Use width");
    width = 1;
    height = (window.innerHeight / window.innerWidth) * width;
  } else {
    console.log("resize: Use height");
    height = 1.5 / 2;
    width = (window.innerWidth / window.innerHeight) * height;
  }
  camera.left = -width;
  camera.right = width;
  camera.top = height;
  camera.bottom = -height;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;
}

function animate() {
  requestAnimationFrame(animate);
  uniforms.u_time.value += clock.getDelta();
  renderer.render(scene, camera);
}
