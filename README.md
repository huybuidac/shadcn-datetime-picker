# Shadcn Datetime Picker

![Simple DateTime Picker](images/simple.png)

## Overview

Shadcn Datetime Picker: The Ultimate React Component for Date and Time Selection

Shadcn Datetime Picker is a powerful and fully customizable component that simplifies date and time selection in React applications built with the Shadcn UI framework. With advanced features designed to improve user experience, this datetime picker offers seamless integration and a responsive, user-friendly interface. Whether you need a robust datetime, date, or time picker, Shadcn Datetime Picker provides the flexibility and functionality needed for modern applications.

**Key Features**:
- **Datetime Picker**: Select both date and time in a single intuitive component.
- **Date Picker**: A standalone date selector for quick date inputs.
- **Time Picker**: Easily choose times with a simple interface.
- **Timezone Support**: Display and handle dates across different timezones.
- **Month/Year Selection**: Choose months and years directly for easier navigation.
- **Min/Max Date**: Restrict selectable dates within a defined range.

This component is designed to be lightweight, responsive, and highly customizable, making it a must-have for any project using Shadcn UI. Improve the user experience of your React apps with a reliable and flexible datetime picker solution.

Demo: https://shadcn-datetime-picker-pro.vercel.app/

### Demo DateTime Picker Input

https://shadcn-datetime-picker-pro.vercel.app/?path=/story/datetimepicker--date-time-input-picker-in-form

https://github.com/user-attachments/assets/1a14076d-cff7-4068-af10-d61a2ff9284b

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

3. **Copy and paste** below codes into your project.
- [datetime-picker.tsx](./components/datetime-picker.tsx)
- [datetime-input.tsx](./components/datetime-input.tsx)
- [simple-time-picker.tsx](./components/simple-time-picker.tsx)

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
