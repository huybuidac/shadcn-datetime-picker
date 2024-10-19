import type { Meta, StoryObj } from '@storybook/react';
import { Source } from '@storybook/blocks';
import { fn } from '@storybook/test';

import { SimpleTimePicker } from '../components/simple-time-picker';

import { addHours, subHours, format } from 'date-fns';

import '../app/globals.css';
import { useState } from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
let value = new Date();
const meta = {
  title: 'Simple Time Picker',
  component: SimpleTimePicker,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
    value: { control: 'date' },
    disabled: { control: 'boolean' },
    use12HourFormat: { control: 'boolean' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    value: new Date(),
    onChange: fn(),
  },
  render: (args) => {
    const [value, setValue] = useState(new Date());
    return <SimpleTimePicker {...args} value={value} onChange={(date) => setValue(date)} />;
  },
} satisfies Meta<typeof SimpleTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const _24HourFormat: Story = {
  args: {
    use12HourFormat: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const MinMax: Story = {
  name: 'Time Selection Limits (Min/Max)',
  args: {
    min: subHours(new Date(), 3),
    max: addHours(new Date(), 5),
  },
  render: (args) => {
    const [value, setValue] = useState(new Date());
    return (
      <div className='flex flex-col gap-4'>
        <div>Min: {format(args.min!, 'hh:mm:ss a')}</div>
        <div>Max: {format(args.max!, 'hh:mm:ss a')}</div>
        <SimpleTimePicker {...args} value={value} onChange={(date) => setValue(date)} />
      </div>
    );
  },
};