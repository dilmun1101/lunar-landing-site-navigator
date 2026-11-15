import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BufferAttribute, BufferGeometry } from 'three';
import type { SkyPosition } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import type { TerrainGrid } from '@/domain/terrain/terrainGrid/terrainGrid';
import { terrainMesh } from '@/domain/terrain/terrainMesh/terrainMesh';
import GlobeControls from '@/features/scenario/MoonGlobe/GlobeControls';
import { useSiteTerrain } from '@/features/scenario/useSiteTerrain/useSiteTerrain';

/** The patch is 40 km wide with 1-3 km of relief: heights are stretched to be readable */
const EXAGGERATION = 2;
const SUN_DISTANCE_KM = 80;
const SHADOW_HALF_WIDTH_KM = 32;
const MARKER_RADIUS_KM = 0.4;
const CAMERA_HOME = [0, 14, 34] as const;

interface SiteTerrainViewProps {
  lat: number;
  lon: number;
  sun: SkyPosition;
  className?: string;
}

interface TerrainSceneProps {
  grid: TerrainGrid;
  sun: SkyPosition;
  ariaLabel: string;
  className?: string;
}

const rad = (degrees: number) => (degrees * Math.PI) / 180;

function TerrainScene({ grid, sun, ariaLabel, className }: TerrainSceneProps) {
  const geometry = useMemo(() => {
    const mesh = terrainMesh(grid, EXAGGERATION);
    const result = new BufferGeometry();
    result.setAttribute('position', new BufferAttribute(mesh.positions, 3));
    result.setAttribute('normal', new BufferAttribute(mesh.normals, 3));
    result.setIndex(new BufferAttribute(mesh.indices, 1));
    result.computeBoundingSphere();
    return result;
  }, [grid]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Direction to the Sun in scene axes: x east, y up, z south
  const az = rad(sun.azimuth);
  const el = rad(sun.elevation);
  const sunPosition: [number, number, number] = [
    Math.cos(el) * Math.sin(az) * SUN_DISTANCE_KM,
    Math.sin(el) * SUN_DISTANCE_KM,
    -Math.cos(el) * Math.cos(az) * SUN_DISTANCE_KM,
  ];

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <Canvas
        shadows
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.5, far: 400 }}
      >
        <color attach="background" args={['#05070d']} />
        <ambientLight intensity={0.12} />
        {/* The Sun below the horizon gives no light: night */}
        <directionalLight
          castShadow
          intensity={sun.elevation > 0 ? 2.8 : 0}
          position={sunPosition}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-SHADOW_HALF_WIDTH_KM}
          shadow-camera-right={SHADOW_HALF_WIDTH_KM}
          shadow-camera-top={SHADOW_HALF_WIDTH_KM}
          shadow-camera-bottom={-SHADOW_HALF_WIDTH_KM}
          shadow-camera-near={1}
          shadow-camera-far={200}
          shadow-bias={-0.0004}
          shadow-normalBias={0.05}
        />

        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial color="#b4b0aa" roughness={1} />
        </mesh>

        {/* The site: the center of the patch, at the plane's zero */}
        <mesh position={[0, MARKER_RADIUS_KM, 0]}>
          <sphereGeometry args={[MARKER_RADIUS_KM, 16, 16]} />
          <meshBasicMaterial color="#f87171" />
        </mesh>

        <GlobeControls
          home={CAMERA_HOME}
          minDistance={3}
          maxDistance={90}
          keepAboveGround
        />
      </Canvas>
    </div>
  );
}

/**
 * The ground around the site in 3D: relief from LOLA, lit by the Sun, with shadows.
 * Heavy (three.js): import it lazily.
 */
export default function SiteTerrainView({
  lat,
  lon,
  sun,
  className,
}: SiteTerrainViewProps) {
  const { t } = useTranslation();
  const terrain = useSiteTerrain({ lat, lon }, true);

  if (terrain.status === 'error') {
    return (
      <p className="text-sm text-slate-400">{t('scenario.terrain.error')}</p>
    );
  }
  if (terrain.status !== 'ready') {
    return (
      <p className="text-sm text-slate-400">{t('scenario.terrain.loading')}</p>
    );
  }
  return (
    <TerrainScene
      grid={terrain.grid}
      sun={sun}
      ariaLabel={t('scenario.terrain.aria')}
      className={className}
    />
  );
}
