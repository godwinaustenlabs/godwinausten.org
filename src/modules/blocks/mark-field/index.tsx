import { SiteLink } from "@/modules";
import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { NextCell } from "@/components/ui/Cell";
import type { MarkFieldProps } from "./block.config";

/**
 * Labs — the half of the company with no revenue target.
 *
 * A breath between the film and the ask. It sits *after* the VSL on purpose: it
 * is the one panel not selling anything, and in front of the opt-in that would
 * be a distraction from the page's only conversion. Behind it, it is the reason
 * to believe the rest.
 *
 * ## What is on it
 *
 * The claim, the paragraph, and one line about hiring over an address. Nothing
 * else — no form, no careers page. There is no pipeline behind this and building
 * a fake one would be the first dishonest thing on the site.
 *
 * ## The watermark
 *
 * A lit cloth simulation used to fill this panel: a fragment shader with the
 * logomark pressed up from under it and a blob of accent you dragged around. It
 * was the most technically interesting thing on the site and it was doing the
 * least work — a texture behind a paragraph, costing a WebGL context, a shader
 * compile and a render loop on the one section with nothing to sell.
 *
 * What replaces it is a watermark: the studio's actual motto, set diagonally
 * across the panel, roughened at the edges and dropped to a tenth of ink so it
 * sits *under* the copy rather than competing with it. It is inline SVG rather
 * than a file because that is the only way it gets the site's own display face —
 * an external SVG cannot reach the page's fonts — and the roughness is a
 * turbulence filter rather than a drawing, so there is nothing to download.
 */
export default function MarkField({
  index,
  eyebrow,
  headline,
  body,
  note,
  apply,
  next,
}: MarkFieldProps) {
  return (
    <Panel width={1} className="grid-rows-[auto_1fr_auto]">
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
        <Label tone="ink" className="opacity-40">
          {index}
        </Label>
        <Label>{eyebrow}</Label>
      </div>

      <div className="cell relative overflow-hidden">
        {/*
          Copy left, print right — and the print is a layer on the panel, not a
          cell in a grid beside it.

          The watermark ran corner to corner first, with the heading in one free
          corner and the paragraph in the other. It read as two sets of the same
          words fighting for the same space: the eye could not tell which layer
          it was meant to be on, and the right-aligned paragraph made it worse by
          following the diagonal instead of resisting it. Given its own side, it
          stops competing.

          It is positioned rather than laid out because the ink has to reach the
          panel's edges. As a grid column it inherited the row's vertical
          padding, and the bands — drawn long precisely so they never end on
          screen — were cut off square with paper still showing above and below
          the cut, which is the one thing a print does not do.
        */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] overflow-hidden md:block">
          <Watermark />
        </div>

        <div className="relative flex h-full items-center px-gutter py-[clamp(1.75rem,5vh,3.5rem)]">
          <div className="max-w-[42ch] md:max-w-[48%]">
            <h2 className="font-display text-[clamp(2.4rem,4.8vw,4.75rem)] leading-[0.92] font-bold text-ink">
              {headline}
            </h2>
            <p className="mt-6 font-sans text-lg leading-relaxed text-soft lg:text-xl">{body}</p>

            {/*
              The invitation, then the address it goes to. One line, and it asks
              for the work rather than for an application — Labs is not a vacancy
              and the copy should not read like one.
            */}
            <p className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-sans text-lg">
              <span className="font-medium text-ink">{note}</span>
              <SiteLink href={`mailto:${apply.email}`} className="signal-link font-medium text-ink">
                {apply.label} — {apply.email}
              </SiteLink>
            </p>
          </div>
        </div>
      </div>

      <div className="cell col-span-full hidden md:flex">
        <NextCell next={next} />
      </div>
    </Panel>
  );
}

/**
 * The motto, overprinted.
 *
 * ## Why not the obvious things
 *
 * Three were tried and each looked cheap in its own way. Flat ink at a tenth of
 * an opacity is the watermark on an invoice — it says "background" and nothing
 * else. A rainbow gradient under a turbulence filter is worse: the colours
 * belong to no palette and the filter melts the letterforms. And big flat
 * corner plates of colour, the third try, came out as cut paper — a shape that
 * large has to be *drawn*, and a drawn shape in three primaries is a child's
 * collage, not a press.
 *
 * ## What this is instead
 *
 * A screen print, with the ink behaving like ink. The words are set twice in two
 * flat colours a few pixels apart, the way a pull comes out when the paper shifts
 * between passes. Two narrow bands of spot colour run under them and off both
 * edges, so the colour is something the panel was printed *through* rather than
 * something sitting on it. And the spatter is spatter: dozens of small specks,
 * each an ellipse leaning along its own throw, thrown in from two corners and
 * getting smaller as they travel.
 *
 * Scale is the whole difference between this and the collage. Ink lands in
 * specks a few pixels across, never in slabs, and specks that size read as a
 * process rather than as a decoration somebody added.
 */
function Watermark() {
  /*
   * Two passes: the offset each is printed at and its colour.
   *
   * The ink pass sits last and true, so the words stay legible; the lime is
   * pulled up and to the left off it. There used to be a third pass in grey
   * between them, and at this size it stopped reading as a misregistration and
   * started reading as a drop shadow — the one effect that would give the whole
   * thing away as a graphic rather than a print.
   */
  const PASSES = [
    { x: -10, y: -8, fill: "#c6ff3e", opacity: 0.95 },
    { x: 0, y: 0, fill: "#0e0e0c", opacity: 0.9 },
  ];

  /*
   * The spot colour, as bands rather than fields.
   *
   * Each is narrow, crosses the whole panel, and leaves on both sides, so it has
   * no drawn shape of its own — it is the width of the ink and the angle of the
   * pull, and nothing else. Under `multiply` a band crossing a letter simply
   * darkens with it, which is what makes the two look printed together instead
   * of stacked.
   */
  const BANDS = [
    // Across the top, through the first line.
    { fill: "#c6ff3e", opacity: 0.75, points: "-500,86 1600,-18 1600,44 -500,148" },
    /*
      Down the right, steeply, so the two cross instead of running together. Two
      bands at the same angle are a banner — the eye reads a pair of parallel
      diagonals as one ruled ornament, and the panel had exactly that until this
      one was stood up.
    */
    { fill: "#e8492c", opacity: 0.55, points: "1120,-500 1192,-500 762,1200 690,1200" },
  ];

  /*
   * Two throws of ink, in from opposite corners.
   *
   * `t` is squared on the way out, which is what puts most of the ink near where
   * the throw started and thins it as it travels — an even scatter is the thing
   * that reads as decoration. `off` widens with `t` for the same reason: a throw
   * fans out.
   */
  const SPECKS = [
    ...spatter({ seed: 7, count: 58, x: -40, y: -50, dx: 700, dy: 500, spread: 330 }).map((s) => ({
      ...s,
      fill: "#c6ff3e",
    })),
    ...spatter({ seed: 41, count: 46, x: 1120, y: 740, dx: -640, dy: -470, spread: 300 }).map(
      (s) => ({ ...s, fill: "#e8492c" }),
    ),
  ];

  return (
    <svg
      aria-hidden="true"
      /*
        Roomier than the type needs.

        The block is rotated inside this box, and a rotation pushes corners
        outward — set tight to the words, the first and last lines lost their
        ends to the viewBox edge at some widths. The padding is the turning
        circle.
      */
      viewBox="-60 -70 1160 760"
      preserveAspectRatio="xMidYMid meet"
      /*
        `overflow-visible`, clipped by the column instead.

        `meet` letterboxes the viewBox inside the element, and an SVG root clips
        at the viewBox by default — so the bands, which are drawn far outside it
        precisely so they never end on screen, were being cut off square in the
        middle of the panel with paper still showing above and below the cut. The
        column carries the `overflow-hidden` now, so they run to its edges and
        leave the panel the way ink leaves a sheet.
      */
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      <g style={{ mixBlendMode: "multiply" }} transform="rotate(-8 500 310)">
        {BANDS.map((band) => (
          <polygon key={band.fill} points={band.points} fill={band.fill} opacity={band.opacity} />
        ))}

        {/* Under the type. A speck landing on a letter darkens with it; a speck
            landing on paper is the only place the colour shows at full strength. */}
        {SPECKS.map((speck) => (
          <ellipse
            key={`${speck.fill}${speck.x}${speck.y}`}
            cx={speck.x}
            cy={speck.y}
            rx={speck.r}
            ry={speck.r * 0.6}
            fill={speck.fill}
            opacity={speck.opacity}
            transform={`rotate(${speck.angle} ${speck.x} ${speck.y})`}
          />
        ))}

        {PASSES.map((pass) => (
          <g
            key={pass.fill}
            transform={`translate(${pass.x} ${pass.y})`}
            fill={pass.fill}
            opacity={pass.opacity}
          >
            {["MAKE", "SOMETHING", "CRAZY", "WITH US"].map((word, row) => (
              <text
                key={word}
                x="60"
                y={150 + row * 132}
                fontFamily="var(--font-display), ui-sans-serif, system-ui, sans-serif"
                fontSize="132"
                fontWeight="700"
                letterSpacing="-0.035em"
              >
                {word}
              </text>
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}

/**
 * One throw of ink, as a list of specks.
 *
 * Seeded rather than random: the panel is rendered on the server and any drift
 * between the server's markup and the client's would be a hydration mismatch, so
 * the scatter has to come out the same every time it is asked for. A small
 * linear congruential generator is enough — this wants ink that looks unplanned,
 * not statistically sound noise.
 */
function spatter({
  seed,
  count,
  x,
  y,
  dx,
  dy,
  spread,
}: {
  seed: number;
  count: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  spread: number;
}) {
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const round = (value: number) => Math.round(value * 10) / 10;

  return Array.from({ length: count }, () => {
    const travel = next() ** 2;
    const across = (next() - 0.5) * spread * (0.25 + travel);
    return {
      x: round(x + dx * travel - uy * across),
      y: round(y + dy * travel + ux * across),
      // Big drops land first and the throw atomises as it goes.
      r: round(1.8 + (1 - travel) * (2.2 + next() * 8)),
      opacity: round(0.55 + (1 - travel) * 0.45),
      angle: round(angle + (next() - 0.5) * 40),
    };
  });
}
