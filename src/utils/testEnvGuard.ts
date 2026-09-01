/**
 * Test Environment Guard Utility
 * 
 * Prevents automated test executions (Vitest, unit tests, mock runs) from writing
 * bogus/dummy records into live Cloud Firestore collections or polluting production metrics.
 */

export function isTestEnvironment(): boolean {
  if (typeof process !== "undefined" && process.env) {
    if (process.env.NODE_ENV === "test" || process.env.VITEST || process.env.npm_lifecycle_event === "test") {
      return true;
    }
  }

  try {
    if ((import.meta as any)?.env?.MODE === "test") {
      return true;
    }
  } catch {}

  return false;
}

/**
 * Checks if a devotee name, key, or token represents a test/mock payload.
 */
export function isMockDevotee(identifier?: string | null): boolean {
  if (!identifier) return false;
  const lower = identifier.toLowerCase();
  return (
    lower.includes("test") ||
    lower.includes("mock") ||
    lower.includes("dummy") ||
    lower.startsWith("guest_test")
  );
}
