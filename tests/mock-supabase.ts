// Only used by tests/deno.json. Production uses the real SDK.
// deno-lint-ignore no-explicit-any
let client: any;
// deno-lint-ignore no-explicit-any
export function setClient(value: any) { client = value; }
export function createClient(..._args: unknown[]) { return client; }
