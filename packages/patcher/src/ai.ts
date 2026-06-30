import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

export interface PatchResult {
  filePath: string;
  originalContent: string;
  modifiedContent: string;
}

export async function generatePatch(task: any): Promise<PatchResult | null> {
  const { instruction, sourceFile, sourceLine, componentName, tagName, props, ast, computedStyles } = task.selection;
  
  // Read the actual source code of the file to give the AI context
  const projectRoot = process.env.VISORA_PROJECT_ROOT || process.cwd();
  let sourceCode = '';
  try {
    sourceCode = fs.readFileSync(path.join(projectRoot, sourceFile), 'utf-8');
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

  throw new Error("No AI Provider configured. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY in your .env file.");
}

function parseAIResponse(text: string): PatchResult | null {
  try {
    // Sometimes the AI wraps the JSON in markdown blocks
    const jsonStr = text.replace(/^```json/m, '').replace(/^```/m, '').trim();
    const result = JSON.parse(jsonStr);
    if (result.filePath && result.originalContent && result.modifiedContent) {
      return result;
    }
  } catch (e) {
    console.error("Failed to parse AI JSON response:", text);
  }
  return null;
}
