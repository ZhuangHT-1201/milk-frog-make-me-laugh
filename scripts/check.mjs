import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(path.join(projectRoot, "src", "game.html"), "utf8");
const built = await readFile(path.join(projectRoot, "index.html"), "utf8");
const sprite = await stat(path.join(projectRoot, "assets", "naifrog-spritesheet.webp"));

const requiredMarkers = [
  'id="milk-frog-game"',
  'id="frog-gallery-grid"',
  'id="frog-photo-viewer"',
  "const PHOTO_FORMS = [",
  "const EVENTS = [",
  "function capturePhoto()",
  "function triggerFrenzy()",
  '"naifrog:run-complete"'
];

for (const marker of requiredMarkers) {
  if (!source.includes(marker)) throw new Error(`Missing source marker: ${marker}`);
}

const hostApi = ["window", "openai"].join(".");
const forbiddenBrand = ["co", "dex"].join("");

if (source.includes(hostApi)) {
  throw new Error("Host-specific editor APIs must not be present in the open-source build.");
}

if (source.toLowerCase().includes(forbiddenBrand) || built.toLowerCase().includes(forbiddenBrand)) {
  throw new Error("The open-source project should not contain host-specific branding or collaborator names.");
}

if (!built.includes("./assets/naifrog-spritesheet.webp")) {
  throw new Error("The built page does not reference the local sprite sheet.");
}

if (!built.includes("<!doctype html>") || !built.includes("</html>")) {
  throw new Error("index.html is not a complete document.");
}

const scripts = [...built.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
if (!scripts.length) throw new Error("No inline game script found.");
scripts.forEach((script, index) => new vm.Script(script, { filename: `inline-script-${index + 1}.js` }));

if (sprite.size < 10_000) throw new Error("Sprite asset is missing or incomplete.");

console.log(`Checks passed: ${scripts.length} script, ${requiredMarkers.length} markers, ${sprite.size} byte sprite.`);
