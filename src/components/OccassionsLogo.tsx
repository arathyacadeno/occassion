"use client";

import React from "react";

interface OccassionsLogoProps {
  height?: number;
  className?: string;
}

export default function OccassionsLogo({
  height = 50,
  className,
}: OccassionsLogoProps) {
  // Original aspect ratio from card is approx 240 x 135
  const width = Math.round(height * 1.85);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 260 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Occassions - Do it with flowers"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        {/* Soft pink gradient for the rose blossom */}
        <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e84a6c" />
          <stop offset="50%" stopColor="#d1264e" />
          <stop offset="100%" stopColor="#a31538" />
        </linearGradient>

        <linearGradient id="roseHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffd8e2" stopOpacity="0.4" />
        </linearGradient>

        {/* Leaf green gradient */}
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#258c3f" />
          <stop offset="100%" stopColor="#15642a" />
        </linearGradient>
      </defs>

      {/* 1. THE PINK ROSE BLOSSOM (tucked above 'cca') */}
      <g transform="translate(48, 4) scale(0.92)">
        {/* Outer petal base shape */}
        <path
          d="M24 16 C18 10, 10 12, 6 18 C2 24, 4 32, 10 38 C16 44, 28 46, 36 42 C44 38, 48 30, 46 22 C44 14, 38 10, 30 10 C28 6, 22 6, 18 8 Z"
          fill="url(#roseGradient)"
        />

        {/* Inner layered cabbage rose petals */}
        <path
          d="M12 22 C14 18, 22 16, 28 18 C34 20, 38 26, 36 32 C34 38, 26 40, 20 38 C14 36, 10 30, 12 24 Z"
          fill="#be1b41"
          opacity="0.8"
        />

        {/* Delicate white contour petal swirls matching the card logo */}
        <path
          d="M16 16 C22 12, 30 13, 34 17 C38 21, 38 26, 35 30"
          stroke="url(#roseHighlight)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 26 C13 21, 18 19, 24 20 C29 21, 32 25, 30 30 C28 35, 22 36, 17 34"
          stroke="url(#roseHighlight)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 25 C20 23, 25 24, 26 27 C27 30, 24 32, 21 31"
          stroke="url(#roseHighlight)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 3-pointed green sepal / leaves beneath the rose blossom */}
        <path
          d="M24 40 L18 48 C16 50, 14 47, 16 44 L22 39 Z"
          fill="url(#leafGradient)"
        />
        <path
          d="M25 41 L25 51 C25 53, 23 53, 23 50 L24 40 Z"
          fill="url(#leafGradient)"
        />
        <path
          d="M26 40 L34 46 C36 48, 38 46, 35 43 L27 39 Z"
          fill="url(#leafGradient)"
        />
      </g>

      {/* 2. THE WORDMARK 'Occassions' (in vibrant emerald green brush script) */}
      <g transform="translate(10, 28) rotate(-4)">
        {/* Rendered with playful cursive hand-lettered style from the card */}
        <text
          x="6"
          y="56"
          fill="#1c7e36"
          fontFamily="'Caveat', 'Segoe Script', 'Brush Script MT', cursive"
          fontSize="48"
          fontWeight="700"
          letterSpacing="0.02em"
          style={{
            filter: "drop-shadow(0 1px 1px rgba(21, 100, 42, 0.25))",
          }}
        >
          Occassions
        </text>
      </g>

      {/* 3. THE SMILE ARC & TAGLINE 'Do it with flowers...' */}
      <g transform="translate(20, 94)">
        {/* Smiling wave underline arc */}
        <path
          d="M12 14 C55 -4, 125 -6, 175 14"
          stroke="#74272b"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Jaunty end flourish dots/tick */}
        <path
          d="M175 14 L180 8"
          stroke="#74272b"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="182" cy="6" r="1.3" fill="#74272b" />

        {/* Tagline text centered gently over the arc */}
        <text
          x="98"
          y="11"
          fill="#74272b"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontStyle="italic"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          letterSpacing="0.04em"
        >
          Do it with flowers...
        </text>
      </g>
    </svg>
  );
}
