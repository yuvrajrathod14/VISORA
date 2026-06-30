/**
 * Visora Shared Types
 * Core interfaces used across all Visora packages.
 */

/** Computed CSS styles extracted from a component */
export interface VisoraComputedStyles {
  display: string;
  position: string;
  width: string;
  height: string;
  padding: string;
  margin: string;
  fontFamily: string;
  fontSize: string;
  backgroundColor: string;
  color: string;
  flexDirection: string;
  gap: string;
  borderRadius: string;
  boxShadow: string;
  opacity: string;
  [key: string]: string;
}

/** Bounding rectangle of a component */
export interface VisoraBoundingRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** React Fiber extracted data */
export interface VisoraFiberData {
  componentName: string | null;
  props: Record<string, unknown>;
  stateKeys: string[];
  hooks: string[];
}

/** The full context payload sent from the browser overlay */
export interface VisoraSelection {
  /** User's natural language instruction */
  instruction: string;

  /** Relative path to source file */
  sourceFile: string;

  /** Line number in source file */
  sourceLine: number | null;

  /** HTML tag name (lowercase) */
  tagName: string;

  /** CSS class names */
  className: string;

  /** Element id */
  id: string | null;

  /** Truncated outerHTML of the element */
  outerHTML: string;

  /** Key computed CSS properties */
  computedStyles: Partial<VisoraComputedStyles>;

  /** Bounding rectangle */
  boundingRect: VisoraBoundingRect | null;

  /** Ancestor components with data-visora-src attributes */
  ancestorComponents: string[];

  /** Child components with data-visora-src attributes */
  childComponents: string[];

  /** React Fiber data */
  fiber: VisoraFiberData | null;

  /** Tailwind classes if present */
  tailwindClasses: string[];

  /** The page URL */
  url: string;

  /** Framework detected */
  framework: 'react' | 'nextjs' | 'unknown';

  /** Timestamp */
  capturedAt: string;
}

/** The context.json file format */
export interface VisoraContextFile {
  selection: VisoraSelection | null;
  updatedAt: string;
}

/** Patch format for applying changes */
export interface VisoraPatch {
  filePath: string;
  original: string;
  modified: string;
  description: string;
}

/** Plugin options */
export interface VisoraPluginOptions {
  /** Override project root detection */
  root?: string;
  /** Custom context directory name (default: '.visora') */
  contextDir?: string;
  /** Disable overlay injection */
  disableOverlay?: boolean;
}
