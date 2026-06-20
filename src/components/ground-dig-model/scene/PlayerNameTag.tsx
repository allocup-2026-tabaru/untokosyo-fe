"use client";

import { Billboard, Text } from "@react-three/drei";

type Props = {
  name: string;
  position: [number, number, number];
};

export function PlayerNameTag({ name, position }: Props) {
  const textWidth = Math.max(0.96, 0.36 + name.length * 0.092);
  const backgroundWidth = textWidth;
  const backgroundHeight = 0.26;

  return (
    <Billboard position={position} follow>
      <group>
        <mesh>
          <boxGeometry args={[backgroundWidth, backgroundHeight, 0.04]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.38} />
        </mesh>
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.155}
          fontWeight={300}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.005}
        >
          {name}
        </Text>
      </group>
    </Billboard>
  );
}
