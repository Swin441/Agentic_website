import {
    forwardRef,
    useEffect,
    useRef,
    useState,
    type ComponentType,
} from "react"

// Hides the navigation while scrolling down and brings it back on scroll up.
export function withHideOnScroll(
    Component: ComponentType<any>
): ComponentType<any> {
    return forwardRef<any, any>(function HideOnScroll(props, ref) {
        const [hidden, setHidden] = useState(false)
        const last = useRef(0)
        useEffect(() => {
            if (typeof window === "undefined") return
            last.current = window.scrollY
            let raf = 0
            const check = () => {
                raf = 0
                const y = window.scrollY
                const d = y - last.current
                if (y < 80) {
                    setHidden(false)
                    last.current = y
                    return
                }
                if (Math.abs(d) < 8) return
                setHidden(d > 0)
                last.current = y
            }
            const onScroll = () => {
                if (!raf) raf = requestAnimationFrame(check)
            }
            window.addEventListener("scroll", onScroll, { passive: true })
            return () => {
                window.removeEventListener("scroll", onScroll)
                if (raf) cancelAnimationFrame(raf)
            }
        }, [])
        const { style, ...rest } = props
        return (
            <Component
                {...rest}
                ref={ref}
                style={{ ...style }}
                initial={false}
                animate={{ y: hidden ? "-110%" : "0%" }}
                transition={{
                    type: "tween",
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                }}
            />
        )
    })
}
