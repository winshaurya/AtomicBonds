'use client';

import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

interface ModelProps {
  url: string;
}

export function Model({ url }: ModelProps) {
  const meshRef = useRef<Mesh>(null);
  const { scene } = useGLTF(url);

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={[1, 1, 1]}
      position={[0, 0, 0]}
    />
  );
}
