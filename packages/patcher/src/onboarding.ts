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
      { name: 'Anthropic (Claude Models)', value: 'anthropic' },
      { name: 'OpenAI (GPT Models)', value: 'openai' },
      { name: 'Google Gemini', value: 'gemini' },
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
    const model = await input({ message: 'Enter Model Name:', default: 'claude-3-5-sonnet-20241022' });
    while (true) {
      const key = await password({ message: 'Enter your Anthropic API Key (sk-ant-...):', mask: '*' });
      console.log(chalk.gray('Validating key...'));
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
          body: JSON.stringify({ model: model, max_tokens: 1, messages: [{role: 'user', content: 'hi'}] })
        });
        if (res.status === 401 || res.status === 403) {
          console.log(chalk.red('✖ Invalid Anthropic API Key. Please try again.'));
          continue;
        }
        envContent += `ANTHROPIC_API_KEY=${key}\nANTHROPIC_MODEL=${model}\n`;
        break;
      } catch (err: any) {
        console.log(chalk.red(`✖ Network error while validating: ${err.message}`));
      }
    }
  } else if (provider === 'openai' || provider === 'gemini') {
    const isGemini = provider === 'gemini';
    const baseUrl = isGemini ? 'https://generativelanguage.googleapis.com/v1beta/openai/models' : 'https://api.openai.com/v1/models';
    const msg = isGemini ? 'Enter your Gemini API Key:' : 'Enter your OpenAI API Key (sk-proj-...):';
    const model = await input({ message: 'Enter Model Name:', default: isGemini ? 'gemini-1.5-pro' : 'gpt-4o' });
    
    while (true) {
      const key = await password({ message: msg, mask: '*' });
      console.log(chalk.gray('Validating key...'));
      try {
        const res = await fetch(baseUrl, {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        if (res.status === 401 || res.status === 403) {
          console.log(chalk.red('✖ Invalid API Key. Please try again.'));
          continue;
        }
        if (isGemini) envContent += `GEMINI_API_KEY=${key}\nGEMINI_MODEL=${model}\n`;
        else envContent += `OPENAI_API_KEY=${key}\nOPENAI_MODEL_NAME=${model}\n`;
        break;
      } catch (err: any) {
        console.log(chalk.red(`✖ Network error while validating: ${err.message}`));
      }
    }
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

    const url = await input({ message: 'Enter API Base URL:', default: defaultUrl });
    const model = await input({ message: 'Enter Model Name:', default: defaultModel });
    
    while (true) {
      const key = await password({ message: `Enter your ${displayName} API Key:`, mask: '*' });
      console.log(chalk.gray('Validating key...'));
      try {
        const res = await fetch(`${url}/models`, {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        if (res.status === 401 || res.status === 403) {
          console.log(chalk.red(`✖ Invalid ${displayName} API Key. Please try again.`));
          continue;
        }
        envContent += `OPENAI_API_KEY=${key}\nOPENAI_BASE_URL=${url}\nOPENAI_MODEL_NAME=${model}\nPROVIDER_DISPLAY_NAME=${displayName}\n`;
        break;
      } catch (err: any) {
        console.log(chalk.yellow(`⚠ Could not reach ${url}/models. Saving anyway.`));
        envContent += `OPENAI_API_KEY=${key}\nOPENAI_BASE_URL=${url}\nOPENAI_MODEL_NAME=${model}\nPROVIDER_DISPLAY_NAME=${displayName}\n`;
        break;
      }
    }
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
