import type { ReactNode } from 'react';
import { headingToAnchorId } from '../types/blog.ts';

interface MarkdownRendererProps {
  markdown: string;
  onNavigate: (path: string) => void;
}

function renderInline(text: string, onNavigate: (path: string) => void): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined && match[3] !== undefined) {
      const label = match[2];
      const href = match[3].trim();
      const isInternal = href.startsWith('/');
      const isSafeExternal = /^https?:\/\//i.test(href) || /^mailto:/i.test(href);

      if (isInternal) {
        nodes.push(
          <a
            key={`lnk-${keyCounter++}`}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(href);
            }}
            className="font-medium text-[#6366F1] dark:text-[#A78BFA] underline underline-offset-4 decoration-[#6366F1]/40 hover:decoration-[#6366F1] transition-colors"
          >
            {label}
          </a>
        );
      } else if (isSafeExternal) {
        nodes.push(
          <a
            key={`ext-${keyCounter++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#6366F1] dark:text-[#A78BFA] underline underline-offset-4 decoration-[#6366F1]/40 hover:decoration-[#6366F1] transition-colors"
          >
            {label}
          </a>
        );
      } else {
        nodes.push(label);
      }
    } else if (match[4] !== undefined) {
      nodes.push(
        <strong key={`bld-${keyCounter++}`} className="font-semibold text-[#172033] dark:text-white">
          {match[4]}
        </strong>
      );
    } else if (match[5] !== undefined) {
      nodes.push(
        <code
          key={`cod-${keyCounter++}`}
          className="font-mono text-[0.875em] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#172033] dark:text-slate-100 break-all"
        >
          {match[5]}
        </code>
      );
    } else if (match[6] !== undefined) {
      nodes.push(
        <em key={`itl-${keyCounter++}`} className="italic">
          {match[6]}
        </em>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function MarkdownRenderer({ markdown, onNavigate }: MarkdownRendererProps) {
  const lines = markdown.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.slice(3).trim();
      const id = headingToAnchorId(headingText);
      blocks.push(
        <h2
          key={`h2-${blockKey++}`}
          id={id}
          className="scroll-mt-24 font-display text-2xl sm:text-[1.625rem] font-bold tracking-tight text-[#172033] dark:text-white pt-6 pb-1"
        >
          {headingText}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.slice(4).trim();
      const id = headingToAnchorId(headingText);
      blocks.push(
        <h3
          key={`h3-${blockKey++}`}
          id={id}
          className="scroll-mt-24 font-display text-lg sm:text-xl font-semibold tracking-tight text-[#172033] dark:text-white pt-4"
        >
          {headingText}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2).trim());
        i++;
      }
      blocks.push(
        <aside
          key={`qt-${blockKey++}`}
          className="my-5 rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/70 p-4 sm:p-5 text-sm sm:text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed"
        >
          {renderInline(quoteLines.join(' '), onNavigate)}
        </aside>
      );
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul
          key={`ul-${blockKey++}`}
          className="space-y-2.5 pl-5 list-disc marker:text-[#6366F1] text-[15px] sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, onNavigate)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol
          key={`ol-${blockKey++}`}
          className="space-y-2.5 pl-5 list-decimal marker:font-semibold marker:text-[#6366F1] text-[15px] sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, onNavigate)}</li>
          ))}
        </ol>
      );
      continue;
    }

    const paraLines: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('## ') &&
      !lines[i].trim().startsWith('### ') &&
      !lines[i].trim().startsWith('> ') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    blocks.push(
      <p
        key={`p-${blockKey++}`}
        className="text-[15px] sm:text-base text-slate-700 dark:text-slate-300 leading-[1.72]"
      >
        {renderInline(paraLines.join(' '), onNavigate)}
      </p>
    );
  }

  return <div className="space-y-4">{blocks}</div>;
}
