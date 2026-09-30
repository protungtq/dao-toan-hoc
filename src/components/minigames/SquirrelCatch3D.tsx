import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  lane: number;
  itemLane: number;
  itemRow: number;
  points: number;
  hit: boolean;
};

const LANE_X = [-4, -2, 0, 2, 4];

function Acorn({ lane, row }: { lane: number; row: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const targetX = LANE_X[lane] ?? 0;
    const targetY = 5.7 - row * 0.95;
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, targetX, 12, delta);
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, targetY, 12, delta);
    ref.current.rotation.y += delta * 2.2;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.16;
  });

  return (
    <group ref={ref} position={[LANE_X[lane] ?? 0, 5.7, 0]}>
      <mesh scale={[0.58, 0.72, 0.58]}>
        <sphereGeometry args={[0.6, 16, 12]} />
        <meshStandardMaterial color="#9a5b31" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.48, 0]} scale={[0.7, 0.25, 0.7]}>
        <sphereGeometry args={[0.6, 16, 10]} />
        <meshStandardMaterial color="#6f3f24" roughness={0.95} />
      </mesh>
      <mesh position={[0.05, 0.72, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.07, 0.09, 0.36, 8]} />
        <meshStandardMaterial color="#4d331f" />
      </mesh>
    </group>
  );
}

function Squirrel({ lane, points, hit }: { lane: number; points: number; hit: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const bounce = useRef(0);

  useEffect(() => {
    if (hit) bounce.current = 1;
  }, [points, hit]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const targetX = LANE_X[lane] ?? 0;
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, targetX, 14, delta);
    bounce.current = Math.max(0, bounce.current - delta * 3.8);
    const hop = bounce.current > 0 ? Math.sin((1 - bounce.current) * Math.PI) * 0.7 : 0;
    ref.current.position.y = 0.52 + hop + Math.sin(state.clock.elapsedTime * 4) * 0.025;
    ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, (targetX - ref.current.position.x) * -0.08, 10, delta);
  });

  return (
    <group ref={ref} position={[LANE_X[lane] ?? 0, 0.52, 0.35]} scale={0.9}>
      <group position={[-0.72, 0.42, 0.55]} rotation={[0.2, 0, -0.42]}>
        <mesh position={[-0.3, 0.25, 0]} scale={[0.75, 1.2, 0.72]}>
          <sphereGeometry args={[0.7, 18, 14]} />
          <meshStandardMaterial color="#b96732" roughness={0.9} />
        </mesh>
        <mesh position={[-0.62, 0.82, 0]} scale={[0.62, 1.0, 0.62]}>
          <sphereGeometry args={[0.62, 16, 12]} />
          <meshStandardMaterial color="#cf7b3e" roughness={0.9} />
        </mesh>
      </group>

      <mesh scale={[0.82, 1.05, 0.72]}>
        <sphereGeometry args={[0.78, 18, 14]} />
        <meshStandardMaterial color="#c87538" roughness={0.88} />
      </mesh>
      <mesh position={[0, -0.05, 0.58]} scale={[0.52, 0.66, 0.18]}>
        <sphereGeometry args={[0.72, 16, 12]} />
        <meshStandardMaterial color="#f5d7a6" roughness={0.95} />
      </mesh>

      <group position={[0, 1.1, 0.05]}>
        <mesh scale={[0.78, 0.72, 0.72]}>
          <sphereGeometry args={[0.72, 18, 14]} />
          <meshStandardMaterial color="#cf7b3e" roughness={0.88} />
        </mesh>
        <mesh position={[-0.42, 0.52, 0]} rotation={[0, 0, -0.18]}>
          <coneGeometry args={[0.23, 0.62, 10]} />
          <meshStandardMaterial color="#a9532b" roughness={0.95} />
        </mesh>
        <mesh position={[0.42, 0.52, 0]} rotation={[0, 0, 0.18]}>
          <coneGeometry args={[0.23, 0.62, 10]} />
          <meshStandardMaterial color="#a9532b" roughness={0.95} />
        </mesh>
        <mesh position={[-0.24, 0.08, 0.62]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#1f2937" roughness={0.4} />
        </mesh>
        <mesh position={[0.24, 0.08, 0.62]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#1f2937" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.08, 0.7]}>
          <sphereGeometry args={[0.08, 10, 8]} />
          <meshStandardMaterial color="#4a2c22" roughness={0.8} />
        </mesh>
      </group>

      <mesh position={[-0.33, -0.78, 0.22]} scale={[0.36, 0.18, 0.55]}>
        <sphereGeometry args={[0.7, 12, 10]} />
        <meshStandardMaterial color="#a9532b" />
      </mesh>
      <mesh position={[0.33, -0.78, 0.22]} scale={[0.36, 0.18, 0.55]}>
        <sphereGeometry args={[0.7, 12, 10]} />
        <meshStandardMaterial color="#a9532b" />
      </mesh>
    </group>
  );
}

function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 2.1, 8]} />
        <meshStandardMaterial color="#81522f" roughness={1} />
      </mesh>
      <mesh position={[0, 2.45, 0]}>
        <sphereGeometry args={[1.05, 14, 10]} />
        <meshStandardMaterial color="#4cae62" roughness={1} />
      </mesh>
      <mesh position={[-0.55, 2.15, 0.1]} scale={0.75}>
        <sphereGeometry args={[0.9, 12, 9]} />
        <meshStandardMaterial color="#63bf6e" roughness={1} />
      </mesh>
    </group>
  );
}

function Scene({ lane, itemLane, itemRow, points, hit }: Props) {
  return (
    <>
      <color attach="background" args={['#bfeeff']} />
      <fog attach="fog" args={['#d9f7ff', 10, 21]} />
      <ambientLight intensity={1.75} />
      <directionalLight position={[4, 8, 6]} intensity={2.2} />

      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial color="#85d878" roughness={1} />
      </mesh>

      {LANE_X.map((x, index) => (
        <mesh key={x} position={[x, 0.025, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.55, 8.5]} />
          <meshStandardMaterial color={index % 2 ? '#b9eaa2' : '#d6f2b7'} roughness={1} />
        </mesh>
      ))}

      <Tree x={-6.25} z={-2.6} scale={1.1} />
      <Tree x={6.1} z={-3.1} scale={1.2} />
      <Tree x={-6.5} z={2.0} scale={0.85} />
      <Tree x={6.6} z={1.8} scale={0.8} />

      <Acorn lane={itemLane} row={itemRow} />
      <Squirrel lane={lane} points={points} hit={hit} />
    </>
  );
}

export default function SquirrelCatch3D(props: Props) {
  return (
    <div className="squirrel-catch-3d" role="img" aria-label="Sân chơi 3D Sóc hứng hạt dẻ">
      <Canvas
        camera={{ position: [0, 5.8, 10.6], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
