import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  /** `compact` tightens padding/radius; `flush` removes padding for tables. */
  density?: 'default' | 'compact' | 'flush';
}

export function Card({
  title,
  density = 'default',
  className = '',
  children,
  ...rest
}: CardProps) {
  const mod = density === 'default' ? '' : ` cg-card--${density}`;
  return (
    <div className={`cg-card${mod} ${className}`.trim()} {...rest}>
      {title && <h2 className="cg-card__title">{title}</h2>}
      {children}
    </div>
  );
}
