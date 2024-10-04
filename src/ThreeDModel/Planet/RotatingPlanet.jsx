import { useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { useRef, useState } from "react";
import { TextureLoader } from "three";

export default function RotatingPlanet({
  color,
  name,
  speed,
  position: initialPosition,
  size,
  photo,
  ...props
}) {
  function Rotating() {
    const [position, setPosition] = useState(initialPosition);
    const myMesh = useRef();

    useFrame(({ clock }) => {
      const a = clock.getElapsedTime();
      myMesh.current.rotation.y = a; // Y-axis rotation for all planets
      myMesh.current.rotation.x = 4.5; // Fixed angle for now

      const newValue = initialPosition + (a * speed) / 50;
      setPosition([
        initialPosition * Math.cos(newValue),
        initialPosition * Math.sin(newValue),
        0,
      ]);
    });

    const texture = useLoader(TextureLoader, photo);

    return (
      <mesh
        {...props}
        receiveShadow
        castShadow
        ref={myMesh}
        position={position} // Rotating based on calculated position
      >
        {/* Planet Sphere */}
        <sphereBufferGeometry args={[size, 30, 10]} />
        <meshPhysicalMaterial map={texture} />

        { name === "saturn" && (
           <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
           <ringBufferGeometry args={[size * 1.2, size * 1.4, 64]} />
           <meshStandardMaterial color="rgba(200,200,200,0.7)" side={2} />
           </mesh>
          )}

      </mesh>
    );
  }

  return <Rotating />;
}
