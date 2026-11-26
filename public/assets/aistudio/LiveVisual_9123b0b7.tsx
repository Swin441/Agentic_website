import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
const DISPLAY = "'Inter Display', Inter, system-ui, sans-serif"
const BLUE = "#3B82F6"
const CHIP = "#2563EB"

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

function Handles({ w, h }: { w: number; h: number }) {
    return (
        <>
            {[
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
            ))}
        </>
    )
}

/* ---------------- editor ---------------- */
const LOG2: [string, string, string][] = [
    ["#34D399", "Bex", "framed Hero · 1200 × 640"],
    ["#FACC15", "Dot", "typed Headline · 30 chars"],
    ["#A78BFA", "Fox", "set Stack gap → 24"],
    ["#FF5C8A", "Ari", "queued Publish · cursorswarm.site"],
    ["#2DD4BF", "Hex", "linked Button variants"],
    ["#F472B6", "Lyn", "wrote meta description"],
]
const bar = (w: number, h: number, bg: string): React.CSSProperties => ({
    width: w,
    height: h,
    borderRadius: 3,
    background: bg,
    flexShrink: 0,
})

function Editor({ t }: { t: number }) {
    const step = Math.floor(t / 2.4)
    const local = (t % 2.4) / 2.4
    const shift = ease(seg(local, 0.75, 1))
    const rows = [0, 1, 2, 3, 4].map((i) => LOG2[(step + i) % LOG2.length])
    const caretOn = Math.sin(t * 6) > -0.2
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                width: "100%",
                height: "100%",
            }}
        >
            <div
                style={{
                    width: 460,
                    height: 290,
                    borderRadius: 10,
                    background: "#111318",
                    border: "1px solid #232733",
                    boxSizing: "border-box",
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={bar(12, 12, "#2A2E36")} />
                    <div style={{ display: "flex", gap: 6 }}>
                        <div style={bar(22, 5, "#2A2E36")} />
                        <div style={bar(22, 5, "#2A2E36")} />
                        <div style={bar(22, 5, "#2A2E36")} />
                    </div>
                </div>
                <div
                    style={{
                        position: "relative",
                        flex: 1,
                        borderRadius: 6,
                        border: "1px solid " + BLUE,
                        background: "rgba(47,107,255,0.05)",
                        boxSizing: "border-box",
                        padding: 20,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 8,
                    }}
                >
                    <div style={{ position: "absolute", right: 8, top: 8 }}>
                        <Chip>Hero · 1200 × 640</Chip>
                    </div>
                    <div style={bar(230, 13, "rgba(233,235,239,0.85)")} />
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <div style={bar(160, 13, "rgba(233,235,239,0.85)")} />
                        <div
                            style={{
                                width: 2,
                                height: 17,
                                background: "#FACC15",
                                opacity: caretOn ? 1 : 0,
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                            paddingTop: 6,
                        }}
                    >
                        <div style={bar(260, 5, "#3A3F4A")} />
                        <div style={bar(236, 5, "#3A3F4A")} />
                        <div style={bar(190, 5, "#3A3F4A")} />
                    </div>
                    <div style={{ display: "flex", gap: 6, paddingTop: 6 }}>
                        <div style={bar(56, 16, "#E9EBEF")} />
                        <div
                            style={{
                                ...bar(56, 16, "transparent"),
                                border: "1px solid #3A3F4A",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>
                </div>
            </div>
            <div
                style={{
                    width: 460,
                    borderRadius: 10,
                    background: "#111318",
                    border: "1px solid #232733",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    flexShrink: 0,
                }}
            >
                <div style={{ height: 79, overflow: "hidden" }}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            transform: "translateY(" + -shift * 22 + "px)",
                        }}
                    >
                        {rows.map((r, i) => (
                            <div
                                key={step + "-" + i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    height: 14,
                                    font: "500 11px " + MONO,
                                    whiteSpace: "nowrap",
                                    opacity:
                                        i === 0
                                            ? 1 - shift
                                            : i === 4
                                              ? shift
                                              : 1,
                                }}
                            >
                                <span
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: 3,
                                        background: r[0],
                                        flexShrink: 0,
                                    }}
                                />
                                <span style={{ color: "#F2F3F5" }}>{r[1]}</span>
                                <span style={{ color: "#8B919C" }}>{r[2]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ---------------- breakpoints ---------------- */
function Breakpoints({ t }: { t: number }) {
    const active = Math.floor((t % 6) / 2)
    const local = (t % 2) / 2
    const devs = [
        { w: 260, h: 130, l: "Desktop · 1440" },
        { w: 120, h: 130, l: "Tablet · 810" },
        { w: 64, h: 118, l: "Phone · 390" },
    ]
    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                gap: 18,
                width: "100%",
                height: "100%",
                paddingBottom: 18,
                boxSizing: "border-box",
            }}
        >
            {devs.map((d, i) => {
                const on = i === active
                const g = on ? ease(seg(local, 0.08, 0.6)) : 1
                return (
                    <div
                        key={i}
                        style={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                width: d.w,
                                height: d.h,
                                borderRadius: 6,
                                background: "#111318",
                                border: "1px solid " + (on ? BLUE : "#232733"),
                                boxShadow: on
                                    ? "0 0 0 4px rgba(59,130,246,0.12)"
                                    : "none",
                                boxSizing: "border-box",
                                padding: 8,
                                overflow: "hidden",
                                transition:
                                    "border-color 0.3s, box-shadow 0.3s",
                            }}
                        >
                            <div
                                style={{
                                    width: "40%",
                                    height: 6,
                                    borderRadius: 3,
                                    background: "rgba(233,235,239,0.8)",
                                    marginBottom: 5,
                                }}
                            />
                            <div
                                style={{
                                    width: (on ? 70 * g : 70) + "%",
                                    height: 6,
                                    borderRadius: 3,
                                    background: "rgba(233,235,239,0.8)",
                                    marginBottom: 5,
                                }}
                            />
                            <div
                                style={{
                                    width: "85%",
                                    height: 3,
                                    borderRadius: 2,
                                    background: "#3A3F4A",
                                    marginBottom: 6,
                                }}
                            />
                            <div
                                style={{
                                    width: (on ? 100 * g : 100) + "%",
                                    height: d.h - 52,
                                    borderRadius: 4,
                                    border:
                                        "1px solid " + (on ? BLUE : "#2A2E36"),
                                    background: on
                                        ? "rgba(47,107,255,0.08)"
                                        : "transparent",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <span
                            style={{
                                font: "500 11px " + MONO,
                                color: on ? "#F2F3F5" : "#5F6673",
                                transition: "color 0.3s",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {d.l}
                        </span>
                        {on ? (
                            <Cursor
                                x={d.w - 18 + 4 * Math.sin(t * 4)}
                                y={d.h - 30}
                                color="#FB923C"
                                name="Eon"
                            />
                        ) : null}
                    </div>
                )
            })}
        </div>
    )
}

/* ---------------- cms ---------------- */
const TITLES = ["Agent memory", "Smarter grids", "Live branches", "Token sync"]
const DATES = ["Nov 07", "Oct 28", "Oct 14", "Sep 30"]
function Cms({ t }: { t: number }) {
    const k = Math.floor(t / 4)
    const local = (t % 4) / 4
    const slide = 1 - ease(seg(local, 0, 0.12))
    const typedT = TITLES[k % 4].slice(
        0,
        Math.ceil(TITLES[k % 4].length * seg(local, 0.12, 0.45))
    )
    const slug = typedT.toLowerCase().split(" ").join("-")
    const rows = [0, 1, 2].map((j) => ({
        title: j === 0 ? typedT : TITLES[(k - j + 400) % 4],
        slug:
            j === 0
                ? slug
                : TITLES[(k - j + 400) % 4].toLowerCase().split(" ").join("-"),
        date: j === 0 ? (local > 0.45 ? DATES[0] : "") : DATES[j],
    }))
    const cell = (txt: string, color: string, key: string) => (
        <span
            key={key}
            style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color,
            }}
        >
            {txt}
        </span>
    )
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                font: "500 11px " + MONO,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: 10,
                    padding: "9px 16px",
                    borderBottom: "1px solid #1E222A",
                    color: "#5F6673",
                }}
            >
                {cell("title", "#5F6673", "a")}
                {cell("slug", "#5F6673", "b")}
                {cell("date", "#5F6673", "c")}
            </div>
            <div style={{ height: 96, overflow: "hidden" }}>
                <div style={{ transform: "translateY(" + -32 * slide + "px)" }}>
                    {rows.map((r, j) => (
                        <div
                            key={j}
                            style={{
                                position: "relative",
                                display: "flex",
                                gap: 10,
                                padding: "9px 16px",
                                height: 32,
                                boxSizing: "border-box",
                                borderBottom:
                                    j < 2 ? "1px solid #1E222A" : "none",
                                background:
                                    j === 0
                                        ? "rgba(52,211,153," +
                                          0.08 * (1 - seg(local, 0.6, 0.95)) +
                                          ")"
                                        : "transparent",
                            }}
                        >
                            {cell(
                                r.title +
                                    (j === 0 &&
                                    local < 0.45 &&
                                    Math.sin(t * 10) > 0
                                        ? "|"
                                        : ""),
                                "#F2F3F5",
                                "a"
                            )}
                            {cell(r.slug, "#8B919C", "b")}
                            {cell(r.date, "#8B919C", "c")}
                            {j === 0 && local > 0.45 ? (
                                <span
                                    style={{
                                        position: "absolute",
                                        right: 12,
                                        top: 8,
                                        opacity: 1 - seg(local, 0.85, 1),
                                    }}
                                >
                                    <Chip bg="#16A34A">new</Chip>
                                </span>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ---------------- components ---------------- */
function Components({ t }: { t: number }) {
    const s = t % 4
    const hover = s > 1 && s < 3.1
    const pressed = s > 1.9 && s < 2.25
    const state = pressed ? 2 : hover ? 1 : 0
    const cx =
        s < 1
            ? lerp(190, 84, ease(seg(s, 0.2, 1)))
            : s > 3.1
              ? lerp(84, 190, ease(seg(s, 3.1, 3.9)))
              : 84
    const cy =
        s < 1
            ? lerp(70, 22, ease(seg(s, 0.2, 1)))
            : s > 3.1
              ? lerp(22, 70, ease(seg(s, 3.1, 3.9)))
              : 22
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
            }}
        >
            <div style={{ position: "relative", width: 132, height: 38 }}>
                <div
                    style={{
                        width: 132,
                        height: 38,
                        borderRadius: 8,
                        background: hover ? "#FFFFFF" : "#E9EBEF",
                        color: "#0B0D10",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        font: "500 13px Inter, sans-serif",
                        transform:
                            "scale(" +
                            (pressed ? 0.95 : hover ? 1.03 : 1) +
                            ")",
                        boxShadow: hover
                            ? "0 6px 20px rgba(255,255,255,0.12)"
                            : "none",
                        transition: "all 0.18s",
                    }}
                >
                    Get started
                </div>
                <div
                    style={{
                        position: "absolute",
                        left: -6,
                        top: -6,
                        right: -6,
                        bottom: -6,
                        border: "1px dashed rgba(59,130,246,0.6)",
                        borderRadius: 4,
                    }}
                />
                <Cursor
                    x={cx}
                    y={cy}
                    color="#2DD4BF"
                    name="Hex"
                    scale={pressed ? 0.88 : 1}
                />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
                {["Default", "Hover", "Pressed"].map((v, i) => (
                    <span
                        key={v}
                        style={{
                            font: "600 10px " + MONO,
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: state === i ? CHIP : "#1A1D23",
                            color: state === i ? "#FFFFFF" : "#6F7684",
                            transition: "all 0.2s",
                        }}
                    >
                        {v}
                    </span>
                ))}
            </div>
        </div>
    )
}

/* ---------------- tokens ---------------- */
const ACCENTS = ["#2F6BFF", "#FF4D9E", "#34D399", "#FACC15"]
function Tokens({ t }: { t: number }) {
    const idx = Math.floor(t / 1.8) % 4
    const local = t % 1.8
    const acc = ACCENTS[idx]
    const rows: [string, string][] = [
        ["Background", "#0B0D10"],
        ["Text", "#F2F3F5"],
        ["Muted", "#8B919C"],
        ["Accent", acc],
    ]
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "0 18px",
                boxSizing: "border-box",
                font: "500 11px " + MONO,
            }}
        >
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                }}
            >
                {rows.map(([n, c], i) => (
                    <div
                        key={n}
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                        }}
                    >
                        <span
                            style={{
                                width: 15,
                                height: 15,
                                borderRadius: 4,
                                background: c,
                                border: "1px solid #3A3F4A",
                                transition: "background 0.4s",
                                flexShrink: 0,
                            }}
                        />
                        <span style={{ color: "#F2F3F5", flex: 1 }}>{n}</span>
                        <span
                            style={{ color: i === 3 ? "#F2F3F5" : "#5F6673" }}
                        >
                            {c.toUpperCase()}
                        </span>
                        {i === 3 ? (
                            <Cursor
                                x={6}
                                y={7}
                                color="#A78BFA"
                                name="Fox"
                                scale={local < 0.18 ? 0.86 : 1}
                            />
                        ) : null}
                    </div>
                ))}
            </div>
            <div
                style={{
                    position: "relative",
                    width: 104,
                    height: 104,
                    borderRadius: 8,
                    background: "#111318",
                    border: "1px solid #232733",
                    padding: 10,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        width: "70%",
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(233,235,239,0.8)",
                    }}
                />
                <div
                    style={{
                        width: "90%",
                        height: 3,
                        borderRadius: 2,
                        background: "#3A3F4A",
                    }}
                />
                <div
                    style={{
                        width: "60%",
                        height: 3,
                        borderRadius: 2,
                        background: "#3A3F4A",
                    }}
                />
                <div
                    style={{
                        marginTop: "auto",
                        height: 18,
                        borderRadius: 4,
                        background: acc,
                        transition: "background 0.4s",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: 10,
                        top: 34,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        background: acc,
                        transition: "background 0.4s",
                    }}
                />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 18,
                    bottom: 10,
                    opacity: local < 1.1 ? 1 - seg(local, 0.8, 1.1) : 0,
                }}
            >
                <Chip>1 edit · 48 layers updated</Chip>
            </div>
        </div>
    )
}

/* ---------------- seo ---------------- */
const PAGES: [string, string][] = [
    ["yourstudio.com › pricing", "Pricing — Your Studio"],
    ["yourstudio.com › agents", "Meet the crew — Your Studio"],
]
function Seo({ t }: { t: number }) {
    const k = Math.floor(t / 4) % 2
    const local = (t % 4) / 4
    const [url, title] = PAGES[k]
    const typed = title.slice(
        0,
        Math.ceil(title.length * seg(local, 0.05, 0.4))
    )
    const d1 = seg(local, 0.35, 0.6)
    const d2 = seg(local, 0.5, 0.75)
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                padding: "18px 20px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 6,
            }}
        >
            <span style={{ font: "500 11px " + MONO, color: "#34D399" }}>
                {url}
            </span>
            <span
                style={{
                    font: "500 16px Inter, sans-serif",
                    color: "#8AB4FF",
                    whiteSpace: "nowrap",
                }}
            >
                {typed}
                <span
                    style={{
                        opacity: local < 0.4 && Math.sin(t * 10) > 0 ? 1 : 0,
                        color: "#F472B6",
                    }}
                >
                    |
                </span>
            </span>
            <div
                style={{
                    width: 100 * d1 + "%",
                    height: 5,
                    borderRadius: 3,
                    background: "#2A2E36",
                }}
            />
            <div
                style={{
                    width: 80 * d2 + "%",
                    height: 5,
                    borderRadius: 3,
                    background: "#2A2E36",
                }}
            />
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    paddingTop: 8,
                }}
            >
                <div
                    style={{
                        width: 54,
                        height: 30,
                        borderRadius: 4,
                        border: "1px solid " + BLUE,
                        background:
                            "linear-gradient(110deg, rgba(47,107,255,0.15) 30%, rgba(167,139,250,0.55) 50%, rgba(47,107,255,0.15) 70%)",
                        backgroundSize: "250% 100%",
                        backgroundPosition: 100 - ((t * 40) % 200) + "% 0",
                    }}
                />
                <span style={{ font: "500 11px " + MONO, color: "#6F7684" }}>
                    {"title " + typed.length + "/60 · og:image ✓"}
                </span>
            </div>
            <Cursor
                x={22 + Math.min(typed.length, 30) * 7.2}
                y={60}
                color="#F472B6"
                name="Lyn"
                opacity={local < 0.45 ? 1 : 1 - seg(local, 0.45, 0.55)}
            />
        </div>
    )
}

/* ---------------- meter ---------------- */
function Meter({
    t,
    value,
    unit,
    color,
    decimals,
}: {
    t: number
    value: number
    unit: string
    color: string
    decimals: number
}) {
    const v =
        value *
        (1 + 0.06 * Math.sin(t * 1.3 + value) + 0.02 * Math.sin(t * 4.1))
    const txt = v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(decimals)
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 8,
                width: "100%",
                height: "100%",
                font: "500 11px " + MONO,
                color: "#F2F3F5",
                whiteSpace: "nowrap",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 2,
                    height: 12,
                }}
            >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <span
                        key={i}
                        style={{
                            width: 3,
                            borderRadius: 1,
                            background: color,
                            opacity: 0.35 + 0.65 * (i / 7),
                            height:
                                3 +
                                9 *
                                    (0.5 +
                                        0.5 *
                                            Math.sin(t * 3 + i * 0.9 + value)),
                        }}
                    />
                ))}
            </div>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {txt + " " + unit}
            </span>
        </div>
    )
}

function PhaseView({ t, idx }: { t: number; idx: number }) {
    const local = t % 9
    const p = clamp((local - idx * 1.6) / 1.6)
    const status =
        p <= 0
            ? "queued"
            : p >= 1
              ? "done ✓"
              : "running " + Math.round(p * 100) + "%"
    const col = p <= 0 ? "#5F6673" : p >= 1 ? "#34D399" : "#F2F3F5"
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                height: "100%",
            }}
        >
            <div
                style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: "#1E222A",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: p * 100 + "%",
                        height: "100%",
                        borderRadius: 2,
                        background:
                            "linear-gradient(90deg, #6D28D9 0%, #2F6BFF 55%, #C026D3 100%)",
                    }}
                />
            </div>
            <span
                style={{
                    width: 92,
                    textAlign: "right",
                    font: "500 11px " + MONO,
                    color: col,
                    whiteSpace: "nowrap",
                }}
            >
                {status}
            </span>
        </div>
    )
}

const RING = ["#FF5C8A", "#34D399", "#38BDF8", "#FACC15", "#A78BFA", "#FB923C"]
function ReleaseView({ t }: { t: number }) {
    const s = t % 4
    const op =
        s < 0.6
            ? 1
            : s < 1.4
              ? 1 - seg(s, 0.6, 1.4)
              : s > 3.3
                ? seg(s, 3.3, 3.9)
                : 0
    const chip = s > 0.5 && s < 2.2 ? 1 - seg(s, 1.8, 2.2) : 0
    const cx = 210,
        cy = 74,
        R = 30
    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div
                style={{
                    position: "absolute",
                    left: 20,
                    top: 34,
                    width: 120,
                    height: 70,
                    border: "1px solid " + BLUE,
                    background: "rgba(47,107,255,0.06)",
                    boxSizing: "border-box",
                    opacity: op,
                }}
            >
                <Handles w={120} h={70} />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 20,
                    top: 34,
                    width: 120,
                    height: 70,
                    borderRadius: 4,
                    background: "rgba(233,235,239,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: 12,
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        width: 70,
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(233,235,239,0.8)",
                    }}
                />
                <div
                    style={{
                        width: 90,
                        height: 4,
                        borderRadius: 2,
                        background: "#3A3F4A",
                    }}
                />
                <div
                    style={{
                        width: 60,
                        height: 4,
                        borderRadius: 2,
                        background: "#3A3F4A",
                    }}
                />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 20,
                    top: 112,
                    opacity: chip,
                }}
            >
                <Chip bg="#16A34A">released</Chip>
            </div>
            {RING.map((c, i) => {
                const a = t * 0.9 + (i / RING.length) * Math.PI * 2
                return (
                    <Cursor
                        key={i}
                        x={cx + Math.cos(a) * R}
                        y={cy + Math.sin(a) * R}
                        color={c}
                    />
                )
            })}
        </div>
    )
}

function CounterView({
    p,
    value,
    from,
    decimals,
    unit,
    fs,
}: {
    p: number
    value: number
    from: number
    decimals: number
    unit: string
    fs: number
}) {
    const e = 1 - Math.pow(1 - p, 3)
    const v = from + (value - from) * e
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: "100%",
                font: "600 " + fs + "px/1 " + DISPLAY,
                letterSpacing: "-0.05em",
                color: "#F2F3F5",
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
            }}
        >
            {v.toFixed(decimals) + unit}
        </div>
    )
}

interface Props {
    from?: number
    mode?: string
    value?: number
    unit?: string
    color?: string
    decimals?: number
    style?: React.CSSProperties
}

/**
 * Live animated visuals for cards (editor, breakpoints, cms, components, tokens, seo, meter).
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function LiveVisual(props: Props) {
    const mode = props.mode || "editor"
    const live =
        RenderTarget.current() !== RenderTarget.canvas &&
        RenderTarget.current() !== RenderTarget.thumbnail
    const [t, ref] = useClock(live, mode === "editor" ? 7.5 : 2.6)
    const startRef = useRef(-1)
    const [box, setBox] = useState({ w: 0, h: 0 })
    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((es) => {
            const r = es[0].contentRect
            setBox({ w: r.width, h: r.height })
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])
    let countP = live ? 0 : 1
    if (mode === "counter" && live) {
        const el = ref.current
        if (startRef.current < 0 && el && !el.closest("[data-swarm]")) {
            const r = el.getBoundingClientRect()
            if (r.top < window.innerHeight * 0.92 && r.bottom > 0)
                startRef.current = t
        }
        countP = startRef.current < 0 ? 0 : clamp((t - startRef.current) / 1.8)
    }
    let body: React.ReactNode = null
    if (mode === "editor") body = Editor({ t })
    else if (mode === "breakpoints") body = Breakpoints({ t })
    else if (mode === "cms") body = Cms({ t })
    else if (mode === "components") body = Components({ t })
    else if (mode === "tokens") body = Tokens({ t })
    else if (mode === "seo") body = Seo({ t })
    else if (mode === "phase") body = PhaseView({ t, idx: props.value ?? 0 })
    else if (mode === "release") body = ReleaseView({ t })
    else if (mode === "counter")
        body = CounterView({
            fs:
                box.w > 0
                    ? Math.max(
                          28,
                          Math.min(
                              56,
                              box.w /
                                  ((
                                      (props.value ?? 100).toFixed(
                                          props.decimals ?? 0
                                      ) + (props.unit ?? "")
                                  ).length *
                                      0.56)
                          )
                      )
                    : 56,
            p: countP,
            value: props.value ?? 100,
            from: props.from ?? 0,
            decimals: props.decimals ?? 0,
            unit: props.unit ?? "",
        })
    else
        body = Meter({
            t,
            value: props.value ?? 100,
            unit: props.unit ?? "",
            color: props.color || BLUE,
            decimals: props.decimals ?? 0,
        })
    const NAT: Record<string, number> = {
        editor: 490,
        breakpoints: 520,
        tokens: 300,
        seo: 300,
        release: 280,
    }
    const nat = NAT[mode]
    const s = nat && box.w > 0 && box.w < nat ? box.w / nat : 1
    const inner =
        s < 1 ? (
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: nat,
                    height: box.h / s,
                    transform: "translate(-50%, -50%) scale(" + s + ")",
                    transformOrigin: "50% 50%",
                }}
            >
                {body}
            </div>
        ) : (
            body
        )
    return (
        <div
            ref={ref}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: mode === "meter" ? "visible" : "hidden",
                ...props.style,
            }}
        >
            {inner}
        </div>
    )
}

addPropertyControls(LiveVisual, {
    mode: {
        type: ControlType.Enum,
        title: "Mode",
        options: [
            "editor",
            "breakpoints",
            "cms",
            "components",
            "tokens",
            "seo",
            "meter",
            "counter",
            "phase",
            "release",
        ],
        optionTitles: [
            "Editor",
            "Breakpoints",
            "CMS",
            "Components",
            "Tokens",
            "SEO",
            "Meter",
            "Counter",
            "Phase",
            "Release",
        ],
        defaultValue: "editor",
    },
    value: {
        type: ControlType.Number,
        title: "Value",
        defaultValue: 100,
        min: 0,
        max: 100000,
        step: 0.1,
        hidden: (p: any) =>
            p.mode !== "meter" && p.mode !== "counter" && p.mode !== "phase",
    },
    unit: {
        type: ControlType.String,
        title: "Unit",
        defaultValue: "/ min",
        hidden: (p: any) =>
            p.mode !== "meter" && p.mode !== "counter" && p.mode !== "phase",
    },
    color: {
        type: ControlType.Color,
        title: "Color",
        defaultValue: "#3B82F6",
        hidden: (p: any) =>
            p.mode !== "meter" && p.mode !== "counter" && p.mode !== "phase",
    },
    from: {
        type: ControlType.Number,
        title: "From",
        defaultValue: 0,
        min: 0,
        max: 100000,
        step: 0.1,
        hidden: (p: any) => p.mode !== "counter",
    },
    decimals: {
        type: ControlType.Number,
        title: "Decimals",
        defaultValue: 0,
        min: 0,
        max: 2,
        step: 1,
        hidden: (p: any) =>
            p.mode !== "meter" && p.mode !== "counter" && p.mode !== "phase",
    },
})
