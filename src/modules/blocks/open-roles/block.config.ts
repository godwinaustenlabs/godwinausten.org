import { z } from "zod";
import { defineBlock } from "@/modules";

export const openRolesSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  lead: z.string().min(1),
  /**
   * Where an application goes, and what to put in it.
   *
   * One definition rather than one per role. Every posting says "send it to the
   * same address" and three copies of that string in the copy module is three
   * chances for two of them to go stale — the same reason `services-rows` has
   * one `cta` for four offerings.
   */
  apply: z.object({
    /** The bottom bar's label. The role's title is appended to it. */
    label: z.string().min(1),
    email: z.email(),
    /** What to attach, set under the board. */
    note: z.string().min(1),
  }),
  /**
   * What the roles pay, stated once above the board.
   *
   * Above the postings, not inside them, and not optional. The terms here are
   * commission-only with no floor, and the only honest place to say that is
   * before someone has read a job and started picturing themselves in it —
   * carried as a line in each posting's small print it is technically disclosed
   * and practically hidden.
   */
  terms: z.object({ title: z.string().min(1), detail: z.string().min(1) }),
  /**
   * The board.
   *
   * **Allowed to be empty, and that is the feature.** A careers page whose
   * postings are markup has to be rebuilt to take one down, so the honest state
   * — nothing open — becomes the one state nobody implements, and a filled role
   * sits there for months. Empty renders `closed` below and the page still reads
   * as finished.
   */
  roles: z
    .array(
      z.object({
        index: z.string().min(1),
        title: z.string().min(1),
        /** One line, before either list. What the job actually is. */
        summary: z.string().min(1),
        /** Mono facts along the role's top bar: type, place, commitment. */
        meta: z.array(z.string().min(1)).min(1),
        /**
         * The two lists — what you would do, and what you need to have.
         *
         * A list rather than two named fields, so a posting that wants a third
         * ("What you'd learn", "How we'll decide") is a content change. Each is
         * a heading and its bullets; the block lays out however many it is
         * given.
         */
        groups: z
          .array(
            z.object({
              title: z.string().min(1),
              items: z.array(z.string().min(1)).min(1),
            }),
          )
          .min(1),
      }),
    )
    .default([]),
  /**
   * What the board says when there is nothing on it.
   *
   * Written now rather than when it is first needed, because the day a role is
   * filled is the day nobody wants to write copy — and an empty board with no
   * message is a page that looks broken.
   */
  closed: z.object({ title: z.string().min(1), detail: z.string().min(1) }),
});

export type OpenRolesProps = z.infer<typeof openRolesSchema>;

export const openRoles = defineBlock({
  id: "open-roles",
  displayName: "Careers — the board, and what to do when it is empty",
  schema: openRolesSchema,
  load: () => import("./index"),
  defaults: {
    // Taller than the band by design, like `prose-sections`: a posting is read,
    // not glanced at, and it only ever appears on a vertical route.
    layout: { width: "full-bleed", spacing: "none" },
    motion: { reveal: "fade" },
  },
});
