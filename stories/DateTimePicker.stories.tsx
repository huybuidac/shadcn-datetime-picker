import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { DateTimePicker } from '../components/datetime-picker';

import { addYears, subYears, format } from 'date-fns';

import '../app/globals.css';
import { useState } from 'react';
import { DateTimeInput } from '@/components/datetime-input';

const meta = {
  title: 'Datetime Picker',
  component: DateTimePicker,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    storySource: {
      source: 'https://github.com/huybuidac/shadcn-datetime-picker',
    },
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
    value: { control: 'date' },
    min: { control: 'date' },
    max: { control: 'date' },
    timezone: { control: 'text' },
    disabled: { control: 'boolean' },
    hideTime: { control: 'boolean' },
    use12HourFormat: { control: 'boolean' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    value: new Date(),
    onChange: fn(),
  },
  decorators: [
    (Story, info) => (
      <div className="flex flex-col gap-4">
        {info.name === 'Default' && (
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Repository:</span>
            <a
              href="https://github.com/huybuidac/shadcn-datetime-picker"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              shadcn-datetime-picker
            </a>
          </div>
        )}
        <div className="flex justify-center">
          <Story />
        </div>
      </div>
    ),
  ],
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());
    return <DateTimePicker {...args} value={value} onChange={(date) => setValue(date)} />;
  },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const DateTimeInputPickerSource = `
const [value, setValue] = useState<Date | undefined>(undefined);
return (
  <DateTimePicker
    value={value}
    onChange={setValue}
    use12HourFormat
    renderTrigger={({ open, value, setOpen }) => (
      <DateTimeInput
        value={value}
        onChange={(x) => !open && setValue(x)}
        format="MM/dd/yyyy hh:mm aa"
        disabled={open}
        onCalendarClick={() => setOpen(!open)}
      />
    )}
  />
);
`;
export const DateTimeInputPicker: Story = {
  parameters: {
    storySource: { source: DateTimeInputPickerSource },
    docs: { source: { code: DateTimeInputPickerSource } },
  },
  render: () => {
    const [value, setValue] = useState<Date | undefined>(undefined);
    return (
      <DateTimePicker
        value={value}
        onChange={setValue}
        use12HourFormat
        renderTrigger={({ open, value, setOpen }) => (
          <DateTimeInput
            value={value}
            onChange={(x) => !open && setValue(x)}
            format="MM/dd/yyyy hh:mm aa"
            disabled={open}
            onCalendarClick={() => setOpen(!open)}
          />
        )}
      />
    );
  },
};

export const Clearable: Story = {
  args: {
    clearable: true,
  },
};

export const _12HourFormat: Story = {
  args: {
    use12HourFormat: true,
  },
};

export const DatePicker: Story = {
  args: {
    hideTime: true,
  },
};

export const Timezone: Story = {
  name: 'Timezone UTC',
  args: {
    timezone: 'Pacific/Wake',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const MinMax: Story = {
  name: 'Date Time Selection Limits (Min/Max)',
  args: {
    min: subYears(new Date(), 3),
    max: addYears(new Date(), 5),
  },
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());
    return (
      <div className="flex flex-col gap-4">
        <div>Min: {format(args.min!, 'MMM d, yyyy hh:mm:ss a')}</div>
        <div>Max: {format(args.max!, 'MMM d, yyyy hh:mm:ss a')}</div>
        <DateTimePicker {...args} value={value} onChange={(date) => setValue(date)} />
      </div>
    );
  },
};
