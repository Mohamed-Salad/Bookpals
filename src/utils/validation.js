// Pure, dependency-free validators shared by database.js and
// searchService.js. Kept separate from those (rather than defined inline)
// so they're unit-testable without pulling in supabaseClient.js's
// top-level createClient() call, which throws if Supabase env vars aren't
// set - as they aren't in a plain test run.

// database.js interpolates user-supplied ids straight into PostgREST
// .or() filter strings. An id that isn't a UUID could break out of the
// intended filter clause, so every id reaching a raw .or() template is
// validated with this first.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const assertUuid = (id, label) => {
  if (!UUID_RE.test(id)) {
    throw new Error(`Invalid ${label}: expected a UUID`);
  }
};

// searchService.js interpolates raw search-box text into PostgREST .or()
// filter strings. ',' and '(' / ')' are structural characters in that
// filter DSL (condition separator / grouping), so an unescaped one could
// let a search string inject extra filter conditions or search columns
// outside the intended set. Stripped rather than escaped - none of these
// are useful in a genuine search phrase.
export const sanitizeFilterText = (text) => text.replace(/[,()]/g, "");
