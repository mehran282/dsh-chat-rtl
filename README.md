# dsh-chat-rtl — auto RTL for Persian chat content

By **Mehran Ghalambor** ([mehran.ghalambor@gmail.com](mailto:mehran.ghalambor@gmail.com)) · MIT License.

Real, installable client plugin + profile bundle for DeepSeek Harness.
The app stays in its own language (English); only conversation content
reflows: paragraphs that start with Persian render right-to-left,
English paragraphs stay left-to-right — and when your latest question
reads Persian, the whole flow follows it right-to-left.

## How

One owned effect injects a `<style>` into the document (removed on
disable/uninstall) and sets `dir="auto"` on every message block plus the
composer, kept up to date by a `MutationObserver` (also re-applies if the
editor framework drops the attribute):

- Each `p`/`li`/heading/`blockquote` under
  `[data-slot="conversation.chat.flow" | "conversation.chat.node"]`
  gets `dir="auto"` — direction follows its own first strong character
  (live-verified: Persian → `rtl`, English → `ltr`), with
  `text-align: start`.
- `pre`/`code` are pinned to `direction: ltr` so code never flips.
- The composer (`[data-composer-input]`) gets `dir="auto"` so typing in
  Persian aligns right while typing.
- Conversation mode: the last `[data-chat-flow-kind="user"]` turn decides.
  If it starts with Persian, the flow gets `data-dsh-chat-rtl="fa"` and
  every message block — English headings and trajectory step titles
  included — renders `rtl` (code still LTR). Otherwise each block keeps
  its own `dir="auto"`.

Only stable `data-*` hooks are used — no hashed class names — so it
survives app rebuilds. No locale service, no dictionaries, no global
`<html dir>` change. (An earlier CSS-only attempt with
`unicode-bidi: plaintext` was dropped: it does not resolve computed
`direction` in this Chromium; `dir="auto"` does.)

## Install for other developers

**Option A — from GitHub (works today):**

```powershell
pnpm add https://github.com/mehran282/dsh-chat-rtl/releases/download/v0.1.3/dsh-chat-rtl-0.1.3.tgz
```

or in the Harness: Settings → Built-in plugins → install external bundle →
pick the `.tgz`, enable `chat-rtl`, restart. Any git address or tarball the
plugin manager accepts works — see `INSTALL.md`.

**Option B — from npm (once published):** `pnpm add dsh-chat-rtl`,
or by registry name straight from the plugin manager.

## Status (v0.1.3)

- `node --check` clean; loader simulation green
  (`__ModuleLoader__.load` with id `dsh-chat-rtl`, `inject: []`).
- Disposal verified: style removed, observer disconnected.
- Live-verified in 0.2.2-rc.1 via CDP: app stays `lang="en"` with no
  `<html dir>`; real Persian paragraphs compute `rtl`, English `ltr`;
  newly arriving messages get `dir="auto"` through the observer;
  composer is `dir="auto"`; code blocks stay LTR.
