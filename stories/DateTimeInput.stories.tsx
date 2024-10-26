import type { Meta, StoryObj } from '@storybook/react';

import { DateTimeInput } from '../components/datetime-input';

import '../app/globals.css';
import { useState } from 'react';

const meta = {
  title: 'DateTimeInput',
  component: DateTimeInput,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    storySource: {
      source: 'https://github.com/huybuidac/shadcn-datetime-picker',
    },
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    format: { control: 'text', table: { defaultValue: { summary: 'dd/MM/yyyy-hh:mm aa' } } },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
  },
  decorators: [
    (Story, info) => (
      <div className="flex flex-col items-center gap-4">
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
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateTimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ['DEFAULT'],
};

export const HideCalendarIcon: Story = {
  args: {
    hideCalendarIcon: true,
  },
};

export const Value: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(new Date());
    return <DateTimeInput value={value} onChange={setValue} format="MM dd, yyyy" />;
  },
};
