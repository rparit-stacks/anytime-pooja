"use client"

import { usePathname } from "next/navigation"

export function BackgroundDiagonalMarquee() {
  const pathname = usePathname()
  if (pathname === "/") return null

  const { angle, top, height, duration } = variantFromPath(pathname)

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Strap lane (edge-to-edge rectangular bar) */}
      <div
        className="absolute left-0 right-0"
        style={{
          top,
          height,
          transform: `rotate(${angle}deg)`,
          transformOrigin: "center",
        }}
      >
        {/* Faint rectangular strap background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "var(--brand-saffron)",
            opacity: 0.08, // reduced strap/background opacity to match faint background icons (~8-10%)
          }}
        />
        {/* Moving marquee text inside strap */}
        <div
          className="relative h-full flex items-center whitespace-nowrap will-change-transform"
          style={{
            color: "var(--brand-saffron)",
            opacity: 0.08, // reduced text opacity to be equally subtle
            animation: `marquee-diagonal ${duration}s linear infinite`,
          }}
        >
          <MarqueeLine />
          <MarqueeLine />
          <MarqueeLine />
        </div>
      </div>
    </div>
  )
}

function MarqueeLine() {
  const chunk = " ANYTIME POOJA •"
  const text = Array.from({ length: 24 })
    .map(() => chunk)
    .join("")
  return <p className="mx-4 text-[7.5vw] md:text-[6vw] leading-none font-serif font-bold tracking-tight">{text}</p>
}

// Choose a deterministic variant per route: different angles; some are straight (0deg)
function variantFromPath(path: string) {
  const hash = [...path].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const angles = [-14, -8, 0, 10, 6, 0, -12] // includes straight variants
  const tops = ["20%", "30%", "40%", "50%"]
  const durations = [20, 22, 24, 26]
  return {
    angle: angles[hash % angles.length],
    top: tops[hash % tops.length],
    height: "20vh", // strap height; responsive enough but not intrusive
    duration: durations[hash % durations.length],
  }
}
