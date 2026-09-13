import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'cream' | 'pill';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual role. `pill` is for icon/toggle actions only — never rectangular CTAs. */
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  iconOnly?: boolean;
  tooltip?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  iconOnly = false,
  tooltip,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`cg-btn cg-btn--${variant} cg-btn--${size}${iconOnly ? ' cg-btn--icon-only' : ''} cg-focusable ${className}`.trim()}
      title={tooltip}
      data-tooltip={tooltip}
      {...rest}
    />
  );
}
