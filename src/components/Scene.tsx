import { Canvas, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

// put a map snapshot in public/map.png (or jpeg)
// – you can replace this with a tile‑server URL if you prefer.
import mapImg from '../public/map.png';

export default function Scene() {
  const texture = useLoader(TextureLoader, mapImg.src);

  return (
    <Canvas className="w-full h-full" camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* add any other 3‑D objects you like here */}
    </Canvas>
  );
}