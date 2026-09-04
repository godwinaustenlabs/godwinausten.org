"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The morphing lattice — ported from the animation on the live godwinausten.org.
 *
 * Twenty-seven nodes on a 3×3×3 grid, moving through four states while the
 * section's heading is pinned:
 *
 *   stacked dots  →  cube  →  turning dish  →  network
 *
 * **There is one state per card, and that is the whole timing rule.** The
 * network was in the owner's original and was cut when this sat beside three
 * cards: a fourth state meant one phase had no card to land on, and the dish —
 * the only phase that keeps moving after it arrives — made the better last
 * frame. There are four offerings now, so the network is back and the stops are
 * evenly spaced again. If the count changes, `STOPS` changes with it; a lattice
 * that finishes before the cards do, or after, reads as a stutter.
 *
 * The maths is the owner's, taken from the `ecoCanvas` routine on the live site
 * and kept intact: the same grid, the same per-phase targets, the same
 * projection, the same edge-distance rule. What changed is the driver and the
 * palette. The original ran on a GSAP ScrollTrigger timeline; this reads the
 * element's own position instead, so it works on both the horizontal filmstrip
 * and the vertical routes without a dependency. Colours come from the site's
 * tokens rather than the old yellow.
 *
 * ## Cost
 *
 * One canvas, one rAF loop, and it only runs while the element is on screen —
 * an `IntersectionObserver` parks it otherwise. 27 nodes means at most 351 edge
 * tests a frame, which is nothing; the expensive version of this effect is the
 * one that draws a thousand particles.
 *
 * Under `prefers-reduced-motion` it draws a single static frame at the cube
 * phase and stops.
 */

/** Node count and grid extent, from the original. */
const NODES = 27;

interface Stop {
  /** How far through the section this state is reached, 0→1. */
  at: number;
  morph: number;
  rotation: number;
  intensity: number;
  scale: number;
}

/**
 * The scroll stops, one per card, spread evenly across the pin.
 *
 * `at` is where in the pin each state is fully arrived, and it matches where
 * the cards land: the stack beside this travels `(count - 1) × -100%` over the
 * same 0→1, so card *n* is centred at `n / (count - 1)`. Four cards, four
 * stops, thirds — the lattice reaches each shape exactly as the offering it
 * belongs to arrives, and the last one lands rather than passing.
 *
 * `morph` is the shape axis and runs the full 0→1 across the four states, so
 * each blend below owns a third of it.
 */
const STOPS: Stop[] = [
  { at: 0, morph: 0, rotation: 0, intensity: 0, scale: 0.8 },
  { at: 1 / 3, morph: 1 / 3, rotation: Math.PI * 0.5, intensity: 0.4, scale: 1.02 },
  { at: 2 / 3, morph: 2 / 3, rotation: Math.PI * 1.25, intensity: 0.7, scale: 1.1 },
  { at: 1, morph: 1, rotation: Math.PI * 2, intensity: 0.9, scale: 1.06 },
];

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Linear interpolation across the stop table. */
function stateAt(progress: number) {
  let lower = STOPS[0]!;
  let upper = STOPS[STOPS.length - 1]!;

  for (let i = 0; i < STOPS.length - 1; i += 1) {
    if (progress >= STOPS[i]!.at && progress <= STOPS[i + 1]!.at) {
      lower = STOPS[i]!;
      upper = STOPS[i + 1]!;
      break;
    }
  }

  const span = upper.at - lower.at || 1;
  const t = clamp01((progress - lower.at) / span);
  return {
    morph: lower.morph + (upper.morph - lower.morph) * t,
    rotation: lower.rotation + (upper.rotation - lower.rotation) * t,
    intensity: lower.intensity + (upper.intensity - lower.intensity) * t,
    scale: lower.scale + (upper.scale - lower.scale) * t,
  };
}

export function ScrollMorph({
  className,
  drive = "pin",
}: {
  className?: string;
  /**
   * What moves the morph.
   *
   * `"pin"` reads the section's travel while its head is stuck, which is the
   * services block and the reason this component exists. `"viewport"` reads the
   * element's own crossing of the screen instead, for a section that does not
   * pin at all — the pin driver returns a flat 0 there, so the lattice would sit
   * on its first frame forever and read as a broken canvas rather than a still
   * one.
   */
  drive?: "pin" | "viewport";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const nodes = Array.from({ length: NODES }, (_, i) => ({
      id: i,
      gridX: (i % 3) - 1,
      gridY: (Math.floor(i / 3) % 3) - 1,
      gridZ: Math.floor(i / 9) - 1,
    }));

    let width = 0;
    let height = 0;
    let frame = 0;
    let ticks = 0;
    let running = false;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      context!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /**
     * Progress across the section's **pin**, 0→1.
     *
     * Not the element's crossing of the viewport. The lattice lives inside a
     * head that sticks to the leading edge while the rest of the section
     * travels past it, and the whole point is to see every phase while it is
     * stuck: so the first frame is the moment the head catches, and the last is
     * the moment it lets go. Driving it off the viewport instead meant most of
     * the morph happened before the pin engaged and the final phase never
     * arrived on screen at all.
     *
     * This is the same quantity `BlockFrame` publishes as `--block-lead`,
     * recomputed here rather than parsed out of a custom property — reading a
     * resolved style every frame forces a recalc, and one `getBoundingClientRect`
     * does not.
     */
    function progress() {
      const section = canvas!.closest("[data-block]");
      if (!section) return 0;

      const rect = section.getBoundingClientRect();
      const horizontal = document.documentElement.dataset.scrollMode === "strip";
      const [start, extent, span] = horizontal
        ? [rect.left, rect.width, window.innerWidth]
        : [rect.top, rect.height, window.innerHeight];

      if (drive === "viewport") {
        /*
         * The element's own crossing, 0 as its leading edge reaches the far
         * side of the screen and 1 as its trailing edge leaves the near side.
         * The span is added at both ends so a panel that is exactly one screen
         * has travel rather than a single value.
         */
        const total = extent + span;
        if (total <= 0) return 0;
        return clamp01((span - start) / total);
      }

      // How far the section can travel while its head stays pinned.
      const travel = extent - span;
      if (travel <= 0) return 0;
      return clamp01(-start / travel);
    }

    function draw() {
      frame = 0;
      const { morph, rotation, intensity, scale } = stateAt(progress());
      const cx = width / 2;
      const cy = height / 2;
      const unit = 0.35 * Math.min(width, height) * scale;

      context!.clearRect(0, 0, width, height);
      ticks += 1;

      const tilt = 0.2 * rotation;
      const spin = rotation;

      const points = nodes.map((node) => {
        // Three blends, each owning a third of `morph` and each starting where
        // the one before it finished: dots→cube, cube→dish, dish→network.
        const toCube = clamp01(morph * 3);
        const toDish = clamp01(morph * 3 - 1);
        const toNet = clamp01(morph * 3 - 2);

        // Phase 0: a single column of dots stacked on the Y axis.
        const stackedY = 0.8 * node.gridY;

        let x = 0 * (1 - toCube) + node.gridX * toCube;
        let y = stackedY * (1 - toCube) + node.gridY * toCube;
        let z = 0 * (1 - toCube) + node.gridZ * toCube;

        if (toDish > 0) {
          // A slowly travelling Lissajous ring, and the one phase that keeps
          // moving after it arrives.
          const phase = 0.015 * ticks + 0.4 * node.id;
          x = x * (1 - toDish) + 0.85 * Math.cos(phase) * toDish;
          y = y * (1 - toDish) + 0.85 * Math.sin(0.5 * phase) * toDish;
          z = z * (1 - toDish) + 0.85 * Math.sin(phase) * toDish;
        }

        if (toNet > 0) {
          /*
           * The last phase: the ring opening out into a loose network.
           *
           * Deterministic per node rather than random — the same node has to go
           * to the same place on every frame or the whole thing boils. It also
           * breathes, on a slower and differently-phased wobble than the dish,
           * so arriving here does not look like stopping.
           */
          const seed = node.id * 2.399963;
          const drift = 0.008 * ticks;
          const nx = Math.cos(seed) * (1.05 + 0.16 * Math.sin(drift + seed));
          const ny = Math.sin(seed * 1.7) * (0.95 + 0.16 * Math.cos(drift + seed * 0.5));
          const nz = Math.cos(seed * 2.3) * (1.0 + 0.16 * Math.sin(drift * 0.7 + seed));
          x = x * (1 - toNet) + nx * toNet;
          y = y * (1 - toNet) + ny * toNet;
          z = z * (1 - toNet) + nz * toNet;
        }

        // Rotate about Y, then about X, then project.
        const cosSpin = Math.cos(spin);
        const sinSpin = Math.sin(spin);
        const rx = x * cosSpin - z * sinSpin;
        const rz = x * sinSpin + z * cosSpin;

        const cosTilt = Math.cos(tilt);
        const sinTilt = Math.sin(tilt);
        const ry = y * cosTilt - rz * sinTilt;
        const depth = y * sinTilt + rz * cosTilt;

        const perspective = 3 / (3 + depth);
        const radial = Math.sqrt(x * x + y * y + z * z);
        const opacity = Math.max(0, 1 - Math.pow(radial / 1.3, 4));

        return {
          sx: cx + rx * unit * perspective,
          sy: cy + ry * unit * perspective,
          depth,
          x,
          y,
          z,
          opacity,
        };
      });

      // Edges, by distance in model space rather than on screen — so the mesh
      // holds its shape as the whole thing turns. The original narrowed this
      // for its scatter phase; with that phase gone it is a constant.
      const reach = 1.1;
      const ink = getComputedStyle(canvas!).color;

      context!.beginPath();
      context!.strokeStyle = ink;
      context!.lineWidth = 1;

      for (let i = 0; i < points.length; i += 1) {
        const a = points[i]!;
        if (a.opacity <= 0.1) continue;
        for (let j = i + 1; j < points.length; j += 1) {
          const b = points[j]!;
          if (b.opacity <= 0.1) continue;
          const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
          if (d2 >= reach * reach) continue;
          context!.moveTo(a.sx, a.sy);
          context!.lineTo(b.sx, b.sy);
        }
      }

      context!.globalAlpha = 0.15 + 0.35 * intensity;
      context!.stroke();

      for (const point of points) {
        if (point.opacity <= 0.1) continue;
        context!.globalAlpha = point.opacity * (0.6 + 0.4 * intensity);
        context!.fillStyle = ink;
        context!.beginPath();
        context!.arc(point.sx, point.sy, Math.max(0.1, 2.6 * (1.4 - point.depth)), 0, Math.PI * 2);
        context!.fill();
      }

      context!.globalAlpha = 1;
      if (running) frame = requestAnimationFrame(draw);
    }

    function play() {
      if (running || reduce.matches) return;
      running = true;
      frame = requestAnimationFrame(draw);
    }

    function pause() {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }

    resize();
    if (reduce.matches) draw();
    else play();

    // Off-screen is off. On the filmstrip this leaves the viewport as the page
    // travels, and a canvas animating behind four other panels is waste.
    const visibility = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? play() : pause()),
      { threshold: 0.01 },
    );
    visibility.observe(canvas);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduce.matches) draw();
    });
    resizeObserver.observe(canvas);

    return () => {
      pause();
      visibility.disconnect();
      resizeObserver.disconnect();
    };
  }, [drive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none block size-full text-ink", className)}
    />
  );
}
