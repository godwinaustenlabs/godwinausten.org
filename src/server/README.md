# Server

Server-only code. **Nothing here may be imported by a client component.**

| Folder      | Holds                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| `actions/`  | Server Actions — the only mutation path in this app                                      |
| `services/` | Calls to external systems (email, CRM, Workers AI)                                       |
| `db/`       | Empty. Reserved for Drizzle schema + migrations if D1 arrives — see `docs/data-layer.md` |

## Rules

- Every Server Action validates its input with a zod schema **first**, before any
  other statement. Server Actions are public HTTP endpoints; the form on the page
  is not the only thing that can call them.
- Bindings are reached through `src/lib/cloudflare.ts`, never `getCloudflareContext()`
  inline — it keeps the set of bindings the app touches greppable.
- Never return a raw error to the client. Log the detail, return a safe message.
- Never log PII. Log an id and an outcome (`SECURITY.md` §5).
- Treat Workers AI output as untrusted input (`SECURITY.md` §6).
