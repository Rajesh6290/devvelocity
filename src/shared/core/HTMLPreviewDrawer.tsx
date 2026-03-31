/**
 * =====================================================================
 * ! FILE HEADER DOCUMENTATION
 * =====================================================================
 *
 * - FILE NAME: HTMLPreviewDrawer.tsx
 * - TYPE: Component
 * - PURPOSE:
 *   Full-screen drawer for viewing HTML live previews in an expanded view
 *
 * - USED IN:
 *   MarkdownRenderer component when rendering complete HTML documents
 *
 * ? SERVER OR CLIENT:
 *   Client-side component
 *
 * ! IMPORTANT NOTES:
 *   - Uses Material UI Drawer for consistent behavior
 *   - Renders HTML in sandboxed iframe for security
 *   - Prevents body scroll when drawer is open
 *
 * 🔒 SECURITY:
 *   - Sandbox removes allow-same-origin to prevent escape attacks
 *   - Only allows scripts, forms, modals, and popups
 *   - Key prop prevents cross-contamination between renders
 *
 * ⚡ PERFORMANCE:
 *   - Only renders when drawer is opened
 *   - Key prop ensures stable iframe identity
 *   - No re-renders during parent updates
 *
 * =====================================================================
 */

// _ External libraries
import { Drawer } from "@mui/material";
import { CodeXml, Copy, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// =====================================================================
// * TYPES / INTERFACES
// =====================================================================

interface HTMLPreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  html: string;
}

// =====================================================================
// * OPTIMIZED COMPONENTS
// =====================================================================

/**
 * * DESCRIPTION:
 * Memoized iframe to prevent re-renders during drawer interactions
 */
const DrawerHTMLIframe = React.memo(
  ({ html }: { html: string }) => {
    // Inject localStorage polyfill to prevent SecurityError in sandboxed iframe
    const polyfillScript = `<script>
(function() {
  // Immediately define localStorage polyfill before any other scripts run
  try {
    localStorage.getItem('test');
  } catch (e) {
    const storage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: function(key) { return storage[key] || null; },
        setItem: function(key, value) { storage[key] = String(value); },
        removeItem: function(key) { delete storage[key]; },
        clear: function() { for (let k in storage) delete storage[k]; },
        get length() { return Object.keys(storage).length; },
        key: function(index) { return Object.keys(storage)[index] || null; }
      },
      configurable: true,
      writable: false
    });
  }
})();
</script>`;

    let htmlWithPolyfill = html;

    // Try multiple injection points to ensure polyfill loads first
    if (/<head>/i.test(html)) {
      htmlWithPolyfill = html.replace(/<head>/i, `<head>${polyfillScript}`);
    } else if (/<html[^>]*>/i.test(html)) {
      htmlWithPolyfill = html.replace(
        /<html([^>]*)>/i,
        `<html$1>${polyfillScript}`
      );
    } else if (/<!doctype html>/i.test(html)) {
      htmlWithPolyfill = html.replace(
        /(<!doctype html>)/i,
        `$1${polyfillScript}`
      );
    } else {
      htmlWithPolyfill = polyfillScript + html;
    }

    return (
      <iframe
        key={html.substring(0, 100)}
        srcDoc={htmlWithPolyfill}
        sandbox="allow-scripts allow-forms allow-modals allow-popups"
        className="animate-fadeIn h-full w-full border-0"
        title="HTML Preview"
      />
    );
  },
  (prevProps, nextProps) => prevProps.html === nextProps.html
);

DrawerHTMLIframe.displayName = "DrawerHTMLIframe";

// =====================================================================
// * HELPER FUNCTIONS / UTILS
// =====================================================================

/**
 * * DESCRIPTION:
 * Cross-browser clipboard copy utility
 */
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

// =====================================================================
// * MAIN COMPONENT
// =====================================================================

/**
 * * DESCRIPTION:
 * Full-screen drawer for viewing HTML live previews
 *
 * * FEATURES:
 * - Material UI Drawer for consistent UI
 * - Sandboxed iframe for security
 * - Copy HTML source button
 * - Responsive width
 */
const HTMLPreviewDrawer = React.memo(
  function HTMLPreviewDrawer({ open, onClose, html }: HTMLPreviewDrawerProps) {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Prevent body scroll when drawer is open
    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    // Handle copy - memoized to prevent re-renders
    const handleCopy = useCallback(async () => {
      await copyToClipboard(html);
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }, [html]);

    // Cleanup timer
    useEffect(
      () => () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      },
      []
    );

    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        disableEscapeKeyDown={false}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "90%", md: "80%", lg: "70%" },
            maxWidth: "1200px",
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        }}
      >
        <div className="flex h-full flex-col bg-white">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-gray-50 to-gray-100 px-6 py-1.5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-green-500 to-green-600 shadow-md">
                <CodeXml className="size-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  HTML Live Preview
                </h2>
                <p className="text-sm text-gray-500">
                  Interactive full-screen preview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg bg-gray-200 p-2 text-gray-600 transition-all hover:bg-gray-300 hover:text-gray-800"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-hidden bg-white">
            <DrawerHTMLIframe html={html} />
          </div>
        </div>
      </Drawer>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if props actually changed
    return (
      prevProps.open === nextProps.open && prevProps.html === nextProps.html
    );
  }
);

export default HTMLPreviewDrawer;
