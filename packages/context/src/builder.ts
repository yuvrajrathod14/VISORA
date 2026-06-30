import fs from 'node:fs';
import path from 'node:path';
import type { VisoraSelection } from '@visora/shared';
import { analyzeComponentCode } from '@visora/parser';

export interface VisoraRichContext {
  instruction: string;
  component: {
    name: string | null;
    file: string | null;
    line: number | null;
    framework: string;
    props: Record<string, unknown>;
    stateKeys: string[];
    hooks: string[];
  };
  styles: {
    tailwindClasses: string[];
    computed: Record<string, unknown>;
  };
  hierarchy: {
    parent: string | null;
    children: string[];
  };
  dom: {
    outerHTML: string;
    dimensions: any;
  };
  ast: {
    imports: string[];
    propsInterface: string | null;
    sourceCodeStartLine: number | null;
    sourceCodeEndLine: number | null;
  } | null;
}

/**
 * Merges raw browser selection with AST analysis to build a rich context object.
 */
export function buildRichContext(
  selection: VisoraSelection,
  projectRoot: string
): VisoraRichContext {
  let astData = null;

  if (selection.sourceFile && selection.fiber?.componentName) {
    const filePath = path.resolve(projectRoot, selection.sourceFile);
    if (fs.existsSync(filePath)) {
      try {
        const sourceCode = fs.readFileSync(filePath, 'utf-8');
        astData = analyzeComponentCode(sourceCode, selection.fiber.componentName);
      } catch (e) {
        console.error('[@visora/context] Failed to read or parse source file:', e);
      }
    }
  }

  return {
    instruction: selection.instruction,
    component: {
      name: selection.fiber?.componentName || selection.tagName,
      file: selection.sourceFile,
      line: selection.sourceLine,
      framework: selection.framework,
      props: selection.fiber?.props || {},
      stateKeys: selection.fiber?.stateKeys || [],
      hooks: selection.fiber?.hooks || [],
    },
    styles: {
      tailwindClasses: selection.tailwindClasses || [],
      computed: selection.computedStyles || {},
    },
    hierarchy: {
      parent: selection.ancestorComponents[0] || null,
      children: selection.childComponents || [],
    },
    dom: {
      outerHTML: selection.outerHTML,
      dimensions: selection.boundingRect,
    },
    ast: astData ? {
      imports: astData.imports,
      propsInterface: astData.propsInterface,
      sourceCodeStartLine: astData.startLine,
      sourceCodeEndLine: astData.endLine
    } : null,
  };
}
