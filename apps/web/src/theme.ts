/**
 * ArmAI premium enterprise theme: Luxury AI platform — Black + Gold
 * Background: #0B0B0B | Surfaces: #121212 | Primary gold: #D4AF37 | Highlight gold: #F5D67A
 */

export const theme = {
  background: '#0B0B0B',
  surface: '#121212',
  surfaceElevated: '#1a1a1a',
  border: 'rgba(212, 175, 55, 0.2)',
  borderMuted: 'rgba(255,255,255,0.08)',

  primary: '#D4AF37',
  primaryHover: '#E5C04A',
  highlight: '#F5D67A',
  goldMuted: 'rgba(212, 175, 55, 0.5)',

  text: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',

  success: '#22c55e',
  successMuted: 'rgba(34, 197, 94, 0.2)',
  warning: '#eab308',
  warningMuted: 'rgba(234, 179, 8, 0.2)',
  danger: '#ef4444',
  dangerMuted: 'rgba(239, 68, 68, 0.2)',
  info: '#3b82f6',
  infoMuted: 'rgba(59, 130, 246, 0.2)',
} as const;

export type Theme = typeof theme;
