import React from 'react';
import { theme } from '../../theme';

export interface RevenueChartPoint {
  label: string;
  value: number;
}

export function RevenueChart({
  data,
  height = 120,
  currency = '$',
  style,
}: {
  data: RevenueChartPoint[];
  height?: number;
  currency?: string;
  style?: React.CSSProperties;
}) {
  if (data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted, fontSize: 13, ...style }}>
        No data
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
        {data.map((point) => (
          <div
            key={point.label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 32,
                height: Math.max(4, (point.value / max) * (height - 24)),
                borderRadius: 4,
                background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.goldMuted} 100%)`,
              }}
            />
            <span style={{ fontSize: 10, color: theme.textMuted }}>{point.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: theme.textSecondary }}>
        {currency}{data.reduce((s, d) => s + d.value, 0).toLocaleString()} total
      </div>
    </div>
  );
}
