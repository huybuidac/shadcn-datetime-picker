'use client';

import { DateTimePicker } from '@/components/datetime-picker';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import {
  subHours,
  addMonths,
} from 'date-fns';
import { Label } from '@/components/ui/label';
import { SimpleTimePicker } from '@/components/simple-time-picker';

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [date2, setDate2] = useState<Date | undefined>(new Date());
  const minDate = useMemo(() => subHours(new Date(), 2), []);
  const maxDate = useMemo(() => addMonths(new Date(), 2), []);

  const [time, setTime] = useState<Date>(new Date());

  return (
    <div className="grid grid-rows-[20px_1fr_20px]  justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2  sm:items-start">
        <div className="flex-1 m-20 flex flex-col gap-4 w-[270px]">
          <a
            href="https://github.com/huybuidac/shadcn-datetime-picker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View on GitHub
          </a>
          <h2 className="text-xl font-bold mt-4">Datetime Picker</h2>
          <DateTimePicker use12HourFormat={false} value={date} onChange={setDate} />
          <h2 className="text-xl font-bold  mt-4">With timezone = UTC</h2>
          <DateTimePicker value={date} onChange={setDate} timezone="UTC" />
          <h2 className="text-xl font-bold  mt-4">Disabled</h2>
          <DateTimePicker use12HourFormat={false} value={date} onChange={setDate} disabled={true} />
          <h2 className="text-xl font-bold  mt-4">Custom trigger</h2>
          <DateTimePicker
            value={date}
            onChange={setDate}
            renderTrigger={({value}) => <Button>{value?.toLocaleString() || 'Select a date'}</Button>}
          />
          <h2 className="text-xl font-bold  mt-4">With min and max date</h2>
          <Label>Min date: {minDate.toLocaleString()}</Label>
          <Label>Max date: {maxDate.toLocaleString()}</Label>
          <DateTimePicker value={date2} onChange={setDate2} min={minDate} max={maxDate} />
          <h2 className="text-xl font-bold  mt-4">Simple Time Picker</h2>
          <SimpleTimePicker use12HourFormat={true} value={time} onChange={setTime} />
        </div>
      </main>
    </div>
  );
}
function addDays(arg0: Date, arg1: number): any {
  throw new Error('Function not implemented.');
}

function subDays(arg0: Date, arg1: number): any {
  throw new Error('Function not implemented.');
}

