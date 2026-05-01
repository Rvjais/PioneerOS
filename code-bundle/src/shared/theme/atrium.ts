/**
 * PioneerOS — Atrium design tokens (TypeScript)
 *
 * Import these in components when you need values in JS (e.g. inline styles,
 * chart libraries, dynamic theming). The same values are mirrored in
 * globals.css as CSS variables — prefer the CSS vars when styling DOM.
 */

export const colors = {
  // Surface
  bg: '#faf8f5',
  bgElev: '#ffffff',
  bgSunken: '#f3efe8',
  bgInverse: '#2a251f',

  // Ink
  ink: '#2a251f',
  ink2: '#5c5448',
  ink3: '#8a8175',
  ink4: '#b3a99a',
  inkInverse: '#faf8f5',

  // Lines
  line: '#ece7df',
  lineStrong: '#d8d0c2',

  // Accent
  accent: '#c96442',
  accentHover: '#b5563a',
  accentActive: '#9c4a32',
  accentSoft: '#fbeee8',
  accentInk: '#6e2f1c',

  // Semantic
  success: '#5a6b4a',
  successSoft: '#eef2e8',
  warning: '#c08a2e',
  warningSoft: '#faf1dd',
  danger: '#b54838',
  dangerSoft: '#f9e7e3',
  info: '#4a6b8a',
  infoSoft: '#e7eef5',
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const fonts = {
  sans: '"Geist", "Inter", system-ui, -apple-system, sans-serif',
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

export const shadows = {
  s1: '0 1px 2px rgba(42,37,31,0.05), 0 0 0 1px rgba(42,37,31,0.04)',
  s2: '0 2px 6px rgba(42,37,31,0.06), 0 0 0 1px rgba(42,37,31,0.04)',
  s3: '0 8px 24px rgba(42,37,31,0.08), 0 0 0 1px rgba(42,37,31,0.04)',
  pop: '0 16px 48px rgba(42,37,31,0.14), 0 2px 6px rgba(42,37,31,0.06)',
} as const;

/** Department color tokens — used for client tags, charts, sidebar accents */
export const departmentColors = {
  social: '#5a8aff',
  seo: '#5a6b4a',
  ads: '#c96442',
  web: '#a06bff',
  hr: '#d49b3a',
  accounts: '#4a6b8a',
  sales: '#7a9a5a',
  design: '#c084fc',
} as const;

export type DepartmentKey = keyof typeof departmentColors;

export const theme = { colors, radius, fonts, shadows, departmentColors } as const;
export default theme;
