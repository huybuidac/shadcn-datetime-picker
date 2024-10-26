import type { Preview } from "@storybook/react";
import '../app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['DateTimePicker', 'DateTimeInput', 'SimpleTimePicker'],
      }
    },
  },
};

export default preview;
