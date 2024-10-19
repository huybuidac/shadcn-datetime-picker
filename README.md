# Shadcn Datetime Picker

A datetime picker component for Shadcn UI, designed to provide a user-friendly interface for selecting dates and times. This component is highly customizable and supports various features such as time zone selection and custom triggers.

Demo: https://shadcn-datetime-picker-pro.vercel.app/

![Simple DateTime Picker](images/simple.png)

### Installation

To install the Shadcn Datetime Picker, follow these steps:

1. **Install Shadcn dependencies**
   ```bash
   npx shadcn@latest add button dropdown-menu input label popover select scroll-area
   ```

2. **Install react-day-picker**
   ```bash
   yarn add react-day-picker@^9
   ```

3. **Copy and paste** [datetime-picker.tsx](./components/datetime-picker.tsx) into your project.

### Usage

#### 1. Simple DateTime Picker
```tsx
import { DateTimePicker } from '@/components/datetime-picker';

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return <DateTimePicker value={date} onChange={setDate} />;
}
```

#### 2. DateTime Picker with Timezone
```tsx
import { DateTimePicker } from '@/components/datetime-picker';

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return <DateTimePicker value={date} onChange={setDate} timezone="UTC" />;
}
```

#### 3. Custom Trigger for DateTime Picker
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

#### 4. With min and max date
```tsx
import { DateTimePicker } from '@/components/datetime-picker';

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const minDate = useMemo(() => subHours(new Date(), 2), []);
  const maxDate = useMemo(() => addMonths(new Date(), 2), []);
  return <DateTimePicker value={date} onChange={setDate} min={minDate} max={maxDate} />;
}
```

### Contributing

We welcome contributions! Please feel free to submit a pull request or open an issue for any suggestions or improvements.
