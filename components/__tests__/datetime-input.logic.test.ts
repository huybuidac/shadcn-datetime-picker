import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TZDate } from 'react-day-picker';
import {
  parseFormat,
  findSegmentAt,
  findAdjacentSegment,
  stepSegment,
  applyNumberInput,
  applyPeriodInput,
  clearSegmentValue,
  computeInputValue,
  type Segment,
} from '../datetime-input';

const TZ = 'UTC';
const FMT = 'dd/MM/yyyy-hh:mm aa';

const get = (segs: Segment[], type: Segment['type']) => segs.find((s) => s.type === type)!;

beforeEach(() => {
  vi.setSystemTime(new Date('2026-04-29T10:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('parseFormat', () => {
  it('splits format into typed segments with correct indices', () => {
    const segs = parseFormat('dd/MM/yyyy');
    expect(segs.map((s) => s.type)).toEqual(['date', 'space', 'month', 'space', 'year']);
    expect(get(segs, 'date').index).toBe(0);
    expect(get(segs, 'month').index).toBe(3);
    expect(get(segs, 'year').index).toBe(6);
  });

  it('fills values when given a date', () => {
    const segs = parseFormat('dd/MM/yyyy', new TZDate('2025-03-07T00:00:00Z', TZ));
    expect(get(segs, 'date').value).toBe('07');
    expect(get(segs, 'month').value).toBe('03');
    expect(get(segs, 'year').value).toBe('2025');
  });

  it('emits empty values when no date provided', () => {
    const segs = parseFormat('hh:mm aa');
    expect(get(segs, 'hour').value).toBe('');
    expect(get(segs, 'period').value).toBe('');
  });
});

describe('findSegmentAt', () => {
  const segs = parseFormat(FMT, new TZDate('2025-03-07T14:25:00Z', TZ));

  it('returns segment containing the caret', () => {
    expect(findSegmentAt(segs, 1)?.type).toBe('date');
    expect(findSegmentAt(segs, 4)?.type).toBe('month');
    expect(findSegmentAt(segs, 8)?.type).toBe('year');
  });

  it('falls back to nearest left segment when caret on a separator', () => {
    // index 2 is between dd and / — find should still return date.
    expect(findSegmentAt(segs, 2)?.type).toBe('date');
  });

  it('falls back to first segment when position is before everything', () => {
    expect(findSegmentAt(segs, 0)?.type).toBe('date');
  });
});

describe('findAdjacentSegment', () => {
  const segs = parseFormat(FMT);

  it('navigates right skipping separators', () => {
    const date = get(segs, 'date');
    const next = findAdjacentSegment(segs, date, 'right');
    expect(next?.type).toBe('month');
  });

  it('navigates left skipping separators', () => {
    const period = get(segs, 'period');
    const prev = findAdjacentSegment(segs, period, 'left');
    expect(prev?.type).toBe('minute');
  });

  it('returns undefined past the boundary', () => {
    expect(findAdjacentSegment(segs, get(segs, 'date'), 'left')).toBeUndefined();
    expect(findAdjacentSegment(segs, get(segs, 'period'), 'right')).toBeUndefined();
  });
});

describe('stepSegment', () => {
  it('returns same array reference when current is a space (no-op)', () => {
    const segs = parseFormat(FMT);
    const space = segs.find((s) => s.type === 'space')!;
    expect(stepSegment(segs, space, 'up', { timezone: TZ })).toBe(segs);
  });

  it('first ArrowUp on empty hour fills with current hour and AM marker', () => {
    const segs = parseFormat(FMT);
    const hour = get(segs, 'hour');
    const updated = stepSegment(segs, hour, 'up', { timezone: TZ });
    // now=10:00 UTC → 12h hour=10, AM
    expect(get(updated, 'hour').value).toBe('10');
    expect(get(updated, 'period').value).toBe('AM');
  });

  it('first ArrowUp on empty period defaults to AM/PM by current hour', () => {
    const segs = parseFormat(FMT);
    const period = get(segs, 'period');
    const updated = stepSegment(segs, period, 'up', { timezone: TZ });
    // now=10:00 → AM
    expect(get(updated, 'period').value).toBe('AM');
  });

  it('toggles period AM↔PM on subsequent presses', () => {
    let segs = parseFormat(FMT, new TZDate('2025-03-07T03:00:00Z', TZ));
    const period = get(segs, 'period');
    expect(period.value).toBe('AM');
    segs = stepSegment(segs, period, 'up', { timezone: TZ });
    expect(get(segs, 'period').value).toBe('PM');
    segs = stepSegment(segs, get(segs, 'period'), 'down', { timezone: TZ });
    expect(get(segs, 'period').value).toBe('AM');
  });

  it('12h hour: 11 → 12 flips AM to PM', () => {
    const segs = parseFormat(FMT, new TZDate('2025-03-07T11:00:00Z', TZ));
    const updated = stepSegment(segs, get(segs, 'hour'), 'up', {
      value: new TZDate('2025-03-07T11:00:00Z', TZ),
      timezone: TZ,
    });
    expect(get(updated, 'hour').value).toBe('12');
    expect(get(updated, 'period').value).toBe('PM');
  });

  it('12h hour: 12 → 11 (down) flips PM back to AM', () => {
    const segs = parseFormat(FMT, new TZDate('2025-03-07T12:00:00Z', TZ));
    const updated = stepSegment(segs, get(segs, 'hour'), 'down', {
      value: new TZDate('2025-03-07T12:00:00Z', TZ),
      timezone: TZ,
    });
    expect(get(updated, 'hour').value).toBe('11');
    expect(get(updated, 'period').value).toBe('AM');
  });

  it('12h hour wraps 12 → 1 keeping period', () => {
    const segs = parseFormat(FMT, new TZDate('2025-03-07T00:00:00Z', TZ)); // 12 AM
    const updated = stepSegment(segs, get(segs, 'hour'), 'up', {
      value: new TZDate('2025-03-07T00:00:00Z', TZ),
      timezone: TZ,
    });
    expect(get(updated, 'hour').value).toBe('01');
    expect(get(updated, 'period').value).toBe('AM');
  });

  it('24h hour wraps 23 → 0 and 0 → 23', () => {
    const segs = parseFormat('HH:mm', new TZDate('2025-03-07T23:00:00Z', TZ));
    const up = stepSegment(segs, get(segs, 'hour'), 'up', {
      value: new TZDate('2025-03-07T23:00:00Z', TZ),
      timezone: TZ,
    });
    expect(get(up, 'hour').value).toBe('00');

    const segs2 = parseFormat('HH:mm', new TZDate('2025-03-07T00:00:00Z', TZ));
    const down = stepSegment(segs2, get(segs2, 'hour'), 'down', {
      value: new TZDate('2025-03-07T00:00:00Z', TZ),
      timezone: TZ,
    });
    expect(get(down, 'hour').value).toBe('23');
  });

  it('year wraps at 1900 ↔ 2099 (current behavior, off-by-one with validity check)', () => {
    const segs = parseFormat('yyyy', new TZDate('1901-01-01T00:00:00Z', TZ));
    let updated = stepSegment(segs, get(segs, 'year'), 'down', { timezone: TZ });
    expect(get(updated, 'year').value).toBe('1900');
    updated = stepSegment(updated, get(updated, 'year'), 'down', { timezone: TZ });
    expect(get(updated, 'year').value).toBe('2099');
  });

  it('month wraps Jan ↔ Dec', () => {
    const segs = parseFormat('MM', new TZDate('2025-01-15T00:00:00Z', TZ));
    const down = stepSegment(segs, get(segs, 'month'), 'down', { timezone: TZ });
    expect(get(down, 'month').value).toBe('12');
    const up = stepSegment(parseFormat('MM', new TZDate('2025-12-15T00:00:00Z', TZ)), get(segs, 'month'), 'up', {
      value: new TZDate('2025-12-15T00:00:00Z', TZ),
      timezone: TZ,
    });
    expect(get(up, 'month').value).toBe('01');
  });

  it('date wraps within month length (Feb non-leap = 28)', () => {
    const segs = parseFormat('dd/MM/yyyy', new TZDate('2025-02-28T00:00:00Z', TZ));
    const up = stepSegment(segs, get(segs, 'date'), 'up', {
      value: new TZDate('2025-02-28T00:00:00Z', TZ),
      timezone: TZ,
    });
    expect(get(up, 'date').value).toBe('01');
    const down = stepSegment(
      parseFormat('dd/MM/yyyy', new TZDate('2025-02-01T00:00:00Z', TZ)),
      get(parseFormat('dd/MM/yyyy', new TZDate('2025-02-01T00:00:00Z', TZ)), 'date'),
      'down',
      { value: new TZDate('2025-02-01T00:00:00Z', TZ), timezone: TZ }
    );
    expect(get(down, 'date').value).toBe('28');
  });
});

describe('applyNumberInput', () => {
  it('fills empty segment and signals advance when full', () => {
    const segs = parseFormat(FMT);
    const date = get(segs, 'date');
    const r1 = applyNumberInput(segs, date, '0', TZ);
    expect(get(r1.segments, 'date').value).toBe('0');
    expect(r1.advance).toBe(false);
    const r2 = applyNumberInput(r1.segments, get(r1.segments, 'date'), '7', TZ);
    expect(get(r2.segments, 'date').value).toBe('07');
    expect(r2.advance).toBe(true);
  });

  it('advances early on date when typed digit > 3', () => {
    const segs = parseFormat(FMT);
    const r = applyNumberInput(segs, get(segs, 'date'), '5', TZ);
    expect(get(r.segments, 'date').value).toBe('5');
    expect(r.advance).toBe(true);
  });

  it('advances early on month when typed digit > 1', () => {
    const segs = parseFormat(FMT);
    const r = applyNumberInput(segs, get(segs, 'month'), '4', TZ);
    expect(r.advance).toBe(true);
  });

  it('falls back to single digit when prefix concat would be invalid', () => {
    let segs = parseFormat(FMT);
    let r = applyNumberInput(segs, get(segs, 'month'), '1', TZ); // "1"
    r = applyNumberInput(r.segments, get(r.segments, 'month'), '3', TZ); // "13" invalid → "3"
    expect(get(r.segments, 'month').value).toBe('3');
  });

  it('does nothing for period segment', () => {
    const segs = parseFormat(FMT);
    const period = get(segs, 'period');
    const r = applyNumberInput(segs, period, '5', TZ);
    expect(r.segments).toBe(segs);
    expect(r.advance).toBe(false);
  });

  it('24h hour advances early when > 2', () => {
    const segs = parseFormat('HH:mm');
    const r = applyNumberInput(segs, get(segs, 'hour'), '3', TZ);
    expect(r.advance).toBe(true);
  });
});

describe('applyPeriodInput', () => {
  it('"a"/"A" sets AM, "p"/"P" sets PM', () => {
    const segs = parseFormat(FMT);
    const period = get(segs, 'period');
    expect(get(applyPeriodInput(segs, period, 'a'), 'period').value).toBe('AM');
    expect(get(applyPeriodInput(segs, period, 'A'), 'period').value).toBe('AM');
    expect(get(applyPeriodInput(segs, period, 'p'), 'period').value).toBe('PM');
    expect(get(applyPeriodInput(segs, period, 'P'), 'period').value).toBe('PM');
  });

  it('returns same array reference for unsupported keys', () => {
    const segs = parseFormat(FMT);
    expect(applyPeriodInput(segs, get(segs, 'period'), 'x')).toBe(segs);
  });

  it('returns same array when current is not a period', () => {
    const segs = parseFormat(FMT);
    expect(applyPeriodInput(segs, get(segs, 'date'), 'a')).toBe(segs);
  });
});

describe('clearSegmentValue', () => {
  it('empties only the matching segment', () => {
    const segs = parseFormat(FMT, new TZDate('2025-03-07T14:25:00Z', TZ));
    const updated = clearSegmentValue(segs, get(segs, 'date'));
    expect(get(updated, 'date').value).toBe('');
    expect(get(updated, 'month').value).toBe('03');
    expect(get(updated, 'year').value).toBe('2025');
  });
});

describe('computeInputValue', () => {
  it('returns undefined when no segments', () => {
    expect(computeInputValue([], '', FMT)).toBeUndefined();
  });

  it('returns undefined when any non-space segment is empty', () => {
    const segs = parseFormat(FMT);
    expect(computeInputValue(segs, '', FMT)).toBeUndefined();
  });

  it('returns Date when all segments form a valid date in range', () => {
    const segs = parseFormat(FMT, new TZDate('2025-03-07T14:25:00Z', TZ));
    const inputStr = segs.map((s) => (s.value ? s.value : s.symbols)).join('');
    const result = computeInputValue(segs, inputStr, FMT);
    expect(result).toBeDefined();
    expect(result?.getUTCFullYear()).toBe(2025);
    expect(result?.getUTCMonth()).toBe(2);
    expect(result?.getUTCDate()).toBe(7);
  });

  it('rejects year ≤ 1900 (documents inconsistency with stepSegment wrap)', () => {
    const segs = parseFormat(FMT, new TZDate('1900-03-07T14:25:00Z', TZ));
    const inputStr = segs.map((s) => (s.value ? s.value : s.symbols)).join('');
    expect(computeInputValue(segs, inputStr, FMT)).toBeUndefined();
  });

  it('rejects year ≥ 2100', () => {
    const segs = parseFormat(FMT, new TZDate('2100-03-07T14:25:00Z', TZ));
    const inputStr = segs.map((s) => (s.value ? s.value : s.symbols)).join('');
    expect(computeInputValue(segs, inputStr, FMT)).toBeUndefined();
  });
});
