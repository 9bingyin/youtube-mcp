// @ts-nocheck
// @jest-environment node
import { describe, test, expect } from '@jest/globals';
import * as os from 'os';
import * as path from 'path';
import { listSubtitles, downloadSubtitles } from '../modules/subtitle.js';
import { CONFIG } from '../config.js';
import * as fs from 'fs';

// 設置 Python 環境
process.env.PYTHONPATH = '';
process.env.PYTHONHOME = '';

describe('subtitle functions', () => {
  const testUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
  const testConfig = {
    ...CONFIG,
    file: {
      ...CONFIG.file,
      downloadsDir: path.join(os.tmpdir(), 'yt-dlp-test-downloads'),
      tempDirPrefix: 'yt-dlp-test-'
    }
  };

  beforeEach(async () => {
    await fs.promises.mkdir(testConfig.file.downloadsDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.promises.rm(testConfig.file.downloadsDir, { recursive: true, force: true });
  });

  test('listSubtitles should return available subtitles', async () => {
    const result = await listSubtitles(testUrl);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  }, 30000);

  test('downloadSubtitles should download subtitles', async () => {
    const result = await downloadSubtitles(testUrl, 'en', testConfig);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  }, 30000);
}); 