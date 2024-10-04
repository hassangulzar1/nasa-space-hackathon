import { planetsScale } from "@/utils/consts";
import { useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { TextureLoader } from "three";

export default function Sun(props) {
  const texture = useLoader(TextureLoader, "/sun.jpg");
  const myMesh = useRef();

  const sunSize = 1392700; // acutal diameter by KM

  useFrame(({ clock }) => {
    const a = clock.getElapsedTime();
    myMesh.current.rotation.y = a;
    myMesh.current.rotation.x = -4.5;
    // myMesh.current.rotation.z = a;
  });

  return (
    <mesh {...props} ref={myMesh}>
      <pointLight castShadow />
      <sphereBufferGeometry args={[sunSize * planetsScale, 30, 10]} />
      <meshPhongMaterial emissive="#d24d00" map={texture} />
    </mesh>
  );
}
