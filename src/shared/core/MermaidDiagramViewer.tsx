/**
 * =====================================================================
 * ! FILE HEADER DOCUMENTATION
 * =====================================================================
 *
 * - FILE NAME: MermaidDiagramViewer.tsx
 * - TYPE: Component
 * - PURPOSE:
 *   Interactive Mermaid diagram renderer with full-screen drawer view
 *   - Sanitizes Mermaid syntax to prevent parsing errors
 *   - Provides diagram preview card with expandable drawer
 *   - Supports zoom, pan, copy, and responsive viewing
 *   - Auto-detects diagram type (flowchart, sequence, gantt, etc.)
 *
 * - FIXES APPLIED:
 *   1. manualToggleRef never reset → now resets on value change
 *   2. Preview effect had wrong deps → depends only on [value]
 *   3. mermaid.initialize() called multiple times → guarded with module-level ref
 *   4. previewContainerRef null on async resolve → always mounted, toggled via CSS
 *   5. Drawer re-renders re-triggered render → guarded with renderedForValue ref
 *   6. Multiple diagrams on page conflicting → unique IDs scoped per instance
 *   7. Race conditions on fast value changes → cancellation tokens per effect
 *
 * ? SERVER OR CLIENT:
 *   "use client" — Client-side only (uses browser APIs, dynamic imports)
 *
 * =====================================================================
 */

"use client";

// =====================================================================
// * IMPORTS
// =====================================================================
import { Drawer, Tooltip } from "@mui/material";
import {
  ChevronsUpDown,
  Code2,
  Copy,
  Download,
  Maximize2,
  Play,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// =====================================================================
// * MODULE-LEVEL MERMAID SINGLETON GUARD
// =====================================================================
// Prevents mermaid.initialize() from being called multiple times across
// all instances on the page. Initialize once, reuse everywhere.
let mermaidInitialized = false;
let mermaidInstance: (typeof import("mermaid"))["default"] | null = null;

async function getMermaid(): Promise<(typeof import("mermaid"))["default"]> {
  if (mermaidInstance) {
    return mermaidInstance;
  }

  const mermaid = (await import("mermaid")).default;

  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      suppressErrorRendering: true,
      theme:
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark")
          ? "dark"
          : "default",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
      },
      securityLevel: "loose",
    });
    mermaidInitialized = true;
  }

  mermaidInstance = mermaid;
  return mermaid;
}

// =====================================================================
// * TYPES
// =====================================================================
interface MermaidDiagramViewerProps {
  value: string;
}

// =====================================================================
// * PURE HELPER FUNCTIONS (defined outside component — stable refs)
// =====================================================================

function isAlreadyQuoted(label: string): boolean {
  const trimmed = label.trim();
  return /^["'].*["']$/.test(trimmed);
}

function hasSpecialCharsOrMultiline(label: string): boolean {
  return /[()&+:/<>%]/.test(label) || /\\n/.test(label);
}

function sanitizeLabel(label: string): string {
  return `"${label.replace(/"/g, '\\"')}"`;
}

function sanitizeMermaidSyntax(mermaidCode: string): string {
  try {
    return mermaidCode
      .split("\n")
      .map((line) => {
        const arrowMatch = line.match(
          /^(\s*)([A-Za-z]\d*)\s*(-->|---)\s*([A-Za-z]\d*)\[([^\]]+)\](.*)$/
        );
        if (arrowMatch) {
          const [, indent, fromNode, arrow, toNode, label, rest] = arrowMatch;
          if (
            label &&
            !isAlreadyQuoted(label) &&
            hasSpecialCharsOrMultiline(label)
          ) {
            return `${indent}${fromNode} ${arrow} ${toNode}[${sanitizeLabel(label)}]${rest}`;
          }
          return line;
        }

        const nodeMatch = line.match(/^(\s*)([A-Za-z]\d*)\[([^\]]+)\](.*)$/);
        if (nodeMatch) {
          const [, indent, nodeId, label, rest] = nodeMatch;
          if (
            label &&
            !isAlreadyQuoted(label) &&
            hasSpecialCharsOrMultiline(label)
          ) {
            return `${indent}${nodeId}[${sanitizeLabel(label)}]${rest}`;
          }
        }

        return line;
      })
      .join("\n");
  } catch {
    return mermaidCode;
  }
}

function getDiagramType(content: string): string {
  const t = content.trim().toLowerCase();
  if (t.startsWith("graph")) {
    return "Graph Diagram";
  }
  if (t.startsWith("flowchart")) {
    return "Flowchart";
  }
  if (t.startsWith("sequencediagram")) {
    return "Sequence Diagram";
  }
  if (t.startsWith("classdiagram")) {
    return "Class Diagram";
  }
  if (t.startsWith("statediagram")) {
    return "State Diagram";
  }
  if (t.startsWith("erdiagram")) {
    return "ER Diagram";
  }
  if (t.startsWith("journey")) {
    return "User Journey";
  }
  if (t.startsWith("gantt")) {
    return "Gantt Chart";
  }
  if (t.startsWith("pie")) {
    return "Pie Chart";
  }
  if (t.startsWith("gitgraph")) {
    return "Git Graph";
  }
  if (t.startsWith("mindmap")) {
    return "Mind Map";
  }
  if (t.startsWith("timeline")) {
    return "Timeline";
  }
  return "Mermaid Diagram";
}

function applySvgStyles(svgEl: SVGElement, maxHeight?: string) {
  svgEl.removeAttribute("width");
  svgEl.removeAttribute("height");
  svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svgEl.style.display = "block";
  svgEl.style.width = "100%";
  svgEl.style.height = "auto";
  svgEl.style.maxWidth = "100%";
  svgEl.style.minWidth = "300px";
  svgEl.style.fontSize = "14px";
  svgEl.style.margin = "0 auto";
  if (maxHeight) {
    svgEl.style.maxHeight = maxHeight;
  }
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

async function downloadSvgAsPng(
  svgElement: SVGElement,
  fileName: string
): Promise<void> {
  // Clone the SVG to avoid modifying the original
  const svgClone = svgElement.cloneNode(true) as SVGElement;

  // Get the dimensions of the SVG
  let width: number;
  let height: number;

  try {
    const bbox = (svgElement as SVGSVGElement).getBBox();
    width = bbox.width || svgElement.clientWidth || 800;
    height = bbox.height || svgElement.clientHeight || 600;
  } catch {
    // Fallback if getBBox fails
    width = svgElement.clientWidth || 800;
    height = svgElement.clientHeight || 600;
  }

  // Set explicit dimensions on the clone
  svgClone.setAttribute("width", width.toString());
  svgClone.setAttribute("height", height.toString());

  // Serialize the SVG to string and convert to data URL
  const svgString = new XMLSerializer().serializeToString(svgClone);
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

  // Create an image element to load the SVG
  const img = new Image();
  img.width = width;
  img.height = height;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load SVG image"));
    img.src = svgDataUrl;
  });

  // Create a canvas and draw the image
  const canvas = document.createElement("canvas");
  canvas.width = width * 2; // 2x for better quality
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Scale for better quality
  ctx.scale(2, 2);

  // Fill white background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  // Draw the image
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to PNG and download
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not generate PNG"));
        return;
      }

      const pngUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName;
      link.href = pngUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Small delay before cleanup to ensure download starts
      setTimeout(() => {
        URL.revokeObjectURL(pngUrl);
      }, 100);

      resolve();
    }, "image/png");
  });
}

// =====================================================================
// * MAIN COMPONENT
// =====================================================================
export default function MermaidDiagramViewer({
  value,
}: MermaidDiagramViewerProps) {
  // ── UI state ──────────────────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSource, setShowSource] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // ── Preview render state ──────────────────────────────────────────
  const [previewRendered, setPreviewRendered] = useState(false);
  const [isPreviewRendering, setIsPreviewRendering] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // ── Drawer render state ───────────────────────────────────────────
  const [drawerRendered, setDrawerRendered] = useState(false);
  const [isDrawerRendering, setIsDrawerRendering] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  // ── Refs ──────────────────────────────────────────────────────────
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const drawerContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justOpenedRef = useRef(false);
  // Tracks whether the user has manually toggled the source/preview toggle
  // Reset whenever `value` changes so auto-switch works for each new diagram
  const manualToggleRef = useRef(false);
  // Track which `value` each container has already rendered to prevent re-renders
  const previewRenderedForValue = useRef<string | null>(null);
  const drawerRenderedForValue = useRef<string | null>(null);

  // ── Stable IDs (one per component instance, never change) ────────
  // Using useMemo with empty deps ensures a single stable ID for the lifetime
  // of the component instance. This is critical for Mermaid's internal cache.
  const previewId = useMemo(
    () => `mermaid-prev-${Math.random().toString(36).slice(2)}`,

    []
  );
  const drawerId = useMemo(
    () => `mermaid-draw-${Math.random().toString(36).slice(2)}`,

    []
  );

  const diagramType = useMemo(() => getDiagramType(value), [value]);

  // =====================================================================
  // * RESET STATE WHEN `value` CHANGES (new diagram injected)
  // =====================================================================
  useEffect(() => {
    // Reset all render tracking so the new diagram gets rendered fresh
    manualToggleRef.current = false;
    previewRenderedForValue.current = null;
    drawerRenderedForValue.current = null;

    setPreviewRendered(false);
    setPreviewError(null);
    setIsPreviewRendering(false);

    setDrawerRendered(false);
    setDrawerError(null);
    setIsDrawerRendering(false);

    setShowSource(true);
  }, [value]);

  // =====================================================================
  // * RENDER PREVIEW (background, always-mounted container)
  // =====================================================================
  useEffect(() => {
    // Guard: only render once per unique value string
    if (previewRenderedForValue.current === value) {
      return;
    }
    // Guard: don't start a second render if one is already in flight
    if (isPreviewRendering) {
      return;
    }

    let cancelled = false;
    previewRenderedForValue.current = value; // claim this value immediately

    setIsPreviewRendering(true);
    setPreviewRendered(false);
    setPreviewError(null);

    async function run() {
      try {
        const mermaid = await getMermaid();
        const sanitized = sanitizeMermaidSyntax(value.trim());
        const { svg } = await mermaid.render(previewId, sanitized);

        if (cancelled) {
          return;
        }
        if (!previewContainerRef.current) {
          return;
        }

        previewContainerRef.current.innerHTML = svg;
        const svgEl = previewContainerRef.current.querySelector("svg");
        if (svgEl) {
          applySvgStyles(svgEl as SVGElement, "480px");
        }

        setPreviewRendered(true);
      } catch (err) {
        if (cancelled) {
          return;
        }
        previewRenderedForValue.current = null; // allow retry
        setPreviewError(err instanceof Error ? err.message : "Render failed");
      } finally {
        if (!cancelled) {
          setIsPreviewRendering(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // ← ONLY `value`. previewId is stable; state booleans are guarded by ref

  // =====================================================================
  // * AUTO-SWITCH source → preview when preview render finishes
  // =====================================================================
  useEffect(() => {
    if (!previewRendered) {
      return;
    }
    if (!showSource) {
      return;
    } // already on preview
    if (manualToggleRef.current) {
      return;
    } // user made a manual choice, respect it

    const t = setTimeout(() => setShowSource(false), 400);
    return () => clearTimeout(t);
  }, [previewRendered, showSource]);

  // =====================================================================
  // * RENDER DRAWER DIAGRAM (only when drawer opens)
  // =====================================================================
  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }
    if (drawerRenderedForValue.current === value) {
      return;
    }
    if (isDrawerRendering) {
      return;
    }

    let cancelled = false;
    drawerRenderedForValue.current = value;

    setIsDrawerRendering(true);
    setDrawerRendered(false);
    setDrawerError(null);

    // Small delay to let the Drawer DOM fully mount
    const t = setTimeout(async () => {
      try {
        const mermaid = await getMermaid();
        const sanitized = sanitizeMermaidSyntax(value.trim());
        const { svg } = await mermaid.render(drawerId, sanitized);

        if (cancelled) {
          return;
        }
        if (!drawerContainerRef.current) {
          return;
        }

        drawerContainerRef.current.innerHTML = svg;
        const svgEl = drawerContainerRef.current.querySelector("svg");
        if (svgEl) {
          applySvgStyles(svgEl as SVGElement);
        }

        setDrawerRendered(true);
      } catch (err) {
        if (cancelled) {
          return;
        }
        drawerRenderedForValue.current = null;
        setDrawerError(err instanceof Error ? err.message : "Render failed");
      } finally {
        if (!cancelled) {
          setIsDrawerRendering(false);
        }
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen, value]); // ← only deps that should trigger a new render

  // =====================================================================
  // * ZOOM & PAN HANDLERS
  // =====================================================================
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setScale((prev) =>
        Math.min(Math.max(prev + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3)
      );
    }
  }, []);

  const handleZoomIn = useCallback(
    () => setScale((p) => Math.min(p + 0.2, 3)),
    []
  );
  const handleZoomOut = useCallback(
    () => setScale((p) => Math.max(p - 0.2, 0.5)),
    []
  );
  const handleZoomReset = useCallback(() => {
    setScale(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const container = scrollContainerRef.current;
      const content = drawerContainerRef.current;
      if (!container || !content) {
        return;
      }

      const overflows =
        content.scrollWidth > container.clientWidth ||
        content.scrollHeight > container.clientHeight ||
        scale !== 1;

      if (overflows) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - panPosition.x,
          y: e.clientY - panPosition.y,
        });
        e.preventDefault();
      }
    },
    [scale, panPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) {
        return;
      }
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleMouseLeave = useCallback(() => setIsDragging(false), []);

  // =====================================================================
  // * COPY HANDLER
  // =====================================================================
  const handleCopy = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      await copyToClipboard(value);
      setCopied(true);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => setCopied(false), 3000);
    },
    [value]
  );

  // =====================================================================
  // * DOWNLOAD HANDLER
  // =====================================================================
  const handleDownload = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();

      // Determine which container to use based on drawer state
      const container = isDrawerOpen
        ? drawerContainerRef.current
        : previewContainerRef.current;

      if (!container) {
        alert("Container not found. Please wait for the diagram to load.");
        return;
      }

      const svgElement = container.querySelector("svg");
      if (!svgElement) {
        alert(
          "No diagram found to download. Please wait for the diagram to render."
        );
        return;
      }

      setIsDownloading(true);
      try {
        const timestamp = new Date().toISOString().slice(0, 10);
        const fileName = `diagram-${timestamp}.png`;
        await downloadSvgAsPng(svgElement as SVGElement, fileName);
        setCopied(true);
        if (copyTimerRef.current) {
          clearTimeout(copyTimerRef.current);
        }
        copyTimerRef.current = setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        alert(
          `Download failed: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setIsDownloading(false);
      }
    },
    [isDrawerOpen]
  );

  // =====================================================================
  // * DRAWER OPEN / CLOSE
  // =====================================================================
  const handleOpenDrawer = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    justOpenedRef.current = true;
    setIsDrawerOpen(true);
    setTimeout(() => {
      justOpenedRef.current = false;
    }, 300);
  }, []);

  const handleCloseDrawer = useCallback(
    (
      _event?: React.MouseEvent | object,
      reason?: "backdropClick" | "escapeKeyDown"
    ) => {
      if (reason === "backdropClick" && justOpenedRef.current) {
        return;
      }
      setIsDrawerOpen(false);
      // Reset zoom/pan after close animation
      setTimeout(() => {
        setScale(1);
        setPanPosition({ x: 0, y: 0 });
        setIsDragging(false);
      }, 300);
    },
    []
  );

  // =====================================================================
  // * TOGGLE SOURCE / PREVIEW
  // =====================================================================
  const handleToggleSource = useCallback(() => {
    manualToggleRef.current = true;
    setShowSource((prev) => {
      // Only switch to preview if it's actually ready
      if (prev && !previewRendered) {
        return prev;
      }
      return !prev;
    });
  }, [previewRendered]);

  // =====================================================================
  // * JSX
  // =====================================================================
  return (
    <>
      {/* ================================================================ */}
      {/* PREVIEW CARD                                                       */}
      {/* ================================================================ */}
      <div
        className={`my-4 overflow-hidden rounded-xl ${
          showSource ? "border bg-[#FAFAFA]" : "border-transparent"
        }`}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {isPreviewRendering ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            ) : (
              <svg
                className="h-4 w-4 text-gray-900"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            )}
            <span className="text-sm font-semibold text-gray-900">
              {diagramType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip
              title={
                showSource ? "Copy source code" : "Download diagram as PNG"
              }
              arrow
              placement="top"
            >
              <button
                onClick={showSource ? handleCopy : handleDownload}
                disabled={isDownloading && !showSource}
                className="relative cursor-pointer text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showSource ? (
                  <Copy className="h-5 w-5" />
                ) : isDownloading ? (
                  <div className="relative">
                    <Download className="h-5 w-5 opacity-30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                    </div>
                  </div>
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </button>
            </Tooltip>

            {/* Source / Preview toggle pill */}
            <div className="flex items-center gap-1 rounded-full bg-gray-200 p-1.5">
              <Tooltip title="Show source" arrow>
                <button
                  onClick={handleToggleSource}
                  className={`flex items-center justify-center rounded-full p-1.5 transition-all duration-200 ${
                    showSource ? "scale-110 bg-white shadow" : "scale-100"
                  }`}
                >
                  <Code2
                    className={`h-4 w-4 transition-colors duration-200 ${
                      showSource ? "text-gray-900" : "text-gray-400"
                    }`}
                  />
                </button>
              </Tooltip>
              <Tooltip title="Show preview" arrow>
                <span>
                  <button
                    onClick={handleToggleSource}
                    disabled={!previewRendered && showSource}
                    className={`flex items-center justify-center rounded-full p-1.5 transition-all duration-200 ${
                      !showSource ? "scale-110 bg-white shadow" : "scale-100"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <Play
                      className={`h-4 w-4 transition-colors duration-200 ${
                        !showSource ? "text-gray-900" : "text-gray-400"
                      }`}
                    />
                  </button>
                </span>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────── */}
        {/*
         * CRITICAL FIX: Both source and preview containers are ALWAYS mounted
         * in the DOM. We only toggle visibility via CSS (hidden/block).
         * This ensures previewContainerRef.current is never null when the
         * async mermaid.render() resolves, preventing silent render failures.
         */}
        <div style={{ height: "500px" }} className="relative overflow-hidden">
          {/* SOURCE VIEW */}
          <div
            className="h-full overflow-y-auto overflow-x-hidden p-4"
            style={{ display: showSource ? "block" : "none" }}
          >
            <pre className="m-0 min-h-full overflow-x-auto">
              <code className="text-sm font-semibold leading-relaxed text-gray-600">
                {value}
              </code>
            </pre>
          </div>

          {/* PREVIEW VIEW */}
          <div
            className="h-full"
            style={{ display: showSource ? "none" : "block" }}
          >
            {previewError ? (
              <div className="flex h-full items-center justify-center p-6">
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">
                    Failed to render diagram
                  </p>
                  <p className="mt-1 text-xs text-amber-700">{previewError}</p>
                </div>
              </div>
            ) : (
              <div className="group relative h-full overflow-hidden rounded-2xl border">
                {/* Expand to drawer button */}
                <Tooltip title="Expand to full screen" arrow>
                  <button
                    onClick={handleOpenDrawer}
                    className="absolute right-3 top-3 z-10 hidden cursor-pointer items-center justify-center rounded-full bg-white p-2 shadow-lg transition-all duration-200 hover:scale-110 group-hover:flex"
                  >
                    <ChevronsUpDown className="h-4 w-4 rotate-45 text-gray-900" />
                  </button>
                </Tooltip>
                {/* Always-mounted preview container */}
                <div
                  ref={previewContainerRef}
                  className="flex h-full items-center justify-center overflow-auto bg-white p-6"
                />
                {/* Loading overlay while rendering */}
                {isPreviewRendering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
                      <p className="text-sm font-medium text-gray-600">
                        Rendering diagram…
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* FULL-SCREEN DRAWER                                                 */}
      {/* ================================================================ */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "90%", md: "80%", lg: "70%" },
            maxWidth: "1200px",
          },
        }}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.5)" } },
        }}
      >
        <div className="flex h-full flex-col bg-white">
          {/* ── Drawer Header ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-gray-50 to-gray-100 px-6 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-blue-600 shadow-md">
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {diagramType}
                </h2>
                <p className="text-sm text-gray-500">
                  Ctrl/Cmd + Scroll to zoom · Drag to pan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {scale !== 1 && (
                <div className="rounded-md bg-blue-100 px-2.5 py-1 text-sm font-semibold text-blue-700">
                  {Math.round(scale * 100)}%
                </div>
              )}

              {/* Zoom controls */}
              <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white">
                <Tooltip title="Zoom out" arrow>
                  <span>
                    <button
                      onClick={handleZoomOut}
                      disabled={scale <= 0.5}
                      className="inline-flex cursor-pointer items-center rounded-l-lg px-2 py-2 text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                  </span>
                </Tooltip>
                <Tooltip title="Reset zoom" arrow>
                  <span>
                    <button
                      onClick={handleZoomReset}
                      disabled={scale === 1}
                      className="inline-flex cursor-pointer items-center border-x border-gray-300 px-2 py-2 text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </Tooltip>
                <Tooltip title="Zoom in" arrow>
                  <span>
                    <button
                      onClick={handleZoomIn}
                      disabled={scale >= 3}
                      className="inline-flex cursor-pointer items-center rounded-r-lg px-2 py-2 text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </span>
                </Tooltip>
              </div>

              <Tooltip title="Download as PNG" arrow>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDownloading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isDownloading
                    ? "Downloading..."
                    : copied
                      ? "Downloaded!"
                      : "Download PNG"}
                </button>
              </Tooltip>

              <Tooltip title="Close" arrow>
                <button
                  onClick={handleCloseDrawer}
                  className="rounded-lg bg-gray-200 p-2 text-gray-600 transition-all hover:bg-gray-300 hover:text-gray-800"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* ── Drawer Content ─────────────────────────────────────────── */}
          <div
            className="flex-1 overflow-hidden bg-gray-50"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(148,163,184,0.2) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Loading skeleton */}
            {isDrawerRendering && !drawerRendered && (
              <div className="flex h-full w-full items-center justify-center p-8">
                <div className="rounded-lg bg-white/80 p-8 shadow-lg backdrop-blur-sm">
                  <div className="flex animate-pulse flex-col items-center gap-6">
                    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
                      <div className="h-12 w-32 rounded-lg bg-gray-200" />
                      <div className="h-8 w-0.5 bg-gray-200" />
                      <div className="flex w-full justify-center gap-8">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-12 w-28 rounded-lg bg-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="h-5 w-5 animate-spin text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span className="font-medium">Rendering diagram…</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {drawerError && !drawerRendered && (
              <div className="flex h-full w-full items-center justify-center overflow-auto p-8">
                <div className="mx-auto max-w-3xl rounded-lg border border-amber-300 bg-amber-50 p-6 shadow-lg">
                  <p className="mb-2 text-base font-semibold text-amber-800">
                    Failed to render diagram
                  </p>
                  <p className="mb-4 text-sm text-amber-700">{drawerError}</p>
                  <div className="rounded-lg bg-gray-900 p-4">
                    <pre className="overflow-x-auto text-xs text-gray-300">
                      <code>{value}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Rendered diagram — zoomable / pannable */}
            <div
              ref={scrollContainerRef}
              className="flex h-full w-full items-start justify-center overflow-auto p-8"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{
                cursor: isDragging
                  ? "grabbing"
                  : scale !== 1
                    ? "grab"
                    : "default",
                display: drawerRendered ? "flex" : "none",
                userSelect: isDragging ? "none" : "auto",
              }}
              title="Hold Ctrl/Cmd + Scroll to zoom. Click and drag to pan."
            >
              <div
                ref={drawerContainerRef}
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${scale})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                  maxWidth: "100%",
                  width: "100%",
                }}
                className="[&_svg]:block [&_svg]:w-auto [&_svg]:max-w-full"
              />
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
