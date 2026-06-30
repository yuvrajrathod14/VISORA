# **Product Requirements Document (PRD)**

## **Product Name**

**Visora by Visionatrixx**

**Tagline:** *The Visual Context Engine for AI Coding.*

---

# **1\. Vision**

Visora enables developers to edit applications by interacting directly with the live UI instead of manually describing components to AI.

Users simply click a component, describe the desired change, and Visora automatically provides the AI with complete visual and code context.

---

# **2\. Problem Statement**

Current AI coding tools understand code but lack visual awareness.

Developers must manually explain:

* Which component  
* Which file  
* Which section  
* Which styles  
* What needs to change

This leads to:

* Wrong edits  
* Multiple prompt iterations  
* AI hallucinations  
* Lost productivity

---

# **3\. Solution**

Visora overlays every component on a running React/Next.js application.

When a developer selects a component:

* Detect the component  
* Find its source code  
* Capture relevant context  
* Open an inline AI chat  
* Send structured context to Cursor, VS Code, Google Antigravity, or any MCP-compatible AI  
* Apply AI-generated edits

---

# **4\. Target Users**

* React Developers  
* Next.js Developers  
* Cursor Users  
* VS Code Users  
* Google Antigravity Users  
* AI-first Developers

---

# **5\. MVP Scope (V1)**

Supported Frameworks

* React  
* Next.js

Supported IDEs

* Cursor  
* VS Code  
* Google Antigravity

---

# **6\. Core Features**

### **Feature 1**

Visual Component Selection

Developer hovers over UI.

Component highlights.

Click to select.

---

### **Feature 2**

Component Detection

Automatically detect:

* Component name  
* Source file  
* Props  
* Parent component  
* Children

---

### **Feature 3**

Inline Chat

Small floating AI prompt beside selected component.

Example

Make this button rounded and add glassmorphism.

---

### **Feature 4**

Context Builder

Automatically collect

* Component source  
* File path  
* Imports  
* CSS  
* Tailwind classes  
* Props  
* Screenshot  
* DOM hierarchy

---

### **Feature 5**

AI Integration

Send context to

* Cursor  
* Google Antigravity  
* VS Code

through MCP.

---

### **Feature 6**

Patch Preview

Show

Old Code

↓

New Code

Developer approves.

---

### **Feature 7**

Apply Changes

Automatically modify source code.

Hot Reload updates browser.

---

# **7\. User Flow**

Run npm run dev

↓

Open localhost

↓

Visora Overlay Loads

↓

Hover Component

↓

Click Component

↓

AI Chat Opens

↓

Describe Change

↓

Visora Collects Context

↓

Send to AI

↓

AI Returns Patch

↓

Preview

↓

Accept

↓

Auto Save

↓

Hot Reload  
---

# **8\. Success Metrics**

Reduce prompt iterations

Target

5 prompts

↓

1 prompt

---

Reduce incorrect edits

Target

80% reduction

---

Selection latency

\<150ms

---

Patch generation

\<5 sec

---

# **9\. Future Roadmap**

V2

* Vue  
* Nuxt  
* Screenshots  
* Multi Selection

V3

* Svelte  
* Angular  
* Annotation  
* AI Suggestions

V4

* Figma Sync  
* Responsive Editing

---

---

# **Technical Requirements Document (TRD)**

# **Project**

Visora by Visionatrixx

---

# **Architecture**

Browser

↓

Visora Overlay

↓

Component Inspector

↓

Context Builder

↓

MCP Server

↓

AI Model

↓

Patch Generator

↓

IDE

↓

Filesystem

↓

Hot Reload  
---

# **Stack**

Frontend

* React  
* TypeScript  
* Tailwind

Browser

* Chrome Extension  
* Content Script

Backend

* Node.js  
* TypeScript

Communication

* MCP

IDE

* VS Code Extension

---

# **Supported Framework**

V1

* React  
* Next.js

---

# **Core Modules**

## **1**

Overlay Engine

Responsibilities

* Highlight components  
* Click detection  
* Floating toolbar

---

## **2**

Component Inspector

Extract

* React Fiber  
* Component name  
* Props  
* DOM Node

---

## **3**

Source Mapper

Map DOM

↓

React Fiber

↓

Source File

↓

Line Number

---

## **4**

AST Parser

Libraries

* Babel  
* TypeScript Compiler API

Extract

* JSX  
* Imports  
* Functions  
* Props

---

## **5**

Context Builder

Generate JSON

Example

{  
 "component":"Header",  
 "file":"src/components/Header.tsx",  
 "framework":"React",  
 "tailwind":\[  
   "bg-white",  
   "shadow"  
 \],  
 "parent":"Layout",  
 "children":\[  
   "Logo",  
   "Navbar"  
 \],  
 "prompt":"Make navbar glassmorphism"  
}  
---

## **6**

Screenshot Service

Capture selected component.

Output

PNG

---

## **7**

MCP Server

Expose tools

inspect\_component

get\_source

get\_context

capture\_component

apply\_patch

save\_file

reload  
---

## **8**

AI Client

Supports

* Cursor  
* Google Antigravity  
* VS Code  
* Local Models

Examples

* Qwen3-Coder  
* GLM  
* GPT-OSS  
* DeepSeek  
* Claude

---

## **9**

Patch Engine

Receive

Diff

↓

Validate

↓

Apply

↓

Save

---

# **Folder Structure**

visora/

apps/  
  extension/  
  mcp-server/  
  desktop/

packages/  
  inspector/  
  context/  
  parser/  
  patcher/  
  ai/  
  screenshot/  
  shared/

docs/  
---

# **Security**

Never execute AI code automatically.

Always

Preview

↓

Approve

↓

Apply

---

# **Performance Goals**

Selection

\<100ms

Context Generation

\<300ms

Screenshot

\<100ms

AI Response

\<5 sec

Patch Apply

\<100ms

---

# **V1 Deliverables**

✅ React Support

✅ Next.js Support

✅ Chrome Extension

✅ Component Highlighting

✅ Source Mapping

✅ Inline Chat

✅ MCP Server

✅ Cursor Integration

✅ VS Code Integration

✅ Google Antigravity Integration

✅ Patch Preview

✅ Auto Apply

---

## **Long-Term Vision**

**Visora** becomes the **visual interaction layer for AI development**—a universal tool that lets developers edit applications by clicking on live UI, while automatically providing AI with precise visual and code context. It works seamlessly across IDEs, frameworks, and language models, eliminating ambiguity and making AI-assisted development faster, more accurate, and more intuitive.