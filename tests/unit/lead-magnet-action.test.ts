import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * What happens to a captured email.
 *
 * For a month the answer was "nothing" — the action validated the address, logged
 * its domain, served the PDF and threw the rest away, because there was nowhere
 * to put it. It now goes to Pleiades as a lead in Acquisition, and these are the
 * properties that matter about that call:
 *
 *  - it reaches the right endpoint with the key, and says which magnet;
 *  - **a failure never costs the visitor their download**, which is the whole
 *    reason `deliver()` is allowed to throw;
 *  - an unconfigured deploy is not an error.
 *
 * The Cloudflare context is mocked rather than run in the worker pool because
 * what is under test is the call this action makes, not a binding. The real
 * endpoint has its own tests in the Pleiades repo.
 */

const KEY = "sk_test_website_key";
const BASE = "https://pleiades.example.test";

const env: Record<string, string | undefined> = {
  PLEIADES_API_URL: BASE,
  PLEIADES_API_KEY: KEY,
};

vi.mock("@/lib/cloudflare", () => ({
  cf: () => ({ env }),
}));

/** `requestPlaybook` takes a FormData, as a server action bound to a form does. */
function submission(email: string): FormData {
  const data = new FormData();
  data.set("email", email);
  data.set("company", "");
  return data;
}

async function requestPlaybook(email: string) {
  // Imported inside the test so the mock above is in place first.
  const { requestPlaybook: action } = await import("@/server/actions/lead-magnet");
  return action({ status: "idle" }, submission(email));
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  env.PLEIADES_API_URL = BASE;
  env.PLEIADES_API_KEY = KEY;
  fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ success: true, data: { id: "lead_1", created: true } }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("handing a captured lead to Pleiades", () => {
  it("posts the address and the magnet it came from, with the key", async () => {
    const result = await requestPlaybook("Owner@Acme.co");
    expect(result.status).toBe("success");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe(`${BASE}/api/acquisition/contacts/intake`);
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe(KEY);

    const body = JSON.parse(String(init.body));
    expect(body.email).toBe("Owner@Acme.co");
    // The source is what makes the lead worth calling — Pleiades puts it in
    // `lead_source` and on the activity trail.
    expect(body.source).toMatch(/lead magnet/i);
    expect(body.source).toMatch(/Get Your Week Back/i);
  });

  it("does not send anything else about the visitor", async () => {
    await requestPlaybook("owner@acme.co");
    const body = JSON.parse(String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body));
    // The honeypot, the raw form, an IP, a fingerprint: none of it. One address
    // and a label, so there is exactly one copy of the visitor's data and it is
    // in the system the company already owns.
    expect(Object.keys(body).sort()).toEqual(["email", "source"]);
  });

  it("still serves the PDF when Pleiades is down", async () => {
    // The trade is explicit: someone who has just typed their address to get a
    // guide gets the guide. Withholding it to punish our own outage loses the
    // conversion and teaches the visitor nothing.
    fetchMock.mockRejectedValueOnce(new Error("connect ETIMEDOUT"));
    const result = await requestPlaybook("owner@acme.co");
    expect(result.status).toBe("success");
    if (result.status === "success") expect(result.href).toContain("/api/media/playbook");
  });

  it("still serves the PDF when Pleiades refuses the lead", async () => {
    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 403 }));
    const result = await requestPlaybook("owner@acme.co");
    expect(result.status).toBe("success");
  });

  it("says so in the logs when a lead is dropped, since that is now possible", async () => {
    // Before this endpoint existed there was nothing to drop. There is now, and a
    // silent loss would be the worst version of this change.
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error("connect ETIMEDOUT"));
    await requestPlaybook("owner@acme.co");

    expect(error).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(String(error.mock.calls[0]?.[0]));
    expect(logged.event).toBe("lead_magnet.delivery_failed");
    // The domain, never the address — the same rule the old log line followed.
    expect(logged.domain).toBe("acme.co");
    expect(JSON.stringify(logged)).not.toContain("owner@");
  });

  it("sends nothing, and does not fail, when the key is unset", async () => {
    // The state a preview deploy is in. It must not take the download with it.
    env.PLEIADES_API_KEY = undefined;
    const result = await requestPlaybook("owner@acme.co");
    expect(result.status).toBe("success");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a bad address before it reaches Pleiades at all", async () => {
    const result = await requestPlaybook("not-an-email");
    expect(result.status).toBe("error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("silently succeeds for a bot, without creating a lead", async () => {
    const { requestPlaybook: action } = await import("@/server/actions/lead-magnet");
    const data = new FormData();
    data.set("email", "bot@spam.test");
    // Real people never see this field.
    data.set("company", "Acme Spam Co");

    const result = await action({ status: "idle" }, data);
    // Succeeds, because a bot that knows it failed just tries again.
    expect(result.status).toBe("success");
    // But the lead is not real, so Acquisition never hears about it.
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
