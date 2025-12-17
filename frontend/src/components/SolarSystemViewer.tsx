/**
 * SolarSystemViewer - Apple-inspired Solar System 3D Visualization
 * Aesthetic solar system with correct planetary proportions and modern design
 * Features: Accurate relative sizes, beautiful lighting, smooth animations
 */

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface PlanetData {
  name: string;
  radius: number;      // Relative to Earth's radius
  distance: number;    // AU from Sun
  color: string;       // Hex color
  textureColor?: THREE.Color;
  emissive?: number;
}

// Accurate planetary data (radii relative to Earth = 1, distances in AU)
const PLANETS_DATA: PlanetData[] = [
  { name: 'sun', radius: 109.1, distance: 0, color: '#FDB813', emissive: 0x2a2a00 },
  { name: 'mercury', radius: 0.38, distance: 0.39, color: '#8C7853' },
  { name: 'venus', radius: 0.95, distance: 0.72, color: '#FFC649' },
  { name: 'earth', radius: 1.0, distance: 1.0, color: '#4A90E2' },
  { name: 'mars', radius: 0.53, distance: 1.52, color: '#E27B58' },
  { name: 'jupiter', radius: 11.21, distance: 5.2, color: '#C88B3A' },
  { name: 'saturn', radius: 9.45, distance: 9.54, color: '#FAD5A5' },
  { name: 'uranus', radius: 4.01, distance: 19.19, color: '#4FD0E7' },
  { name: 'neptune', radius: 3.88, distance: 30.07, color: '#4166F5' },
];

const DISTANCE_SCALE = 10.0; // Increased for better spacing between planets

// Relative size scaling: all planets roughly same size with subtle differences
// Compressed range to show relative differences without extreme clipping
function calculatePlanetSize(radiusEarths: number): number {
  if (radiusEarths === 109.1) return 2.0; // Sun: half current size, still visible
  if (radiusEarths > 4) return 1.3 + Math.log(radiusEarths) * 0.15; // Gas giants: subtle scaling
  if (radiusEarths > 1) return 1.1 + (radiusEarths - 1) * 0.3; // Terrestrial: compressed range
  return 0.9 + radiusEarths * 0.3; // Small planets: base + small multiplier
}

function logPlanetData() {
  console.log('=== SOLAR SYSTEM CONFIGURATION ===');
  PLANETS_DATA.forEach((p) => {
    const scaledRadius = calculatePlanetSize(p.radius);
    const scaledDistance = p.distance * DISTANCE_SCALE;
    console.log(`${p.name.toUpperCase()}: radiusEarth=${p.radius}, scaledRadius=${scaledRadius.toFixed(2)}, distance=${scaledDistance.toFixed(2)}`);
  });
}

export interface SolarSystemViewerProps {
  onPlanetSelect?: (planetName: string) => void;
}

export function SolarSystemViewer({ onPlanetSelect }: SolarSystemViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const sceneRef = useRef<{ scene?: THREE.Scene; camera?: THREE.PerspectiveCamera; renderer?: THREE.WebGLRenderer; planets?: Array<{ mesh: THREE.Object3D; name: string }> }>({});

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 800;

    // === SCENE SETUP ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814); // Deep space blue
    sceneRef.current.scene = scene;

    // === CAMERA ===
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10000);
    camera.position.set(0, 80, 110); // Adjusted for larger distance scale
    camera.lookAt(0, 0, 0);
    sceneRef.current.camera = camera;

    // === RENDERER ===
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
    sceneRef.current.renderer = renderer;

    // === PREMIUM LIGHTING ===
    // Soft ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Main sun light - creates realistic shadows and highlights
    const sunLight = new THREE.PointLight(0xffffff, 2.0);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // Additional directional light for better planet illumination
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 30, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    // Soft fill light for depth
    const fillLight = new THREE.PointLight(0x87ceeb, 0.2);
    fillLight.position.set(100, 50, 100);
    scene.add(fillLight);

    // === DYNAMIC STARS BACKGROUND ===
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(8000 * 3);
    const starColors = new Float32Array(8000 * 3);
    
    for (let i = 0; i < 8000; i++) {
      const radius = 250 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.cos(phi);
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      
      // Varied star colors (white, blue, yellow)
      const colorVariation = Math.random();
      if (colorVariation < 0.6) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 1.0;
        starColors[i * 3 + 2] = 1.0;
      } else if (colorVariation < 0.8) {
        starColors[i * 3] = 0.8;
        starColors[i * 3 + 1] = 0.9;
        starColors[i * 3 + 2] = 1.0;
      } else {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 1.0;
        starColors[i * 3 + 2] = 0.7;
      }
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.3,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // === CREATE PLANETS WITH PREMIUM MATERIALS ===
    const planets: Array<{ mesh: THREE.Object3D; name: string; rings?: THREE.Object3D }> = [];
    const loader = new GLTFLoader();

    logPlanetData();

    // Helper function to create procedural planets
    function createProceduralPlanet(planetData: PlanetData, radius: number, distance: number) {
      const planetGeometry = new THREE.IcosahedronGeometry(Math.max(radius, 0.8), 32);
        
        // Per-planet realistic properties
        let shininess = 5;
        let emissiveIntensity = 0.05;
        let materialConfig: any = {};
        
        switch(planetData.name) {
          case 'mercury':
            // Gray, cratered, low shininess
            shininess = 3;
            emissiveIntensity = 0.02;
            materialConfig.wireframe = false;
            break;
          case 'venus':
            // Bright, cloudy, reflective
            shininess = 12;
            emissiveIntensity = 0.12;
            break;
          case 'earth':
            // Blue water, reflective oceans
            shininess = 10;
            emissiveIntensity = 0.10;
            break;
          case 'mars':
            // Rusty, matte surface
            shininess = 3;
            emissiveIntensity = 0.04;
            break;
          case 'jupiter':
            // Gas giant, visible bands, slightly reflective
            shininess = 6;
            emissiveIntensity = 0.08;
            break;
          case 'uranus':
            // Ice giant, smooth, reflective
            shininess = 8;
            emissiveIntensity = 0.07;
            break;
          case 'neptune':
            // Ice giant, deep blue, reflective
            shininess = 9;
            emissiveIntensity = 0.08;
            break;
          default:
            shininess = 5;
            emissiveIntensity = 0.05;
        }
        
        const planetMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color(planetData.color),
          shininess: shininess,
          emissive: new THREE.Color(planetData.color).multiplyScalar(emissiveIntensity),
          side: THREE.FrontSide,
          ...materialConfig,
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.position.set(distance, 0, 0);
        planet.userData.planetName = planetData.name;
        planet.castShadow = true;
        planet.receiveShadow = true;
        scene.add(planet);
        planets.push({ mesh: planet, name: planetData.name });
    }

    PLANETS_DATA.forEach((planetData) => {
      const radius = calculatePlanetSize(planetData.radius);
      const distance = planetData.distance * DISTANCE_SCALE;

      if (planetData.name === 'sun') {
        // === SUN: Bright emissive with realistic shadows only ===
        const sunGeometry = new THREE.IcosahedronGeometry(radius, 32);
        const sunMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color(planetData.color),
          emissive: new THREE.Color(planetData.color).multiplyScalar(0.3),
          shininess: 5,
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(0, 0, 0);
        sun.userData.planetName = planetData.name;
        sun.castShadow = true;
        sun.receiveShadow = true;
        scene.add(sun);
        planets.push({ mesh: sun, name: planetData.name });
      } else if (planetData.name === 'jupiter') {
        // === JUPITER: Load from Blender model ===
        loader.load(
          '/models/jupiter.glb',
          (gltf) => {
            const jupiterModel = gltf.scene;
            
            // Calculate bounding box for proper scaling
            const box = new THREE.Box3().setFromObject(jupiterModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            // Scale to match calculated radius
            const scale = (radius * 2) / maxDim;
            jupiterModel.scale.multiplyScalar(scale);
            
            // Center and position
            jupiterModel.position.sub(center.multiplyScalar(scale));
            jupiterModel.position.set(distance, 0, 0);
            jupiterModel.userData.planetName = planetData.name;
            
            // Apply shadow properties to all meshes
            jupiterModel.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            scene.add(jupiterModel);
            planets.push({ mesh: jupiterModel, name: planetData.name });
            console.log(`✅ Jupiter model loaded`);
          },
          undefined,
          (error) => {
            console.warn(`Could not load jupiter.glb, using procedural:`, error);
            // Fallback to procedural
            createProceduralPlanet(planetData, radius, distance);
          }
        );
      } else if (planetData.name === 'saturn') {
        // === SATURN: Load from Blender model ===
        loader.load(
          '/models/saturn.glb',
          (gltf) => {
            const saturnModel = gltf.scene;
            
            // Calculate bounding box for proper scaling
            const box = new THREE.Box3().setFromObject(saturnModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            // Scale to match calculated radius
            const scale = (radius * 2) / maxDim;
            saturnModel.scale.multiplyScalar(scale);
            
            // Center and position
            saturnModel.position.sub(center.multiplyScalar(scale));
            saturnModel.position.set(distance, 0, 0);
            saturnModel.userData.planetName = planetData.name;
            
            // Apply shadow properties to all meshes
            saturnModel.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            scene.add(saturnModel);
            planets.push({ mesh: saturnModel, name: planetData.name });
            console.log(`✅ Saturn model loaded`);
          },
          undefined,
          (error) => {
            console.warn(`Could not load saturn.glb, using procedural:`, error);
            // Fallback to procedural
            createProceduralPlanet(planetData, radius, distance);
          }
        );
      } else if (planetData.name === 'mercury') {
        // === MERCURY: Load from Blender model ===
        loader.load(
          '/models/mercury.glb',
          (gltf) => {
            const mercuryModel = gltf.scene;
            
            // Calculate bounding box for proper scaling
            const box = new THREE.Box3().setFromObject(mercuryModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            // Scale to match calculated radius
            const scale = (radius * 2) / maxDim;
            mercuryModel.scale.multiplyScalar(scale);
            
            // Center and position
            mercuryModel.position.sub(center.multiplyScalar(scale));
            mercuryModel.position.set(distance, 0, 0);
            mercuryModel.userData.planetName = planetData.name;
            
            // Apply shadow properties to all meshes
            mercuryModel.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            scene.add(mercuryModel);
            planets.push({ mesh: mercuryModel, name: planetData.name });
            console.log(`✅ Mercury model loaded`);
          },
          undefined,
          (error) => {
            console.warn(`Could not load mercury.glb, using procedural:`, error);
            // Fallback to procedural
            createProceduralPlanet(planetData, radius, distance);
          }
        );
      } else if (planetData.name === 'uranus') {
        // === URANUS: Load from Blender model ===
        loader.load(
          '/models/uranus.glb',
          (gltf) => {
            const uranusModel = gltf.scene;
            
            // Calculate bounding box for proper scaling
            const box = new THREE.Box3().setFromObject(uranusModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            // Scale to match calculated radius
            const scale = (radius * 2) / maxDim;
            uranusModel.scale.multiplyScalar(scale);
            
            // Center and position
            uranusModel.position.sub(center.multiplyScalar(scale));
            uranusModel.position.set(distance, 0, 0);
            uranusModel.userData.planetName = planetData.name;
            
            // Apply shadow properties to all meshes
            uranusModel.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            scene.add(uranusModel);
            planets.push({ mesh: uranusModel, name: planetData.name });
            console.log(`✅ Uranus model loaded`);
          },
          undefined,
          (error) => {
            console.warn(`Could not load uranus.glb, using procedural:`, error);
            // Fallback to procedural
            createProceduralPlanet(planetData, radius, distance);
          }
        );
      } else if (planetData.name === 'neptune') {
        // === NEPTUNE: Load from Blender model ===
        loader.load(
          '/models/neptune.glb',
          (gltf) => {
            const neptuneModel = gltf.scene;
            
            // Calculate bounding box for proper scaling
            const box = new THREE.Box3().setFromObject(neptuneModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            // Scale to match calculated radius
            const scale = (radius * 2) / maxDim;
            neptuneModel.scale.multiplyScalar(scale);
            
            // Center and position
            neptuneModel.position.sub(center.multiplyScalar(scale));
            neptuneModel.position.set(distance, 0, 0);
            neptuneModel.userData.planetName = planetData.name;
            
            // Apply shadow properties to all meshes
            neptuneModel.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            scene.add(neptuneModel);
            planets.push({ mesh: neptuneModel, name: planetData.name });
            console.log(`✅ Neptune model loaded`);
          },
          undefined,
          (error) => {
            console.warn(`Could not load neptune.glb, using procedural:`, error);
            // Fallback to procedural
            createProceduralPlanet(planetData, radius, distance);
          }
        );
      } else {
        // === OTHER PLANETS: Realistic procedural planets ===
        createProceduralPlanet(planetData, radius, distance);
      }
    });

    sceneRef.current.planets = planets;    // === ORBIT CONTROLS: Smooth and responsive ===
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 60;
    controls.maxDistance = 400;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.enableZoom = true;
    controls.enablePan = true;

    // === RAYCASTER FOR PLANET SELECTION ===
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const objectsToTest = planets.map((p) => p.mesh);
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
        }
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // === ANIMATION LOOP: Smooth rotations ===
    let animationId: number;
    const orbitAngles: Record<string, number> = {};
    
    PLANETS_DATA.forEach((p, index) => {
      orbitAngles[p.name] = (index / PLANETS_DATA.length) * Math.PI * 2;
    });

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate planets on their axes
      planets.forEach((p) => {
        if (p.name !== 'sun') {
          p.mesh.rotation.y += 0.002;
        }
      });

      // Orbital motion on ecliptic plane (X-Z, y=0) - COMPREHENSIVE UPDATE
      PLANETS_DATA.forEach((planetData, index) => {
        if (planetData.distance > 0 && planets[index]) {
          const speed = 0.0003 / Math.sqrt(planetData.distance);
          orbitAngles[planetData.name] += speed;
          const distance = planetData.distance * DISTANCE_SCALE;
          
          // Calculate position on ecliptic plane
          const x = Math.cos(orbitAngles[planetData.name]) * distance;
          const z = Math.sin(orbitAngles[planetData.name]) * distance;
          
          // Update planet position - STRICTLY on plane (y=0)
          planets[index].mesh.position.x = x;
          planets[index].mesh.position.y = 0;
          planets[index].mesh.position.z = z;
          
          // Update Saturn's rings if they exist
          if (planets[index].rings) {
            planets[index].rings!.position.x = x;
            planets[index].rings!.position.y = 0;
            planets[index].rings!.position.z = z;
            // Rings maintain their tilt
            planets[index].rings!.rotation.x = Math.PI / 3.2;
          }
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // === RESPONSIVE RESIZE ===
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
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #000814 0%, #001a33 100%)',
        }}
      />

      {/* Info Panel - Top Left */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          color: '#4a9e8e',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '13px',
          background: 'rgba(0, 8, 20, 0.85)',
          padding: '18px 24px',
          borderRadius: '12px',
          border: '1px solid rgba(74, 158, 142, 0.2)',
          backdropFilter: 'blur(10px)',
          minWidth: '280px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ marginBottom: '12px', fontWeight: '600', fontSize: '14px', color: '#fff' }}>
          🌍 SOLAR SYSTEM
        </div>
        <div style={{ fontSize: '12px', color: '#8a8a8a', marginBottom: '12px', lineHeight: '1.5' }}>
          Real-time 3D visualization of our solar system with accurate planetary proportions
        </div>
        {selectedPlanet && (
          <div style={{ 
            color: '#4a9e8e', 
            marginTop: '12px', 
            padding: '10px 12px', 
            background: 'rgba(74, 158, 142, 0.1)',
            borderRadius: '8px',
            borderLeft: '3px solid #4a9e8e'
          }}>
            <strong>{selectedPlanet.toUpperCase()}</strong>
          </div>
        )}
      </div>

      {/* Controls Info - Bottom Right */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          color: '#666',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '12px',
          textAlign: 'right',
          pointerEvents: 'none',
          background: 'rgba(0, 8, 20, 0.7)',
          padding: '14px 18px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ marginBottom: '6px' }}>🖱️ Drag to rotate</div>
        <div style={{ marginBottom: '6px' }}>🔍 Scroll to zoom</div>
        <div>👆 Click planet to select</div>
      </div>
    </div>
  );
}

export default SolarSystemViewer;
