const modelBaseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "");

export const CONFIG = {
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

  lobbyCameraPresets: {
    start: {
      position: [-4.5, 3.2, 8.7],
      target: [-3.5, 0.45, -0.2],
    },
    room: {
      position: [5.3, 3.3, 7.4],
      target: [4, 0.45, -0.2],
    },
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

export type TransformConfig = {
  position?: { x: number; y: number; z: number };
  rotation?: { y?: number };
  scale?: number;
};

export type MeshOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
};

export type Placement = {
  position: [number, number, number];
  rotationY: number;
  scale: number;
};

export type ForestPlacement = {
  position: [number, number, number];
  rotationY: number;
  scale: number;
  treeIndex: number;
};

export type StaticModelProps = {
  url: string;
  transform: TransformConfig;
  meshOptions?: MeshOptions;
};
