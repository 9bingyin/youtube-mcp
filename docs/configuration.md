# Configuration Guide

## Overview

The youtube-mcp package can be configured through environment variables. The configuration primarily focuses on subtitle extraction and file handling.

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
| `YTDLP_DEFAULT_SUBTITLE_LANG` | Default subtitle language | `en` |

## File Configuration

### Download Directory

The download directory can be configured using environment variables:

```bash
export YTDLP_DOWNLOADS_DIR="/path/to/downloads"
```

Note: This is used for temporary file operations during subtitle extraction.

### Filename Sanitization

Control how temporary filenames are sanitized:

```bash
export YTDLP_MAX_FILENAME_LENGTH=100
export YTDLP_SANITIZE_REPLACE_CHAR="-"
export YTDLP_SANITIZE_TRUNCATE_SUFFIX="___"
```

## Subtitle Configuration

### Default Language

Set the default subtitle language when none is specified:

```bash
export YTDLP_DEFAULT_SUBTITLE_LANG="en"
```

Supported language codes include:
- `en` - English
- `zh-Hans` - Simplified Chinese
- `zh-Hant` - Traditional Chinese
- `ja` - Japanese
- `ko` - Korean
- `es` - Spanish
- `fr` - French
- `de` - German
- And many more...

## Tools Configuration

The package requires `yt-dlp` to be installed and accessible in the system PATH:

```bash
# Install yt-dlp based on your system
# Windows
winget install yt-dlp

# macOS
brew install yt-dlp

# Linux
pip install yt-dlp
```

## MCP Server Configuration

When using with Claude Desktop or other MCP clients:

```json
{
  "mcpServers": {
    "youtube-subtitles": {
      "command": "npx",
      "args": ["-y", "@bingyin/youtube-mcp"],
      "env": {
        "YTDLP_DEFAULT_SUBTITLE_LANG": "en",
        "YTDLP_MAX_FILENAME_LENGTH": "100"
      }
    }
  }
}
```

## Complete Configuration Example

Environment setup:

```bash
# Basic configuration
export YTDLP_DEFAULT_SUBTITLE_LANG="zh-Hans"
export YTDLP_MAX_FILENAME_LENGTH=80
export YTDLP_TEMP_DIR_PREFIX="subtitle-temp-"

# Filename sanitization
export YTDLP_SANITIZE_REPLACE_CHAR="-"
export YTDLP_SANITIZE_TRUNCATE_SUFFIX="___"

# Custom download directory (optional)
export YTDLP_DOWNLOADS_DIR="/tmp/subtitle-extraction"
```

## Troubleshooting

### Common Issues

1. **yt-dlp not found**: Ensure yt-dlp is installed and in system PATH
2. **Permission errors**: Check write permissions for download/temp directories
3. **Language not available**: Use `get_available_subtitles` to check available languages first

### Debug Mode

For debugging, you can check the configuration being used:

```javascript
import { CONFIG } from '@bingyin/youtube-mcp';
console.log('Current configuration:', CONFIG);
``` 