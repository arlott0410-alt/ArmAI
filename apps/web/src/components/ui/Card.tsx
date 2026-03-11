import React from 'react';
import { theme } from '../../theme';

const cardStyle: React.CSSProperties = {
  background: theme.surface,
  borderRadius: 10,
  border: `1px solid ${theme.borderMuted}`,
  overflow: 'hidden',
};

export function Card({
  children,
  style,
  ...rest
}: { children: React.ReactNode; style?: React.CSSProperties } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{ ...cardStyle, ...style }} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action, style }: { title: string; action?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: `1px solid ${theme.borderMuted}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...style,
    }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: theme.text, letterSpacing: '0.02em' }}>{title}</h3>
      {action}
    </div>
  );
}

export function CardBody({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ padding: 20, ...style }}>{children}</div>;
}
