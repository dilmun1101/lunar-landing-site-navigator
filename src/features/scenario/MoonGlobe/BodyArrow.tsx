import { useEffect, useMemo } from 'react';
import { ArrowHelper, Vector3 } from 'three';
import type { Vec3 } from '@/domain/globe/globeGeometry/globeGeometry';

interface BodyArrowProps {
  origin: Vec3;
  /** Unit direction from the origin */
  direction: Vec3;
  color: string;
  length?: number;
}

/** An arrow from the site toward the Sun or the Earth. */
export default function BodyArrow({
  origin,
  direction,
  color,
  length = 0.7,
}: BodyArrowProps) {
  const arrow = useMemo(
    () =>
      new ArrowHelper(
        new Vector3(direction[0], direction[1], direction[2]),
        new Vector3(origin[0], origin[1], origin[2]),
        length,
        color,
        length * 0.22,
        length * 0.1
      ),
    [origin, direction, color, length]
  );

  useEffect(() => () => arrow.dispose(), [arrow]);

  return <primitive object={arrow} />;
}
