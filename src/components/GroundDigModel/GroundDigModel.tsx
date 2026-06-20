"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import "./GroundDigModel.css";

const modelBaseUrl = "/model";

const CONFIG = {
  seed: 1208,

  scene: {
    backgroundColor: 0xbfd9ea,
    skyTopColor: 0x9fc8e7,
    skyBottomColor: 0xd7ead6,
    fogNear: 15,
    fogFar: 48,
  },

  camera: {
    fov: 45,
    near: 0.1,
    far: 120,
    position: { x: 5.3, y: 3.3, z: 7.4 },
    target: { x: 4, y: 0.45, z: -0.2 },
  },

  renderer: {
    exposure: 1.05,
    maxPixelRatio: 2,
  },

  lights: {
    hemisphere: {
      skyColor: 0xeaf7ff,
      groundColor: 0x547044,
      intensity: 1.45,
    },
    sun: {
      color: 0xfff1d2,
      intensity: 3.1,
      position: { x: -8, y: 16, z: 10 },
    },
    fill: {
      color: 0xd7ecff,
      intensity: 0.65,
      position: { x: 12, y: 8, z: -10 },
    },
  },

  groundTexture: {
    size: 1024,
    cellSize: 14,
    repeat: 5,
    drawLines: true,
    lineColor: "rgba(255,255,255,0.025)",
    palette: [
      [76, 137, 70],
      [86, 151, 75],
      [96, 158, 86],
      [67, 124, 67],
      [111, 166, 88],
      [88, 132, 72],
    ],
    variance: 10,
  },

  models: {
    ground: {
      path: `${modelBaseUrl}/jimen.glb`,
      position: { x: 0, y: 0, z: 0 },
      rotation: { y: 0 },
      scale: 1,
    },
    dig: {
      path: `${modelBaseUrl}/jimen_dig.glb`,
      position: { x: 0, y: 0.01, z: 0 },
      rotation: { y: 0 },
      scale: 1,
    },
    kabu: {
      path: `${modelBaseUrl}/kabu.glb`,
      position: { x: 0, y: 0.3, z: 0 },
      rotation: { y: 0 },
      scale: 1,
    },
    rope: {
      path: `${modelBaseUrl}/rope.glb`,
      position: { x: 0, y: 0.3, z: 0 },
      rotation: { y: 0 },
      scale: 1,
    },
    rope2: {
      path: `${modelBaseUrl}/rope2.glb`,
      position: { x: 3, y: 0.1, z: 0 },
      rotation: { y: 0 },
      scale: 1,
    },
  },

  dog: {
    path: `${modelBaseUrl}/dog.glb`,
    position: { x: 5, y: 0.3, z: 0 },
    rotation: { y: -Math.PI / 2 },
    scale: 0.5,

    materialColors: {
      base_color: "#ffffff",
      accent_color: "#ff9900",
      nose_color: "#222222",
      tail_color: "#aa7744",
    },

    animation: {
      pullName: "pull",
      pullOutName: "pull_out",
      pullSpeed: 1.0,
      pullOutSpeed: 1.0,
      pauseAfterPull: 0.4,
      pauseAfterPullOut: 0.6,
      fadeDuration: 0.15,
    },
  },

  forest: {
    paths: [`${modelBaseUrl}/tree.glb`, `${modelBaseUrl}/tree2.glb`],
    count: 100,
    area: {
      xMin: -50,
      xMax: 50,
      zMin: -45,
      zMax: -12,
      y: 0.03,
    },
    scale: {
      min: 0.7,
      max: 0.9,
    },
  },

  fence: {
    path: `${modelBaseUrl}/saku.glb`,
    count: 50,
    startX: -18,
    z: -8,
    y: 0.1,
    spacingMin: 1.5,
    spacingMax: 1.8,
    rotationY: Math.PI / 2,
    randomFlip: true,
    scale: 0.3,
  },
} as const;

type TransformConfig = {
  position?: { x: number; y: number; z: number };
  rotation?: { y?: number };
  scale?: number;
};

type MeshOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
};

type Placement = {
  position: [number, number, number];
  rotationY: number;
  scale: number;
};

type ForestPlacement = {
  position: [number, number, number];
  rotationY: number;
  scale: number;
  treeIndex: number;
};

type StaticModelProps = {
  url: string;
  transform: TransformConfig;
  meshOptions?: MeshOptions;
};

const createRandom = (seed: number) => {
  let value = seed >>> 0;

  return function random() {
    value += 0x6d2b79f5;

    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const randomRange = (rng: () => number, min: number, max: number) => {
  return min + rng() * (max - min);
};

const pick = <T,>(rng: () => number, items: T[]): T => {
  return items[Math.floor(rng() * items.length)];
};

const applyTransform = (object: THREE.Object3D, config: TransformConfig) => {
  const position = config.position ?? { x: 0, y: 0, z: 0 };
  const rotation = config.rotation ?? { y: 0 };
  const scale = config.scale ?? 1;

  object.position.set(position.x, position.y, position.z);
  object.rotation.y = rotation.y ?? 0;
  object.scale.setScalar(scale);
};

const setupMeshes = (root: THREE.Object3D, options: MeshOptions = {}) => {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) {
      return;
    }

    obj.castShadow = options.castShadow ?? true;
    obj.receiveShadow = options.receiveShadow ?? true;
  });
};

const recolorNamedMaterials = (
  root: THREE.Object3D,
  colorMap: Record<string, string>
) => {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.material) {
      return;
    }

    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];

    const recoloredMaterials = materials.map((material) => {
      const color = colorMap[material.name];

      if (!color) {
        return material;
      }

      const cloned = material.clone() as THREE.Material & {
        color?: THREE.Color;
        metalness?: number;
        roughness?: number;
      };

      if (cloned.color) {
        cloned.color.set(color);
      }
      if (typeof cloned.metalness === "number") {
        cloned.metalness = 0;
      }
      if (typeof cloned.roughness === "number") {
        cloned.roughness = Math.max(cloned.roughness ?? 0.75, 0.72);
      }

      cloned.needsUpdate = true;
      return cloned;
    });

    obj.material = Array.isArray(obj.material)
      ? recoloredMaterials
      : recoloredMaterials[0];
  });
};

const prepareStaticObject = (
  source: THREE.Object3D,
  options: MeshOptions = {}
) => {
  const cloned = source.clone(true);
  setupMeshes(cloned, options);
  return cloned;
};

const createGroundTexture = (seed: number) => {
  if (typeof document === "undefined") {
    return null;
  }

  const rng = createRandom(seed);
  const { size, cellSize, repeat } = CONFIG.groundTexture;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  ctx.fillStyle = "#5f934b";
  ctx.fillRect(0, 0, size, size);

  const drawTriangle = (
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
    color: number[]
  ) => {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.closePath();

    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.fill();

    if (CONFIG.groundTexture.drawLines) {
      ctx.strokeStyle = CONFIG.groundTexture.lineColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  const randomGroundColor = () => {
    const base = pick(rng, CONFIG.groundTexture.palette);
    const variance = CONFIG.groundTexture.variance;

    return base.map((value) => {
      const shifted = value + (rng() - 0.5) * variance;
      return Math.round(THREE.MathUtils.clamp(shifted, 0, 255));
    });
  };

  for (let y = 0; y < size; y += cellSize) {
    for (let x = 0; x < size; x += cellSize) {
      const p1: [number, number] = [x, y];
      const p2: [number, number] = [x + cellSize, y];
      const p3: [number, number] = [x, y + cellSize];
      const p4: [number, number] = [x + cellSize, y + cellSize];

      drawTriangle(p1, p2, p3, randomGroundColor());
      drawTriangle(p2, p4, p3, randomGroundColor());
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
};

function LoadingOverlay({ visible }: { visible: boolean }) {
  return (
    <div
      className={`ground-dig-loading${visible ? "" : " ground-dig-loading--hidden"}`}
    >
      読み込み中
    </div>
  );
}

function SkyDome() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(CONFIG.scene.skyTopColor) },
        bottomColor: { value: new THREE.Color(CONFIG.scene.skyBottomColor) },
        offset: { value: 30 },
        exponent: { value: 0.75 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;

        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;

        varying vec3 vWorldPosition;

        void main() {
          vec3 shiftedPosition = vWorldPosition + vec3(0.0, offset, 0.0);
          float h = normalize(shiftedPosition).y;
          float gradient = pow(max(h, 0.0), exponent);

          gl_FragColor = vec4(mix(bottomColor, topColor, gradient), 1.0);
        }
      `,
    });
  }, []);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[500, 32, 16]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}

function SceneLights() {
  return (
    <>
      <hemisphereLight
        args={[
          CONFIG.lights.hemisphere.skyColor,
          CONFIG.lights.hemisphere.groundColor,
          CONFIG.lights.hemisphere.intensity,
        ]}
      />
      <directionalLight
        color={CONFIG.lights.sun.color}
        intensity={CONFIG.lights.sun.intensity}
        position={[
          CONFIG.lights.sun.position.x,
          CONFIG.lights.sun.position.y,
          CONFIG.lights.sun.position.z,
        ]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-bias={-0.00025}
      />
      <directionalLight
        color={CONFIG.lights.fill.color}
        intensity={CONFIG.lights.fill.intensity}
        position={[
          CONFIG.lights.fill.position.x,
          CONFIG.lights.fill.position.y,
          CONFIG.lights.fill.position.z,
        ]}
      />
    </>
  );
}

function Ground({ texture }: { texture: THREE.Texture | null }) {
  const { scene } = useGLTF(CONFIG.models.ground.path) as GLTF;

  const model = useMemo(() => {
    const cloned = prepareStaticObject(scene, {
      castShadow: false,
      receiveShadow: true,
    });

    applyTransform(cloned, CONFIG.models.ground);

    setupMeshes(cloned, {
      castShadow: false,
      receiveShadow: true,
    });

    cloned.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) {
        return;
      }

      const material = new THREE.MeshStandardMaterial({
        map: texture ?? null,
        color: texture ? 0xffffff : new THREE.Color("#5f934b"),
        roughness: 0.94,
        metalness: 0,
        side: THREE.DoubleSide,
      });

      obj.material = material;
    });

    return cloned;
  }, [scene, texture]);

  useEffect(() => {
    return () => {
      model.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          const material = obj.material;
          if (Array.isArray(material)) {
            material.forEach((item) => item.dispose());
          } else {
            material.dispose();
          }
        }
      });
    };
  }, [model]);

  return <primitive object={model} />;
}

function StaticModel({ url, transform, meshOptions }: StaticModelProps) {
  const { scene } = useGLTF(url) as GLTF;

  const model = useMemo(() => {
    const cloned = prepareStaticObject(scene, meshOptions);
    applyTransform(cloned, transform);
    return cloned;
  }, [meshOptions, scene, transform]);

  return <primitive object={model} />;
}

function DogModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(CONFIG.dog.path) as GLTF;
  const { actions, mixer } = useAnimations(animations, groupRef);

  const model = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene) as THREE.Group;
    applyTransform(cloned, CONFIG.dog);
    recolorNamedMaterials(cloned, CONFIG.dog.materialColors);
    setupMeshes(cloned, {
      castShadow: true,
      receiveShadow: true,
    });
    return cloned;
  }, [scene]);

  useEffect(() => {
    const settings = CONFIG.dog.animation;
    const pullAction = actions[settings.pullName];
    const pullOutAction = actions[settings.pullOutName];

    if (!pullAction || !pullOutAction) {
      return;
    }

    pullAction.setLoop(THREE.LoopOnce, 1);
    pullOutAction.setLoop(THREE.LoopOnce, 1);
    pullAction.clampWhenFinished = true;
    pullOutAction.clampWhenFinished = true;
    pullAction.timeScale = settings.pullSpeed;
    pullOutAction.timeScale = settings.pullOutSpeed;

    let currentAction: THREE.AnimationAction | null = null;
    let shouldPlayPull = true;
    let timeoutId: number | undefined;

    const playAction = (action: THREE.AnimationAction) => {
      if (currentAction) {
        currentAction.fadeOut(settings.fadeDuration);
      }

      action.reset();
      action.fadeIn(settings.fadeDuration);
      action.play();
      currentAction = action;
    };

    const playNext = () => {
      playAction(shouldPlayPull ? pullAction : pullOutAction);
    };

    const onFinished = () => {
      const pause = shouldPlayPull
        ? settings.pauseAfterPull
        : settings.pauseAfterPullOut;

      shouldPlayPull = !shouldPlayPull;
      timeoutId = window.setTimeout(playNext, pause * 1000);
    };

    mixer.addEventListener("finished", onFinished);
    playNext();

    return () => {
      mixer.removeEventListener("finished", onFinished);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

function FenceField() {
  const { scene } = useGLTF(CONFIG.fence.path) as GLTF;

  const baseModel = useMemo(() => {
    const cloned = prepareStaticObject(scene, {
      castShadow: true,
      receiveShadow: true,
    });

    return cloned;
  }, [scene]);

  const placements = useMemo<Placement[]>(() => {
    const rng = createRandom(CONFIG.seed + 41);
    const result: Placement[] = [];
    let currentX = CONFIG.fence.startX;

    for (let index = 0; index < CONFIG.fence.count; index += 1) {
      const flipped = CONFIG.fence.randomFlip && rng() < 0.5;

      result.push({
        position: [currentX, CONFIG.fence.y, CONFIG.fence.z],
        rotationY: CONFIG.fence.rotationY + (flipped ? Math.PI : 0),
        scale: CONFIG.fence.scale,
      });

      currentX += randomRange(rng, CONFIG.fence.spacingMin, CONFIG.fence.spacingMax);
    }

    return result;
  }, []);

  return (
    <group name="FenceGroup">
      {placements.map((placement, index) => {
        const fence = prepareStaticObject(baseModel, {
          castShadow: true,
          receiveShadow: true,
        });

        fence.position.set(...placement.position);
        fence.rotation.y = placement.rotationY;
        fence.scale.setScalar(placement.scale);

        return <primitive key={`fence-${index}`} object={fence} />;
      })}
    </group>
  );
}

function Forest() {
  const treeA = useGLTF(CONFIG.forest.paths[0]) as GLTF;
  const treeB = useGLTF(CONFIG.forest.paths[1]) as GLTF;

  const treeBases = useMemo(() => {
    return [treeA.scene, treeB.scene].map((scene) =>
      prepareStaticObject(scene, {
        castShadow: true,
        receiveShadow: true,
      })
    );
  }, [treeA.scene, treeB.scene]);

  const placements = useMemo<ForestPlacement[]>(() => {
    const rng = createRandom(CONFIG.seed + 73);

    return Array.from({ length: CONFIG.forest.count }, () => {
      const z = randomRange(
        rng,
        CONFIG.forest.area.zMin,
        CONFIG.forest.area.zMax
      );
      const depth01 = THREE.MathUtils.clamp(
        (z - CONFIG.forest.area.zMin) /
          (CONFIG.forest.area.zMax - CONFIG.forest.area.zMin),
        0,
        1
      );

      return {
        position: [
          randomRange(rng, CONFIG.forest.area.xMin, CONFIG.forest.area.xMax),
          CONFIG.forest.area.y,
          z,
        ],
        rotationY: rng() * Math.PI * 2,
        scale:
          randomRange(rng, CONFIG.forest.scale.min, CONFIG.forest.scale.max) *
          THREE.MathUtils.lerp(0.85, 1.15, depth01),
        treeIndex: rng() < 0.5 ? 0 : 1,
      };
    });
  }, []);

  return (
    <group name="ForestGroup">
      {placements.map((placement, index) => {
        const tree = prepareStaticObject(treeBases[placement.treeIndex], {
          castShadow: true,
          receiveShadow: true,
        });

        tree.position.set(...placement.position);
        tree.rotation.y = placement.rotationY;
        tree.scale.setScalar(placement.scale);

        return <primitive key={`tree-${index}`} object={tree} />;
      })}
    </group>
  );
}

function SceneContent({ onReady }: { onReady?: () => void }) {
  const groundTexture = useMemo(() => createGroundTexture(CONFIG.seed), []);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    return () => {
      groundTexture?.dispose();
    };
  }, [groundTexture]);

  return (
    <>
      <color attach="background" args={[`#${CONFIG.scene.backgroundColor.toString(16).padStart(6, "0")}`]} />
      <fog attach="fog" args={[CONFIG.scene.backgroundColor, CONFIG.scene.fogNear, CONFIG.scene.fogFar]} />
      <SkyDome />
      <SceneLights />
      <Ground texture={groundTexture} />
      <StaticModel
        url={CONFIG.models.dig.path}
        transform={CONFIG.models.dig}
        meshOptions={{ castShadow: false, receiveShadow: true }}
      />
      <StaticModel
        url={CONFIG.models.kabu.path}
        transform={CONFIG.models.kabu}
        meshOptions={{ castShadow: true, receiveShadow: true }}
      />
      <StaticModel
        url={CONFIG.models.rope.path}
        transform={CONFIG.models.rope}
        meshOptions={{ castShadow: true, receiveShadow: true }}
      />
      <StaticModel
        url={CONFIG.models.rope2.path}
        transform={CONFIG.models.rope2}
        meshOptions={{ castShadow: true, receiveShadow: true }}
      />
      <DogModel />
      <FenceField />
      <Forest />
      <OrbitControls
        makeDefault
        target={[
          CONFIG.camera.target.x,
          CONFIG.camera.target.y,
          CONFIG.camera.target.z,
        ]}
        enableDamping
        dampingFactor={0.07}
        enablePan={false}
        minDistance={4.5}
        maxDistance={15}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.48}
      />
    </>
  );
}

export default function GroundDigModel() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="ground-dig-root">
      <LoadingOverlay visible={!isLoaded} />
      <Canvas
        className="ground-dig-canvas"
        shadows
        dpr={[1, CONFIG.renderer.maxPixelRatio]}
        camera={{
          position: [
            CONFIG.camera.position.x,
            CONFIG.camera.position.y,
            CONFIG.camera.position.z,
          ],
          fov: CONFIG.camera.fov,
          near: CONFIG.camera.near,
          far: CONFIG.camera.far,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = CONFIG.renderer.exposure;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        >
        <Suspense fallback={null}>
          <SceneContent onReady={() => setIsLoaded(true)} />
        </Suspense>
      </Canvas>
    </div>
  );
}
