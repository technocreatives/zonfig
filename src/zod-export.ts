import { z as zod } from "zod";

/**
 * Subset of Zod for env var structures
 *
 * All env vars are of type `string | undefined`, so some of these schema
 * builder functions differ from the original ones from zod in that they try to
 * parse the string values into the underlying types.
 */
export const z = {
  object: zod.object,
  string: zod.string,
  boolean: () => zod.preprocess(parseBool, zod.boolean()),
  number: () => zod.preprocess(parseNumber, zod.number()),
  // Note that this is only added because the preprocessed version of number no
  // longer has access to methods like `gt` or `.positive`.
  int: () => zod.preprocess(parseNumber, zod.number().int()),
};

function parseNumber(input: unknown) {
  const maybeNumber = Number(input);
  if (isFinite(maybeNumber)) {
    return maybeNumber;
  } else {
    return input;
  }
}

function parseBool(input: unknown) {
  switch (input) {
    case "true":
    case "1":
      return true;
    case "false":
    case "0":
      return false;
    default:
      return input;
  }
}
