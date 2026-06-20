import * as THREE from "three";
import { CONFIG, type MeshOptions, type TransformConfig } from "../config/groundDigModelConfig";

export const createRandom = (seed: number) => {
  let value = seed >>> 0;

  return function random() {
    value += 0x6d2b79f5;

    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomRange = (rng: () => number, min: number, max: number) => {
  return min + rng() * (max - min);
};

export const pick = <T,>(rng: () => number, items: readonly T[]): T => {
  return items[Math.floor(rng() * items.length)];
};

export const applyTransform = (
  object: THREE.Object3D,
  config: TransformConfig
) => {
  const position = config.position ?? { x: 0, y: 0, z: 0 };
  const rotation = config.rotation ?? { y: 0 };
  const scale = config.scale ?? 1;

  object.position.set(position.x, position.y, position.z);
  object.rotation.y = rotation.y ?? 0;
  object.scale.setScalar(scale);
};

export const setupMeshes = (root: THREE.Object3D, options: MeshOptions = {}) => {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) {
      return;
    }

    obj.castShadow = options.castShadow ?? true;
    obj.receiveShadow = options.receiveShadow ?? true;
  });
};

export const recolorNamedMaterials = (
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

export const prepareStaticObject = (
  source: THREE.Object3D,
  options: MeshOptions = {}
) => {
  const cloned = source.clone(true);
  setupMeshes(cloned, options);
  return cloned;
};

export const createGroundTexture = (seed: number) => {
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
