import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import type { SkyPosition } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import {
  directionToBody,
  graticule,
  surfacePoint,
} from '@/domain/globe/globeGeometry/globeGeometry';
import BodyArrow from './BodyArrow';
import GlobeControls from './GlobeControls';

const SUN_COLOR = '#fbbf24';
const EARTH_COLOR = '#38bdf8';
/** A body below the horizon: its arrow is grey */
const HIDDEN_COLOR = '#64748b';
const MARKER_COLOR = '#f87171';
const CAMERA_DISTANCE = 3.2;
const MARKER_RADIUS = 1.01;

interface MoonGlobeProps {
  lat: number;
  lon: number;
  sun: SkyPosition;
  earth: SkyPosition;
  /** The canvas is not readable by a screen reader: the label says what it shows */
  ariaLabel: string;
  className?: string;
}

/**
 * The Moon as a ball with the site on it and arrows toward the Sun and the Earth.
 * Heavy (three.js): import it lazily.
 */
export default function MoonGlobe({
  lat,
  lon,
  sun,
  earth,
  ariaLabel,
  className,
}: MoonGlobeProps) {
  const marker = useMemo(
    () => surfacePoint(lat, lon, MARKER_RADIUS),
    [lat, lon]
  );
  const home = useMemo(
    () => surfacePoint(lat, lon, CAMERA_DISTANCE),
    [lat, lon]
  );
  const sunDirection = useMemo(
    () => directionToBody(lat, lon, sun.azimuth, sun.elevation),
    [lat, lon, sun.azimuth, sun.elevation]
  );
  const earthDirection = useMemo(
    () => directionToBody(lat, lon, earth.azimuth, earth.elevation),
    [lat, lon, earth.azimuth, earth.elevation]
  );
  const grid = useMemo(() => new Float32Array(graticule()), []);

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ fov: 40, near: 0.1, far: 50 }}
      >
        <ambientLight intensity={0.15} />
        {/* The Sun is far away: the light just shines along the direction from the site. */}
        <directionalLight
          position={[
            sunDirection[0] * 10,
            sunDirection[1] * 10,
            sunDirection[2] * 10,
          ]}
          intensity={2.6}
        />

        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial color="#9a9a9a" roughness={1} />
        </mesh>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[grid, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#94a3b8" transparent opacity={0.4} />
        </lineSegments>

        <mesh position={[marker[0], marker[1], marker[2]]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshBasicMaterial color={MARKER_COLOR} />
        </mesh>

        <BodyArrow
          origin={marker}
          direction={sunDirection}
          color={sun.elevation > 0 ? SUN_COLOR : HIDDEN_COLOR}
        />
        <BodyArrow
          origin={marker}
          direction={earthDirection}
          color={earth.elevation > 0 ? EARTH_COLOR : HIDDEN_COLOR}
        />

        <GlobeControls home={home} />
      </Canvas>
    </div>
  );
}
