# API Reference

## MCP Tools

This package provides two MCP tools for subtitle extraction:

### get_available_subtitles

Lists all available subtitle languages for a video, including both manual and auto-generated captions.

**MCP Tool Name:** `get_available_subtitles`

**Parameters:**
- `url` (string, required): Complete video URL from supported platforms

**Returns:**
- String containing the list of available subtitles with language codes and formats

**Usage Example:**
```
Tool: get_available_subtitles
Input: { "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw" }
```

### get_subtitles

Downloads subtitle content for a specific language. Prioritizes manual subtitles and falls back to auto-generated ones if unavailable.

**MCP Tool Name:** `get_subtitles`

**Parameters:**
- `url` (string, required): Complete video URL
- `language` (string, optional): Language code such as 'en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', etc. Defaults to 'en'

**Returns:**
- Raw subtitle file content (typically SRT or VTT format)

**Usage Examples:**
```
Tool: get_subtitles
Input: { "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw" }

Tool: get_subtitles
Input: { 
  "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw", 
  "language": "zh-Hans" 
}
```

## Internal Functions

These functions are used internally by the MCP tools:

### listSubtitles(url: string): Promise<string>

Lists all available subtitles for a video.

**Parameters:**
- `url`: The URL of the video

**Returns:**
- Promise resolving to a string containing the list of available subtitles

**Example:**
```javascript
import { listSubtitles } from '@bingyin/youtube-mcp';

const subtitles = await listSubtitles('https://www.youtube.com/watch?v=jNQXAC9IVRw');
console.log(subtitles);
```

### downloadSubtitles(url: string, language: string, config: Config): Promise<string>

Downloads subtitles for a video in the specified language.

**Parameters:**
- `url`: The URL of the video
- `language`: Language code (e.g., 'en', 'zh-Hant', 'ja')
- `config`: Configuration object

**Returns:**
- Promise resolving to the subtitle content

**Example:**
```javascript
import { downloadSubtitles } from '@bingyin/youtube-mcp';
import { CONFIG } from '@bingyin/youtube-mcp';

const subtitles = await downloadSubtitles(
  'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  'en',
  CONFIG
);
console.log(subtitles);
```

## Configuration

### Config Interface

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

## Supported Platforms

Thanks to yt-dlp integration, this tool supports subtitle extraction from:

- YouTube
- Facebook  
- TikTok
- Instagram
- Twitter/X
- Vimeo
- Dailymotion
- And 1000+ other sites

For detailed configuration options, see [Configuration Guide](./configuration.md). 