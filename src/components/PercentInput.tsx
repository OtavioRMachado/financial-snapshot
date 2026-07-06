import { useEffect, useRef, useState } from 'react';

interface Props {
  /** Value in the parent's units. If asFraction=true, this is 0..1 (e.g. 0.07 = 7%). */
  value: number;
  onChange: (v: number) => void;
  /** Default true — parent stores fractions and we display as percent. Set false when parent already uses 0-100. */
  asFraction?: boolean;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  'aria-label'?: string;
}

/**
 * A percentage input that behaves well while the user is typing:
 *  - Stores the raw text locally so trailing decimals, empty state, and
 *    partial input (like "-" or ".") don't get clobbered by re-renders.
 *  - Fixes the floating-point rounding artifacts of `value * 100`
 *    (e.g. `0.07 * 100 = 7.000000000000001`) via a small rounding at display.
 *  - Accepts comma or dot as the decimal separator; trailing "%" is stripped.
 *  - Only propagates onChange when the text parses to a valid, in-range number.
 *  - On blur, normalizes the display to the committed value.
 */
export default function PercentInput({
  value,
  onChange,
  asFraction = true,
  min,
  max,
  className,
  disabled,
  placeholder,
  'aria-label': ariaLabel,
}: Props) {
  const scale = asFraction ? 100 : 1;

  const [text, setText] = useState(() => valueToText(value, scale));
  const focused = useRef(false);

  // Sync from parent when the value changes externally (e.g. reset, variant switch).
  // Skip if the field is currently focused AND the current text already parses to the same value.
  useEffect(() => {
    const parsed = parseNumber(text);
    if (parsed === null || Math.abs(parsed / scale - value) > 1e-9) {
      if (!focused.current) {
        setText(valueToText(value, scale));
      } else {
        // While focused: only overwrite if the parsed value is meaningfully different.
        // This lets external resets propagate but preserves in-flight typing.
        const external = valueToText(value, scale);
        if (external !== text) setText(external);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (raw: string) => {
    setText(raw);
    const parsed = parseNumber(raw);
    if (parsed === null) return; // wait for more input
    // Convert display units back to parent units
    const inParent = parsed / scale;
    if (min !== undefined && inParent < min) return;
    if (max !== undefined && inParent > max) return;
    onChange(inParent);
  };

  return (
    <div className={`relative ${className ?? ''}`}>
      <input
        type="text"
        inputMode="decimal"
        className="input pr-8 tabular-nums"
        value={text}
        onChange={(e) => commit(e.target.value)}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          // Normalize display: rewrite based on the committed value
          setText(valueToText(value, scale));
        }}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
        %
      </span>
    </div>
  );
}

/** Convert a parent-scale value to a display string. Rounds off float noise. */
function valueToText(value: number, scale: number): string {
  if (!Number.isFinite(value)) return '';
  // Round to 6 significant decimals to remove noise like 7.000000000000001,
  // then drop trailing zeros via Number().toString().
  const display = Math.round(value * scale * 1e6) / 1e6;
  return Number(display).toString();
}

/** Parse text as a number. Accepts comma or dot; strips trailing %; returns null when incomplete. */
function parseNumber(raw: string): number | null {
  let s = raw.trim().replace(',', '.');
  if (s.endsWith('%')) s = s.slice(0, -1).trim();
  // Reject partial inputs so we don't commit prematurely
  if (s === '' || s === '.' || s === '-' || s === '-.') return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}
