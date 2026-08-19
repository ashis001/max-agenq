"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MaxGuidePointerProps {
  text?: string;
  targetId?: string;
  targetUrl?: string;
  state?: "normal" | "thinking" | "acting" | "await";
  className?: string;
}

type CursorPos = { x: number; y: number; label?: string; type?: string };
type CursorState = "idle" | "thinking" | "acting" | "await";

// ─── Brand colours (from the HTML prototype) ──────────────────────────────────
const VIOLET = "#6d28ff";  // default
const VIOLET_DARK = "#3c1aa8";  // thinking
const VIOLET_ACT = "#4a1fd6";  // acting
const ORANGE = "#f0910c";  // await

// ─── CSS injected once into <head> ────────────────────────────────────────────
const STYLE_ID = "agenq-nina-cursor-styles";
const CURSOR_CSS = `
  /* ── comet trail motes ── */
  .agenq-tr {
    position: fixed; z-index: 2147483640; border-radius: 50%; pointer-events: none; opacity: 0;
    transition: left var(--d) cubic-bezier(.32,.02,.12,1),
                top  var(--d) cubic-bezier(.32,.02,.12,1), opacity .45s;
  }
  #agenq-tr1 { width:15px;height:15px;margin:-7.5px 0 0 -7.5px;background:rgba(109,40,255,.17);--d:1.06s }
  #agenq-tr2 { width:11px;height:11px;margin:-5.5px 0 0 -5.5px;background:rgba(109,40,255,.12);--d:1.2s  }
  #agenq-tr3 { width:7px; height:7px; margin:-3.5px 0 0 -3.5px;background:rgba(109,40,255,.08);--d:1.34s }

  /* ── breathing halo ── */
  .agenq-halo {
    position: fixed; z-index: 2147483641;
    width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;pointer-events:none;opacity:0;
    background: radial-gradient(circle,rgba(109,40,255,.24) 0%,rgba(109,40,255,0) 70%);
    transition: left .95s cubic-bezier(.32,.02,.12,1), top .95s cubic-bezier(.32,.02,.12,1), opacity .3s;
    animation: agenq-breathe 2.6s ease-in-out infinite;
  }
  @keyframes agenq-breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }

  /* ── yellow arc ring (thinkArc) ── */
  .agenq-thinkarc {
    position: fixed; z-index: 2147483644;
    width: 34px; height: 34px; margin: -17px 0 0 -17px;
    pointer-events: none; opacity: 0; transition: opacity .2s;
  }
  .agenq-thinkarc.on { opacity: 1; }
  .agenq-thinkarc circle {
    fill: none; stroke: #f0910c; stroke-width: 2.4; stroke-linecap: round;
    stroke-dasharray: 88; stroke-dashoffset: 88; transform: rotate(-90deg); transform-origin: 50% 50%;
  }
  .agenq-thinkarc.on circle {
    animation: agenq-arcfill var(--ad, .62s) linear forwards;
  }
  @keyframes agenq-arcfill { to { stroke-dashoffset: 0; } }

  /* ── ripple ── */
  .agenq-ripple { position:fixed;z-index:2147483645;border-radius:50%;pointer-events:none }
  .agenq-ripple-fast { border:2px solid rgba(109,40,255,.9); animation:agenq-rip  .55s cubic-bezier(.15,.7,.3,1) forwards }
  .agenq-ripple-soft { background:radial-gradient(circle,rgba(109,40,255,.3) 0%,rgba(109,40,255,0) 70%); animation:agenq-rip2 .85s ease-out forwards }
  @keyframes agenq-rip  { 0%{width:10px;height:10px;margin:-5px 0 0 -5px;opacity:.9}  100%{width:62px;height:62px;margin:-31px 0 0 -31px;opacity:0} }
  @keyframes agenq-rip2 { 0%{width:16px;height:16px;margin:-8px 0 0 -8px;opacity:.8}  100%{width:86px;height:86px;margin:-43px 0 0 -43px;opacity:0} }

  /* ── tag dot & typing dots ── */
  @keyframes agenq-tdot  { 0%,100%{opacity:1} 50%{opacity:.25} }
  @keyframes agenq-tdots { 0%,100%{opacity:.3;transform:translateY(0)} 40%{opacity:1;transform:translateY(-2px)} }

  /* ── await tag pulse ── */
  @keyframes agenq-awaitPulse {
    0%,100%{transform:scale(1);  box-shadow:0 3px 8px rgba(200,120,10,.35)}
    50%    {transform:scale(1.05);box-shadow:0 4px 14px rgba(240,145,12,.5)}
  }
`;

function injectStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = CURSOR_CSS;
  document.head.appendChild(el);
}

function spawnRipple(x: number, y: number, container: HTMLElement) {
  ["agenq-ripple-fast", "agenq-ripple-soft"].forEach((cls) => {
    const el = document.createElement("div");
    el.className = `agenq-ripple ${cls}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    container.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  });
}

// Global persistent state for seamless navigation jumps
const getGlobalPos = () => {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  return {
    x: (window as any).__maxCursorX || window.innerWidth / 2,
    y: (window as any).__maxCursorY || window.innerHeight / 2
  };
};

const setGlobalPos = (x: number, y: number) => {
  if (typeof window !== 'undefined') {
    (window as any).__maxCursorX = x;
    (window as any).__maxCursorY = y;
  }
};


// ─── Component ────────────────────────────────────────────────────────────────

export default function MaxGuidePointer({
  text = "Click here to continue",
  targetId,
  targetUrl,
  state = "acting",
  className = "",
}: MaxGuidePointerProps) {
  const router = useRouter();
  const anchorRef = useRef<HTMLDivElement>(null);

  // Start position at the last known global position to allow CSS transition to fly from there!
  const [pos, setPos] = useState<CursorPos>(() => {
    const g = getGlobalPos();
    return { x: g.x, y: g.y, label: text };
  });

  const [visible, setVisible] = useState(false);
  const [curState, setCurState] = useState<CursorState>("idle");
  const [wind, setWind] = useState(false);
  const [press, setPress] = useState(false);
  const [thinkArc, setThinkArc] = useState<{ active: boolean; durMs: number; key: number }>({
    active: false,
    durMs: 620,
    key: 0,
  });
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);

  const posRef = useRef(pos);
  const windTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playClickFxRef = useRef<() => void>(() => { });

  // Portal creation + style injection
  useEffect(() => {
    injectStyles();
    let el = document.getElementById("agenq-cursor-portal") as HTMLDivElement;
    if (!el) {
      el = document.createElement("div");
      el.id = "agenq-cursor-portal";
      document.body.appendChild(el);
    }
    setPortalEl(el);
    return () => {
      if (el && el.childNodes.length === 0) {
        el.remove();
      }
    };
  }, []);

  // Sync state prop
  useEffect(() => {
    if (state === "thinking") setCurState("thinking");
    else if (state === "acting") setCurState("acting");
    else if (state === "await") setCurState("await");
    else setCurState("idle");
  }, [state]);

  const curStateRef = useRef(curState);
  useEffect(() => {
    curStateRef.current = curState;
  }, [curState]);

  // Keep posRef updated
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  // Sync position with inline anchor & trigger flying logic
  useEffect(() => {
    const getTargetCoordinates = (currentEl: HTMLElement) => {
      // If the element has a text span, label, or inner text container (like sidebar nav links or action buttons),
      // target the text itself with pinpoint accuracy.
      const textSpan = currentEl.querySelector('span.nav-label, span, label, p') as HTMLElement | null;
      const targetEl = (textSpan && textSpan.offsetWidth > 0 && textSpan.offsetHeight > 0) ? textSpan : currentEl;
      const rect = targetEl.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    };

    const updatePosSilent = () => {
      const currentEl = targetId ? document.getElementById(targetId) : anchorRef.current;
      if (!currentEl) return;
      const { x: targetX, y: targetY } = getTargetCoordinates(currentEl);
      setPos(p => ({ ...p, x: targetX, y: targetY }));
      setGlobalPos(targetX, targetY);
    };

    const el = targetId ? document.getElementById(targetId) : anchorRef.current;
    if (!el) return;

    // We delay the very first position update slightly to ensure React has painted
    // the portal at the initial global last position, allowing the CSS transition to trigger.
    const flyTimer = setTimeout(() => {
      const currentEl = targetId ? document.getElementById(targetId) : anchorRef.current;
      if (!currentEl) return;

      // Exact element/text target position
      const { x: targetX, y: targetY } = getTargetCoordinates(currentEl);

      const prevX = posRef.current.x;
      const prevY = posRef.current.y;

      // Determine dynamic label based on element type
      let dynamicLabel = "Cloey";
      if (currentEl) {
        const tag = currentEl.tagName.toUpperCase();
        const type = (currentEl as HTMLInputElement).type?.toLowerCase();

        if (tag === 'SELECT' || type === 'checkbox' || type === 'radio') {
          dynamicLabel = "Selecting";
        } else if (tag === 'INPUT' || tag === 'TEXTAREA') {
          dynamicLabel = "Typing";
          // } else if (tag === 'A' || tag === 'BUTTON' || currentEl.getAttribute('role') === 'button') {
          //     dynamicLabel = "Navigating";
        } else {
          dynamicLabel = "Cloey";
        }
      }

      setPos({ x: targetX, y: targetY, label: dynamicLabel });
      setGlobalPos(targetX, targetY);

      if (!visible) setVisible(true);

      // Calculate travel distance to determine travel time (tvl)
      const dist = Math.hypot(targetX - prevX, targetY - prevY);
      const tvl = Math.max(0.45, Math.min(1.25, dist / 620));

      // Wait for cursor to physically arrive, THEN trigger thinking arc (yellow circle)
      // just like the prototype!
      clearTimeout(thinkTimer.current ?? undefined);
      setThinkArc(prev => ({ ...prev, active: false }));

      // Always do the arrival effects when targeting a new field
      thinkTimer.current = setTimeout(() => {
        setThinkArc(prev => ({ active: true, durMs: 620, key: prev.key + 1 }));

        // Turn off yellow ring after 620ms
        setTimeout(() => {
          setThinkArc(prev => ({ ...prev, active: false }));

          // Play the click animation right after thinking finishes on every field!
          playClickFxRef.current();
        }, 620);

      }, Math.round(tvl * 1000 + 140));

      // Wind-up micro scale on new move arrival
      setWind(false);
      clearTimeout(windTimer.current ?? undefined);
      windTimer.current = setTimeout(() => {
        setWind(true);
        clearTimeout(pressTimer.current ?? undefined);
        pressTimer.current = setTimeout(() => setWind(false), 180);
      }, 10);

    }, 50); // 50ms delay to force CSS transition on mount

    window.addEventListener("resize", updatePosSilent);
    window.addEventListener("scroll", updatePosSilent, true);

    return () => {
      clearTimeout(flyTimer);
      window.removeEventListener("resize", updatePosSilent);
      window.removeEventListener("scroll", updatePosSilent, true);
    };
  }, [text, targetId]); // Only run flight logic on text or targetId change/mount


  // Play Click FX logic
  useEffect(() => {
    playClickFxRef.current = () => {
      clearTimeout(thinkTimer.current ?? undefined);
      setThinkArc((prev) =>
        prev.active ? { ...prev, active: false, key: prev.key + 1 } : prev
      );

      setWind(true);
      clearTimeout(windTimer.current ?? undefined);
      windTimer.current = setTimeout(() => {
        setWind(false);
        setPress(true);
        if (portalEl) spawnRipple(posRef.current.x, posRef.current.y, portalEl);
        clearTimeout(pressTimer.current ?? undefined);
        pressTimer.current = setTimeout(() => {
          setPress(false);
          setCurState((s) => (s === "acting" ? "idle" : s));
        }, 180);
      }, 150);
    };
  }, [portalEl]);


  // Handle Auto Navigate and Manual Click
  useEffect(() => {
    if (!targetUrl) return;
    const timer = setTimeout(() => {
      // It auto-plays click FX if we arrive, but just as a backup fallback if dist < 10
      setTimeout(() => router.push(targetUrl), 400);
    }, 6000);
    return () => clearTimeout(timer);
  }, [targetUrl, router]);

  const handleManualClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickFxRef.current();
    if (targetUrl) {
      setTimeout(() => router.push(targetUrl), 400);
    }
  };

  // ── Derived visual values ─────────────────────────────────────────────────

  const isAwait = curState === "await";
  const isThinking = curState === "thinking";
  const isActing = curState === "acting";

  const tagBg =
    isAwait ? ORANGE :
      isThinking ? VIOLET_DARK :
        isActing ? VIOLET_ACT :
          VIOLET;

  const arrowFill = isAwait ? ORANGE : VIOLET;
  const dotBg = isAwait ? "#fff3d6" : "#b9ff8f";

  // wind-up / press micro-scale
  const scale = press ? 0.78 : wind ? 1.14 : 1;

  // await: arrow rotates 133°
  const arrowTransform = isAwait ? "rotate(133deg)" : "rotate(0deg)";

  // Tag styles differ in await mode (flips to right side)
  const tagStyle: React.CSSProperties = isAwait
    ? {
      position: "absolute", right: "16px", top: "20px", left: "auto",
      background: tagBg, color: "#fff", fontSize: "9.5px", fontWeight: 750,
      letterSpacing: ".05em", padding: "3px 8px", whiteSpace: "nowrap",
      borderRadius: "6px 6px 2px 6px",
      boxShadow: "0 3px 8px rgba(60,25,150,.32)",
      display: "flex", alignItems: "center", gap: "5px",
      transition: "background .25s",
      animation: "agenq-awaitPulse 1.7s ease-in-out infinite",
    }
    : {
      position: "absolute", left: "17px", top: "19px",
      background: tagBg, color: "#fff", fontSize: "9.5px", fontWeight: 750,
      letterSpacing: ".05em", padding: "3px 8px", whiteSpace: "nowrap",
      borderRadius: "6px 6px 6px 2px",
      boxShadow: "0 3px 8px rgba(60,25,150,.32)",
      display: "flex", alignItems: "center", gap: "5px",
      transition: "background .25s",
    };

  return (
    <div
      ref={anchorRef}
      onClick={handleManualClick}
      className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 cursor-pointer w-0 h-0 z-[99999] ${className}`}
    >
      {portalEl && createPortal(
        <>
          {/* ── Breathing halo ───────────────────────────────────────────────── */}
          <div
            className="agenq-halo"
            style={{ left: `${pos.x}px`, top: `${pos.y}px`, opacity: visible ? 1 : 0 }}
          />

          {/* ── Yellow/Orange reading arc ring (thinkArc) ────────────────────── */}
          <svg
            key={`thinkarc-${thinkArc.key}`}
            className={`agenq-thinkarc ${thinkArc.active && visible ? "on" : ""}`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ["--ad" as any]: `${thinkArc.durMs}ms`,
            }}
            viewBox="0 0 32 32"
          >
            <circle
              cx="16"
              cy="16"
              r="14"
              onAnimationEnd={() => {
                if (thinkArc.active && curState === 'acting') playClickFxRef.current();
              }}
            />
          </svg>

          {/* ── Comet trail (three motes with lag) ───────────────────────────── */}
          {(["agenq-tr1", "agenq-tr2", "agenq-tr3"] as const).map((id) => (
            <div
              key={id}
              id={id}
              className="agenq-tr"
              style={{ left: `${pos.x}px`, top: `${pos.y}px`, opacity: visible ? 1 : 0 }}
            />
          ))}

          {/* ── Main cursor ──────────────────────────────────────────────────── */}
          <div
            style={{
              position: "fixed",
              zIndex: 2147483647,
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transformOrigin: "3px 1.5px",
              transform: `scale(${scale})`,
              transition:
                "left .95s cubic-bezier(.32,.02,.12,1), " +
                "top  .95s cubic-bezier(.32,.02,.12,1), " +
                "opacity .3s, " +
                "transform .18s cubic-bezier(.34,1.5,.5,1)",
              opacity: visible ? 1 : 0,
              pointerEvents: "none",
            }}
          >
            <svg
              width="24" height="26" viewBox="0 0 24 26"
              style={{
                display: "block",
                filter: "drop-shadow(0 4px 7px rgba(60,25,150,.42))",
                transition: "transform .5s cubic-bezier(.3,1.2,.4,1)",
                transform: arrowTransform,
              }}
            >
              <path
                d="M3 1.5 L19.5 12.5 L11.8 14 L8.2 21.5 Z"
                fill={arrowFill}
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <span style={tagStyle}>
              <span style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: dotBg, flexShrink: 0,
                animation: "agenq-tdot 1.3s ease-in-out infinite",
              }} />
              {pos.label ?? "AgenQ"}
              <span style={{ display: "inline-flex", gap: "2px", marginLeft: "1px" }}>
                {[0, 0.16, 0.32].map((delay, i) => (
                  <i
                    key={i}
                    style={{
                      width: "3px", height: "3px", borderRadius: "50%",
                      background: "#fff", opacity: 0.35, display: "block", fontStyle: "normal",
                      animation: `agenq-tdots 1.05s ease-in-out ${delay}s infinite`,
                    }}
                  />
                ))}
              </span>
            </span>
          </div>
        </>,
        portalEl
      )}
    </div>
  );
}
