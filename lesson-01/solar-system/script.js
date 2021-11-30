function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _extends() {
  _extends =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}
setTimeout(async () => {
  let simulation;
  const radius = 20;
  const baseRadius = 20;
  const bumpScale = 0.5;
  const getName = NameGenerator(Math.floor(random() * 100));
  const sun = new Sun(baseRadius * 2, 6);
  const cameraRadius = 200;
  const theta = Math.PI / 4;
  const camera = {
    position: new THREE.Vector3(
      Math.cos(theta) * cameraRadius,
      118,
      Math.sin(theta) * cameraRadius
    ),
  };

  const atmospheres = [];
  const planets = [...new Array(5)].map((_, i, arr) => {
    const orbitRadius = baseRadius * (i * 4 + 8);
    const orbitDuration = i * (random() * 40) + 60;
    const orbitOffset = random() * Math.PI * 2;
    const rotationDuration = random() * 5 + 16;
    const planetType =
      Object.keys(planetColors)[i % Object.keys(planetColors).length];
    const colorPalette = planetColors[planetType];
    const seed = random();
    const name = getName();
    if (planetType === "terra" || planetType === "mars") {
      const atmosphereColor = new THREE.Color(
        planetType === "terra" ? "#dae8f2" : "#c1440e"
      );
      const atmosphere = new Atmosphere(
        baseRadius * 1.2,
        orbitRadius,
        orbitDuration,
        rotationDuration,
        orbitOffset,
        atmosphereColor,
        camera
      );
      atmospheres.push(atmosphere);
    }
    return new Planet(
      seed,
      baseRadius,
      bumpScale,
      orbitRadius,
      orbitDuration,
      rotationDuration,
      orbitOffset,
      colorPalette,
      name
    );
  });
  const entities = [
    sun,
    ...planets,
    ...atmospheres,
    new StarField(128, 500, 0.5, 2, 0),
  ];

  ReactDOM.render(
    /*#__PURE__*/
    React.createElement(
      React.Fragment,
      null /*#__PURE__*/,
      React.createElement(PlanetSelector, {
        options: [
          { name: "Select a planet" },
          ...planets,
          sun,
          { name: "Free camera" },
        ],

        onChange: (object) => simulation.focusObject(object),
      }) /*#__PURE__*/,

      React.createElement(
        Simulation,
        _extends(
          {
            ref: (c) => (simulation = c),
            fov: 45,
            cameraPosition: camera.position,
            cameraElevation: baseRadius * 6,
          },
          { entities }
        )
      )
    ),

    document.getElementById("js-app")
  );
}, 0);

class PlanetSelector extends React.Component {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "state", {
      value: "Select a planet",
    });
    _defineProperty(
      this,
      "onChange",

      (event) => {
        this.setState({
          value: event.target.value,
        });

        this.props.onChange(
          this.props.options.find((o) => o.name === event.target.value)
        );
      }
    );
  }

  render() {
    return /*#__PURE__*/ React.createElement(
      "select",
      {
        value: this.state.value,
        onChange: this.onChange,
      },
      this.props.options.map((option /*#__PURE__*/) =>
        React.createElement(
          "option",
          {
            value: option.name,
            key: option.name,
          },
          option.name
        )
      )
    );

    return null;
  }
}

const random = ((seed) => {
  let s = seed;
  return () => alea(s++)();
})(5625463739 + Math.random());

const planetColors = {
  terra: [
    new THREE.Color(0x008800), // dense grass
    new THREE.Color(0x009e00), // grass
    new THREE.Color(0xc2b26f), // sand
    new THREE.Color(0x309ec0), // ocean
    new THREE.Color(0x2988ae), // deep ocean
  ],
  mars: [
    new THREE.Color(0x99857a),
    new THREE.Color(0xc67b5c),
    new THREE.Color(0xe27b58),
    new THREE.Color(0xff9d6f),
    new THREE.Color(0x663926),
  ],

  luna: [
    new THREE.Color(0xdcdcdc),
    new THREE.Color(0xc9c9c9),
    new THREE.Color(0x8a7f8d),
    new THREE.Color(0x91a3b0),
    new THREE.Color(0xe5e5e5),
  ],
};

class Atmosphere extends THREE.Mesh {
  // based off of http://stemkoski.github.io/Three.js/Shader-Glow.html
  constructor(
    radius,
    orbitRadius,
    orbitDuration,
    rotationDuration,
    orbitOffset,
    color,
    camera
  ) {
    const geometry = Atmosphere.createGeometry(radius);
    const material = Atmosphere.createMaterial(
      orbitRadius,
      orbitDuration,
      rotationDuration,
      orbitOffset,
      color,
      camera
    );
    super(geometry, material);
    this.frustumCulled = false;
    this.uTime = 0;
  }

  get time() {
    return this.uTime;
  }

  set time(newTime) {
    this.uTime = newTime;
    this.material.uniforms.uTime.value = this.uTime;
  }

  static createGeometry(radius) {
    const model = new THREE.IcosahedronGeometry(radius, 4);
    const geometry = new THREE.BAS.ModelBufferGeometry(model);
    return geometry;
  }

  static createMaterial(
    orbitRadius,
    orbitDuration,
    rotationDuration,
    orbitOffset,
    color,
    camera
  ) {
    return new THREE.BAS.PhongAnimationMaterial({
      shading: THREE.FlatShading,
      blending: THREE.AdditiveBlending,
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        uTime: { value: 0 },
        uOrbitRadius: { value: orbitRadius },
        uOrbitDuration: { value: orbitDuration },
        uRotationDuration: { value: rotationDuration },
        uOrbitOffset: { value: orbitOffset },
        uColor: { value: color },
        uViewVector: { value: camera.position },
        uC: { value: 0.2 },
        uP: { value: 1.1 },
      },

      uniformValues: {},

      vertexParameters: [
        `
        // vertexParamters
        uniform float uTime;
        uniform float uOrbitRadius;
        uniform float uOrbitDuration;
        uniform float uRotationDuration;
        uniform float uOrbitOffset;
        uniform vec3 uViewVector;
        uniform float uC;
        uniform float uP;
      `,
      ],
      varyingParameters: [
        `
        // varyingParameters
        varying float vGlowIntensity;
      `,
      ],
      vertexFunctions: [
        `
        // vertexFunctions
      `,
        THREE.BAS.ShaderChunk["quaternion_rotation"],
      ],

      vertexInit: [
        `
        // vertexInit
        float orbitProgress = clamp(mod(uTime, uOrbitDuration), 0.0, uOrbitDuration) / uOrbitDuration;
        vec4 tQuatOrbit = quatFromAxisAngle(vec3(0.0, 1.0, 0.0), PI * 2.0 * orbitProgress + uOrbitOffset);
      `,
      ],
      vertexNormal: [
        `
        // vertexNormal
      `,
      ],
      vertexPosition: [
        `
        // vertexPosition
        transformed += rotateVector(tQuatOrbit, vec3(uOrbitRadius, 0.0, 0.0));
      `,
      ],
      vertexColor: [
        `
        // vertexColor
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vViewNormal = normalize(normalMatrix * uViewVector);
        vGlowIntensity = uC; // pow(uC - dot(vNormal, vViewNormal), uP); // TODO refactor, this is wrong.  Glow wasn't working on nvidia vs intel
      `,
      ],
      fragmentParameters: [
        `
        // fragmentParameters
        uniform vec3 uColor;
      `,
      ],
      fragmentFunctions: [
        `
        // fragmentFunctions
      `,
      ],
      fragmentInit: [
        `
        // fragmentInit
      `,
      ],
      fragmentDiffuse: [
        `
        // fragmentDiffuse
        vec3 glow = uColor * vGlowIntensity;
        gl_FragColor = vec4(glow, 1.0);
        return;
      `,
      ],
      fragmentMap: [
        `
        // fragmentMap
      `,
      ],
      fragmentEmissive: [
        `
        // fragmentEmissive
      `,
      ],
      fragmentSpecular: [
        `
        // fragmentSpecular
      `,
      ],
    });
  }
}

class Planet extends THREE.Mesh {
  constructor(
    seed,
    radius,
    bumpScale,
    orbitRadius,
    orbitDuration,
    rotationDuration,
    orbitOffset,
    colors,
    name
  ) {
    const pointsUp = Planet.buildPoints(3, Math.PI * 1.5);
    const uvs = [
      pointsUp[0].map((i) => (i + 1) / 2).map((i) => 1 - i),
      pointsUp[1].map((i) => (i + 1) / 2).map((i) => 1 - i),
      pointsUp[2].map((i) => (i + 1) / 2).map((i) => 1 - i),
    ];

    const geometry = Planet.createGeometry(uvs, radius, seed);
    const material = Planet.createMaterial(
      uvs,
      bumpScale,
      orbitRadius,
      orbitDuration,
      rotationDuration,
      orbitOffset,
      colors
    );
    material.extensions.derivatives = true;
    super(geometry, material);
    this.frustumCulled = false;
    this.uTime = 0;
    this.name = name;
  }

  static buildPoints(edgeCount, rotationOffset = 0) {
    const stepSize = (Math.PI * 2) / edgeCount;
    return Array(...new Array(edgeCount)).map((_, edgeIndex) => [
      Math.cos(edgeIndex * stepSize + rotationOffset),
      Math.sin(edgeIndex * stepSize + rotationOffset),
    ]);
  }

  get time() {
    return this.uTime;
  }

  set time(newTime) {
    this.uTime = newTime;
    this.material.uniforms.uTime.value = this.uTime;
  }

  static elevationGenerator(scaling = 20, s = random()) {
    const colorLookup = {};
    const seed = 5625463739 * s;
    return (vertex) => {
      const key = `${vertex.x}&${vertex.y}&${vertex.z}`;
      if (colorLookup[key] === undefined) {
        const elevation =
          (noise.simplex3(
            (vertex.x + seed) / scaling,
            (vertex.y + seed) / scaling,
            (vertex.z + seed) / scaling
          ) +
            1) /
          2; // this will be a value between 0 and 1
        let elevationIndex = 0;
        if (elevation > 0.3) {
          // ocean
          elevationIndex = 1;
        }
        if (elevation > 0.45) {
          // sand
          elevationIndex = 2;
        }
        if (elevation > 0.62) {
          // grass
          elevationIndex = 3;
        }
        if (elevation > 0.8) {
          // dense grass
          elevationIndex = 4;
        }
        colorLookup[key] = elevationIndex;
      }
      return colorLookup[key];
    };
  }

  static createGeometry(uvs, radius, seed) {
    const getElevation = Planet.elevationGenerator(undefined, seed);
    const model = new THREE.IcosahedronGeometry(radius, 4);
    THREE.BAS.Utils.separateFaces(model); // this splits each face into its own 3 vertices, allowing us to add elevations to them (i think)
    const barycentricCombinations = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];

    const geometry = new THREE.BAS.ModelBufferGeometry(model);
    const aUv = geometry.createAttribute("aUv", 2);
    const aElevation = geometry.createAttribute("aElevation", 4);
    let offsetUv = 0;
    let offsetElevation = 0;
    [...new Array(geometry.faceCount)].forEach((_, faceIndex) => {
      const face = geometry.modelGeometry.faces[faceIndex];
      const { a, b, c } = face;
      const { vertices } = geometry.modelGeometry;
      const [elevationA, elevationB, elevationC] = [a, b, c].map(
        (vertexIndex) => {
          const vertex = vertices[vertexIndex];
          return getElevation(vertex);
        }
      );
      const elevationD = Planet.getFaceCenterColor(
        elevationA,
        elevationB,
        elevationC
      );
      for (let i = 0; i < 3; i++) {
        aUv.array[offsetUv++] = uvs[i][0];
        aUv.array[offsetUv++] = uvs[i][1];
        aElevation.array[offsetElevation++] = elevationA;
        aElevation.array[offsetElevation++] = elevationB;
        aElevation.array[offsetElevation++] = elevationC;
        aElevation.array[offsetElevation++] = elevationD;
      }
    });
    return geometry;
  }

  static getFaceCenterColor(elevationA, elevationB, elevationC) {
    // TODO refactor, probably a better way to do this
    return (elevationA + elevationB + elevationC) / 3;
  }

  getLookAtPositions(cameraElevation) {
    const { uniforms } = this.material;
    const uTime = uniforms.uTime.value;
    const uOrbitDuration = uniforms.uOrbitDuration.value;
    const uOrbitOffset = uniforms.uOrbitOffset.value;
    const uOrbitRadius = uniforms.uOrbitRadius.value;
    const orbitProgress = (uTime % uOrbitDuration) / uOrbitDuration;
    const x = Math.cos(-orbitProgress * Math.PI * 2 - uOrbitOffset);
    const z = Math.sin(-orbitProgress * Math.PI * 2 - uOrbitOffset);
    const uRotationDuration = uniforms.uRotationDuration.value;
    const rotationProgress = (uTime % uRotationDuration) / uRotationDuration;
    const rotationX = Math.cos(-rotationProgress * Math.PI * 2);
    const rotationZ = Math.sin(-rotationProgress * Math.PI * 2);
    const orbitX = x * uOrbitRadius;
    const orbitZ = z * uOrbitRadius;
    const cameraX = orbitX + rotationX * cameraElevation;
    const cameraZ = orbitZ + rotationZ * cameraElevation;
    return [orbitX, 0, orbitZ, cameraX, 0, cameraZ];
  }

  static createMaterial(
    uvs,
    bumpScale,
    orbitRadius,
    orbitDuration,
    rotationDuration,
    orbitOffset,
    colors
  ) {
    return new THREE.BAS.PhongAnimationMaterial({
      shading: THREE.FlatShading,
      side: THREE.FrontSide,
      uniforms: {
        uTime: { value: 0 },
        uBumpScale: { value: bumpScale },
        uUvA: { value: uvs[0] },
        uUvB: { value: uvs[1] },
        uUvC: { value: uvs[2] },
        uOrbitRadius: { value: orbitRadius },
        uOrbitDuration: { value: orbitDuration },
        uRotationDuration: { value: rotationDuration },
        uOrbitOffset: { value: orbitOffset },
        uColor0: { value: colors[0] },
        uColor1: { value: colors[1] },
        uColor2: { value: colors[2] },
        uColor3: { value: colors[3] },
        uColor4: { value: colors[4] },
      },

      uniformValues: {},

      vertexParameters: [
        `
        // vertexParamters
        attribute vec2 aUv;
        attribute vec3 aBarycentric;
        attribute vec4 aElevation;
        uniform float uTime;
        uniform float uOrbitRadius;
        uniform float uOrbitDuration;
        uniform float uRotationDuration;
        uniform float uOrbitOffset;
      `,
      ],
      varyingParameters: [
        `
        // varyingParameters
        varying vec2 vUv;
        varying vec4 vElevation;
      `,
      ],
      vertexFunctions: [
        `
        // vertexFunctions
      `,
        THREE.BAS.ShaderChunk["quaternion_rotation"],
      ],

      vertexInit: [
        `
        // vertexInit
        float rotationProgress = clamp(mod(uTime, uRotationDuration), 0.0, uRotationDuration) / uRotationDuration;
        vec4 tQuatRotate = quatFromAxisAngle(vec3(0.0, 1.0, 0.0), PI * 2.0 * rotationProgress);
        float orbitProgress = clamp(mod(uTime, uOrbitDuration), 0.0, uOrbitDuration) / uOrbitDuration;
        vec4 tQuatOrbit = quatFromAxisAngle(vec3(0.0, 1.0, 0.0), PI * 2.0 * orbitProgress + uOrbitOffset);
      `,
      ],
      vertexNormal: [
        `
        // vertexNormal
      `,
      ],
      vertexPosition: [
        `
        // vertexPosition
        transformed = rotateVector(tQuatRotate, transformed);
        transformed += rotateVector(tQuatOrbit, vec3(uOrbitRadius, 0.0, 0.0));
      `,
      ],
      vertexColor: [
        `
        // vertexColor
        vUv = aUv;
        vElevation = aElevation;
      `,
      ],
      fragmentParameters: [
        `
        // fragmentParameters
        uniform vec2 uUvA;
        uniform vec2 uUvB;
        uniform vec2 uUvC;
        uniform float uBumpScale;
        uniform vec3 uColor0;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
      `,
      ],
      fragmentFunctions: [
        `
        // fragmentFunctions
        float terrainShininess (float elev) {
          float landShininess = 10.0;
          float waterShininess = 100.0;
          if (elev >= 4.0) {
            return landShininess; // dense grass
          }
          if (elev >= 3.0) {
            return landShininess; // grass
          }
          if (elev >= 2.0) {
            return landShininess; // sand
          }
          if (elev >= 1.0) {
            return waterShininess; // ocean
          }
          return waterShininess; // deep ocean
        }

        vec3 terrainColor (float elev, vec3 color0, vec3 color1, vec3 color2, vec3 color3, vec3 color4) {
          if (elev >= 4.0) {
            return color0;
          }
          if (elev >= 3.0) {
            return color1;
          }
          if (elev >= 2.0) {
            return color2;
          }
          if (elev >= 1.0) {
            return color3;
          }
          return color4;
        }

        vec3 cartesianToBarycentric (vec2 p1, vec2 p2, vec2 p3, vec2 p) { // http://totologic.blogspot.com/2014/01/accurate-point-in-triangle-test.html
          float denominator = ((p2.y - p3.y) * (p.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y));
          float a = ((p2.y - p3.y) * (p.x - p3.x) + (p3.x - p2.x) * (p.y - p3.y)) / denominator;
          float b = ((p3.y - p1.y) * (p.x - p3.x) + (p1.x - p3.x) * (p.y - p3.y)) / denominator;
          float c = 1.0 - a - b;
          return vec3(a, b, c);
        }

        float getPointElevation (vec4 elevation, vec3 barycentric) {
          if (barycentric.x > barycentric.y + barycentric.z) {
            return elevation.x;
          } else if (barycentric.y > barycentric.x + barycentric.z) {
            return elevation.y;
          } else if (barycentric.z > barycentric.x + barycentric.y) {
            return elevation.z;
          }
          return elevation.w;
        }

        vec3 perturbNormalArb (vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {
          vec3 vSigmaX = vec3(dFdx(surf_pos.x), dFdx(surf_pos.y), dFdx(surf_pos.z));
          vec3 vSigmaY = vec3(dFdy(surf_pos.x), dFdy(surf_pos.y), dFdy(surf_pos.z));
          vec3 vN = surf_norm;
          vec3 R1 = cross(vSigmaY, vN);
          vec3 R2 = cross(vN, vSigmaX);
          float fDet = dot(vSigmaX, R1);
          vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
          return normalize(abs(fDet) * surf_norm - vGrad);
        }

        vec2 dHdxy_fwd (vec2 uvA, vec2 uvB, vec2 uvC, vec2 uv, vec4 elevation, float bumpScale) {
          vec2 dSTdx = dFdx(uv);
          vec2 dSTdy = dFdy(uv);
          float Hll = bumpScale * getPointElevation(elevation, cartesianToBarycentric(uvA, uvB, uvC, uv));
          float dBx = bumpScale * getPointElevation(elevation, cartesianToBarycentric(uvA, uvB, uvC, uv + dSTdx)) - Hll;
          float dBy = bumpScale * getPointElevation(elevation, cartesianToBarycentric(uvA, uvB, uvC, uv + dSTdy)) - Hll;
          return vec2(dBx, dBy);
        }
      `,
      ],
      fragmentInit: [
        `
        // fragmentInit
        vec4 elevation = ceil(vElevation + 0.5) - 1.0;
      `,
      ],
      fragmentDiffuse: [
        `
        // fragmentDiffuse
        vec3 barycentric = cartesianToBarycentric(uUvA, uUvB, uUvC, vUv);
        float pointElevation = getPointElevation(elevation, barycentric);
        diffuseColor.rgb = terrainColor(pointElevation, uColor0, uColor1, uColor2, uColor3, uColor4);
      `,
      ],
      fragmentMap: [
        `
        // fragmentMap
      `,
      ],
      fragmentEmissive: [
        `
        // fragmentEmissive
        if (pointElevation > 1.0) {
          normal = perturbNormalArb(-vViewPosition, normal, dHdxy_fwd(uUvA, uUvB, uUvC, vUv, elevation, uBumpScale));
        }
      `,
      ],
      fragmentSpecular: [
        `
        // fragmentSpecular
        material.specularShininess = terrainShininess(pointElevation);
      `,
      ],
    });
  }
}

class Sun extends THREE.Mesh {
  constructor(radius, tesselation) {
    const model = new THREE.IcosahedronGeometry(radius, tesselation);
    THREE.BAS.Utils.separateFaces(model);
    const geometry = new THREE.BAS.ModelBufferGeometry(model, {
      localizeFaces: true,
      computeCentroids: true,
    });

    geometry.bufferUVs();
    const material = Sun.createMaterial();
    Sun.assignPosition(geometry);
    super(geometry, material);
    this.frustumCulled = false;
    this.name = "Sun";
  }

  static createMaterial() {
    return new THREE.BAS.PhongAnimationMaterial({
      shading: THREE.SmoothShading,
      side: THREE.FrontSide,
      uniforms: {
        uTime: { value: 0 },
        uScalingFactor: { value: 8 }, // change this with size?
        uFreqMin: { value: 0.62 },
        uFreqMax: { value: 0.72 },
        uNoiseAmplitude: { value: 1 },
        uNoiseFrequency: { value: 0.042 }, // change with size?
        uQWidth: { value: 0 },
        uAnimation: { value: new THREE.Vector3(0, -3, 0.16) },
        uColor1: { value: new THREE.Vector4(1, 1, 1, 1) },
        uColor2: { value: new THREE.Vector4(1, 0.8, 0.2, 1) },
        uColor3: { value: new THREE.Vector4(1, 0.03, 0, 1) },
        uColor4: { value: new THREE.Vector4(0.05, 0.02, 0.02, 1) },
      },

      vertexFunctions: [...Sun.noiseVertexFunctions],

      vertexParameters: [
        `
        uniform float uScalingFactor;
        uniform float uFreqMin;
        uniform float uFreqMax;
        uniform float uQWidth;
        uniform float uTime;
        uniform float uNoiseAmplitude;
        uniform vec3 uAnimation;
        uniform float uNoiseFrequency;
        attribute vec3 aPosition;
        varying vec3 vRawNormal;
      `,
      ],
      vertexInit: [
        `
        vec3 newPosition = aPosition;
      `,
      ],
      vertexNormal: [
        `
        objectNormal += newPosition;
      `,
      ],
      vertexPosition: [
        `
        transformed += newPosition;
        transformed *= 1.0 - saturate(abs(turbulence(transformed * uNoiseFrequency + uAnimation * uTime, uFreqMin, uFreqMax, uQWidth) * (uNoiseAmplitude * (uNoiseFrequency * uScalingFactor))));
        vRawNormal = objectNormal;
      `,
      ],
      fragmentFunctions: [
        ...Sun.noiseVertexFunctions,
        `
          uniform vec4 uColor1;
          uniform vec4 uColor2;
          uniform vec4 uColor3;
          uniform vec4 uColor4;
          vec4 fireShade (float distance) {
            float c1 = saturate(distance * 5.0 + 0.5);
            float c2 = saturate(distance * 5.0);
            float c3 = saturate(distance * 3.4 - 0.5);
            vec4 a = mix(uColor1, uColor2, c1);
            vec4 b = mix(a, uColor3, c2);
            return mix(b, uColor4, c3);
          }
        `,
      ],

      fragmentParameters: [
        `
        uniform float uFreqMin;
        uniform float uFreqMax;
        uniform float uQWidth;
        uniform float uTime;
        uniform float uNoiseAmplitude;
        uniform vec3 uAnimation;
        uniform float uNoiseFrequency;
        varying vec3 vRawNormal;
      `,
      ],
      fragmentDiffuse: [
        `
        float noise = saturate(abs(turbulence(vRawNormal * uNoiseFrequency + uAnimation * uTime, uFreqMin, uFreqMax, uQWidth) * uNoiseAmplitude));
        diffuseColor.rgb = fireShade(1.0 - noise).rgb;
      `,
      ],
      fragmentEmissive: [
        `
        totalEmissiveRadiance = diffuseColor.rgb;
      `,
      ],
    });
  }

  static assignPosition(geometry) {
    geometry.createAttribute("aPosition", 3, (data, i) => {
      geometry.centroids[i].toArray(data);
    });
  }

  get time() {
    return this.material.uniforms["uTime"].value;
  }

  set time(newTime) {
    this.material.uniforms["uTime"].value = newTime;
  }

  getLookAtPositions(cameraElevation) {
    const rotationProgress = 0.5;
    const orbitProgress = 0.25;
    const x = Math.cos(-orbitProgress * Math.PI * 2);
    const z = Math.sin(-orbitProgress * Math.PI * 2);
    const rotationX = Math.cos(rotationProgress * Math.PI * 2);
    const rotationZ = Math.sin(rotationProgress * Math.PI * 2);
    const orbitX = x;
    const orbitZ = z;
    const cameraX = orbitX + rotationX * cameraElevation;
    const cameraZ = orbitZ + rotationZ * cameraElevation;
    return [orbitX, 0, orbitZ, cameraX, 0, cameraZ];
  }
}
_defineProperty(Sun, "noiseVertexFunctions", [
  `
      vec3 mod289 (vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289 (vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute (vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt (vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    `,
  `
      float snoise (vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy)); // First corner
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz); // Other corners
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
        i = mod289(i); // Permutations
        vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w); //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w; // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
    `,
  `
      # define NOISE_STEPS 1
      float turbulence (vec3 position, float minFreq, float maxFreq, float qWidth) {
        float value = 0.0;
        float cutoff = clamp(0.5 / qWidth, 0.0, maxFreq);
        float fade;
        float fOut = minFreq;
        for (int i = NOISE_STEPS; i >= 0 ; i--) {
          if (fOut >= 0.5 * cutoff) break;
          fOut *= 2.0;
          value += abs(snoise(position * fOut)) / fOut;
        }
        fade = clamp(2.0 * (cutoff - fOut) / cutoff, 0.0, 1.0);
        value += fade * abs(snoise(position * fOut)) / fOut;
        return 1.0 - value;
      }
    `,
]);
class StarField extends THREE.Mesh {
  static createMaterial() {
    return new THREE.BAS.PhongAnimationMaterial({
      shading: THREE.FlatShading,
      side: THREE.FrontSide,
      uniforms: { uTime: { value: 0 }, uDuration: { value: 0 } },
      uniformValues: { emissive: new THREE.Color(0xe1e1e1) },
      varyingParameters: [
        `
        varying vec3 vColor;
      `,
      ],
      vertexFunctions: [THREE.BAS.ShaderChunk["quaternion_rotation"]],
      vertexParameters: [
        `
        uniform float uTime;
        uniform float uDuration;
        attribute vec2 aDelayDuration;
        attribute vec3 aOffset;
        attribute vec4 aRotation;
        attribute vec3 aColor;
      `,
      ],
      vertexInit: [
        `
        float seed = 5625463739.0;
        float time = mod(uTime, uDuration);
        float tProgress = clamp(time - aDelayDuration.x, 0.0, aDelayDuration.y) / aDelayDuration.y;
        vec4 tQuatOrient = quatFromAxisAngle(aRotation.xyz, aRotation.w * tProgress);
      `,
      ],
      vertexNormal: [],
      vertexPosition: [
        `
        transformed = rotateVector(tQuatOrient, transformed);
        transformed += aOffset;
      `,
      ],
      vertexColor: [
        `
        vColor = aColor;
      `,
      ],
      fragmentFunctions: [],
      fragmentParameters: [],
      fragmentInit: [],
      fragmentMap: [],
      fragmentDiffuse: [
        `
        diffuseColor.xyz = vColor;
      `,
      ],
    });
  }
  static assignProps(
    geometry,
    duration,
    maxDelay,
    size = 256,
    cubeSize = 1,
    minRadius,
    celestialRadius = 1024
  ) {
    const aDelayDuration = geometry.createAttribute("aDelayDuration", 2);
    const aColor = geometry.createAttribute("aColor", 3);
    const aRotation = geometry.createAttribute("aRotation", 4);
    const aOffset = geometry.createAttribute("aOffset", 3);
    for (let z = 0; z < size; z++) {
      const zPos = ((-size + 1) * 3) / 2 + z * 3;
      for (let x = 0; x < size; x++) {
        const phi = Math.random() * Math.PI * 2; // https://stackoverflow.com/a/5408843
        const cosTheta = Math.random() * 2 - 1;
        const u = Math.random();
        const theta = Math.acos(cosTheta);
        const r = celestialRadius * Math.cbrt(u);
        const index = z * size + x;
        const xPos = r * Math.sin(theta) * Math.cos(phi);
        const yPos = r * Math.sin(theta) * Math.sin(phi);
        const zPos = r * Math.cos(theta);
        const position = new THREE.Vector3(xPos, yPos, zPos);
        if (position.length() < minRadius) {
          continue;
        }
        geometry.setPrefabData(aOffset, index, position.toArray());
        const color = new THREE.Vector3(
          Math.random() * 0.75 + 0.25,
          Math.random() * 0.75 + 0.25,
          Math.random() * 0.75 + 0.25
        );
        geometry.setPrefabData(aColor, index, color.toArray());
        const rotation = new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        );
        rotation.normalize(); // ew, not functional
        geometry.setPrefabData(aRotation, index, [
          ...rotation.toArray(),
          Math.PI * 2,
        ]);
        const delay = Math.random() * maxDelay;
        const delayDuration = new THREE.Vector2(delay, duration);
        geometry.setPrefabData(aDelayDuration, index, delayDuration.toArray());
      }
    }
  }
  constructor(size, minRadius, cubeSize, duration, maxDelay) {
    const totalDuration = duration + maxDelay;
    const boxGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const geometry = new THREE.BAS.PrefabBufferGeometry(
      boxGeometry,
      size * size
    );
    geometry.computeVertexNormals();
    geometry.bufferUvs();
    StarField.assignProps(
      geometry,
      duration,
      maxDelay,
      size,
      cubeSize,
      minRadius
    );
    const material = StarField.createMaterial();
    material.uniforms.uDuration.value = totalDuration; // refactor, not the right place for this
    super(geometry, material);
    this.frustumCulled = false;
  }

  get time() {
    return this.material.uniforms.uTime.value;
  }

  set time(newTime) {
    this.material.uniforms.uTime.value = newTime;
  }
}

class Shell extends THREE.Mesh {
  static createMaterial() {
    return new THREE.BAS.PhongAnimationMaterial({
      shading: THREE.SmoothShading,
      side: THREE.FrontSide,
      uniforms: {
        uTime: { value: 0 },
        uScalingFactor: { value: 4.9 },
        uFreqMin: { value: 0.62 },
        uFreqMax: { value: 0.72 },
        uNoiseAmplitude: { value: 1 },
        uNoiseFrequency: { value: 0.08 },
        uQWidth: { value: 0 },
        uAnimation: { value: new THREE.Vector3(0, -3, 0.16) },
        uColor1: { value: new THREE.Vector4(1, 1, 1, 1) },
        uColor2: { value: new THREE.Vector4(1, 0.8, 0.2, 1) },
        uColor3: { value: new THREE.Vector4(1, 0.03, 0, 1) },
        uColor4: { value: new THREE.Vector4(0.05, 0.02, 0.02, 1) },
      },

      vertexFunctions: [...Shell.noiseVertexFunctions],

      vertexParameters: [
        `
        uniform float uScalingFactor;
        uniform float uFreqMin;
        uniform float uFreqMax;
        uniform float uQWidth;
        uniform float uTime;
        uniform float uNoiseAmplitude;
        uniform vec3 uAnimation;
        uniform float uNoiseFrequency;
        attribute vec3 aPosition;
        varying vec3 vRawNormal;
      `,
      ],
      vertexInit: [
        `
        vec3 newPosition = aPosition;
      `,
      ],
      vertexNormal: [
        `
        objectNormal += newPosition;
      `,
      ],
      vertexPosition: [
        `
        transformed += newPosition;
        transformed *= 1.0 - saturate(abs(turbulence(transformed * uNoiseFrequency + uAnimation * uTime, uFreqMin, uFreqMax, uQWidth) * (uNoiseAmplitude * (uNoiseFrequency * uScalingFactor))));
        vRawNormal = objectNormal;
      `,
      ],
      fragmentFunctions: [
        ...Shell.noiseVertexFunctions,
        `
          uniform vec4 uColor1;
          uniform vec4 uColor2;
          uniform vec4 uColor3;
          uniform vec4 uColor4;
          vec4 fireShade (float distance) {
            float c1 = saturate(distance * 5.0 + 0.5);
            float c2 = saturate(distance * 5.0);
            float c3 = saturate(distance * 3.4 - 0.5);
            vec4 a = mix(uColor1, uColor2, c1);
            vec4 b = mix(a, uColor3, c2);
            return mix(b, uColor4, c3);
          }
        `,
      ],

      fragmentParameters: [
        `
        uniform float uFreqMin;
        uniform float uFreqMax;
        uniform float uQWidth;
        uniform float uTime;
        uniform float uNoiseAmplitude;
        uniform vec3 uAnimation;
        uniform float uNoiseFrequency;
        varying vec3 vRawNormal;
      `,
      ],
      fragmentDiffuse: [
        `
        float noise = saturate(abs(turbulence(vRawNormal * uNoiseFrequency + uAnimation * uTime, uFreqMin, uFreqMax, uQWidth) * uNoiseAmplitude));
        diffuseColor.rgb = fireShade(1.0 - noise).rgb;
      `,
      ],
      fragmentEmissive: [
        `
        totalEmissiveRadiance = diffuseColor.rgb;
      `,
      ],
    });
  }

  static assignPosition(geometry) {
    geometry.createAttribute("aPosition", 3, (data, i) => {
      geometry.centroids[i].toArray(data);
    });
  }

  constructor(radius, tesselation) {
    const model = new THREE.IcosahedronGeometry(radius, tesselation);
    THREE.BAS.Utils.separateFaces(model);
    const geometry = new THREE.BAS.ModelBufferGeometry(model, {
      localizeFaces: true,
      computeCentroids: true,
    });

    geometry.bufferUVs();
    const material = Shell.createMaterial();
    Shell.assignPosition(geometry);
    super(geometry, material);
    this.frustumCulled = false;
  }

  get time() {
    return this.material.uniforms["uTime"].value;
  }

  set time(newTime) {
    this.material.uniforms["uTime"].value = newTime;
  }
}
_defineProperty(Shell, "noiseVertexFunctions", [
  `
      vec3 mod289 (vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289 (vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute (vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt (vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    `,
  `
      float snoise (vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy)); // First corner
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz); // Other corners
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
        i = mod289(i); // Permutations
        vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w); //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w; // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
    `,
  `
      # define NOISE_STEPS 1
      float turbulence (vec3 position, float minFreq, float maxFreq, float qWidth) {
        float value = 0.0;
        float cutoff = clamp(0.5 / qWidth, 0.0, maxFreq);
        float fade;
        float fOut = minFreq;
        for (int i = NOISE_STEPS; i >= 0 ; i--) {
          if (fOut >= 0.5 * cutoff) break;
          fOut *= 2.0;
          value += abs(snoise(position * fOut)) / fOut;
        }
        fade = clamp(2.0 * (cutoff - fOut) / cutoff, 0.0, 1.0);
        value += fade * abs(snoise(position * fOut)) / fOut;
        return 1.0 - value;
      }
    `,
]);
class Simulation extends React.Component {
  shouldComponentUpdate() {
    return false;
  }
  componentDidMount() {
    const camera = this.createCamera(
      this.props.fov,
      this.props.cameraPosition,
      window.innerWidth,
      window.innerHeight
    );
    camera.target = new THREE.Vector3(0, 0, 0);
    camera.lookAt(camera.target);
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      canvas: this.canvas,
    });
    const handleWindowResize = this.onWindowResize(camera, renderer);
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize, false);
    const controls = this.createControls(camera, renderer.domElement);
    this.props.entities.forEach((e) => scene.add(e));
    const { lights, pointLights } = this.createLights();
    lights.forEach((light) => scene.add(light));
    this.animate(
      renderer,
      scene,
      camera,
      controls,
      this.props.entities,
      pointLights,
      +new Date()
    );
  }
  createLights() {
    const ambientLight = new THREE.AmbientLight(0x333333);
    const pointLightA = new THREE.PointLight(0xffffff, 1);
    const pointLightHelperA = new THREE.PointLightHelper(pointLightA, 1);
    const pointLightB = new THREE.PointLight(0xffffff, 1);
    const pointLightHelperB = new THREE.PointLightHelper(pointLightB, 1);
    return {
      lights: [
        ambientLight,
        pointLightA,
        pointLightHelperA, // pointLightB,
        // pointLightHelperB
      ],
      pointLights: [
        pointLightA, // pointLightB
      ],
    };
  }
  createCamera(fov, pos, width, height) {
    const camera = new THREE.PerspectiveCamera(fov, width / height, 1, 10000);
    camera.position.x = pos.x;
    camera.position.y = pos.y;
    camera.position.z = pos.z;
    return camera;
  }

  createControls(camera, mount) {
    const controls = new THREE.OrbitControls(camera, mount);
    controls.target = camera.target;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.1;
    return controls;
  }

  onWindowResize(camera, renderer) {
    return () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
  }

  animate(renderer, scene, camera, controls, entities, pointLights, lastTime) {
    const currentTime = +new Date();
    const timeDelta = currentTime - lastTime;
    entities.forEach((e) => {
      e.time += timeDelta / 1000;
      if (e.material.uniforms.uViewVector) {
        e.material.uniforms.uViewVector.value.set(camera.position);
      }
    });
    requestAnimationFrame(() => {
      this.animate(
        renderer,
        scene,
        camera,
        controls,
        entities,
        pointLights,
        currentTime
      );
    });
    if (this.focusTarget && this.focusTarget.getLookAtPositions) {
      const [targetX, targetY, targetZ, cameraX, cameraY, cameraZ] =
        this.focusTarget.getLookAtPositions(this.props.cameraElevation);
      camera.position.set(cameraX, cameraY, cameraZ);
      controls.target.set(targetX, targetY, targetZ);
    }
    controls.update();
    renderer.render(scene, camera);
  }

  focusObject(target) {
    this.focusTarget = target;
  }

  render() {
    return /*#__PURE__*/ React.createElement("canvas", {
      ref: (c) => (this.canvas = c),
    });
  }
}
_defineProperty(Simulation, "defaultProps", {
  entities: [],
  fov: 80,
  cameraPosition: new THREE.Vector3(0, 0, 0),
});
