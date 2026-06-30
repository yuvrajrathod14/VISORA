# 🔮 Visora

**The visual context engine for AI coding.** 
Edit UI by clicking, not describing.

Visora bridges the gap between what you see in the browser and what your AI coding assistant (Cursor, Windsurf, Antigravity) knows about your code. Instead of copying and pasting code, explaining where the file is, and describing what the UI looks like—you simply **Alt+Click** a component in your running app, type an instruction, and Visora handles the rest.

---

## 🚀 How to Try Visora (Local Demo)

Since Visora is currently a monorepo workspace, the easiest way to try it out is to clone this repository and run the built-in demo app.

1. **Clone and Install**
   ```bash
   git clone https://github.com/yuvrajrathod14/VISORA.git
   cd VISORA
   pnpm install
   ```

2. **Build the Core Packages**
   ```bash
   pnpm --filter "@visora/*" build
   ```

3. **Start the Demo App**
   ```bash
   pnpm dev
   ```
   *Open `http://localhost:5174/` in your browser. You will see the Visora overlay in the bottom left corner.*

---

## 🛠️ The Dual-Workflow Architecture

Visora gives you two completely different ways to use the instructions you queue up in the browser.

### Workflow A: The Autonomous Daemon (Background AI)
Don't want to use an IDE chat? Visora comes with a built-in, standalone CLI agent that runs in the background and writes code for you automatically.

1. **Configure your AI Provider:**
   Create a `.env` file in the root of the repository and add **one** of the following:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   # OR
   OPENAI_API_KEY=sk-proj-...
   # OR
   GEMINI_API_KEY=AIzaSy...
   # OR
   OLLAMA_URL=http://localhost:11434
   ```

2. **Run the Patcher:**
   ```bash
   pnpm visora
   ```
3. **Watch it work:** Go to your browser, Alt+Click any component, type an instruction (e.g., "Make this button glassmorphism"), and watch the terminal. The daemon will instantly pick it up, talk to the AI, and patch your source files!

### Workflow B: The MCP Server (IDE Integration)
If you prefer using **Cursor**, **Windsurf**, or **Antigravity**, you can plug Visora directly into your IDE's brain.

1. **Add the MCP Server to Cursor/Windsurf:**
   - Go to MCP Settings in your IDE.
   - Add a new `command` server named `visora`.
   - Command: `node`
   - Args: `/absolute/path/to/VISORA/packages/mcp-server/dist/index.js`
   - Env: `VISORA_PROJECT_ROOT=/absolute/path/to/VISORA`

2. **Use it in Chat:**
   Queue up a bunch of instructions in the browser, then go to your IDE chat and say: 
   > *"Process my Visora queue"*
   
   Your IDE will automatically pull all pending tasks, fetch their exact AST data and source code context, and write the code interactively.

---

## 📦 How to use Visora in your OWN Projects (Coming Soon)

Visora is preparing for publication to NPM. Soon, you will be able to add it to any React/Vite project in seconds:

```bash
npm install -D @visora/vite-plugin
```

**vite.config.ts:**
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import visora from '@visora/vite-plugin';

export default defineConfig({
  plugins: [react(), visora()]
});
```

*(For now, if you want to use it in your own project, you can use `npm link` or `pnpm link` to symlink the local packages from this monorepo into your project!)*

---
**Built with 💜 for the Agentic Coding Era.**
