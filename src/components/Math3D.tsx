import type { CSSProperties } from 'react';

type Props = { expression: string; tone?: 'sky' | 'amber' | 'violet' | 'emerald' | 'navy'; className?: string };
const PALETTES = {
  sky: ['#e4f8ff', '#2089cd', '#075386'],
  amber: ['#fff2c8', '#d57d25', '#93501d'],
  violet: ['#f0e6ff', '#8c60d6', '#573999'],
  emerald: ['#d7fff2', '#15976f', '#086145'],
  navy: ['#a8d7ff', '#172554', '#0a1533'],
} as const;

export default function Math3D({ expression, tone = 'sky', className = '' }: Props) {
  const [shine, face, depth] = PALETTES[tone];
  const tokens = expression.trim().split(/\s+/);
  return <span className={`math-3d inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-4 ${className}`} role="img" aria-label={expression} style={{ '--math-shine': shine, '--math-face': face, '--math-depth': depth } as CSSProperties}>
    {tokens.map((token, index) => <span key={index} aria-hidden="true" className={`math-3d-token ${/^[+−×÷=<>?]$/.test(token) ? 'math-3d-sign' : ''}`}>{token}</span>)}
  </span>;
}
