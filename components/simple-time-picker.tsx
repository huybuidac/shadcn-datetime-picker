import { useEffect, useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Clock, ChevronDownIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


interface SimpleTimeOption {
  value: number;
  label: string;
}

export function SimpleTimePicker({
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
  const hours: SimpleTimeOption[] = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        let disabled = false;
        return {
          value: i,
          label: i.toString().padStart(2, '0'),
        };
      }),
    []
  );
  const minutes: SimpleTimeOption[] = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        return {
          value: i,
          label: i.toString().padStart(2, '0'),
        };
      }),
    []
  );
  const seconds: SimpleTimeOption[] = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        return {
          value: i,
          label: i.toString().padStart(2, '0'),
        };
      }),
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