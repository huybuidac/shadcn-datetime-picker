/**
 * Shadcn Datetime Input
 * Check out the live demo at https://shadcn-datetime-picker-pro.vercel.app/
 * Find the latest source code at https://github.com/huybuidac/shadcn-datetime-picker
 */
/* eslint-disable */
/** biome-ignore-all lint: third-party component */
import * as React from 'react';

import { cn } from '@/lib/utils';
import { format, parse, isValid, getYear, endOfMonth } from 'date-fns';
import { useRef, useState, useMemo, useEffect, useLayoutEffect, useCallback } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { TZDate } from 'react-day-picker';

type DateTimeInputProps = {
  className?: string;
  value?: Date;
  onChange?: (date?: Date) => void;
  format?: string;
  disabled?: boolean;
  clearable?: boolean;
  timezone?: string;
  hideCalendarIcon?: boolean;
  onCalendarClick?: () => void;
  /** Hide the built-in inline error message (e.g. when a parent FormMessage handles it). */
  hideError?: boolean;
  /** Override the default error message shown when the entered value is invalid. */
  errorMessage?: React.ReactNode;
};

// https://date-fns.org/v4.1.0/docs/format
type SegmentType = 'year' | 'month' | 'date' | 'hour' | 'minute' | 'second' | 'period' | 'space';

const segmentConfigs = [
  {
    type: 'year' as SegmentType,
    symbols: ['y'],
  },
  {
    type: 'month' as SegmentType,
    symbols: ['M'],
  },
  {
    type: 'date' as SegmentType,
    symbols: ['d'],
  },
  {
    type: 'hour' as SegmentType,
    symbols: ['h', 'H'],
  },
  {
    type: 'minute' as SegmentType,
    symbols: ['m'],
  },
  {
    type: 'second' as SegmentType,
    symbols: ['s'],
  },
  {
    type: 'period' as SegmentType,
    symbols: ['a'],
  },
  {
    type: 'space' as SegmentType,
    symbols: [' ', '/', '-', ':', ',', '.'],
  },
];

const mergeRefs = (...refs: any) => {
  return (node: any) => {
    for (const ref of refs) {
      if (ref) ref.current = node;
    }
  };
};
const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>((options: DateTimeInputProps, ref) => {
  const { format: formatProp, value: _value, timezone, ...rest } = options;
  const value = useMemo(() => _value ? new TZDate(_value, timezone) : undefined, [_value, timezone]);
  const form = useFormContext();
  const formatStr = React.useMemo(() => formatProp || 'dd/MM/yyyy-hh:mm aa', [formatProp]);
  const inputRef = useRef<HTMLInputElement>();

  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentAt, setSelectedSegmentAt] = useState<number | undefined>(undefined);

  // Tracks the (value, format) pair we just emitted, so we can skip re-syncing
  // segments from a value the parent merely echoed back. Without this, lossy or
  // non-bijective format(parse(s)) round-trips (e.g., across historical timezone
  // offset shifts) can drive an infinite onChange loop.
  const echoedRef = useRef<{ t: number | undefined; fmt: string } | undefined>(undefined);

  useEffect(() => {
    if (form?.formState.isSubmitted) {
      setSegments(parseFormat(formatStr, value));
    }
  }, [form?.formState.isSubmitted]);
  useEffect(() => {
    if (echoedRef.current && value?.getTime() === echoedRef.current.t && formatStr === echoedRef.current.fmt) {
      return;
    }
    setSegments(parseFormat(formatStr, value));
  }, [formatStr, value]);

  const curSegment = useMemo(() => {
    if (selectedSegmentAt === undefined || selectedSegmentAt < 0 || selectedSegmentAt >= segments.length)
      return undefined;
    return segments[selectedSegmentAt];
  }, [segments, selectedSegmentAt]);
  const setCurrentSegment = useCallback(
    (segment: Segment | undefined) => {
      const at = segments?.findIndex((s) => s.index === segment?.index);
      at !== -1 && setSelectedSegmentAt(at);
    },
    [segments, setSelectedSegmentAt]
  );

  const validSegments = useMemo(() => segments.filter((s) => s.type !== 'space'), [segments]);
  const inputStr = useMemo(() => {
    return segments.map((s) => (s.value ? s.value.padStart(s.symbols.length, '0') : s.symbols)).join('');
  }, [segments]);
  const areAllSegmentsEmpty = useMemo(() => validSegments.every((s) => !s.value), [validSegments]);

  const inputValue = useMemo(
    () => computeInputValue(segments, inputStr, formatStr, value, timezone),
    [segments, inputStr, formatStr, value, timezone]
  );
  useEffect(() => {
    if (!inputValue) return;
    if (value?.getTime() !== inputValue.getTime()) {
      echoedRef.current = { t: inputValue.getTime(), fmt: formatStr };
      options.onChange?.(inputValue);
    }
  }, [inputValue]);


  const onClick = useEventCallback(
    (event: React.MouseEvent<HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const selectionStart = inputRef.current?.selectionStart;
      if (inputRef.current && selectionStart !== undefined && selectionStart !== null) {
        const segment = findSegmentAt(segments, selectionStart);
        setCurrentSegment(segment);
        setSelection(inputRef, segment);
      }
    },
    [segments]
  );

  const onSegmentChange = useEventCallback(
    (direction: 'left' | 'right') => {
      if (!curSegment) return;
      const segment = findAdjacentSegment(segments, curSegment, direction);
      if (segment) {
        setCurrentSegment(segment);
        setSelection(inputRef, segment);
      }
    },
    [segments, curSegment]
  );

  const onSegmentValueStep = useEventCallback(
    (direction: 'up' | 'down') => {
      if (!curSegment) return;
      const updated = stepSegment(segments, curSegment, direction, { value, timezone });
      if (updated === segments) return;
      setSegments(updated);
      const focused = updated.find((s) => s.index === curSegment.index);
      if (focused) setSelection(inputRef, focused);
    },
    [segments, curSegment, value, timezone]
  );

  const onSegmentNumberValueChange = useEventCallback(
    (num: string) => {
      if (!curSegment) return;
      const { segments: updated, advance } = applyNumberInput(segments, curSegment, num, timezone);
      setSegments(updated);
      if (advance) {
        onSegmentChange('right');
      } else {
        const focused = updated.find((s) => s.index === curSegment.index);
        if (focused) setSelection(inputRef, focused);
      }
    },
    [segments, curSegment, timezone]
  );

  const onSegmentPeriodValueChange = useEventCallback(
    (key: string) => {
      if (curSegment?.type !== 'period') return;
      const updated = applyPeriodInput(segments, curSegment, key);
      if (updated !== segments) setSegments(updated);
      const focused = updated.find((s) => s.index === curSegment.index);
      if (focused) setSelection(inputRef, focused);
    },
    [segments, curSegment]
  );

  const onSegmentValueRemove = useEventCallback(() => {
    if (!curSegment) return;
    if (curSegment.value) {
      const updated = clearSegmentValue(segments, curSegment);
      setSegments(updated);
      const focused = updated.find((s) => s.index === curSegment.index);
      if (focused) setSelection(inputRef, focused);
    } else {
      onSegmentChange('left');
    }
  }, [segments, curSegment]);

  const onKeyDown = useEventCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    setSelection(inputRef, curSegment);

    switch (key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        onSegmentChange(key === 'ArrowRight' ? 'right' : 'left');
        event.preventDefault();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        onSegmentValueStep(key === 'ArrowUp' ? 'up' : 'down');
        event.preventDefault();
        break;
      case 'Backspace':
        onSegmentValueRemove();
        event.preventDefault();
        break;

      case key.match(/\d/)?.input:
        onSegmentNumberValueChange(key);
        event.preventDefault();
        break;
      case key.match(/[a-z]/)?.[0]:
        onSegmentPeriodValueChange(key);
        event.preventDefault();
        break;
    }
  }, []);

  // Soft keyboards on Android Chrome dispatch keydown with key === 'Unidentified'
  // (keyCode 229), so onKeyDown can't see the actual character. Real character
  // data arrives via beforeinput / compositionend — handle it here and dispatch
  // to the same segment updaters. Desktop keydown.preventDefault() suppresses
  // the matching beforeinput, so this path only fires for soft-keyboard / IME
  // / paste input.
  const composingRef = useRef(false);

  const dispatchChar = useEventCallback((ch: string) => {
    if (/\d/.test(ch)) {
      onSegmentNumberValueChange(ch);
    } else if (/[a-zA-Z]/.test(ch)) {
      onSegmentPeriodValueChange(ch);
    }
  }, []);

  const onCompositionStart = useEventCallback(() => {
    composingRef.current = true;
  }, []);

  // IME composition (e.g., Gboard suggestions) emits insertCompositionText
  // events which are non-cancelable and carry incremental data. Skip them in
  // beforeinput and process the final composed character here instead.
  // Only the first char is dispatched: composition data may be multi-char
  // (e.g. "am" suggestion), but our segment updaters mutate state that
  // doesn't propagate within a synchronous loop, so dispatching multiple
  // chars would route them all to a stale curSegment.
  const onCompositionEnd = useEventCallback((event: React.CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    const data = event.data;
    if (!data) return;
    dispatchChar(data[0]);
  }, []);

  const onBeforeInput = useEventCallback((event: React.FormEvent<HTMLInputElement>) => {
    const nativeEvent = event.nativeEvent as InputEvent;
    const inputType = nativeEvent.inputType;

    if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
      event.preventDefault();
      onSegmentValueRemove();
      return;
    }

    // Composition text is non-cancelable per W3C and arrives as cumulative
    // data; final value is processed via compositionend. insertFromComposition
    // is the post-commit cousin that some browsers fire after compositionend —
    // skip it to avoid double-dispatch.
    if (
      inputType === 'insertCompositionText' ||
      inputType === 'insertFromComposition' ||
      composingRef.current
    ) {
      return;
    }

    if (inputType?.startsWith('insert')) {
      const data = nativeEvent.data;
      if (!data) return;
      event.preventDefault();
      // Multi-char data (paste, drop) is intentionally dropped: segment
      // updaters mutate React state that doesn't flush within a sync loop,
      // so iterating would route every char to the same stale curSegment.
      // Single-char input (the soft-keyboard case this fix targets) works.
      if (data.length === 1) dispatchChar(data);
    }
  }, []);

  const [isFocused, setIsFocused] = useState(false);
  // Show inline error when the user has entered something but it doesn't form
  // a valid date in range. Tooltip-based hints don't surface on touch devices
  // (Radix Tooltip is hover-only by design — see issues #2589 / #1573), so we
  // follow the shadcn FormMessage pattern: a sibling <p> below the input,
  // accepting vertical layout shift (the standard form-validation behavior).
  const hasError = !inputValue && !areAllSegmentsEmpty;
  const showError = hasError && !options.hideError;
  return (
    <div className="flex flex-col gap-1">
      <div
        ref={ref}
        className={cn(
          'flex h-10 items-center justify-start rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-50',
          isFocused ? 'outline-none ring-2 ring-ring ring-offset-2' : '',
          options.hideCalendarIcon && 'ps-2',
          hasError && 'border-destructive',
          options.className
        )}
      >
        {!options.hideCalendarIcon && (
          <Button variant="ghost" size="icon" onClick={options.onCalendarClick}>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </Button>
        )}
        <input
          ref={mergeRefs(inputRef)}
          className="font-mono flex-grow min-w-0 bg-transparent py-1 px-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onClick={onClick}
          onKeyDown={onKeyDown}
          onBeforeInput={onBeforeInput}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          value={inputStr}
          placeholder={formatStr}
          onChange={() => {}}
          disabled={options.disabled}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          aria-invalid={hasError}
        />
      </div>
      {showError && (
        <p className="text-[0.8rem] font-medium text-destructive">
          {options.errorMessage ?? 'Invalid date (1900–2100)'}
        </p>
      )}
    </div>
  );
});

DateTimeInput.displayName = 'DateTimeInput';

export { DateTimeInput };

interface Segment {
  type: SegmentType;
  symbols: string;
  index: number;
  value: string;
}

// =============================================================================
// Pure logic helpers
// -----------------------------------------------------------------------------
// Kept in this file (not extracted to a separate module) to preserve the
// single-file copy-paste distribution model. They are pure functions so they
// can be unit-tested without rendering the component.
// =============================================================================

function parseFormat(formatStr: string, value?: Date) {
  const views: Segment[] = [];
  let lastPattern: any = '';
  let symbols = '';
  let patternIndex = 0;
  let index = 0;
  for (const c of formatStr) {
    const pattern = segmentConfigs.find((p) => p.symbols.includes(c))!;
    if (!pattern) continue;
    if (pattern.type !== lastPattern) {
      symbols &&
        views.push({
          type: lastPattern,
          symbols,
          index: patternIndex,
          value: value ? format(value, symbols) : '',
        });
      lastPattern = pattern?.type || '';
      symbols = c;
      patternIndex = index;
    } else {
      symbols += c;
    }
    index++;
  }
  symbols &&
    views.push({
      type: lastPattern,
      symbols,
      index: patternIndex,
      value: value ? format(value, symbols) : '',
    });
  return views;
}

/** Locate the segment under a caret position (used by onClick). */
function findSegmentAt(segments: Segment[], position: number): Segment | undefined {
  const valid = segments.filter((s) => s.type !== 'space');
  let segment = valid.find(
    (s) => s.index <= position && s.index + s.symbols.length >= position
  );
  if (!segment) segment = [...valid].reverse().find((s) => s.index <= position);
  if (!segment) segment = valid.find((s) => s.index >= position);
  return segment;
}

/** Find the next non-space segment to the left/right of `current`. */
function findAdjacentSegment(
  segments: Segment[],
  current: Segment,
  direction: 'left' | 'right'
): Segment | undefined {
  const valid = segments.filter((s) => s.type !== 'space');
  return direction === 'left'
    ? [...valid].reverse().find((s) => s.index < current.index)
    : valid.find((s) => s.index > current.index);
}

/**
 * Apply ArrowUp/ArrowDown stepping to the current segment. Returns the same
 * segments reference when no change applies (current is a space or unsupported);
 * otherwise returns a new segments array.
 */
function stepSegment(
  segments: Segment[],
  current: Segment,
  direction: 'up' | 'down',
  ctx: { value?: Date; timezone?: string }
): Segment[] {
  if (current.type === 'space') return segments;
  const delta = direction === 'up' ? 1 : -1;

  const findSeg = (type: SegmentType) => segments.find((s) => s.type === type);
  const yearSeg = findSeg('year');
  const monthSeg = findSeg('month');
  const dateSeg = findSeg('date');
  const hourSeg = findSeg('hour');
  const minuteSeg = findSeg('minute');
  const secondSeg = findSeg('second');
  const periodSeg = findSeg('period');
  const is12h = hourSeg ? hourSeg.symbols.charAt(0) === 'h' : false;

  const now = new TZDate(ctx.value || new Date(), ctx.timezone);

  const apply = (updates: Partial<Record<SegmentType, string>>): Segment[] =>
    segments.map((s) => {
      const newVal = updates[s.type];
      return newVal !== undefined ? { ...s, value: newVal } : s;
    });

  if (current.type === 'period') {
    const next = !current.value
      ? now.getHours() >= 12 ? 'PM' : 'AM'
      : current.value === 'AM' ? 'PM' : 'AM';
    return apply({ period: next });
  }

  const baseYear = yearSeg?.value ? parseInt(yearSeg.value) : now.getFullYear();
  const baseMonth = monthSeg?.value ? parseInt(monthSeg.value) - 1 : now.getMonth();
  const baseDate = dateSeg?.value ? parseInt(dateSeg.value) : now.getDate();
  let baseHour: number;
  if (hourSeg?.value) {
    const h = parseInt(hourSeg.value);
    if (is12h) {
      const isPM = periodSeg?.value === 'PM';
      baseHour = (h % 12) + (isPM ? 12 : 0);
    } else {
      baseHour = h;
    }
  } else {
    baseHour = now.getHours();
  }
  const baseMinute = minuteSeg?.value ? parseInt(minuteSeg.value) : now.getMinutes();
  const baseSecond = secondSeg?.value ? parseInt(secondSeg.value) : now.getSeconds();

  const dt = new TZDate(ctx.value || new Date(), ctx.timezone);
  dt.setFullYear(baseYear, baseMonth, 1);
  dt.setHours(baseHour, baseMinute, baseSecond, 0);
  const lastDay = endOfMonth(dt).getDate();
  dt.setDate(Math.min(baseDate, lastDay));

  // First press on an empty segment: fill with base value, no step.
  if (!current.value) {
    const updates: Partial<Record<SegmentType, string>> = {
      [current.type]: format(dt, current.symbols),
    };
    if (current.type === 'hour' && is12h && periodSeg && !periodSeg.value) {
      updates.period = now.getHours() >= 12 ? 'PM' : 'AM';
    }
    return apply(updates);
  }

  switch (current.type) {
    case 'year': {
      let y = baseYear + delta;
      if (y < 1900) y = 2099;
      if (y > 2099) y = 1900;
      dt.setFullYear(y);
      return apply({ year: format(dt, current.symbols) });
    }
    case 'month': {
      let m = baseMonth + delta;
      if (m < 0) m = 11;
      if (m > 11) m = 0;
      dt.setDate(1);
      dt.setMonth(m);
      return apply({ month: format(dt, current.symbols) });
    }
    case 'date': {
      let d = baseDate + delta;
      if (d < 1) d = lastDay;
      if (d > lastDay) d = 1;
      dt.setDate(d);
      return apply({ date: format(dt, current.symbols) });
    }
    case 'hour': {
      if (is12h) {
        const displayedH = parseInt(hourSeg!.value);
        let h = displayedH + delta;
        let nextPeriod = periodSeg?.value || (now.getHours() >= 12 ? 'PM' : 'AM');
        // Crossing the 11/12 boundary flips AM/PM in either direction.
        if ((delta > 0 && displayedH === 11) || (delta < 0 && displayedH === 12)) {
          nextPeriod = nextPeriod === 'AM' ? 'PM' : 'AM';
        }
        if (h < 1) h = 12;
        if (h > 12) h = 1;
        const updates: Partial<Record<SegmentType, string>> = {
          hour: String(h).padStart(current.symbols.length, '0'),
        };
        if (periodSeg) updates.period = nextPeriod;
        return apply(updates);
      } else {
        let h = baseHour + delta;
        if (h < 0) h = 23;
        if (h > 23) h = 0;
        dt.setHours(h);
        return apply({ hour: format(dt, current.symbols) });
      }
    }
    case 'minute': {
      let m = baseMinute + delta;
      if (m < 0) m = 59;
      if (m > 59) m = 0;
      dt.setMinutes(m);
      return apply({ minute: format(dt, current.symbols) });
    }
    case 'second': {
      let s = baseSecond + delta;
      if (s < 0) s = 59;
      if (s > 59) s = 0;
      dt.setSeconds(s);
      return apply({ second: format(dt, current.symbols) });
    }
  }
  return segments;
}

/**
 * Type a digit into the current segment. Returns updated segments plus a flag
 * indicating whether focus should advance to the next segment.
 */
function applyNumberInput(
  segments: Segment[],
  current: Segment,
  num: string,
  timezone?: string
): { segments: Segment[]; advance: boolean } {
  if (current.type === 'period') {
    return { segments, advance: false };
  }
  const length = current.symbols.length;
  const rawValue = parseInt(current.value).toString();
  let newValue = rawValue.length < length ? rawValue + num : num;
  let parsedDate = parse(newValue.padStart(length, '0'), current.symbols, safeDate(timezone));
  if (!isValid(parsedDate) && newValue.length > 1) {
    newValue = num;
    parsedDate = parse(newValue, current.symbols, safeDate(timezone));
  }
  const updated = segments.map((s) => (s.index === current.index ? { ...current, value: newValue } : s));
  let advance = newValue.length === length;
  if (!advance) {
    switch (current.type) {
      case 'month':
        advance = +newValue > 1;
        break;
      case 'date':
        advance = +newValue > 3;
        break;
      case 'hour':
        advance = +newValue > (current.symbols.includes('H') ? 2 : 1);
        break;
      case 'minute':
      case 'second':
        advance = +newValue > 5;
        break;
      default:
        break;
    }
  }
  return { segments: updated, advance };
}

/** Type 'a'/'p' (case-insensitive) into a period segment. */
function applyPeriodInput(segments: Segment[], current: Segment, key: string): Segment[] {
  if (current.type !== 'period') return segments;
  const k = key?.toLowerCase();
  let newValue = '';
  if (k === 'a') newValue = 'AM';
  else if (k === 'p') newValue = 'PM';
  else return segments;
  return segments.map((s) => (s.index === current.index ? { ...current, value: newValue } : s));
}

/** Clear the value of the current segment. */
function clearSegmentValue(segments: Segment[], current: Segment): Segment[] {
  return segments.map((s) => (s.index === current.index ? { ...current, value: '' } : s));
}

/**
 * Compute a Date from filled segments. Returns undefined if any non-space
 * segment is empty, the parse fails, or the year falls outside (1900, 2100).
 */
function computeInputValue(
  segments: Segment[],
  inputStr: string,
  formatStr: string,
  refDate?: Date,
  timezone?: string
): Date | undefined {
  const valid = segments.filter((s) => s.type !== 'space');
  if (valid.length === 0) return undefined;
  if (valid.some((s) => !s.value)) return undefined;
  const date = parse(inputStr, formatStr, refDate || new TZDate(new Date(), timezone));
  const year = getYear(date);
  if (isValid(date) && year > 1900 && year < 2100) return date;
  return undefined;
}

const safeDate = (timezone?: string) => {
  return new TZDate('2000-01-01T00:00:00', timezone);
};

const isAndroid = () => /Android/i.test(navigator.userAgent);

function setSelection(ref: React.MutableRefObject<HTMLInputElement | undefined>, segment?: Segment) {
  if (!ref.current || !segment) return;
  safeSetSelection(ref.current, segment.index, segment.index + segment.symbols.length);
}

function safeSetSelection(element: HTMLInputElement, selectionStart: number, selectionEnd: number) {
  requestAnimationFrame(() => {
    if (document.activeElement === element) {
      if (isAndroid()) {
        requestAnimationFrame(() => {
          element.setSelectionRange(selectionStart, selectionEnd, 'none');
        });
      } else {
        element.setSelectionRange(selectionStart, selectionEnd, 'none');
      }
    }
  });
}
export function useEventCallback<T extends Function>(fn: T, deps: any[]) {
  const ref = useRef(fn);
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: any[]) => {
    return ref.current?.(...args);
  }, deps);
}

export const useIsomorphicLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

// Pure helpers exported for unit testing. These are intentionally exported
// from this single file (rather than moved to a sibling module) to preserve
// the single-file copy-paste model.
export {
  parseFormat,
  findSegmentAt,
  findAdjacentSegment,
  stepSegment,
  applyNumberInput,
  applyPeriodInput,
  clearSegmentValue,
  computeInputValue,
};
export type { Segment, SegmentType };
