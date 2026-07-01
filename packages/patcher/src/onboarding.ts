import * as fs from 'fs';
import * as path from 'path';
import { rawlist, password, input } from '@inquirer/prompts';
import chalk from 'chalk';
import dotenv from 'dotenv';

export async function checkAndRunOnboarding(projectRoot: string, force: boolean = false) {
  // Check if any valid API key is already set
  const hasKey = process.env.ANTHROPIC_API_KEY || 
                 process.env.OPENAI_API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.OLLAMA_URL;

  if (hasKey && !force) return;

  if (force) {
    console.log(chalk.bold.hex('#d97757')('\nVisora Configuration'));
    console.log(chalk.gray('──────────────────────────────────────────────────'));
    console.log(chalk.white('Let\'s set up a new AI provider.'));
  } else {
    console.log(chalk.bold.hex('#d97757')('\nVisora Autonomous Agent Setup'));
    console.log(chalk.gray('──────────────────────────────────────────────────'));
    console.log(chalk.white('It looks like this is your first time running Visora!'));
    console.log(chalk.gray('To let the daemon write code for you, you need to configure an AI provider.\n'));
  }

  const provider = await rawlist({
    message: 'Select AI Provider:',
    choices: [
      { name: 'Anthropic (Claude 3.5 Sonnet)', value: 'anthropic' },
      { name: 'OpenAI (GPT-4o)', value: 'openai' },
      { name: 'Google Gemini (1.5 Pro)', value: 'gemini' },
      { name: 'Ollama (Local Models)', value: 'ollama' },
      { name: 'OpenRouter (Multi-model Aggregator)', value: 'openrouter' },
      { name: 'DeepSeek (V3 / R1 Coder)', value: 'deepseek' },
      { name: 'NVIDIA NIM (Nemotron Models)', value: 'nvidia' },
      { name: 'Groq (Ultra-fast Llama 3)', value: 'groq' },
      { name: 'LM Studio (Local Desktop Server)', value: 'lmstudio' },
      { name: 'Custom OpenAI-Compatible Endpoint', value: 'custom_openai' },
    ],
  });

  let envContent = '\n';

  if (provider === 'anthropic') {
    const key = await password({ message: 'Enter your Anthropic API Key (sk-ant-...):', mask: '*' });
    envContent += `ANTHROPIC_API_KEY=${key}\n`;
  } else if (provider === 'openai') {
    const key = await password({ message: 'Enter your OpenAI API Key (sk-proj-...):', mask: '*' });
    envContent += `OPENAI_API_KEY=${key}\n`;
  } else if (provider === 'gemini') {
    const key = await password({ message: 'Enter your Gemini API Key:', mask: '*' });
    envContent += `GEMINI_API_KEY=${key}\n`;
  } else if (provider === 'ollama') {
    const url = await input({ message: 'Enter Ollama URL:', default: 'http://localhost:11434' });
    const model = await input({ message: 'Enter Ollama Model:', default: 'llama3' });
    envContent += `OLLAMA_URL=${url}\nOLLAMA_MODEL=${model}\n`;
  } else if (provider === 'lmstudio') {
    const url = await input({ message: 'Enter LM Studio Server URL:', default: 'http://localhost:1234/v1' });
    const model = await input({ message: 'Enter Model Name (or leave default):', default: 'local-model' });
    envContent += `OPENAI_API_KEY=lm-studio\nOPENAI_BASE_URL=${url}\nOPENAI_MODEL_NAME=${model}\nPROVIDER_DISPLAY_NAME=LM Studio\n`;
  } else {
    // Handling all other OpenAI-compatible APIs (OpenRouter, DeepSeek, NVIDIA, Groq, Custom)
    let defaultUrl = '';
    let defaultModel = '';
    let displayName = '';

    if (provider === 'openrouter') { defaultUrl = 'https://openrouter.ai/api/v1'; defaultModel = 'anthropic/claude-3.5-sonnet'; displayName = 'OpenRouter'; }
    if (provider === 'deepseek') { defaultUrl = 'https://api.deepseek.com'; defaultModel = 'deepseek-coder'; displayName = 'DeepSeek'; }
    if (provider === 'nvidia') { defaultUrl = 'https://integrate.api.nvidia.com/v1'; defaultModel = 'nvidia/nemotron-4-340b-instruct'; displayName = 'NVIDIA NIM'; }
    if (provider === 'groq') { defaultUrl = 'https://api.groq.com/openai/v1'; defaultModel = 'llama3-70b-8192'; displayName = 'Groq'; }
    if (provider === 'custom_openai') { displayName = 'Custom API'; }

    const key = await password({ message: `Enter your ${displayName} API Key:`, mask: '*' });
    const url = await input({ message: 'Enter API Base URL:', default: defaultUrl });
    const model = await input({ message: 'Enter Model Name:', default: defaultModel });
    
    envContent += `OPENAI_API_KEY=${key}\nOPENAI_BASE_URL=${url}\nOPENAI_MODEL_NAME=${model}\nPROVIDER_DISPLAY_NAME=${displayName}\n`;
  }

  const envPath = path.join(projectRoot, '.env');
  
  if (fs.existsSync(envPath)) {
    fs.appendFileSync(envPath, envContent);
  } else {
    fs.writeFileSync(envPath, envContent);
  }

  // Reload dotenv to pick up the new keys immediately
  dotenv.config({ path: envPath, override: true });

  console.log(chalk.green(`\n✔ Configuration saved to ${envPath}`));
  console.log(chalk.gray('──────────────────────────────────────────────────\n'));
}
