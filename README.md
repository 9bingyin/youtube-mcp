# youtube-mcp

A simplified MCP (Model Context Protocol) server for extracting subtitles from videos. Supports YouTube, Facebook, TikTok and other platforms via yt-dlp.

## Features

* **Get Available Subtitles**: List all available subtitle languages for any video
* **Extract Subtitles**: Download subtitles in original format (SRT/VTT) for any language
* **Timestamp Control**: Optional `--without-timestamp` parameter to remove timestamps from subtitle output
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

**Default mode (with timestamps):**
```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": [
        "-y",
        "@bingyin/youtube-mcp"
      ]
    }
  }
}
```

**Without timestamps:**
```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": [
        "-y",
        "@bingyin/youtube-mcp",
        "--without-timestamp"
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
List available subtitle languages for a video.

**Input:**
- `url` (string, required): Video URL

### `get_subtitles` 
Download subtitle content for a specific language (returns SRT/VTT format).

**Input:**
- `url` (string, required): Video URL
- `language` (string, optional): Language code (e.g., 'en', 'zh', 'ja'). Defaults to 'en'

## Manual Start

**With timestamps (default):**
```bash
npx @bingyin/youtube-mcp
```

**Without timestamps:**
```bash
npx @bingyin/youtube-mcp --without-timestamp
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


