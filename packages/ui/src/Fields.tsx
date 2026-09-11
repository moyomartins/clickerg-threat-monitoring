import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="cg-filterbar" role="search">
      {children}
    </div>
  );
}

export interface FieldProps {
  label: string;
  htmlFor?: string;
  grow?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, grow = false, children }: FieldProps) {
  return (
    <div className={`cg-field${grow ? ' cg-field--grow' : ''}`}>
      <label className="cg-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextInput({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`cg-input cg-focusable ${className}`.trim()} {...rest} />;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ options, className = '', ...rest }: SelectProps) {
  return (
    <select className={`cg-select cg-focusable ${className}`.trim()} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, checked, onChange, disabled = false }: ToggleProps) {
  return (
    <label className={`cg-toggle${checked ? ' cg-toggle--on' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export interface RangeFieldProps {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
  format?: (value: number) => string;
}

export function RangeField({
  id,
  label,
  value,
  min = 0,
  max = 100,
  step = 5,
  onChange,
  format = (v) => `${v}%`,
}: RangeFieldProps) {
  return (
    <Field label={`${label} ≥ ${format(value)}`} htmlFor={id}>
      <input
        id={id}
        type="range"
        className="cg-range cg-focusable"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}
