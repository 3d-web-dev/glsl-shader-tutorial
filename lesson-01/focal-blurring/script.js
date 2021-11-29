var camera, scene, renderer, composer;
var object, light, clock;

var glslPass;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //
  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 400;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 1, 1000);

  object = new THREE.Object3D();
  scene.add(object);

  var geometry = new THREE.SphereBufferGeometry(1, 4, 4);

  for (var i = 0; i < 100; i++) {
    var material = new THREE.MeshPhongMaterial({
      color: 0xffffff * Math.random(),
      flatShading: true,
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .normalize();
    mesh.position.multiplyScalar(Math.random() * 400);
    mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
    object.add(mesh);
  }

  scene.add(new THREE.AmbientLight(0x222222));

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  // postprocessing
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  glslPass = new THREE.ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      resolution: {
        value: new THREE.Vector2(
          window.innerWidth,
          window.innerHeight
        ).multiplyScalar(window.devicePixelRatio),
      },
      blurSize: { value: 4.0 },
    },
    vertexShader: `varying vec2 v_uv;
    
    void main() {
      v_uv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float blurSize;

    varying vec2 v_uv;

    vec4 blur(sampler2D tex){
      const float PI2 = 6.28318530718; // Pi*2
    
      // BLUR SETTINGS {{{
      const float directions = 16.0; // BLUR DIRECTIONS (Default 16.0 - More is better but slower)
      const float quality = 3.0; // BLUR QUALITY (Default 3.0 - More is better but slower)
      // BLUR SETTINGS }}}
   
      vec2 radius = blurSize/resolution;
    
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = gl_FragCoord.xy/resolution;
      // Pixel colour
      vec4 color = texture2D(tex, uv);
    
      if (uv.x>0.5){
        // Blur calculations
        int count = 1;
        for( float theta=0.0; theta<PI2; theta+=PI2/directions)
        {
          vec2 dir = vec2(cos(theta), sin(theta)) * radius;
          for(float i=1.0/quality; i<=1.0; i+=1.0/quality)
          {
            color += texture2D( tex, uv+dir*i);	
            count++;
          }
        }

        color /= float(count);
      }
      
      return color;
    }
    
    void main (void)
    {
      gl_FragColor = blur(tDiffuse); 
    }`,
  });
  glslPass.renderToScreen = true;
  composer.addPass(glslPass);

  //

  if (!("ontouchstart" in window))
    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);

  if (glslPass)
    glslPass.uniforms.resolution.value
      .set(window.innerWidth, window.innerHeight)
      .multiplyScalar(window.devicePixelRatio);
}

function animate() {
  requestAnimationFrame(animate);

  object.rotation.x += 0.005;
  object.rotation.y += 0.01;

  composer.render();
}
