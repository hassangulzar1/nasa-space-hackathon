import { extend, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { MapControls } from "three/examples/jsm/controls/MapControls";

extend({ MapControls });

function Control(props) {
  const { camera, gl } = useThree();

  useEffect(() => {
    document.onkeydown = function (e) {
      switch (e.key) {
        case "+":
          camera.position.y += .1;
          break;
        case "-":
          camera.position.y -= .1;
          break;
        case "ArrowUp":
          camera.position.z += .1;
          break;
        case "ArrowDown":
          camera.position.z -= .1;
          break;
        case "ArrowLeft":
          camera.position.x -= .1;
          break;
        case "ArrowRight":
          camera.position.x += .1;
          break;
        case "X":
          camera.rotation.x += 0.25;
          break;
        case "x":
          camera.rotation.x -= 0.25;
          break;
        case "Y":
          camera.rotation.y += 0.25;
          break;
        case "y":
          camera.rotation.y -= 0.25;
          break;
        case "Z":
          camera.rotation.z += 0.25;
          break;
        case "z":
          camera.rotation.z -= 0.25;
          break;
        case "0":
          camera.position.x = 2;
          camera.position.y = -16;
          camera.position.z = 5;
          camera.rotation.x = 1.267911458419925;
          camera.rotation.y = 0.11874866284286384;
          camera.rotation.z = -0.36236320608912587;
          break;
        default:
          console.log("click " + e.key + " is not useable in the app");
          break;
      }
    };
  });

  return (
    <mapControls
      {...props}
      attach={"mapControls"}
      args={[camera, gl.domElement]}
    />
  );
}

export default Control;
