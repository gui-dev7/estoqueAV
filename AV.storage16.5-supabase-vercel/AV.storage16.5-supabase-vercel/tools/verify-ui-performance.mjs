import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
const script = readFileSync("dist/app_script.js", "utf8");

const assertIncludes = (source, expected, label) => {
  assert.ok(source.includes(expected), `${label}: expected to find ${expected}`);
};

assertIncludes(html, "--av-amber", "theme tokens");
assertIncludes(html, "--av-magenta", "theme tokens");
assertIncludes(html, "--av-bg", "theme tokens");
assertIncludes(html, "--av-surface", "theme tokens");
assertIncludes(html, "--av-card", "theme tokens");
assertIncludes(html, "html.dark", "dark theme tokens");
assertIncludes(html, "background: var(--av-bg)", "continuous page/grid base");
assertIncludes(html, "ambient-sheen", "premium ambient effect");
assertIncludes(html, "soft-glow", "premium glow effect");
assertIncludes(html, "surface-card", "floating card surfaces");
assert.ok(/\.surface-unified\s*\{[^}]*background:\s*var\(--av-bg\)/s.test(html), "unified surfaces should match the page/grid base");
assert.ok(/\.surface-card\s*\{[^}]*background:\s*var\(--av-card\)/s.test(html), "cards should float on their own surface token");
assert.ok(!/#main-content\s*\{[^}]*background-image/s.test(html), "main content must not use a grid background");
assert.ok(!html.includes(".room-card::before"), "room cards must not use the rejected lateral fade stripe");
assertIncludes(html, 'id="infra-toolbar"', "infra toolbar");
assertIncludes(html, 'id="infra-content"', "infra content");
assertIncludes(html, "shell-header", "seamless shell header");
assertIncludes(html, "shell-nav", "seamless nav");

assertIncludes(script, "initInfraAutoToolbar", "infra scroll auto hide");
assertIncludes(script, "setInfraToolbarCollapsed", "infra scroll auto hide");
assertIncludes(script, "scheduleInfraRender", "infra render debounce");
assertIncludes(script, "surface-card", "infra cards should use floating surfaces");
assertIncludes(script, "soft-glow", "infra cards should use soft glow");
assert.ok(!script.includes("surface-unified soft-glow room-card"), "room cards should float above the shared base");
assert.ok(!/new\s+MutationObserver/.test(script), "icon refresh must not observe the whole document");
assert.ok(!/setTimeout\(\(\)\s*=>\s*\{\s*try\s*\{\s*lucide\.createIcons/s.test(script), "icon refresh must not double-run with delayed createIcons");

const pollMatch = script.match(/const\s+REMOTE_POLL_INTERVAL_MS\s*=\s*(\d+)/);
assert.ok(pollMatch, "remote poll interval must be declared");
assert.ok(Number(pollMatch[1]) >= 3000, "remote poll interval should be at least 3000ms");

const qualityMetaMatch = script.match(/const QUALITY_META = \{[\s\S]*?\n            \};/);
assert.ok(qualityMetaMatch, "quality metadata block must exist");
const qualityMeta = qualityMetaMatch[0];
assert.ok(qualityMeta.includes("fuchsia"), "quality metadata should use magenta/fuchsia accents");
assert.ok(!/green-|red-/.test(qualityMeta), "quality metadata should avoid green/red in room status colors");

console.log("UI/performance checks passed.");
