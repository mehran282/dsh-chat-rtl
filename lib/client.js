window.__ModuleLoader__.load({
  id: "dsh-chat-rtl",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
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
      "/* Conversation-level mode: when the last user turn reads Persian, */",
      "/* whole message blocks follow it (code stays LTR). */",
      `${FLOW_SEL}[data-dsh-chat-rtl="fa"] ${BLOCK_SEL},`,
      `${FLOW_SEL}[data-dsh-chat-rtl="fa"] button[data-process-activity] {`,
      "  direction: rtl;",
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

    // Conversation-level mode: when the last user turn reads Persian, the whole
    // flow is marked and every message block follows it (CSS above wins over the
    // per-block dir=auto fallback, which still covers undetermined flows).
    const USER_SEL = '[data-chat-flow-kind="user"]';
    const FA_RANGE = "\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFE";
    const FA_FIRST = new RegExp("[A-Za-z" + FA_RANGE + "]");
    const IS_LATIN = /^[A-Za-z]$/;

    function flowMode(flowEl) {
      const users = flowEl.querySelectorAll(USER_SEL);
      if (!users.length) return null;
      const text = (users[users.length - 1].textContent || "").trim();
      const first = text.match(FA_FIRST);
      if (!first) return null;
      return IS_LATIN.test(first[0]) ? "en" : "fa";
    }

    function applyMode(flowEl) {
      if (flowMode(flowEl) === "fa") flowEl.setAttribute("data-dsh-chat-rtl", "fa");
      else flowEl.removeAttribute("data-dsh-chat-rtl");
    }

    function autotizeFlows(scope) {
      const flows = scope === document
        ? Array.from(document.querySelectorAll(FLOW_SEL))
        : (scope.matches && scope.matches(FLOW_SEL) ? [scope] : Array.from(scope.querySelectorAll(FLOW_SEL)));
      for (const flow of flows) applyMode(flow);
    }
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

    const inject = [];

    function apply(ctx) {
      ctx.effect(() => {
        if (typeof document === "undefined") return () => {};
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = CSS;
        document.head.appendChild(style);
        autotize(document);
        autotizeFlows(document);
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
            const touchUser = (n) => n.matches && (n.matches(USER_SEL) || n.querySelector(USER_SEL));
            for (const node of m.addedNodes) {
              if (node.nodeType !== 1) continue;
              autotize(node);
              const flow = node.closest ? node.closest(FLOW_SEL) : null;
              if (flow && touchUser(node)) applyMode(flow);
              else if (flow && node.matches && node.matches(FLOW_SEL)) applyMode(flow);
            }
            if (m.removedNodes.length && m.target.closest) {
              const flow = m.target.closest(FLOW_SEL);
              if (flow) applyMode(flow);
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

    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
