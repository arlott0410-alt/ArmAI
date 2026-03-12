import React from 'react';
import { theme } from '../../theme';

const chipStyles: Record<string, { color: string; bg: string }> = {
  healthy: { color: theme.success, bg: theme.successMuted },
  needs_setup: { color: theme.warning, bg: theme.warningMuted },
  needs_attention: { color: theme.warning, bg: theme.warningMuted },
  partially_configured: { color: theme.info, bg: theme.infoMuted },
  ready_for_test: { color: theme.highlight, bg: theme.goldMuted },
};

const chipLabels: Record<string, string> = {
  healthy: 'Healthy',
  needs_setup: 'Needs Setup',
  needs_attention: 'Needs Attention',
  partially_configured: 'Partially Configured',
  ready_for_test: 'Ready for Test',
};

export function StatusChip({
  status,
  label,
  style,
}: {
  status: string;
  label?: string;
  style?: React.CSSProperties;
}) {
  const config = chipStyles[status] ?? { color: theme.textSecondary, bg: 'rgba(255,255,255,0.1)' };
  const displayLabel = label ?? chipLabels[status] ?? status;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.02em',
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}40`,
        ...style,
      }}
    >
      {displayLabel}
    </span>
  );
}
