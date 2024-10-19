import { addons } from '@storybook/manager-api';
import { create } from 'storybook/internal/theming';

addons.setConfig({
  theme: create({
    brandTitle: 'Shadcn Datetime Picker',
    base: 'light',
    brandUrl: 'https://github.com/huybuidac/shadcn-datetime-picker',
  }),
});
