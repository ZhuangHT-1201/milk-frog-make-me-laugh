import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(projectRoot, "src", "game.html");
const outputPath = path.join(projectRoot, "index.html");
const spritePath = path.join(projectRoot, "assets", "naifrog-spritesheet.webp");

const [source, sprite] = await Promise.all([
  readFile(sourcePath, "utf8"),
  stat(spritePath)
]);

if (/<!doctype|<html[\s>]/i.test(source)) {
  throw new Error("src/game.html must remain an embeddable HTML fragment.");
}

if (!source.includes('id="milk-frog-game"')) {
  throw new Error("The game root is missing.");
}

if (!sprite.isFile() || sprite.size < 10_000) {
  throw new Error("The Milk Frog sprite sheet is missing or incomplete.");
}

const localSprite = "./assets/naifrog-spritesheet.webp";
const game = source
  .replace(/--frog-sheet:\s*url\("[^"]+"\);/, `--frog-sheet: url("${localSprite}");`)
  .replace(/spriteProbe\.src\s*=\s*"[^"]+";/, `spriteProbe.src = "${localSprite}";`);

const baseStyles = `
:root {
  color-scheme: light dark;
  --background: #f4f1e9;
  --foreground: #181915;
  --card: rgba(255, 255, 255, .7);
  --card-foreground: #181915;
  --muted: #e8e5dc;
  --muted-foreground: #68695f;
  --primary: #171815;
  --primary-foreground: #fffdf6;
  --secondary: #ece9e0;
  --secondary-foreground: #20211d;
  --accent: #f4df87;
  --accent-foreground: #282418;
  --border: rgba(32, 33, 27, .15);
  --input: rgba(32, 33, 27, .12);
  --ring: #b89026;
  --yellow: #d6a928;
  --green: #5b8d55;
  --red: #c34f43;
}
@media (prefers-color-scheme: dark) {
  :root {
    --background: #151612;
    --foreground: #f5f1e5;
    --card: rgba(48, 46, 39, .78);
    --card-foreground: #f5f1e5;
    --muted: #2d2e28;
    --muted-foreground: #bdb9ad;
    --primary: #f5f1e5;
    --primary-foreground: #171815;
    --secondary: #31322b;
    --secondary-foreground: #f4efe2;
    --accent: #4f421d;
    --accent-foreground: #fff2bf;
    --border: rgba(255, 250, 232, .16);
    --input: rgba(255, 250, 232, .14);
    --ring: #f0c84d;
    --yellow: #e4b840;
    --green: #90c183;
    --red: #ee8b80;
  }
}
* { box-sizing: border-box; }
html { min-height: 100%; background: var(--background); }
body {
  min-height: 100%;
  margin: 0;
  color: var(--foreground);
  background:
    radial-gradient(circle at 12% 4%, color-mix(in srgb, var(--yellow) 16%, transparent), transparent 28rem),
    radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--green) 12%, transparent), transparent 24rem),
    var(--background);
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  line-height: 1.45;
}
button, a { -webkit-tap-highlight-color: transparent; }
.site-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: clamp(14px, 3vw, 30px);
}
.card {
  color: var(--card-foreground);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px;
}
.text-small { font-size: 12px; line-height: 1.4; }
.tabular-nums { font-variant-numeric: tabular-nums; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 42px;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--foreground);
  background: color-mix(in srgb, var(--card) 85%, transparent);
  font: inherit;
  cursor: pointer;
}
.btn:hover:not(:disabled) { background: var(--secondary); }
.btn:focus-visible { outline: 3px solid color-mix(in srgb, var(--ring) 45%, transparent); outline-offset: 2px; }
.btn:disabled { cursor: not-allowed; opacity: .42; }
.btn-primary { color: var(--primary-foreground); background: var(--primary); border-color: transparent; }
.btn-primary:hover:not(:disabled) { background: color-mix(in srgb, var(--primary) 88%, var(--foreground)); }
.btn-ghost { background: transparent; }
.btn-block { width: 100%; }
.progress {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--foreground) 10%, transparent);
}
.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: var(--primary);
}
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
.cursor-interaction { cursor: pointer; }
@media (pointer: coarse) {
  .btn { min-height: 44px; }
}
@media (max-width: 520px) {
  .site-shell { padding: 10px; }
  .card { padding: 12px; }
}
`;

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A chaotic 40-second Milk Frog prank game with eight blackmail photo forms.">
  <meta name="theme-color" content="#f4f1e9" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#151612" media="(prefers-color-scheme: dark)">
  <title>Milk Frog: Make Me Laugh!</title>
  <style>${baseStyles}</style>
</head>
<body>
  <main class="site-shell">
    ${game}
  </main>
  <noscript>This game requires JavaScript.</noscript>
</body>
</html>
`;

await writeFile(outputPath, html, "utf8");
console.log(`Built ${path.relative(projectRoot, outputPath)} (${Buffer.byteLength(html)} bytes).`);
