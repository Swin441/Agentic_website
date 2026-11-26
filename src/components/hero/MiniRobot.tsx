'use client';

import React, {useEffect, useId, useRef, useState} from 'react';

export interface MiniRobotProps {
  /** Responsive size preset. Default: 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Trigger brief happy response & lime pulse when scenario changes */
  scenarioKey?: string;
  /** External hover flag so hovering anywhere on the robot's panel triggers happy mode */
  panelHovered?: boolean;
  /** Accessible label */
  label?: string;
  /** Optional subtle caption beneath the robot */
  statusText?: string;
  /** Simplify subtle shadow/motion for compact mobile layouts */
  simplified?: boolean;
  className?: string;
}

type BotState = 'idle' | 'hover' | 'responding' | 'tapped';

const SIZE_MAP = {
  sm: {width: 88, height: 102},
  md: {width: 146, height: 170},
  lg: {width: 172, height: 200},
} as const;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function MiniRobot({
  size = 'md',
  scenarioKey,
  panelHovered = false,
  label = 'Interactive Axom Hub miniature AI robot assistant',
  statusText,
  simplified = false,
  className = '',
}: MiniRobotProps) {
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);

  const botRootRef = useRef<SVGGElement>(null);
  const headGroupRef = useRef<SVGGElement>(null);
  const leftPupilRef = useRef<SVGGElement>(null);
  const rightPupilRef = useRef<SVGGElement>(null);
  const leftEyeBlinkRef = useRef<SVGGElement>(null);
  const rightEyeBlinkRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);

  const [selfHovered, setSelfHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [responding, setResponding] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const isHovered = selfHovered || panelHovered;

  const hoveredRef = useRef(false);
  const tappedRef = useRef(false);
  const respondingRef = useRef(false);

  hoveredRef.current = isHovered;
  tappedRef.current = tapped;
  respondingRef.current = responding;

  const tapTimerRef = useRef<number | null>(null);
  const responseTimerRef = useRef<number | null>(null);
  const firstScenarioRef = useRef(true);

  const dims = SIZE_MAP[size];

  // Detect prefers-reduced-motion safely on client only
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Trigger friendly happy reaction + subtle pulse when business scenario changes
  useEffect(() => {
    if (firstScenarioRef.current) {
      firstScenarioRef.current = false;
      return;
    }
    setResponding(true);
    if (responseTimerRef.current !== null) {
      window.clearTimeout(responseTimerRef.current);
    }
    responseTimerRef.current = window.setTimeout(() => {
      setResponding(false);
    }, 950);
  }, [scenarioKey]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (tapTimerRef.current !== null) {
        window.clearTimeout(tapTimerRef.current);
      }
      if (responseTimerRef.current !== null) {
        window.clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  // Smooth pupil cursor-tracking, calm idle float, subtle breathing, and natural blinking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (reducedMotion) {
      botRootRef.current?.setAttribute('transform', 'translate(0, 0)');
      headGroupRef.current?.setAttribute('transform', 'rotate(0, 90, 96)');
      leftPupilRef.current?.setAttribute('transform', 'translate(0, 0)');
      rightPupilRef.current?.setAttribute('transform', 'translate(0, 0)');
      return;
    }

    let raf = 0;
    let pointerNormX = 0;
    let pointerNormY = 0;
    let lastPointerAt = 0;
    let pointerActive = false;

    let curLookX = 0;
    let curLookY = 0;
    let curHoverTilt = 0;

    let idleLookX = 0;
    let idleLookY = 0;
    let nextGlanceAt = performance.now() + 2000;

    let nextBlinkAt = performance.now() + 1700 + Math.random() * 2000;
    let blinkStart = 0;
    let blinkDuration = 200;

    const onPointerMove = (e: PointerEvent) => {
      // Keep calm idle / tap behavior on touch screens
      if (e.pointerType === 'touch') return;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // Compute direction relative to the robot's head/face center
      const headCx = rect.left + rect.width * 0.5;
      const headCy = rect.top + rect.height * 0.3;
      const dx = e.clientX - headCx;
      const dy = e.clientY - headCy;

      // Smooth saturation near center + true directional vector across the page
      const denom = Math.hypot(dx, dy, 130);
      pointerNormX = dx / denom;
      pointerNormY = dy / denom;
      pointerActive = true;
      lastPointerAt = performance.now();
    };

    const onPointerLeave = () => {
      pointerActive = false;
      pointerNormX = 0;
      pointerNormY = 0;
    };

    window.addEventListener('pointermove', onPointerMove, {passive: true});
    document.addEventListener('mouseleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);

    let lastTime = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Gently return toward idle center / subtle natural glances when pointer leaves or rests
      const pointerIdle = !pointerActive || now - lastPointerAt > 3200;
      if (pointerIdle && now >= nextGlanceAt) {
        const pick = Math.random();
        if (pick < 0.5) {
          idleLookX = 0;
          idleLookY = 0;
        } else {
          idleLookX = (Math.random() - 0.5) * 0.7;
          idleLookY = (Math.random() - 0.5) * 0.45;
        }
        nextGlanceAt = now + 2200 + Math.random() * 2600;
      }

      const targetLookX = pointerIdle ? idleLookX : pointerNormX;
      const targetLookY = pointerIdle ? idleLookY : pointerNormY;

      // Smooth damped interpolation to eliminate jitter
      const eyeEase = Math.min(1, dt * 10.5);
      curLookX += (targetLookX - curLookX) * eyeEase;
      curLookY += (targetLookY - curLookY) * eyeEase;

      // Subtle friendly head tilt only on hover/response (never chasing cursor)
      const targetTilt = hoveredRef.current ? -3.2 : respondingRef.current ? -2.2 : 0;
      curHoverTilt += (targetTilt - curHoverTilt) * Math.min(1, dt * 7.5);

      const t = now / 1000;
      const floatAmp = simplified ? 1.8 : 3.0;
      const floatY = Math.sin(t * 1.4) * floatAmp;
      const hoverLift = hoveredRef.current || respondingRef.current ? -2.2 : 0;

      // Gentle floating motion of the whole robot
      if (botRootRef.current) {
        botRootRef.current.setAttribute(
          'transform',
          `translate(0, ${(floatY + hoverLift).toFixed(2)})`
        );
      }

      // Soft ground shadow reacts gently to float height
      if (shadowRef.current) {
        const shadowScale = 1 - (floatY + hoverLift) / 26;
        shadowRef.current.setAttribute(
          'rx',
          (34 * clamp(shadowScale, 0.86, 1.08)).toFixed(2)
        );
      }

      // Tiny calm breathing micro-nod + hover head tilt (does not chase cursor)
      if (headGroupRef.current) {
        const idleBobY = Math.sin(t * 1.4 - 0.5) * 0.65;
        const idleTilt = Math.sin(t * 0.75) * 0.9;
        const totalTilt = curHoverTilt + idleTilt;
        headGroupRef.current.setAttribute(
          'transform',
          `translate(0, ${idleBobY.toFixed(2)}) rotate(${totalTilt.toFixed(2)}, 90, 96)`
        );
      }

      // Move both pupils smoothly within eye boundaries
      const px = curLookX * 3.1;
      const py = curLookY * 3.3;
      const pupilTransform = `translate(${px.toFixed(2)}, ${py.toFixed(2)})`;
      if (leftPupilRef.current) {
        leftPupilRef.current.setAttribute('transform', pupilTransform);
      }
      if (rightPupilRef.current) {
        rightPupilRef.current.setAttribute('transform', pupilTransform);
      }

      // Natural blinking
      if (blinkStart === 0 && now >= nextBlinkAt && !tappedRef.current) {
        blinkStart = now;
        blinkDuration = 185 + Math.random() * 45;
      }

      let eyeScaleY = 1;
      if (blinkStart > 0) {
        const elapsed = now - blinkStart;
        if (elapsed >= blinkDuration) {
          blinkStart = 0;
          const doubleBlink = Math.random() < 0.16;
          nextBlinkAt =
            now + (doubleBlink ? 170 : 2500 + Math.random() * 3200);
        } else {
          const p = elapsed / blinkDuration;
          const closeCurve = p < 0.45 ? p / 0.45 : 1 - (p - 0.45) / 0.55;
          eyeScaleY = Math.max(0.08, 1 - closeCurve * 0.92);
        }
      } else if (tappedRef.current) {
        eyeScaleY = 1.1;
      } else if (hoveredRef.current || respondingRef.current) {
        eyeScaleY = 1.05;
      }

      if (leftEyeBlinkRef.current) {
        leftEyeBlinkRef.current.setAttribute(
          'transform',
          `translate(73, 62) scale(1, ${eyeScaleY.toFixed(3)}) translate(-73, -62)`
        );
      }
      if (rightEyeBlinkRef.current) {
        rightEyeBlinkRef.current.setAttribute(
          'transform',
          `translate(107, 62) scale(1, ${eyeScaleY.toFixed(3)}) translate(-107, -62)`
        );
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
    };
  }, [reducedMotion, simplified]);

  const triggerTap = () => {
    setTapped(true);
    if (tapTimerRef.current !== null) {
      window.clearTimeout(tapTimerRef.current);
    }
    tapTimerRef.current = window.setTimeout(() => {
      setTapped(false);
    }, 540);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerTap();
    }
  };

  const botState: BotState = tapped
    ? 'tapped'
    : isHovered
      ? 'hover'
      : responding
        ? 'responding'
        : 'idle';

  const isHappy = botState === 'hover' || botState === 'responding';
  const isBright = isHappy || botState === 'tapped';

  return (
    <div
      ref={containerRef}
      className={`inline-flex flex-col items-center select-none ${className}`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onMouseEnter={() => setSelfHovered(true)}
        onMouseLeave={() => setSelfHovered(false)}
        onClick={triggerTap}
        onKeyDown={handleKeyDown}
        style={{
          width: dims.width,
          height: dims.height,
        }}
        className="relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AEF830] rounded-2xl"
      >
        {/* Soft Axom Hub lime aura around robot (subtle idle, warm soft glow on hover) */}
        <div
          aria-hidden="true"
          style={{
            opacity: botState === 'tapped' ? 0.38 : isHovered ? 0.3 : responding ? 0.28 : 0.1,
          }}
          className={`pointer-events-none absolute inset-x-3 top-4 bottom-2 rounded-full bg-[#AEF830] transition-opacity duration-300 ${
            simplified ? 'blur-xl' : 'blur-2xl'
          }`}
        />

        <svg
          viewBox="0 0 180 210"
          width={dims.width}
          height={dims.height}
          className="relative z-10 block w-full h-full overflow-visible"
        >
          <defs>
            {/* Dark graphite / forest-green brushed chassis */}
            <linearGradient id={`chassis-${uid}`} x1="0.15" y1="0" x2="0.85" y2="1">
              <stop offset="0%" stopColor="#263831" />
              <stop offset="48%" stopColor="#14211C" />
              <stop offset="100%" stopColor="#0B1410" />
            </linearGradient>

            {/* Brushed dark metal secondary plates (ears, joints, neck, feet) */}
            <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#31473F" />
              <stop offset="50%" stopColor="#1B2B25" />
              <stop offset="100%" stopColor="#0E1915" />
            </linearGradient>

            {/* Recessed visor dark glass */}
            <linearGradient id={`visor-${uid}`} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#0B1612" />
              <stop offset="100%" stopColor="#040A08" />
            </linearGradient>

            {/* Subtle top metallic highlight */}
            <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A6B4AC" stopOpacity="0.38" />
              <stop offset="45%" stopColor="#203C30" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#07130F" stopOpacity="0.95" />
            </linearGradient>

            {/* Luminous lime eye iris gradient */}
            <radialGradient id={`eye-iris-${uid}`} cx="45%" cy="38%" r="65%">
              <stop offset="0%" stopColor={isBright ? '#EEFFD0' : '#D9FF94'} />
              <stop offset="65%" stopColor="#AEF830" />
              <stop offset="100%" stopColor="#8FD422" />
            </radialGradient>

            {/* Strict eye boundary clips so pupils never escape the eyes */}
            <clipPath id={`left-eye-clip-${uid}`}>
              <ellipse cx="73" cy="62" rx="8.2" ry="9.4" />
            </clipPath>
            <clipPath id={`right-eye-clip-${uid}`}>
              <ellipse cx="107" cy="62" rx="8.2" ry="9.4" />
            </clipPath>
          </defs>

          {/* Ground shadow */}
          <ellipse
            ref={shadowRef}
            cx="90"
            cy="192"
            rx="34"
            ry="6.5"
            fill="#020806"
            opacity="0.72"
          />

          {/* Subtle lime floor reflection */}
          <ellipse
            cx="90"
            cy="190"
            rx="24"
            ry="3.5"
            fill="#AEF830"
            opacity={isBright ? 0.28 : 0.09}
            className="transition-opacity duration-300"
          />

          {/* Complete Miniature Robot Assembly */}
          <g ref={botRootRef}>
            {/* Short Stubby Robot Legs & Articulated Feet */}
            <g>
              <rect
                x="67"
                y="153"
                width="14"
                height="16"
                rx="5"
                fill={`url(#metal-${uid})`}
                stroke="#203C30"
                strokeWidth="1.2"
              />
              <path
                d="M 63 169 C 63 164, 83 164, 83 169 L 83 175 C 83 177.5, 63 177.5, 63 175 Z"
                fill={`url(#chassis-${uid})`}
                stroke="#2E463C"
                strokeWidth="1.2"
              />

              <rect
                x="99"
                y="153"
                width="14"
                height="16"
                rx="5"
                fill={`url(#metal-${uid})`}
                stroke="#203C30"
                strokeWidth="1.2"
              />
              <path
                d="M 97 169 C 97 164, 117 164, 117 169 L 117 175 C 117 177.5, 97 177.5, 97 175 Z"
                fill={`url(#chassis-${uid})`}
                stroke="#2E463C"
                strokeWidth="1.2"
              />
            </g>

            {/* Left Robotic Arm & Shoulder Joint */}
            <g
              transform={
                isHappy
                  ? 'rotate(8, 50, 112)'
                  : 'rotate(0, 50, 112)'
              }
              className="transition-transform duration-300 ease-out"
            >
              <circle
                cx="50"
                cy="112"
                r="6.5"
                fill={`url(#metal-${uid})`}
                stroke="#2D453B"
                strokeWidth="1.2"
              />
              <rect
                x="35"
                y="112"
                width="15"
                height="28"
                rx="7.5"
                transform="rotate(8, 42, 126)"
                fill={`url(#chassis-${uid})`}
                stroke={`url(#rim-${uid})`}
                strokeWidth="1.2"
              />
              <line
                x1="37"
                y1="132"
                x2="47"
                y2="133.5"
                stroke="#AEF830"
                strokeOpacity={isBright ? 0.65 : 0.25}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>

            {/* Right Robotic Arm & Shoulder Joint */}
            <g
              transform={
                isHappy
                  ? 'rotate(-10, 130, 112)'
                  : 'rotate(0, 130, 112)'
              }
              className="transition-transform duration-300 ease-out"
            >
              <circle
                cx="130"
                cy="112"
                r="6.5"
                fill={`url(#metal-${uid})`}
                stroke="#2D453B"
                strokeWidth="1.2"
              />
              <rect
                x="130"
                y="112"
                width="15"
                height="28"
                rx="7.5"
                transform="rotate(-8, 137, 126)"
                fill={`url(#chassis-${uid})`}
                stroke={`url(#rim-${uid})`}
                strokeWidth="1.2"
              />
              <line
                x1="133"
                y1="133.5"
                x2="143"
                y2="132"
                stroke="#AEF830"
                strokeOpacity={isBright ? 0.65 : 0.25}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>

            {/* Compact Robot Torso Chassis */}
            <path
              d="M 54 108 C 54 102, 60 98, 67 98 L 113 98 C 120 98, 126 102, 126 108 L 122 149 C 121.5 154, 116 158, 110 158 L 70 158 C 64 158, 58.5 154, 58 149 Z"
              fill={`url(#chassis-${uid})`}
              stroke={`url(#rim-${uid})`}
              strokeWidth="1.4"
            />

            {/* Brushed Chest Collar Plate */}
            <path
              d="M 64 103 L 116 103 L 112 114 L 68 114 Z"
              fill={`url(#metal-${uid})`}
              stroke="#203C30"
              strokeWidth="1"
            />

            {/* Minimal Chest Core Indicator */}
            <circle
              cx="90"
              cy="132"
              r="9.5"
              fill="#07110D"
              stroke={isBright ? '#315844' : '#203C30'}
              strokeWidth="1.25"
            />
            <circle
              cx="90"
              cy="132"
              r={isBright ? 5.0 : 4.2}
              fill="#AEF830"
              opacity={isBright ? 1 : 0.72}
              className="transition-all duration-300"
            />
            <circle cx="88.6" cy="130.6" r="1.4" fill="#FFFFFF" opacity="0.8" />

            {/* Subtle telemetry micro-slots beside core */}
            <rect x="68" y="130.5" width="7" height="3" rx="1.5" fill="#203C30" />
            <rect x="105" y="130.5" width="7" height="3" rx="1.5" fill="#203C30" />

            {/* Articulated Neck Collar */}
            <rect
              x="76"
              y="91"
              width="28"
              height="10"
              rx="4"
              fill={`url(#metal-${uid})`}
              stroke="#203C30"
              strokeWidth="1.15"
            />

            {/* Robot Head Assembly */}
            <g ref={headGroupRef}>
              {/* Top Antenna Mast & Lime Beacon Tip */}
              <rect
                x="87.5"
                y="21"
                width="5"
                height="13"
                rx="2.5"
                fill={`url(#metal-${uid})`}
                stroke="#2D453B"
                strokeWidth="1"
              />
              <circle
                cx="90"
                cy="18"
                r={isBright ? 5.0 : 4.2}
                fill="#AEF830"
                opacity={isBright ? 1 : 0.85}
                className="transition-all duration-300"
              />
              <circle cx="88.8" cy="16.8" r="1.3" fill="#FFFFFF" opacity="0.85" />

              {/* Left Ear Module */}
              <rect
                x="35"
                y="54"
                width="11"
                height="26"
                rx="5"
                fill={`url(#metal-${uid})`}
                stroke="#2D453B"
                strokeWidth="1.2"
              />
              <line
                x1="39.5"
                y1="62"
                x2="39.5"
                y2="72"
                stroke="#AEF830"
                strokeOpacity={isBright ? 0.9 : 0.45}
                strokeWidth="1.6"
                strokeLinecap="round"
              />

              {/* Right Ear Module */}
              <rect
                x="134"
                y="54"
                width="11"
                height="26"
                rx="5"
                fill={`url(#metal-${uid})`}
                stroke="#2D453B"
                strokeWidth="1.2"
              />
              <line
                x1="140.5"
                y1="62"
                x2="140.5"
                y2="72"
                stroke="#AEF830"
                strokeOpacity={isBright ? 0.9 : 0.45}
                strokeWidth="1.6"
                strokeLinecap="round"
              />

              {/* Rounded Robot Head Shell */}
              <rect
                x="44"
                y="32"
                width="92"
                height="62"
                rx="22"
                fill={`url(#chassis-${uid})`}
                stroke={isBright ? '#3A6350' : `url(#rim-${uid})`}
                strokeWidth="1.5"
                className="transition-colors duration-300"
              />

              {/* Subtle Top Head Bevel Reflection */}
              <path
                d="M 60 36.5 L 120 36.5"
                stroke="#FFFFFF"
                strokeOpacity="0.16"
                strokeWidth="1.6"
                strokeLinecap="round"
              />

              {/* Recessed Dark Glass Digital Visor */}
              <rect
                x="53"
                y="42"
                width="74"
                height="43"
                rx="14"
                fill={`url(#visor-${uid})`}
                stroke={isBright ? '#2B5240' : '#203C30'}
                strokeWidth="1.3"
                className="transition-colors duration-300"
              />

              {/* Subtle Visor Corner Glint */}
              <path
                d="M 62 47 C 66 45.5, 72 45.5, 77 45.5"
                stroke="#FFFFFF"
                strokeOpacity="0.14"
                strokeWidth="1.4"
                strokeLinecap="round"
              />

              {/* Subtle Cute Cheek Glows on Hover / Active Response */}
              <ellipse
                cx="63"
                cy="72"
                rx="5.2"
                ry="2.6"
                fill="#AEF830"
                opacity={isHappy ? 0.34 : 0.08}
                className="transition-opacity duration-300"
              />
              <ellipse
                cx="117"
                cy="72"
                rx="5.2"
                ry="2.6"
                fill="#AEF830"
                opacity={isHappy ? 0.34 : 0.08}
                className="transition-opacity duration-300"
              />

              {/* Left Eye + Cursor-Tracking Pupil (strictly clipped inside eye boundary) */}
              <g ref={leftEyeBlinkRef}>
                <ellipse
                  cx="73"
                  cy="62"
                  rx="8.2"
                  ry="9.4"
                  fill={`url(#eye-iris-${uid})`}
                />
                <g clipPath={`url(#left-eye-clip-${uid})`}>
                  <g ref={leftPupilRef}>
                    <circle
                      cx="73"
                      cy="62"
                      r={botState === 'tapped' ? 3.5 : 4.2}
                      fill="#07130F"
                    />
                    <circle cx="74.6" cy="60.1" r="1.45" fill="#FFFFFF" />
                    <circle cx="71.4" cy="63.8" r="0.7" fill="#AEF830" opacity="0.9" />
                  </g>
                </g>
              </g>

              {/* Right Eye + Cursor-Tracking Pupil (strictly clipped inside eye boundary) */}
              <g ref={rightEyeBlinkRef}>
                <ellipse
                  cx="107"
                  cy="62"
                  rx="8.2"
                  ry="9.4"
                  fill={`url(#eye-iris-${uid})`}
                />
                <g clipPath={`url(#right-eye-clip-${uid})`}>
                  <g ref={rightPupilRef}>
                    <circle
                      cx="107"
                      cy="62"
                      r={botState === 'tapped' ? 3.5 : 4.2}
                      fill="#07130F"
                    />
                    <circle cx="108.6" cy="60.1" r="1.45" fill="#FFFFFF" />
                    <circle cx="105.4" cy="63.8" r="0.7" fill="#AEF830" opacity="0.9" />
                  </g>
                </g>
              </g>

              {/* Expressive Digital Mouth */}
              {botState === 'tapped' ? (
                <ellipse
                  cx="90"
                  cy="76.5"
                  rx="3.2"
                  ry="3.8"
                  fill="#07130F"
                  stroke="#AEF830"
                  strokeWidth="1.8"
                />
              ) : isHappy ? (
                <path
                  d="M 81.5 74 Q 90 82 98.5 74"
                  fill="none"
                  stroke="#AEF830"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M 85 75.5 Q 90 78.4 95 75.5"
                  fill="none"
                  stroke="#A6B4AC"
                  strokeOpacity="0.9"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              )}
            </g>
          </g>
        </svg>
      </div>

      {statusText && (
        <span className="mt-2 font-mono text-[11px] text-[#A6B4AC] tracking-tight text-center">
          {statusText}
        </span>
      )}
    </div>
  );
}
