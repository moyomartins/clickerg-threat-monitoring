import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';
export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: string;
  sort?: SortState;
  onSortChange?: (key: string) => void;
  onRowClick?: (row: T) => void;
  /** Draws a charcoal rail on the row — used for blocked visitors. */
  isRowFlagged?: (row: T) => boolean;
  loading?: boolean;
  skeletonRows?: number;
  /** Rendered in place of the tbody when `rows` is empty and not loading. */
  empty?: ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  sort,
  onSortChange,
  onRowClick,
  isRowFlagged,
  loading = false,
  skeletonRows = 8,
  empty,
}: DataTableProps<T>) {
  if (!loading && rows.length === 0 && empty) {
    return <div className="cg-table-wrap">{empty}</div>;
  }

  return (
    <div className="cg-table-wrap">
      <table className="cg-table">
        <caption className="cg-visually-hidden" hidden>
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((col) => {
              const active = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={
                    active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  scope="col"
                >
                  {col.sortable && onSortChange ? (
                    <button
                      type="button"
                      className="cg-table__sort cg-focusable"
                      data-active={active ? 'true' : 'false'}
                      onClick={() => onSortChange(col.key)}
                    >
                      {col.header}
                      <span className="cg-table__arrow" aria-hidden="true">
                        {active ? (sort.direction === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: skeletonRows }, (_, i) => (
                <tr key={`skeleton-${i}`} aria-hidden="true">
                  {columns.map((col) => (
                    <td key={col.key}>
                      <div className="cg-skel" style={{ width: `${50 + ((i * 7 + col.key.length * 11) % 45)}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => {
                const clickable = Boolean(onRowClick);
                return (
                  <tr
                    key={rowKey(row)}
                    className={[
                      clickable ? 'cg-table__row--clickable' : '',
                      isRowFlagged?.(row) ? 'cg-table__row--flagged' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    tabIndex={clickable ? 0 : undefined}
                    onClick={clickable ? () => onRowClick?.(row) : undefined}
                    onKeyDown={
                      clickable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRowClick?.(row);
                            }
                          }
                        : undefined
                    }
                  >
                    {columns.map((col) => (
                      <td key={col.key}>{col.render(row)}</td>
                    ))}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
