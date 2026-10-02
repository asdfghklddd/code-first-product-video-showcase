/**
 * 中文说明：把三种短片头及各自方案说明卡串接成对比片；依赖 render-motion 完整生成的 option 图片和三个成片。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {deliveryDir} from './lib/runtime.mjs';
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = deliveryDir('MotionOptions');
const compositor = join(project, "node_modules", `@remotion/compositor-${process.platform}-${process.arch}`);
const ffmpeg = join(compositor, process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
const run = args => execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", ...args], { env: { ...process.env, DYLD_LIBRARY_PATH: compositor } });
const files = [];
for (const [letter, seconds] of [["A", 6], ["B", 8], ["C", 10]]) {
  const card = join(destination, "Review", `option-${letter}-card.mp4`);
  // Match Remotion's 90 kHz MP4 time base before using the concat demuxer.
  run(["-loop", "1", "-framerate", "60", "-i", join(destination, `option-${letter}.png`), "-frames:v", "90", "-an", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-video_track_timescale", "90000", "-y", card]);
  files.push(card, join(destination, `Anchor-opening-${letter}-${seconds}s-silent.mp4`));
}
const concatFile = join(destination, "Review", "comparison.ffconcat");
await writeFile(concatFile, "ffconcat version 1.0\n" + files.map(file => `file '${file.replace(/'/g, "'\\''")}'\n`).join(""));
const output = join(destination, "Anchor-opening-ABC-comparison-silent.mp4");
run(["-f", "concat", "-safe", "0", "-i", concatFile, "-an", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "60", "-video_track_timescale", "90000", "-movflags", "+faststart", "-y", output]);
console.log(`Exported ${output}`);
