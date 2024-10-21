import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

type DateTimeInputProps = InputProps & {
  className?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  format?: string;
};

// https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
const patternConfigs = [
  {
    type: 'year',
    symbols: ['y', 'Y', 'u', 'U', 'r']
  },
  {
    type: 'month',
    symbols: ['M', 'L']
  },
  {
    type: 'day',
    symbols: ['d', 'D', 'F', 'g']
  },
  {
    type: 'hour',
    symbols: ['h', 'H', 'K', 'k', 'j', 'J', 'C']
  },
  {
    type: 'minute',
    symbols: ['m']
  },
  {
    type: 'second',
    symbols: ['s']
  },
  {
    type: 'period',
    symbols: ['a', 'A', 'B']
  },
  {
    type: 'space',
    symbols: [' ', '/', '-', ':', ',', '.']
  }
]

const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>((options: DateTimeInputProps, ref) => {
  const format = options.format || 'dd/MM/YYYY - HH:mm';
  const views = []
  let lastPattern = ''
  let symbols = ''
  for (const c of format) {
    const pattern = patternConfigs.find(p => p.symbols.includes(c))!
    if (pattern.type !== lastPattern) {
      if (symbols) {
        views.push({
          type: pattern.type,
          symbols
        })
      }
      lastPattern = pattern?.type || ''
    }
  }
  return (
    <div ref={ref}>
      <input placeholder='dd' />
      <span > / </span>
      <input placeholder='MM' />
      <span> / </span>
      <input placeholder='YYYY' />
      <span> - </span>
      <input placeholder='HH' />
      <span> : </span>
      <input />
      <span> : </span>
      <input />
      <input />
    </div>
  );
});

DateTimeInput.displayName = 'DateTimeInput';

export { DateTimeInput };
