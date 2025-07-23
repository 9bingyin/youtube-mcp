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
  // Handle different line endings (Windows CRLF, Unix LF, Mac CR)
  const lines = content.split(/\r?\n/);
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
    
    // Skip timestamp lines - comprehensive regex to handle WebVTT positioning
    // Matches: HH:MM:SS.mmm --> HH:MM:SS.mmm [optional cue settings]
    // Cue settings include: position:X%, line:X%|X, align:start|middle|end, size:X%, vertical:rl|lr
    if (/^\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}(?:\s+(?:position:\d+%|line:-?\d+%?|align:(?:start|middle|end)|size:\d+%|vertical:(?:rl|lr)))*\s*$/.test(line)) {
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
    
    const lines = output.split('\n');
    const result: string[] = [];
    let currentSection = '';
    let hasManualSubtitles = false;
    let originalLanguages: Set<string> = new Set();
    
    for (const line of lines) {
      // Skip debug and verbose information
      if (line.startsWith('[debug]') || 
          line.startsWith('[youtube]') || 
          line.includes('Downloading') || 
          line.includes('Extracting URL') ||
          line.includes('Command-line config') ||
          line.includes('Encodings:') ||
          line.includes('Python ') ||
          line.includes('exe versions:') ||
          line.includes('Optional libraries:') ||
          line.includes('Proxy map:') ||
          line.includes('Request Handlers:') ||
          line.includes('Plugin directories:') ||
          line.includes('Loaded ') ||
          line.includes('PO Token') ||
          line.includes('Decrypted nsig') ||
          line.includes('Sort order') ||
          line.includes('Formats sorted') ||
          line.includes('GVS PO Token')) {
        continue;
      }
      
      // Detect section headers
      if (line.includes('Available automatic captions for')) {
        currentSection = 'auto';
        result.push('[info] Available automatic captions:');
        continue;
      } else if (line.includes('Available subtitles for')) {
        currentSection = 'manual';
        hasManualSubtitles = true;
        result.push('[info] Available manual subtitles:');
        continue;
      }
      
      // Process subtitle lines
      if (currentSection && line.trim() && !line.startsWith('Language')) {
        // Skip the final "has no subtitles" line
        if (line.includes('has no subtitles')) {
          continue;
        }
        
        // Format 2: Skip auto-translated subtitles (containing " from ")
        if (line.includes(' from ')) {
          continue;
        }
        
        // For automatic captions, identify original languages
        if (currentSection === 'auto') {
          const match = line.match(/^([a-z-]+)\s+(.+?)?\s+vtt/);
          if (match) {
            const langCode = match[1];
            const langName = match[2]?.trim() || '';
            
            // Format 1: Detect original languages by looking for patterns
            if (langCode.endsWith('-orig') || // e.g., es-orig
                (langName.includes('Original')) || // e.g., "Spanish (Original)"
                (!langName && langCode.length <= 3)) { // e.g., "zh", "en" with no name
              
              // Extract base language from -orig suffix
              const baseLang = langCode.replace('-orig', '');
              originalLanguages.add(baseLang);
              originalLanguages.add(langCode); // Also add the -orig version
              result.push(line);
            }
            // For languages that match detected original languages, include them
            else if (originalLanguages.has(langCode)) {
              result.push(line);
            }
            // For very short unnamed entries (likely original auto-captions)
            else if (!langName && langCode.length <= 3) {
              originalLanguages.add(langCode);
              result.push(line);
            }
          }
        } else {
          // For manual subtitles, include all
          result.push(line);
        }
      } else if (line.startsWith('Language')) {
        // Keep header lines
        result.push(line);
      }
    }
    
    // Second pass: now that we know the original languages, filter more precisely
    if (currentSection === 'auto' && !hasManualSubtitles && originalLanguages.size > 0) {
      const finalResult = result.filter((line, index) => {
        if (index < 2) return true; // Keep headers
        
        const match = line.match(/^([a-z-]+)\s+/);
        if (match) {
          const langCode = match[1];
          // Keep only languages that are in our original languages set
          return originalLanguages.has(langCode) || originalLanguages.has(langCode.replace('-orig', ''));
        }
        return true;
      });
      
      if (finalResult.length > 2) {
        return finalResult.join('\n');
      }
    }
    
    // If no valid subtitles found, provide a clear message
    if (result.length <= 2) { // Only headers, no actual subtitles
      result.push('No subtitles available for this video.');
    }
    
    return result.join('\n');
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
      // Get available subtitles to provide helpful error message
      try {
        const availableSubtitles = await listSubtitles(url);
        const availableLanguages = extractAvailableLanguages(availableSubtitles);
        
        if (availableLanguages.length > 0) {
          throw new Error(`No subtitles found for language '${language}'. Available languages: ${availableLanguages.join(', ')}`);
        } else {
          throw new Error('No subtitles available for this video');
        }
      } catch (listError) {
        // If we can't get the list, fall back to generic error
        throw new Error(`No subtitles found for language '${language}'`);
      }
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

/**
 * Extract available language codes from subtitle listing
 * @param subtitleListing - Output from listSubtitles function
 * @returns Array of available language codes
 */
function extractAvailableLanguages(subtitleListing: string): string[] {
  const languages: string[] = [];
  const lines = subtitleListing.split('\n');
  
  for (const line of lines) {
    // Match lines that start with language codes
    const match = line.match(/^([a-z]{2}(?:-[A-Za-z]+)?)\s+/);
    if (match) {
      const langCode = match[1];
      if (!languages.includes(langCode)) {
        languages.push(langCode);
      }
    }
  }
  
  return languages;
}
 
