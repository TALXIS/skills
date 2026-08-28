#!/usr/bin/env node
// Static quality gates for the TALXIS plugin marketplace. Stdlib only.
// Run on every PR with no path filter — a broken check must never be skippable.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

// Agent Plugins 1.0 name rule; skill names additionally forbid dots.
const PLUGIN_NAME = /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const SKILL_NAME = /^(?!.*--)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const approxTokens = (s) => Math.ceil(s.length / 4);

// ── marketplace ──────────────────────────────────────────────────────────────
const marketplacePath = join(root, ".claude-plugin", "marketplace.json");
const marketplace = JSON.parse(readFileSync(marketplacePath, "utf8"));
if (!PLUGIN_NAME.test(marketplace.name)) err(marketplacePath, `invalid marketplace name '${marketplace.name}'`);
if (!marketplace.owner?.name) err(marketplacePath, "owner.name is required");
if ("version" in (marketplace.metadata ?? {})) err(marketplacePath, "version is single-sourced in plugin.json — remove metadata.version");

for (const entry of marketplace.plugins ?? []) {
  const mp = `${marketplacePath} (plugin '${entry.name}')`;
  if (typeof entry.source !== "string" || !entry.source.startsWith("./")) {
    err(mp, "source must be a relative './' path inside this repo");
    continue;
  }
  const dir = join(root, entry.source);
  if (!existsSync(dir)) { err(mp, `source '${entry.source}' does not exist`); continue; }
  if (basename(dir) !== entry.name) err(mp, `entry name '${entry.name}' must equal directory name '${basename(dir)}'`);
  if ("version" in entry) err(mp, "version is single-sourced in plugin.json — remove it from the marketplace entry");
  const manifest = JSON.parse(readFileSync(join(dir, "plugin.json"), "utf8"));
  if (manifest.name !== entry.name) err(mp, `plugin.json name '${manifest.name}' must equal marketplace entry name`);
}

// ── plugins ──────────────────────────────────────────────────────────────────
const pluginsDir = join(root, "plugins");
for (const name of readdirSync(pluginsDir).sort()) {
  const dir = join(pluginsDir, name);
  if (!statSync(dir).isDirectory()) continue;
  const manifestPath = join(dir, "plugin.json");
  const inMarketplace = (marketplace.plugins ?? []).some((p) => p.name === name);

  if (!existsSync(manifestPath)) {
    // Placeholder plugin: README only, must not be installable or listed.
    if (inMarketplace) err(dir, "listed in marketplace but has no plugin.json");
    if (!existsSync(join(dir, "README.md"))) err(dir, "placeholder plugin must have a README.md");
    continue;
  }
  if (!inMarketplace) err(dir, "has plugin.json but is not listed in .claude-plugin/marketplace.json");

  const m = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (m.$schema !== "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json")
    err(manifestPath, "plugin.json must declare the Agent Plugins 1.0 $schema");
  if (m.name !== name) err(manifestPath, `name '${m.name}' must equal directory name '${name}'`);
  if (!PLUGIN_NAME.test(m.name ?? "")) err(manifestPath, `invalid plugin name '${m.name}'`);
  if (!SEMVER.test(m.version ?? "")) err(manifestPath, `version '${m.version}' is not semver`);
  if (!m.description) err(manifestPath, "description is required");
  if ((m.description ?? "").length > 1024) err(manifestPath, "description exceeds 1024 chars");

  // ── skills ─────────────────────────────────────────────────────────────────
  const skillsDir = join(dir, "skills");
  if (!existsSync(skillsDir)) continue;
  for (const skillName of readdirSync(skillsDir).sort()) {
    const skillDir = join(skillsDir, skillName);
    if (!statSync(skillDir).isDirectory()) continue;
    const skillFile = join(skillDir, "SKILL.md");
    if (!readdirSync(skillDir).includes("SKILL.md")) { err(skillDir, "missing SKILL.md (exact case)"); continue; }

    const raw = readFileSync(skillFile, "utf8");
    const fm = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fm) { err(skillFile, "missing YAML frontmatter"); continue; }
    const [, front, body] = fm;

    // Frontmatter must stay trivially parseable: simple single-line `key: value` scalars.
    const fields = {};
    for (const line of front.split("\n")) {
      if (!line.trim()) continue;
      const kv = line.match(/^([a-z-]+):\s+(\S.*)$/);
      if (!kv) { err(skillFile, `frontmatter line not a simple 'key: value' scalar: '${line}'`); continue; }
      fields[kv[1]] = kv[2];
    }
    if (fields.name !== skillName) err(skillFile, `frontmatter name '${fields.name}' must equal directory name '${skillName}'`);
    if (!SKILL_NAME.test(skillName)) err(skillFile, `invalid skill name '${skillName}'`);
    if (!fields.description) err(skillFile, "description is required");
    else {
      if (fields.description.length > 1024) err(skillFile, "description exceeds 1024 chars");
      if (!/use when/i.test(fields.description)) err(skillFile, "description must contain a 'Use when …' routing hint");
    }
    if (approxTokens(front) > 200) err(skillFile, "frontmatter exceeds ~200 tokens");
    const bodyTokens = approxTokens(body);
    if (bodyTokens > 5000) err(skillFile, `body ~${bodyTokens} tokens exceeds the 5000-token budget — move detail to references/`);
    if (bodyTokens > 4000 && !existsSync(join(skillDir, "references")))
      err(skillFile, `body ~${bodyTokens} tokens (>4000) requires a references/ directory (progressive disclosure)`);
    if (/\$\{(?!PLUGIN_ROOT|PLUGIN_DATA)[A-Z_]+\}/.test(body))
      err(skillFile, "uses an undocumented ${...} token (allowed: PLUGIN_ROOT, PLUGIN_DATA)");
    if (/~\/\.(claude|copilot|cursor|codex|gemini)\b/.test(body))
      err(skillFile, "references a host-specific home path — skills must stay host-agnostic");
    if (/dotnet tool (install|update)|--version\b.*must succeed|Toolchain check/i.test(body))
      err(skillFile, "contains toolchain install/check prose — that's txc doctor's job (TOOLING-BACKLOG T1)");

    // Every reference file must justify its existence and name its removal condition.
    const refsDir = join(skillDir, "references");
    if (existsSync(refsDir)) {
      for (const refName of readdirSync(refsDir)) {
        const refFile = join(refsDir, refName);
        if (!refName.endsWith(".md") || !statSync(refFile).isFile()) continue;
        const ref = readFileSync(refFile, "utf8");
        if (!/^> \*\*Needed because:\*\*/m.test(ref) || !/^> \*\*Remove when:\*\*/m.test(ref))
          err(refFile, "missing the mandatory '> **Needed because:** … / > **Remove when:** …' header");
      }
    }
  }

  // README skill table must mention every skill directory.
  const readmePath = join(dir, "README.md");
  if (existsSync(readmePath) && existsSync(skillsDir)) {
    const readme = readFileSync(readmePath, "utf8");
    for (const skillName of readdirSync(skillsDir)) {
      if (statSync(join(skillsDir, skillName)).isDirectory() && !readme.includes(skillName))
        err(readmePath, `does not mention skill '${skillName}'`);
    }
  }
}

// ── agent ────────────────────────────────────────────────────────────────────
// Harness-behaviour config, fetched over HTTPS by TALXIS/tools-agentbox. Not a plugin, so it is
// checked here rather than by the plugins walk above — a box that can't read it fails to provision,
// which makes a typo in this directory everyone's problem.
const agentDir = join(root, "agent");
if (existsSync(agentDir)) {
  const instructionsPath = join(agentDir, "instructions.json");
  if (!existsSync(instructionsPath)) {
    err(agentDir, "agent/ must contain instructions.json");
  } else {
    const instructions = JSON.parse(readFileSync(instructionsPath, "utf8"));
    const declared = [];
    for (const key of ["systemPrompt", "initialMessage"]) {
      const name = instructions[key];
      if (name === undefined) continue;
      if (typeof name !== "string" || name.includes("/") || !name.endsWith(".md")) {
        err(instructionsPath, `${key} must be a plain .md filename inside agent/`);
        continue;
      }
      declared.push(name);
      if (!existsSync(join(agentDir, name)))
        err(instructionsPath, `${key} names '${name}', which does not exist in agent/`);
      else if (!readFileSync(join(agentDir, name), "utf8").trim())
        err(join(agentDir, name), "is empty — remove the key from instructions.json instead");
    }
    if (!declared.length) err(instructionsPath, "must declare at least one of systemPrompt, initialMessage");

    for (const name of readdirSync(agentDir).sort()) {
      if (!name.endsWith(".md") || name === "README.md" || declared.includes(name)) continue;
      err(join(agentDir, name), "not declared in agent/instructions.json — declare it or remove it");
    }

    // Same host-agnostic rule the skills carry: this text reaches every harness on every box.
    for (const name of declared) {
      const file = join(agentDir, name);
      if (!existsSync(file)) continue;
      const body = readFileSync(file, "utf8");
      if (/~\/\.(claude|copilot|cursor|codex|gemini)\b/.test(body))
        err(file, "references a host-specific home path — agent config must stay host-agnostic");
      if (/dotnet tool (install|update)|apt-get|npm install -g/.test(body))
        err(file, "contains toolchain install prose — that belongs to agentbox, not here");
    }
  }
}

if (errors.length) {
  console.error(`${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  ${e.replace(root + "/", "")}`);
  process.exit(1);
}
console.log("validation passed");
