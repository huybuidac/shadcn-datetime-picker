import type { Meta, StoryObj } from '@storybook/react';
import { Source } from '@storybook/blocks';
import { fn } from '@storybook/test';

import { DateTimePicker } from '../components/datetime-picker';
import type { DateTimePicker as DateTimePickerType } from '../components/datetime-picker';

import { addYears, subYears, format } from 'date-fns';

import '../app/globals.css';
import { useState } from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
let value = new Date();
const meta = {
  title: 'Datetime Picker',
  component: DateTimePicker,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
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
    showTime: { control: 'boolean' },
    use12HourFormat: { control: 'boolean' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    value: new Date(),
    onChange: fn(),
  },
  render: (args) => {
    const [value, setValue] = useState(new Date());
    return <DateTimePicker {...args} value={value} onChange={(date) => setValue(date)} />;
  },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const _24HourFormat: Story = {
  args: {
    use12HourFormat: false,
  },
};

export const DatePicker: Story = {
  args: {
    showTime: false,
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
    const [value, setValue] = useState(new Date());
    return (
      <div className='flex flex-col gap-4'>
        <div>Min: {format(args.min!, 'MMM d, yyyy hh:mm:ss a')}</div>
        <div>Max: {format(args.max!, 'MMM d, yyyy hh:mm:ss a')}</div>
        <DateTimePicker {...args} value={value} onChange={(date) => setValue(date)} />
      </div>
    );
  },
};
