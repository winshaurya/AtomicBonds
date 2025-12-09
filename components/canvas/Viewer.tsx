'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stage } from '@react-three/drei';
import { Suspense } from 'react';
import { Model } from './Model';
import { DotPattern } from '@/components/ui/dot-pattern';

interface ViewerProps {
  modelUrl?: string;
  loading?: boolean;
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
    </div>
  );
}

export function Viewer({ modelUrl, loading }: ViewerProps) {
  return (
    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden relative">
      <DotPattern
        className="absolute inset-0 opacity-40 text-gray-600"
        width={20}
        height={20}
        x={0}
        y={0}
        cx={1}
        cy={1}
        cr={1}
        glow={false}
      />
      {loading ? (
        <Loader />
      ) : (
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <Environment preset="studio" />
            <Stage environment="studio" intensity={0.5}>
              {modelUrl ? (
                <Model url={modelUrl} />
              ) : (
                <group>
                  {/* Central atom */}
                  <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial color="#3b82f6" />
                  </mesh>

                  {/* Bonded atoms */}
                  <mesh position={[1.2, 0, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="#ef4444" />
                  </mesh>
                  <mesh position={[-1.2, 0, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="#ef4444" />
                  </mesh>
                  <mesh position={[0, 1.2, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="#ef4444" />
                  </mesh>
                  <mesh position={[0, -1.2, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="#ef4444" />
                  </mesh>

                  {/* Bonds */}
                  <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
                    <meshStandardMaterial color="#6b7280" />
                  </mesh>
                  <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
                    <meshStandardMaterial color="#6b7280" />
                  </mesh>
                  <mesh position={[0, 0.6, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
                    <meshStandardMaterial color="#6b7280" />
                  </mesh>
                  <mesh position={[0, -0.6, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
                    <meshStandardMaterial color="#6b7280" />
                  </mesh>
                </group>
              )}
            </Stage>
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={1}
              maxDistance={10}
            />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
