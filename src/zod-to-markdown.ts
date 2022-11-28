import { identity, snakeCase, toUpper, upperFirst } from "lodash";
import { ZodObject, ZodRawShape, ZodTypeAny } from "zod";

export function zodObjectToMarkdown<
  T extends ZodObject<Input>,
  Input extends ZodRawShape,
>(name: string, prefix: string, definition: T): string {
  let res = ``;

  res += `## ${name}\n\n`;
  if (prefix.length) {
    res += `Prefix: \`${prefix}\`\n\n`;
  }
  if (definition.description) {
    res += `${definition.description}\n\n`;
  }

  const envCase = (x: string) => toUpper(snakeCase(x));
  const withPrefix: (x: string) => string = prefix
    ? (x) => `${prefix}${upperFirst(x)}`
    : identity;

  res += `| Name | Environment variable | Type | Default | Description |\n`;
  res += `| ---- | -------------------- | ---- | ------- | ----------- |\n`;

  for (const [key, def] of Object.entries(definition.shape)) {
    const defaultValue = def._def?.defaultValue?.();
    const row: TableRow = {
      name: key,
      envVar: `\`${envCase(withPrefix(key))}\``,
      type:
        findInnermostType(def) +
        (def.isNullable() || def.isOptional() ? "?" : ""),
      default: typeof defaultValue !== "undefined" ? `\`${defaultValue}\`` : "",
      description: def.description ?? "",
    };
    res += `| ${Object.values(row).join(" | ")} |\n`;
  }

  return res;
}

interface TableRow {
  name: string;
  envVar: string;
  type: string;
  default: string;
  description: string;
}

function findInnermostType(t: ZodTypeAny): string {
  if ((t._def as any).schema) {
    return findInnermostType((t._def as any).schema);
  } else if ((t._def as any).innerType) {
    return findInnermostType((t._def as any).innerType);
  } else {
    return (t._def.typeName ?? "").replace(/^Zod/, "");
  }
}
