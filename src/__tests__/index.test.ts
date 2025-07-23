// @ts-nocheck
// @jest-environment node
import { describe, test, expect } from '@jest/globals';
import { listSubtitles, downloadSubtitles } from '../modules/subtitle.js';
import { CONFIG } from '../config.js';

// 設置 Python 環境
process.env.PYTHONPATH = '';
process.env.PYTHONHOME = '';

describe('subtitle functions', () => {
  const testUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
  const testConfig = {
    ...CONFIG
  };

  // No need for beforeEach/afterEach since we don't use downloads directory

  test('listSubtitles should return available subtitles', async () => {
    const result = await listSubtitles(testUrl);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  }, 30000);

  test('downloadSubtitles should download subtitles', async () => {
    const result = await downloadSubtitles(testUrl, 'en');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  }, 30000);
}); 