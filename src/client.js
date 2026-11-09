// dsh-chat-rtl — source (ESM). Built into lib/client.js with the
// __ModuleLoader__ envelope by build.mjs. No imports: runs as-is.

const STYLE_ID = "dsh-chat-rtl-style";

const FLOW_SEL = ':is([data-slot="conversation.chat.flow"], [data-slot="conversation.chat.node"])';
const BLOCK_SEL = '[data-text-interaction-source] :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, dt, dd)';
const COMPOSER_SEL = '[data-composer-input="true"]';

const CSS = [
  "/* dsh-chat-rtl: start-alignment follows each block's own dir=auto. */",
  `${FLOW_SEL} ${BLOCK_SEL} {`,
  "  text-align: start;",
  "}",
  "/* Trajectory chrome (process-activity step titles) follows the chat direction. */",
  '[data-slot="conversation.chat.flow"] button[data-process-activity],',
  '[data-slot="conversation.chat.node"] button[data-process-activity] {',
  "  direction: rtl;",
  "  text-align: start;",
  "}",
  "/* Block code and inline code stay LTR inside any paragraph. */",
  '[data-slot="conversation.chat.flow"] pre,',
  '[data-slot="conversation.chat.node"] pre,',
  '[data-slot="conversation.chat.flow"] code,',
  '[data-slot="conversation.chat.node"] code {',
  "  direction: ltr;",
  "  unicode-bidi: isolate;",
  "  text-align: left;",
  "}"
].join("\n");

// Set dir="auto" on every message block + the composer inside root.
// dir=auto resolves each element's direction from its own first strong
// character (verified live: Persian -> rtl, English -> ltr).
function autotize(root) {
  const scope = root && root.querySelectorAll ? root : document;
  const found = [];
  const pushAll = (list) => { for (const el of list) found.push(el); };
  pushAll(scope.querySelectorAll(`${FLOW_SEL} ${BLOCK_SEL}`));
  pushAll(scope.querySelectorAll(`${COMPOSER_SEL}:not([dir])`));
  if (scope !== document && root && root.matches) {
    if (!root.hasAttribute("dir") && (root.matches(COMPOSER_SEL) ||
        (root.matches(BLOCK_SEL) && root.closest(FLOW_SEL)))) {
      found.push(root);
    }
  }
  for (const el of found) {
    if (!el.hasAttribute("dir")) el.setAttribute("dir", "auto");
  }
}

export const inject = [];

export function apply(ctx) {
  ctx.effect(() => {
    if (typeof document === "undefined") return () => {};
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
    autotize(document);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes") {
          const t = m.target;
          if (t.matches && !t.hasAttribute("dir") &&
              (t.matches(COMPOSER_SEL) ||
               (t.matches(BLOCK_SEL) && t.closest(FLOW_SEL)))) {
            t.setAttribute("dir", "auto");
          }
          continue;
        }
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          autotize(node);
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["dir"]
    });
    return () => {
      observer.disconnect();
      style.remove();
    };
  }, "chat-rtl: style and composer direction");
}
