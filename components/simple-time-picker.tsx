import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Clock, ChevronDownIcon, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  format,
  parse,
  setHours,
  startOfHour,
  endOfHour,
  setMinutes,
  startOfMinute,
  endOfMinute,
  setSeconds,
} from 'date-fns';

interface SimpleTimeOption {
  value: any;
  label: string;
  disabled?: boolean;
}

const AM_VALUE = 0;
const PM_VALUE = 1;

export function SimpleTimePicker({
  value,
  onChange,
  use12HourFormat,
  minDate,
  maxDate,
  disabled,
}: {
  use12HourFormat?: boolean;
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}) {
  // hours24h = HH
  // hours12h = hh
  const formatStr = useMemo(
    () => (use12HourFormat ? 'yyyy-MM-dd hh:mm:ss.SSS a xxxx' : 'yyyy-MM-dd HH:mm:ss.SSS xxxx'),
    [use12HourFormat]
  );
  const [ampm, setAmpm] = useState(format(value, 'a') === 'AM' ? AM_VALUE : PM_VALUE);
  const [hour, setHour] = useState(use12HourFormat ? +format(value, 'hh') : value.getHours());
  const [minute, setMinute] = useState(value.getMinutes());
  const [second, setSecond] = useState(value.getSeconds());

  useEffect(() => {
    onChange(buildTime({ use12HourFormat, value, formatStr, hour, minute, second, ampm }));
  }, [hour, minute, second, ampm, use12HourFormat]);

  const _hourIn24h = useMemo(() => {
    if (use12HourFormat) {
      return ampm === AM_VALUE ? (hour == 0 ? 12 : hour) : hour == 12 ? 0 : hour + 12;
    }
    return hour;
  }, [hour, use12HourFormat, ampm]);

  const hours: SimpleTimeOption[] = useMemo(
    () =>
      Array.from({ length: use12HourFormat ? 12 : 24 }, (_, i) => {
        let disabled = false;
        let hourValue = i;
        if (use12HourFormat) {
          hourValue = i === 0 ? 12 : i;
        }
        const hDate = setHours(
          value,
          ampm === AM_VALUE ? (hourValue == 0 ? 12 : hourValue) : hourValue == 12 ? 0 : hourValue + 12
        );
        const hStart = startOfHour(hDate);
        const hEnd = endOfHour(hDate);
        if (minDate && hEnd < minDate) disabled = true;
        if (maxDate && hStart > maxDate) disabled = true;
        return {
          value: hourValue,
          label: hourValue.toString().padStart(2, '0'),
          disabled,
        };
      }),
    [value, minDate, maxDate, use12HourFormat]
  );
  const minutes: SimpleTimeOption[] = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        let disabled = false;
        const mDate = setMinutes(setHours(value, _hourIn24h), i);
        const mStart = startOfMinute(mDate);
        const mEnd = endOfMinute(mDate);
        if (minDate && mEnd < minDate) disabled = true;
        if (maxDate && mStart > maxDate) disabled = true;
        return {
          value: i,
          label: i.toString().padStart(2, '0'),
          disabled,
        };
      }),
    [value, hour, minDate, maxDate, _hourIn24h]
  );
  const seconds: SimpleTimeOption[] = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        let disabled = false;
        const sDate = setSeconds(setMinutes(setHours(value, _hourIn24h), minute), i);
        if (minDate && sDate < minDate) disabled = true;
        if (maxDate && sDate > maxDate) disabled = true;
        return {
          value: i,
          label: i.toString().padStart(2, '0'),
          disabled,
        };
      }),
    [value, hour, minute, minDate, maxDate, _hourIn24h]
  );
  const ampmOptions = useMemo(() => {
    return [
      { value: AM_VALUE, label: 'AM', disabled: false },
      { value: PM_VALUE, label: 'PM', disabled: false },
    ];
  }, [hour, use12HourFormat]);

  const [open, setOpen] = useState(false);

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        hourRef.current?.scrollIntoView({ behavior: 'auto' });
        minuteRef.current?.scrollIntoView({ behavior: 'auto' });
        secondRef.current?.scrollIntoView({ behavior: 'auto' });
      }
    }, 1);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const onHourChange = useCallback(
    (v: SimpleTimeOption) => {
      if (minDate) {
        let newTime = buildTime({ use12HourFormat, value, formatStr, hour: v.value, minute, second, ampm });
        if (newTime < minDate) {
          newTime = setSeconds(newTime, minDate.getSeconds());
          setSecond(newTime.getSeconds());
          if (newTime < minDate) {
            newTime = setMinutes(newTime, minDate.getMinutes());
            setMinute(newTime.getMinutes());
          }
        }
      }
      setHour(v.value);
    },
    [setHour, use12HourFormat, value, formatStr, minute, second, ampm]
  );

  const onMinuteChange = useCallback(
    (v: SimpleTimeOption) => {
      if (minDate) {
        let newTime = buildTime({ use12HourFormat, value, formatStr, hour: v.value, minute, second, ampm });
        if (newTime < minDate) {
          newTime = setSeconds(newTime, minDate.getSeconds());
          setSecond(newTime.getSeconds());
        }
      }
      setMinute(v.value);
    },
    [setMinute, use12HourFormat, value, formatStr, hour, second, ampm]
  );

  const display = useMemo(() => {
    return format(value, use12HourFormat ? 'hh:mm:ss a' : 'HH:mm:ss');
  }, [value, use12HourFormat]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button disabled={disabled} variant="outline" role="combobox" aria-expanded={open} className="justify-between">
          <Clock className="mr-2 size-4" />
          {display}
          <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="top">
        <div className="flex-col gap-2 p-2">
          <div className="flex h-56 grow">
            <div className="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
              {hours.map((v) => (
                <div ref={v.value === hour ? hourRef : undefined} key={v.value}>
                  <TimeItem option={v} selected={v.value === hour} onSelect={onHourChange} className="h-8" />
                </div>
              ))}
            </div>
            <div className="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
              {minutes.map((v) => (
                <div ref={v.value === minute ? minuteRef : undefined} key={v.value}>
                  <TimeItem option={v} selected={v.value === minute} onSelect={onMinuteChange} className="h-8" />
                </div>
              ))}
            </div>
            <div className="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
              {seconds.map((v) => (
                <div ref={v.value === second ? secondRef : undefined} key={v.value}>
                  <TimeItem
                    option={v}
                    selected={v.value === second}
                    onSelect={(v) => setSecond(v.value)}
                    className="h-8"
                  />
                </div>
              ))}
            </div>
            {use12HourFormat && (
              <div className="flex grow flex-col items-stretch overflow-y-auto pe-2">
                {ampmOptions.map((v) => (
                  <TimeItem
                    key={v.value}
                    option={v}
                    selected={v.value === ampm}
                    onSelect={(v) => setAmpm(v.value)}
                    className="h-8"
                    disabled={v.disabled}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const TimeItem = ({
  option,
  selected,
  onSelect,
  className,
  disabled,
}: {
  option: SimpleTimeOption;
  selected: boolean;
  onSelect: (option: SimpleTimeOption) => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <Button
      variant="ghost"
      className={cn('flex justify-center px-1 pe-2 ps-1', className)}
      onClick={() => onSelect(option)}
      disabled={disabled}
    >
      <div className="w-4">{selected && <CheckIcon className="my-auto size-4" />}</div>
      <span className="ms-2">{option.label}</span>
    </Button>
  );
};

interface BuildTimeOptions {
  use12HourFormat?: boolean;
  value: Date;
  formatStr: string;
  hour: number;
  minute: number;
  second: number;
  ampm: number;
}

function buildTime(options: BuildTimeOptions) {
  const { use12HourFormat, value, formatStr, hour, minute, second, ampm } = options;
  let date: Date;
  if (use12HourFormat) {
    const dateStrRaw = format(value, formatStr);
    // yyyy-MM-dd hh:mm:ss.SSS a zzzz
    // 2024-10-14 01:20:07.524 AM GMT+00:00
    let dateStr = dateStrRaw.slice(0, 11) + hour.toString().padStart(2, '0') + dateStrRaw.slice(13);
    dateStr = dateStr.slice(0, 14) + minute.toString().padStart(2, '0') + dateStr.slice(16);
    dateStr = dateStr.slice(0, 17) + second.toString().padStart(2, '0') + dateStr.slice(19);
    dateStr = dateStr.slice(0, 24) + (ampm == AM_VALUE ? 'AM' : 'PM') + dateStr.slice(26);
    date = parse(dateStr, formatStr, value);
  } else {
    date = setHours(setMinutes(setSeconds(value, second), minute), hour);
  }
  return date;
}
