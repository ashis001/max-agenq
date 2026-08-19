"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const AGENQ_AGENT_ID = "2b69b018-c154-4547-8a36-80e01ce62fa4";
const AGENQ_MOUNT_KEY = `agent-mount-state-${AGENQ_AGENT_ID}`;

const AGENQ_CONFIG = {
  agentId: AGENQ_AGENT_ID,
  projectId: "364626e9-82d3-4d31-b994-439d77a29f31",
  customerCode: "SUPER-USER",
  backendProtocol: "backend-v2",
  apiBaseUrl: "https://general-backend.aws.agenq.com",
  authEndpoint: "/api/agenq/token",
};

export function AgenQAgent() {
  const mounted = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/login") return;

    const timer = window.setInterval(() => {
      if (!(window as any).AGENQ?.render || mounted.current) return;
      mounted.current = true;

      // Ensure widget starts CLOSED — clear any leftover "OPEN" state from localStorage
      try {
        localStorage.setItem(AGENQ_MOUNT_KEY, "CLOSED");
      } catch (_) {}

      // Render the SDK with initialState CLOSED so it doesn't auto-expand
      (window as any).AGENQ.render({
        ...AGENQ_CONFIG,
        initialState: "CLOSED",
      } as any);
    }, 150);

    return () => window.clearInterval(timer);
  }, [pathname]);

  if (pathname === "/login") return null;

  return (
    <>
      <div id="agenq-root" />
      <Script
        src="https://cdn.agenqglobal.com/agenq-client-sdk.js"
        strategy="afterInteractive"
      />
    </>
  );
}

/**
 * Programmatically open the AgenQ widget by finding and clicking its launcher button.
 * Uses a heuristic scoring search to locate the launcher (even inside Shadow DOM)
 * and clicks the actual interactive target (checkbox, label, image, or button) inside it.
 */
export function triggerAgenQOpen() {
  console.log("🚀 triggerAgenQOpen called. Searching for AgenQ launcher element...");

  interface Candidate {
    element: HTMLElement;
    score: number;
  }

  const candidates: Candidate[] = [];

  function evaluateElement(el: HTMLElement) {
    let score = 0;

    // 1. Position and geometry analysis
    try {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      if (style.position === "fixed" || style.position === "absolute") {
        // Floating launcher is at the bottom right
        const isBottomRight = rect.bottom > window.innerHeight - 200 && rect.right > window.innerWidth - 200;
        const isSmallBubble = rect.width >= 30 && rect.width <= 120 && rect.height >= 30 && rect.height <= 120;

        if (isBottomRight) {
          score += 50;
        }
        if (isSmallBubble) {
          score += 30;
        }
      }
    } catch (_) {}

    // 2. Avatar/image verification
    if (el.tagName === "IMG") {
      const src = (el as HTMLImageElement).src || "";
      if (src.includes("nina") || src.includes("cloye") || src.includes("agent")) {
        score += 60;
      }
    }

    // 3. Class, ID, and attribute matching
    const id = el.id || "";
    const className = typeof el.className === "string" ? el.className : "";
    const hasAgenqAttr = Array.from(el.attributes).some(attr =>
      attr.name.includes("agenq") || attr.value.includes("agenq")
    );

    if (id.includes("agenq") || className.includes("agenq") || hasAgenqAttr) {
      score += 40;
    }

    // 4. Parenting check
    let parent = el.parentElement;
    let isInsideAgenqRoot = false;
    while (parent) {
      if (parent.id === "agenq-root") {
        isInsideAgenqRoot = true;
        break;
      }
      parent = parent.parentElement;
    }
    if (isInsideAgenqRoot) {
      score += 30;
    }

    // 5. Clickable tag bonus
    if (el.tagName === "BUTTON" || el.getAttribute("role") === "button" || el.onclick) {
      score += 20;
    }

    if (score > 0) {
      candidates.push({ element: el, score });
    }
  }

  // Recursive traversal of light DOM and shadow roots
  function traverse(node: Node) {
    if (node instanceof HTMLElement) {
      evaluateElement(node);
    }

    if (node instanceof HTMLElement || node instanceof Document || node instanceof ShadowRoot) {
      const children = node.childNodes;
      for (let i = 0; i < children.length; i++) {
        traverse(children[i]);
      }

      if (node instanceof HTMLElement && node.shadowRoot) {
        traverse(node.shadowRoot);
      }
    }
  }

  // Search the entire document starting from the body
  traverse(document.body);

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Helper to search deep inside a node (including shadow DOM) for specific tags
  function querySelectorAllDeep(root: Node, selector: string): HTMLElement[] {
    const elements: HTMLElement[] = [];
    function search(node: Node) {
      if (node instanceof HTMLElement && node.matches(selector)) {
        elements.push(node);
      }
      if (node instanceof HTMLElement || node instanceof Document || node instanceof ShadowRoot) {
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
          search(children[i]);
        }
        if (node instanceof HTMLElement && node.shadowRoot) {
          search(node.shadowRoot);
        }
      }
    }
    search(root);
    return elements;
  }

  if (candidates.length > 0) {
    const best = candidates[0];
    console.log("🎯 Best candidate found with score", best.score, ":", best.element);

    // Deep search inside the candidate for actual interactive targets
    const inputs = querySelectorAllDeep(best.element, "input[type='checkbox'], input[type='radio']");
    const labels = querySelectorAllDeep(best.element, "label");
    const imgs = querySelectorAllDeep(best.element, "img");
    const btns = querySelectorAllDeep(best.element, "button, [role='button']");

    let clickTarget: HTMLElement = best.element;

    if (inputs.length > 0) {
      clickTarget = inputs[0];
      console.log("🎯 Found input checkbox/radio target:", clickTarget);
    } else if (labels.length > 0) {
      clickTarget = labels[0];
      console.log("🎯 Found label target:", clickTarget);
    } else if (imgs.length > 0) {
      clickTarget = imgs[0];
      console.log("🎯 Found img target:", clickTarget);
    } else if (btns.length > 0) {
      clickTarget = btns[0];
      console.log("🎯 Found button target:", clickTarget);
    }

    console.log("👆 Clicking element:", clickTarget);
    clickTarget.click();
    clickTarget.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return;
  }

  console.warn("⚠️ Heuristics search did not locate candidate. Retrying with fallbacks...");

  // Selectors fallback
  const selectors = [
    "[agenq-id] button",
    "[agenq-id]",
    "#agenq-root button",
    "#agenq-root img",
    "#agenq-root div",
  ];
  for (const sel of selectors) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) {
      el.click();
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return;
    }
  }
}
