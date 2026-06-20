"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CONFIG } from "../config/groundDigModelConfig";

export function SkyDome() {
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
