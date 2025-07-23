// @ts-nocheck
// @jest-environment node
import { describe, test, expect } from '@jest/globals';
import { listSubtitles, downloadSubtitles } from '../modules/subtitle.js';
import { CONFIG } from '../config.js';

describe('Subtitle Functions', () => {
  const testUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
  const testConfig = {
    ...CONFIG
  };

  // No need for beforeEach/afterEach since we don't use downloads directory

  describe('listSubtitles', () => {
    test('lists available subtitles', async () => {
      const result = await listSubtitles(testUrl);
      expect(result).toContain('Language');
    }, 30000);

    test('handles invalid URL', async () => {
      await expect(listSubtitles('invalid-url'))
        .rejects
        .toThrow();
    });
  });

  describe('downloadSubtitles', () => {
    test('downloads auto-generated subtitles successfully', async () => {
      const result = await downloadSubtitles(testUrl, 'en');
      expect(result).toContain('WEBVTT');
    }, 30000);

    test('handles missing language', async () => {
      await expect(downloadSubtitles(testUrl, 'xx'))
        .rejects
        .toThrow();
    }, 30000);
  });
}); 