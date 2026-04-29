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
        order: ['Docs', ['Introduction'], 'Components', ['DateTimePicker', 'DateTimeInput', 'SimpleTimePicker'], '*'],
      },
    },
    docs: {
      toc: true,
    },
  },
};

export default preview;
