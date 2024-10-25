import * as React from 'react';

import { cn } from '@/lib/utils';
import { format, parse, isValid, getYear } from 'date-fns';
import { useRef, useState, useMemo, useEffect, useLayoutEffect, useCallback } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';

type DateTimeInputProps = {
  className?: string;
  value?: Date;
  onChange?: (date?: Date) => void;
  format?: string;
  disabled?: boolean;
  hideCalendarIcon?: boolean;
  onCalendarClick?: () => void;
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
  const { format: formatProp, value, ...rest } = options;
  const form = useFormContext();
  useEffect(() => {
    if (form?.formState.isSubmitted) {
      setSegments(parseFormat(formatStr, value));
    }
  }, [form?.formState.isSubmitted]);
  const formatStr = React.useMemo(() => formatProp || 'dd/MM/yyyy-hh:mm aa', [formatProp]);
  const inputRef = useRef<HTMLInputElement>();

  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentAt, setSelectedSegmentAt] = useState<number | undefined>(undefined);
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

  const datetimeStr = useMemo(() => {
    return segments.map((s) => (s.value ? s.value.padStart(s.symbols.length, '0') : s.symbols)).join('');
  }, [segments]);
  const validDatetimeStr = useMemo(() => {
    return !!segments.some((s) => !s.value);
  }, [segments]);

  useEffect(() => {
    if (!validDatetimeStr) return;
    const date = parse(datetimeStr, formatStr, new Date(), {});
    const year = getYear(date);
    if (isValid(date) && year > 1900 && year < 2100) {
      options.onChange?.(date);
    }
  }, [datetimeStr, value, validDatetimeStr]);

  useEffect(() => {
    setSegments(parseFormat(formatStr, value));
  }, [formatStr, value]);

  const onClick = useEventCallback(
    (event: React.MouseEvent<HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const selectionStart = inputRef.current?.selectionStart;
      if (inputRef.current && selectionStart !== undefined && selectionStart !== null) {
        const validSegments = segments.filter((s) => s.type !== 'space');
        let segment = validSegments.find(
          (s) => s.index <= selectionStart && s.index + s.symbols.length >= selectionStart
        );
        !segment && (segment = [...validSegments].reverse().find((s) => s.index <= selectionStart));
        !segment && (segment = validSegments.find((s) => s.index >= selectionStart));
        setCurrentSegment(segment);
        setSelection(inputRef, segment);
      }
    },
    [segments]
  );

  const onSegmentChange = useEventCallback(
    (direction: 'left' | 'right') => {
      if (!curSegment) return;
      const validSegments = segments.filter((s) => s.type !== 'space');
      const segment =
        direction === 'left'
          ? [...validSegments].reverse().find((s) => s.index < curSegment.index)
          : validSegments.find((s) => s.index > curSegment.index);
      if (segment) {
        setCurrentSegment(segment);
        setSelection(inputRef, segment);
      }
    },
    [segments, curSegment]
  );

  const onSegmentNumberValueChange = useEventCallback(
    (num: string) => {
      if (!curSegment) return;
      let segment = curSegment;
      let shouldNext = false;
      if (segment.type !== 'period') {
        const length = segment.symbols.length;
        const rawValue = parseInt(segment.value).toString();
        let newValue = rawValue.length < length ? rawValue + num : num;
        let parsedDate = parse(newValue.padStart(length, '0'), segment.symbols, safeDate());
        if (!isValid(parsedDate) && newValue.length > 1) {
          newValue = num;
          parsedDate = parse(newValue, segment.symbols, safeDate());
        }
        const updatedSegments = segments.map((s) => (s.index === segment.index ? { ...segment, value: newValue } : s));
        setSegments(updatedSegments);
        segment = updatedSegments.find((s) => s.index === segment.index)!;
        shouldNext = newValue.length === length;
        if (!shouldNext) {
          switch (segment.type) {
            case 'month':
              shouldNext = +newValue > 1;
              break;
            case 'date':
              shouldNext = +newValue > 3;
              break;
            case 'hour':
              shouldNext = +newValue > (segment.symbols.includes('H') ? 2 : 1);
              break;
            case 'minute':
            case 'second':
              shouldNext = +newValue > 5;
              break;
            default:
              break;
          }
        }
      }
      shouldNext ? onSegmentChange('right') : setSelection(inputRef, segment);
    },
    [segments, curSegment]
  );

  const onSegmentPeriodValueChange = useEventCallback(
    (key: string) => {
      if (curSegment?.type !== 'period') return;
      let segment = curSegment;
      let ok = false;
      let newValue = '';
      if (key?.toLowerCase() === 'a') {
        newValue = 'AM';
        ok = true;
      } else if (key?.toLowerCase() === 'p') {
        newValue = 'PM';
        ok = true;
      }
      if (ok) {
        const updatedSegments = segments.map((s) => (s.index === segment.index ? { ...segment, value: newValue } : s));
        setSegments(updatedSegments);
        segment = updatedSegments.find((s) => s.index === segment.index)!;
      }
      setSelection(inputRef, segment);
    },
    [segments, curSegment]
  );

  const onSegmentValueRemove = useEventCallback(() => {
    if (!curSegment) return;
    if (curSegment.value) {
      const updatedSegments = segments.map((s) => (s.index === curSegment.index ? { ...curSegment, value: '' } : s));
      setSegments(updatedSegments);
      const segment = updatedSegments.find((s) => s.index === curSegment.index)!;
      setSelection(inputRef, segment);
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
      // case 'ArrowUp':
      // case 'ArrowDown':
      //   // onSegmentValueChange?.(event);
      //   event.preventDefault();
      //   break;
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

  const [isFocused, setIsFocused] = useState(false);
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-10 items-center justify-start rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-50',
        isFocused ? 'outline-none ring-2 ring-ring ring-offset-2' : '',
        options.hideCalendarIcon && 'ps-2',
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
        className="font-mono flex-grow min-w-0 bg-transparent py-1 pe-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={onClick}
        onKeyDown={onKeyDown}
        value={datetimeStr}
        placeholder={formatStr}
        onChange={() => {}}
        disabled={options.disabled}
        spellCheck={false}
      />
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

const safeDate = () => {
  return new Date('2000-01-01T00:00:00');
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
