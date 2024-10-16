import { useEffect, useMemo, useRef, useState } from 'react';
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
    if (use12HourFormat) {
      const dateStrRaw = format(value, formatStr);
      // yyyy-MM-dd hh:mm:ss.SSS a zzzz
      // 2024-10-14 01:20:07.524 AM GMT+00:00
      let dateStr = dateStrRaw.slice(0, 11) + hour.toString().padStart(2, '0') + dateStrRaw.slice(13);
      dateStr = dateStr.slice(0, 14) + minute.toString().padStart(2, '0') + dateStr.slice(16);
      dateStr = dateStr.slice(0, 17) + second.toString().padStart(2, '0') + dateStr.slice(19);
      dateStr = dateStr.slice(0, 24) + (ampm == AM_VALUE ? 'AM' : 'PM') + dateStr.slice(26);
      onChange(parse(dateStr, formatStr, value));
    } else {
      onChange(setHours(setMinutes(setSeconds(value, second), minute), hour));
    }
  }, [hour, minute, second, ampm, use12HourFormat]);

  const hours: SimpleTimeOption[] = useMemo(
    () =>
      Array.from({ length: use12HourFormat ? 12 : 24 }, (_, i) => {
        let disabled = false;
        let hourValue = i;
        if (use12HourFormat) {
          hourValue = i === 0 ? 12 : i;
        }
        const hDate = setHours(value, hourValue);
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
        const mDate = setMinutes(setHours(value, hour), i);
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
    [value, hour, minDate, maxDate]
  );
  const seconds: SimpleTimeOption[] = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        let disabled = false;
        const sDate = setSeconds(setMinutes(setHours(value, hour), minute), i);
        if (minDate && sDate < minDate) disabled = true;
        if (maxDate && sDate > maxDate) disabled = true;
        return {
          value: i,
          label: i.toString().padStart(2, '0'),
          disabled,
        };
      }),
    [value, hour, minute, minDate, maxDate]
  );
  const ampmOptions = useMemo(() => {
    return [
      { value: AM_VALUE, label: 'AM', disabled: false },
      { value: PM_VALUE, label: 'PM', disabled: false },
    ];
  }, [hour, use12HourFormat]);

  const [open, setOpen] = useState(false);

  const hourContainer = useRef<HTMLDivElement>(null);
  const minuteContainer = useRef<HTMLDivElement>(null);
  const secondContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        const hourIndex = hours.findIndex((v) => v.value === hour);
        hourContainer.current?.scrollTo({
          top: (hourContainer.current?.scrollHeight * hourIndex) / hours.length,
          behavior: 'smooth',
        });
        minuteContainer.current?.scrollTo({
          top: (minuteContainer.current?.scrollHeight * minute) / minutes.length,
          behavior: 'smooth',
        });
        secondContainer.current?.scrollTo({
          top: (secondContainer.current?.scrollHeight * second) / seconds.length,
          behavior: 'smooth',
        });
      }
    }, 200);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
          {/* <div className={`grid ${use12HourFormat ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <Label className="pe-5 text-right font-bold">Hour</Label>
            <Label className="pe-5 text-right font-bold">Minute</Label>
            <Label className="pe-5 text-right font-bold">Second</Label>
            {use12HourFormat && <Label className="pe-5 text-right font-bold">AM/PM</Label>}
          </div> */}
          <div className="flex h-[220px] grow">
            <div className="flex grow flex-col items-stretch overflow-y-auto pe-2" ref={hourContainer}>
              {hours.map((v) => (
                <TimeItem
                  key={v.value}
                  option={v}
                  selected={v.value === hour}
                  onSelect={(v) => setHour(v.value)}
                  className="h-8"
                />
              ))}
            </div>
            <div className="flex grow flex-col items-stretch overflow-y-auto pe-2" ref={minuteContainer}>
              {minutes.map((v) => (
                <TimeItem
                  key={v.value}
                  option={v}
                  selected={v.value === minute}
                  onSelect={(v) => setMinute(v.value)}
                  className="h-8"
                />
              ))}
            </div>
            <div className="flex grow flex-col items-stretch overflow-y-auto pe-2" ref={secondContainer}>
              {seconds.map((v) => (
                <TimeItem
                  key={v.value}
                  option={v}
                  selected={v.value === second}
                  onSelect={(v) => setSecond(v.value)}
                  className="h-8"
                />
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
