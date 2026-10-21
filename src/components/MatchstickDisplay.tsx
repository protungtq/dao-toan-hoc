import React from 'react';

interface MatchstickProps {
  equation: string; // e.g. "6 + 4 = 4" or "0" or "5"
  highlightStick?: string; // clue or hint
}

// 7 segments for 0-9: [top, top-left, top-right, middle, bottom-left, bottom-right, bottom]
const SEGMENTS: Record<string, boolean[]> = {
  '0': [true, true, true, false, true, true, true],
  '1': [false, false, true, false, false, true, false],
  '2': [true, false, true, true, true, false, true],
  '3': [true, false, true, true, false, true, true],
  '4': [false, true, true, true, false, true, false],
  '5': [true, true, false, true, false, true, true],
  '6': [true, true, false, true, true, true, true],
  '7': [true, false, true, false, false, true, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
};

function MatchstickH({ x, y, width = 50, height = 7, headRight = false, isHighlighted = false }: { x: number; y: number; width?: number; height?: number; headRight?: boolean; isHighlighted?: boolean }) {
  return (
    <g className={isHighlighted ? 'animate-pulse' : ''}>
      {/* Wood stick body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill={isHighlighted ? 'url(#wood-glow)' : 'url(#wood-gradient)'}
        stroke={isHighlighted ? '#ef4444' : '#b45309'}
        strokeWidth="1"
        filter="drop-shadow(0 1px 1.5px rgba(0,0,0,0.2))"
      />
      {/* Wood grain line */}
      <line
        x1={x + 12}
        y1={y + height / 2}
        x2={x + width - 12}
        y2={y + height / 2}
        stroke="rgba(180, 83, 9, 0.35)"
        strokeWidth="0.8"
        strokeDasharray="4 3"
      />
      {/* Red Match head */}
      <ellipse
        cx={headRight ? x + width - 3 : x + 3}
        cy={y + height / 2}
        rx={5}
        ry={height / 2 + 1.2}
        fill="url(#head-gradient)"
        stroke="#991b1b"
        strokeWidth="0.8"
      />
      {/* Match head highlight */}
      <ellipse
        cx={headRight ? x + width - 4 : x + 2}
        cy={y + height / 2 - 1.2}
        rx={1.8}
        ry={1.2}
        fill="#fecaca"
        opacity="0.85"
      />
    </g>
  );
}

function MatchstickV({ x, y, width = 7, height = 44, headBottom = false, isHighlighted = false }: { x: number; y: number; width?: number; height?: number; headBottom?: boolean; isHighlighted?: boolean }) {
  return (
    <g className={isHighlighted ? 'animate-pulse' : ''}>
      {/* Wood stick body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={width / 2}
        fill={isHighlighted ? 'url(#wood-glow)' : 'url(#wood-gradient)'}
        stroke={isHighlighted ? '#ef4444' : '#b45309'}
        strokeWidth="1"
        filter="drop-shadow(0 1px 1.5px rgba(0,0,0,0.2))"
      />
      {/* Wood grain line */}
      <line
        x1={x + width / 2}
        y1={y + 10}
        x2={x + width / 2}
        y2={y + height - 10}
        stroke="rgba(180, 83, 9, 0.35)"
        strokeWidth="0.8"
        strokeDasharray="4 3"
      />
      {/* Red Match head */}
      <ellipse
        cx={x + width / 2}
        cy={headBottom ? y + height - 3 : y + 3}
        rx={width / 2 + 1.2}
        ry={5}
        fill="url(#head-gradient)"
        stroke="#991b1b"
        strokeWidth="0.8"
      />
      {/* Match head highlight */}
      <ellipse
        cx={x + width / 2 - 1.2}
        cy={headBottom ? y + height - 4 : y + 2}
        rx={1.2}
        ry={1.8}
        fill="#fecaca"
        opacity="0.85"
      />
    </g>
  );
}

function MatchstickDigit({ char, highlightMiddle = false }: { char: string; highlightMiddle?: boolean }) {
  const segs = SEGMENTS[char] || [false, false, false, false, false, false, false];
  const [top, topL, topR, mid, botL, botR, bot] = segs;

  return (
    <svg viewBox="0 0 74 112" className="h-20 sm:h-24 md:h-28 w-auto shrink-0 select-none">
      <defs>
        <linearGradient id="wood-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="40%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="wood-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fee2e2" />
          <stop offset="50%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <radialGradient id="head-gradient" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="60%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
      </defs>

      {/* Top horizontal */}
      {top && <MatchstickH x={12} y={4} width={50} height={7} />}

      {/* Top Left vertical */}
      {topL && <MatchstickV x={6} y={10} width={7} height={44} />}

      {/* Top Right vertical */}
      {topR && <MatchstickV x={61} y={10} width={7} height={44} headBottom />}

      {/* Middle horizontal */}
      {mid && <MatchstickH x={12} y={52} width={50} height={7} isHighlighted={highlightMiddle} />}

      {/* Bottom Left vertical */}
      {botL && <MatchstickV x={6} y={58} width={7} height={44} />}

      {/* Bottom Right vertical */}
      {botR && <MatchstickV x={61} y={58} width={7} height={44} headBottom />}

      {/* Bottom horizontal */}
      {bot && <MatchstickH x={12} y={101} width={50} height={7} headRight />}
    </svg>
  );
}

function MatchstickOperator({ op }: { op: string }) {
  if (op === '+') {
    return (
      <svg viewBox="0 0 54 112" className="h-20 sm:h-24 md:h-28 w-auto shrink-0 select-none">
        {/* Horizontal */}
        <MatchstickH x={5} y={52} width={44} height={7} />
        {/* Vertical */}
        <MatchstickV x={23.5} y={34} width={7} height={44} />
      </svg>
    );
  }
  if (op === '-') {
    return (
      <svg viewBox="0 0 54 112" className="h-20 sm:h-24 md:h-28 w-auto shrink-0 select-none">
        <MatchstickH x={5} y={52} width={44} height={7} />
      </svg>
    );
  }
  if (op === '=') {
    return (
      <svg viewBox="0 0 54 112" className="h-20 sm:h-24 md:h-28 w-auto shrink-0 select-none">
        <MatchstickH x={5} y={44} width={44} height={7} />
        <MatchstickH x={5} y={60} width={44} height={7} headRight />
      </svg>
    );
  }
  return null;
}

interface MatchstickProps {
  equation: string; // e.g. "6 + 4 = 4" or "0" or "5"
  highlightStick?: string; // clue or hint
  showHint?: boolean;
}

export default function MatchstickDisplay({ equation, highlightStick, showHint = false }: MatchstickProps) {
  // Tách phương trình thành các token: ví dụ "6 + 4 = 4"
  const tokens = equation.trim().split(/\s+/);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 shadow-md">
        {tokens.map((tok, idx) => {
          if (tok === '+' || tok === '-' || tok === '=') {
            return <MatchstickOperator key={idx} op={tok} />;
          }

          // Chuỗi chữ số (e.g. "6", "11", "0")
          return (
            <div key={idx} className="flex items-center gap-1 sm:gap-1.5">
              {tok.split('').map((char, cIdx) => (
                <MatchstickDigit
                  key={cIdx}
                  char={char}
                  highlightMiddle={showHint && highlightStick?.includes('ngang ở giữa số 6') && tok === '6'}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
