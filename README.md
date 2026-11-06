# Smart Revise Gimmick-style Bot — iPad Safari

This update uses the two files you uploaded and adds manual page-element selection.

## Publish
Upload `smartrevise-bot.js`, `index.html`, and this README to your repository root. In GitHub, open **Settings → Pages**, select the `main` branch and `/(root)`, then save.

## Safari bookmarklet
1. Open `smartrevise-bot.js` in GitHub and copy all its contents.
2. Create a Safari bookmark named `Smart Revise Bot`.
3. Edit its URL: place `javascript:` immediately before the complete JavaScript source, all on one line.
4. Open Smart Revise and tap the bookmark.
5. Use the new floating-panel controls to select the question, one answer button, and Next Question.

## Notes
Selections are saved in Safari local storage. Reset them if Smart Revise changes its layout. This prototype records DOM selectors rather than screen coordinates. It can only read/interact with page elements exposed to the page script; cross-origin frames and canvas-rendered content need a site-specific integration. It does not access passwords, cookies, or session tokens.
