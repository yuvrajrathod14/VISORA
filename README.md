<div align="center">
  <img src="https://raw.githubusercontent.com/yuvrajrathod14/VISORA/main/apps/demo/public/favicon.ico" alt="Visora Logo" width="120" height="120" style="border-radius: 20px; margin-bottom: 20px;" />
  
  # 🔮 VISORA
  
  **The Visual Context Engine for AI Coding.**
  
  [![Made by Visionatrix](https://img.shields.io/badge/Made%20by-Visionatrix-8B5CF6?style=for-the-badge)](https://visionatrix.com)
  [![Developer](https://img.shields.io/badge/Developer-Yuvraj%20Rathod-10B981?style=for-the-badge)](#)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

  *Edit your UI by clicking, not describing.*
</div>

---

## 📖 Overview

Visora bridges the critical gap between what you see in the browser and what your AI coding assistant (Cursor, Windsurf, Copilot) knows about your code. 

Instead of copying and pasting code snippets, explaining file paths, and describing UI elements—you simply **Alt+Click** any component in your running application, type a natural language instruction, and let Visora handle the rest.

A proud product of **[Visionatrix](#)**, developed by **Yuvraj Rathod**.

---

## ✨ Features

- **🎯 Precision Visual Selection:** Hover and click any component in your running React app. Visora highlights it instantly and binds it to the exact source file and line info.
- **🧬 Deep AST Context:** Automatically extracts React Fiber data, including component names, props, and hierarchical DOM structures.
- **⚡ Multi-Action Queue:** Queue up dozens of UI modifications simultaneously without breaking your flow.
- **🤖 Autonomous Patcher Daemon:** A standalone background CLI agent that connects to Anthropic, OpenAI, Gemini, or Ollama to automatically write and inject code patches.
- **🔌 Native MCP Server:** Seamlessly plug Visora into Cursor or Windsurf to allow your IDE to read the visual context queue directly.

---

## 🚀 Getting Started (Local Development)

Since Visora is currently structured as a modern monorepo workspace, you can easily try it out by running the built-in demo application.

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
*Navigate to `http://localhost:5174/` in your browser. The Visora overlay will be active in the bottom left corner.*

## 📦 How to Use Visora in Your OWN Live Project

Since Visora is not yet published to the NPM registry, you can easily use it in any of your live projects right now by linking the local packages.

### Step 1: Prepare the Visora Engine
First, clone this repository somewhere on your computer and build the core packages:
```bash
git clone https://github.com/yuvrajrathod14/VISORA.git
cd VISORA
pnpm install
pnpm --filter "@visora/*" build
```

### Step 2: Install Visora into your Live Project
Navigate to your own React/Vite project and install the local Visora packages by pointing directly to the folder paths:
```bash
cd /path/to/your/live-project

# Install the Vite Plugin as a dev dependency
npm install -D /path/to/VISORA/packages/vite-plugin

# (Optional) Install the Patcher Daemon if you want autonomous patching
npm install -g /path/to/VISORA/packages/patcher
```

### Step 3: Configure your Vite App
In your live project, open your `vite.config.ts` (or `.js`) and add the Visora plugin:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import visora from '@visora/vite-plugin';

export default defineConfig({
  plugins: [react(), visora()]
});
```

### Step 4: Start Coding!
1. Start your live project (`npm run dev`).
2. You will see the Visora overlay in your app. Alt+Click components to queue up instructions!
3. To process the queue, either start the autonomous daemon inside your project folder (`visora`) or connect your IDE to the MCP server!

---

## 🛠️ The Dual-Workflow Architecture

Visora is designed for absolute flexibility, offering two professional workflows depending on your AI preferences.

### Workflow A: The Autonomous Daemon
Visora comes with a built-in CLI agent that runs in the background and edits files autonomously.

1. **Configure your AI Provider:**
   Create a `.env` file in the root directory and add **one** of the following:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   # OR
   OPENAI_API_KEY=sk-proj-...
   # OR
   GEMINI_API_KEY=AIzaSy...
   # OR
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3
   ```

2. **Run the Daemon:**
   ```bash
   pnpm visora
   ```
3. **Queue Instructions:** Alt+Click components in your browser, type what you want to change, and watch the daemon instantly patch your source code.

### Workflow B: The MCP Server (IDE Integration)
If you prefer using **Cursor** or **Windsurf**, you can plug Visora directly into your IDE's brain.

1. **Configure MCP:**
   - Go to MCP Settings in your IDE.
   - Add a new `command` server named `visora`.
   - Command: `node`
   - Args: `/absolute/path/to/VISORA/packages/mcp-server/dist/index.js`
   - Env: `VISORA_PROJECT_ROOT=/absolute/path/to/VISORA`

2. **Use the Queue:**
   Queue up instructions in the browser, then tell your IDE chat: *"Process my Visora queue"*. The IDE will autonomously pull tasks, fetch the enriched AST context, and write the code.

---

## ©️ Legal & Copyright

**VISORA™** is a registered trademark and flagship product of **Visionatrix**.

- **Lead Developer & Architect:** Yuvraj Rathod
- **Company:** Visionatrix
- **Copyright:** © 2026 Visionatrix. All Rights Reserved.

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. By using, distributing, or contributing to this project, you agree to the terms and conditions outlined in the license.

---
<div align="center">
  <i>Built with 💜 for the Agentic Coding Era by Visionatrix.</i>
</div>
