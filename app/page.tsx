'use client';

import { DateTimePicker } from '@/components/datetime-picker';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex-1 m-20 flex flex-col gap-10 w-[270px]">
          <h2 className="text-xl font-bold">Datetime Picker</h2>
          <DateTimePicker value={date} onChange={setDate} />
          <h2 className="text-xl font-bold mt-10">Datetime Picker with timezone = UTC</h2>
          <DateTimePicker value={date} onChange={setDate} timezone="UTC" />
          <h2 className="text-xl font-bold mt-10">Datetime Picker custom trigger</h2>
          <DateTimePicker value={date} onChange={setDate} renderTrigger={(value) => <Button>{value?.toLocaleString()}</Button>} />
        </div>
      </main>
    </div>
  );
}
