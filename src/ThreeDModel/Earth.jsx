import { planetsScale } from "@/utils/consts";
import { useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { TextureLoader } from "three";

export default function Earth(props) {
  const texture = useLoader(TextureLoader, "/earth.jpg");
  const myMesh = useRef();

  const earthSize = 1122742; // Actual diameter of the Earth in kilometers

  useFrame(({ clock }) => {
    const a = clock.getElapsedTime();
    myMesh.current.rotation.y = a * 0.1; // Slower rotation to mimic Earth's rotation speed
  });

  return (
    <mesh {...props} ref={myMesh}>
      <sphereBufferGeometry args={[earthSize * planetsScale, 30, 10]} />
      <meshPhongMaterial map={texture} />
    </mesh>
  );
}
