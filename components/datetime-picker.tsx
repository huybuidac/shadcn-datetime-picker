'use client';

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format, getMonth, getYear, setHours, setMinutes, setMonth, setSeconds, setYear } from 'date-fns';
import { tz } from '@date-fns/tz';
import { CheckIcon, ChevronDownIcon, Clock } from 'lucide-react';
import { DayPicker, TZDate, formatMonthDropdown } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DateTimePicker({
  value,
  onChange,
  timezone,
  renderTrigger,
}: {
  value: Date | undefined;
  onChange: (date: Date) => void;
  timezone?: string;
  renderTrigger?: (value: Date | undefined, timezone?: string) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const initDate = useMemo(() => new TZDate(value || new Date(), timezone), [value, timezone]);

  const [date, setDate] = useState<Date>(initDate);
  const [hour, setHour] = useState(initDate.getHours());
  const [minute, setMinute] = useState(date.getMinutes());
  const [second, setSecond] = useState(date.getSeconds());

  const onMonthChanged = useCallback((month: number) => setDate(setMonth(date, month)), [date]);
  const onYearChanged = useCallback((year: number) => setDate(setYear(date, year)), [date]);
  const onSumbit = useCallback(() => {
    let d = setHours(date, hour);
    d = setMinutes(d, minute);
    d = setSeconds(d, second);
    onChange(d);
    setOpen(false);
  }, [date, hour, minute, second, onChange]);

  useEffect(() => {
    if (open) {
      setDate(initDate);
      setHour(initDate.getHours());
      setMinute(initDate.getMinutes());
      setSecond(initDate.getSeconds());
    }
  }, [open, initDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderTrigger ? (
          renderTrigger(value, timezone)
        ) : (
          <Button
            variant={'outline'}
            className={cn('flex justify-start font-normal', !date && 'text-muted-foreground')}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? (
              format(value, 'MMM d, yyyy, HH:mm:ss', timezone ? { in: tz(timezone) } : undefined)
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <DayPicker
          timeZone={timezone}
          mode="single"
          selected={date}
          onSelect={(d) => d && setDate(d)}
          captionLayout="dropdown"
          classNames={{
            dropdowns: 'flex w-full gap-2',
            months: 'flex w-full',
            month: 'flex flex-col w-full',
            month_caption: 'flex w-full',
            button_previous: 'hidden',
            button_next: 'hidden',
            month_grid: 'w-full border-collapse',
            weekdays: 'flex justify-between mt-2',
            weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
            week: 'flex w-full justify-between mt-2',
            day: 'h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-1',
            day_button: cn(
              buttonVariants({ variant: 'ghost' }),
              'size-9 rounded-md p-0 font-normal aria-selected:opacity-100'
            ),
            range_end: 'day-range-end',
            selected:
              'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md rounded-r-md',
            today: 'bg-accent text-accent-foreground',
            outside:
              'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
            disabled: 'text-muted-foreground opacity-50',
            range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
            hidden: 'invisible',
          }}
          showOutsideDays={true}
          components={{
            MonthsDropdown: (props) =>
              MonthSelect({ value: getMonth(date), options: props.options!, onChange: onMonthChanged }),
            YearsDropdown: () => YearSelect({ value: getYear(date), onChange: onYearChanged }),
          }}
        />
        <div className="flex flex-col gap-2">
          <TimePicker
            hour={hour}
            minute={minute}
            second={second}
            onHourChanged={setHour}
            onMinuteChanged={setMinute}
            onSecondChanged={setSecond}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm">Timezone: {timezone || 'Local'}</span>
            <Button className="ms-2 h-7 px-2" onClick={onSumbit}>
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface TimeOption {
  value: number;
  label: string;
}

function TimePicker({
  hour,
  minute,
  second,
  onHourChanged,
  onMinuteChanged,
  onSecondChanged,
}: {
  hour: number;
  minute: number;
  second: number;
  onHourChanged: (hour: number) => void;
  onMinuteChanged: (minute: number) => void;
  onSecondChanged: (second: number) => void;
}) {
  const hours: TimeOption[] = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        value: i,
        label: i.toString().padStart(2, '0'),
      })),
    []
  );
  const minutes: TimeOption[] = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        value: i,
        label: i.toString().padStart(2, '0'),
      })),
    []
  );
  const seconds: TimeOption[] = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        value: i,
        label: i.toString().padStart(2, '0'),
      })),
    []
  );
  const display = useMemo(() => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second
      .toString()
      .padStart(2, '0')}`;
  }, [hour, minute, second]);
  const [open, setOpen] = useState(false);

  const hourContainer = useRef<HTMLDivElement>(null);
  const minuteContainer = useRef<HTMLDivElement>(null);
  const secondContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        hourContainer.current?.scrollTo({ top: hour * 32 - 80, behavior: 'smooth' });
        minuteContainer.current?.scrollTo({ top: minute * 32 - 80, behavior: 'smooth' });
        secondContainer.current?.scrollTo({ top: second * 32 - 80, behavior: 'smooth' });
      }
    }, 200);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between">
          <Clock className="mr-2 size-4" />
          {display}
          <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="top">
        <div className="flex-col gap-2 p-2">
          <div className="grid grid-cols-3">
            <Label className="pe-5 text-right font-bold">Hour</Label>
            <Label className="pe-5 text-right font-bold">Minute</Label>
            <Label className="pe-5 text-right font-bold">Second</Label>
          </div>
          <div className="flex h-[220px] grow">
            <div className="flex grow flex-col items-stretch overflow-y-auto pe-2" ref={hourContainer}>
              {hours.map((v) => (
                <TimeItem
                  key={v.value}
                  option={v}
                  selected={v.value === hour}
                  onSelect={(v) => onHourChanged(v.value)}
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
                  onSelect={(v) => onMinuteChanged(v.value)}
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
                  onSelect={(v) => onSecondChanged(v.value)}
                  className="h-8"
                />
              ))}
            </div>
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
}: {
  option: TimeOption;
  selected: boolean;
  onSelect: (option: TimeOption) => void;
  className?: string;
}) => {
  return (
    <Button
      variant="ghost"
      className={cn('flex justify-center px-1 pe-2 ps-1', className)}
      onClick={() => onSelect(option)}
    >
      <div className="w-4">{selected && <CheckIcon className="my-auto size-4" />}</div>
      <span className="ms-2">{option.label}</span>
    </Button>
  );
};

function YearSelect({ value, onChange }: { value: number; onChange: (year: number) => void }): React.JSX.Element {
  const [year, setYear] = useState(value);
  const [open, setOpen] = useState(false);

  const onSubmit = useCallback(() => {
    setOpen(false);
    if (year > 1970) {
      onChange(year);
    }
  }, [year, onChange]);

  useEffect(() => {
    if (open) {
      // reset when open
      setYear(value);
    }
  }, [open, value]);

  return (
    <DropdownMenu modal={true} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex w-full justify-between py-2 pe-[6px] ps-3">
          {value}
          <ChevronDownIcon className="ml-1 size-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex flex-col gap-2 p-2">
          <Label>Year</Label>
          <div className="flex gap-2">
            <Input type="number" value={year} onChange={(e) => setYear(+e.target.value)} />
            <Button onClick={onSubmit}>Done</Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MonthSelect({
  value,
  options,
  onChange,
}: {
  value: number;
  options: { value: number; label: string }[];
  onChange: (month: number) => void;
}): React.JSX.Element {
  return (
    <Select
      value={value?.toString()}
      onValueChange={(value) => {
        onChange(+value);
      }}
    >
      <SelectTrigger className="pr-1.5 focus:ring-0">
        <SelectValue className="grow">{formatMonthDropdown(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper">
        <ScrollArea className="h-80">
          {options.map((option) => (
            <SelectItem key={`${option.value}`} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
