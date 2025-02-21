# Configuration Guide

## Overview

The yt-dlp-mcp package can be configured through environment variables or by passing a configuration object to the functions.

## Configuration Object

```typescript
interface Config {
  file: {
    maxFilenameLength: number;
    downloadsDir: string;
    tempDirPrefix: string;
    sanitize: {
      replaceChar: string;
      truncateSuffix: string;
      illegalChars: RegExp;
      reservedNames: readonly string[];
    };
  };
  tools: {
    required: readonly string[];
  };
  download: {
    defaultResolution: "480p" | "720p" | "1080p" | "best";
    defaultAudioFormat: "m4a" | "mp3";
    defaultSubtitleLanguage: string;
  };
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `YTDLP_MAX_FILENAME_LENGTH` | Maximum length for filenames | 50 |
| `YTDLP_DOWNLOADS_DIR` | Download directory path | `~/Downloads` |
| `YTDLP_TEMP_DIR_PREFIX` | Prefix for temporary directories | `ytdlp-` |
| `YTDLP_SANITIZE_REPLACE_CHAR` | Character to replace illegal characters | `_` |
| `YTDLP_SANITIZE_TRUNCATE_SUFFIX` | Suffix for truncated filenames | `...` |
| `YTDLP_SANITIZE_ILLEGAL_CHARS` | Regex pattern for illegal characters | `/[<>:"/\\|?*\x00-\x1F]/g` |
| `YTDLP_SANITIZE_RESERVED_NAMES` | Comma-separated list of reserved names | `CON,PRN,AUX,...` |
| `YTDLP_DEFAULT_RESOLUTION` | Default video resolution | `720p` |
| `YTDLP_DEFAULT_AUDIO_FORMAT` | Default audio format | `m4a` |
| `YTDLP_DEFAULT_SUBTITLE_LANG` | Default subtitle language | `en` |

## File Configuration

### Download Directory

The download directory can be configured in two ways:

1. Environment variable:
```bash
export YTDLP_DOWNLOADS_DIR="/path/to/downloads"
```

2. Configuration object:
```javascript
const config = {
  file: {
    downloadsDir: "/path/to/downloads"
  }
};
```

### Filename Sanitization

Control how filenames are sanitized:

```javascript
const config = {
  file: {
    maxFilenameLength: 100,
    sanitize: {
      replaceChar: '-',
      truncateSuffix: '___',
      illegalChars: /[<>:"/\\|?*\x00-\x1F]/g,
      reservedNames: ['CON', 'PRN', 'AUX', 'NUL']
    }
  }
};
```

## Download Configuration

### Video Resolution

Set default video resolution:

```javascript
const config = {
  download: {
    defaultResolution: "1080p" // "480p" | "720p" | "1080p" | "best"
  }
};
```

### Audio Format

Configure audio format preferences:

```javascript
const config = {
  download: {
    defaultAudioFormat: "m4a" // "m4a" | "mp3"
  }
};
```

### Subtitle Language

Set default subtitle language:

```javascript
const config = {
  download: {
    defaultSubtitleLanguage: "en"
  }
};
```

## Tools Configuration

Configure required external tools:

```javascript
const config = {
  tools: {
    required: ['yt-dlp']
  }
};
```

## Complete Configuration Example

```javascript
import { CONFIG } from '@kevinwatt/yt-dlp-mcp';

const customConfig = {
  file: {
    maxFilenameLength: 100,
    downloadsDir: '/custom/downloads',
    tempDirPrefix: 'ytdlp-temp-',
    sanitize: {
      replaceChar: '-',
      truncateSuffix: '___',
      illegalChars: /[<>:"/\\|?*\x00-\x1F]/g,
      reservedNames: [
        'CON', 'PRN', 'AUX', 'NUL',
        'COM1', 'COM2', 'COM3', 'COM4', 'COM5',
        'LPT1', 'LPT2', 'LPT3'
      ]
    }
  },
  tools: {
    required: ['yt-dlp']
  },
  download: {
    defaultResolution: '1080p',
    defaultAudioFormat: 'm4a',
    defaultSubtitleLanguage: 'en'
  }
};

// Use the custom configuration
const result = await downloadVideo(url, customConfig);
``` 