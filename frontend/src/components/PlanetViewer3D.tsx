/**
 * PlanetViewer3D - Interactive 3D planet visualization using Three.js
 * 
 * Features:
 * - Realistic planet rendering with NASA textures
 * - Animated surfaces (UV scrolling for atmospheric movement)
 * - Solar ejections and particle effects for the Sun
 * - Interactive controls (rotate, zoom, pan)
 * - Auto-rotation with toggle
 * - Planet switching without reload
 * - Real-time data overlay
 */

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export interface PlanetViewer3DProps {
  planetName: string;
  planetData?: {
    diameter: number;
    distance: number;
    temperature: { min: number; avg: number; max: number };
    moons?: string[];
  };
  autoRotate?: boolean;
}

// Predefined planet data for immediate display
const PLANET_DEFAULTS: Record<string, {
  diameter: number;
  distance: number;
  temperature: { min: number; avg: number; max: number };
  moons?: string[];
}> = {
  sun: {
    diameter: 1392700, // km
    distance: 0, // AU (it's the center)
    temperature: { min: 5500, avg: 5778, max: 6050 }, // K (surface)
    moons: [],
  },
  mercury: {
    diameter: 4879,
    distance: 0.39,
    temperature: { min: 100, avg: 440, max: 700 },
    moons: [],
  },
  venus: {
    diameter: 12104,
    distance: 0.72,
    temperature: { min: 730, avg: 737, max: 750 },
    moons: [],
  },
  earth: {
    diameter: 12742,
    distance: 1.0,
    temperature: { min: 184, avg: 288, max: 331 },
    moons: ['Moon'],
  },
  mars: {
    diameter: 6779,
    distance: 1.52,
    temperature: { min: 130, avg: 210, max: 308 },
    moons: ['Phobos', 'Deimos'],
  },
  jupiter: {
    diameter: 139820,
    distance: 5.20,
    temperature: { min: 108, avg: 165, max: 220 },
    moons: ['Io', 'Europa', 'Ganymede', 'Callisto'],
  },
  saturn: {
    diameter: 116460,
    distance: 9.54,
    temperature: { min: 82, avg: 134, max: 180 },
    moons: ['Titan', 'Enceladus', 'Mimas'],
  },
  uranus: {
    diameter: 50724,
    distance: 19.19,
    temperature: { min: 49, avg: 76, max: 100 },
    moons: ['Miranda', 'Ariel', 'Umbriel'],
  },
  neptune: {
    diameter: 49244,
    distance: 30.07,
    temperature: { min: 50, avg: 72, max: 95 },
    moons: ['Triton', 'Proteus'],
  },
};

export function PlanetViewer3D({ 
  planetName, 
  planetData,
  autoRotate = true 
}: PlanetViewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetRef = useRef<THREE.Object3D | null>(null); // Changed from THREE.Mesh to THREE.Object3D to support both Mesh and Group (GLB models)
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Use provided data or fallback to defaults
  const displayData = planetData || PLANET_DEFAULTS[planetName.toLowerCase()] || {
    diameter: 0,
    distance: 0,
    temperature: { min: 0, avg: 0, max: 0 },
  };

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Wait for container to have dimensions
    const container = mountRef.current;
    
    // Force minimum dimensions if not set
    const getWidth = () => container.clientWidth || 800;
    const getHeight = () => container.clientHeight || 600;
    
    const checkDimensions = () => {
      const width = getWidth();
      const height = getHeight();
      
      if (width < 100 || height < 100) {
        console.warn('⏳ Container has insufficient dimensions, retrying...', { width, height });
        return false;
      }
      return true;
    };
    
    // Retry up to 20 times with 100ms delays (total 2 seconds)
    let retries = 0;
    const initScene = () => {
      if (!checkDimensions()) {
        retries++;
        if (retries < 20) {
          setTimeout(initScene, 100);
        } else {
          console.error('❌ Failed to get container dimensions after retries');
          // Use fallback dimensions
          console.log('⚠️ Using fallback dimensions: 800x600');
        }
      }

      const width = getWidth();
      const height = getHeight();
      console.log(`📐 Container dimensions: ${width}x${height}`);

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000510); // Dark space background
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        0.1,
        1000
      );
      camera.position.z = 15;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);

      console.log(`🎨 Renderer created: ${width}x${height}`);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(10, 5, 10);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x6699ff, 0.3);
    fillLight.position.set(-10, 0, -10);
    scene.add(fillLight);
    
    // Add a point light at camera position for better visibility
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.copy(camera.position);
    scene.add(pointLight);
    
    console.log(`🎥 Camera positioned at z=${camera.position.z}`);

      // Try to load GLB model first
      const modelPath = `/models/${planetName.toLowerCase()}.glb`;
      const loader = new GLTFLoader();
      
      console.log(`🔄 Attempting to load: ${modelPath}`);
      
      loader.load(
        modelPath,
        (gltf) => {
          // GLB model loaded successfully
          console.log(`✅ GLB model loaded for ${planetName}`, gltf);
          const planetMesh = gltf.scene;
          
          let ejectionSystem: SolarEjectionSystem | null = null;

          // Log all children in the scene
          console.log(`🔍 Scene has ${planetMesh.children.length} children`);
          
          planetMesh.traverse((child) => {
            console.log(`  - ${child.type}: ${child.name || 'unnamed'}`, child);
            if (child instanceof THREE.Mesh) {
              console.log(`    Material:`, child.material);
              // Just ensure materials are visible - no shaders
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  mat.transparent = false;
                  mat.opacity = 1;
                  mat.visible = true;
                });
              } else if (child.material) {
                child.material.transparent = false;
                child.material.opacity = 1;
                child.material.visible = true;
              }
            }
          });
          
          // Create solar ejection system for the Sun
          if (planetName.toLowerCase() === 'sun') {
            ejectionSystem = new SolarEjectionSystem();
            scene.add(ejectionSystem.particles);
            console.log('✅ Solar ejection system created');
          }
          
          // Calculate bounding box to properly scale the model
          const box = new THREE.Box3().setFromObject(planetMesh);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          
          console.log(`📦 Model size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
          console.log(`📍 Model center: ${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)}`);
          console.log(`📏 Max dimension: ${maxDim.toFixed(2)}`);
          
          // Scale to fit in scene (target size: 4 units)
          const scale = 4 / maxDim;
          planetMesh.scale.set(scale, scale, scale);
          
          // Center the model at origin
          planetMesh.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
          
          console.log(`✨ Scaled by ${scale.toFixed(4)}, positioned at (${planetMesh.position.x.toFixed(2)}, ${planetMesh.position.y.toFixed(2)}, ${planetMesh.position.z.toFixed(2)})`);
          console.log(`🎯 Final bounding box:`, new THREE.Box3().setFromObject(planetMesh));
          
          scene.add(planetMesh);
          planetRef.current = planetMesh;
          
          // Store ejection system if this is the Sun
          if (ejectionSystem) {
            (planetMesh as any).ejectionSystem = ejectionSystem;
          }
          
          setLoading(false);
          
          console.log(`✅ ${planetName} model added to scene!`);
        },
        (progress) => {
          // Progress callback
          if (progress.total > 0) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            setLoadProgress(percentComplete);
            console.log(`📊 Loading ${planetName}: ${percentComplete.toFixed(0)}%`);
          }
        },
        (error) => {
          // Fallback to basic sphere if GLB not found
          console.error(`❌ GLB model failed to load for ${planetName}:`, error);
          console.log(`⚠️ Using sphere fallback`);
          const geometry = new THREE.SphereGeometry(2, 64, 64);
          const material = new THREE.MeshStandardMaterial({
            color: getPlanetColor(planetName),
            roughness: 0.7,
            metalness: 0.3,
          });
          const planetMesh = new THREE.Mesh(geometry, material);
          scene.add(planetMesh);
          planetRef.current = planetMesh;
          setLoading(false);
        }
      );    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 30;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    // Stars background
    addStars(scene);

    // Animation loop
    let startTime = Date.now();
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const elapsed = (Date.now() - startTime) / 1000; // seconds

      if (planetRef.current) {
        if (isRotating) {
          planetRef.current.rotation.y += 0.001;
        }

        // Update solar ejections for the Sun
        if (planetName.toLowerCase() === 'sun') {
          const ejectionSystem = (planetRef.current as any).ejectionSystem;
          if (ejectionSystem) {
            ejectionSystem.triggerEjection(planetRef.current.position, Date.now());
            ejectionSystem.update(16); // ~60fps delta
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = getWidth();
      const height = getHeight();
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      // Cleanup planet mesh/model materials and textures
      if (planetRef.current) {
        planetRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  mat.dispose();
                  if ((mat as any).map) (mat as any).map.dispose();
                });
              } else {
                child.material.dispose();
                if ((child.material as any).map) (child.material as any).map.dispose();
              }
            }
          }
        });
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        mountRef.current?.removeChild(rendererRef.current.domElement);
      }
    };
    }; // End of initScene function
    
    // Start the initialization
    initScene();
  }, [planetName]);

  // Update auto-rotation when toggle changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', minHeight: '600px' }}>
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '600px',
          borderRadius: '8px',
          overflow: 'hidden'
        }} 
      />
      
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60%',
          maxWidth: '400px',
        }}>
          <div style={{
            color: '#00ff00',
            fontSize: '14px',
            fontFamily: 'monospace',
            marginBottom: '10px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}>
            loading {planetName}...
          </div>
          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgba(0, 255, 0, 0.2)',
            border: '1px solid #00ff00',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${loadProgress}%`,
              background: 'linear-gradient(90deg, #00ff00, #00aa00)',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px #00ff00',
            }}></div>
          </div>
          <div style={{
            color: '#00ff00',
            fontSize: '11px',
            fontFamily: 'monospace',
            marginTop: '8px',
            textAlign: 'center',
          }}>
            {loadProgress.toFixed(0)}%
          </div>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: '#ffaa00',
          fontSize: '12px',
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.7)',
          padding: '8px 12px',
          borderRadius: '4px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Controls overlay */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '12px',
        background: 'rgba(0,0,0,0.7)',
        padding: '12px',
        borderRadius: '8px',
      }}>
        <div><strong>{planetName.toUpperCase()}</strong></div>
        {displayData && displayData.diameter > 0 && (
          <>
            <div>Diameter: {displayData.diameter.toLocaleString()} km</div>
            <div>Distance: {displayData.distance} AU</div>
            <div>Temp: {displayData.temperature.avg}K</div>
            {displayData.moons && displayData.moons.length > 0 && (
              <div>Moons: {displayData.moons.length}</div>
            )}
          </>
        )}
        <div style={{ marginTop: '8px' }}>
          <button
            onClick={() => setIsRotating(!isRotating)}
            style={{
              background: isRotating ? '#00ff00' : '#666',
              border: 'none',
              color: 'black',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          >
            {isRotating ? '⏸ Pause' : '▶ Rotate'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        color: '#888',
        fontFamily: 'monospace',
        fontSize: '11px',
        textAlign: 'right',
      }}>
        <div>🖱️ Drag to rotate</div>
        <div>🔍 Scroll to zoom</div>
        <div>👆 Right-click to pan</div>
      </div>
    </div>
  );
}

// Helper function to add stars
function addStars(scene: THREE.Scene) {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    sizeAttenuation: true,
  });

  const starsVertices = [];
  for (let i = 0; i < 3000; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    starsVertices.push(x, y, z);
  }

  starsGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starsVertices, 3)
  );

  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

// Helper function for fallback colors
function getPlanetColor(planetName: string): number {
  const colors: Record<string, number> = {
    sun: 0xfdb813, // Bright yellow-orange for the Sun
    mercury: 0x8c7853,
    venus: 0xe89b3c,
    earth: 0x4169e1,
    mars: 0xcd5c5c,
    jupiter: 0xc88b3a,
    saturn: 0xfad5a5,
    uranus: 0x4fd0e0,
    neptune: 0x4166f5,
  };
  return colors[planetName.toLowerCase()] || 0x888888;
}

// Particle system for solar ejections
class SolarEjectionSystem {
  particles: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  velocities: Float32Array;
  ages: Float32Array;
  lifespans: Float32Array;
  maxParticles = 200;
  particleIndex = 0;
  lastEjectionTime = 0;
  ejectionInterval = 500; // ms between ejections

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(this.maxParticles * 3);
    this.velocities = new Float32Array(this.maxParticles * 3);
    this.ages = new Float32Array(this.maxParticles);
    this.lifespans = new Float32Array(this.maxParticles);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
  }

  emit(originPoint: THREE.Vector3, count = 5) {
    for (let i = 0; i < count; i++) {
      const idx = this.particleIndex * 3;
      
      // Random direction from sun surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      // Position on sphere surface
      const positions = this.geometry.attributes.position.array as Float32Array;
      positions[idx] = originPoint.x + Math.sin(phi) * Math.cos(theta) * 2.2;
      positions[idx + 1] = originPoint.y + Math.sin(phi) * Math.sin(theta) * 2.2;
      positions[idx + 2] = originPoint.z + Math.cos(phi) * 2.2;

      // Velocity away from sun
      this.velocities[idx] = Math.sin(phi) * Math.cos(theta) * (0.02 + Math.random() * 0.03);
      this.velocities[idx + 1] = Math.sin(phi) * Math.sin(theta) * (0.02 + Math.random() * 0.03);
      this.velocities[idx + 2] = Math.cos(phi) * (0.02 + Math.random() * 0.03);

      this.ages[this.particleIndex] = 0;
      this.lifespans[this.particleIndex] = 1000 + Math.random() * 1000; // ms

      this.particleIndex = (this.particleIndex + 1) % this.maxParticles;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  update(deltaTime: number) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    const opacities = new Float32Array(this.maxParticles);

    for (let i = 0; i < this.maxParticles; i++) {
      this.ages[i] += deltaTime;
      
      const idx = i * 3;
      const lifeProgress = this.ages[i] / this.lifespans[i];

      if (lifeProgress < 1) {
        // Update position
        positions[idx] += this.velocities[idx];
        positions[idx + 1] += this.velocities[idx + 1];
        positions[idx + 2] += this.velocities[idx + 2];

        // Fade out
        opacities[i] = 1 - lifeProgress;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.material.opacity = 0.8;
  }

  triggerEjection(originPoint: THREE.Vector3, currentTime: number) {
    if (currentTime - this.lastEjectionTime > this.ejectionInterval) {
      this.emit(originPoint, 3 + Math.floor(Math.random() * 3));
      this.lastEjectionTime = currentTime;
    }
  }
}

export default PlanetViewer3D;
