import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const LANE_X = [-4, -2, 0, 2, 4];

function Ground({ color = '#88d879' }: { color?: string }) {
  return <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[18, 15]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>;
}

function Bear({ position = [0, 0.8, 0] as [number, number, number], scale = 1 }: { position?: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.2, 0]} scale={[0.9, 1.05, 0.75]}><sphereGeometry args={[0.8, 18, 14]} /><meshStandardMaterial color="#9b5f38" roughness={0.9} /></mesh>
    <mesh position={[0, 1.2, 0.05]} scale={[0.8, 0.75, 0.72]}><sphereGeometry args={[0.72, 18, 14]} /><meshStandardMaterial color="#a96a40" roughness={0.9} /></mesh>
    <mesh position={[-0.45, 1.65, 0]}><sphereGeometry args={[0.23, 12, 10]} /><meshStandardMaterial color="#7d482d" /></mesh>
    <mesh position={[0.45, 1.65, 0]}><sphereGeometry args={[0.23, 12, 10]} /><meshStandardMaterial color="#7d482d" /></mesh>
    <mesh position={[-0.22, 1.25, 0.58]}><sphereGeometry args={[0.085, 10, 8]} /><meshStandardMaterial color="#172033" /></mesh>
    <mesh position={[0.22, 1.25, 0.58]}><sphereGeometry args={[0.085, 10, 8]} /><meshStandardMaterial color="#172033" /></mesh>
    <mesh position={[0, 1.06, 0.66]} scale={[0.45, 0.32, 0.22]}><sphereGeometry args={[0.55, 12, 10]} /><meshStandardMaterial color="#e8c79e" /></mesh>
    <mesh position={[0, 1.08, 0.8]}><sphereGeometry args={[0.07, 10, 8]} /><meshStandardMaterial color="#432a22" /></mesh>
    <mesh position={[-0.35, -0.5, 0.15]} scale={[0.35, 0.2, 0.5]}><sphereGeometry args={[0.7, 12, 10]} /><meshStandardMaterial color="#7d482d" /></mesh>
    <mesh position={[0.35, -0.5, 0.15]} scale={[0.35, 0.2, 0.5]}><sphereGeometry args={[0.7, 12, 10]} /><meshStandardMaterial color="#7d482d" /></mesh>
  </group>;
}

function Squirrel({ position = [0, 0.7, 0] as [number, number, number], scale = 1 }: { position?: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh position={[-0.72, 0.45, 0.2]} scale={[0.7, 1.1, 0.65]} rotation={[0.2, 0, -0.45]}><sphereGeometry args={[0.7, 16, 12]} /><meshStandardMaterial color="#bf6935" /></mesh>
    <mesh scale={[0.8, 1, 0.7]}><sphereGeometry args={[0.75, 16, 12]} /><meshStandardMaterial color="#c9773d" /></mesh>
    <mesh position={[0, 1.08, 0.05]} scale={[0.76, 0.7, 0.7]}><sphereGeometry args={[0.7, 16, 12]} /><meshStandardMaterial color="#d38243" /></mesh>
    <mesh position={[-0.22, 1.15, 0.57]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#111827" /></mesh>
    <mesh position={[0.22, 1.15, 0.57]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#111827" /></mesh>
  </group>;
}

function HoneyJar({ lane, row }: { lane: number; row: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, LANE_X[lane] ?? 0, 12, delta);
    ref.current.position.z = THREE.MathUtils.damp(ref.current.position.z, -4.4 + row * 1.55, 12, delta);
    ref.current.rotation.y += delta * 1.8;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 3.5) * 0.12;
  });
  return <group ref={ref} position={[LANE_X[lane] ?? 0, 0.85, -4.4]}>
    <mesh scale={[0.55, 0.7, 0.55]}><cylinderGeometry args={[0.55, 0.48, 1.1, 14]} /><meshStandardMaterial color="#f4b431" roughness={0.55} /></mesh>
    <mesh position={[0, 0.62, 0]}><cylinderGeometry args={[0.45, 0.45, 0.2, 14]} /><meshStandardMaterial color="#f7df87" /></mesh>
  </group>;
}

function MovingBear({ lane, points, hit }: { lane: number; points: number; hit: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const bounce = useRef(0);
  useEffect(() => { if (hit) bounce.current = 1; }, [points, hit]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const targetX = LANE_X[lane] ?? 0;
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, targetX, 14, delta);
    bounce.current = Math.max(0, bounce.current - delta * 3.8);
    ref.current.position.y = Math.sin((1 - bounce.current) * Math.PI) * (bounce.current > 0 ? 0.6 : 0);
    ref.current.position.z = 4.15;
  });
  return <group ref={ref} position={[LANE_X[lane] ?? 0, 0, 4.15]}><Bear scale={0.82} /></group>;
}

export function BearCatch3D({ lane, itemLane, itemRow, points, hit }: { lane: number; itemLane: number; itemRow: number; points: number; hit: boolean }) {
  return <div className="arcade-r3f-stage" role="img" aria-label="Sân chơi 3D Gấu hứng mật ong">
    <Canvas orthographic camera={{ position: [0, 12, 0.01], zoom: 58, near: 0.1, far: 40 }} dpr={[1, 1.4]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#dff7ef']} />
      <ambientLight intensity={1.7} /><directionalLight position={[5, 9, 6]} intensity={2.2} />
      <Ground color="#9ada7f" />
      {LANE_X.map((x, i) => <mesh key={x} position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.5, 10.5]} /><meshStandardMaterial color={i % 2 ? '#ffe7a9' : '#fff2c9'} /></mesh>)}
      <HoneyJar lane={itemLane} row={itemRow} /><MovingBear lane={lane} points={points} hit={hit} />
    </Canvas>
  </div>;
}

export function SquirrelMaze3D({ maze, position }: { maze: string[]; position: number[] }) {
  const home = useMemo(() => {
    const y = maze.findIndex(r => r.includes('H'));
    return [maze[y]?.indexOf('H') ?? 7, y] as [number, number];
  }, [maze]);
  return <div className="arcade-r3f-stage arcade-r3f-maze" role="img" aria-label="Mê cung 3D Sóc tìm đường về nhà">
    <Canvas orthographic camera={{ position: [0, 13, 0.01], zoom: 52, near: 0.1, far: 40 }} dpr={[1, 1.3]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#dff7ff']} /><ambientLight intensity={1.8} /><directionalLight position={[4, 10, 8]} intensity={2} />
      <Ground color="#bce7a4" />
      <group position={[-4, 0, -4]}>
        {maze.flatMap((row, y) => [...row].map((tile, x) => tile === '#' ? <mesh key={`${x}-${y}`} position={[x, 0.28, y]}><boxGeometry args={[0.92, 0.56, 0.92]} /><meshStandardMaterial color="#3f9b5f" roughness={1} /></mesh> : null))}
        <group position={[home[0], 0.1, home[1]]}>
          <mesh position={[0, 0.65, 0]}><boxGeometry args={[0.9, 1.1, 0.9]} /><meshStandardMaterial color="#f4c46a" /></mesh>
          <mesh position={[0, 1.35, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.75, 0.9, 4]} /><meshStandardMaterial color="#d85c4d" /></mesh>
        </group>
        <Squirrel position={[position[0], 0.55, position[1]]} scale={0.34} />
      </group>
    </Canvas>
  </div>;
}

export function BearClimb3D({ step, level, celebration }: { step: number; level: number; celebration: boolean }) {
  const bear = useRef<THREE.Group>(null);
  useFrame;
  const y = celebration ? 6.7 : 0.8 + step * 0.5;
  const x = step % 2 ? 0.52 : -0.52;
  return <div className="arcade-r3f-stage arcade-r3f-climb" role="img" aria-label={`Gấu đang leo cây màn ${level}`}>
    <Canvas orthographic camera={{ position: [0, 4.2, 12], zoom: 52, near: 0.1, far: 40 }} dpr={[1, 1.3]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={[level % 2 ? '#c9f1ff' : '#d9f7dc']} /><ambientLight intensity={1.7} /><directionalLight position={[5, 10, 7]} intensity={2.1} />
      <Ground color="#82d67a" />
      <mesh position={[0, 3.6, 0]}><cylinderGeometry args={[0.55, 0.85, 7.4, 10]} /><meshStandardMaterial color="#8a5531" roughness={1} /></mesh>
      {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[i % 2 ? 0.85 : -0.85, 1.15 + i * 0.52, 0]} rotation={[0, 0, i % 2 ? -0.08 : 0.08]}><boxGeometry args={[1.6, 0.16, 0.22]} /><meshStandardMaterial color={i < step || celebration ? '#c78a4f' : '#9f6b42'} /></mesh>)}
      <group position={[0, 7.4, 0]}><mesh scale={[1.7, 0.9, 1.4]}><sphereGeometry args={[1.4, 16, 12]} /><meshStandardMaterial color="#4fb467" /></mesh></group>
      <group position={[1.1, 6.9, 0.25]}><mesh><sphereGeometry args={[0.5, 14, 10]} /><meshStandardMaterial color="#f2b52f" /></mesh><mesh position={[0, -0.45, 0]}><cylinderGeometry args={[0.28, 0.4, 0.8, 12]} /><meshStandardMaterial color="#e7a522" /></mesh></group>
      <group ref={bear} position={[x, y, 0.45]}><Bear scale={0.42} /></group>
    </Canvas>
  </div>;
}
