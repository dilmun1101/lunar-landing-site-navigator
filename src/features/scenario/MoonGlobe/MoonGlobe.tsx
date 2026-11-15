import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import {
  DataTexture,
  LinearFilter,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
} from 'three';
import type { SkyPosition } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import {
  directionToBody,
  graticule,
  surfacePoint,
} from '@/domain/globe/globeGeometry/globeGeometry';
import { reliefPixels } from '@/domain/globe/reliefTexture/reliefTexture';
import type { ElevationRaster } from '@/lib/lola/parseElevationTiff/parseElevationTiff';
import BodyArrow from './BodyArrow';
import GlobeControls from './GlobeControls';
import { useGlobalRelief } from './useGlobalRelief';

const SUN_COLOR = '#fbbf24';
const EARTH_COLOR = '#38bdf8';
/** A body below the horizon: its arrow is grey */
const HIDDEN_COLOR = '#64748b';
const MARKER_COLOR = '#f87171';
const CAMERA_DISTANCE = 3.2;
const MARKER_RADIUS = 1.01;
/** How strongly the relief catches the light; tune by eye */
const BUMP_SCALE = 2;
/** Brightness of the lowlands and the highlands on the colour map (0-255) */
const LOWLAND_GRAY = 95;
const HIGHLAND_GRAY = 215;

function grayTexture(raster: ElevationRaster, low: number, high: number) {
  const texture = new DataTexture(
    reliefPixels(raster, low, high),
    raster.width,
    raster.height,
    RGBAFormat
  );
  texture.wrapS = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

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

  // The real relief arrives a moment later; until then (or if it fails) the ball is plain.
  const relief = useGlobalRelief();
  const textures = useMemo(() => {
    if (!relief) return null;
    const color = grayTexture(relief, LOWLAND_GRAY, HIGHLAND_GRAY);
    color.colorSpace = SRGBColorSpace;
    return { color, bump: grayTexture(relief, 0, 255) };
  }, [relief]);
  useEffect(
    () => () => {
      textures?.color.dispose();
      textures?.bump.dispose();
    },
    [textures]
  );

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
          <meshStandardMaterial
            key={textures ? 'relief' : 'plain'}
            color={textures ? '#ffffff' : '#9a9a9a'}
            map={textures?.color ?? null}
            bumpMap={textures?.bump ?? null}
            bumpScale={BUMP_SCALE}
            roughness={1}
          />
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
