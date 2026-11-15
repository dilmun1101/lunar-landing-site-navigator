import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BufferAttribute, BufferGeometry } from 'three';
import type { SkyPosition } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import type { TerrainGrid } from '@/domain/terrain/terrainGrid/terrainGrid';
import { terrainElevationAt } from '@/domain/horizon/horizonProfile/horizonProfile';
import { skyBodyPosition } from '@/domain/terrain/skyBodyPosition/skyBodyPosition';
import { terrainMesh } from '@/domain/terrain/terrainMesh/terrainMesh';
import Button from '@/components/ui/Button/Button';
import GlobeControls from '@/features/scenario/MoonGlobe/GlobeControls';
import { useSiteTerrain } from '@/features/scenario/useSiteTerrain/useSiteTerrain';

/** The patch is 40 km wide with 1-3 km of relief: heights are stretched to be readable */
const EXAGGERATION = 2;
const SUN_DISTANCE_KM = 80;
/** The Sun and the Earth are drawn far larger than in reality, or they would be invisible dots */
const SKY_DISTANCE_KM = 200;
const SUN_DRAW_RADIUS_KM = 7;
const EARTH_DRAW_RADIUS_KM = 5;
const SUN_COLOR = '#fbbf24';
const EARTH_COLOR = '#38bdf8';
const SHADOW_HALF_WIDTH_KM = 32;
const MARKER_RADIUS_KM = 0.4;
const CAMERA_HOME = [0, 14, 34] as const;

interface SiteTerrainViewProps {
  lat: number;
  lon: number;
  sun: SkyPosition;
  earth: SkyPosition;
  /** Terrain horizon (72 values), to tell a body behind a mountain from one in the open sky */
  horizon: number[];
  className?: string;
}

interface TerrainSceneProps {
  grid: TerrainGrid;
  sun: SkyPosition;
  earth: SkyPosition;
  horizon: number[];
  ariaLabel: string;
  className?: string;
}

interface SkyBodyProps {
  body: SkyPosition;
  horizon: number[];
  radius: number;
  color: string;
  glow?: boolean;
}

/** The Sun or the Earth in the sky. Behind the terrain horizon it is shown pale. */
function SkyBody({ body, horizon, radius, color, glow = false }: SkyBodyProps) {
  // Below the geometric horizon the body is under the ground: not drawn at all
  if (body.elevation <= 0) return null;
  const hidden = body.elevation < terrainElevationAt(horizon, body.azimuth);
  const position = skyBodyPosition(
    body.azimuth,
    body.elevation,
    SKY_DISTANCE_KM
  );
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hidden ? 0.25 : 1}
        />
      </mesh>
      {glow && !hidden && (
        <mesh>
          <sphereGeometry args={[radius * 1.7, 24, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} />
        </mesh>
      )}
    </group>
  );
}

function TerrainScene({
  grid,
  sun,
  earth,
  horizon,
  ariaLabel,
  className,
}: TerrainSceneProps) {
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

  const sunPosition = skyBodyPosition(
    sun.azimuth,
    sun.elevation,
    SUN_DISTANCE_KM
  );

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

        <SkyBody
          body={sun}
          horizon={horizon}
          radius={SUN_DRAW_RADIUS_KM}
          color={SUN_COLOR}
          glow
        />
        <SkyBody
          body={earth}
          horizon={horizon}
          radius={EARTH_DRAW_RADIUS_KM}
          color={EARTH_COLOR}
        />

        {/* North: a white arrow just beyond the northern edge of the patch */}
        <mesh
          position={[0, 0.3, -(grid.radiusKm + 3)]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[0.9, 2.6, 12]} />
          <meshBasicMaterial color="#f8fafc" />
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
  earth,
  horizon,
  className,
}: SiteTerrainViewProps) {
  const { t } = useTranslation();
  const terrain = useSiteTerrain({ lat, lon }, true);

  if (terrain.status === 'error') {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-slate-400">{t('scenario.terrain.error')}</p>
        <Button onClick={terrain.retry}>{t('scenario.terrain.retry')}</Button>
      </div>
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
      earth={earth}
      horizon={horizon}
      ariaLabel={t('scenario.terrain.aria')}
      className={className}
    />
  );
}
