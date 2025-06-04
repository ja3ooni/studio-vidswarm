import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 28"
      width="100"
      height="28"
      aria-label="VibeFlow Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M2,2 L12,14 L2,26"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="20"
        y="20"
        fontFamily="var(--font-headline), sans-serif"
        fontSize="18"
        fill="hsl(var(--foreground))"
        className="font-headline"
      >
        VibeFlow
      </text>
    </svg>
  );
}
