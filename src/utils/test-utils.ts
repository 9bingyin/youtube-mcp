import type { Config } from '../config.js';

export const mockConfig: Config = {
  file: {
    maxFilenameLength: 100,
    sanitize: {
      replaceChar: '_',
      truncateSuffix: '...',
      illegalChars: /[<>:"/\\|?*\x00-\x1F]/g,
      reservedNames: ['CON', 'PRN', 'AUX', 'NUL']
    }
  },
  tools: {
    required: ['yt-dlp']
  },
  download: {
    defaultSubtitleLanguage: 'en'
  }
}; 