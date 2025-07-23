import * as path from "path";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 配置類型定義
 */
export interface Config {
  // 文件相關配置
  file: {
    maxFilenameLength: number;
    // 文件名處理相關配置
    sanitize: {
      // 替換非法字符為此字符
      replaceChar: string;
      // 文件名截斷時的後綴
      truncateSuffix: string;
      // 非法字符正則表達式
      illegalChars: RegExp;
      // 保留字列表
      reservedNames: readonly string[];
    };
  };
  // 工具相關配置
  tools: {
    required: readonly string[];
  };
  // 下載相關配置
  download: {
    defaultSubtitleLanguage: string;
  };
}

/**
 * 默認配置
 */
const defaultConfig: Config = {
  file: {
    maxFilenameLength: 50,
    sanitize: {
      replaceChar: '_',
      truncateSuffix: '...',
      illegalChars: /[<>:"/\\|?*\x00-\x1F]/g,  // Windows 非法字符
      reservedNames: [
        'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4',
        'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2',
        'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
      ]
    }
  },
  tools: {
    required: ['yt-dlp']
  },
  download: {
    defaultSubtitleLanguage: "en"
  }
};

/**
 * 從環境變數加載配置
 */
function loadEnvConfig(): DeepPartial<Config> {
  const envConfig: DeepPartial<Config> = {};

  // 文件配置
  const fileConfig: DeepPartial<Config['file']> = {
    sanitize: {
      replaceChar: process.env.YTDLP_SANITIZE_REPLACE_CHAR,
      truncateSuffix: process.env.YTDLP_SANITIZE_TRUNCATE_SUFFIX,
      illegalChars: process.env.YTDLP_SANITIZE_ILLEGAL_CHARS ? new RegExp(process.env.YTDLP_SANITIZE_ILLEGAL_CHARS) : undefined,
      reservedNames: process.env.YTDLP_SANITIZE_RESERVED_NAMES?.split(',')
    }
  };
  
  if (process.env.YTDLP_MAX_FILENAME_LENGTH) {
    fileConfig.maxFilenameLength = parseInt(process.env.YTDLP_MAX_FILENAME_LENGTH);
  }

  if (Object.keys(fileConfig).length > 0) {
    envConfig.file = fileConfig;
  }

  // 下載配置
  const downloadConfig: Partial<Config['download']> = {};
  if (process.env.YTDLP_DEFAULT_SUBTITLE_LANG) {
    downloadConfig.defaultSubtitleLanguage = process.env.YTDLP_DEFAULT_SUBTITLE_LANG;
  }
  if (Object.keys(downloadConfig).length > 0) {
    envConfig.download = downloadConfig;
  }

  return envConfig;
}

/**
 * 驗證配置
 */
function validateConfig(config: Config): void {
  // 驗證文件名長度
  if (config.file.maxFilenameLength < 5) {
    throw new Error('maxFilenameLength must be at least 5');
  }

  // 驗證默認字幕語言
  if (!/^[a-z]{2,3}(-[A-Z][a-z]{3})?(-[A-Z]{2})?$/i.test(config.download.defaultSubtitleLanguage)) {
    throw new Error('Invalid defaultSubtitleLanguage');
  }
}

/**
 * 合併配置
 */
function mergeConfig(base: Config, override: DeepPartial<Config>): Config {
  return {
    file: {
      maxFilenameLength: override.file?.maxFilenameLength || base.file.maxFilenameLength,
      sanitize: {
        replaceChar: override.file?.sanitize?.replaceChar || base.file.sanitize.replaceChar,
        truncateSuffix: override.file?.sanitize?.truncateSuffix || base.file.sanitize.truncateSuffix,
        illegalChars: (override.file?.sanitize?.illegalChars || base.file.sanitize.illegalChars) as RegExp,
        reservedNames: (override.file?.sanitize?.reservedNames || base.file.sanitize.reservedNames) as readonly string[]
      }
    },
    tools: {
      required: (override.tools?.required || base.tools.required) as readonly string[]
    },
    download: {
      defaultSubtitleLanguage: override.download?.defaultSubtitleLanguage || base.download.defaultSubtitleLanguage
    }
  };
}

/**
 * 加載配置
 */
export function loadConfig(): Config {
  const envConfig = loadEnvConfig();
  const config = mergeConfig(defaultConfig, envConfig);
  validateConfig(config);
  return config;
}

/**
 * 安全的文件名處理函數
 */
export function sanitizeFilename(filename: string, config: Config['file']): string {
  // 移除非法字符
  let safe = filename.replace(config.sanitize.illegalChars, config.sanitize.replaceChar);
  
  // 檢查保留字
  const basename = path.parse(safe).name.toUpperCase();
  if (config.sanitize.reservedNames.includes(basename)) {
    safe = `_${safe}`;
  }
  
  // 處理長度限制
  if (safe.length > config.maxFilenameLength) {
    const ext = path.extname(safe);
    const name = safe.slice(0, config.maxFilenameLength - ext.length - config.sanitize.truncateSuffix.length);
    safe = `${name}${config.sanitize.truncateSuffix}${ext}`;
  }
  
  return safe;
}

// 導出當前配置實例
export const CONFIG = loadConfig(); 