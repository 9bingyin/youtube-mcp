# youtube-mcp

A simplified MCP (Model Context Protocol) server for extracting subtitles from videos. Supports YouTube, Facebook, TikTok and other platforms via yt-dlp.

## Features

* **Get Available Subtitles**: List all available subtitle languages for any video
* **Extract Subtitles**: Download subtitles in original format (SRT/VTT) for any language
* **Multi-Platform Support**: Works with YouTube, Facebook, TikTok, and other yt-dlp supported platforms
* **Auto-Generated Fallback**: Automatically falls back to machine-generated subtitles when manual ones aren't available
* **MCP Integration**: Works seamlessly with Claude and other MCP-compatible LLMs

## Installation

### Prerequisites

Install `yt-dlp` based on your operating system:

```bash
# Windows
winget install yt-dlp

# macOS
brew install yt-dlp

# Linux
pip install yt-dlp
```

### With [Claude Desktop](https://claude.ai/desktop)

1. Open Claude Desktop settings
2. Add this MCP server configuration:

```json
{
  "mcpServers": {
    "youtube-subtitles": {
      "command": "npx",
      "args": [
        "-y",
        "@bingyin/youtube-mcp"
      ]
    }
  }
}
```

3. Restart Claude Desktop

### Manual Installation

```bash
npm install -g @bingyin/youtube-mcp
```

## Available Tools

### `get_available_subtitles`
Get all available subtitle languages for a video, including both manual and auto-generated captions.

**Input:**
- `url` (string, required): Complete video URL from supported platforms

**Example:**
```
List available subtitles for: https://youtube.com/watch?v=example
```

### `get_subtitles` 
Download subtitle content for a specific language. Returns raw subtitle file content (typically SRT or VTT format).

**Input:**
- `url` (string, required): Complete video URL
- `language` (string, optional): Language code such as 'en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', etc. Defaults to 'en'

**Examples:**
```
Get English subtitles from: https://youtube.com/watch?v=example
Get Chinese subtitles from: https://youtube.com/watch?v=example with language zh-Hans
```

## Usage Examples

Ask your LLM to:
```
"Get available subtitles for this video: https://youtube.com/watch?v=..."
"Extract English subtitles from this YouTube video: https://youtube.com/watch?v=..."
"Get Chinese subtitles from this TikTok video: https://tiktok.com/@user/video/..."
"List subtitle languages for this Facebook video: https://facebook.com/watch/?v=..."
```

## Manual Start

If needed, start the server manually:
```bash
npx @bingyin/youtube-mcp
```

## Requirements

* Node.js 20+
* `yt-dlp` in system PATH
* MCP-compatible LLM service

## Supported Platforms

Thanks to yt-dlp, this tool supports subtitle extraction from:
- YouTube
- Facebook
- TikTok  
- Instagram
- Twitter/X
- And 1000+ other sites

## Documentation

- [API Reference](./docs/api.md)
- [Configuration](./docs/configuration.md)
- [Error Handling](./docs/error-handling.md)
- [Contributing](./docs/contributing.md)

## License

MIT

## Author

Dewei Yen

Bingyin

## Acknowledgments

This project is based on [yt-dlp-mcp](https://github.com/kevinwatt/yt-dlp-mcp) by Dewei Yen, simplified to focus on subtitle extraction functionality.


