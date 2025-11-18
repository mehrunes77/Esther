/**
 * SolarSystemViewer - Single unified 3D solar system view
 * Shows all 9 planets arranged in orbit around the Sun
 * Uses procedural planets and reloads GLB models where available
 */

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface PlanetData {
  name: string;
  radius: number;
  distance: number;
  color: number;
}

const PLANETS_DATA: PlanetData[] = [
  { name: 'sun', radius: 696350, distance: 0, color: 0xfdb813 },
  { name: 'mercury', radius: 2440, distance: 0.39, color: 0x8c7853 },
  { name: 'venus', radius: 6052, distance: 0.72, color: 0xe89b3c },
  { name: 'earth', radius: 6371, distance: 1.0, color: 0x4169e1 },
  { name: 'mars', radius: 3390, distance: 1.52, color: 0xcd5c5c },
  { name: 'jupiter', radius: 69911, distance: 5.2, color: 0xc88b3a },
  { name: 'saturn', radius: 58232, distance: 9.54, color: 0xfad5a5 },
  { name: 'uranus', radius: 25362, distance: 19.19, color: 0x4fd0e0 },
  { name: 'neptune', radius: 24622, distance: 30.07, color: 0x4166f5 },
];

// Scale factors for visibility
const SIZE_SCALE = 0.001;       // km to scene units
const DISTANCE_SCALE = 20.0;    // AU to scene units - WAY increased

export interface SolarSystemViewerProps {
  onPlanetSelect?: (planetName: string) => void;
}

export function SolarSystemViewer({ onPlanetSelect }: SolarSystemViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 800;

    // === SCENE SETUP ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // === CAMERA ===
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    camera.position.set(0, 400, 400);
    camera.lookAt(0, 0, 0);

    // === RENDERER ===
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // === LIGHTING ===
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 2);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // === STARS BACKGROUND ===
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 500;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 500;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 500;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // === LOAD AND CREATE PLANETS ===
    const loader = new GLTFLoader();
    const planetsGroup: Array<{ mesh: THREE.Object3D; name: string }> = [];

    PLANETS_DATA.forEach((planetData) => {
      const radius = planetData.radius * SIZE_SCALE;
      const distance = planetData.distance * DISTANCE_SCALE;

      // Try to load GLB model first (only for sun)
      if (planetData.name === 'sun') {
        loader.load(
          `/models/sun.glb`,
          (gltf) => {
            const model = gltf.scene;
            // Check actual size and center it
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            console.log(`Sun model size: ${size.x}, ${size.y}, ${size.z}`);
            
            // Center the model at origin
            model.position.sub(center);
            model.position.x = 0;
            model.position.y = 0;
            model.position.z = 0;
            model.userData.planetName = planetData.name;
            scene.add(model);
            planetsGroup.push({ mesh: model, name: planetData.name });
            console.log(`✅ Loaded Sun GLB model at center`);
          },
          undefined,
          (error) => {
            console.warn(`Could not load sun.glb`, error);
            createPlanetSphere(planetData, radius, distance);
          }
        );
      } else if (planetData.name === 'mars') {
        // Load Mars GLB model at its correct distance
        loader.load(
          `/models/mars.glb`,
          (gltf) => {
            const model = gltf.scene;
            // Check actual size and center it
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            console.log(`Mars model size: ${size.x}, ${size.y}, ${size.z}`);
            
            // Center the model first, then position at distance
            model.position.sub(center);
            model.position.x = distance;
            model.position.y = 0;
            model.position.z = 0;
            model.userData.planetName = planetData.name;
            scene.add(model);
            planetsGroup.push({ mesh: model, name: planetData.name });
            console.log(`✅ Loaded Mars GLB model at distance ${distance}`);
          },
          undefined,
          (error) => {
            console.warn(`Could not load mars.glb`, error);
            createPlanetSphere(planetData, radius, distance);
          }
        );
      } else {
        // Create procedural sphere for all other planets
        createPlanetSphere(planetData, radius, distance);
      }

      // === ORBIT LINES ===
      if (distance > 0) {
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitPoints = [];
        for (let i = 0; i <= 128; i++) {
          const angle = (i / 128) * Math.PI * 2;
          orbitPoints.push(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
        }
        orbitGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(orbitPoints), 3));
        const orbitMaterial = new THREE.LineBasicMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.3,
        });
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbit);
      }
    });

    // === CREATE PROCEDURAL PLANET SPHERE ===
    function createPlanetSphere(planetData: PlanetData, radius: number, distance: number) {
      const geometry = new THREE.SphereGeometry(Math.max(radius, 0.5), 32, 32);

      let material;
      if (planetData.name === 'sun') {
        material = new THREE.MeshBasicMaterial({ color: planetData.color });
      } else {
        material = new THREE.MeshPhongMaterial({
          color: planetData.color,
          shininess: 5,
        });
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = distance;
      mesh.position.y = 0;
      mesh.position.z = 0;
      mesh.userData.planetName = planetData.name;
      scene.add(mesh);
      planetsGroup.push({ mesh, name: planetData.name });
      console.log(`✅ Created procedural sphere: ${planetData.name} at distance ${distance}, radius ${radius}`);
    }

    // === ORBIT CONTROLS ===
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 2000;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // === RAYCASTER FOR CLICKS ===
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Build list of objects to test
      const objectsToTest = planetsGroup.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(objectsToTest, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData.planetName) {
          obj = obj.parent;
        }
        if (obj && obj.userData.planetName) {
          const planetName = obj.userData.planetName;
          setSelectedPlanet(planetName);
          onPlanetSelect?.(planetName);
          console.log(`Selected: ${planetName}`);
        }
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // === ANIMATION LOOP ===
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate planets on their axes
      planetsGroup.forEach((p) => {
        if (p.name !== 'sun') {
          p.mesh.rotation.y += 0.003;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // === HANDLE RESIZE ===
    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // === CLEANUP ===
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onMouseClick);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [onPlanetSelect]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#000510',
        }}
      />

      {/* Info overlay */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: '#4a9e8e',
          fontFamily: 'monospace',
          fontSize: '12px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #2d7a6e',
          maxWidth: '300px',
        }}
      >
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
          🌍 SOLAR SYSTEM
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>
          View of the Milky Way Solar System
        </div>
        {selectedPlanet && (
          <div style={{ color: '#4a9e8e', marginTop: '10px' }}>
            Selected: <strong>{selectedPlanet.toUpperCase()}</strong>
          </div>
        )}
      </div>

      {/* Controls info */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: '#666',
          fontFamily: 'monospace',
          fontSize: '11px',
          textAlign: 'right',
          pointerEvents: 'none',
        }}
      >
        <div>🖱️ Drag to rotate</div>
        <div>🔍 Scroll to zoom</div>
        <div>👆 Click planet to select</div>
      </div>
    </div>
  );
}

export default SolarSystemViewer;
