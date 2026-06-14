"use client";
import { useGLTF } from "@react-three/drei";

type Props = { url: string };

export function GltfModel({ url }: Props) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}
