import type { ReactNode } from 'react';

export type ViewMode = 'grid' | 'list';

const GridIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" /></svg>
);
const ListIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 3h2v2H2zM6 3h8v2H6zM2 7h2v2H2zM6 7h8v2H6zM2 11h2v2H2zM6 11h8v2H6z" /></svg>
);

export interface ViewModeSwitchProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  /** Icon-only variants still expose a native title and an accessible name. */
  iconOnly?: boolean;
  className?: string;
  trailing?: ReactNode;
}

export function ViewModeSwitch({ value, onChange, iconOnly = false, className = '', trailing }: ViewModeSwitchProps) {
  return (
    <div className={`cg-view-switch ${iconOnly ? 'cg-view-switch--icons' : ''} ${className}`.trim()} role="group" aria-label="Visitor view">
      {(['grid', 'list'] as const).map((mode) => {
        const label = mode === 'grid' ? 'Grid' : 'List';
        const icon = mode === 'grid' ? <GridIcon /> : <ListIcon />;
        return (
          <button
            key={mode}
            type="button"
            className="cg-view-switch__button cg-focusable"
            aria-pressed={value === mode}
            aria-label={iconOnly ? `${label} view` : undefined}
            title={iconOnly ? `${label} view` : undefined}
            onClick={() => onChange(mode)}
          >
            {icon}
            {!iconOnly && <span>{label}</span>}
          </button>
        );
      })}
      {trailing}
    </div>
  );
}
