# Shadcn Datetime Picker

A datetime picker component for Shadcn UI.

![Simple DateTime Picker](images/simple.png)

### Installation

1. Install Shadcn dependencies
```bash
npx shadcn@latest add button dropdown-menu input label popover select scroll-area
```

2. Install react-day-picker
```bash
yarn add react-day-picker@^9
```

3. Copy and paste [datetime-picker.tsx](./components/datetime-picker.tsx) into your project.

### Usage

1. Simple
```tsx
import { DateTimePicker } from '@/components/datetime-picker';

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return <DateTimePicker value={date} onChange={setDate} />;
}
```

2. With timezone
```tsx
import { DateTimePicker } from '@/components/datetime-picker';

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return <DateTimePicker value={date} onChange={setDate} timezone="UTC" />;
}
```

3. Custom trigger
```tsx
import { DateTimePicker } from '@/components/datetime-picker';

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <DateTimePicker
      value={date}
      onChange={setDate}
      renderTrigger={(value, timezone) => <Button>{value?.toLocaleString()}</Button>}
    />
  );
}
```