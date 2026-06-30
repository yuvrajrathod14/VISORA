import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
// @babel/traverse provides a default export but in CJS/ESM it can be tricky.
const traverse = typeof _traverse === 'function' ? _traverse : (_traverse as any).default;

export interface ParsedComponentData {
  imports: string[];
  propsInterface: string | null;
  stateVars: string[];
  startLine: number | null;
  endLine: number | null;
}

/**
 * Analyzes the source code of a file and extracts details about the specified component.
 */
export function analyzeComponentCode(sourceCode: string, componentName: string): ParsedComponentData {
  const result: ParsedComponentData = {
    imports: [],
    propsInterface: null,
    stateVars: [],
    startLine: null,
    endLine: null,
  };

  try {
    const ast = parser.parse(sourceCode, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    traverse(ast, {
      ImportDeclaration(path: any) {
        // Just extract the raw import line (simplification)
        const node = path.node;
        const start = node.start;
        const end = node.end;
        if (typeof start === 'number' && typeof end === 'number') {
          result.imports.push(sourceCode.slice(start, end));
        }
      },
      FunctionDeclaration(path: any) {
        if (path.node.id && path.node.id.name === componentName) {
          result.startLine = path.node.loc?.start.line || null;
          result.endLine = path.node.loc?.end.line || null;
          
          // Extract props type if available
          if (path.node.params.length > 0) {
            const firstParam = path.node.params[0];
            if (firstParam.typeAnnotation) {
              const start = firstParam.typeAnnotation.start;
              const end = firstParam.typeAnnotation.end;
              if (typeof start === 'number' && typeof end === 'number') {
                result.propsInterface = sourceCode.slice(start, end).replace(/^:\s*/, '');
              }
            }
          }
        }
      },
      VariableDeclarator(path: any) {
        // Check for arrow function component: const Component = () => {}
        if (path.node.id.type === 'Identifier' && path.node.id.name === componentName) {
          if (path.node.init && (path.node.init.type === 'ArrowFunctionExpression' || path.node.init.type === 'FunctionExpression')) {
             result.startLine = path.node.loc?.start.line || null;
             result.endLine = path.node.loc?.end.line || null;
          }
        }
        
        // Extract state variables: const [isOpen, setIsOpen] = useState(false);
        if (path.node.id.type === 'ArrayPattern' && path.node.init && path.node.init.type === 'CallExpression') {
          if (path.node.init.callee.type === 'Identifier' && path.node.init.callee.name === 'useState') {
            const varName = (path.node.id.elements[0] as any)?.name;
            if (varName) result.stateVars.push(varName);
          }
        }
      }
    });
  } catch (error) {
    console.error('[@visora/parser] Failed to parse AST:', error);
  }

  return result;
}
