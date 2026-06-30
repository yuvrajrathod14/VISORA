<div align="center">
  
  # 🔮 VISORA
  
  **The Visual Context Engine for AI Coding.**
  
  [![Made by Visionatrix](https://img.shields.io/badge/Made%20by-Visionatrix-8B5CF6?style=for-the-badge)](https://visionatrix.com)
  [![Developer](https://img.shields.io/badge/Developer-Yuvraj%20Rathod-10B981?style=for-the-badge)](#)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
  [![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg?style=for-the-badge)](#)

  *Edit your UI by clicking, not describing.*
</div>

---

## 📖 Overview

Visora bridges the critical gap between what you see in the browser and what your AI coding assistant (Cursor, Windsurf, Copilot) knows about your code. 

Instead of copying and pasting code snippets, explaining file paths, and describing UI elements—you simply **Alt+Click** any component in your running application, type a natural language instruction, and let Visora handle the rest.

A proud product of **[Visionatrix](#)**, developed by **Yuvraj Rathod**.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Precision Visual Selection** | Hover and click any component in your running React app. Visora highlights it instantly with source file and line info. |
| **Deep AST Context** | Automatically extracts React Fiber data, component names, props, and hierarchical DOM structures. |
| **Multi-Action Queue** | Queue up dozens of UI modifications simultaneously without breaking your flow. |
| **Autonomous Patcher** | A standalone background CLI agent that connects to Anthropic, OpenAI, Gemini, or Ollama. |
| **Native MCP Server** | Seamlessly plug Visora into Cursor or Windsurf for IDE-integrated AI editing. |
| **Interactive Setup** | First-time users are guided through an interactive AI provider wizard in the terminal. |

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/yuvrajrathod14/VISORA.git
cd VISORA
pnpm install
```

### 2. Build Core Packages
```bash
pnpm --filter "@visora/*" build
```

### 3. Start the Demo App
```bash
pnpm dev
```
Navigate to `http://localhost:5174/` in your browser. The Visora overlay will be active.

### 4. Start the Autonomous Daemon
```bash
pnpm visora
```
If this is your first time, Visora will launch an **interactive setup wizard** that asks you to choose your AI provider (Anthropic, OpenAI, Gemini, or Ollama) and securely saves it to `.env`.

---

## ⌨️ CLI Reference

The Visora CLI is a professional-grade developer tool with full command support.

| Command | Description |
|---|---|
| `pnpm visora` | Start the daemon (watches for UI instructions) |
| `pnpm visora --config` | Re-configure your AI provider interactively |
| `pnpm visora --status` | Show queue status across the entire workspace |
| `pnpm visora --clear` | Remove all completed/failed tasks from queues |
| `pnpm visora --help` | Display the full help page with usage & env vars |
| `pnpm visora --version` | Print version number |

### Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `OLLAMA_URL` | Ollama server URL (e.g. `http://localhost:11434`) |
| `OLLAMA_MODEL` | Ollama model name (e.g. `llama3`) |
| `VISORA_PROJECT_ROOT` | Custom project root path |

---

## 📦 Use Visora in Your Own Project

Since Visora is not yet published to NPM, you can link it locally into any Vite/React project.

### Step 1: Install the Vite Plugin
```bash
cd /path/to/your/live-project
npm install -D /path/to/VISORA/packages/vite-plugin
```

### Step 2: Configure `vite.config.ts`
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import visora from '@visora/vite-plugin';

export default defineConfig({
  plugins: [react(), visora()]
});
```

### Step 3: Start Coding!
1. Start your live project (`npm run dev`).
2. The Visora overlay will appear. Alt+Click components to queue instructions!
3. Run `pnpm visora` in a second terminal to process the queue.

---

## 🛠️ The Dual-Workflow Architecture

Visora offers two professional workflows depending on your preference.

### Workflow A: The Autonomous Daemon
Run `pnpm visora` in a terminal. The daemon watches for instructions in the `.visora/queue.json` file and autonomously generates and applies code patches using your configured AI provider.

### Workflow B: The MCP Server (IDE Integration)
Connect your AI IDE (Cursor, Windsurf) to the Visora MCP server for interactive, IDE-integrated coding.

**Configure MCP in your IDE:**
- **Name:** `visora`
- **Type:** `command`
- **Command:** `node`
- **Args:** `/absolute/path/to/VISORA/packages/mcp-server/dist/index.js`
- **Env:** `VISORA_PROJECT_ROOT=/absolute/path/to/VISORA`

Then simply tell your IDE chat: *"Process my Visora queue"*.

---

## ©️ Legal & Copyright

**VISORA™** is a registered trademark and flagship product of **Visionatrix**.

- **Lead Developer & Architect:** Yuvraj Rathod
- **Company:** Visionatrix
- **Copyright:** © 2026 Visionatrix. All Rights Reserved.

### License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---
<div align="center">
  <i>Built with 💜 for the Agentic Coding Era by Visionatrix.</i>
</div>
