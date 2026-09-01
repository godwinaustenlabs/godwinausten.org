"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Cross-fades between whole compositions without a route change.
 *
 * This is the "swap the lego set, not the table" primitive: the funnel can move
 * from the VSL composition to the booking composition as an animation, keeping
 * scroll position, video state, and analytics session intact. Children are
 * pre-rendered on the server and handed in already-built, keyed by `activeId`.
 */
export function CompositionStage({
  activeId,
  children,
}: {
  activeId: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
