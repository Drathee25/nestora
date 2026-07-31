import { useMemo } from 'react';

const FLOORS = 11;
const FLOOR_HEIGHT = 0.4;
const TOWER_WIDTH = 2.2;
const TOWER_DEPTH = 1.6;
const TOWER_HEIGHT = FLOORS * FLOOR_HEIGHT;

function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Facade({ width, depth, floors }) {
  const cols = 4;
  const panels = useMemo(() => {
    const pts = [];
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        const x = -width / 2 + (c + 0.5) * (width / cols);
        const y = f * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
        pts.push({ x, y, face: 1, tint: f % 2 === 0 });
        pts.push({ x, y, face: -1, tint: f % 2 === 0 });
      }
    }
    return pts;
  }, [width, depth, floors]);

  return (
    <group>
      {panels.map((p, i) => (
        <group key={i} position={[p.x, p.y, (depth / 2 + 0.01) * p.face]} rotation={[0, p.face > 0 ? 0 : Math.PI, 0]}>
          {/* dark mullion frame behind glass */}
          <mesh position={[0, 0, -0.015]}>
            <planeGeometry args={[width / cols - 0.04, FLOOR_HEIGHT - 0.06]} />
            <meshStandardMaterial color="#2b2a26" roughness={0.8} />
          </mesh>
          {/* glass pane */}
          <mesh>
            <planeGeometry args={[width / cols - 0.1, FLOOR_HEIGHT - 0.12]} />
            <meshPhysicalMaterial
              color={p.tint ? '#bcdcd2' : '#a9cdd6'}
              roughness={0.08}
              metalness={0.1}
              transmission={0.55}
              thickness={0.4}
              ior={1.4}
              reflectivity={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Balconies({ width, depth, floors }) {
  const rand = useMemo(() => seededRand(42), []);
  const slabs = useMemo(() => {
    const arr = [];
    for (let f = 1; f < floors - 1; f++) {
      if (f % 2 === 0) continue;
      arr.push({ y: f * FLOOR_HEIGHT, jitter: rand() * 0.04 });
    }
    return arr;
  }, [floors, rand]);

  return (
    <group>
      {slabs.map((s, i) => (
        <group key={i} position={[0, s.y, depth / 2 + 0.2]}>
          <mesh position={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[width * 0.7, 0.05, 0.4]} />
            <meshStandardMaterial color="#e9dcc3" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.05, 0.18]}>
            <boxGeometry args={[width * 0.7, 0.32, 0.02]} />
            <meshPhysicalMaterial color="#dfe9e5" roughness={0.1} transmission={0.7} thickness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EntranceCanopy() {
  return (
    <group position={[0, 0.42, TOWER_DEPTH / 2 + 0.55]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.05, 0.9]} />
        <meshStandardMaterial color="#d97f2e" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[-0.65, -0.25, 0.35]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#1f4d36" roughness={0.5} />
      </mesh>
      <mesh position={[0.65, -0.25, 0.35]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#1f4d36" roughness={0.5} />
      </mesh>
      {/* steps */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.42 - i * 0.06, 0.5 + i * 0.18]} receiveShadow>
          <boxGeometry args={[1.4 - i * 0.1, 0.06, 0.2]} />
          <meshStandardMaterial color="#cbb98f" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Landscaping() {
  const trees = useMemo(() => {
    const rand = seededRand(7);
    const arr = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand() * 0.2;
      const radius = 3.3 + rand() * 0.6;
      arr.push({
        x: Math.sin(angle) * radius,
        z: Math.cos(angle) * radius,
        scale: 0.7 + rand() * 0.5,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {/* paved courtyard ring */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[1.8, 2.6, 48]} />
        <meshStandardMaterial color="#c7b896" roughness={0.95} />
      </mesh>

      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.scale}>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.035, 0.36, 6]} />
            <meshStandardMaterial color="#6b4a2f" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.46, 0]} castShadow>
            <coneGeometry args={[0.22, 0.5, 8]} />
            <meshStandardMaterial color="#2f5d3f" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Skyline() {
  const buildings = useMemo(() => {
    const rand = seededRand(99);
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = 9 + rand() * 5;
      arr.push({
        x: Math.sin(angle) * radius,
        z: -Math.abs(Math.cos(angle)) * radius - 4,
        h: 1 + rand() * 2.6,
        w: 0.6 + rand() * 0.5,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshStandardMaterial color="#163a29" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export default function Building() {
  return (
    <group>
      {/* Podium / ground floor */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[TOWER_WIDTH + 0.6, 0.4, TOWER_DEPTH + 0.6]} />
        <meshStandardMaterial color="#1f4d36" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Main tower — two-tone facade panels for a less flat look */}
      <mesh position={[0, 0.4 + TOWER_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[TOWER_WIDTH, TOWER_HEIGHT, TOWER_DEPTH]} />
        <meshStandardMaterial color="#efe2cb" roughness={0.55} metalness={0.1} />
      </mesh>

      <group position={[0, 0.4, 0]}>
        <Facade width={TOWER_WIDTH} depth={TOWER_DEPTH} floors={FLOORS} />
        <Balconies width={TOWER_WIDTH} depth={TOWER_DEPTH} floors={FLOORS} />
      </group>

      {/* Gold roofline trim */}
      <mesh position={[0, 0.4 + TOWER_HEIGHT + 0.04, 0]}>
        <boxGeometry args={[TOWER_WIDTH + 0.1, 0.08, TOWER_DEPTH + 0.1]} />
        <meshStandardMaterial color="#d97f2e" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Rooftop water tank + mechanical box */}
      <mesh position={[0.5, 0.4 + TOWER_HEIGHT + 0.28, 0.3]}>
        <cylinderGeometry args={[0.16, 0.16, 0.36, 12]} />
        <meshStandardMaterial color="#8a8a82" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[-0.4, 0.4 + TOWER_HEIGHT + 0.18, -0.3]}>
        <boxGeometry args={[0.3, 0.22, 0.3]} />
        <meshStandardMaterial color="#5d5d56" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.4 + TOWER_HEIGHT + 0.34, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
        <meshStandardMaterial color="#d97f2e" roughness={0.3} metalness={0.7} />
      </mesh>

      <EntranceCanopy />
      <Landscaping />
      <Skyline />

      {/* Ground */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[14, 32]} />
        <meshStandardMaterial color="#7ab87a" roughness={0.9} />
      </mesh>
    </group>
  );
}
