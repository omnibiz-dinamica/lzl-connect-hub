// Static build only: there is no server on shared hosting, so the form "server functions"
// are replaced by browser functions (see submissions.static.ts) and useServerFn just returns them.
export function useServerFn<T>(fn: T): T {
  return fn;
}
