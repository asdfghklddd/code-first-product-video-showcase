import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (["node_modules", "__pycache__"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
};

test("public source has no private-platform or machine-path references", async () => {
  const files = await walk(fileURLToPath(new URL("../src", import.meta.url)));
  const forbidden = [/worldquant/i, /phasebook/i, /C:\\Users\\/i, /\/Users\//i, /cookie/i, /token/i];
  for (const file of files) {
    const content = await readFile(file, "utf8");
    for (const pattern of forbidden) assert.equal(pattern.test(content), false, `${pattern} found in ${file}`);
  }
});

test("production scripts and studies contain no personal machine paths", async () => {
  for (const directory of ["scripts", "studies", "docs", "examples"]) {
    const files = await walk(fileURLToPath(new URL(`../${directory}`, import.meta.url)));
    for (const file of files.filter((path) => /\.(mjs|tsx?|py|md|json)$/.test(path))) {
      const content = await readFile(file, "utf8");
      assert.equal(/\/Users\/[^\s/]+\/|C:\\Users\\|wxid_/i.test(content), false, `Personal path found in ${file}`);
    }
  }
});

test("storyboard has four explicit scenes and no remote assets", async () => {
  const storyboard = await readFile(new URL("../src/data/storyboard.ts", import.meta.url), "utf8");
  assert.equal((storyboard.match(/id: "/g) ?? []).length, 4);
  assert.equal(/https?:\/\//.test(storyboard), false);
});

test("package is publishable and contains no remote scripts", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.private, false);
  assert.equal(Object.values(pkg.scripts).some((script) => /curl|wget|Invoke-WebRequest/i.test(script)), false);
});
