import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

export interface PatchResult {
  filePath: string;
  originalContent: string;
  modifiedContent: string;
}

export async function generatePatch(task: any, appRoot: string): Promise<PatchResult[] | null> {
  const isMulti = !!task.selection.selections;
  const selections = isMulti ? task.selection.selections : [task.selection];
  const instruction = isMulti ? task.selection.instruction : task.selection.instruction;
  
  // Collect unique source files
  const uniqueFiles = new Set<string>();
  selections.forEach((sel: any) => { if (sel.sourceFile) uniqueFiles.add(sel.sourceFile); });

  let sourceCodeBlocks = '';
  for (const file of uniqueFiles) {
    try {
      const code = fs.readFileSync(path.join(appRoot, file), 'utf-8');
      const ext = path.extname(file).slice(1) || 'tsx';
      sourceCodeBlocks += `\n--- File: ${file} ---\n\`\`\`${ext}\n${code}\n\`\`\`\n`;
    } catch (e) {
      console.warn(`Could not read source file: ${file}`);
    }
  }

  const targetsDescription = selections.map((sel: any, i: number) => 
    `[${i + 1}] Component: <${sel.componentName || sel.tagName}> in ${sel.sourceFile} (around line ${sel.sourceLine})`
  ).join('\n');

  const prompt = `You are an expert frontend AI agent (Vue, Next.js, React).
The user wants to make a visual edit to one or more UI components simultaneously.

User Instruction: "${instruction}"

Target Components:
${targetsDescription}

Source Code:
${sourceCodeBlocks}

Your job is to generate patches for the requested changes.
Reply ONLY with a JSON ARRAY of objects in this exact format (no markdown, no reasoning):
[
  {
    "filePath": "relative/path/to/file",
    "originalContent": "exact original code block to replace (must match exactly)",
    "modifiedContent": "the new code block"
  }
]
`;

  let imageBase64 = null;
  let mimeType = 'image/png';
  if (task.selection.screenshotFile) {
    try {
      const imgPath = path.join(appRoot, task.selection.screenshotFile);
      imageBase64 = fs.readFileSync(imgPath).toString('base64');
    } catch (e) {
      console.warn("Could not read screenshot file for AI vision context.");
    }
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const content: any[] = [];
      if (imageBase64) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: "image/png", data: imageBase64 }
        });
      }
      content.push({ type: "text", text: prompt });

      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        system: "You are a helpful coding assistant that outputs strictly valid JSON.",
        messages: [{ role: "user", content }]
      });
      return parseAIResponse(msg.content[0].type === 'text' ? msg.content[0].text : '');
    } catch (e: any) {
      throw new Error(`Anthropic API Error: ${e.message || 'Connection failed'}`);
    }
  } 
  
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const content: any[] = [];
      content.push({ type: "text", text: prompt });
      if (imageBase64) {
        content.push({
          type: "image_url",
          image_url: { url: `data:image/png;base64,${imageBase64}` }
        });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful coding assistant that outputs strictly valid JSON." },
          { role: "user", content }
        ],
        response_format: { type: "json_object" }
      });
      return parseAIResponse(completion.choices[0].message.content || '');
    } catch (e: any) {
      throw new Error(`OpenAI API Error: ${e.message || 'Connection failed'}`);
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const parts: any[] = [{ text: prompt }];
      if (imageBase64) {
        parts.push({
          inlineData: { data: imageBase64, mimeType: "image/png" }
        });
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json" }
      });
      return parseAIResponse(result.response.text());
    } catch (e: any) {
      throw new Error(`Google Gemini Error: ${e.message || 'Connection failed'}`);
    }
  }

  if (process.env.OLLAMA_URL) {
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
    try {
      const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: "You must reply ONLY in valid JSON.\n\n" + prompt,
          format: 'json',
          stream: false
        })
      });
      const data = await response.json() as any;
      if (data.error) {
        throw new Error(`Ollama Error: ${data.error}`);
      }
      if (typeof data.response !== 'string') {
        throw new Error(`Unexpected Ollama response format: ${JSON.stringify(data)}`);
      }
      return parseAIResponse(data.response);
    } catch (e: any) {
      throw new Error(`Failed to connect to Ollama at ${process.env.OLLAMA_URL}: ${e.message}`);
    }
  }

  throw new Error("No AI Provider configured. Please set ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or OLLAMA_URL in your .env file.");
}

function parseAIResponse(text: string | undefined): PatchResult[] | null {
  if (!text) {
    console.error("  [visora] AI response was empty or undefined.");
    return null;
  }
  try {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start === -1 || end === -1 || end < start) {
      // Fallback: try parsing as a single object if it failed to return an array
      const objStart = text.indexOf('{');
      const objEnd = text.lastIndexOf('}');
      if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
        const obj = JSON.parse(text.slice(objStart, objEnd + 1));
        if (obj.filePath && obj.originalContent) {
          if (obj.modifiedContent === undefined) obj.modifiedContent = '';
          return [obj];
        }
      }
      
      console.error("  [visora] Failed to find a valid JSON array in the AI response.");
      return null;
    }
    
    const jsonStr = text.slice(start, end + 1);
    const results = JSON.parse(jsonStr);
    
    if (Array.isArray(results)) {
      const validResults = results.filter(r => typeof r.filePath === 'string' && typeof r.originalContent === 'string');
      validResults.forEach(r => { if (r.modifiedContent === undefined) r.modifiedContent = ''; });
      return validResults.length > 0 ? validResults : null;
    }
    
  } catch (e) {
    console.error("  [visora] Failed to parse AI JSON response. Error:", e);
  }
  return null;
}
