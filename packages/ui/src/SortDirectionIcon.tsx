export function SortDirectionIcon({ direction }: { direction: 'asc' | 'desc' }) {
  const descending = direction === 'desc';

  return (
    <svg className="cg-sort-direction-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d={descending ? 'M8 2v11M4.5 9.5 8 13l3.5-3.5' : 'M8 14V3M4.5 6.5 8 3l3.5 3.5'} />
    </svg>
  );
}
