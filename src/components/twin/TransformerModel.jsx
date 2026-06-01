import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { statusColor } from '../../utils/status';

function CoreModel({ status, setComponent }) {
  const group = useRef();
  const [hovered, setHovered] = useState(null);
  const color = statusColor[status] || statusColor.NORMAL;
  const fault = {
    windings: status === 'CRITICAL' || status === 'WARNING',
    oilTank: status === 'CRITICAL',
    radiators: status === 'CRITICAL' || status === 'WARNING',
  };

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18;
  });

  return (
    <group ref={group} scale={hovered ? 1.03 : 1}>
      <mesh position={[0, 0.2, 0]} onPointerOver={() => { const data = { name: 'Oil Tank', condition: fault.oilTank ? 'Oil thermal stress' : 'Stable', health: fault.oilTank ? 52 : 88 }; setHovered(data); setComponent(data); }} onPointerOut={() => setHovered(null)}>
        <boxGeometry args={[2.2, 2.5, 1.25]} />
        <meshStandardMaterial color="#52616b" metalness={0.7} roughness={0.32} emissive={fault.oilTank ? '#fb923c' : color} emissiveIntensity={fault.oilTank ? 0.55 : 0.06} />
      </mesh>
      {[-0.8, 0, 0.8].map((x) => (
        <mesh key={x} position={[x, 1.75, 0]} onPointerOver={() => { const data = { name: 'Bushings', condition: 'Voltage insulation normal', health: 91 }; setHovered(data); setComponent(data); }} onPointerOut={() => setHovered(null)}>
          <cylinderGeometry args={[0.18, 0.22, 0.9, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.35} roughness={0.22} />
        </mesh>
      ))}
      {[-1.35, 1.35].map((x) => (
        <mesh key={x} position={[x, 0.1, 0]} onPointerOver={() => { const data = { name: 'Cooling Radiators', condition: fault.radiators ? 'Reduced cooling efficiency' : 'Normal heat rejection', health: fault.radiators ? 58 : 90 }; setHovered(data); setComponent(data); }} onPointerOut={() => setHovered(null)}>
          <cylinderGeometry args={[0.18, 0.18, 2.3, 20]} />
          <meshStandardMaterial color="#1f3840" metalness={0.45} roughness={0.4} emissive={fault.radiators ? '#ef4444' : '#000000'} emissiveIntensity={fault.radiators ? 0.6 : 0} />
        </mesh>
      ))}
      {[-0.65, 0, 0.65].map((x) => (
        <mesh key={x} position={[x, -1.22, 0.72]} rotation={[Math.PI / 2, 0, 0]} onPointerOver={() => { const data = { name: 'Windings', condition: fault.windings ? 'Overheating deviation' : 'Thermal curve normal', health: fault.windings ? 46 : 92 }; setHovered(data); setComponent(data); }} onPointerOut={() => setHovered(null)}>
          <cylinderGeometry args={[0.16, 0.16, 0.32, 28]} />
          <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.24} emissive={fault.windings ? '#ef4444' : '#000000'} emissiveIntensity={fault.windings ? 0.9 : 0} />
        </mesh>
      ))}
      <mesh position={[0, -1.35, 0]} onPointerOver={() => { const data = { name: 'Core', condition: 'Magnetic loading stable', health: 86 }; setHovered(data); setComponent(data); }} onPointerOut={() => setHovered(null)}>
        <boxGeometry args={[2.8, 0.25, 1.55]} />
        <meshStandardMaterial color="#24343b" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.2, -0.72]}>
        <boxGeometry args={[2.45, 2.1, 0.08]} />
        <meshStandardMaterial color={color} transparent opacity={0.18} emissive={color} emissiveIntensity={0.9} />
      </mesh>
      <pointLight position={[0, 1.2, 1.4]} color={color} intensity={hovered ? 3.8 : 2.4} distance={4.5} />
      {hovered ? (
        <group position={[0, 2.7, 0]}>
          <mesh>
            <boxGeometry args={[2.2, 0.58, 0.05]} />
            <meshBasicMaterial color="#0d1b20" transparent opacity={0.9} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

export function TransformerModel({ status = 'NORMAL', transformer }) {
  const [component, setComponent] = useState({ name: 'Selectable Components', condition: 'Hover the 3D model', health: transformer?.healthScore || 90 });

  return (
    <div className="relative h-[360px] overflow-hidden rounded border border-grid-line bg-[#081115]">
      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded border border-grid-line bg-grid-panel/90 px-3 py-2 text-xs shadow-panel">
        <p className="font-semibold text-white">{component.name}</p>
        <p className="mt-1 text-slate-400">{component.condition}</p>
        <p className="mt-1 text-cyan-100">Health {component.health}%</p>
      </div>
      <Canvas camera={{ position: [3.8, 2.6, 4.2], fov: 42 }}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 5, 3]} intensity={2.2} />
        <gridHelper args={[8, 16, '#24424b', '#162a31']} position={[0, -1.5, 0]} />
        <CoreModel status={status} setComponent={setComponent} />
        <OrbitControls enablePan={false} minDistance={3.4} maxDistance={7.2} />
      </Canvas>
    </div>
  );
}
