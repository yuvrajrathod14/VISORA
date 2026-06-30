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
| **Precision Visual Selection** | `Alt+Click` any component in your running application. Visora highlights it instantly with source file and line info. |
| **Multi-Component Selection** | `Shift+Alt+Click` to select multiple DOM nodes simultaneously for grouped AI patches. |
| **Deep AST Context** | Automatically extracts React Fiber data, Vue contexts, component names, props, and hierarchical DOM structures. |
| **Multimodal AI Vision** | Visora takes a high-res screenshot of the component and sends it to the AI for true visual understanding! |
| **Safe Preview Dashboard** | AI patches are held in a local HTTP dashboard (`localhost:4444`) so you can review a visual code diff before applying. |
| **Autonomous Patcher** | A standalone background CLI agent that connects to Anthropic, OpenAI, Gemini, or Ollama. |
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

### Supported Frameworks

Visora currently supports the following frameworks and build tools:
- **React (Vite)**
- **Vue 3 (Vite)**
- **Next.js (App Router & Pages Router)**

## 🎮 Quick Start the Demos

Visora comes with 3 pre-configured demo applications so you can test it across different frameworks immediately.

### 1. React (Vite) Demo - The Main Landing Page
```bash
cd apps/demo
npm run dev
```
Navigate to `http://localhost:5174/` in your browser.

### 2. Vue 3 (Vite) Demo
```bash
cd apps/demo-vue
npm run dev
```
Navigate to `http://localhost:5175/` (or whichever port Vite assigns).

### 3. Next.js (App Router) Demo
```bash
cd apps/demo-next
npm run dev
```
Navigate to `http://localhost:3000/`.

### 4. Start the Autonomous Daemon
```bash
npx visora
```
If this is your first time, Visora will launch an **interactive setup wizard** that asks you to choose your AI provider (Anthropic, OpenAI, Gemini, or Ollama) and securely saves it to `.env`.

## 🔌 Auto-Install into Your Own Projects

Want to use Visora in your own Next.js or Vite apps? You don't need to clone this repository anymore! Visora is available globally on NPM.

1. Open your terminal inside your external project directory.
2. Run the initialization command:
```bash
npx @visora/patcher init
```
This script will automatically:
- Detect your framework (Next.js, Vite React, or Vue).
- Install the required `@visora` packages from the NPM registry.
- Safely inject the Visora tracker into your `vite.config.ts` or Next.js `app/layout.tsx`.

Once it's hooked, using Visora is just 2 simple steps:

**Step 1. Run the Daemon (in any terminal)**
```bash
npx visora
```

**Step 2. Start Your App (in your project folder)**
```bash
npm run dev
```

That's it! Now open your app in the browser, `Alt+Click` any UI element, and the Visora AI will magically patch your code!
---

## ⌨️ CLI Reference

The Visora CLI is a professional-grade developer tool with full command support.

| Command | Description |
|---|---|
| `npx visora` | Start the daemon (watches for UI instructions) |
| `npx visora --config` | Re-configure your AI provider interactively |
| `npx visora --status` | Show queue status across the entire workspace |
| `npx visora --clear` | Remove all completed/failed tasks from queues |
| `npx visora --purge` | Delete all Visora data, queues, screenshots, and history |
| `npx visora --undo` | Undo the last successful AI patch |
| `npx visora --help` | Display the full help page with usage & env vars |
| `npx visora --version` | Print version number |

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

Since Visora is not yet published to NPM, you can use our 1-click installer to automatically link it into any Vite/React project.

### Automated Installer

Run the initialization script from the root of your Vite or Next.js project. Visora will automatically detect your framework, install the correct engines, and patch your configuration file (`vite.config.ts` or `app/layout.tsx`).*

### Step 2: Start Coding!
1. Start your live project (`npm run dev`).
2. The Visora overlay will appear. Alt+Click components to queue instructions!
3. Run `npx visora` in a second terminal to process the queue.

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
