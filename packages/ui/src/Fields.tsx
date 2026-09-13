import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="cg-filterbar" role="search">
      {children}
    </div>
  );
}

export interface FilterGroupProps {
  label: string;
  fill?: boolean;
  children: ReactNode;
}

/** Clusters controls of one interaction kind (metadata filters, a threshold, a toggle) within a FilterBar. */
export function FilterGroup({ label, fill = false, children }: FilterGroupProps) {
  return (
    <div className={`cg-filterbar__group${fill ? ' cg-filterbar__group--fill' : ''}`} role="group" aria-label={label}>
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
    <span className="cg-select-control">
      <select className={`cg-select cg-focusable ${className}`.trim()} {...rest}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="cg-select-control__chevron" aria-hidden="true" />
    </span>
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
    <label className={`cg-switch${checked ? ' cg-switch--on' : ''}`}>
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="cg-switch__track" aria-hidden="true">
        <span className="cg-switch__thumb" />
      </span>
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

export interface SteppedRangeFieldProps {
  id: string;
  label: string;
  value: number;
  steps: readonly number[];
  onChange: (next: number) => void;
  disabled?: boolean;
  valueLabel?: (value: number) => string;
  accessibleValueLabel?: (value: number) => string;
}

export function SteppedRangeField({
  id, label, value, steps, onChange, disabled = false,
  valueLabel = (next) => next === 0 ? 'Any' : `${next}%`,
  accessibleValueLabel = (next) => next === 0 ? 'Any bot probability' : next === 100 ? '100 percent' : `${next} percent or higher`,
}: SteppedRangeFieldProps) {
  const current = steps.includes(value) ? value : steps.reduce((closest, next) => Math.abs(next - value) < Math.abs(closest - value) ? next : closest, steps[0]);
  return (
    <div className="cg-stepped-range">
      <div className="cg-stepped-range__head"><span>{label}</span><output htmlFor={id}>{valueLabel(current)}</output></div>
      <input id={id} type="range" className="cg-range cg-focusable" min={0} max={steps.length - 1} step={1}
        value={steps.indexOf(current)} disabled={disabled} aria-label={label} aria-valuetext={accessibleValueLabel(current)}
        onChange={(event) => onChange(steps[Number(event.target.value)])} />
      <div className="cg-stepped-range__ticks" aria-hidden="true">{steps.map((step) => <span key={step}>{step === 0 ? 'Any' : step}</span>)}</div>
    </div>
  );
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
      <div className="cg-range-row">
        <span className="cg-range-row__bound" aria-hidden="true">
          {format(min)}
        </span>
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
        <span className="cg-range-row__bound" aria-hidden="true">
          {format(max)}
        </span>
      </div>
    </Field>
  );
}
