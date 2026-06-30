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

export async function generatePatch(task: any, appRoot: string): Promise<PatchResult | null> {
  const { instruction, sourceFile, sourceLine, componentName, tagName, props, ast, computedStyles } = task.selection;
  
  // Read the actual source code of the file to give the AI context
  let sourceCode = '';
  try {
    sourceCode = fs.readFileSync(path.join(appRoot, sourceFile), 'utf-8');
  } catch (e) {
    throw new Error(`Could not read source file: ${sourceFile}`);
  }

  const prompt = `You are an expert frontend AI agent.
The user wants to make a visual edit to a UI component.

Target File: ${sourceFile}
Target Component: <${componentName || tagName}> (around line ${sourceLine})

User Instruction: "${instruction}"

AST Data:
${JSON.stringify(ast, null, 2)}

Current Props:
${JSON.stringify(props, null, 2)}

File Source Code:
\`\`\`tsx
${sourceCode}
\`\`\`

Your job is to generate a patch.
Reply ONLY with a JSON object in this exact format (no markdown, no reasoning):
{
  "filePath": "${sourceFile}",
  "originalContent": "exact original code block to replace (must match exactly)",
  "modifiedContent": "the new code block"
}
`;

  if (process.env.ANTHROPIC_API_KEY) {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      system: "You are a helpful coding assistant that outputs strictly valid JSON.",
      messages: [{ role: "user", content: prompt }]
    });
    return parseAIResponse(msg.content[0].type === 'text' ? msg.content[0].text : '');
  } 
  
  if (process.env.OPENAI_API_KEY) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful coding assistant that outputs strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    return parseAIResponse(completion.choices[0].message.content || '');
  }

  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    return parseAIResponse(result.response.text());
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

function parseAIResponse(text: string | undefined): PatchResult | null {
  if (!text) {
    console.error("  [visora] AI response was empty or undefined.");
    return null;
  }
  try {
    // Extract JSON block even if the AI hallucinates conversational text before/after
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1 || end < start) {
      console.error("  [visora] Failed to find a valid JSON object in the AI response.");
      console.error("  Raw Output:", text.slice(0, 200) + '...');
      return null;
    }
    
    const jsonStr = text.slice(start, end + 1);
    const result = JSON.parse(jsonStr);
    
    if (result.filePath && result.originalContent && result.modifiedContent) {
      return result;
    } else {
      console.error("  [visora] AI JSON is missing required fields (filePath, originalContent, modifiedContent).");
    }
  } catch (e) {
    console.error("  [visora] Failed to parse AI JSON response. Error:", e);
    console.error("  Raw Output:", text.slice(0, 200) + '...');
  }
  return null;
}
