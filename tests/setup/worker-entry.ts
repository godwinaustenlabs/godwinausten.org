/**
 * Worker entrypoint used ONLY by the `worker` test project.
 *
 * The real entrypoint is `.open-next/worker.js`, which only exists after a
 * build. Pointing the test pool at it would make `npm run test:worker` depend on
 * a full OpenNext build — slow, and it would mean integration tests silently
 * exercise stale output.
 *
 * Integration tests here assert *binding* behaviour. Full HTTP behaviour of the
 * real app is covered end-to-end by Playwright against the workerd preview.
 */
export default {
  fetch() {
    return new Response("test worker entrypoint", { status: 200 });
  },
} satisfies ExportedHandler;
