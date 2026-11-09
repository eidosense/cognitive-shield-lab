'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Play, Pause, RotateCw, Clock, AlertTriangle, Zap, Radio, Heart, Brain } from 'lucide-react';

export interface TimelineFrame {
  timestamp: string;
  second: number;
  targetOrgan: string;
  detectedMechanism: string;
  biochemicalSomaticImpact: string;
  severity: number;
}

export interface SomaticBiochemicalImpact {
  amygdalaThreat: number;
  prefrontalInhibition: number;
  cortisolStressSurge: number;
  dopamineExploitation: number;
  cardiovascularStrain: number;
  gutBrainTension: number;
  summaryBiochemical: string;
  summaryConsciousness: string;
  affectedOrganHotspots: string[];
}

export interface InfrasoundBrainwaveMetrics {
  detectedInfrasoundZone: string;
  infrasoundSeverity: number;
  entrainedBrainwave: string;
  binauralPacingHazard: number;
  vestibularDisorientation: number;
  acousticWeaponProfile: string;
}

interface HumanBody3DViewProps {
  cmiScore?: number;
  threatLevel?: string;
  timelineFrames?: TimelineFrame[];
  currentFrameIndex?: number;
  onSelectFrame?: (index: number) => void;
  somaticData?: SomaticBiochemicalImpact | null;
  acousticData?: InfrasoundBrainwaveMetrics | null;
}

export default function HumanBody3DView({
  cmiScore = 20,
  threatLevel = 'Minimal',
  timelineFrames = [],
  currentFrameIndex = 0,
  onSelectFrame,
  somaticData,
  acousticData,
}: HumanBody3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const [wireframeMode, setWireframeMode] = useState(false);

  // Active target organ inferred directly from current second frame
  const currentFrame = timelineFrames[currentFrameIndex] || null;
  const activeOrgan = currentFrame?.targetOrgan?.toLowerCase() || 'body';

  // Three.js object references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const humanGroupRef = useRef<THREE.Group | null>(null);

  // Mesh references
  const brainMeshRef = useRef<THREE.Mesh | null>(null);
  const heartMeshRef = useRef<THREE.Mesh | null>(null);
  const gutMeshRef = useRef<THREE.Mesh | null>(null);
  const infrasoundRingsRef = useRef<THREE.Mesh[]>([]);

  const getThreatColor = (score: number) => {
    if (score >= 7) return 0xf85149; // Red (Severe)
    if (score >= 4) return 0xd29922; // Yellow (Moderate)
    return 0x3fb950; // Green (Minimal)
  };

  const somaticRef = useRef(somaticData);
  const acousticRef = useRef(acousticData);

  useEffect(() => {
    somaticRef.current = somaticData;
    acousticRef.current = acousticData;
    if (brainMeshRef.current && somaticData) {
      const col = getThreatColor(somaticData.amygdalaThreat);
      (brainMeshRef.current.material as THREE.MeshPhysicalMaterial).color.set(col);
      (brainMeshRef.current.material as THREE.MeshPhysicalMaterial).emissive.set(col);
    }
    if (heartMeshRef.current && somaticData) {
      const col = getThreatColor(somaticData.cardiovascularStrain);
      (heartMeshRef.current.material as THREE.MeshPhysicalMaterial).color.set(col);
      (heartMeshRef.current.material as THREE.MeshPhysicalMaterial).emissive.set(col);
    }
    if (gutMeshRef.current && somaticData) {
      const col = getThreatColor(somaticData.gutBrainTension);
      (gutMeshRef.current.material as THREE.MeshPhysicalMaterial).color.set(col);
      (gutMeshRef.current.material as THREE.MeshPhysicalMaterial).emissive.set(col);
    }
  }, [somaticData, acousticData]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 560;

    // 1. Software WebGL Guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Pure Black GitHub Deep Canvas
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010409);
    scene.fog = new THREE.FogExp2(0x010409, 0.035);
    sceneRef.current = scene;

    // 3. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);
    cameraRef.current = camera;

    // 4. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 5. Studio Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.HemisphereLight(0x58a6ff, 0x010409, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf0f6fc, 2.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x238636, 1.5);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // Cyan bio-electric back glow
    const bioElectricLight = new THREE.PointLight(0x58a6ff, 2.5, 8);
    bioElectricLight.position.set(0, 1.5, -1);
    scene.add(bioElectricLight);

    // 6. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.8, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.minDistance = 2.5;
    controls.maxDistance = 12;
    controlsRef.current = controls;

    // 7. Master Human & Neural Network Group
    const humanGroup = new THREE.Group();
    scene.add(humanGroup);
    humanGroupRef.current = humanGroup;

    // Floor Matrix Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x30363d, 0x161b22);
    gridHelper.position.y = -1.8;
    humanGroup.add(gridHelper);

    // Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const canvasTex = document.createElement('canvas');
    canvasTex.width = 128;
    canvasTex.height = 128;
    const ctx = canvasTex.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(88, 166, 255, 0.45)');
      grad.addColorStop(0.5, 'rgba(35, 134, 54, 0.15)');
      grad.addColorStop(1, 'rgba(1, 4, 9, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(canvasTex);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.78;
    humanGroup.add(shadowPlane);

    // Translucent Human Glass Silhouette
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x58a6ff,
      metalness: 0.15,
      roughness: 0.1,
      transmission: 0.88,
      thickness: 1.2,
      transparent: true,
      opacity: 0.35,
    });

    // Anatomical Silhouette
    const headGeo = new THREE.SphereGeometry(0.38, 24, 24);
    headGeo.scale(0.9, 1.15, 1.0);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    headMesh.position.set(0, 2.1, 0);

    const neckGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.28, 16);
    const neckMesh = new THREE.Mesh(neckGeo, bodyMat);
    neckMesh.position.set(0, 1.7, 0);

    const torsoGeo = new THREE.CylinderGeometry(0.48, 0.38, 1.1, 24);
    torsoGeo.scale(1.15, 1.0, 0.7);
    const torsoMesh = new THREE.Mesh(torsoGeo, bodyMat);
    torsoMesh.position.set(0, 1.05, 0);

    const pelvisGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.45, 24);
    pelvisGeo.scale(1.05, 1.0, 0.7);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, bodyMat);
    pelvisMesh.position.set(0, 0.35, 0);

    const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 1.2, 16);
    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.7, 1.0, 0);
    leftArm.rotation.z = 0.15;
    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.7, 1.0, 0);
    rightArm.rotation.z = -0.15;

    const legGeo = new THREE.CylinderGeometry(0.16, 0.11, 1.8, 16);
    const leftLeg = new THREE.Mesh(legGeo, bodyMat);
    leftLeg.position.set(-0.25, -0.75, 0);
    const rightLeg = new THREE.Mesh(legGeo, bodyMat);
    rightLeg.position.set(0.25, -0.75, 0);

    humanGroup.add(headMesh, neckMesh, torsoMesh, pelvisMesh, leftArm, rightArm, leftLeg, rightLeg);

    // -------------------------------------------------------------
    // NEURO-ELECTRONIC SYNAPSE WEB & AXONS
    // -------------------------------------------------------------
    const neuralGroup = new THREE.Group();
    humanGroup.add(neuralGroup);

    const spinalPoints: THREE.Vector3[] = [];
    for (let y = 2.15; y >= 0.2; y -= 0.05) {
      spinalPoints.push(new THREE.Vector3(0, y, -0.04));
    }
    const spinalGeo = new THREE.BufferGeometry().setFromPoints(spinalPoints);
    const spinalMat = new THREE.LineBasicMaterial({ color: 0x58a6ff, linewidth: 2 });
    const spinalCord = new THREE.Line(spinalGeo, spinalMat);
    neuralGroup.add(spinalCord);

    const branchSegments: THREE.Vector3[] = [
      new THREE.Vector3(0, 2.12, 0), new THREE.Vector3(-0.25, 2.25, 0.1),
      new THREE.Vector3(0, 2.12, 0), new THREE.Vector3(0.25, 2.25, 0.1),
      new THREE.Vector3(0, 2.12, 0), new THREE.Vector3(-0.2, 2.0, -0.1),
      new THREE.Vector3(0, 2.12, 0), new THREE.Vector3(0.2, 2.0, -0.1),
      new THREE.Vector3(0, 2.12, 0), new THREE.Vector3(0, 2.32, 0.15),
      new THREE.Vector3(0, 1.6, -0.04), new THREE.Vector3(-0.35, 1.45, 0),
      new THREE.Vector3(-0.35, 1.45, 0), new THREE.Vector3(-0.7, 1.0, 0),
      new THREE.Vector3(-0.7, 1.0, 0), new THREE.Vector3(-0.9, 0.5, 0),
      new THREE.Vector3(0, 1.6, -0.04), new THREE.Vector3(0.35, 1.45, 0),
      new THREE.Vector3(0.35, 1.45, 0), new THREE.Vector3(0.7, 1.0, 0),
      new THREE.Vector3(0.7, 1.0, 0), new THREE.Vector3(0.9, 0.5, 0),
      new THREE.Vector3(0, 1.35, -0.04), new THREE.Vector3(-0.1, 1.18, 0.12),
      new THREE.Vector3(-0.1, 1.18, 0.12), new THREE.Vector3(-0.28, 1.1, 0.15),
      new THREE.Vector3(0, 0.85, -0.04), new THREE.Vector3(0, 0.55, 0.08),
      new THREE.Vector3(0, 0.55, 0.08), new THREE.Vector3(-0.22, 0.5, 0.1),
      new THREE.Vector3(0, 0.55, 0.08), new THREE.Vector3(0.22, 0.5, 0.1),
      new THREE.Vector3(0, 0.25, -0.04), new THREE.Vector3(-0.25, 0.05, 0),
      new THREE.Vector3(-0.25, 0.05, 0), new THREE.Vector3(-0.25, -0.75, 0),
      new THREE.Vector3(0, 0.25, -0.04), new THREE.Vector3(0.25, 0.05, 0),
      new THREE.Vector3(0.25, 0.05, 0), new THREE.Vector3(0.25, -0.75, 0),
    ];
    const branchGeo = new THREE.BufferGeometry().setFromPoints(branchSegments);
    const branchMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
    });
    const neuralBranches = new THREE.LineSegments(branchGeo, branchMat);
    neuralGroup.add(neuralBranches);

    // Bio-Electric Neuro-Electron Currents
    const electronCount = 120;
    const electronPositions = new Float32Array(electronCount * 3);
    const electronVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < electronCount; i++) {
      const segIndex = Math.floor(Math.random() * (branchSegments.length / 2)) * 2;
      const startP = branchSegments[segIndex];
      const endP = branchSegments[segIndex + 1] || startP;
      const lerpVal = Math.random();

      electronPositions[i * 3] = THREE.MathUtils.lerp(startP.x, endP.x, lerpVal);
      electronPositions[i * 3 + 1] = THREE.MathUtils.lerp(startP.y, endP.y, lerpVal);
      electronPositions[i * 3 + 2] = THREE.MathUtils.lerp(startP.z, endP.z, lerpVal);

      electronVelocities.push({
        x: (endP.x - startP.x) * 1.5,
        y: (endP.y - startP.y) * 1.5,
        z: (endP.z - startP.z) * 1.5,
      });
    }

    const electronGeo = new THREE.BufferGeometry();
    electronGeo.setAttribute('position', new THREE.BufferAttribute(electronPositions, 3));
    const electronMat = new THREE.PointsMaterial({
      color: 0x58a6ff,
      size: 0.045,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const electronParticles = new THREE.Points(electronGeo, electronMat);
    neuralGroup.add(electronParticles);

    // -------------------------------------------------------------
    // INFRASOUND (7-8 Hz) ORGAN RESONANCE VIBRATION RINGS
    // -------------------------------------------------------------
    const infrasoundGroup = new THREE.Group();
    humanGroup.add(infrasoundGroup);
    const infrasoundRings: THREE.Mesh[] = [];

    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(0.55 + i * 0.28, 0.015, 12, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf85149,
        transparent: true,
        opacity: 0.45 - i * 0.09,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 1.05;
      infrasoundGroup.add(ringMesh);
      infrasoundRings.push(ringMesh);
    }
    infrasoundRingsRef.current = infrasoundRings;

    // -------------------------------------------------------------
    // BIOCHEMICAL ORGANS
    // -------------------------------------------------------------
    const brainGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const brainMat = new THREE.MeshPhysicalMaterial({
      color: getThreatColor(somaticRef.current?.amygdalaThreat || 2),
      emissive: getThreatColor(somaticRef.current?.amygdalaThreat || 2),
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.8,
    });
    const brainMesh = new THREE.Mesh(brainGeo, brainMat);
    brainMesh.position.set(0, 2.12, 0.02);
    humanGroup.add(brainMesh);
    brainMeshRef.current = brainMesh;

    const heartGeo = new THREE.DodecahedronGeometry(0.16, 0);
    const heartMat = new THREE.MeshPhysicalMaterial({
      color: getThreatColor(somaticRef.current?.cardiovascularStrain || 3),
      emissive: getThreatColor(somaticRef.current?.cardiovascularStrain || 3),
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.7,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.set(-0.1, 1.18, 0.12);
    humanGroup.add(heartMesh);
    heartMeshRef.current = heartMesh;

    const gutGeo = new THREE.TorusKnotGeometry(0.18, 0.06, 64, 16, 2, 3);
    const gutMat = new THREE.MeshPhysicalMaterial({
      color: getThreatColor(somaticRef.current?.gutBrainTension || 3),
      emissive: getThreatColor(somaticRef.current?.gutBrainTension || 3),
      emissiveIntensity: 0.6,
      metalness: 0.5,
      roughness: 0.3,
    });
    const gutMesh = new THREE.Mesh(gutGeo, gutMat);
    gutMesh.position.set(0, 0.55, 0.08);
    humanGroup.add(gutMesh);
    gutMeshRef.current = gutMesh;

    // 8. 60fps Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (!isPausedRef.current) {
        humanGroup.rotation.y += delta * 0.2;

        const pos = electronParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < electronCount; i++) {
          pos[i * 3] += electronVelocities[i].x * delta;
          pos[i * 3 + 1] += electronVelocities[i].y * delta;
          pos[i * 3 + 2] += electronVelocities[i].z * delta;

          if (pos[i * 3 + 1] < -1.6 || pos[i * 3 + 1] > 2.3) {
            const segIndex = Math.floor(Math.random() * (branchSegments.length / 2)) * 2;
            const startP = branchSegments[segIndex];
            pos[i * 3] = startP.x;
            pos[i * 3 + 1] = startP.y;
            pos[i * 3 + 2] = startP.z;
          }
        }
        electronParticles.geometry.attributes.position.needsUpdate = true;

        const infraIntensity = (acousticRef.current?.infrasoundSeverity || 4) * 0.15;
        infrasoundRingsRef.current.forEach((ring, idx) => {
          const waveScale = 1.0 + Math.sin(time * 7.5 + idx * 0.8) * (0.08 + infraIntensity * 0.05);
          ring.scale.set(waveScale, waveScale, waveScale);
        });

        if (heartMeshRef.current) {
          const heartRate = 1.8 + ((somaticRef.current?.cardiovascularStrain || 3) * 0.4);
          const heartScale = 1.0 + Math.sin(time * heartRate * Math.PI) * 0.12;
          heartMeshRef.current.scale.set(heartScale, heartScale, heartScale);
        }

        if (brainMeshRef.current) {
          brainMeshRef.current.rotation.y += delta * 0.5;
          const threatPulse = 1.0 + Math.sin(time * 3.5) * 0.06;
          brainMeshRef.current.scale.set(threatPulse, threatPulse, threatPulse);
        }

        if (gutMeshRef.current) {
          gutMeshRef.current.rotation.z += delta * 0.35;
          gutMeshRef.current.rotation.x += delta * 0.2;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // AUTOMATED CAMERA FOCUS BASED ON CURRENT FRAME ORGAN (No manual picking required!)
  useEffect(() => {
    if (!controlsRef.current || !cameraRef.current) return;

    if (activeOrgan.includes('brain') || activeOrgan.includes('head') || activeOrgan.includes('pfc')) {
      controlsRef.current.target.set(0, 2.1, 0);
      cameraRef.current.position.set(0, 2.2, 2.4);
    } else if (activeOrgan.includes('heart') || activeOrgan.includes('cardio') || activeOrgan.includes('pulse')) {
      controlsRef.current.target.set(0, 1.2, 0);
      cameraRef.current.position.set(0, 1.2, 2.5);
    } else if (activeOrgan.includes('gut') || activeOrgan.includes('visceral') || activeOrgan.includes('nausea')) {
      controlsRef.current.target.set(0, 0.6, 0);
      cameraRef.current.position.set(0, 0.6, 2.5);
    } else if (activeOrgan.includes('infrasound') || activeOrgan.includes('acoustic') || activeOrgan.includes('sound')) {
      controlsRef.current.target.set(0, 1.05, 0);
      cameraRef.current.position.set(0, 1.3, 3.0);
    } else {
      controlsRef.current.target.set(0, 0.8, 0);
      cameraRef.current.position.set(0, 1.2, 5.2);
    }
  }, [activeOrgan]);

  const toggleWireframe = () => {
    const next = !wireframeMode;
    setWireframeMode(next);
    if (sceneRef.current) {
      sceneRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => (m.wireframe = next));
          } else {
            child.material.wireframe = next;
          }
        }
      });
    }
  };

  return (
    <div className="relative w-full h-[560px] rounded-xl overflow-hidden border border-[#30363d] bg-[#010409]">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Frame Status Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#58a6ff] font-bold">
            {currentFrame ? currentFrame.timestamp : '00:00s'}
          </span>
          <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${currentFrame && currentFrame.severity >= 7 ? 'bg-[#f85149]/20 text-[#f85149] border-[#f85149]/40' : currentFrame && currentFrame.severity >= 4 ? 'bg-[#d29922]/20 text-[#d29922] border-[#d29922]/40' : 'bg-[#3fb950]/20 text-[#3fb950] border-[#3fb950]/40'}`}>
            {currentFrame ? `TARGET: ${currentFrame.targetOrgan.toUpperCase()}` : `CMI ${cmiScore}/100`}
          </span>
        </div>

        {currentFrame && (
          <div className="bg-[#0d1117]/90 border border-[#30363d] p-2.5 rounded-lg max-w-sm text-xs font-mono backdrop-blur-sm">
            <div className="text-[#f85149] font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> {currentFrame.detectedMechanism}
            </div>
            <div className="text-[#8b949e] text-[11px] mt-1">
              Impact: <strong className="text-[#c9d1d9]">{currentFrame.biochemicalSomaticImpact}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Frame Scrubber Timeline (Bottom Dock) */}
      {timelineFrames.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-2xl flex flex-col gap-2 p-2.5 rounded-xl bg-[#0d1117]/95 border border-[#30363d] shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono px-1">
            <span className="text-[#8b949e] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#58a6ff]" /> Second-by-Second Frame Timeline
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1 rounded text-[#8b949e] hover:text-white transition-colors cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-[#3fb950]" /> : <Pause className="w-3.5 h-3.5 text-[#e3b341]" />}
              </button>
              <button
                onClick={toggleWireframe}
                className={`p-1 rounded transition-colors cursor-pointer ${wireframeMode ? 'text-[#58a6ff]' : 'text-[#8b949e] hover:text-white'}`}
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Timeline Nodes */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1">
            {timelineFrames.map((frame, idx) => (
              <button
                key={idx}
                onClick={() => onSelectFrame && onSelectFrame(idx)}
                className={`px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  idx === currentFrameIndex
                    ? 'bg-[#1f6feb] text-white font-bold shadow-md'
                    : 'bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9] border border-[#30363d]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${frame.severity >= 7 ? 'bg-[#f85149]' : frame.severity >= 4 ? 'bg-[#d29922]' : 'bg-[#3fb950]'}`} />
                <span>{frame.timestamp}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
