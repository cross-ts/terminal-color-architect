import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { copyText } from './copy';

describe('copyText', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses navigator.clipboard when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const result = await copyText('hello');
    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to document.execCommand when clipboard API is missing', async () => {
    const execCommand = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue({
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
      }),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
      execCommand,
    });

    const result = await copyText('fallback');
    expect(result).toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('returns false if document is unavailable', async () => {
    vi.stubGlobal('navigator', undefined);
    vi.stubGlobal('document', undefined);

    const result = await copyText('no-doc');
    expect(result).toBe(false);
  });
});
