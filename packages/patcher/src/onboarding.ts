import * as fs from 'fs';
import * as path from 'path';
import { select, password, input } from '@inquirer/prompts';
import chalk from 'chalk';
import dotenv from 'dotenv';

export async function checkAndRunOnboarding(projectRoot: string) {
  // Check if any valid API key is already set
  const hasKey = process.env.ANTHROPIC_API_KEY || 
                 process.env.OPENAI_API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.OLLAMA_URL;

  if (hasKey) return;

  console.log(chalk.bold.hex('#d97757')('\nVisora Autonomous Agent Setup'));
  console.log(chalk.gray('──────────────────────────────────────────────────'));
  console.log(chalk.white('It looks like this is your first time running Visora!'));
  console.log(chalk.gray('To let the daemon write code for you, you need to configure an AI provider.\n'));

  const provider = await select({
    message: 'Which AI Provider would you like to use?',
    choices: [
      {
        name: 'Anthropic (Recommended)',
        value: 'anthropic',
        description: 'Best for complex frontend coding tasks.',
      },
      {
        name: 'OpenAI',
        value: 'openai',
        description: 'Use GPT-4o for fast and accurate code generation.',
      },
      {
        name: 'Gemini',
        value: 'gemini',
        description: 'Use Google Gemini 1.5 Pro.',
      },
      {
        name: 'Ollama (Local)',
        value: 'ollama',
        description: 'Run completely locally. Free and private.',
      }
    ],
  });

  let envContent = '\n';

  if (provider === 'anthropic') {
    const key = await password({ message: 'Enter your Anthropic API Key (sk-ant-...):', mask: '*' });
    const model = await input({ message: 'Enter Model Name:', default: 'claude-3-5-sonnet-20241022' });
    envContent += `ANTHROPIC_API_KEY=${key}\nANTHROPIC_MODEL=${model}\n`;
  } else if (provider === 'openai') {
    const key = await password({ message: 'Enter your OpenAI API Key (sk-proj-...):', mask: '*' });
    const model = await input({ message: 'Enter Model Name:', default: 'gpt-4o' });
    envContent += `OPENAI_API_KEY=${key}\nOPENAI_MODEL=${model}\n`;
  } else if (provider === 'gemini') {
    const key = await password({ message: 'Enter your Gemini API Key:', mask: '*' });
    const model = await input({ message: 'Enter Model Name:', default: 'gemini-1.5-pro' });
    envContent += `GEMINI_API_KEY=${key}\nGEMINI_MODEL=${model}\n`;
  } else if (provider === 'ollama') {
    const url = await input({ message: 'Enter Ollama URL:', default: 'http://localhost:11434' });
    const model = await input({ message: 'Enter Ollama Model:', default: 'llama3' });
    envContent += `OLLAMA_URL=${url}\nOLLAMA_MODEL=${model}\n`;
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
