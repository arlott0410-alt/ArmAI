import React from 'react';
import { theme } from '../../theme';

export function ActionFooter({
  primary,
  secondary,
  style,
}: {
  primary: React.ReactNode | null;
  secondary?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 20,
        paddingTop: 16,
        borderTop: `1px solid ${theme.borderMuted}`,
        ...style,
      }}
    >
      <div>{secondary}</div>
      <div>{primary}</div>
    </div>
  );
}
