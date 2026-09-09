// Error.message/stack are non-enumerable, so `response: error` used to
// serialize to {} over JSON - this pulls out an actual message so API
// consumers (and tests) can see what failed.
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
