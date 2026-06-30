# **Product Requirements Document (PRD)**

## **Product Name**

**Visora V2**  
 **AI Visual Website Editor**

---

# **Version**

V2.0

---

# **Vision**

Enable users to edit websites by simply describing changes in natural language while the AI understands the entire application through screenshots, source code, and component relationships before making safe, previewable modifications.

---

# **Problem Statement**

Current AI website editors:

* modify incorrect components  
* lack visual understanding  
* struggle with Vue/Nuxt projects  
* cannot edit multiple components together  
* apply changes immediately without confirmation  
* provide little context for users

Visora V2 solves this by combining:

* Visual understanding  
* Code understanding  
* Component graph analysis  
* Safe preview  
* Human approval

---

# **Target Users**

* Freelancers  
* UI Designers  
* Vue Developers  
* Nuxt Developers  
* Agencies  
* SaaS Founders  
* Marketing Teams

---

# **Supported Frameworks**

## **Initial**

* Vue 3  
* Nuxt 3

Future

* React  
* Next.js  
* Angular  
* Svelte  
* Astro

---

# **Core Features**

## **1\. Vue Project Import**

Import

* Local Folder  
* Git Repository  
* ZIP Upload

AI automatically detects

* Vue version  
* Nuxt version  
* Tailwind  
* Vuetify  
* Pinia  
* Vue Router

---

## **2\. Component Tree**

Display

App.vue

├── Navbar.vue

├── Hero.vue

├── Features.vue

├── Pricing.vue

├── Footer.vue

Selecting one highlights it in preview.

---

## **3\. Visual Website Preview**

Live rendering.

Supports

Desktop

Tablet

Mobile

---

## **4\. Screenshot Context**

User uploads screenshot.

Example

"Make this section look like Apple."

AI compares

Screenshot

Current page

Components

Creates edit plan.

---

## **5\. Visual Selection**

Click

Hero

Card

Button

Navbar

Footer

Image

Section

AI identifies source component.

---

## **6\. Multi Component Selection**

Hold Shift

Select

Navbar

Hero

CTA

Footer

Prompt

Give all of these a glassmorphism style.  
---

## **7\. Natural Language Editing**

Examples

Increase spacing.

Change typography.

Add animation.

Move CTA higher.

Use premium colors.

Convert cards into carousel.  
---

## **8\. AI Planning**

Before changing code AI creates plan.

Example

Affected Files

Hero.vue

Button.vue

theme.css

Tailwind Config  
---

## **9\. Highlight Affected Code**

Display

Hero.vue

Lines 44-70

Button.vue

Lines 20-32

User approves.

---

## **10\. Preview Changes**

Before

After

Diff

Side-by-side.

---

## **11\. Apply Changes**

Single click.

---

## **12\. Undo**

Unlimited history.

---

## **13\. AI Explanation**

Explain

What changed

Why

Performance impact

Accessibility impact

---

## **14\. Export**

Download

ZIP

Git Commit

GitHub Push

---

# **User Flow**

Open Project

↓

Analyze Vue

↓

Build Component Graph

↓

Render Website

↓

Select Components

↓

Write Prompt

↓

AI Planning

↓

Highlight Code

↓

Preview

↓

Approve

↓

Apply

↓

Export  
---

# **Functional Requirements**

### **FR-1**

Open Vue project

---

### **FR-2**

Open Nuxt project

---

### **FR-3**

Detect all components

---

### **FR-4**

Render website

---

### **FR-5**

Screenshot upload

---

### **FR-6**

Component selection

---

### **FR-7**

Multiple component selection

---

### **FR-8**

Natural language editing

---

### **FR-9**

Highlight files

---

### **FR-10**

Preview changes

---

### **FR-11**

Apply changes

---

### **FR-12**

Undo

---

# **Technical Requirements Document (TRD)**

---

# **Architecture**

Frontend (Nuxt)

↓

Editor

↓

Visual Canvas

↓

Selection Engine

↓

AI Planner

↓

LLM

↓

Patch Generator

↓

Preview Engine

↓

Git Manager  
---

# **Frontend**

Framework

Nuxt 3

Language

TypeScript

UI

Vue

Tailwind CSS

Shadcn Vue

Floating UI

---

# **State Management**

Pinia

---

# **Rendering**

Vite

Hot Module Reload

Virtual DOM

---

# **Visual Canvas**

Libraries

Vue Devtools API

DOM Inspector

Monaco Overlay

Resize Observer

---

# **Component Detection**

AST Parser

@vue/compiler-sfc

Babel

TypeScript AST

Collect

Props

Slots

Events

Imports

Styles

---

# **AI Planner**

Responsibilities

Understand prompt

Locate components

Generate edit plan

Rank confidence

Return affected files

---

# **LLM**

Supports

GPT OSS 120B

Gemini

Claude

Qwen

GLM

DeepSeek

---

# **Context Builder**

Collect

Component Tree

Current File

Imports

CSS

Screenshot

DOM

Selected Components

User Prompt

---

# **Screenshot Understanding**

Models

Gemini Vision

GPT Vision

Input

PNG

JPEG

Output

Button color

Spacing

Layout

Typography

Visual hierarchy  
---

# **Multi Selection Engine**

Supports

CTRL

SHIFT

Drag Selection

Stores

Selected IDs

Component Paths

DOM References

Bounding Boxes  
---

# **Highlight Engine**

Before applying

Highlight

Files

Functions

CSS Classes

Lines

Imports

---

# **Patch Generator**

Returns

Unified Diff

Code Blocks

Explanation  
---

# **Preview Engine**

Temporary branch

Hot reload

No file overwrite

---

# **Git Manager**

Supports

Commit

Branch

Rollback

Diff

---

# **File System**

Watch

src/

components/

layouts/

pages/

assets/

public/  
---

# **Performance Targets**

Project Analysis: **\< 5 seconds** (small to medium Vue/Nuxt projects)

AI Plan Generation: **\< 10 seconds**

Preview Refresh: **\< 2 seconds**

Hot Reload: **\< 500 ms**

Component Selection Response: **\< 100 ms**

---

# **Security**

* Read-only analysis before approval  
* Explicit user confirmation before writing files  
* Local execution option for privacy  
* Git-based rollback for every applied change  
* 

