import React, {useEffect, useRef, useState} from 'react';

const NAMES = [
  'Ari',
  'Bex',
  'Cal',
  'Dot',
  'Eon',
  'Fox',
  'Gem',
  'Hex',
  'Ivo',
  'Jet',
  'Kit',
  'Lyn',
  'Max',
  'Neo',
  'Oz',
  'Pip',
  'Rae',
  'Sol',
  'Taz',
  'Uma',
];

const COLORS = [
  '#AEF830', // Primary Axom Hub lime
  '#AEF830',
  '#FFFFFF', // White
  '#AEF830',
  '#A6B4AC', // Muted green
  '#7CA38E', // Subtle dark-green variation
];

const MONO =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const ARROW_DIR = Math.atan2(-10, -5);
const TARGET_SEL = '[data-swarm-target]';

const SWARM_CSS = [
  '[data-swarm="frame"]{background-color:transparent!important;background-image:none!important;box-shadow:none!important;border-color:transparent!important;outline-color:transparent!important}',
  '[data-swarm="frame"]::before,[data-swarm="frame"]::after{opacity:0!important}',
  '[data-swarm="leaf"],[data-swarm="text"]{clip-path:inset(0 100% 100% 0)!important;opacity:0!important}',
].join('');

export interface SwarmCanvasProps {
  /** Number of cursor agents (1 to 20). Default: 14 */
  agents?: number;
  /** Playback speed multiplier (1 = deliberate cinematic pace). Default: 1 */
  speed?: number;
  /** Optional initial curtain; disabled by default so first frame is visible immediately. Default: false */
  preloader?: boolean;
  /** Show preloader again on client-side route changes. Default: false */
  preloaderOnNavigate?: boolean;
  /** Preloader backdrop color (Axom Hub Canvas). Default: #07130F */
  background?: string;
  /** Bounding box & progress accent color (Axom Hub Lime). Default: #AEF830 */
  accent?: string;
  /** Size chip background color. Default: #AEF830 */
  chip?: string;
  /** Text color inside size chip. Default: #07130F */
  chipText?: string;
  /** Viewport height fraction where scroll build triggers (0.4 - 0.98). Default: 0.85 */
  buildLine?: number;
  /** Maximum concurrent builder cursors to keep section reveals legible. Default: 3 */
  maxConcurrent?: number;
  /** Minimum stagger delay (ms) between dispatching sequential reveals. Default: 240 */
  staggerMs?: number;
  /** Show canvas rulers and build line while actively building. Default: true */
  rulers?: boolean;
  /** Show development HUD controls (replay, tour, progress). Disabled by default for visitors. Default: false */
  hud?: boolean;
  /** Idle orbit ring radius around pointer. Default: 52 */
  ringRadius?: number;
  /** Behavior when prefers-reduced-motion is enabled. Default: "skip" */
  reducedMotion?: 'skip' | 'calm' | 'play';
  /** Current route path key to re-collect targets cleanly on SPA navigation */
  routeKey?: string;
  /** DOM selector for the root container to scan. Default: "#main-content" */
  rootSelector?: string;
}

type Kind = 'text' | 'leaf' | 'frame';

interface Line {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface Job {
  el: HTMLElement;
  kind: Kind;
  parent: Job | null;
  state: number;
  chars: number;
  lines: Line[];
  eligibleSince: number;
}

interface Box {
  job: Job;
  p: number;
  doneAt: number;
}

interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ang: number;
  want: number;
  tx: number;
  ty: number;
  k: number;
  color: string;
  name: string;
  job: Job | null;
  box: Box | null;
  phase: 'idle' | 'travel' | 'arrive' | 'draw' | 'type' | 'fill' | 'hold';
  t0: number;
  travelDur: number;
  tag: number;
  beam: boolean;
  cx: number;
  cy: number;
  ch: number;
}

interface HudState {
  phase: 'scan' | 'build' | 'done';
  built: number;
  total: number;
  scan: number;
  time: number;
  hidden: boolean;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const q = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + q, y);
  ctx.arcTo(x + w, y, x + w, y + h, q);
  ctx.arcTo(x + w, y + h, x, y + h, q);
  ctx.arcTo(x, y + h, x, y, q);
  ctx.arcTo(x, y, x + w, y, q);
  ctx.closePath();
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function wrapAngle(a: number): number {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function measureTextLines(el: HTMLElement): Line[] {
  const base = el.getBoundingClientRect();
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const lines: Line[] = [];
  let node = walker.nextNode();

  while (node) {
    if ((node.textContent || '').trim()) {
      range.selectNodeContents(node);
      for (const r of Array.from(range.getClientRects())) {
        if (r.width < 0.5) continue;
        const mid = (r.top + r.bottom) / 2 - base.top;
        const line = lines.find((l) => mid > l.top && mid < l.bottom);
        if (line) {
          line.left = Math.min(line.left, r.left - base.left);
          line.right = Math.max(line.right, r.right - base.left);
          line.top = Math.min(line.top, r.top - base.top);
          line.bottom = Math.max(line.bottom, r.bottom - base.top);
        } else {
          lines.push({
            top: r.top - base.top,
            bottom: r.bottom - base.top,
            left: r.left - base.left,
            right: r.right - base.left,
          });
        }
      }
    }
    node = walker.nextNode();
  }

  lines.sort((a, b) => a.top - b.top);
  return lines;
}

function applyTypeClip(job: Job, agent: Agent, t: number, r: DOMRect) {
  const lines = job.lines;
  if (!lines.length) {
    job.el.style.clipPath = `inset(0 ${100 - t * 100}% 0 0)`;
    agent.cx = r.left + r.width * t;
    agent.cy = r.top;
    agent.ch = r.height;
    return;
  }

  let total = 0;
  for (const l of lines) total += l.right - l.left;
  let rem = t * total;
  let i = 0;
  while (i < lines.length - 1 && rem > lines[i].right - lines[i].left) {
    rem -= lines[i].right - lines[i].left;
    i++;
  }

  const cur = lines[i];
  const x = cur.left + Math.min(rem, cur.right - cur.left);
  const top = i > 0 ? (lines[i - 1].bottom + cur.top) / 2 : -20;
  const bot =
    i < lines.length - 1 ? (cur.bottom + lines[i + 1].top) / 2 : r.height + 20;

  job.el.style.clipPath = `polygon(-20px -20px, calc(100% + 20px) -20px, calc(100% + 20px) ${top}px, ${x}px ${top}px, ${x}px ${bot}px, -20px ${bot}px)`;
  agent.cx = r.left + x;
  agent.cy = r.top + cur.top;
  agent.ch = cur.bottom - cur.top;
}

export function SwarmCanvas({
  agents: agentsProp = 14,
  speed: speedProp = 1,
  preloader = false,
  preloaderOnNavigate = false,
  background = '#07130F',
  accent = '#AEF830',
  chip = '#AEF830',
  chipText = '#07130F',
  buildLine = 0.85,
  maxConcurrent = 3,
  staggerMs = 240,
  rulers = true,
  hud: showHud = false,
  ringRadius = 52,
  reducedMotion = 'skip',
  routeKey,
  rootSelector = '#main-content',
}: SwarmCanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<{
    replay: () => void;
    tour: () => void;
    close: () => void;
    onRouteChange: () => void;
  }>({
    replay: () => {},
    tour: () => {},
    close: () => {},
    onRouteChange: () => {},
  });

  const propsRef = useRef({
    agents: agentsProp,
    speed: speedProp,
    preloader,
    preloaderOnNavigate,
    background,
    accent,
    chip,
    chipText,
    buildLine,
    maxConcurrent,
    staggerMs,
    rulers,
    hud: showHud,
    ringRadius,
    reducedMotion,
    rootSelector,
  });

  propsRef.current = {
    agents: agentsProp,
    speed: speedProp,
    preloader,
    preloaderOnNavigate,
    background,
    accent,
    chip,
    chipText,
    buildLine,
    maxConcurrent,
    staggerMs,
    rulers,
    hud: showHud,
    ringRadius,
    reducedMotion,
    rootSelector,
  };

  const agentCount = Math.max(1, Math.min(20, Math.round(agentsProp)));

  // Never block initial render with a full-screen curtain unless explicitly enabled
  const [overlay, setOverlay] = useState<boolean>(false);
  const [hud, setHud] = useState<HudState>({
    phase: 'build',
    built: 0,
    total: 0,
    scan: 0,
    time: 0,
    hidden: false,
  });
  const [vwState, setVwState] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setVwState(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const mobile = vwState < 810;
  const tiny = vwState < 430;

  useEffect(() => {
    const self = rootRef.current;
    const canvas = canvasRef.current;
    if (!self || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mediaQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const reduce = Boolean(mediaQuery?.matches);
    const rm = propsRef.current.reducedMotion;

    if (reduce && rm === 'skip') {
      setOverlay(false);
      setHud((prev) => ({...prev, hidden: true}));
      return;
    }

    const calm = reduce && rm === 'calm';

    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-axom-swarm-style', 'true');
    styleEl.textContent = SWARM_CSS;
    document.head.appendChild(styleEl);

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const arrow = new Path2D(
      'M0 0 L0 15.5 L4.2 11.6 L7.1 18 L9.6 16.9 L6.8 10.7 L12.4 10.7 Z'
    );

    const spawnX = vw * 0.68;
    const spawnY = vh * 0.34;

    const agents: Agent[] = [];
    for (let i = 0; i < agentCount; i++) {
      const th = (i / agentCount) * Math.PI * 2;
      agents.push({
        x: spawnX + Math.cos(th) * ringRadius,
        y: spawnY + Math.sin(th) * ringRadius,
        vx: 0,
        vy: 0,
        ang: 0,
        want: 0,
        tx: spawnX + Math.cos(th) * ringRadius,
        ty: spawnY + Math.sin(th) * ringRadius,
        k: 55,
        color: COLORS[i % COLORS.length],
        name: NAMES[i % NAMES.length],
        job: null,
        box: null,
        phase: 'idle',
        t0: 0,
        travelDur: 600,
        tag: 0,
        beam: false,
        cx: 0,
        cy: 0,
        ch: 0,
      });
    }

    let jobs: Job[] = [];
    let boxes: Box[] = [];
    let phase: 'scan' | 'build' = 'build';
    let phaseStart = performance.now();
    let buildStart = performance.now();
    let buildEnd = 0;
    let mx = -1;
    let my = -1;
    let ringA = 0;
    let touring = false;
    let chrome = 0;
    let lastBusy = 0;
    let lastDispatchAt = 0;
    let hudHidden = false;
    let scanMs = 750;
    let raf = 0;

    const restore = (j: Job) => {
      j.el.removeAttribute('data-swarm');
      j.el.style.clipPath = '';
      j.el.style.opacity = '';
      j.el.style.transition = '';
    };

    const isVisible = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    };

    const isExcluded = (el: HTMLElement) => {
      if (self.contains(el) || el.contains(self)) return true;
      if (el.closest('[data-swarm-ignore], form, header, footer, nav')) {
        return true;
      }
      return false;
    };

    const collect = (): Job[] => {
      const root =
        document.querySelector<HTMLElement>(propsRef.current.rootSelector) ||
        document.getElementById('main-content') ||
        document.getElementById('main') ||
        document.body;

      const list = Array.from(root.querySelectorAll<HTMLElement>(TARGET_SEL));
      const map = new Map<HTMLElement, Job>();
      const out: Job[] = [];

      for (const el of list) {
        if (isExcluded(el)) continue;
        if (!isVisible(el)) continue;

        const targetKind = el.getAttribute('data-swarm-target');
        const kind: Kind =
          targetKind === 'text'
            ? 'text'
            : targetKind === 'frame'
              ? 'frame'
              : 'leaf';

        const job: Job = {
          el,
          kind,
          parent: null,
          state: 0,
          chars: (el.textContent || '').length,
          lines: [],
          eligibleSince: 0,
        };
        map.set(el, job);
        out.push(job);
      }

      for (const j of out) {
        let par = j.el.parentElement;
        while (par && !map.has(par)) par = par.parentElement;
        if (par) {
          const pj = map.get(par) as Job;
          j.parent = pj;
          if (pj.kind === 'leaf') pj.kind = 'frame';
        }
      }

      return out;
    };

    const start = (usePreloader: boolean) => {
      jobs.forEach(restore);
      jobs = collect();
      jobs.forEach((j) => j.el.setAttribute('data-swarm', j.kind));
      boxes = [];
      agents.forEach((a) => {
        a.job = null;
        a.box = null;
        a.beam = false;
        a.phase = 'idle';
      });
      buildEnd = 0;

      const showPre = usePreloader && !calm && jobs.length > 0;
      phase = showPre ? 'scan' : 'build';
      phaseStart = performance.now();
      buildStart = phaseStart;
      // Short initial settle (180ms) so the visitor sees the page frame + cursors before the first reveal begins
      lastDispatchAt = phaseStart - Math.max(0, propsRef.current.staggerMs - 180);

      if (showPre) {
        agents.forEach((a, i) => {
          const th = (i / agentCount) * Math.PI * 2;
          a.x = vw / 2 + Math.cos(th) * 48;
          a.y = vh / 2 + Math.sin(th) * 48;
          a.vx = 0;
          a.vy = 0;
        });
      }

      setOverlay(showPre);
      hudHidden = false;
    };

    const skip = () => {
      jobs.forEach((j) => {
        restore(j);
        j.state = 2;
      });
      agents.forEach((a) => {
        a.job = null;
        a.box = null;
        a.beam = false;
        a.phase = 'idle';
      });
      boxes = [];
      if (phase === 'scan') {
        phase = 'build';
        buildStart = performance.now();
      }
      setOverlay(false);
      if (!buildEnd) buildEnd = performance.now();
    };

    const replay = () => {
      window.scrollTo({top: 0, behavior: 'auto'});
      scanMs = 650;
      start(propsRef.current.preloader);
    };

    apiRef.current = {
      replay,
      tour: () => {
        touring = !touring;
      },
      close: () => {
        skip();
        hudHidden = true;
        setHud((prev) => ({...prev, hidden: true}));
      },
      onRouteChange: () => {
        scanMs = 600;
        start(propsRef.current.preloaderOnNavigate);
      },
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const onKey = (e: KeyboardEvent) => {
      touring = false;
      if (e.key === 'Escape') skip();
    };

    const stopTour = () => {
      touring = false;
    };

    const onReducedMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && propsRef.current.reducedMotion === 'skip') {
        skip();
        hudHidden = true;
        setHud((prev) => ({...prev, hidden: true}));
      }
    };

    window.addEventListener('pointermove', onMove, {passive: true});
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', stopTour, {passive: true});
    window.addEventListener('touchstart', stopTour, {passive: true});
    mediaQuery?.addEventListener('change', onReducedMotionChange);

    const completeAgentJob = (a: Agent, now: number) => {
      const j = a.job;
      if (j) {
        j.el.style.clipPath = '';
        j.el.style.opacity = '';
        j.el.style.transition = '';
        j.el.removeAttribute('data-swarm');
        j.state = 2;
      }
      if (a.box) a.box.doneAt = now;
      a.job = null;
      a.box = null;
      a.beam = false;
      a.phase = 'idle';
    };

    let last = performance.now();
    let hudAt = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      const P = propsRef.current;
      const speed = Math.max(0.4, P.speed);
      const lineY = vh * P.buildLine;
      const acc = P.accent;
      const chipC = P.chip;
      const chipTxt = P.chipText;

      let scanCount = 0;
      const hasMouse = mx >= 0;
      const cx = hasMouse ? mx : vw * 0.72;
      const cy = hasMouse ? my : vh * 0.34;

      const atPageBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;

      if (phase === 'scan') {
        const t = (now - phaseStart) / (scanMs / speed);
        scanCount = Math.round(Math.min(1, t) * jobs.length);
        const R = Math.min(140, Math.min(vw, vh) * 0.2);
        const base = (now / 1000) * 1.6;
        agents.forEach((a, i) => {
          const th = base + (i % 2) * Math.PI - Math.floor(i / 2) * 0.21;
          a.tx = vw / 2 + Math.cos(th) * R;
          a.ty = vh / 2 + Math.sin(th) * R;
          a.k = 240;
          a.want = th + Math.PI / 2 - ARROW_DIR;
        });
        if (t >= 1) {
          phase = 'build';
          buildStart = now;
          lastDispatchAt = now - P.staggerMs;
          setOverlay(false);
        }
      } else {
        // Failsafe: if any eligible element waits too long (> 5.5s), restore it cleanly so content never stays hidden
        let eligiblePending = 0;
        for (const j of jobs) {
          if (j.state !== 0) continue;
          const r = j.el.getBoundingClientRect();
          if (atPageBottom || r.top < lineY) {
            if (!j.eligibleSince) j.eligibleSince = now;
            if (now - j.eligibleSince > 5500) {
              restore(j);
              j.state = 2;
              continue;
            }
            eligiblePending++;
          }
        }

        const activeCount = agents.filter((a) => a.job !== null).length;
        const maxActive = Math.max(1, P.maxConcurrent);
        // Slightly tighten stagger only when many scrolled-into-view targets are queued
        const adaptiveStagger =
          (eligiblePending > 7 ? Math.min(P.staggerMs, 130) : P.staggerMs) /
          speed;

        if (
          activeCount < maxActive &&
          now - lastDispatchAt >= adaptiveStagger
        ) {
          const free = agents.filter((a) => !a.job);
          if (free.length) {
            for (const j of jobs) {
              if (j.state !== 0) continue;
              if (j.parent && j.parent.state === 0) continue;

              const r = j.el.getBoundingClientRect();
              if (!atPageBottom && r.top >= lineY) continue;

              let bi = 0;
              let bd = Infinity;
              free.forEach((a, i) => {
                const d =
                  (a.x - r.left) * (a.x - r.left) +
                  (a.y - r.top) * (a.y - r.top);
                if (d < bd) {
                  bd = d;
                  bi = i;
                }
              });

              const a = free[bi];
              const dist = Math.sqrt(bd);
              const box: Box = {job: j, p: 0, doneAt: 0};
              boxes.push(box);
              j.state = 1;
              a.job = j;
              a.box = box;
              a.phase = 'travel';
              a.t0 = now;
              a.travelDur =
                Math.min(1100, Math.max(480, 420 + dist * 0.55)) / speed;
              lastDispatchAt = now;
              break; // Dispatch 1 target per stagger beat for calm sequential reveal
            }
          }
        }

        ringA += dt * 0.36;
        agents.forEach((a, i) => {
          const j = a.job;
          if (!j) {
            const th = ringA + (i / agentCount) * Math.PI * 2;
            a.tx = cx + Math.cos(th) * P.ringRadius;
            a.ty = cy + Math.sin(th) * P.ringRadius;
            a.k = 24 + ((i * 29) % 11) * 5;
            const sp = Math.hypot(a.vx, a.vy);
            a.want =
              (sp > 90
                ? Math.atan2(a.vy, a.vx)
                : Math.atan2(cy - a.y, cx - a.x)) - ARROW_DIR;
            return;
          }

          lastBusy = now;
          a.want = 0;
          const r = j.el.getBoundingClientRect();
          const box = a.box as Box;

          if (a.phase === 'travel') {
            // Phase 1: Move deliberately toward target top-left corner
            a.tx = r.left;
            a.ty = r.top;
            a.k = 95;
            const arrived = Math.hypot(a.x - r.left, a.y - r.top) < 10;
            if (
              (arrived && now - a.t0 > 260 / speed) ||
              now - a.t0 > a.travelDur
            ) {
              a.phase = 'arrive';
              a.t0 = now;
            }
          } else if (a.phase === 'arrive') {
            // Phase 2: Short intentional arrival pause before revealing
            a.tx = r.left;
            a.ty = r.top;
            a.k = 160;
            if (now - a.t0 >= (calm ? 60 : 170) / speed) {
              a.phase = 'draw';
              a.t0 = now;
            }
          } else if (a.phase === 'draw') {
            // Phase 3a: Draw bounding frame cleanly
            const drawMs = (calm ? 180 : 420) / speed;
            const t = Math.min(1, (now - a.t0) / drawMs);
            const e = easeInOutCubic(t);
            box.p = e;
            a.tx = r.left + r.width * e;
            a.ty = r.top + r.height * e;
            a.k = 320;
            if (t >= 1) {
              j.el.removeAttribute('data-swarm');
              j.el.style.transition = 'opacity 280ms cubic-bezier(0.16, 1, 0.3, 1)';
              j.el.style.opacity = '1';

              if (j.kind === 'text') {
                j.lines = measureTextLines(j.el);
                applyTypeClip(j, a, 0, r);
                a.phase = 'type';
                a.beam = true;
                a.t0 = now;
              } else if (j.kind === 'leaf') {
                j.el.style.clipPath = 'inset(0 100% 0 0)';
                a.phase = 'fill';
                a.t0 = now;
              } else {
                a.phase = 'hold';
                a.t0 = now;
              }
            }
          } else if (a.phase === 'type') {
            // Phase 3b: Typewriter text reveal synchronized with I-beam cursor
            const dur =
              (calm
                ? Math.min(700, Math.max(220, j.chars * 8))
                : Math.min(2400, Math.max(580, j.chars * 26))) / speed;
            const t = Math.min(1, (now - a.t0) / dur);
            applyTypeClip(j, a, easeInOutCubic(t), r);
            a.tx = a.cx + 3;
            a.ty = a.cy + a.ch * 0.5;
            a.k = 420;
            if (t >= 1) {
              j.el.style.clipPath = '';
              a.beam = false;
              a.phase = 'hold';
              a.t0 = now;
            }
          } else if (a.phase === 'fill') {
            // Phase 3c: Smooth horizontal card/block reveal
            const dur = (calm ? 260 : 720) / speed;
            const t = easeInOutCubic(Math.min(1, (now - a.t0) / dur));
            j.el.style.clipPath = `inset(0 ${100 - t * 100}% 0 0)`;
            a.tx = r.left + r.width * t;
            a.ty = r.top + r.height * 0.5;
            a.k = 340;
            if (t >= 1) {
              j.el.style.clipPath = '';
              a.phase = 'hold';
              a.t0 = now;
            }
          } else if (a.phase === 'hold') {
            // Phase 4: Intentional post-reveal pause so the visitor perceives the section
            a.tx = r.left + r.width;
            a.ty = r.top + r.height * 0.5;
            a.k = 180;
            if (now - a.t0 >= (calm ? 80 : 260) / speed) {
              completeAgentJob(a, now);
            }
          }
        });
      }

      for (const a of agents) {
        const K = Math.min(680, a.k);
        const D = 2 * Math.sqrt(K) * 0.94;
        const h = dt / 2;
        for (let s = 0; s < 2; s++) {
          a.vx += ((a.tx - a.x) * K - a.vx * D) * h;
          a.vy += ((a.ty - a.y) * K - a.vy * D) * h;
          a.x += a.vx * h;
          a.y += a.vy * h;
        }
        a.ang += wrapAngle(a.want - a.ang) * Math.min(1, dt * 6.5);
        a.tag += ((a.job ? 1 : 0) - a.tag) * Math.min(1, dt * 6);
      }

      if (touring) {
        // Guided tour scrolls gently and slows while multiple sections are mid-reveal
        const activeBuilders = agents.filter((a) => a.job !== null).length;
        const tourRate = activeBuilders >= 2 ? 75 : 120;
        window.scrollBy(0, tourRate * speed * dt);
        if (
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2
        ) {
          touring = false;
        }
      }

      const busy = phase === 'build' && now - lastBusy < 1100;
      chrome += ((busy ? 1 : 0) - chrome) * Math.min(1, dt * 4);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      boxes = boxes.filter(
        (b) => !b.doneAt || now - b.doneAt < 220 / speed + 450
      );

      const live: {l: number; t: number; w: number; h: number}[] = [];
      for (const b of boxes) {
        const r = b.job.el.getBoundingClientRect();
        const w = r.width * b.p;
        const h = r.height * b.p;
        if (!b.doneAt) live.push({l: r.left, t: r.top, w, h});
        if (r.bottom < -40 || r.top > vh + 40) continue;

        const al = b.doneAt
          ? Math.max(0, 1 - (now - b.doneAt - 220 / speed) / 420)
          : 1;
        if (al <= 0) continue;

        const x0 = Math.round(r.left) + 0.5;
        const y0 = Math.round(r.top) + 0.5;

        if (!b.doneAt && chrome > 0.05) {
          ctx.save();
          ctx.globalAlpha = 0.18 * chrome;
          ctx.strokeStyle = acc;
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.moveTo(0, y0);
          ctx.lineTo(vw, y0);
          ctx.moveTo(0, y0 + h);
          ctx.lineTo(vw, y0 + h);
          ctx.moveTo(x0, 0);
          ctx.lineTo(x0, vh);
          ctx.moveTo(x0 + w, 0);
          ctx.lineTo(x0 + w, vh);
          ctx.stroke();
          ctx.restore();
        }

        ctx.globalAlpha = al;
        ctx.strokeStyle = acc;
        ctx.lineWidth = 1;
        ctx.strokeRect(x0, y0, Math.round(w), Math.round(h));

        const corners = [
          [x0, y0],
          [x0 + w, y0],
          [x0, y0 + h],
          [x0 + w, y0 + h],
        ];
        for (const c of corners) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(c[0] - 2.5, c[1] - 2.5, 5, 5);
          ctx.strokeRect(c[0] - 2.5, c[1] - 2.5, 5, 5);
        }

        const label = `${Math.round(w)} × ${Math.round(h)}`;
        ctx.font = `600 9px ${MONO}`;
        const tw = ctx.measureText(label).width;
        const bw = tw + 10;
        const bx = x0 + w / 2 - bw / 2;
        const by = y0 + h + 7;
        roundRectPath(ctx, bx, by, bw, 14, 3);
        ctx.fillStyle = chipC;
        ctx.fill();
        ctx.fillStyle = chipTxt;
        ctx.textBaseline = 'middle';
        ctx.fillText(label, bx + 5, by + 7.5);
        ctx.textBaseline = 'alphabetic';
      }
      ctx.globalAlpha = 1;

      if (chrome > 0.01) {
        if (P.rulers) {
          const T = 18;
          const sy = window.scrollY;
          ctx.globalAlpha = chrome;
          ctx.fillStyle = 'rgba(7, 19, 15, 0.94)';
          ctx.fillRect(0, 0, vw, T);
          ctx.fillRect(0, 0, T, vh);

          ctx.globalAlpha = chrome * 0.45;
          ctx.fillStyle = acc;
          for (const b of live) {
            ctx.fillRect(b.l, 0, b.w, T);
            ctx.fillRect(0, b.t, T, b.h);
          }

          ctx.globalAlpha = chrome;
          ctx.strokeStyle = '#203C30';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let x = 0; x < vw; x += 10) {
            const len = x % 100 === 0 ? T : x % 50 === 0 ? 7 : 4;
            ctx.moveTo(x + 0.5, T - len);
            ctx.lineTo(x + 0.5, T);
          }
          for (let y = -(sy % 10); y < vh; y += 10) {
            const v = Math.round(y + sy);
            const len = v % 100 === 0 ? T : v % 50 === 0 ? 7 : 4;
            ctx.moveTo(T - len, Math.round(y) + 0.5);
            ctx.lineTo(T, Math.round(y) + 0.5);
          }
          ctx.stroke();

          ctx.fillStyle = '#A6B4AC';
          ctx.font = `500 8px ${MONO}`;
          for (let x = 100; x < vw; x += 100) {
            ctx.fillText(String(x), x + 3, 9);
          }
          for (let y = -(sy % 100); y < vh; y += 100) {
            const v = Math.round(y + sy);
            if (v <= 0) continue;
            ctx.save();
            ctx.translate(10, y - 3);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(String(v), 0, 0);
            ctx.restore();
          }

          ctx.fillStyle = '#203C30';
          ctx.fillRect(0, T, vw, 1);
          ctx.fillRect(T, 0, 1, vh);
        }

        ctx.globalAlpha = chrome * 0.7;
        ctx.fillStyle = acc;
        ctx.fillRect(0, Math.round(lineY), vw, 1);
        ctx.font = `600 8px ${MONO}`;
        ctx.textAlign = 'right';
        ctx.fillText('BUILD LINE', vw - 14, lineY - 5);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
      }

      const cursorScale = vw < 810 ? 0.54 : 0.62;

      for (const a of agents) {
        if (a.phase === 'type') {
          ctx.fillStyle = a.color;
          ctx.fillRect(a.cx, a.cy, 1.25, a.ch);
        }

        ctx.save();
        ctx.translate(a.x, a.y);
        if (a.beam) {
          const beamScale = cursorScale / 0.62;
          ctx.scale(beamScale, beamScale);
          ctx.strokeStyle = a.color;
          ctx.lineWidth = 1.35;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-2.5, -5);
          ctx.lineTo(2.5, -5);
          ctx.moveTo(0, -5);
          ctx.lineTo(0, 5);
          ctx.moveTo(-2.5, 5);
          ctx.lineTo(2.5, 5);
          ctx.stroke();
        } else {
          ctx.rotate(a.ang);
          ctx.scale(cursorScale, cursorScale);
          ctx.shadowColor = 'rgba(0,0,0,0.38)';
          ctx.shadowBlur = 2.5;
          ctx.shadowOffsetY = 0.5;
          ctx.fillStyle = a.color;
          ctx.fill(arrow);
          ctx.shadowColor = 'transparent';
          ctx.lineWidth = 1.05;
          ctx.lineJoin = 'round';
          ctx.strokeStyle = 'rgba(7, 19, 15, 0.92)';
          ctx.stroke(arrow);
        }
        ctx.restore();

        if (a.tag > 0.03) {
          ctx.globalAlpha = a.tag * 0.88;
          ctx.font = '600 8px Inter, system-ui, sans-serif';
          const tw = ctx.measureText(a.name).width;
          const padX = 4;
          const pillH = 11;
          const bx = a.x + (a.beam ? 5 : Math.round(9 * cursorScale + 2));
          const by = a.y + (a.beam ? 7 : Math.round(16 * cursorScale + 2));
          roundRectPath(ctx, bx, by, tw + padX * 2, pillH, 4);
          ctx.fillStyle = a.color;
          ctx.fill();
          ctx.fillStyle = '#07130F';
          ctx.textBaseline = 'middle';
          ctx.fillText(a.name, bx + padX, by + pillH / 2 + 0.5);
          ctx.textBaseline = 'alphabetic';
          ctx.globalAlpha = 1;
        }
      }

      if (P.hud && now - hudAt > 90) {
        hudAt = now;
        let built = 0;
        for (const j of jobs) if (j.state === 2) built++;
        if (!buildEnd && phase === 'build' && built === jobs.length) {
          buildEnd = now;
        }
        const nextHud: HudState = {
          phase: phase === 'scan' ? 'scan' : buildEnd ? 'done' : 'build',
          built,
          total: jobs.length,
          scan: scanCount,
          time: buildEnd ? Math.max(0, buildEnd - buildStart) / 1000 : 0,
          hidden: hudHidden,
        };
        setHud((prev) =>
          prev.phase === nextHud.phase &&
          prev.built === nextHud.built &&
          prev.total === nextHud.total &&
          prev.scan === nextHud.scan &&
          prev.hidden === nextHud.hidden &&
          prev.time === nextHud.time
            ? prev
            : nextHud
        );
      }
    };

    start(propsRef.current.preloader);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', stopTour);
      window.removeEventListener('touchstart', stopTour);
      mediaQuery?.removeEventListener('change', onReducedMotionChange);
      jobs.forEach(restore);
      styleEl.remove();
    };
  }, [agentCount]);

  // Re-collect explicit swarm targets cleanly when SPA route changes
  const firstRouteRef = useRef(true);
  useEffect(() => {
    if (firstRouteRef.current) {
      firstRouteRef.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      apiRef.current.onRouteChange();
    }, 60);
    return () => window.clearTimeout(id);
  }, [routeKey]);

  const pct =
    hud.phase === 'scan'
      ? hud.total
        ? hud.scan / hud.total
        : 0
      : hud.total
        ? hud.built / hud.total
        : 0;
  const isDone = hud.phase === 'done';

  return (
    <div ref={rootRef} data-swarm-ignore="true" className="pointer-events-none">
      {/* Optional Preloader Overlay (kept behind Canvas so orbiting cursors remain visible if ever enabled) */}
      {overlay && (
        <div
          aria-hidden="true"
          style={{backgroundColor: background}}
          className="fixed inset-0 z-20 flex items-center justify-center transition-opacity duration-300 pointer-events-none"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#101C18] border border-[#203C30] shadow-[0_0_24px_rgba(174,248,48,0.12)] flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect
                x="2"
                y="2"
                width="22"
                height="22"
                rx="5"
                stroke="#A6B4AC"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <path
                d="M9 7 L9 18 L12 15.2 L14.1 19.6 L15.9 18.8 L13.9 14.5 L17.8 14.5 Z"
                fill={accent}
              />
            </svg>
          </div>
        </div>
      )}

      {/* Transparent Non-Blocking Swarm Canvas Overlay */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 w-screen h-screen z-30 pointer-events-none"
      />

      {/* Development-Only HUD Control Bar (hidden from public visitors unless hud={true}) */}
      {showHud && !hud.hidden && hud.total > 0 && (
        <div
          style={{
            left: mobile ? 12 : '50%',
            right: mobile ? 12 : 'auto',
            bottom: mobile ? 12 : 20,
            transform: mobile ? 'none' : 'translateX(-50%)',
          }}
          className="fixed z-40 flex items-center justify-between sm:justify-start gap-2.5 px-3 py-1.5 rounded-xl bg-[#101C18]/95 border border-[#203C30] shadow-[0_12px_32px_rgba(0,0,0,0.5)] text-[#A6B4AC] font-mono text-[11px] whitespace-nowrap pointer-events-auto backdrop-blur-md"
        >
          {hud.phase === 'scan' ? (
            <span className="truncate">
              Scanning layout… <span className="text-white tabular-nums">{hud.scan}</span>{' '}
              layers
            </span>
          ) : isDone ? (
            <span className="truncate">
              Built <span className="text-white tabular-nums">{hud.total}</span> layers in{' '}
              <span className="tabular-nums">{hud.time.toFixed(1)}s</span>
            </span>
          ) : (
            <>
              {!tiny && (
                <span className="flex items-center" aria-hidden="true">
                  {['#AEF830', '#FFFFFF', '#A6B4AC', '#7CA38E'].map((c, i) => (
                    <span
                      key={`${c}-${i}`}
                      style={{backgroundColor: c, marginLeft: i ? -5 : 0}}
                      className="w-3.5 h-3.5 rounded-full border border-[#101C18] text-[#07130F] font-sans font-bold text-[8px] flex items-center justify-center"
                    >
                      {NAMES[i][0]}
                    </span>
                  ))}
                </span>
              )}
              <span className="text-[#53685E] tabular-nums">{agentCount} agents</span>
              <span className="text-white tabular-nums">
                {hud.built} / {hud.total}
              </span>
            </>
          )}

          {!isDone && (
            <span className="w-12 sm:w-14 h-1 rounded-full bg-[#203C30] overflow-hidden block shrink-0">
              <span
                style={{
                  width: `${pct * 100}%`,
                  backgroundColor: accent,
                }}
                className="block h-full transition-[width] duration-200"
              />
            </span>
          )}

          <button
            type="button"
            onClick={() => (isDone ? apiRef.current.replay() : apiRef.current.tour())}
            className="px-2.5 py-1 rounded-md bg-[#07130F] border border-[#203C30] text-white hover:border-[#AEF830] hover:text-[#AEF830] transition-colors cursor-pointer"
          >
            {isDone ? 'Replay' : 'Tour'}
          </button>

          <button
            type="button"
            aria-label="Dismiss swarm overlay"
            onClick={() => apiRef.current.close()}
            className="px-2 py-1 rounded-md text-[#A6B4AC] hover:text-white transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
