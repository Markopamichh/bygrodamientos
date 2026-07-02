'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function BearingModel() {
  const { scene } = useGLTF('/models/bearing.glb');

  const model = useMemo(() => {
    const s = scene.clone(true);

    // Chrome material
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color:           '#c0c8d8',
          metalness:       0.98,
          roughness:       0.04,
          envMapIntensity: 2.2,
          side:            THREE.DoubleSide,
        });
      }
    });

    // Center at world origin and scale to ~2 world units.
    // Setting position and scale directly on the cloned root avoids T×R×S
    // ordering bugs that happen when position and rotation are on the same group.
    const box  = new THREE.Box3().setFromObject(s);
    const c    = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(c);
    box.getSize(size);
    const sc = 2.8 / Math.max(size.x, size.y, size.z);
    s.scale.setScalar(sc);
    // After scale, center moves to c*sc in world space — negate it.
    s.position.set(-c.x * sc, -c.y * sc, -c.z * sc);

    return s;
  }, [scene]);

  // The GLB bearing axis is along local X (face in YZ plane).
  // Rotating –π/2 around Y maps local +X → world +Z,
  // so the face points toward the camera (camera is at +Z).
  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload('/models/bearing.glb');

export default function BearingScene() {
  return (
    <Canvas
      camera={{ position: [0, 2.4, 7.5], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 4]}   intensity={1.8} color="#ffffff" />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#8899cc" />
      <pointLight      position={[0, -8, 3]}   intensity={0.3} color="#aaaaaa" />

      <Suspense fallback={null}>
        <Environment preset="studio" />
        <BearingModel />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.4}
        enableDamping
        dampingFactor={0.06}
      />
    </Canvas>
  );
}
