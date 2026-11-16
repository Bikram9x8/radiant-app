// Where to send someone after login/signup when a page asked for it (e.g. the MCQ test result screen).
// Only same-site relative paths: must start with "/" and not "//" (or "/\"), which browsers treat as
// another site. Anything else is ignored and the normal destination is used.
export function safeReturnTo(value: string | null | undefined): string | null {
  if (!value || value.length > 300) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return null;
  return value;
}

// Adds ?returnTo= to an auth path when there is one
export function withReturnTo(path: string, returnTo: string | null): string {
  return returnTo ? `${path}?returnTo=${encodeURIComponent(returnTo)}` : path;
}
