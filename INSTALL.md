# INSTALL — dsh-chat-rtl

## Pack

```powershell
cd D:\Workspace\DSH-ChatRtl
npm pack   # → dsh-chat-rtl-0.1.0.tgz
```

## Install (external bundle flow)

1. Harness → **Settings → Built-in plugins → install external bundle** →
   pick the tgz (or CLI: `pnpm add <tgz>` in the profile dir + append
   `dsh-chat-rtl` to `dsh.profile.bundles` in the profile `package.json`).
2. Enable `chat-rtl`, restart the Harness.

## Verify

- Open any chat with Persian + English messages: Persian paragraphs align
  right, English paragraphs align left, code blocks stay LTR.
- Type Persian in the composer: text aligns right as you type.
- App language is untouched (`<html lang="en">`, no `dir` attribute).

## Uninstall

Disable `chat-rtl` (or remove the bundle) and restart. The injected
`<style>` is removed and the observer disconnected — no residue.
