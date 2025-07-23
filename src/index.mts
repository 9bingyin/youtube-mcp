#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

import { CONFIG } from "./config.js";
import { _spawnPromise } from "./modules/utils.js";
import { listSubtitles, downloadSubtitles } from "./modules/subtitle.js";

const VERSION = '1.0.4';

// Parse command line arguments
const args = process.argv.slice(2);
const WITHOUT_TIMESTAMP = args.includes('--without-timestamp');

// Global configuration
const GLOBAL_CONFIG = {
  ...CONFIG,
  withoutTimestamp: WITHOUT_TIMESTAMP
};

/**
 * Validate system configuration
 * @throws {Error} when configuration is invalid
 */
async function validateConfig(): Promise<void> {
  // Configuration validation - no file system checks needed
  // yt-dlp will handle temporary directory creation as needed
}

/**
 * Check required external dependencies
 * @throws {Error} when dependencies are not satisfied
 */
async function checkDependencies(): Promise<void> {
  for (const tool of GLOBAL_CONFIG.tools.required) {
    try {
      await _spawnPromise(tool, ["--version"]);
    } catch (error) {
      throw new Error(`Required tool '${tool}' is not installed or not accessible`);
    }
  }
}

/**
 * Initialize service
 */
async function initialize(): Promise<void> {
  // 在測試環境中跳過初始化檢查
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    await validateConfig();
    await checkDependencies();
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

const server = new Server(
  {
    name: "yt-dlp-mcp",
    version: VERSION,
  },
  {
    capabilities: {
      tools: {}
    },
  }
);

/**
 * Returns the list of available tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_available_subtitles",
        description: "List available subtitle languages for a video.",
        inputSchema: {
          type: "object",
          properties: {
            url: { 
              type: "string", 
              description: "Video URL" 
            },
          },
          required: ["url"],
        },
      },
      {
        name: "get_subtitles",
        description: "Download subtitle content for a specific language (returns SRT/VTT format).",
        inputSchema: {
          type: "object",
          properties: {
            url: { 
              type: "string", 
              description: "Video URL" 
            },
            language: { 
              type: "string", 
              description: "Language code. Defaults to 'en'",
              default: "en"
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

/**
 * Handle tool execution with unified error handling
 * @param action Async operation to execute
 * @param errorPrefix Error message prefix
 */
async function handleToolExecution<T>(
  action: () => Promise<T>,
  errorPrefix: string
): Promise<{
  content: Array<{ type: "text", text: string }>,
  isError?: boolean
}> {
  try {
    const result = await action();
    return {
      content: [{ type: "text", text: String(result) }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `${errorPrefix}: ${errorMessage}` }],
      isError: true
    };
  }
}

/**
 * Handles tool execution requests.
 */
server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    const toolName = request.params.name;
    const args = request.params.arguments as { 
      url: string;
      language?: string;
    };

    if (toolName === "get_available_subtitles") {
      return handleToolExecution(
        () => listSubtitles(args.url),
        "Error listing subtitle languages"
      );
    } else if (toolName === "get_subtitles") {
      return handleToolExecution(
        () => downloadSubtitles(args.url, args.language || GLOBAL_CONFIG.download.defaultSubtitleLanguage, GLOBAL_CONFIG.withoutTimestamp),
        "Error downloading subtitles"
      );
    } else {
      return {
        content: [{ type: "text", text: `Unknown tool: ${toolName}` }],
        isError: true
      };
    }
  }
);

/**
 * Starts the server using Stdio transport.
 */
async function startServer() {
  await initialize();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Start the server and handle potential errors
startServer().catch(console.error);
