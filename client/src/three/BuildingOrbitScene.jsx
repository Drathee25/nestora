import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import Building from './Building';

const INTRO_FRACTION = 0.1;
const INTRO_OFFSET = 2.4;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function OrbitCamera({ progressRef }) {
  const { size } = useThree();
  // Cache aspect so we don't divide every frame — only recalculate on resize
  const aspectPadRef = useRef(1);
  const lastSizeRef = useRef({ w: 0, h: 0 });

  useFrame(({ camera }) => {
    const { width, height } = size;
    if (width !== lastSizeRef.current.w || height !== lastSizeRef.current.h) {
      lastSizeRef.current = { w: width, h: height };
      const aspect = width / height;
      aspectPadRef.current = aspect < 1 ? Math.sqrt(1 / aspect) : 1;
    }

    const p = progressRef.current;
    const angle = -Math.PI / 4 + p * Math.PI * 2.2;
    const introT = Math.min(1, p / INTRO_FRACTION);
    const lateralOffset = (1 - easeOutCubic(introT)) * INTRO_OFFSET;
    const aspectPad = aspectPadRef.current;

    const radius = (7.5 - Math.sin(p * Math.PI) * 1.5) * aspectPad;
    const height2 = 2.8 - Math.sin(p * Math.PI) * 1.2;

    camera.position.x = Math.sin(angle) * radius - lateralOffset;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = height2;
    camera.lookAt(-lateralOffset, 1.6, 0);
  });
  return null;
}

export default function BuildingOrbitScene({ progressRef }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 42 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      frameloop="always"
    >
      <fog attach="fog" args={['#1f4d36', 10, 26]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.35} color="#9cc4b3" />
      <Suspense fallback={null}>
        <Building />
        {/* frames=1 bakes the shadow once instead of re-rendering every frame */}
        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={14} blur={2.2} far={4} frames={1} />
        <Environment preset="city" background={false} />
      </Suspense>
      <OrbitCamera progressRef={progressRef} />
    </Canvas>
  );
}
