import React, { useEffect, useRef } from 'react';

// Extend Window interface for KaTeX
declare global {
  interface Window {
    katex?: {
      render: (tex: string, element: HTMLElement, options?: any) => void;
    };
  }
}

interface MathRendererProps {
  children: string;
  className?: string;
  block?: boolean;
}

const MathRenderer: React.FC<MathRendererProps> = ({ children, className = '', block = false }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Regex to find $...$ (inline) or $$...$$ (block)
    // Matches $...$ but avoids matching empty $$ or escaped \$
    const parts = children.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

    parts.forEach((part) => {
      if (!part) return;

      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const tex = part.slice(2, -2);
        const span = document.createElement('span');
        span.className = 'block my-4 text-center';
        try {
          if (window.katex) {
            window.katex.render(tex, span, { displayMode: true, throwOnError: false });
          } else {
            span.textContent = part;
          }
        } catch (e) {
          span.textContent = part;
        }
        containerRef.current?.appendChild(span);
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        const tex = part.slice(1, -1);
        const span = document.createElement('span');
        span.className = 'inline-block px-1';
        try {
          if (window.katex) {
            window.katex.render(tex, span, { displayMode: false, throwOnError: false });
          } else {
            span.textContent = part;
          }
        } catch (e) {
          span.textContent = part;
        }
        containerRef.current?.appendChild(span);
      } else {
        // Normal text
        const textNode = document.createTextNode(part);
        containerRef.current?.appendChild(textNode);
      }
    });
  }, [children]);

  return (
    <span 
      ref={containerRef} 
      className={`${className} ${block ? 'block text-center' : 'inline'}`}
      style={{ wordBreak: 'break-word' }}
    />
  );
};

export default MathRenderer;