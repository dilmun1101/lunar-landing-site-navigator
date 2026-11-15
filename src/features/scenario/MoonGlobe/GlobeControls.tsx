import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Vec3 } from '@/domain/globe/globeGeometry/globeGeometry';

interface GlobeControlsProps {
  /** Where the camera stands when the site changes: straight above the site */
  home: Vec3;
}

/** Rotation by dragging and zoom by the wheel; the canvas renders only when something changes. */
export default function GlobeControls({ home }: GlobeControlsProps) {
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    camera.position.set(home[0], home[1], home[2]);
    const controls = new OrbitControls(camera, domElement);
    controls.enablePan = false;
    controls.minDistance = 1.8;
    controls.maxDistance = 6;
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
  }, [camera, domElement, home, invalidate]);

  return null;
}
