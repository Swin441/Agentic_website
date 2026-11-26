import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
const DISPLAY = "'Inter Display', Inter, system-ui, sans-serif"
const BLUE = "#3B82F6"
const CHIP = "#2563EB"
const STATIC_T: Record<string, number> = {
    scan: 1.7,
    frame: 1.2,
    type: 2.6,
    ship: 3.6,
}
const PHRASES = [
    "Your website, built live by AI agents.",
    "Pricing that scales with your studio.",
    "A portfolio that ships itself.",
    "Launch week, minus the all-nighters.",
]

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const ease = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function useClock(active: boolean, fallback: number) {
    const [t, setT] = useState(fallback)
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!active) return
        let raf = 0
        let visible = true
        const start = performance.now()
        let io: IntersectionObserver | null = null
        if (ref.current && "IntersectionObserver" in window) {
            io = new IntersectionObserver((es) => {
                visible = es[0].isIntersecting
            })
            io.observe(ref.current)
        }
        const loop = (now: number) => {
            raf = requestAnimationFrame(loop)
            if (visible) setT(Math.max(0, (now - start) / 1000))
        }
        raf = requestAnimationFrame(loop)
        return () => {
            cancelAnimationFrame(raf)
            if (io) io.disconnect()
        }
    }, [active])
    return [t, ref] as const
}

function Cursor(props: {
    x: number
    y: number
    color: string
    name?: string
    scale?: number
    opacity?: number
}) {
    const { x, y, color, name, scale = 1, opacity = 1 } = props
    return (
        <div
            style={{
                position: "absolute",
                left: x,
                top: y,
                transform: "scale(" + scale + ")",
                transformOrigin: "0 0",
                pointerEvents: "none",
                zIndex: 5,
                opacity,
            }}
        >
            <svg
                width="13"
                height="18"
                viewBox="0 0 15 20"
                style={{
                    display: "block",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                }}
            >
                <path
                    d="M1 1L1 16.5L5.2 12.6L8.1 19L10.6 17.9L7.8 11.7L13.4 11.7Z"
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                />
            </svg>
            {name ? (
                <span
                    style={{
                        position: "absolute",
                        left: 10,
                        top: 15,
                        background: color,
                        color: "#0B0D10",
                        font: "700 9px Inter, sans-serif",
                        padding: "1px 6px",
                        borderRadius: 7,
                        whiteSpace: "nowrap",
                    }}
                >
                    {name}
                </span>
            ) : null}
        </div>
    )
}

function Chip(props: {
    children: React.ReactNode
    bg?: string
    style?: React.CSSProperties
}) {
    return (
        <span
            style={{
                display: "inline-block",
                background: props.bg || CHIP,
                color: "#FFFFFF",
                font: "600 9px " + MONO,
                padding: "2px 6px",
                borderRadius: 3,
                whiteSpace: "nowrap",
                ...props.style,
            }}
        >
            {props.children}
        </span>
    )
}

function Scan({ t }: { t: number }) {
    const p = (t % 4) / 4
    const active = Math.min(2, Math.floor(p * 3.2))
    const count = Math.round(216 * ease(clamp(p * 1.15)))
    const done = p > 0.86
    const cx = 16 + active * 56 + 24
    const thumbs = [0, 1, 2].map((i) => {
        const on = i === active && !done
        const seen = i < active || done
        return (
            <div
                key={i}
                style={{
                    position: "absolute",
                    left: 16 + i * 56,
                    top: 18,
                    width: 48,
                    height: 34,
                    borderRadius: 4,
                    background: "#1A1D23",
                    border:
                        "1px solid " +
                        (on ? BLUE : seen ? "#2F6BFF55" : "#262A33"),
                    overflow: "hidden",
                    boxShadow: on ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: 6,
                        top: 7,
                        width: 22,
                        height: 3,
                        borderRadius: 2,
                        background: "#3A3F4A",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: 6,
                        top: 14,
                        width: 30,
                        height: 3,
                        borderRadius: 2,
                        background: "#2A2E36",
                    }}
                />
                {on ? (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            width: 2,
                            left: ((p * 3.2) % 1) * 48,
                            background: BLUE,
                            boxShadow: "0 0 8px " + BLUE,
                        }}
                    />
                ) : null}
            </div>
        )
    })
    return (
        <>
            {thumbs}
            <div
                style={{
                    position: "absolute",
                    left: 16,
                    top: 64,
                    width: 150,
                    height: 5,
                    borderRadius: 3,
                    background: "#1E222A",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: clamp(p * 1.15) * 100 + "%",
                        height: "100%",
                        background: "#2A2E36",
                    }}
                />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 16,
                    top: 75,
                    width: 110,
                    height: 5,
                    borderRadius: 3,
                    background: "#1E222A",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: clamp(p * 1.4 - 0.2) * 100 + "%",
                        height: "100%",
                        background: "#2A2E36",
                    }}
                />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 16,
                    top: 92,
                    font: "500 11px " + MONO,
                    color: done ? "#34D399" : BLUE,
                    whiteSpace: "nowrap",
                }}
            >
                {done
                    ? "plan ready · 216 layers"
                    : "scanning · " + count + " layers"}
            </div>
            <Cursor
                x={lerp(cx - 30, cx + 6, 0.5 + 0.5 * Math.sin(t * 3))}
                y={40}
                color="#FF5C8A"
                name="Ari"
            />
        </>
    )
}

function Frame({ t }: { t: number }) {
    const a = (t * Math.PI * 2) / 4
    const w = Math.round(150 + 40 * Math.sin(a))
    const h = Math.round(56 + 14 * Math.sin(a + 0.7))
    const W = Math.round((w * 6.4) / 8) * 8
    const H = Math.round((h * 11.4) / 8) * 8
    const handles = [
        [0, 0],
        [w, 0],
        [0, h],
        [w, h],
    ].map((c, i) => (
        <div
            key={i}
            style={{
                position: "absolute",
                left: c[0] - 3.5,
                top: c[1] - 3.5,
                width: 7,
                height: 7,
                background: "#FFFFFF",
                border: "1px solid " + BLUE,
                boxSizing: "border-box",
            }}
        />
    ))
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: 16,
                    top: 16,
                    width: w,
                    height: h,
                    border: "1px solid " + BLUE,
                    background: "rgba(47,107,255,0.06)",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: 8,
                        top: 8,
                        width: Math.max(20, w * 0.45),
                        height: 4,
                        borderRadius: 2,
                        background: "rgba(233,235,239,0.75)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: 8,
                        top: 16,
                        width: Math.max(16, w * 0.32),
                        height: 4,
                        borderRadius: 2,
                        background: "rgba(233,235,239,0.75)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: 8,
                        top: 27,
                        width: Math.max(20, w * 0.6),
                        height: 3,
                        borderRadius: 2,
                        background: "#3A3F4A",
                    }}
                />
                {handles}
            </div>
            <div style={{ position: "absolute", left: 16, top: 16 + h + 9 }}>
                <Chip>{W + " × " + H}</Chip>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 16 + w + 1,
                    top: 0,
                    bottom: 0,
                    width: 0,
                    borderLeft: "1px dashed rgba(59,130,246,0.35)",
                }}
            />
            <Cursor x={16 + w - 1} y={16 + h - 1} color="#34D399" name="Bex" />
        </>
    )
}

function Type({ t, live }: { t: number; live: boolean }) {
    const tl = PHRASES.map((s) => ({
        s,
        type: s.length * 0.055,
        hold: 1.5,
        erase: s.length * 0.022,
        gap: 0.35,
    }))
    const total = tl.reduce((n, x) => n + x.type + x.hold + x.erase + x.gap, 0)
    let r = t % total
    let text = ""
    let blink = false
    for (const x of tl) {
        const d = x.type + x.hold + x.erase + x.gap
        if (r < d) {
            if (r < x.type)
                text = x.s.slice(0, Math.ceil((r / x.type) * x.s.length))
            else if (r < x.type + x.hold) {
                text = x.s
                blink = true
            } else if (r < x.type + x.hold + x.erase)
                text = x.s.slice(
                    0,
                    Math.floor(
                        (1 - (r - x.type - x.hold) / x.erase) * x.s.length
                    )
                )
            else {
                text = ""
                blink = true
            }
            break
        }
        r -= d
    }
    const caretOn = !blink || Math.sin(t * 9) > -0.2 || !live
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: 16,
                    top: 16,
                    right: 30,
                    font: "600 18px/1.25 " + DISPLAY,
                    letterSpacing: "-0.03em",
                    color: "#F2F3F5",
                }}
            >
                {text}
                <span
                    style={{
                        position: "relative",
                        display: "inline-block",
                        width: 2,
                        height: 20,
                        marginLeft: 1,
                        verticalAlign: "-3px",
                        background: "#FACC15",
                        opacity: caretOn ? 1 : 0,
                    }}
                >
                    <span
                        style={{
                            position: "absolute",
                            left: 6,
                            top: 14,
                            background: "#FACC15",
                            color: "#0B0D10",
                            font: "700 9px Inter, sans-serif",
                            padding: "1px 6px",
                            borderRadius: 7,
                            whiteSpace: "nowrap",
                            letterSpacing: 0,
                        }}
                    >
                        Dot
                    </span>
                </span>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 16,
                    bottom: 26,
                    width: 160,
                    height: 5,
                    borderRadius: 3,
                    background: "#2A2E36",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: 16,
                    bottom: 15,
                    width: 120,
                    height: 5,
                    borderRadius: 3,
                    background: "#2A2E36",
                }}
            />
        </>
    )
}

function Ship({ t }: { t: number }) {
    const s = t % 5.2
    const bx = 16,
        by = 22,
        bw = 104,
        bh = 30
    const target = { x: bx + bw * 0.55, y: by + bh * 0.55 }
    const inP = ease(seg(s, 0.2, 1.4))
    const outP = ease(seg(s, 4.4, 5.1))
    let cx = lerp(210, target.x, inP)
    let cy = lerp(118, target.y, inP)
    if (s > 4.4) {
        cx = lerp(target.x, 200, outP)
        cy = lerp(target.y, 112, outP)
    }
    const pressed = s > 1.4 && s < 1.65
    const publishing = s >= 1.6 && s < 3.1
    const published = s >= 3.1
    const prog = seg(s, 1.6, 3.1)
    const label = published
        ? "Published"
        : publishing
          ? "Publishing…"
          : "Publish"
    const bg = published ? "#16A34A" : publishing ? "#2558D9" : "#2F6BFF"
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: bx,
                    top: by,
                    width: bw,
                    height: bh,
                    borderRadius: 7,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    color: "#FFFFFF",
                    font: "600 12px Inter, sans-serif",
                    transform: "scale(" + (pressed ? 0.93 : 1) + ")",
                    transition: "transform 0.12s, background 0.25s",
                    boxShadow: pressed
                        ? "none"
                        : "0 2px 10px rgba(47,107,255,0.35)",
                }}
            >
                {published ? (
                    <svg width="11" height="11" viewBox="0 0 12 12">
                        <path
                            d="M2 6.5L5 9L10 3"
                            stroke="#FFFFFF"
                            strokeWidth="1.8"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                ) : null}
                {label}
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 16,
                    top: 66,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    font: "500 11px " + MONO,
                    color: published ? "#C9CDD4" : "#6F7684",
                    whiteSpace: "nowrap",
                }}
            >
                <span
                    style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        background: published
                            ? "#34D399"
                            : publishing
                              ? "#FACC15"
                              : "#4A505C",
                        boxShadow: published ? "0 0 8px #34D399" : "none",
                    }}
                />
                {published
                    ? "live · yoursite.framer.app"
                    : publishing
                      ? "deploying · 3 pages"
                      : "draft · yoursite.framer.app"}
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 16,
                    top: 88,
                    width: 150,
                    height: 3,
                    borderRadius: 2,
                    background: "#1E222A",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: (published ? 1 : prog) * 100 + "%",
                        background: published ? "#34D399" : BLUE,
                    }}
                />
            </div>
            <Cursor
                x={cx}
                y={cy}
                color="#FBBF24"
                name="Neo"
                scale={pressed ? 0.88 : 1}
            />
        </>
    )
}

interface Props {
    mode?: "scan" | "frame" | "type" | "ship"
    style?: React.CSSProperties
}

/**
 * Animated mini visual for the process cards.
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function StepVisual(props: Props) {
    const mode = props.mode || "type"
    const live =
        RenderTarget.current() !== RenderTarget.canvas &&
        RenderTarget.current() !== RenderTarget.thumbnail
    const [t, ref] = useClock(live, STATIC_T[mode] || 1)
    return (
        <div
            ref={ref}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: 120,
                overflow: "hidden",
                ...props.style,
            }}
        >
            {mode === "scan" ? (
                <Scan t={t} />
            ) : mode === "frame" ? (
                <Frame t={t} />
            ) : mode === "ship" ? (
                <Ship t={t} />
            ) : (
                <Type t={t} live={live} />
            )}
        </div>
    )
}

addPropertyControls(StepVisual, {
    mode: {
        type: ControlType.Enum,
        title: "Mode",
        options: ["scan", "frame", "type", "ship"],
        optionTitles: ["Scan", "Frame", "Type", "Ship"],
        defaultValue: "type",
    },
})
