import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface EdenexaCore3DProps {
  className?: string;
  height?: string;
}

export const EdenexaCore3D: React.FC<EdenexaCore3DProps> = ({
  className = '',
  height = 'h-[420px] sm:h-[500px] lg:h-[580px]',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software rendering fallback
    let isSoftwareGl = false;
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setIsSupported(false);
        return;
      }
      if (gl instanceof WebGLRenderingContext) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const rendererStr = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
          if (rendererStr.includes('swiftshader') || rendererStr.includes('llvmpipe') || rendererStr.includes('software')) {
            isSoftwareGl = true;
          }
        }
      }
    } catch {
      setIsSupported(false);
      return;
    }

    const scene = new THREE.Scene();

    const getDimensions = () => {
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 500;
      return { w, h };
    };

    const { w: initW, h: initH } = getDimensions();
    const camera = new THREE.PerspectiveCamera(45, initW / initH, 0.1, 1000);
    camera.position.set(0, 0, 14.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(initW, initH);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Multi-Point Cinematic Lighting Rig: Clean White Ambient + Golden Yellow Key + Deep Plum Rim
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xeaaa00, 3.4);
    keyLight.position.set(8, 10, 10);
    scene.add(keyLight);

    const plumRim = new THREE.DirectionalLight(0x3a0f34, 3.8);
    plumRim.position.set(-8, -6, 8);
    scene.add(plumRim);

    const warmFill = new THREE.PointLight(0xfff8e6, 2.4, 50);
    warmFill.position.set(0, 8, -6);
    scene.add(warmFill);

    // Master Hierarchy Group
    const coreMasterGroup = new THREE.Group();
    scene.add(coreMasterGroup);

    // 1. Outer Deep Plum Metallic Translucent Crystalline Faceted Shell (#3A0F34)
    const outerGeo = new THREE.IcosahedronGeometry(2.7, 1);
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0x3a0f34,
      metalness: 0.85,
      roughness: 0.15,
      transmission: 0.35,
      transparent: true,
      opacity: 0.92,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      flatShading: true,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    coreMasterGroup.add(outerMesh);

    // Fine wireframe cage for futuristic presence in Golden Yellow (#EAAA00)
    const wireGeo = new THREE.IcosahedronGeometry(2.9, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xeaaa00,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreMasterGroup.add(wireMesh);

    // 2. Inner Pulsing Golden Yellow Quantum Energy Core (#EAAA00)
    const innerGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x3a0f34,
      emissive: 0xeaaa00,
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.85,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreMasterGroup.add(innerMesh);

    // 3. Polished Gyroscopic Rings (Deep Plum Titanium & Golden Yellow)
    const ring1Geo = new THREE.TorusGeometry(3.9, 0.07, 24, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x3a0f34,
      metalness: 0.95,
      roughness: 0.12,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    coreMasterGroup.add(ring1Mesh);

    const ring2Geo = new THREE.TorusGeometry(4.4, 0.05, 24, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xeaaa00,
      emissive: 0xd69800,
      emissiveIntensity: 0.9,
      metalness: 0.9,
      roughness: 0.15,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.y = Math.PI / 4;
    coreMasterGroup.add(ring2Mesh);

    // 4. Satellite Quantum Data Nodes (Golden Yellow Accents)
    const satellitesGroup = new THREE.Group();
    coreMasterGroup.add(satellitesGroup);

    const satelliteCount = 6;
    const satellites: THREE.Mesh[] = [];
    const satGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0xeaaa00,
      emissive: 0xeaaa00,
      emissiveIntensity: 2.0,
      metalness: 0.8,
    });

    for (let i = 0; i < satelliteCount; i++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      satellitesGroup.add(sat);
      satellites.push(sat);
    }

    // 5. Ambient Golden Particle Dust
    const particleCount = isSoftwareGl ? 80 : 180;
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      particlePos[i] = (Math.random() - 0.5) * 20;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xeaaa00,
      size: 0.1,
      transparent: true,
      opacity: 0.5,
      blending: THREE.NormalBlending,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    scene.add(particleCloud);

    // Mouse & Scroll Parallax State
    let mouseTargetX = 0;
    let mouseTargetY = 0;
    let mouseCurrentX = 0;
    let mouseCurrentY = 0;
    let scrollYOffset = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseTargetX = (e.clientX / window.innerWidth - 0.5) * 1.8;
      mouseTargetY = (e.clientY / window.innerHeight - 0.5) * 1.8;
    };

    const handleScroll = () => {
      scrollYOffset = window.scrollY * 0.002;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Interactive Drag with Physics Momentum
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      prevMouseX = clientX;
      prevMouseY = clientY;
      velocityX = 0;
      velocityY = 0;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;
      prevMouseX = clientX;
      prevMouseY = clientY;

      velocityX = deltaX * 0.007;
      velocityY = deltaY * 0.007;

      coreMasterGroup.rotation.y += velocityX;
      coreMasterGroup.rotation.x += velocityY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const canvasEl = renderer.domElement;

    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const handleWindowMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => onPointerUp();

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => onPointerUp();

    canvasEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const { w, h } = getDimensions();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse easing
      mouseCurrentX += (mouseTargetX - mouseCurrentX) * 0.05;
      mouseCurrentY += (mouseTargetY - mouseCurrentY) * 0.05;

      // Subtle floating kinematic breathing
      coreMasterGroup.position.y = Math.sin(elapsed * 1.2) * 0.22;

      // Rotate individual components
      outerMesh.rotation.y = elapsed * 0.25;
      outerMesh.rotation.x = elapsed * 0.15;

      wireMesh.rotation.y = -elapsed * 0.18;
      wireMesh.rotation.z = elapsed * 0.12;

      innerMesh.rotation.y = -elapsed * 0.4;
      // Pulse emission
      innerMat.emissiveIntensity = 1.2 + Math.sin(elapsed * 2.5) * 0.4;

      ring1Mesh.rotation.z = elapsed * 0.35 + scrollYOffset;
      ring2Mesh.rotation.x = -elapsed * 0.28 + scrollYOffset * 0.8;

      // Orbit satellites
      satellites.forEach((sat, i) => {
        const angle = elapsed * 0.8 + (i * Math.PI * 2) / satelliteCount;
        const radius = 3.6 + (i % 2) * 0.6;
        const heightOffset = Math.sin(elapsed * 1.5 + i) * 1.2;
        sat.position.set(Math.cos(angle) * radius, heightOffset, Math.sin(angle) * radius);
      });

      // Inertia drag damping and auto-rotation
      if (!isDragging) {
        velocityX *= 0.94;
        velocityY *= 0.94;
        coreMasterGroup.rotation.y += velocityX;
        coreMasterGroup.rotation.x += velocityY;

        // Base idle rotation + mouse responsiveness
        coreMasterGroup.rotation.y += 0.005;
        coreMasterGroup.rotation.x = mouseCurrentY * 0.4;
        coreMasterGroup.rotation.z = -mouseCurrentX * 0.3;
      }

      particleCloud.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      if (canvasEl) {
        canvasEl.removeEventListener('mousedown', handleMouseDown);
        canvasEl.removeEventListener('touchstart', handleTouchStart);
      }

      // Dispose Three.js Resources
      outerGeo.dispose();
      outerMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      satGeo.dispose();
      satMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!isSupported) {
    // Graceful CSS 3D fallback if browser lacks WebGL
    return (
      <div className={`relative flex items-center justify-center ${height} ${className}`}>
        <div className="relative w-64 h-64 rounded-full bg-gradient-to-tr from-[#EAAA00]/20 via-[#F4F6F8] to-[#FFFFFF] border border-[#EAAA00]/40 animate-pulse flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border border-[#3A0F34]/20 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center select-none ${height} ${className}`}>
      {/* Golden Yellow & Deep Plum Atmosphere Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,170,0,0.12)_0%,rgba(58,15,52,0.06)_45%,transparent_70%)] blur-2xl pointer-events-none" />

      {/* Interactive 3D Canvas */}
      <div
        ref={mountRef}
        data-cursor="DRAG 3D"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />

      {/* Floating 3D Interaction Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#DDE3E8] text-[10px] sm:text-xs font-mono text-[#3A0F34] flex items-center gap-2 pointer-events-none shadow-md shadow-[#3A0F34]/5">
        <span className="w-2 h-2 rounded-full bg-[#EAAA00] animate-ping" />
        <span className="font-semibold">Interactive 3D Core · Drag to Rotate</span>
      </div>
    </div>
  );
};
