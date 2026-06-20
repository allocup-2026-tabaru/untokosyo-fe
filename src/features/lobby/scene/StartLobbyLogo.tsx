"use client";

import { Billboard, useTexture } from "@react-three/drei";
import * as THREE from "three";

export function StartLobbyLogo() {
  const texture = useTexture("/title_cutout.png", (loadedTexture) => {
    loadedTexture.colorSpace = THREE.SRGBColorSpace;
    loadedTexture.needsUpdate = true;
  });

  return (
    <Billboard position={[-5.55, 2.3, 2]}>
      <mesh renderOrder={20}>
        <planeGeometry args={[4.6, 2.51]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.08}
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  );
}
