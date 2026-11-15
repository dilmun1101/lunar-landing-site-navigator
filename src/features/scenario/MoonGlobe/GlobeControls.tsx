import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Vec3 } from '@/domain/globe/globeGeometry/globeGeometry';

interface GlobeControlsProps {
  /** Where the camera stands when the site changes: straight above the site */
  home: Vec3;
  /** Zoom limits (distance from the center); defaults suit the unit-radius globe */
  minDistance?: number;
  maxDistance?: number;
  /** true — the camera cannot go below the horizon (for a view of the ground) */
  keepAboveGround?: boolean;
}

/** Rotation by dragging and zoom by the wheel; the canvas renders only when something changes. */
export default function GlobeControls({
  home,
  minDistance = 1.8,
  maxDistance = 6,
  keepAboveGround = false,
}: GlobeControlsProps) {
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    camera.position.set(home[0], home[1], home[2]);
    const controls = new OrbitControls(camera, domElement);
    controls.enablePan = false;
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    if (keepAboveGround) controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.rotateSpeed = 0.6;
    controls.update();
    // invalidate takes a frame count, a listener gets an event object: wrap it
    const onChange = () => invalidate();
    controls.addEventListener('change', onChange);
    invalidate();
    return () => {
      controls.removeEventListener('change', onChange);
      controls.dispose();
    };
  }, [
    camera,
    domElement,
    home,
    invalidate,
    minDistance,
    maxDistance,
    keepAboveGround,
  ]);

  return null;
}
