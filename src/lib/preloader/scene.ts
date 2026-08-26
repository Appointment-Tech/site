import type * as THREE_NS from "three";

import type { PreloaderTheme } from "./theme";

/**
 * The WebGL half of the loading screen: a progress arc drawn around the logo,
 * a soft halo and a slow particle field, all in the brand red.
 *
 * three is injected instead of imported so this module stays out of the tiny
 * boot bundle — the counter must be on screen long before ~170 kB of engine
 * finishes downloading. If WebGL is missing or the context dies, the caller
 * keeps the CSS bar and nobody sees an error.
 */

type ThreeNamespace = typeof THREE_NS;

const ARC_SEGMENTS = 256;
const PARTICLE_COUNT = 900;
const MAX_PIXEL_RATIO = 2;

export type PreloaderScene = {
  /** Latest progress, 0..1. */
  setProgress(value: number): void;
  /** Draw one frame. `deltaMs` is the time since the previous call. */
  render(deltaMs: number): void;
  dispose(): void;
};

export function createPreloaderScene(
  THREE: ThreeNamespace,
  canvas: HTMLCanvasElement,
  theme: PreloaderTheme,
): PreloaderScene | null {
  let renderer: THREE_NS.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  renderer.setClearAlpha(0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1000, 1000);

  const foreground = new THREE.Color(theme.foreground);
  const accent = new THREE.Color(theme.accent);

  const sprite = radialSprite(THREE);

  // --- halo behind the logo -------------------------------------------------
  const haloMaterial = new THREE.SpriteMaterial({
    map: sprite,
    color: accent,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Sprite(haloMaterial);
  halo.position.z = -10;
  scene.add(halo);

  // --- particle field ------------------------------------------------------
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const drift = new Float32Array(PARTICLE_COUNT);

  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  const colorAttribute = new THREE.BufferAttribute(colors, 3);
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", positionAttribute);
  particleGeometry.setAttribute("color", colorAttribute);

  const particleMaterial = new THREE.PointsMaterial({
    map: sprite,
    size: 3,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.position.z = -5;
  scene.add(particles);

  // --- progress ring -------------------------------------------------------
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  const trackMaterial = new THREE.MeshBasicMaterial({
    color: foreground,
    transparent: true,
    opacity: 0.16,
  });
  const track = new THREE.Mesh(new THREE.RingGeometry(1, 1.1, 180), trackMaterial);
  ringGroup.add(track);

  const arcMaterial = new THREE.MeshBasicMaterial({
    color: foreground,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });
  const arc = new THREE.Mesh(new THREE.RingGeometry(1, 1.1, ARC_SEGMENTS), arcMaterial);
  // RingGeometry starts at 3 o'clock and runs counter-clockwise; mirroring on x
  // and turning a quarter turn makes it start at the top and fill clockwise.
  arc.scale.x = -1;
  arc.rotation.z = -Math.PI / 2;
  arc.position.z = 1;
  ringGroup.add(arc);

  const headMaterial = new THREE.SpriteMaterial({
    map: sprite,
    color: accent,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const head = new THREE.Sprite(headMaterial);
  head.position.z = 2;
  ringGroup.add(head);

  let radius = 140;
  let width = 0;
  let height = 0;
  let progress = 0;
  let shown = 0;
  let elapsed = 0;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function onPointerMove(event: PointerEvent): void {
    pointer.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.targetY = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  function seedParticles(): void {
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * width * 1.1;
      positions[i * 3 + 1] = (Math.random() - 0.5) * height * 1.1;
      positions[i * 3 + 2] = -Math.random() * 40;

      const tint = foreground.clone().lerp(accent, Math.random());
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;

      drift[i] = 4 + Math.random() * 16;
    }
    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
  }

  function resize(): void {
    const nextWidth = Math.max(1, window.innerWidth);
    const nextHeight = Math.max(1, window.innerHeight);
    if (nextWidth === width && nextHeight === height) return;

    width = nextWidth;
    height = nextHeight;

    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();

    radius = clamp(Math.min(width, height) * 0.26, 104, 210);
    ringGroup.scale.setScalar(radius);
    track.geometry.dispose();
    track.geometry = new THREE.RingGeometry(1 - 1.2 / radius, 1 + 1.2 / radius, 180);
    arc.geometry.dispose();
    arc.geometry = new THREE.RingGeometry(1 - 2 / radius, 1 + 2 / radius, ARC_SEGMENTS);
    applyProgressToArc();

    halo.scale.setScalar(radius * 3.4);
    head.scale.setScalar(Math.max(14, radius * 0.11) / radius);

    seedParticles();
    canvas.parentElement?.style.setProperty("--appt-pl-r", `${Math.round(radius)}px`);
  }

  function applyProgressToArc(): void {
    const segments = Math.max(0, Math.min(ARC_SEGMENTS, Math.round(shown * ARC_SEGMENTS)));
    arc.geometry.setDrawRange(0, segments * 6);
    arc.visible = segments > 0;

    const angle = Math.PI / 2 - shown * Math.PI * 2;
    head.position.x = Math.cos(angle);
    head.position.y = Math.sin(angle);
    head.visible = shown > 0.004 && shown < 0.999;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);
  if (!reducedMotion) window.addEventListener("pointermove", onPointerMove, { passive: true });
  resize();

  return {
    setProgress(value: number): void {
      progress = clamp(value, 0, 1);
    },

    render(deltaMs: number): void {
      const delta = Math.min(deltaMs, 64) / 1000;
      elapsed += delta;
      resize();

      // The arc trails the counter slightly, which reads as momentum rather
      // than as the number and the ring disagreeing.
      shown += (progress - shown) * Math.min(1, delta * 6);
      applyProgressToArc();

      if (!reducedMotion) {
        pointer.x += (pointer.targetX - pointer.x) * Math.min(1, delta * 3);
        pointer.y += (pointer.targetY - pointer.y) * Math.min(1, delta * 3);
        ringGroup.position.x = pointer.x * 10;
        ringGroup.position.y = -pointer.y * 10;
        ringGroup.rotation.z = Math.sin(elapsed * 0.2) * 0.03;

        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          const y = positions[i * 3 + 1]! + drift[i]! * delta * (0.6 + progress);
          positions[i * 3 + 1] = y > height / 2 ? -height / 2 : y;
        }
        positionAttribute.needsUpdate = true;
        particles.position.x = pointer.x * -18;
      }

      const pulse = reducedMotion ? 0 : Math.sin(elapsed * 1.6) * 0.02;
      halo.scale.setScalar(radius * (3.4 + pulse + shown * 0.5));
      haloMaterial.opacity = 0.14 + shown * 0.12;
      particleMaterial.opacity = 0.4 + shown * 0.3;

      renderer.render(scene, camera);
    },

    dispose(): void {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("pointermove", onPointerMove);

      track.geometry.dispose();
      arc.geometry.dispose();
      particleGeometry.dispose();
      trackMaterial.dispose();
      arcMaterial.dispose();
      particleMaterial.dispose();
      haloMaterial.dispose();
      headMaterial.dispose();
      sprite.dispose();
      renderer.dispose();
    },
  };
}

/** Soft round dot used by the particles, the halo and the arc head. */
function radialSprite(THREE: ThreeNamespace): THREE_NS.Texture {
  const size = 64;
  const element = document.createElement("canvas");
  element.width = size;
  element.height = size;

  const context = element.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(element);
  texture.needsUpdate = true;
  return texture;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
