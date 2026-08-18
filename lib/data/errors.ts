import type { PostgrestError } from "@supabase/supabase-js";

export class DataAccessError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "DataAccessError";
  }
}

export function throwDataError(error: PostgrestError | null, fallback: string): never {
  if (!error) throw new DataAccessError(fallback);
  if (error.code === "42501") throw new DataAccessError("Your household does not have access to that record.", error.code);
  if (error.code === "23505") throw new DataAccessError("That record already exists.", error.code);
  if (error.code === "23503") throw new DataAccessError("That related record no longer exists. Refresh and try again.", error.code);
  if (error.code === "23514" || error.code === "22P02") throw new DataAccessError("Some submitted information is invalid.", error.code);
  if (error.code === "42P01") throw new DataAccessError("The BearVault database migration has not been applied yet.", error.code);
  throw new DataAccessError(fallback, error.code);
}

export function errorMessage(error: unknown) {
  return error instanceof DataAccessError
    ? error.message
    : "Something went wrong. Please try again.";
}
