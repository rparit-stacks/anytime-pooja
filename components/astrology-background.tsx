"use client"

import type React from "react"

export function AstrologyBackground() {
  // Decorative only
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ color: "var(--brand-saffron)", opacity: 0.1 }}
    >
      {/* cluster container */}
      <div className="absolute inset-0">
        {/* Sun */}
        <IconSun className="absolute top-[8%] left-[6%] h-22 w-22 animate-[float-slow_9s_ease-in-out_infinite]" />
        {/* Moon */}
        <IconMoon className="absolute top-[20%] right-[8%] h-18 w-18 animate-[float-medium_11s_ease-in-out_infinite]" />
        {/* Star */}
        <IconStar className="absolute bottom-[18%] left-[10%] h-14 w-14 animate-[float-slow_10s_ease-in-out_infinite]" />
        {/* Om */}
        <IconOm className="absolute bottom-[10%] right-[12%] h-22 w-22 animate-[float-medium_12s_ease-in-out_infinite]" />
        {/* Trishul */}
        <IconTrishul className="absolute top-[55%] left-[50%] h-18 w-18 animate-[float-slow_13s_ease-in-out_infinite]" />
      </div>
    </div>
  )
}

function IconSun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="4" />
      <g opacity="0.7">
        <path
          d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </g>
    </svg>
  )
}
function IconMoon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20 12.5A8 8 0 1 1 11.5 4a6.5 6.5 0 1 0 8.5 8.5z" />
    </svg>
  )
}
function IconStar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 2 2.9 6.2 6.7.8-4.9 4.7 1.3 6.6-6-3.4-6 3.4 1.3-6.6L2.4 9l6.7-.8L12 2z" />
    </svg>
  )
}
function IconOm(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" {...props}>
      <path d="M34 15c-3 0-6 2-6 5s3 5 6 5 6-2 6-5-3-5-6-5zm14 10c-3 0-6 3-8 6-2 4-5 7-10 7-6 0-10-4-10-9 0-4 3-8 7-9-7 0-13 6-13 13 0 8 7 14 16 14 7 0 13-4 16-9 1-2 3-4 5-4 2 0 4 1 4 3 0 3-3 4-5 4h-2v4h2c5 0 9-3 9-8s-4-8-9-8z" />
    </svg>
  )
}
function IconTrishul(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" {...props}>
      <path d="M32 2c-3 5-7 8-12 9 4 2 7 5 9 9h-4c-3-3-6-5-9-6 4 6 8 9 13 10v38h6V23c5-1 9-4 13-10-3 1-6 3-9 6h-4c2-4 5-7 9-9-5-1-9-4-12-9z" />
    </svg>
  )
}
