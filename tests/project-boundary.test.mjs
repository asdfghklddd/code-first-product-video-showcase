import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
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
