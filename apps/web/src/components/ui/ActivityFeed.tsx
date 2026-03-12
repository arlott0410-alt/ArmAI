import React from 'react'
import { theme } from '../../theme'

export interface ActivityItem {
  id: string
  type: string
  at: string
  title?: string
  subtitle?: string
  meta?: React.ReactNode
}

export function ActivityFeed({
  items,
  emptyMessage = 'No activity yet',
  style,
}: {
  items: ActivityItem[]
  emptyMessage?: string
  style?: React.CSSProperties
}) {
  if (items.length === 0) {
    return (
      <div
        style={{ padding: 24, textAlign: 'center', color: theme.textMuted, fontSize: 14, ...style }}
      >
        {emptyMessage}
      </div>
    )
  }
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', ...style }}>
      {items.map((item, i) => (
        <li
          key={item.id}
          style={{
            padding: '12px 0',
            borderBottom: i < items.length - 1 ? `1px solid ${theme.borderMuted}` : 'none',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: theme.primary,
              marginTop: 6,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: theme.text }}>{item.title ?? item.type}</div>
            {item.subtitle != null && (
              <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                {item.subtitle}
              </div>
            )}
            <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>
              {new Date(item.at).toLocaleString()}
              {item.meta != null && <span style={{ marginLeft: 8 }}>{item.meta}</span>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
