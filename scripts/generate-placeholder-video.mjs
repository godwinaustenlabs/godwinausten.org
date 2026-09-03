#!/usr/bin/env node
/**
 * Generates the stand-in film every empty video slot plays until a real cut
 * is in R2 — the VSL panel and the case-study reel both point at this one file.
 *
 * ## Why there is a file here at all
 *
 * There used to be no `.mp4` in this repo on purpose: the panel ran the drawn
 * `PlaceholderReel` instead, on the grounds that there was no encoder on the
 * build machine and a stock clip would put someone else's footage on the page
 * (docs/adr/0003-no-third-party-imagery-shipped.md).
 *
 * The drawn reel is a good picture and a bad *player*. `FilmFrame`'s transport —
 * play/pause, ±5s, the scrubber, the clock, sound — is disabled wholesale
 * without a `src`, so the one control-heavy component on the funnel could not be
 * used, demonstrated, or tested against anything. The owner asked for a real
 * film in the slot; this is it, and it is still generated here rather than
 * sourced from anywhere, so ADR 0003 holds.
 *
 * ## Where the encoder came from
 *
 * Playwright is already a devDependency and its bundled Chromium supports
 * `video/mp4;codecs=avc1` in `MediaRecorder`. So the encoder is one we already
 * ship for the e2e suite: a canvas draws the frames, `captureStream()` feeds
 * them to Chromium's H.264 encoder, and the bytes come back over the CDP
 * bridge. No ffmpeg, no wasm codec, no new package.
 *
 * ## What it draws, and why a timecode
 *
 * A burnt-in timecode and frame counter are not decoration. They are how anyone
 * — a person or an e2e test — can see that the scrubber actually seeks and that
 * ±5s moves five seconds: the number on the screen has to agree with the number
 * under the transport. A pretty loop with no clock in it proves nothing.
 *
 * The rest is the site's own language: ink ground, `--color-signal` accent, mono
 * labels, and the same orbit motif the tiles use. It says plainly that it is a
 * placeholder, because a stand-in that pretends to be the product is how a
 * placeholder ends up shipped.
 *
 * ## Not byte-reproducible
 *
 * Unlike the other generators here, running this twice does not produce
 * identical bytes: the capture is real time and a video encoder's rate control
 * is not deterministic across runs. Regenerate it when the design changes, not
 * routinely, and expect the diff.
 *
 *   npm run gen:placeholder-video
 *
 * Output: public/assets/film-placeholder.mp4
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/assets/film-placeholder.mp4");
const ORBIT = resolve(ROOT, "public/assets/tiles/orbit.svg");

/** 720p is the largest the panel ever shows it, and the content is flat. */
const W = 1280;
const H = 720;
const FPS = 25;
/**
 * Long enough that ±5s and the scrubber have somewhere to go, short enough that
 * the file stays a placeholder. Twenty seconds is four skips end to end.
 */
const SECONDS = 20;
/** Flat vector-ish frames are cheap; this lands around a megabyte. */
const BITRATE = 500_000;

const PAPER = "#f6f5f1";
const INK = "#0e0e0c";
const SOFT = "#6e6d66";
const SIGNAL = "#c6ff3e";

/**
 * The page that does the drawing.
 *
 * It runs inside Chromium, so it is a string rather than an import — and it is
 * the whole recorder: draw a frame per `requestAnimationFrame` against a real
 * clock, let `captureStream` pull them, and resolve with the encoded bytes.
 */
function recorderPage({ w, h, fps, seconds, bitrate, orbit, paper, ink, soft, signal }) {
  return `<!doctype html>
<meta charset="utf-8">
<style>html,body{margin:0;background:${ink}}canvas{display:block}</style>
<canvas id="c" width="${w}" height="${h}"></canvas>
<script>
const W = ${w}, H = ${h}, FPS = ${fps}, SECONDS = ${seconds};
const PAPER = ${JSON.stringify(paper)}, INK = ${JSON.stringify(ink)};
const SOFT = ${JSON.stringify(soft)}, SIGNAL = ${JSON.stringify(signal)};
const MONO = 'ui-monospace, Menlo, Consolas, monospace';
const SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif';

const orbit = new Image();
orbit.src = ${JSON.stringify(orbit)};

/** \`m:ss\`, the same shape the transport prints under the film. */
function clock(t) {
  const whole = Math.floor(t);
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
}

/** Mono, uppercase, letter-spaced — the site's \`Label\`, on a canvas. */
function label(ctx, text, x, y, size, colour, align) {
  ctx.save();
  ctx.font = size + 'px ' + MONO;
  ctx.fillStyle = colour;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'alphabetic';
  const chars = text.toUpperCase().split('');
  const track = size * 0.16;
  const width = chars.reduce((sum, ch) => sum + ctx.measureText(ch).width + track, -track);
  let cursor = align === 'right' ? x - width : align === 'center' ? x - width / 2 : x;
  ctx.textAlign = 'left';
  for (const ch of chars) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + track;
  }
  ctx.restore();
}

function frame(ctx, t) {
  const p = t / SECONDS;

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  // The orbit motif, turning. Same drawing as the tiles, at reel scale.
  if (orbit.complete && orbit.naturalWidth) {
    const size = H * 0.78;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.translate(W / 2, H / 2);
    ctx.rotate(t * 0.06);
    ctx.drawImage(orbit, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  // A sweep of light crossing the frame, so it is never perfectly still.
  const sweepX = ((t / 6) % 1) * (W * 1.6) - W * 0.3;
  const sweep = ctx.createLinearGradient(sweepX, 0, sweepX + W * 0.3, 0);
  sweep.addColorStop(0, 'rgba(246,245,241,0)');
  sweep.addColorStop(0.5, 'rgba(246,245,241,0.07)');
  sweep.addColorStop(1, 'rgba(246,245,241,0)');
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, W, H);

  label(ctx, 'Godwin Austen Labs', 48, 64, 17, PAPER, 'left');
  label(ctx, 'Placeholder \\u2014 no film uploaded yet', W - 48, 64, 17, SIGNAL, 'right');

  /*
   * The clock, centred and enormous.
   *
   * This is the instrument: scrub, or press \\u00b15s, and this number has to
   * agree with the transport's. It is the whole reason the stand-in is a video
   * rather than a still.
   */
  ctx.save();
  ctx.font = '600 ' + Math.round(H * 0.26) + 'px ' + MONO;
  ctx.fillStyle = PAPER;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(clock(t), W / 2, H / 2 - H * 0.02);
  ctx.restore();

  label(
    ctx,
    'frame ' + String(Math.round(t * FPS)).padStart(4, '0') + ' of ' + SECONDS * FPS,
    W / 2,
    H / 2 + H * 0.14,
    18,
    SOFT,
    'center',
  );

  // The line the real cut replaces. Sans, so it reads as copy, not as chrome.
  ctx.save();
  ctx.font = '500 26px ' + SANS;
  ctx.fillStyle = SOFT;
  ctx.textAlign = 'center';
  ctx.fillText('The demo reel goes here.', W / 2, H - 132);
  ctx.restore();

  // Progress, in signal. Matches the scrubber underneath it exactly.
  const barX = 48, barY = H - 72, barW = W - 96;
  ctx.fillStyle = 'rgba(246,245,241,0.2)';
  ctx.fillRect(barX, barY, barW, 2);
  ctx.fillStyle = SIGNAL;
  ctx.fillRect(barX, barY, barW * p, 2);

  label(ctx, 'Demo reel', barX, barY + 34, 16, PAPER, 'left');
  label(ctx, clock(t) + ' / ' + clock(SECONDS), W - 48, barY + 34, 16, PAPER, 'right');
}

window.record = () => new Promise((done, fail) => {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const stream = canvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/mp4;codecs=avc1',
    videoBitsPerSecond: ${bitrate},
  });

  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  recorder.onerror = (e) => fail(new Error('MediaRecorder: ' + e.error));
  recorder.onstop = async () => {
    const buffer = await new Blob(chunks, { type: 'video/mp4' }).arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    done(btoa(binary));
  };

  frame(ctx, 0);
  recorder.start();
  const started = performance.now();

  (function step() {
    const t = (performance.now() - started) / 1000;
    if (t >= SECONDS) {
      /*
       * Land on the final frame, then hold it for a beat before stopping.
       *
       * The hold is what makes the two clocks agree. Both this film and the
       * transport floor their seconds, so stopping the instant the drawing
       * reaches 20.0 writes a container duration a hair under it and the
       * transport prints \u201c0:19\u201d beside a film captioned \u201c0:20\u201d \u2014 a
       * one-second argument between the only two numbers a placeholder exists
       * to line up.
       */
      frame(ctx, SECONDS);
      setTimeout(() => recorder.stop(), 500);
      return;
    }
    frame(ctx, t);
    requestAnimationFrame(step);
  })();
});
</script>`;
}

async function main() {
  // Inlined as a data URI: the page is generated, so there is no server to
  // serve it from and no temp file to clean up afterwards.
  const orbit = `data:image/svg+xml;base64,${(await readFile(ORBIT)).toString("base64")}`;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    await page.setContent(
      recorderPage({
        w: W,
        h: H,
        fps: FPS,
        seconds: SECONDS,
        bitrate: BITRATE,
        orbit,
        paper: PAPER,
        ink: INK,
        soft: SOFT,
        signal: SIGNAL,
      }),
    );

    process.stdout.write(`Recording ${SECONDS}s at ${W}x${H}, ${FPS}fps…\n`);
    const base64 = await page.evaluate(() => window.record(), null, {
      timeout: (SECONDS + 30) * 1000,
    });

    const bytes = Buffer.from(base64, "base64");
    if (bytes.length < 1024) throw new Error(`Encoder returned ${bytes.length} bytes`);
    // `ftyp` is the first box of every ISO base media file. If Chromium handed
    // back a WebM because the mp4 mime was quietly ignored, this catches it here
    // rather than as a silent no-play in Safari.
    if (bytes.subarray(4, 8).toString("latin1") !== "ftyp") {
      throw new Error("Encoder did not return an MP4 (no ftyp box)");
    }

    await mkdir(dirname(OUT), { recursive: true });
    await writeFile(OUT, bytes);
    process.stdout.write(`Wrote ${OUT} (${(bytes.length / 1024).toFixed(0)} KB)\n`);
  } finally {
    await browser.close();
  }
}

await main();
