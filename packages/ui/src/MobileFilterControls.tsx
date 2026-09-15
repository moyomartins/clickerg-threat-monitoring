import { useEffect, useId, useRef, useState } from 'react';
import { Button } from './Button';
import { Field, Select, SteppedRangeField, TextInput, Toggle } from './Fields';
import { SortDirectionIcon } from './SortDirectionIcon';
import type { SortState } from './DataTable';

/**
 * Threat monitoring's filter and sort controls at phone widths.
 *
 * The desktop bar shows every control at once, which is right on a screen that
 * has the room: the whole filter state is readable without opening anything.
 * On a phone the same stack pushed the first visitor most of a screen down, so
 * here the search stays out (searching is a primary action) and the rest
 * collapses behind two triggers.
 *
 * This component owns no filter rules and no defaults. The applied values, the
 * option lists, the matching logic and the persisted context all stay where
 * they already live; what is added is a *draft* layer, so a reader can set
 * several filters before committing them, and a close without Apply leaves the
 * applied state untouched.
 *
 * The panels are full-width disclosures in the document flow rather than
 * floating sheets. That is the variant the brief allows and the one with the
 * fewest ways to fail: nothing can render off-screen, the background needs no
 * scroll lock or focus trap, and the reader's scroll position survives a close
 * by construction.
 */

export interface MobileFilterValues {
  status: string;
  country: string;
  window: string;
  paidOnly: boolean;
  minBot: number;
}

export interface FilterOption {
  value: string;
  label: string;
}

/** How a sort field's direction should be described in words. */
export type SortKind = 'date' | 'amount' | 'text';

export interface MobileSortOption extends FilterOption {
  kind: SortKind;
}

export interface MobileFilterControlsProps {
  query: string;
  onQueryChange: (value: string) => void;
  /** Currently applied filters , the panel opens reflecting these. */
  values: MobileFilterValues;
  /** Defaults, used for the active count, the chips, and Reset. */
  defaults: MobileFilterValues;
  onApply: (values: MobileFilterValues) => void;
  statusOptions: FilterOption[];
  countryOptions: FilterOption[];
  windowOptions: FilterOption[];
  sort: SortState;
  sortOptions: MobileSortOption[];
  onSortChange: (sort: SortState) => void;
  botSteps?: number[];
  loading?: boolean;
}

const FilterIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M2 4h12M4 8h8M6 12h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);
const SortIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M2 4h10M2 8h7M2 12h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

/** Direction described in the selected field's own terms, never a bare arrow. */
export function directionLabel(kind: SortKind, direction: SortState['direction']) {
  const descending = direction === 'desc';
  if (kind === 'date') return descending ? 'Newest first' : 'Oldest first';
  if (kind === 'amount') return descending ? 'Highest first' : 'Lowest first';
  return descending ? 'Z to A' : 'A to Z';
}

const labelOf = (options: FilterOption[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

/** Which applied filters differ from their defaults, and how to undo each. */
function activeFilters(
  values: MobileFilterValues,
  defaults: MobileFilterValues,
  statusOptions: FilterOption[],
  countryOptions: FilterOption[],
  windowOptions: FilterOption[],
) {
  const active: { key: keyof MobileFilterValues; label: string }[] = [];
  if (values.status !== defaults.status) active.push({ key: 'status', label: labelOf(statusOptions, values.status) });
  if (values.country !== defaults.country) active.push({ key: 'country', label: labelOf(countryOptions, values.country) });
  if (values.window !== defaults.window) active.push({ key: 'window', label: labelOf(windowOptions, values.window) });
  if (values.minBot !== defaults.minBot) active.push({ key: 'minBot', label: `Bot probability ${values.minBot}%+` });
  if (values.paidOnly !== defaults.paidOnly) active.push({ key: 'paidOnly', label: 'Paid clicks only' });
  return active;
}

export function MobileFilterControls({
  query, onQueryChange, values, defaults, onApply,
  statusOptions, countryOptions, windowOptions,
  sort, sortOptions, onSortChange,
  botSteps = [0, 25, 50, 75, 100],
  loading = false,
}: MobileFilterControlsProps) {
  const uid = useId().replace(/:/g, '');
  const filterPanelId = `${uid}-filter-panel`;
  const sortPanelId = `${uid}-sort-panel`;

  const [open, setOpen] = useState<'filter' | 'sort' | null>(null);
  /* Draft filters exist only while the panel is open. Opening seeds them from
     the applied values, so the panel always shows what is actually in force. */
  const [draft, setDraft] = useState<MobileFilterValues>(values);

  const filterTrigger = useRef<HTMLButtonElement>(null);
  const sortTrigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const active = activeFilters(values, defaults, statusOptions, countryOptions, windowOptions);
  const selectedSort = sortOptions.find((o) => o.value === sort.key) ?? sortOptions[0];
  const sortValueLabel = selectedSort?.label ?? sort.key;
  const sortDirection = directionLabel(selectedSort?.kind ?? 'text', sort.direction);

  /* Closing always hands focus back to whichever trigger opened the panel, so
     a keyboard reader is never dropped at the top of the document. */
  const close = (restoreTo?: 'filter' | 'sort') => {
    const target = restoreTo ?? open;
    setOpen(null);
    if (target === 'filter') filterTrigger.current?.focus();
    if (target === 'sort') sortTrigger.current?.focus();
  };

  const toggle = (which: 'filter' | 'sort') => {
    if (open === which) {
      close(which);                // same trigger pressed again , close and stay put
      return;
    }
    if (which === 'filter') setDraft(values);  // never carry a stale draft between openings
    setOpen(which);
  };

  /* Opening moves focus into the panel, at its heading rather than its first
     select , landing on a control would read as though a choice were pending. */
  useEffect(() => {
    if (open) heading.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panel.current?.contains(target)) return;
      if (filterTrigger.current?.contains(target) || sortTrigger.current?.contains(target)) return;
      // Dismissing without Apply discards the draft; applied filters stand.
      setOpen(null);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const apply = () => {
    onApply(draft);
    close('filter');
  };
  const removeFilter = (key: keyof MobileFilterValues) => onApply({ ...values, [key]: defaults[key] });
  const clearAll = () => onApply(defaults);

  return (
    <div className="cg-mfilters">
      <Field label="Search IP, city or campaign" htmlFor={`${uid}-q`} grow>
        <TextInput
          id={`${uid}-q`}
          type="search"
          placeholder="41.203.88.7, Leeds, uk-brand-exact…"
          value={query}
          disabled={loading}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </Field>

      <div className="cg-mfilters__actions">
        <button
          ref={filterTrigger}
          type="button"
          className="cg-mfilters__trigger cg-focusable"
          aria-expanded={open === 'filter'}
          aria-controls={filterPanelId}
          aria-label={`Filter visitors${active.length ? `, ${active.length} active` : ''}`}
          disabled={loading}
          onClick={() => toggle('filter')}
        >
          <FilterIcon />
          <span>Filter</span>
          {active.length > 0 && <span className="cg-mfilters__badge">{active.length}</span>}
        </button>
        <button
          ref={sortTrigger}
          type="button"
          className="cg-mfilters__trigger cg-focusable"
          aria-expanded={open === 'sort'}
          aria-controls={sortPanelId}
          aria-label={`Sort visitors, ${sortValueLabel}, ${sortDirection}`}
          disabled={loading}
          onClick={() => toggle('sort')}
        >
          <SortIcon />
          <span>Sort</span>
          {/* Dropped at the narrowest widths; the accessible name always carries it. */}
          <span className="cg-mfilters__trigger-value">{sortValueLabel}</span>
        </button>
      </div>

      {open === 'filter' && (
        <div className="cg-mfilters__panel" id={filterPanelId} ref={panel} role="group" aria-labelledby={`${filterPanelId}-title`}>
          <div className="cg-mfilters__panel-head">
            <h3 className="cg-mfilters__panel-title" id={`${filterPanelId}-title`} tabIndex={-1} ref={heading}>
              Filter visitors
            </h3>
            <Button variant="ghost" size="sm" iconOnly aria-label="Close filter panel" onClick={() => close('filter')}>
              <CloseIcon />
            </Button>
          </div>

          <Field label="Status" htmlFor={`${uid}-status`}>
            <Select
              id={`${uid}-status`}
              value={draft.status}
              options={statusOptions}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
            />
          </Field>
          <Field label="Country" htmlFor={`${uid}-country`}>
            <Select
              id={`${uid}-country`}
              value={draft.country}
              options={countryOptions}
              onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value }))}
            />
          </Field>
          <Field label="Last seen" htmlFor={`${uid}-window`}>
            <Select
              id={`${uid}-window`}
              value={draft.window}
              options={windowOptions}
              onChange={(e) => setDraft((d) => ({ ...d, window: e.target.value }))}
            />
          </Field>
          <SteppedRangeField
            id={`${uid}-bot`}
            label="Minimum bot probability"
            value={draft.minBot}
            steps={botSteps}
            onChange={(minBot) => setDraft((d) => ({ ...d, minBot }))}
          />
          <Toggle
            label="Paid clicks only"
            checked={draft.paidOnly}
            onChange={(paidOnly) => setDraft((d) => ({ ...d, paidOnly }))}
          />

          <div className="cg-mfilters__panel-foot">
            <Button variant="ghost" size="sm" onClick={() => setDraft(defaults)}>Reset</Button>
            <Button variant="primary" size="sm" onClick={apply}>Apply filters</Button>
          </div>
        </div>
      )}

      {open === 'sort' && (
        <div className="cg-mfilters__panel" id={sortPanelId} ref={panel} role="group" aria-labelledby={`${sortPanelId}-title`}>
          <div className="cg-mfilters__panel-head">
            <h3 className="cg-mfilters__panel-title" id={`${sortPanelId}-title`} tabIndex={-1} ref={heading}>
              Sort visitors
            </h3>
            <Button variant="ghost" size="sm" iconOnly aria-label="Close sort panel" onClick={() => close('sort')}>
              <CloseIcon />
            </Button>
          </div>

          {/* Sort commits on selection, which is how the desktop bar already
              behaves; adding an Apply step here would invent a new model. */}
          <Field label="Sort by" htmlFor={`${uid}-sort`}>
            <Select
              id={`${uid}-sort`}
              value={sort.key}
              options={sortOptions}
              onChange={(e) => onSortChange({ ...sort, key: e.target.value })}
            />
          </Field>

          <fieldset className="cg-mfilters__directions">
            <legend>Direction</legend>
            {(['desc', 'asc'] as const).map((direction) => (
              <label key={direction} className="cg-mfilters__direction">
                <input
                  type="radio"
                  name={`${uid}-direction`}
                  value={direction}
                  checked={sort.direction === direction}
                  onChange={() => onSortChange({ ...sort, direction })}
                />
                <SortDirectionIcon direction={direction} />
                <span>{directionLabel(selectedSort?.kind ?? 'text', direction)}</span>
              </label>
            ))}
          </fieldset>
        </div>
      )}

      {active.length > 0 && (
        <div className="cg-mfilters__summary" role="group" aria-label="Active filters">
          <ul className="cg-mfilters__chips">
            {active.map((filter) => (
              <li key={filter.key} className="cg-mfilters__chip">
                <span>{filter.label}</span>
                <button
                  type="button"
                  className="cg-mfilters__chip-remove cg-focusable"
                  aria-label={`Remove filter ${filter.label}`}
                  onClick={() => removeFilter(filter.key)}
                >
                  <CloseIcon />
                </button>
              </li>
            ))}
          </ul>
          {active.length > 1 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
          )}
        </div>
      )}
    </div>
  );
}

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);
