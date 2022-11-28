import { identity, snakeCase, toUpper, upperFirst } from "lodash";
import { z, ZodObject, ZodRawShape } from "zod";
import { CONFIG_REGISTRY } from ".";

const envCase = (x: string) => toUpper(snakeCase(x));

export function ZonfigService<
  T extends ZodObject<Input>,
  Input extends ZodRawShape,
>(schema: T) {
  const C = class Config {
    public readonly schema = schema;

    constructor(public readonly config: z.infer<T>) {}

    static fromEnv(withPrefix?: string): Config {
      const name = this.name.replace(/Config$/, "");
      CONFIG_REGISTRY.set(name, {
        name,
        prefix: withPrefix ?? "",
        schema,
      });

      return this.from(process.env, withPrefix, envCase);
    }

    static from(
      data: Record<string, any>,
      prefix?: string,
      transformCase: (x: string) => string = identity,
    ): Config {
      const withPrefix: (x: string) => string = prefix
        ? (x) => `${prefix}${upperFirst(x)}`
        : identity;

      const interestingFields: Partial<Record<keyof z.infer<T>, string>> = {};

      for (const key of Object.keys(schema.shape)) {
        interestingFields[key as keyof z.infer<T>] =
          data[transformCase(withPrefix(key))];
      }

      const res = schema.safeParse(interestingFields);
      if (res.success) {
        return new C(res.data);
      } else {
        throw new ReadConfigError(
          `Could not read config` + (prefix ? ` (prefix '${prefix}')` : ""),
          res.error,
        );
      }
    }
  };

  return C;
}

export class ReadConfigError extends Error {
  constructor(message: string, public details: z.ZodError<any>) {
    super(
      `${message} -- ${details.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ")}`,
    );
  }
}
