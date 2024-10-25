import * as React from 'react';

import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { format, parse, isValid, getYear } from 'date-fns';
import { useRef, useState, useMemo, useEffect, useLayoutEffect, useCallback } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';

type DateTimeInputProps = {
  className?: string;
  value?: Date;
  onChange?: (date?: Date) => void;
  format?: string;
  disabled?: boolean;
  hideCalendarIcon?: boolean;
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
  const formatStr = React.useMemo(() => formatProp || 'dd/MM/yyyy-hh:mm aa', [formatProp]);
  const inputRef = useRef<HTMLInputElement>();

  const [segments, setSegments] = useState<Segment[]>([]);
  const [curSegment, setCurrentSegment] = useState<Segment | undefined>(undefined);

  const datetimeStr = useMemo(() => {
    return segments.map((s) => (s.value ? s.value.padStart(s.symbols.length, '0') : s.symbols)).join('');
  }, [segments]);

  useEffect(() => {
    const date = parse(datetimeStr, formatStr, options.value || new Date());
    const year = getYear(date);
    if (isValid(date) && year > 1900 && year < 2100) {
      options.onChange?.(date);
    }
  }, [datetimeStr]);

  useLayoutEffect(() => {
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
      let shouldNext = false;
      if (curSegment.type !== 'period') {
        const length = curSegment.symbols.length;
        let newValue = curSegment.value.length < length ? curSegment.value + num : num;
        let parsedDate = parse(newValue.padStart(length, '0'), curSegment.symbols, safeDate());
        if (!isValid(parsedDate) && newValue.length > 1) {
          newValue = num;
          parsedDate = parse(newValue, curSegment.symbols, safeDate());
        }
        curSegment.value = newValue;
        setSegments([...segments]);
        shouldNext = curSegment.value.length === length;
        if (!shouldNext) {
          switch (curSegment.type) {
            case 'month':
              shouldNext = +curSegment.value > 1;
              break;
            case 'date':
              shouldNext = +curSegment.value > 3;
              break;
            case 'hour':
              shouldNext = +curSegment.value > (curSegment.symbols.includes('H') ? 2 : 1);
              break;
            case 'minute':
            case 'second':
              shouldNext = +curSegment.value > 5;
              break;
            default:
              break;
          }
        }
      }
      shouldNext ? onSegmentChange('right') : setSelection(inputRef, curSegment);
    },
    [segments, curSegment]
  );

  const onSegmentPeriodValueChange = useEventCallback(
    (key: string) => {
      if (curSegment?.type !== 'period') return;
      let ok = false;
      if (key?.toLowerCase() === 'a') {
        curSegment.value = 'AM';
        ok = true;
      } else if (key?.toLowerCase() === 'p') {
        curSegment.value = 'PM';
        ok = true;
      }
      if (ok) {
        setSegments([...segments]);
      }
      setSelection(inputRef, curSegment);
    },
    [segments, curSegment]
  );

  const onSegmentValueRemove = useEventCallback(() => {
    if (!curSegment) return;
    if (curSegment.value) {
      curSegment.value = '';
      setSegments([...segments]);
      setSelection(inputRef, curSegment);
    } else {
      onSegmentChange('left');
    }
  }, [segments, curSegment]);

  const onKeyDown = useEventCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    setSelection(inputRef, curSegment);

    console.log('onKeyDown', key);

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
        <Button variant="ghost" size="icon">
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
        views.push({ type: lastPattern, symbols, index: patternIndex, value: value ? format(value, symbols) : '' });
      lastPattern = pattern?.type || '';
      symbols = c;
      patternIndex = index;
    } else {
      symbols += c;
    }
    index++;
  }
  symbols &&
    views.push({ type: lastPattern, symbols, index: patternIndex, value: value ? format(value, symbols) : '' });
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
  console.log('safeSetSelection', selectionStart, selectionEnd);
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
