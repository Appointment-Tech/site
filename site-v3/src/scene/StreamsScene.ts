import * as THREE from "three";

import { BEATS, DEFAULT_BEAT, isBeatName, mixBeats, type BeatConfig, type BeatName } from "./beats";
import { pickBudget, shouldRunScene, type SceneBudget } from "./capabilities";

/**
 * A cena das duas correntes.
 *
 * Duas nuvens de partículas atravessam a tela em direções opostas — quem atende
 * vindo da esquerda, quem marca vindo da direita — e convergem no centro
 * conforme o scroll avança pelos momentos da narrativa. No momento `colisao`
 * elas se fecham sobre o ponto onde a página mostra a tela real do app.
 *
 * Decisões que valem registrar:
 *
 * - **Uma cena para o site inteiro.** Ela vive acima do roteador e não é
 *   remontada a cada navegação (ADR 0002): trocar de página só reconfigura as
 *   correntes. Remontar custaria recriar buffers e recompilar shaders a cada
 *   clique.
 * - **Dois `Points`, não milhares de meshes.** Cada corrente é um único
 *   `BufferGeometry` com atributos por partícula; a posição é calculada no
 *   vertex shader a partir de uma semente fixa, então a CPU só escreve uniforms
 *   por frame — nada de mexer em atributo em JavaScript.
 * - **O vermelho da marca é acento, não campo.** As partículas usam o
 *   `--primary` só ao colidir; longe do centro elas são quase neutras. Campo
 *   cheio de vermelho é do gradiente do hero, e isso é CSS, não WebGL.
 */
export class StreamsScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.OrthographicCamera;
  private readonly budget: SceneBudget;
  private readonly streams: THREE.Points[] = [];
  private readonly uniforms: {
    uTime: { value: number };
    uSeparation: { value: number };
    uFocus: { value: number };
    uEnergy: { value: number };
    uOpacity: { value: number };
    uAspect: { value: number };
    uPrimary: { value: THREE.Color };
    uNeutral: { value: THREE.Color };
  };

  private frame = 0;
  private lastTime = 0;
  /** Tempo simulado: só avança quando a cena roda, para o movimento não "pular"
   *  depois de a aba ficar oculta. */
  private clock = 0;
  private current: BeatConfig = BEATS[DEFAULT_BEAT];
  private target: BeatConfig = BEATS[DEFAULT_BEAT];
  private running = false;
  private disposed = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.budget = pickBudget();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.budget.maxPixelRatio));

    // Ortográfica: a cena é uma composição em faixa, não um espaço navegável.
    // Perspectiva só acrescentaria distorção nas bordas.
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    this.camera.position.z = 1;

    const styles = getComputedStyle(document.documentElement);
    this.uniforms = {
      uTime: { value: 0 },
      uSeparation: { value: this.current.separation },
      uFocus: { value: this.current.focus },
      uEnergy: { value: this.current.energy },
      uOpacity: { value: this.current.opacity },
      uAspect: { value: 1 },
      // Lidas dos tokens, não escritas à mão: se o app mudar a marca, a cena
      // acompanha sem ninguém lembrar de editar shader (ADR 0004).
      uPrimary: { value: new THREE.Color(styles.getPropertyValue("--primary").trim() || "#e8153f") },
      uNeutral: { value: new THREE.Color(styles.getPropertyValue("--border").trim() || "#e6e3e1") },
    };

    this.streams.push(this.buildStream(-1), this.buildStream(1));
    this.streams.forEach((stream) => this.scene.add(stream));

    this.resize();
  }

  /** `direction` -1 é a corrente de quem atende; +1 a de quem marca. */
  private buildStream(direction: number): THREE.Points {
    const count = this.budget.perStream;
    const seeds = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      // Semente estável por partícula: posição na faixa, deslocamento vertical
      // e fase própria. Tudo o mais é derivado disto no shader.
      seeds[i * 3 + 0] = Math.random();
      seeds[i * 3 + 1] = Math.random() * 2 - 1;
      seeds[i * 3 + 2] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
    // Sem `position` o three não calcula bounding sphere e descarta o objeto no
    // frustum culling — daí o atributo obrigatório, ainda que o shader o ignore.
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);

    const material = new THREE.ShaderMaterial({
      uniforms: { ...this.uniforms, uDirection: { value: direction } },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aSeed;
        uniform float uTime;
        uniform float uSeparation;
        uniform float uFocus;
        uniform float uEnergy;
        uniform float uAspect;
        uniform float uDirection;
        varying float vProximity;

        void main() {
          float lane = aSeed.x;
          float offset = aSeed.y;
          float phase = aSeed.z;

          // A partícula percorre a faixa e reentra pelo outro lado: fluxo
          // contínuo sem precisar reciclar nada na CPU.
          float travel = fract(lane + uTime * (0.03 + uEnergy * 0.05));
          float x = mix(uDirection * 1.35, 0.0, travel) * uSeparation
                  + uDirection * (1.0 - uSeparation) * 0.04;

          // Quanto mais perto do centro, mais a corrente se fecha na linha do
          // encontro — é o que faz a colisão parecer colisão.
          float converge = mix(1.0, 0.12, uFocus * (1.0 - abs(x)));
          float y = offset * 0.55 * converge
                  + sin(uTime * (0.6 + uEnergy) + phase) * 0.03 * uEnergy;

          vProximity = 1.0 - clamp(abs(x) * 1.6, 0.0, 1.0);

          vec4 mvPosition = vec4(x / uAspect, y, 0.0, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = mix(1.5, 3.6, vProximity) * (1.0 + uEnergy * 0.4);
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        uniform vec3 uPrimary;
        uniform vec3 uNeutral;
        uniform float uOpacity;
        varying float vProximity;

        void main() {
          // Ponto redondo: o quadrado padrão do gl_PointCoord entrega "pixel",
          // que briga com o resto da página, toda em raios arredondados.
          vec2 centered = gl_PointCoord - vec2(0.5);
          float dist = length(centered);
          if (dist > 0.5) discard;

          float edge = smoothstep(0.5, 0.15, dist);
          vec3 color = mix(uNeutral, uPrimary, vProximity);
          gl_FragColor = vec4(color, edge * uOpacity * mix(0.35, 1.0, vProximity));
        }
      `,
    });

    return new THREE.Points(geometry, material);
  }

  /** Recebe o momento em que o scroll está, e para onde caminha. */
  setBeat(beat: string, progress = 0, next?: string): void {
    const from = isBeatName(beat) ? BEATS[beat] : BEATS[DEFAULT_BEAT];
    const to = next && isBeatName(next) ? BEATS[next] : from;
    this.target = mixBeats(from, to, Math.min(Math.max(progress, 0), 1));
  }

  resize(): void {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.uniforms.uAspect.value = Math.max(width / Math.max(height, 1), 0.0001);
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  /** Pausa de verdade: sem frame agendado a GPU não é tocada. */
  stop(): void {
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;

    // Delta limitado: voltar de uma aba oculta entregaria um salto de vários
    // segundos e a cena daria um pulo visível.
    const delta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.clock += delta;

    // Aproximação exponencial do alvo: a transição entre momentos acompanha o
    // scroll sem travar nele, e o movimento nunca é brusco.
    const ease = 1 - Math.pow(0.001, delta);
    this.current = {
      separation: this.current.separation + (this.target.separation - this.current.separation) * ease,
      focus: this.current.focus + (this.target.focus - this.current.focus) * ease,
      energy: this.current.energy + (this.target.energy - this.current.energy) * ease,
      opacity: this.current.opacity + (this.target.opacity - this.current.opacity) * ease,
    };

    this.uniforms.uTime.value = this.clock;
    this.uniforms.uSeparation.value = this.current.separation;
    this.uniforms.uFocus.value = this.current.focus;
    this.uniforms.uEnergy.value = this.current.energy;
    this.uniforms.uOpacity.value = this.current.opacity;

    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.tick);
  };

  dispose(): void {
    this.stop();
    this.disposed = true;
    this.streams.forEach((stream) => {
      stream.geometry.dispose();
      (stream.material as THREE.Material).dispose();
      this.scene.remove(stream);
    });
    this.renderer.dispose();
  }
}

export { shouldRunScene };
export type { BeatName };
