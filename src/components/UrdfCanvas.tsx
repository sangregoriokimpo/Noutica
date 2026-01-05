import { useEffect, useRef, useState } from "react";
import URDFLoader from "urdf-loader";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type UrdfCanvasProps = {
  urdfText: string;
  minHeight?: number;
  onStatus?: (message: string) => void;
};

export default function UrdfCanvas({ urdfText, minHeight = 360, onStatus }: UrdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentRobotRef = useRef<THREE.Object3D | null>(null);
  const frameRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x141414);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 200);
    camera.position.set(3.2, 2.2, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(4, 6, 3);
    scene.add(ambient, directional);

    const grid = new THREE.GridHelper(10, 10, 0x2e2e2e, 0x1e1e1e);
    scene.add(grid);
    const axes = new THREE.AxesHelper(1);
    scene.add(axes);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    const renderLoop = () => {
      controls.update();
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (!cameraRef.current || !rendererRef.current) return;
        cameraRef.current.aspect = width / height || 1;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const loader = new URDFLoader();
    setError(null);
    onStatus?.("Loading URDF...");

    try {
      const robot = loader.parse(urdfText);
      if (currentRobotRef.current) {
        scene.remove(currentRobotRef.current);
      }
      robot.rotation.set(0, 0, 0);
      scene.add(robot);
      currentRobotRef.current = robot;
      onStatus?.("URDF loaded. Drag to orbit, scroll to zoom.");
    } catch (err) {
      setError("Failed to load URDF. Check the XML.");
      onStatus?.("Failed to load URDF. Check the XML.");
      console.error(err);
    }
  }, [urdfText, onStatus]);

  return (
    <div className="urdf-canvas" ref={containerRef} style={{ minHeight }}>
      {error && (
        <div className="muted" style={{ padding: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
