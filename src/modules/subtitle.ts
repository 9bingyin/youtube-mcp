import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { _spawnPromise, validateUrl } from "./utils.js";

/**
 * Remove timestamps from subtitle content
 * @param content - The subtitle file content
 * @returns Content without timestamps
 */
function removeTimestamps(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Skip VTT headers
    if (line === 'WEBVTT' || line.startsWith('Kind:') || line.startsWith('Language:')) {
      continue;
    }
    
    // Skip SRT sequence numbers (just numbers)
    if (/^\d+$/.test(line)) {
      continue;
    }
    
    // Skip timestamp lines with more precise regex
    if (/^\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}$/.test(line)) {
      continue;
    }
    
    // Clean HTML tags and keep subtitle text content
    const cleanedLine = line.replace(/<[^>]*>/g, '');
    if (cleanedLine.trim()) {
      result.push(cleanedLine.trim());
    }
  }
  
  return result.join('\n').trim();
}

/**
 * Lists all available subtitles for a video.
 * 
 * @param url - The URL of the video
 * @returns Promise resolving to a string containing the list of available subtitles
 * @throws {Error} When URL is invalid or subtitle listing fails
 * 
 * @example
 * ```typescript
 * try {
 *   const subtitles = await listSubtitles('https://youtube.com/watch?v=...');
 *   console.log('Available subtitles:', subtitles);
 * } catch (error) {
 *   console.error('Failed to list subtitles:', error);
 * }
 * ```
 */
export async function listSubtitles(url: string): Promise<string> {
  if (!validateUrl(url)) {
    throw new Error('Invalid or unsupported URL format');
  }

  try {
    const output = await _spawnPromise('yt-dlp', [
      '--ignore-config',
      '--list-subs',
      '--write-auto-sub',
      '--skip-download',
      url
    ]);
    
    // Filter out auto-translated subtitles (those containing " from ")
    // Also filter out debug information and verbose output
    // Keep manual subtitles and auto-generated subtitles
    const lines = output.split('\n');
    const filteredLines = lines.filter(line => {
      // Keep lines that don't contain " from " (which indicates auto-translation)
      if (line.includes(' from ')) return false;
      
      // Filter out debug and verbose information
      if (line.startsWith('[debug]')) return false;
      if (line.startsWith('[youtube]')) return false;
      if (line.includes('Downloading')) return false;
      if (line.includes('Extracting URL')) return false;
      if (line.includes('Command-line config')) return false;
      if (line.includes('Encodings:')) return false;
      if (line.includes('Python ')) return false;
      if (line.includes('exe versions:')) return false;
      if (line.includes('Optional libraries:')) return false;
      if (line.includes('Proxy map:')) return false;
      if (line.includes('Request Handlers:')) return false;
      if (line.includes('Plugin directories:')) return false;
      if (line.includes('Loaded ')) return false;
      if (line.includes('PO Token')) return false;
      if (line.includes('Decrypted nsig')) return false;
      if (line.includes('Sort order')) return false;
      if (line.includes('Formats sorted')) return false;
      if (line.includes('GVS PO Token')) return false;
      
      return true;
    });
    
    return filteredLines.join('\n');
  } catch (error) {
    throw error;
  }
}

/**
 * Downloads subtitles for a video in the specified language.
 * 
 * @param url - The URL of the video
 * @param language - Language code (e.g., 'en', 'zh-Hant', 'ja')
 * @param withoutTimestamp - Whether to remove timestamps from the output
 * @returns Promise resolving to the subtitle content
 * @throws {Error} When URL is invalid, language is not available, or download fails
 * 
 * @example
 * ```typescript
 * try {
 *   // Download English subtitles
 *   const enSubs = await downloadSubtitles('https://youtube.com/watch?v=...', 'en', false);
 *   console.log('English subtitles:', enSubs);
 * 
 *   // Download without timestamps
 *   const zhSubs = await downloadSubtitles('https://youtube.com/watch?v=...', 'zh-Hant', true);
 *   console.log('Chinese subtitles:', zhSubs);
 * } catch (error) {
 *   if (error.message.includes('No subtitle files found')) {
 *     console.warn('No subtitles available in the requested language');
 *   } else {
 *     console.error('Failed to download subtitles:', error);
 *   }
 * }
 * ```
 */
export async function downloadSubtitles(
  url: string,
  language: string,
  withoutTimestamp: boolean = false
): Promise<string> {
  if (!validateUrl(url)) {
    throw new Error('Invalid or unsupported URL format');
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'youtube-mcp-'));

  try {
    await _spawnPromise('yt-dlp', [
      '--ignore-config',
      '--write-sub',
      '--write-auto-sub',
      '--sub-lang', language,
      '--skip-download',
      '--output', path.join(tempDir, '%(title)s.%(ext)s'),
      url
    ]);

    const subtitleFiles = fs.readdirSync(tempDir)
      .filter(file => file.endsWith('.vtt'));

    if (subtitleFiles.length === 0) {
      throw new Error('No subtitle files found');
    }

    let output = '';
    for (const file of subtitleFiles) {
      output += fs.readFileSync(path.join(tempDir, file), 'utf8');
    }

    // Remove timestamps if requested
    if (withoutTimestamp) {
      output = removeTimestamps(output);
    }

    return output;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
 
