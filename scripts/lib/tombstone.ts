/**
 * The marker that identifies a generated tombstone page.
 *
 * It lives here, in its own module, rather than in scripts/gen-tombstones.ts, because
 * scripts/verify-urls.ts needs it too — and importing it from the generator would run the
 * generator's top-level code as a side effect of verifying, writing files during a check
 * that is supposed to only read them.
 */
export const TOMBSTONE_MARKER = 'data-tombstone'
