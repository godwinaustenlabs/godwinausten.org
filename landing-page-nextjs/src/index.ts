/// <reference types="@cloudflare/workers-types" />

export interface Env {
    ASSETS: Fetcher;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        return env.ASSETS.fetch(request);
    },
};
