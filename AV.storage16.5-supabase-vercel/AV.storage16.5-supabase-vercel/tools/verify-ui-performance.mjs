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
assertIncludes(html, "--av-bg: #000000", "dark neutral background should be canonical black");
assert.ok(!html.includes("bg-[#050509]"), "loader should not use a separate near-black background");
assert.ok(!html.includes("dark:bg-[#09090b]"), "login should not use a separate near-black background");
assertIncludes(html, "--av-bg-soft: var(--av-bg)", "soft background should not create visible bands");
assertIncludes(html, "--av-panel: var(--av-bg)", "panels should share the same neutral base");
assertIncludes(html, "--av-surface: var(--av-bg)", "surfaces should share the same neutral base");
assertIncludes(html, "--av-card: var(--av-bg)", "cards should share the same neutral base");
assertIncludes(html, "gsap.min.js", "GSAP loader dependency");
assertIncludes(html, "loader-coin", "AV coin loader markup");
assertIncludes(html, "loader-av", "AV coin loader type");
assertIncludes(html, "initAvCoinLoader", "AV coin loader initializer");
assertIncludes(html, "gsap.to", "GSAP coin animation");
assertIncludes(html, "quality-state-good", "green quality status styles");
assertIncludes(html, "quality-state-replace", "red quality status styles");
assertIncludes(html, "html.dark", "dark theme tokens");
assertIncludes(html, "background: var(--av-bg)", "continuous page/grid base");
assertIncludes(html, "ambient-sheen", "premium ambient effect");
assertIncludes(html, "soft-glow", "premium glow effect");
assertIncludes(html, "surface-card", "floating card surfaces");
assert.ok(/\.surface-unified\s*\{[^}]*background:\s*var\(--av-bg\)/s.test(html), "unified surfaces should match the page/grid base");
assert.ok(/\.surface-card\s*\{[^}]*background:\s*var\(--av-card\)/s.test(html), "cards should use the unified card token");
assertIncludes(html, ".neutral-bg-sync", "main content neutral divs should be synchronized");
assertIncludes(html, "solid-neutral-system", "whole app should synchronize neutral backgrounds");
assertIncludes(html, 'id="app-view" class="solid-neutral-system', "app shell should use the neutral color system");
assertIncludes(html, '.solid-neutral-system :is([class*="bg-white"]', "neutral Tailwind bg classes should be normalized");
assert.ok(/#main-content\s*\{[^}]*background:\s*var\(--av-bg\)/s.test(html), "main content should use a single flat background");
assert.ok(!html.includes("background: linear-gradient(180deg, var(--av-bg)"), "main content should not use a banding gradient");
assert.ok(!/#main-content\s*\{[^}]*background-image/s.test(html), "main content must not use a grid background");
assert.ok(!html.includes(".room-card::before"), "room cards must not use the rejected lateral fade stripe");
assertIncludes(html, 'id="infra-toolbar"', "infra toolbar");
assertIncludes(html, 'id="infra-content"', "infra content");
assertIncludes(html, "brand-favicon", "header should use favicon as brand mark");
assertIncludes(html, 'src="./favicon.svg"', "header should reuse browser favicon");
assert.ok(!html.includes('data-lucide="layers"'), "header should not use the old layers icon as logo");
assertIncludes(html, ">Estoque<", "brand name should be Estoque");
assertIncludes(html, ">Audiovisual<", "brand subtitle should be Audiovisual");
assert.ok(!html.includes(">AV.Storage<"), "visible brand name should not remain AV.Storage");
assert.ok(!html.includes(">Enterprise<"), "visible brand subtitle should not remain Enterprise");
assert.ok(!html.includes(".nav-btn::after"), "nav hover should not use the rejected white line pseudo-element");
assert.ok(!html.includes("rgba(255, 255, 255, 0.7)"), "nav hover should not render the old white line");
assertIncludes(html, ".nav-btn:hover::before", "nav hover should use the new soft glow effect");
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
assert.ok(qualityMeta.includes("green-"), "quality metadata should keep green status colors");
assert.ok(qualityMeta.includes("red-"), "quality metadata should keep red status colors");

assertIncludes(script, "QUALITY_BUTTON_ACTIVE_CLASSES", "quality buttons should use centralized active status colors");
assertIncludes(script, "quality-state-good", "good quality button should be green");
assertIncludes(script, "quality-state-replace", "replace quality button should be red");
assertIncludes(script, "getDashboardHealthColors", "dashboard health colors should be explicit");
assertIncludes(script, "#22c55e", "healthy dashboard chart should render green");
assert.ok(!script.includes("#09090b"), "charts should not use a separate near-black fill");

console.log("UI/performance checks passed.");
