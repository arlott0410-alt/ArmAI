import React from 'react';
import { theme } from '../../theme';

export interface MerchantTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
}

export function MerchantTable<T extends { id: string }>({
  columns,
  data,
  keyExtractor = (row) => row.id,
  onRowClick,
  emptyMessage = 'No rows',
  style,
}: {
  columns: MerchantTableColumn<T>[];
  data: T[];
  keyExtractor?: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  style?: React.CSSProperties;
}) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: theme.textMuted, fontSize: 14, ...style }}>
        {emptyMessage}
      </div>
    );
  }
  return (
    <div style={{ overflowX: 'auto', ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${theme.borderMuted}` }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: theme.textMuted,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{
                borderBottom: `1px solid ${theme.borderMuted}`,
                cursor: onRowClick ? 'pointer' : undefined,
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '14px 16px',
                    color: theme.text,
                  }}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
