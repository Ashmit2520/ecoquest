"use client";
import { Grid } from "@react-three/drei";

export default function Map() {
  return (
    <group>
      {/* The Ground Plane (The "Grass" or "Base") */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#f0fdf4" /> {/* Very light mint green */}
      </mesh>

      {/* The Map Grid */}
      <Grid
        infiniteGrid
        fadeDistance={40}
        fadeStrength={5}
        cellSize={1}          // Small squares
        sectionSize={5}       // Larger bold squares
        sectionColor="#bbf7d0" // Darker green lines
        cellColor="#dcfce7"    // Lighter green lines
      />
    </group>
  );
}