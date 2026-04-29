import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TZDate } from 'react-day-picker';
import { DateTimeInput } from '../datetime-input';

const FORMAT = 'dd/MM/yyyy-hh:mm aa';
const TZ = 'UTC';

function renderInput(props: Partial<React.ComponentProps<typeof DateTimeInput>> = {}) {
  const onChange = vi.fn();
  const utils = render(
    <DateTimeInput format={FORMAT} timezone={TZ} onChange={onChange} {...props} />
  );
  const input = screen.getByPlaceholderText(FORMAT) as HTMLInputElement;
  return { ...utils, input, onChange, user: userEvent.setup() };
}

// userEvent.click() leaves the caret at the END of the input, so onClick
// always lands on the last segment. Use this helper to position focus on
// the first segment regardless of format.
async function focusFirst(input: HTMLInputElement, user: ReturnType<typeof userEvent.setup>) {
  await user.click(input);
  // Walk left enough times to land on the first segment for any reasonable
  // format. The component is a no-op when already at the first segment.
  for (let i = 0; i < 10; i++) await user.keyboard('{ArrowLeft}');
}

beforeEach(() => {
  vi.setSystemTime(new Date('2026-04-29T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('DateTimeInput · render', () => {
  it('shows placeholder pattern when no value', () => {
    const { input } = renderInput();
    expect(input.value).toBe(FORMAT);
  });

  it('formats provided value', () => {
    const { input } = renderInput({ value: new TZDate('2025-03-07T14:25:00Z', TZ) });
    expect(input.value).toBe('07/03/2025-02:25 PM');
  });

  it('forwardRef resolves to the underlying <input> element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<DateTimeInput ref={ref} format={FORMAT} timezone={TZ} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.tagName).toBe('INPUT');
  });
});

describe('DateTimeInput · typing numbers', () => {
  it('fills date segment fully then auto-advances', async () => {
    const { input, user } = renderInput();
    await focusFirst(input, user);
    await user.keyboard('30');
    expect(input.value.startsWith('30/')).toBe(true);
  });

  it('falls back when typed value is invalid for segment', async () => {
    const { input, user } = renderInput();
    await focusFirst(input, user);
    await user.keyboard('01'); // dd → 01, advances
    await user.keyboard('13'); // MM "1" then "3" → "13" invalid → fallback "3"
    expect(input.value.slice(3, 5)).toBe('03');
  });
});

describe('DateTimeInput · arrow stepping', () => {
  it('ArrowUp on empty hour fills with current hour and AM marker', async () => {
    const { input, user } = renderInput();
    await focusFirst(input, user);
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}'); // dd MM yyyy → hh
    await user.keyboard('{ArrowUp}');
    // now=10:00 UTC → 12h = 10 AM
    expect(input.value).toContain('10:');
    expect(input.value.endsWith('AM')).toBe(true);
  });

  it('ArrowUp on hour=11 (12h) flips period AM→PM and rolls to 12', async () => {
    const { input, user } = renderInput({ value: new TZDate('2025-03-07T11:00:00Z', TZ) });
    await focusFirst(input, user);
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    await user.keyboard('{ArrowUp}');
    expect(input.value).toContain('12:00 PM');
  });

  it('ArrowDown on year=1900 wraps to 2099', async () => {
    const { input, user } = renderInput({ value: new TZDate('1901-06-15T00:00:00Z', TZ) });
    await focusFirst(input, user);
    await user.keyboard('{ArrowRight}{ArrowRight}'); // → year
    await user.keyboard('{ArrowDown}'); // 1901 → 1900
    await user.keyboard('{ArrowDown}'); // 1900 → 2099 wrap
    expect(input.value).toContain('/2099-');
  });
});

describe('DateTimeInput · backspace', () => {
  it('clears current segment on first backspace', async () => {
    const { input, user } = renderInput({ value: new TZDate('2025-03-07T14:25:00Z', TZ) });
    await focusFirst(input, user);
    await user.keyboard('{Backspace}');
    expect(input.value.startsWith('dd/')).toBe(true);
  });
});

describe('DateTimeInput · period typing', () => {
  it('"p" sets PM, "a" sets AM', async () => {
    const { input, user } = renderInput({ value: new TZDate('2025-03-07T11:00:00Z', TZ) });
    await focusFirst(input, user);
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}'); // → period
    await user.keyboard('p');
    expect(input.value.endsWith('PM')).toBe(true);
    await user.keyboard('a');
    expect(input.value.endsWith('AM')).toBe(true);
  });
});

describe('DateTimeInput · onChange', () => {
  it('emits when all segments form a valid date', async () => {
    const { input, user, onChange } = renderInput();
    await focusFirst(input, user);
    await user.keyboard('07032025'); // dd MM yyyy
    await user.keyboard('0225');     // hh mm
    await user.keyboard('p');        // PM

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getUTCFullYear()).toBe(2025);
    expect(last.getUTCMonth()).toBe(2);
    expect(last.getUTCDate()).toBe(7);
    expect(last.getUTCHours()).toBe(14);
    expect(last.getUTCMinutes()).toBe(25);
  });

  it('does not re-emit when parent echoes the same value back', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <DateTimeInput
        format={FORMAT}
        timezone={TZ}
        value={new TZDate('2025-03-07T14:25:00Z', TZ)}
        onChange={onChange}
      />
    );
    rerender(
      <DateTimeInput
        format={FORMAT}
        timezone={TZ}
        value={new TZDate('2025-03-07T14:25:00Z', TZ)}
        onChange={onChange}
      />
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('DateTimeInput · error state', () => {
  it('shows inline error when partial input cannot form a valid date', async () => {
    const { input, user } = renderInput();
    await focusFirst(input, user);
    await user.keyboard('0');
    expect(screen.getByText(/Invalid date/)).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('respects custom errorMessage', async () => {
    const { input, user } = renderInput({ errorMessage: 'Sai định dạng' });
    await focusFirst(input, user);
    await user.keyboard('0');
    expect(screen.getByText('Sai định dạng')).toBeInTheDocument();
  });

  it('hides error when hideError is set', async () => {
    const { input, user } = renderInput({ hideError: true });
    await focusFirst(input, user);
    await user.keyboard('0');
    expect(screen.queryByText(/Invalid date/)).not.toBeInTheDocument();
  });
});
