/**
 * =====================================================================
 * FILE: MarkdownRenderer.tsx
 * =====================================================================
 *
 * PERFORMANCE ARCHITECTURE — why each decision exists:
 *
 * 1. STABLE MODULE-LEVEL CONSTANTS
 *    remarkPlugins / rehypePlugins / HTML_PREVIEW_HEIGHT are defined
 *    once at module scope. Previously they were recreated inside render,
 *    causing ReactMarkdown to re-parse the full AST on every streaming
 *    token → 150–300ms scheduler violations.
 *
 * 2. MEMOIZED COMPONENTS MAP
 *    The `components` object passed to ReactMarkdown is wrapped in
 *    useMemo([]). Without this, every streaming token unmounts and
 *    remounts all custom renderers.
 *
 * 3. MEMOIZED TOP-LEVEL COMPONENT
 *    MarkdownRenderer itself is wrapped in React.memo so that unchanged
 *    historical messages don't re-render at all when a new token arrives
 *    for the latest message.
 *
 * 4. STABLE HELPERS AT MODULE SCOPE
 *    isCompleteHTML / preprocessContent are plain functions called via
 *    useMemo inside the component, not inline in render, so their regex
 *    work is cached.
 *
 * 5. HTML CONTAINER HEIGHT LOCK
 *    The card has overflow:hidden + a fixed-height inner pane.
 *    The outer rounded card never grows during streaming — only the
 *    scroll container inside scrolls. This eliminates layout thrash.
 *
 * 6. manualToggle AS REF
 *    Prevents the "switches back to preview automatically" bug.
 *    useRef writes are synchronous so effects always see the latest value.
 *
 * =====================================================================
 */

"use client";

import "katex/dist/katex.min.css";

import { Tooltip } from "@mui/material";
import {
  Check,
  ChevronsUpDown,
  CodeXml,
  Copy,
  Download,
  FileText,
  LoaderCircle,
  Play,
  Quote,
  SquareTerminal,
  Table2,
  Terminal,
} from "lucide-react";
import React, {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import HTMLPreviewDrawer from "./HTMLPreviewDrawer";
import MermaidDiagramViewer from "./MermaidDiagramViewer";

// ─────────────────────────────────────────────────────────────────────────────
// STABLE MODULE-LEVEL CONSTANTS
// Defined once — never recreated on render. Critical for ReactMarkdown perf.
// ─────────────────────────────────────────────────────────────────────────────

/** Height of the HTML source/preview pane in px. Card never grows past this. */
const HTML_PREVIEW_HEIGHT = 600;

/**
 * Plugin arrays defined at module scope so ReactMarkdown receives the same
 * array reference every render and never re-parses the AST unnecessarily.
 * rehypeRaw MUST come before rehypeKatex to properly parse HTML first.
 */
const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS = [rehypeRaw, rehypeKatex];
const REMARK_GFM_ONLY = [remarkGfm];

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface HastNode {
  type: string;
  tagName?: string;
  properties?: { className?: string[]; [key: string]: unknown };
  children?: HastNode[];
  value?: string;
}

interface MarkdownRendererProps {
  content: string;
}

interface CopyButtonProps {
  getValue: () => string;
  label?: string;
  icon?: React.ReactNode;
  variant?: "bar" | "float";
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BOUNDARY
// ─────────────────────────────────────────────────────────────────────────────

class MarkdownErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <pre className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            ⚠ Failed to render this block.
          </pre>
        )
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PURE HELPERS  (module-scope, no closures, safe to call from useMemo)
// ─────────────────────────────────────────────────────────────────────────────

function isCompleteHTML(content: string): boolean {
  // Only lowercase the last 20 chars for the closing tag check — fast path
  const lo = content.slice(0, 15).toLowerCase();
  if (!lo.startsWith("<!doctype html") && !lo.startsWith("<html")) {
    return false;
  }
  return content.slice(-200).toLowerCase().includes("</html>");
}

function preprocessContent(content: string): string {
  // Fast-path: if no <ASCII> tag present, skip regex work entirely
  if (!content.includes("<ASCII>") && !content.includes("<ascii>")) {
    return content;
  }

  const openCount = (content.match(/<ASCII>/gi) ?? []).length;
  const closeCount = (content.match(/<\/ASCII>/gi) ?? []).length;

  let processed = content.replace(
    /<ASCII>\s*\n?([\s\S]*?)\n?\s*<\/ASCII>/gi,
    (_, body: string) => `\`\`\`\n${body.trim()}\n\`\`\``
  );

  if (openCount > closeCount) {
    const idx = processed.lastIndexOf("<ASCII>");
    if (idx !== -1) {
      processed =
        processed.substring(0, idx) +
        "```\n" +
        processed.substring(idx + 7).trim() +
        "\n```";
    }
  }

  return processed;
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children;
  }
  if (typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractText).join("");
  }
  if (React.isValidElement(children)) {
    return extractText(
      (children.props as { children?: React.ReactNode }).children
    );
  }
  return "";
}

function getBlockLabel(value: string): string {
  const lines = value.split("\n");
  if (lines.filter((l) => /^\s*\|.+\|\s*$/.test(l)).length >= 2) {
    return "ASCII Table";
  }
  if (/[┌┐└┘├┤┬┴┼─│╔╗╚╝╠╣╦╩╬═║]/.test(value)) {
    return "ASCII / diagram";
  }
  if (/\+[-=]{2,}\+/.test(value)) {
    return "ASCII / diagram";
  }
  if (/^\s*\|.+\|\s*$/m.test(value)) {
    return "ASCII / diagram";
  }
  if (/[-=]{2,}>/.test(value)) {
    return "ASCII / diagram";
  }
  if (/^[ \t]*(├|└|│)/m.test(value)) {
    return "tree view";
  }
  return "plain text";
}

function extractFilename(value: string): string {
  const cm = value.match(/^<!--\s*(?:filename|file)?:?\s*([\w.-]+\.md)\s*-->/i);
  if (cm?.[1]) {
    return cm[1];
  }
  const hm = value.match(/^#\s+([\w.-]+\.md)\b/m);
  if (hm?.[1]) {
    return hm[1];
  }
  return "document.md";
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COPY BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function CopyButton({
  getValue,
  label = "Copy",
  icon,
  variant = "bar",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(getValue());
    setCopied(true);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [getValue]);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  if (variant === "float") {
    return (
      <button
        onClick={handleCopy}
        aria-label={copied ? "Copied!" : label}
        className={[
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-all duration-150",
          copied
            ? "border-green-300 bg-green-50 text-green-600"
            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50",
        ].join(" ")}
      >
        {copied ? (
          <Check className="size-3" />
        ) : (
          (icon ?? <Copy className="size-3" />)
        )}
        {copied && "Copied!"}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : label}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-green-500" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          {icon ?? <Copy className="size-5 text-gray-900" />}
          {/* {label} */}
        </>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKDOWN FILE CARD
// ─────────────────────────────────────────────────────────────────────────────

function MarkdownFileCard({ value }: { value: string }) {
  const [showSource, setShowSource] = useState(false);
  const filename = useMemo(() => extractFilename(value), [value]);
  const displayContent = useMemo(
    () =>
      value
        .replace(/^<!--\s*(?:filename|file)?:?\s*[\w.-]+\.md\s*-->\n?/i, "")
        .trim(),
    [value]
  );

  const handleDownload = useCallback(() => {
    const blob = new Blob([value], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [value, filename]);

  const getVal = useCallback(() => value, [value]);
  const toggleSource = useCallback(() => setShowSource((s) => !s), []);

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-tertiary-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-tertiary-100 bg-tertiary-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-tertiary-500" />
          <span className="text-sm font-semibold text-tertiary-700">
            {filename}
          </span>
          <span className="rounded-full bg-tertiary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-tertiary-500">
            Markdown
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSource}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100"
          >
            {showSource ? "Show preview" : "Show source"}
          </button>
          <CopyButton getValue={getVal} label="Copy" variant="bar" />
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-md bg-tertiary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-tertiary-700"
          >
            <Download className="size-3.5" />
            Download .md
          </button>
        </div>
      </div>
      <div className="max-h-125 overflow-y-auto">
        {showSource ? (
          <pre className="overflow-x-auto bg-gray-50 p-4">
            <code className="text-sm leading-relaxed text-gray-700">
              {value}
            </code>
          </pre>
        ) : (
          <div className="prose prose-sm max-w-none p-6">
            <ReactMarkdown remarkPlugins={REMARK_GFM_ONLY}>
              {displayContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
        <p className="text-[11px] text-gray-400">
          Click <strong className="text-gray-500">Download .md</strong> to save
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CODE BLOCK
// ─────────────────────────────────────────────────────────────────────────────

const CodeBlock = React.memo(function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const lineCount = useMemo(() => value.split("\n").length, [value]);
  const getVal = useCallback(() => value, [value]);

  const codeStyle = useMemo(
    () => ({
      ...oneLight,
      'code[class*="language-"]': {
        ...oneLight['code[class*="language-"]'],
        color: "#6160b0",
      },
    }),
    []
  );

  const customStyle = useMemo(
    () => ({
      margin: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: "0.75rem",
      borderBottomRightRadius: "0.75rem",
      fontSize: "0.875rem",
      lineHeight: "1.7",
      border: "1px solid",
      borderColor: "rgb(229, 231, 235)",
      borderTop: "none",
    }),
    []
  );

  return (
    <div className="group relative my-4">
      <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-gray-200 bg-gray-100 px-4 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Terminal className="size-3.5" />
          {language}
        </span>
        <CopyButton getValue={getVal} label="Copy code" variant="bar" />
      </div>
      <SyntaxHighlighter
        language={language}
        style={codeStyle}
        customStyle={customStyle}
        PreTag="div"
        showLineNumbers={lineCount > 5}
        wrapLines
        wrapLongLines={false}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PLAIN CODE BLOCK
// ─────────────────────────────────────────────────────────────────────────────

const PlainCodeBlock = React.memo(function PlainCodeBlock({
  value,
}: {
  value: string;
}) {
  const label = useMemo(() => getBlockLabel(value), [value]);
  const getVal = useCallback(() => value, [value]);
  return (
    <div className="group relative my-4 overflow-x-auto rounded-xl border border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </span>
        <CopyButton getValue={getVal} label="Copy" variant="bar" />
      </div>
      <pre className="overflow-x-auto bg-gray-50 p-4">
        <code
          className="text-sm leading-relaxed text-tertiary"
          style={{ whiteSpace: "pre", fontWeight: 700 }}
        >
          {value}
        </code>
      </pre>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// COPYABLE TABLE
// ─────────────────────────────────────────────────────────────────────────────

function CopyableTable({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const getTableText = useCallback((): string => {
    const table = wrapperRef.current?.querySelector("table");
    if (!table) {
      return "";
    }
    return Array.from(table.querySelectorAll("tr"))
      .map((row) =>
        Array.from(row.querySelectorAll("th, td"))
          .map((cell) => (cell as HTMLElement).innerText.trim())
          .join("\t")
      )
      .join("\n");
  }, []);

  return (
    <div className="my-6 w-full">
      <div className="flex items-center justify-between rounded-t-md border border-b-0 border-gray-200 bg-gray-50 px-4 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Table2 className="size-3.5" />
          Table
        </span>
        <CopyButton
          getValue={getTableText}
          label="Copy"
          variant="bar"
          icon={<Copy className="size-3.5" />}
        />
      </div>
      <div
        ref={wrapperRef}
        className="overflow-x-auto rounded-b-md border border-gray-200"
      >
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COPYABLE BLOCKQUOTE
// ─────────────────────────────────────────────────────────────────────────────

function CopyableBlockquote({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const getText = useCallback(() => (ref.current?.innerText ?? "").trim(), []);
  return (
    <div className="group relative my-4">
      <blockquote
        ref={ref}
        className="border-l-4 border-gray-300 bg-gray-50 py-3 pl-4 pr-14 text-[15px] italic leading-[1.7] text-gray-700"
      >
        {children}
      </blockquote>
      <div className="absolute right-3 top-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <CopyButton
          getValue={getText}
          label="Copy"
          variant="float"
          icon={<Quote className="size-3" />}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART LINK
// ─────────────────────────────────────────────────────────────────────────────

function SmartLink({
  href,
  children,
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  const url = href ?? "#";
  const isExternal = /^https?:\/\//.test(url) || /^mailto:/.test(url);
  return (
    <a
      href={url}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="font-medium text-tertiary-600 underline decoration-tertiary-400 underline-offset-4 transition-colors hover:text-tertiary-700 hover:decoration-tertiary-500"
    >
      {children}
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTIMIZED IFRAME  (only re-renders when html string changes)
// ─────────────────────────────────────────────────────────────────────────────

const OptimizedHTMLIframe = React.memo(
  ({ html, title }: { html: string; title: string }) => {
    const polyfill =
      "<script>(function(){try{localStorage.getItem('t')}catch(e){var s={};Object.defineProperty(window,'localStorage',{value:{getItem:function(k){return s[k]||null},setItem:function(k,v){s[k]=String(v)},removeItem:function(k){delete s[k]},clear:function(){for(var k in s)delete s[k]},get length(){return Object.keys(s).length},key:function(i){return Object.keys(s)[i]||null}},configurable:true,writable:false})}})();</script>";

    let h = html;
    if (/<head>/i.test(h)) {
      h = h.replace(/<head>/i, `<head>${polyfill}`);
    } else if (/<html[^>]*>/i.test(h)) {
      h = h.replace(/<html([^>]*)>/i, `<html$1>${polyfill}`);
    } else if (/<!doctype html>/i.test(h)) {
      h = h.replace(/(<!doctype html>)/i, `$1${polyfill}`);
    } else {
      h = polyfill + h;
    }

    return (
      <iframe
        key={html.substring(0, 100)}
        srcDoc={h}
        sandbox="allow-scripts allow-forms allow-modals allow-popups"
        className="h-full w-full border-0"
        title={title}
      />
    );
  },
  (prev, next) => prev.html === next.html
);
OptimizedHTMLIframe.displayName = "OptimizedHTMLIframe";

// ─────────────────────────────────────────────────────────────────────────────
// OPTIMIZED SYNTAX HIGHLIGHTER  (only re-renders when html changes)
// ─────────────────────────────────────────────────────────────────────────────

const OptimizedSyntaxHighlighter = React.memo(
  ({ html, lineCount }: { html: string; lineCount: number }) => {
    const style = useMemo(
      () => ({
        ...oneLight,
        'code[class*="language-"]': {
          ...oneLight['code[class*="language-"]'],
          color: "#6160b0",
        },
      }),
      []
    );

    return (
      <SyntaxHighlighter
        language="html"
        style={style}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.875rem",
          lineHeight: "1.7",
          border: "none",
          minHeight: "100%",
        }}
        PreTag="div"
        showLineNumbers={lineCount > 5}
        wrapLines
        wrapLongLines={false}
      >
        {html}
      </SyntaxHighlighter>
    );
  },
  (prev, next) => prev.html === next.html
);
OptimizedSyntaxHighlighter.displayName = "OptimizedSyntaxHighlighter";

// ─────────────────────────────────────────────────────────────────────────────
// HTML PREVIEW RENDERER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HEIGHT LOCK STRATEGY:
 *   The outer card has `overflow-hidden` + no explicit height so it wraps
 *   its children naturally. Inside, the content pane has:
 *     `height: HTML_PREVIEW_HEIGHT` + `overflow: hidden`
 *   This means the card height = header + HTML_PREVIEW_HEIGHT + footer,
 *   which is CONSTANT during streaming. No layout shift, no scroll jump.
 *
 *   The scrollable <div ref={containerRef}> inside the pane has
 *   `height: 100%` + `overflow-y: auto`, so it scrolls internally.
 */
const HTMLPreviewRenderer = React.memo(
  function HTMLPreviewRenderer({ html }: { html: string }) {
    // Ref-based toggle — synchronous, never stale inside effects, zero renders
    const manualToggleRef = useRef(false);

    const [showSource, setShowSource] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [shouldHighlight, setShouldHighlight] = useState(false);
    const [displayHtml, setDisplayHtml] = useState(html);

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const updateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastUpdateAt = useRef(Date.now());

    const lineCount = useMemo(
      () => displayHtml.split("\n").length,
      [displayHtml]
    );

    // isComplete: check only the tail — avoids scanning the whole string
    const isComplete = useMemo(
      () => html.slice(-200).toLowerCase().includes("</html>"),
      [html]
    );

    // ── Throttle display updates to ≤1 per 150ms during streaming ────────────
    useEffect(() => {
      const now = Date.now();
      const elapsed = now - lastUpdateAt.current;

      if (updateTimer.current) {
        clearTimeout(updateTimer.current);
      }

      if (isComplete || elapsed >= 150) {
        setDisplayHtml(html);
        lastUpdateAt.current = now;
      } else {
        updateTimer.current = setTimeout(() => {
          setDisplayHtml(html);
          lastUpdateAt.current = Date.now();
        }, 150 - elapsed);
      }

      return () => {
        if (updateTimer.current) {
          clearTimeout(updateTimer.current);
        }
      };
    }, [html, isComplete]);

    // ── Debounce syntax highlighting: off during streaming, on after 800ms idle ─
    useEffect(() => {
      if (isComplete) {
        setShouldHighlight(true);
        return;
      }

      setShouldHighlight(false);
      if (highlightTimer.current) {
        clearTimeout(highlightTimer.current);
      }
      highlightTimer.current = setTimeout(() => setShouldHighlight(true), 800);
      return () => {
        if (highlightTimer.current) {
          clearTimeout(highlightTimer.current);
        }
      };
    }, [displayHtml, isComplete]);

    // ── Scroll-to-bottom: direct scrollTop (no smooth — avoids RAF violation) ──
    useEffect(() => {
      if (!showSource || isComplete) {
        return;
      }
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
      scrollTimer.current = setTimeout(() => {
        const el = containerRef.current;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      }, 80);
      return () => {
        if (scrollTimer.current) {
          clearTimeout(scrollTimer.current);
        }
      };
    }, [displayHtml, isComplete, showSource]);

    // ── Auto-switch source→preview when streaming completes ──────────────────
    useEffect(() => {
      if (!isComplete || !showSource || manualToggleRef.current) {
        return;
      }
      const t = setTimeout(() => {
        setIsConverting(true);
        const t2 = setTimeout(() => {
          setShowSource(false);
          setIsConverting(false);
        }, 300);
        return () => clearTimeout(t2);
      }, 500);
      return () => clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isComplete]);

    const handleToggleSource = useCallback(() => {
      manualToggleRef.current = true; // Write ref FIRST — synchronous
      if (showSource && isComplete) {
        setIsConverting(true);
        setTimeout(() => {
          setShowSource(false);
          setIsConverting(false);
        }, 300);
      } else if (!showSource) {
        setShowSource(true);
      }
    }, [showSource, isComplete]);

    const handleDrawerOpen = useCallback(() => setDrawerOpen(true), []);
    const handleDrawerClose = useCallback(() => setDrawerOpen(false), []);
    const getHtml = useCallback(() => html, [html]);

    const handleDownloadHtml = useCallback(() => {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `preview-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, [html]);

    return (
      <>
        {/*
         * HEIGHT LOCK: `overflow-hidden` on the card means nothing inside
         * can push the card taller than its natural height. The card height
         * is: header (≈49px) + content pane (HTML_PREVIEW_HEIGHT) + footer (≈33px)
         * = fixed, no layout shift during streaming.
         */}
        <div
          className={`my-4 overflow-hidden ${
            showSource ? "rounded-xl border bg-[#FAFAFA] shadow-sm" : ""
          } `}
        >
          {/* ── Header ────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              {isComplete ? (
                <CodeXml className="size-4 text-gray-900" />
              ) : (
                <LoaderCircle className="size-4 animate-spin text-gray-900" />
              )}

              <span className="text-sm font-semibold text-gray-900">HTML</span>
            </div>
            <div className="flex items-center gap-2">
              {showSource ? (
                <Tooltip title="Download HTML file" arrow>
                  <button
                    onClick={handleDownloadHtml}
                    className="cursor-pointer text-gray-900"
                  >
                    <Download className="size-5" />
                  </button>
                </Tooltip>
              ) : (
                <CopyButton
                  getValue={getHtml}
                  label="Copy HTML"
                  variant="bar"
                />
              )}
              <div className="flex items-center gap-2 rounded-full bg-gray-200 p-1.5">
                <Tooltip title="Show source" arrow>
                  <button
                    onClick={handleToggleSource}
                    disabled={showSource && !isComplete}
                    className={`flex items-center justify-center rounded-full p-1.5 transition-all duration-300 ${
                      showSource ? "scale-110 bg-white shadow" : "scale-100"
                    }`}
                  >
                    <SquareTerminal
                      className={`size-4 transition-colors duration-300 ${
                        showSource ? "text-gray-900" : "text-gray-600"
                      }`}
                    />
                  </button>
                </Tooltip>
                <Tooltip title="Show preview" arrow>
                  <span>
                    <button
                      onClick={handleToggleSource}
                      disabled={showSource && !isComplete}
                      className={`flex items-center justify-center rounded-full p-1.5 transition-all duration-300 ${
                        !showSource ? "scale-110 bg-white shadow" : "scale-100"
                      }`}
                    >
                      <Play
                        className={`size-4 transition-colors duration-300 ${
                          showSource ? "text-gray-400" : "text-gray-900"
                        }`}
                      />
                    </button>
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* ── Content pane: FIXED height, overflow hidden ───────────────── */}
          <div
            style={{ height: HTML_PREVIEW_HEIGHT }}
            className="relative overflow-hidden"
          >
            {showSource ? (
              /*
               * Scroll container: h-full (= HTML_PREVIEW_HEIGHT) + overflow-y-auto
               * Content inside can be taller than the container; it scrolls.
               * The CARD never grows.
               */
              <div
                ref={containerRef}
                className="h-full overflow-y-auto overflow-x-hidden p-4"
              >
                {shouldHighlight ? (
                  <OptimizedSyntaxHighlighter
                    html={displayHtml}
                    lineCount={lineCount}
                  />
                ) : (
                  <pre
                    className="m-0 min-h-full overflow-x-auto"
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
                  >
                    <code className="text-sm leading-relaxed text-gray-700">
                      {displayHtml}
                    </code>
                  </pre>
                )}
              </div>
            ) : (
              <div className="h-full">
                {isConverting ? (
                  <div className="flex h-full items-center justify-center bg-white/90 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-500" />
                      <p className="text-sm font-medium text-gray-600">
                        Converting to Live Preview...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="group relative h-full overflow-hidden rounded-2xl border">
                    <Tooltip title="Expand to full screen" arrow>
                      <button
                        onClick={handleDrawerOpen}
                        disabled={!isComplete}
                        className="absolute right-3 top-3 hidden cursor-pointer items-center justify-center rounded-full bg-white p-2 shadow-lg transition-all duration-300 hover:scale-110 group-hover:flex"
                      >
                        <ChevronsUpDown className="size-4 rotate-45 text-gray-900" />
                      </button>
                    </Tooltip>
                    <OptimizedHTMLIframe
                      html={displayHtml}
                      title="HTML Preview"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isComplete && (
          <HTMLPreviewDrawer
            open={drawerOpen}
            onClose={handleDrawerClose}
            html={displayHtml}
          />
        )}
      </>
    );
  },
  (prev, next) => prev.html === next.html
);

// ─────────────────────────────────────────────────────────────────────────────
// INNER RENDERER  — separated so useMemo for components is always called
// ─────────────────────────────────────────────────────────────────────────────

const MarkdownRendererInner: React.FC<{
  processedContent: string;
}> = React.memo(function MarkdownRendererInner({ processedContent }) {
  /**
   * Stable components map — only rebuilt when dark mode changes.
   * ReactMarkdown uses referential equality on this object: if it changes,
   * it re-parses the full AST. Memoizing here + stable plugin arrays above
   * means ReactMarkdown only diffs the string diff, not the whole tree.
   */
  const components: Components = useMemo(
    () => ({
      // ── Headings ──────────────────────────────────────────────────────────
      h1: ({ children }) => (
        <h1 className="mb-4 mt-6 scroll-m-20 text-3xl font-bold tracking-tight text-gray-900">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-3 mt-6 scroll-m-20 border-b border-gray-200 pb-2 text-2xl font-semibold tracking-tight text-gray-900">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mb-3 mt-5 scroll-m-20 text-xl font-semibold tracking-tight text-gray-900">
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4 className="mb-2 mt-4 scroll-m-20 text-lg font-semibold tracking-tight text-gray-900">
          {children}
        </h4>
      ),
      h5: ({ children }) => (
        <h5 className="mb-2 mt-3 text-base font-semibold tracking-tight text-gray-900">
          {children}
        </h5>
      ),
      h6: ({ children }) => (
        <h6 className="mb-2 mt-3 text-sm font-semibold tracking-tight text-gray-900">
          {children}
        </h6>
      ),

      // ── Body text ─────────────────────────────────────────────────────────
      p: ({ children }) => (
        <p className="mb-4 text-[15px] leading-[1.7] text-gray-800 not-first:mt-4">
          {children}
        </p>
      ),
      ul: ({ children }) => (
        <ul className="my-4 ml-6 list-disc space-y-2 text-[15px] text-gray-800">
          {children}
        </ul>
      ),
      ol: ({ children, start }) => (
        <ol
          start={start}
          className="my-4 ml-6 list-decimal space-y-2 text-[15px] text-gray-800"
        >
          {children}
        </ol>
      ),
      li: ({ children }) => <li className="leading-[1.7]">{children}</li>,
      strong: ({ children }) => (
        <strong className="font-semibold text-gray-900">{children}</strong>
      ),
      em: ({ children }) => (
        <em className="italic text-gray-700">{children}</em>
      ),
      del: ({ children }) => (
        <del className="text-gray-500 line-through">{children}</del>
      ),
      hr: () => <hr className="my-8 border-t-2 border-gray-200" />,

      // ── Blockquote ────────────────────────────────────────────────────────
      blockquote: ({ children }) => (
        <CopyableBlockquote>{children}</CopyableBlockquote>
      ),

      // ── Inline code ───────────────────────────────────────────────────────
      code: ({ children, ...props }) => (
        <code
          className="font-mono rounded-md bg-gray-100 px-1.5 py-0.5 text-[0.875em] font-medium text-gray-800"
          {...props}
        >
          {children}
        </code>
      ),

      // ── Block code (pre owns ALL fenced/indented blocks) ──────────────────
      pre: ({ node, children }) => {
        let language: string | null = null;
        let rawValue = "";

        try {
          const codeNode = (node as HastNode)?.children?.find(
            (n: HastNode) => n.type === "element" && n.tagName === "code"
          );
          if (codeNode) {
            const classNames: string[] = codeNode.properties?.className ?? [];
            const langClass = classNames.find((c) => c.startsWith("language-"));
            language = langClass ? langClass.replace("language-", "") : null;
            rawValue = (codeNode.children ?? [])
              .filter((n: HastNode) => n.type === "text")
              .map((n: HastNode) => String(n.value ?? ""))
              .join("")
              .replace(/\n$/, "");
          }
        } catch {
          rawValue = extractText(children).replace(/\n$/, "");
        }

        if (!rawValue) {
          return null;
        }

        if (language === "mermaid") {
          return (
            <MarkdownErrorBoundary
              fallback={<PlainCodeBlock value={rawValue} />}
            >
              <MermaidDiagramViewer value={rawValue} />
            </MarkdownErrorBoundary>
          );
        }
        if (language === "markdown" || language === "md") {
          return (
            <MarkdownErrorBoundary>
              <MarkdownFileCard value={rawValue} />
            </MarkdownErrorBoundary>
          );
        }
        if ((language === "html" || !language) && isCompleteHTML(rawValue)) {
          return (
            <MarkdownErrorBoundary>
              <HTMLPreviewRenderer html={rawValue} />
            </MarkdownErrorBoundary>
          );
        }
        if (language) {
          return (
            <MarkdownErrorBoundary>
              <CodeBlock language={language} value={rawValue} />
            </MarkdownErrorBoundary>
          );
        }
        return (
          <MarkdownErrorBoundary>
            <PlainCodeBlock value={rawValue} />
          </MarkdownErrorBoundary>
        );
      },

      // ── Links ─────────────────────────────────────────────────────────────
      a: ({ href, children }) => (
        <SmartLink {...(href ? { href } : {})}>{children}</SmartLink>
      ),

      // ── Tables ────────────────────────────────────────────────────────────
      table: ({ children }) => <CopyableTable>{children}</CopyableTable>,
      thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
      tbody: ({ children }) => (
        <tbody className="divide-y divide-gray-200">{children}</tbody>
      ),
      tr: ({ children }) => (
        <tr className="transition-colors hover:bg-gray-50">{children}</tr>
      ),
      th: ({ children }) => (
        <th className="border-b border-r border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900 last:border-r-0">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border-r border-gray-200 px-4 py-3 text-[14px] font-medium text-tertiary last:border-r-0">
          {children}
        </td>
      ),

      // ── Task list checkboxes ───────────────────────────────────────────────
      input: ({
        checked,
        type,
        ...props
      }: React.InputHTMLAttributes<HTMLInputElement>) =>
        type === "checkbox" ? (
          <input
            type="checkbox"
            checked={checked}
            disabled
            readOnly
            className="mr-2 size-4 rounded border-gray-300 accent-tertiary-500"
            {...props}
          />
        ) : (
          <input type={type} {...props} />
        ),
    }),
    []
  );

  return (
    <MarkdownErrorBoundary>
      <div className="markdown-content font-medium">
        <ReactMarkdown
          remarkPlugins={REMARK_PLUGINS}
          rehypePlugins={REHYPE_PLUGINS}
          components={components}
          skipHtml={false}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </MarkdownErrorBoundary>
  );
});

MarkdownRendererInner.displayName = "MarkdownRendererInner";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wrapped in React.memo so that previously-completed messages never re-render
 * when a new streaming token arrives for the latest message.
 * This alone eliminates most of the per-token scheduler load when there are
 * many messages in the chat history.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(
  function MarkdownRenderer({ content }) {
    // Cache expensive checks — only recompute when content changes
    const htmlComplete = useMemo(
      () => (content ? isCompleteHTML(content) : false),
      [content]
    );
    const processedContent = useMemo(
      () => (content ? preprocessContent(content) : ""),
      [content]
    );

    if (!content || typeof content !== "string") {
      return null;
    }

    if (htmlComplete) {
      return (
        <MarkdownErrorBoundary>
          <HTMLPreviewRenderer html={content} />
        </MarkdownErrorBoundary>
      );
    }

    return <MarkdownRendererInner processedContent={processedContent} />;
  }
);

MarkdownRenderer.displayName = "MarkdownRenderer";

export default MarkdownRenderer;
