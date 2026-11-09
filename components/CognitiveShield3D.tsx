'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Cpu, Volume2, Eye, Brain, Palette, Play, Pause, RotateCw, Layers } from 'lucide-react';

interface CognitiveShield3DProps {
  cmiScore?: number;
  threatLevel?: string;
  activeVector?: string;
  onSelectVector?: (vector: string) => void;
}

export default function CognitiveShield3D({
  cmiScore = 15,
  threatLevel = 'Minimal',
  activeVector = 'all',
  onSelectVector,
}: CognitiveShield3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const [wireframeMode, setWireframeMode] = useState(false);
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<string>(activeVector);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

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
      } catch (e) {
        return false;
      }
    })();

    // 2. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.035);
    sceneRef.current = scene;

    // 3. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 8);
    cameraRef.current = camera;

    // 4. Renderer setup
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

    const ambientLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    fillLight.position.set(-6, -2, -4);
    scene.add(fillLight);

    // 6. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controlsRef.current = controls;

    // 7. Composite 3-12 Part Procedural Model (Cognitive Shield & Core)
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    groupRef.current = masterGroup;

    // Base contact ground shadow
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const canvasTex = document.createElement('canvas');
    canvasTex.width = 128;
    canvasTex.height = 128;
    const ctx = canvasTex.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
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
    shadowPlane.position.y = -2.02;
    masterGroup.add(shadowPlane);

    // Part 1: Central Core Crystal (Icosahedron / Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(1.2, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: cmiScore > 70 ? 0xf43f5e : cmiScore > 40 ? 0xf59e0b : 0x06b6d4,
      metalness: 0.8,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 1.2,
      ior: 2.33,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterGroup.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // Parts 2-6: Outer Rotating Shield Rings (5 Vector Rings)
    const rings: THREE.Mesh[] = [];
    const ringRadii = [1.6, 2.0, 2.4, 2.8, 3.2];
    ringRadii.forEach((radius, i) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.06, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0x38bdf8 : i === 1 ? 0x818cf8 : i === 2 ? 0x34d399 : i === 3 ? 0xfbbf24 : 0xf43f5e,
        metalness: 0.9,
        roughness: 0.2,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.random() * Math.PI;
      ringMesh.rotation.y = Math.random() * Math.PI;
      masterGroup.add(ringMesh);
      rings.push(ringMesh);
    });
    ringsRef.current = rings;

    // Parts 7-12: Orbital Nodes (Vector Emblems)
    const nodeGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const nodesGroup = new THREE.Group();
    masterGroup.add(nodesGroup);

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        roughness: 0.1,
        metalness: 0.9,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(Math.cos(angle) * 2.4, Math.sin(i * 1.5) * 0.8, Math.sin(angle) * 2.4);
      nodesGroup.add(node);
    }

    // Floating Data Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 8. Animation Loop with Software Pacing
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
      if (!isPausedRef.current) {
        masterGroup.rotation.y += delta * 0.3;
        if (coreMeshRef.current) {
          coreMeshRef.current.rotation.x += delta * 0.5;
          coreMeshRef.current.rotation.y += delta * 0.7;
        }
        ringsRef.current.forEach((ring, idx) => {
          ring.rotation.x += delta * (0.2 + idx * 0.1);
          ring.rotation.y += delta * (0.3 - idx * 0.05);
        });
        if (particlesRef.current) {
          particlesRef.current.rotation.y -= delta * 0.1;
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

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
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
  }, [cmiScore]);

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
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl">
      {/* 3D Canvas Mounting Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 text-xs font-mono text-cyan-300 shadow-lg">
        <Cpu className="w-4 h-4 text-cyan-400" />
        <span>3D Neural Shield Matrix • CMI: {cmiScore} ({threatLevel})</span>
      </div>

      {/* Collapsible Cinema / Bottom Control Dock */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl transition-all duration-300 ${hudCollapsed ? 'translate-y-16 opacity-40 hover:opacity-100' : 'translate-y-0 opacity-100'}`}>
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 px-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Vector Hologram Controls
            </span>
            <button
              onClick={() => setHudCollapsed(!hudCollapsed)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {hudCollapsed ? '▴ Expand HUD' : '▾ Collapse HUD'}
            </button>
          </div>

          {!hudCollapsed && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedFocus('acoustic');
                    if (onSelectVector) onSelectVector('acoustic');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    selectedFocus === 'acoustic' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" /> Acoustic
                </button>
                <button
                  onClick={() => {
                    setSelectedFocus('visual');
                    if (onSelectVector) onSelectVector('visual');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    selectedFocus === 'visual' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" /> Semiotic
                </button>
                <button
                  onClick={() => {
                    setSelectedFocus('linguistic');
                    if (onSelectVector) onSelectVector('linguistic');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    selectedFocus === 'linguistic' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800/60 text-slate-800'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" /> Linguistic
                </button>
                <button
                  onClick={() => {
                    setSelectedFocus('kinesic');
                    if (onSelectVector) onSelectVector('kinesic');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    selectedFocus === 'kinesic' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Kinesic
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={toggleWireframe}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
                    wireframeMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" /> Wireframe
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
