// Pin process timezone BEFORE any module that touches Date is imported.
// TZDate's display still depends on the host TZ for some operations, and the
// tests assert on absolute formatted output.
process.env.TZ = 'UTC';

import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement these but the component uses them indirectly.
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
    return setTimeout(() => cb(performance.now()), 0) as unknown as number;
  };
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
}
