import { Fragment } from "react";

import PlanetPath from "./Path";
import RotatingPlanet from "./RotatingPlanet";
import { planetsScale } from "@/utils/consts";

export default function Planet({ size, ...props }) {
  const newSize = size * planetsScale * 10;

  return (
    <Fragment>
      <RotatingPlanet {...props} size={newSize} />

      <PlanetPath {...props} size={newSize} />
    </Fragment>
  );
}
