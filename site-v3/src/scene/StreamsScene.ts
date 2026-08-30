import * as THREE from "three";

import { BEATS, DEFAULT_BEAT, isBeatName, mixBeats, type BeatConfig } from "./beats";
import { pickBudget, shouldRunScene, type SceneBudget } from "./capabilities";
import { buildSlotAtlas, SLOT_LABELS } from "./slotAtlas";

/**
 * A cena da v3: dois lados de uma agenda que se encontram.
 *
 * Cada elemento é um **bloco de horário** com o rótulo desenhado nele. Os que
 * vêm da esquerda são a disponibilidade que o profissional publicou; os da
 * direita, os horários que o cliente procura. Conforme o scroll avança pelos
 * momentos, as duas colunas se aproximam, se alinham numa grade de agenda e
 * encaixam par a par — e o bloco encaixado vira **verde**, o mesmo verde que o
 * app usa no status "Confirmado".
 *
 * Decisões que valem registrar:
 *
 * - **Uma cena para o site inteiro**, montada acima do roteador (ADR 0002):
 *   trocar de rota reconfigura os blocos, não remonta a cena. Remontar
 *   recriaria buffers e recompilaria shaders a cada clique.
 * - **Um `InstancedMesh`**, não um objeto por bloco: a posição, a cor e o
 *   rótulo saem do vertex shader a partir de atributos fixos por instância, de
 *   modo que a CPU só escreve uniforms por frame.
 * - **As cores vêm dos tokens CSS** (`--primary`, `--success`, `--border`), não
 *   escritas no shader: se a marca mudar no app, a cena acompanha (ADR 0004).
 * - **O vermelho é acento, não campo.** Bloco livre é neutro; o vermelho marca
 *   o instante do encaixe e o verde marca o que ficou confirmado — exatamente
 *   a semântica de status do app.
 */
export class StreamsScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.OrthographicCamera;
  private readonly budget: SceneBudget;
  private readonly mesh: THREE.InstancedMesh;
  private readonly texture: THREE.CanvasTexture;
  private readonly uniforms: {
    uTime: { value: number };
    uSeparation: { value: number };
    uGrid: { value: number };
    uConfirmed: { value: number };
    uFan: { value: number };
    uEnergy: { value: number };
    uOpacity: { value: number };
    uAspect: { value: number };
    uRows: { value: number };
    uNeutral: { value: THREE.Color };
    uPrimary: { value: THREE.Color };
    uSuccess: { value: THREE.Color };
    uSurface: { value: THREE.Color };
    uAtlas: { value: THREE.Texture };
  };

  private frame = 0;
  private lastTime = 0;
  /** Tempo simulado: só avança quando a cena roda, para o movimento não pular
   *  depois de a aba ficar oculta. */
  private clock = 0;
  private current: BeatConfig = BEATS[DEFAULT_BEAT];
  private target: BeatConfig = BEATS[DEFAULT_BEAT];
  private running = false;
  private disposed = false;
  /** Momento do último quadro efetivamente desenhado. */
  private lastDraw = 0;

  /**
   * A cena é pano de fundo e se move devagar: a 30 quadros por segundo ela é
   * indistinguível de 60 e custa metade da GPU. Num site que a maioria abre
   * pelo celular, isso é bateria — não é micro-otimização.
   *
   * Pausar de vez não serve aqui: os blocos derivam continuamente, então
   * "assentada" nunca acontece de verdade e a cena congelaria no meio do
   * movimento. O que dá para cortar é a taxa, não o loop.
   */
  private static readonly FRAME_INTERVAL_MS = 1000 / 30;

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
    const token = (name: string, fallback: string) =>
      new THREE.Color(styles.getPropertyValue(name).trim() || fallback);

    const atlas = buildSlotAtlas(styles.getPropertyValue("--foreground").trim() || "#1c1515");
    this.texture = new THREE.CanvasTexture(atlas.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;

    this.uniforms = {
      uTime: { value: 0 },
      uSeparation: { value: this.current.separation },
      uGrid: { value: this.current.grid },
      uConfirmed: { value: this.current.confirmed },
      uFan: { value: this.current.fan },
      uEnergy: { value: this.current.energy },
      uOpacity: { value: this.current.opacity },
      uAspect: { value: 1 },
      uRows: { value: SLOT_LABELS.length },
      uNeutral: { value: token("--border", "#e6e3e1") },
      uPrimary: { value: token("--primary", "#e8153f") },
      uSuccess: { value: token("--success", "#1e7c50") },
      uSurface: { value: token("--card", "#ffffff") },
      uAtlas: { value: this.texture },
    };

    this.mesh = this.buildSlots();
    this.scene.add(this.mesh);

    this.resize();
  }

  /** Um plano por bloco de horário, instanciado. */
  private buildSlots(): THREE.InstancedMesh {
    // Uma agenda de verdade tem uma dezena de faixas, não centenas: com muitos
    // blocos a coluna vira uma torre sobreposta e ilegível — foi o que a
    // primeira versão fez. O número é fixo pela narrativa, não pelo orçamento
    // do aparelho (esse controla o pixelRatio, que é o que de fato pesa).
    const pairs = 7;
    const count = pairs * 2;

    // Proporção de um bloco de agenda: largo e baixo, como o card de horário.
    const geometry = new THREE.PlaneGeometry(0.46, 0.125);

    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i += 1) {
      const side = i % 2 === 0 ? -1 : 1; // -1 = quem atende, +1 = quem marca
      const pair = Math.floor(i / 2);
      seeds[i * 4 + 0] = side;
      seeds[i * 4 + 1] = pair / Math.max(pairs - 1, 1); // posição na coluna
      seeds[i * 4 + 2] = Math.random() * Math.PI * 2; // fase própria
      // O rótulo vem do PAR, não da instância: os dois lados de um encaixe
      // mostram o mesmo horário, porque é disso que o encaixe se trata — quem
      // atende publicou 09:00 e quem marca escolheu 09:00. Sorteá-lo por
      // instância produzia pares como "08:00 | 16:30", que negam a narrativa.
      seeds[i * 4 + 3] = pair % SLOT_LABELS.length;
    }
    geometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute vec4 aSeed;

        uniform float uTime;
        uniform float uSeparation;
        uniform float uGrid;
        uniform float uConfirmed;
        uniform float uFan;
        uniform float uEnergy;
        uniform float uAspect;
        uniform float uRows;

        varying vec2 vUv;
        varying float vRow;
        varying float vMeeting;   // 0..1 — quanto este bloco está no encaixe
        varying float vConfirmed; // 0..1 — este bloco virou atendimento

        void main() {
          float side = aSeed.x;
          float lane = aSeed.y;
          float phase = aSeed.z;
          vRow = aSeed.w;

          // --- posição solta: o bloco deriva no seu próprio ritmo, longe do
          // centro, onde vive o texto ---
          float drift = fract(lane + uTime * (0.02 + uEnergy * 0.03));
          float looseY = (drift * 2.0 - 1.0) * 0.8
                       + sin(uTime * 0.7 + phase) * 0.04 * uEnergy;
          // O palco é a área ao redor da moldura: solto, o bloco fica na borda
          // dele; encaixado, encosta na lateral do aparelho. Entrar mais que
          // isso o esconde atrás do celular, que é opaco.
          float looseX = side * (0.95 + sin(phase) * 0.08);

          // --- posição em grade: linhas de agenda espaçadas ---
          // O espaçamento vem do numero de faixas, para as linhas nunca se
          // sobreporem: com blocos de 0.088 de altura, 9 linhas em 1.5 sobram.
          float gridY = (lane - 0.5) * 1.55;

          // No encontro os dois lados encostam a moldura, um de cada lado: o
          // par se forma ladeando o aparelho, e não dentro dele.
          // O palco é um vão vazio: o encaixe acontece no meio dele, com os
          // dois blocos do par ENCOSTADOS, não sobrepostos — por isso o
          // deslocamento é exatamente meia largura de bloco.
          float gridX = side * 0.24;

          // No leque final a agenda se abre: os blocos voltam para a borda.
          gridX = mix(gridX, side * 0.6, uFan);

          float x = mix(looseX, gridX, uGrid) * mix(1.0, uSeparation, uGrid * 0.35)
                  + side * (1.0 - uSeparation) * 0.35 * (1.0 - uGrid);
          float y = mix(looseY, gridY, uGrid);

          // Respiração: um deslocamento pequeno que existe SEMPRE, inclusive
          // com a grade formada. Sem isto a cena congela assim que assenta —
          // a oscilação vivia só no estado solto, que a grade descarta, e o
          // resultado parecia travado justamente no momento mais importante.
          // A amplitude é menor que o vão entre as linhas, então o alinhamento
          // continua legível.
          y += sin(uTime * 0.9 + phase) * 0.010 * (0.35 + uEnergy * 0.65);
          x += cos(uTime * 0.62 + phase * 1.3) * 0.006 * (0.35 + uEnergy * 0.65);

          // Conforme a grade se forma, o conjunto migra para o foco — a
          // moldura do celular da seção. Solto (uGrid = 0) ele fica nas
          // bordas, longe da coluna de texto.
          // Encolhe junto: sobre a moldura os blocos são um detalhe, não um
          // segundo elemento disputando a atenção.
          float focusScale = mix(1.0, 0.55, uGrid);

          // Encaixe: mede o quanto as duas colunas já se fecharam.
          vMeeting = 1.0 - clamp(uSeparation * 2.2, 0.0, 1.0);
          // Confirmar não é tudo de uma vez: os pares fecham em ordem, de cima
          // para baixo, e isso é o que dá leitura de "acontecendo" ao momento.
          vConfirmed = step(lane, uConfirmed) * vMeeting;

          // O bloco confirmado cresce de leve: o par virou uma coisa só.
          float pulse = 1.0 + vConfirmed * 0.035 * sin(uTime * 1.6 + lane * 6.28);
          float scale = (1.0 + vConfirmed * 0.12) * focusScale * pulse;

          vec3 local = position * scale;
          local.x /= uAspect;

          vUv = uv;
          gl_Position = projectionMatrix * vec4(local + vec3(x / uAspect, y, 0.0), 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;

        uniform sampler2D uAtlas;
        uniform float uRows;
        uniform float uOpacity;
        uniform vec3 uNeutral;
        uniform vec3 uPrimary;
        uniform vec3 uSuccess;
        uniform vec3 uSurface;

        varying vec2 vUv;
        varying float vRow;
        varying float vMeeting;
        varying float vConfirmed;

        // Retângulo de cantos arredondados: o mesmo raio que o resto da página
        // usa. Quadrado de canto vivo denunciaria o WebGL colado por cima.
        // Atencao: "half" e palavra reservada em GLSL ES. Nomear o parametro
        // assim faz o shader nao compilar, e a cena some sem erro na pagina.
        float roundedBox(vec2 uv, vec2 halfSize, float radius) {
          vec2 p = abs(uv) - halfSize + radius;
          return length(max(p, 0.0)) - radius;
        }

        void main() {
          vec2 centered = vUv - 0.5;
          float dist = roundedBox(centered, vec2(0.5), 0.16);
          if (dist > 0.0) discard;

          // A borda acompanha o estado: neutra quando livre, vermelha no
          // instante do encaixe, verde quando o atendimento está confirmado.
          vec3 edge = mix(uNeutral, uPrimary, vMeeting);
          edge = mix(edge, uSuccess, vConfirmed);

          // O fundo da pagina e quase branco (#fdfbf9): bloco preenchido com
          // o branco puro do card fica literalmente invisivel. Por isso o
          // interior recebe um tingimento do proprio estado, e a borda e larga
          // o suficiente para ler como contorno de um slot de agenda.
          float border = smoothstep(-0.09, -0.03, dist);
          vec3 fill = mix(uSurface, edge, 0.12 + 0.30 * max(vMeeting, vConfirmed));
          vec3 color = mix(fill, edge, border);

          // O rótulo do horário: uma linha do atlas, escolhida pelo índice.
          vec2 labelUv = vec2(vUv.x, (vRow + vUv.y) / uRows);
          float label = texture2D(uAtlas, labelUv).a;
          color = mix(color, edge, label * 0.9);

          // Bloco livre é discreto; confirmado tem presença.
          float alpha = uOpacity * mix(0.7, 1.0, max(vMeeting, vConfirmed));
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    // A posição vem toda do shader; sem isto o three recalcularia matrizes por
    // instância a cada frame, do nada.
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    mesh.frustumCulled = false;
    return mesh;
  }

  /** Recebe o momento em que o scroll está, e para onde caminha. */
  setBeat(beat: string, progress = 0, next?: string): void {
    const from = isBeatName(beat) ? BEATS[beat] : BEATS[DEFAULT_BEAT];
    const to = next && isBeatName(next) ? BEATS[next] : from;
    this.target = mixBeats(from, to, Math.min(Math.max(progress, 0), 1));

    if (this.running && !this.frame) this.frame = requestAnimationFrame(this.tick);
  }

  resize(): void {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.uniforms.uAspect.value = Math.max(width / Math.max(height, 1), 0.0001);

    if (this.running && !this.frame) this.frame = requestAnimationFrame(this.tick);
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.lastTime = performance.now();
    this.lastDraw = 0;
    if (!this.frame) this.frame = requestAnimationFrame(this.tick);
  }

  /** Pausa de verdade: sem frame agendado a GPU não é tocada. */
  stop(): void {
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    this.frame = requestAnimationFrame(this.tick);

    // Descarta o quadro se ainda não passou o intervalo alvo. O rAF continua
    // sincronizado com o monitor; o que muda é quantas vezes desenhamos.
    if (now - this.lastDraw < StreamsScene.FRAME_INTERVAL_MS) return;
    this.lastDraw = now;

    // Delta limitado: voltar de uma aba oculta entregaria um salto de vários
    // segundos e a cena daria um pulo visível.
    const delta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.clock += delta;

    // Aproximação exponencial do alvo: a transição entre momentos acompanha o
    // scroll sem travar nele, e o movimento nunca é brusco.
    const ease = 1 - Math.pow(0.0015, delta);
    const c = this.current;
    const t = this.target;
    this.current = {
      separation: c.separation + (t.separation - c.separation) * ease,
      grid: c.grid + (t.grid - c.grid) * ease,
      confirmed: c.confirmed + (t.confirmed - c.confirmed) * ease,
      fan: c.fan + (t.fan - c.fan) * ease,
      energy: c.energy + (t.energy - c.energy) * ease,
      opacity: c.opacity + (t.opacity - c.opacity) * ease,
    };

    this.uniforms.uTime.value = this.clock;
    this.uniforms.uSeparation.value = this.current.separation;
    this.uniforms.uGrid.value = this.current.grid;
    this.uniforms.uConfirmed.value = this.current.confirmed;
    this.uniforms.uFan.value = this.current.fan;
    this.uniforms.uEnergy.value = this.current.energy;
    this.uniforms.uOpacity.value = this.current.opacity;

    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    this.stop();
    this.disposed = true;
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.texture.dispose();
    this.scene.remove(this.mesh);
    this.renderer.dispose();
  }
}

export { shouldRunScene };
export type { BeatName } from "./beats";
