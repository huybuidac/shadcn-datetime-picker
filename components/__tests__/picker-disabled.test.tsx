import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DateTimePicker } from '../datetime-picker';
import { SimpleTimePicker } from '../simple-time-picker';

const value = new Date(2026, 10, 12, 10);
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: vi.fn(),
});

describe('disabled picker popovers', () => {
  it('closes the calendar when DateTimePicker becomes disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const props = { value, onChange, hideTime: true };
    const { rerender } = render(<DateTimePicker {...props} />);
    const trigger = screen.getByText('November 12, 2026');

    await user.click(trigger);
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();

    rerender(<DateTimePicker {...props} disabled />);
    expect(screen.queryByRole('button', { name: 'Done' })).not.toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes the time options when SimpleTimePicker becomes disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const props = { value, onChange };
    const { rerender } = render(<SimpleTimePicker {...props} />);
    const trigger = screen.getByRole('combobox');
    onChange.mockClear();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    rerender(<SimpleTimePicker {...props} disabled />);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
