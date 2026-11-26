import { forwardRef, useSyncExternalStore, type ComponentType } from "react"

// Shared billing state for the Pricing page. Yearly = 20% off, matching the "-20%" chip.
type Billing = { yearly: boolean; touched: boolean }
let state: Billing = { yearly: false, touched: false }
const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
}
const getState = () => state
const setState = (patch: Partial<Billing>) => {
    state = { ...state, ...patch }
    listeners.forEach((fn) => fn())
}
function useBilling(): [Billing, (p: Partial<Billing>) => void] {
    return [useSyncExternalStore(subscribe, getState, getState), setState]
}
const DISCOUNT = 0.8

function pill(active: boolean, style: any) {
    return {
        ...style,
        cursor: "pointer",
        backgroundColor: active
            ? "var(--token-gC336m1ca, #15181E)"
            : "rgba(0,0,0,0)",
        boxShadow: active
            ? "inset 0 0 0 1px #2A2E36"
            : "inset 0 0 0 1px rgba(0,0,0,0)",
        opacity: active ? 1 : 0.6,
        transition: "background-color 0.2s, box-shadow 0.2s, opacity 0.2s",
    }
}

export function withMonthly(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function Monthly(props, ref) {
        const [s, set] = useBilling()
        const { style, ...rest } = props
        return (
            <Component
                {...rest}
                ref={ref}
                style={pill(!s.yearly, style)}
                role="button"
                aria-pressed={!s.yearly}
                onClick={() => set({ yearly: false, touched: true })}
            />
        )
    })
}

export function withYearly(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function Yearly(props, ref) {
        const [s, set] = useBilling()
        const { style, ...rest } = props
        return (
            <Component
                {...rest}
                ref={ref}
                style={pill(s.yearly, style)}
                role="button"
                aria-pressed={s.yearly}
                onClick={() => set({ yearly: true, touched: true })}
            />
        )
    })
}

// On a LiveVisual counter: shows the monthly or yearly (discounted, per month) price.
export function withPlanPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    return forwardRef<any, any>(function PlanPrice(props, ref) {
        const [s] = useBilling()
        const monthly = Number(props.value ?? 0)
        const yearly = Math.round(monthly * DISCOUNT)
        const value = s.yearly ? yearly : monthly
        const from = s.touched ? (s.yearly ? monthly : yearly) : props.from
        return (
            <Component
                key={s.yearly ? "y" : "m"}
                {...props}
                ref={ref}
                value={value}
                from={from}
            />
        )
    })
}

// On the "/ month" label next to a price.
export function withBillingPeriod(
    Component: ComponentType<any>
): ComponentType<any> {
    return forwardRef<any, any>(function BillingPeriod(props, ref) {
        const [s] = useBilling()
        return (
            <Component
                {...props}
                ref={ref}
                text={s.yearly ? "/ month, billed yearly" : props.text}
            />
        )
    })
}
