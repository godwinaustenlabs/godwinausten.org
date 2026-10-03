import { SiteLink } from "@/modules";
import { Label } from "@/components/ui/Label";
import type { OpenRolesProps } from "./block.config";

/**
 * The board: one cell per open role, and a cell that says so when there are none.
 *
 * ## It is a list, not a grid of cards
 *
 * Same argument `index-list` makes about the work. A grid of tiles asks someone
 * to pick a role before they know what any of them involve; a list gives each
 * one its title, what the work actually is, and what you would need — so they
 * can tell whether it is them without opening anything. There is nothing to
 * open here anyway: a posting short enough to read in full is worth more than a
 * posting behind a link.
 *
 * ## An open role is lit
 *
 * The board is bare most of the time, so when something is on it, it should be
 * the brightest thing on the page. Each posting carries a neon frame — the one
 * glowing element on the site, defined as `.neon-frame` in `globals.css`.
 *
 * It sits on **paper**, like everything else here. The first cut put the
 * postings on ink, on the argument that neon is light and light needs a dark
 * ground; the owner cut that, and they were right about what it cost — two
 * black slabs in the middle of a page whose whole subject is the two jobs in
 * them, turning the most readable thing on the route into the one that fights
 * its own reader. The frame does the marking on its own, as a bloom of lime
 * round the cell rather than as a tube glowing in a dark room. Less literally
 * neon, and the postings stay legible.
 *
 * ## Every role ends in the same bar
 *
 * The apply row is the cell's bottom bar with the accent square at its corner —
 * the site's one lime fill, in the one place on this page where an action
 * happens. It is a `mailto:` with the role in the subject, which is the closest
 * thing to an application form that does not require a database, a queue or a
 * third-party script, none of which this site has (`CLAUDE.md` §5).
 *
 * ## The terms come before the jobs
 *
 * These seats are commission-only with no floor under them. That is stated in a
 * cell of its own between the heading and the board, because the alternative —
 * a benefits line inside each posting — is disclosure that is technically
 * present and practically unread. Somebody deciding whether to apply should meet
 * it before they have finished wanting the job.
 *
 * ## The empty state is not a fallback
 *
 * It is the state this page is in most of the time. We hire rarely; the board is
 * usually bare, and a bare board with nothing on it reads as a page that failed
 * to load. So it renders a cell of its own, and taking a role down is deleting
 * an entry from `src/content/copy/careers.ts`.
 */
export default function OpenRoles({
  index,
  eyebrow,
  headline,
  lead,
  apply,
  terms,
  roles,
  closed,
}: OpenRolesProps) {
  return (
    <div className="grid-cells grid w-full">
      <div className="cell">
        <div className="cell-bar border-b border-hairline">
          <Label tone="ink" className="opacity-40">
            {index}
          </Label>
          <Label>{eyebrow}</Label>
          <Label className="ms-auto opacity-60">
            {roles.length > 0 ? `${roles.length} open` : "None open"}
          </Label>
        </div>
        <div className="cell-body gap-5 py-[clamp(2.25rem,6vh,4rem)]">
          <h2 className="max-w-[16ch] font-display text-[clamp(2rem,4.6vw,4.25rem)] leading-[0.94] font-bold text-ink">
            {headline}
          </h2>
          <p className="max-w-[52ch] font-sans text-base leading-relaxed text-soft lg:text-lg">
            {lead}
          </p>
        </div>
      </div>

      {/*
        The terms, between the heading and the board.

        A cell of its own, on the accent rule, so it cannot be skimmed past on
        the way to the first posting — which is exactly what would happen if it
        were a line under the lead. What it has to say is that these seats carry
        no salary, and somebody should meet that before they have read a job
        description and started wanting it.
      */}
      <div className="cell gap-4 border-signal px-gutter py-[clamp(1.5rem,4vh,2.5rem)]">
        <span aria-hidden="true" className="block h-1.5 w-10 bg-signal" />
        <h3 className="max-w-[26ch] font-display text-[clamp(1.15rem,2.2vw,1.6rem)] leading-[1.15] font-medium text-ink">
          {terms.title}
        </h3>
        <p className="max-w-[68ch] font-sans text-sm leading-relaxed text-soft lg:text-base">
          {terms.detail}
        </p>
      </div>

      {roles.length === 0 ? (
        <div className="cell gap-4 px-gutter py-[clamp(2.5rem,7vh,4.5rem)]">
          <h3 className="max-w-[20ch] font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.02] font-medium text-ink">
            {closed.title}
          </h3>
          <p className="max-w-[54ch] font-sans text-base leading-relaxed text-soft">
            {closed.detail}
          </p>
          <a
            href={`mailto:${apply.email}`}
            className="signal-link mt-2 self-start font-sans text-base font-medium text-ink"
          >
            {apply.email}
          </a>
        </div>
      ) : null}

      {/*
        One cell, with the postings as cards inside it.

        The roles were cells of their own — full bleed, butted together on the
        seam, like everything else on the site. The owner asked for cards, and on
        this one section they are right: the board is a *list of things that come
        and go*, and the site's edge-to-edge grid says the opposite. A card can be
        added and removed; a panel is architecture.

        This is a deliberate exception to two rules in `docs/brief.md` — the card
        test, and "no borders round content". It is confined to the postings, the
        radius stays inside the brief's own 8px ceiling, and there is still no
        shadow: the frame is light, not depth.
      */}
      {roles.length > 0 ? (
        <div className="cell gap-[var(--gutter)] px-gutter py-[clamp(1.5rem,4vh,2.75rem)]">
          {roles.map((role) => (
            <article key={role.index} className="relative overflow-hidden rounded-lg">
              {/* The glow. A layer rather than a border on the card, so nothing it
              draws changes the box everything else is measured against. */}
              <span aria-hidden="true" className="neon-frame z-10" />

              {/* The role's own top bar: its number and the facts that decide
              whether someone reads any further. */}
              <div className="cell-bar flex-wrap gap-x-5 gap-y-1 border-b border-hairline px-[clamp(1.25rem,3vw,2rem)]">
                <Label tone="ink" className="opacity-30">
                  {role.index}
                </Label>
                {role.meta.map((fact) => (
                  <Label key={fact} className="opacity-70">
                    {fact}
                  </Label>
                ))}
              </div>

              <div className="flex flex-col gap-8 px-[clamp(1.25rem,3vw,2rem)] py-[clamp(1.75rem,4vh,2.75rem)] lg:flex-row lg:gap-12">
                <div className="lg:w-[34%] lg:shrink-0">
                  {/* The accent rule, same proportion as the one over every service
                  claim. It is what tells the eye a new posting has started
                  before it has read the title. */}
                  <span aria-hidden="true" className="mb-5 block h-1.5 w-10 bg-signal" />
                  <h3 className="font-display text-[clamp(1.75rem,3.6vw,3rem)] leading-[1] font-bold text-balance text-ink">
                    {role.title}
                  </h3>
                  <p className="mt-4 max-w-[38ch] font-sans text-base leading-relaxed text-soft lg:text-lg">
                    {role.summary}
                  </p>
                </div>

                {/*
              The lists, side by side above `md` and stacked below it.

              Columns from the count rather than a literal `md:grid-cols-2`, for
              the same reason the masthead's meta bar takes its columns from how
              many facts it was given: a posting that grows a third list should
              be a content change, and a fixed two-column grid answers a third
              one with an implicit column nothing sized.
            */}
                <div
                  className="grid min-w-0 flex-1 gap-8 md:grid-cols-[repeat(var(--group-cols),minmax(0,1fr))] md:gap-10"
                  style={{ "--group-cols": role.groups.length } as React.CSSProperties}
                >
                  {role.groups.map((group) => (
                    <div key={group.title} className="min-w-0">
                      <Label tone="ink" className="opacity-60">
                        {group.title}
                      </Label>
                      <ul className="mt-4 flex flex-col gap-3">
                        {group.items.map((item) => (
                          <li key={item} className="flex gap-3">
                            {/* A rule rather than a bullet glyph. The page is built
                            out of hairlines and there is not a disc anywhere
                            else on the site. */}
                            <span
                              aria-hidden="true"
                              className="mt-[0.6em] h-px w-3 shrink-0 bg-ink/30"
                            />
                            <span className="font-sans text-sm leading-relaxed text-soft lg:text-base">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/*
                The apply bar — filled, and the card's one loud thing.

                It was a mono label with a small lime square in the corner, which
                is how every other action on this site is drawn and which was
                wrong here: those sit on pages where the action is a hand-off,
                and this is the only thing on `/careers` a reader is asked to
                *do*. Against a card already lit lime it vanished into its own
                frame.

                Filled, it inverts on hover — ink ground, lime type — so the
                control has a state and not just a colour. The subject line is
                prefilled with the role, so an application arrives already
                sorted: the whole of the "applicant tracking" this page has, and
                all it needs.
              */}
              <SiteLink
                href={`mailto:${apply.email}?subject=${encodeURIComponent(role.title)}`}
                className="group relative z-10 flex items-center gap-4 bg-signal px-[clamp(1.25rem,3vw,2rem)] py-4 text-ink transition-colors hover:bg-ink hover:text-signal focus-visible:bg-ink focus-visible:text-signal"
              >
                {/*
                  Bare spans on `.label`, not the `Label` component: it sets a
                  tone class, and a fixed colour cannot invert with the bar
                  underneath it.
                */}
                <span className="label font-medium">
                  {apply.label} {role.title}
                </span>
                <span className="label hidden opacity-70 sm:inline">{apply.email}</span>
                <span
                  aria-hidden="true"
                  className="ms-auto text-lg leading-none transition-transform group-hover:translate-x-1"
                >
                  ↗
                </span>
              </SiteLink>
            </article>
          ))}
        </div>
      ) : null}

      <div className="cell px-gutter py-4">
        <Label className="opacity-70">{apply.note}</Label>
      </div>
    </div>
  );
}
