import { Fragment, type ReactNode } from "react";

/**
 * Minimal, safe Markdown renderer.
 * Renders headings, lists, code, bold/italic and inline code as React nodes.
 * Raw HTML in the source is never interpreted — it is escaped as plain text.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;
    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] break-words"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let listOrdered = false;
  let codeLines: string[] | null = null;
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    const items = listItems.map((item, index) => (
      <li key={index} className="leading-relaxed">
        {renderInline(item, `li-${key}-${index}`)}
      </li>
    ));
    blocks.push(
      listOrdered ? (
        <ol key={`b${key++}`} className="ml-5 list-decimal space-y-1.5">
          {items}
        </ol>
      ) : (
        <ul key={`b${key++}`} className="ml-5 list-disc space-y-1.5">
          {items}
        </ul>
      ),
    );
    listItems = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (codeLines === null) {
        flushList();
        codeLines = [];
      } else {
        blocks.push(
          <pre
            key={`b${key++}`}
            className="overflow-x-auto rounded-xl border border-border bg-muted p-3 font-mono text-xs"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>,
        );
        codeLines = null;
      }
      continue;
    }
    if (codeLines !== null) {
      codeLines.push(line);
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);

    if (heading) {
      flushList();
      const level = heading[1]!.length;
      const cls =
        level === 1 ? "text-lg font-semibold" : level === 2 ? "text-base font-semibold" : "text-sm font-semibold";
      blocks.push(
        <p key={`b${key++}`} className={cls}>
          {renderInline(heading[2]!, `h${key}`)}
        </p>,
      );
    } else if (bullet) {
      if (listOrdered) flushList();
      listOrdered = false;
      listItems.push(bullet[1]!);
    } else if (ordered) {
      if (!listOrdered) flushList();
      listOrdered = true;
      listItems.push(ordered[1]!);
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p key={`b${key++}`} className="leading-relaxed break-words">
          {renderInline(line, `p${key}`)}
        </p>,
      );
    }
  }
  flushList();
  if (codeLines !== null && codeLines.length > 0) {
    blocks.push(
      <pre
        key={`b${key++}`}
        className="overflow-x-auto rounded-xl border border-border bg-muted p-3 font-mono text-xs"
      >
        <code>{codeLines.join("\n")}</code>
      </pre>,
    );
  }

  return <div className="space-y-3 text-sm">{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>;
}
