import { z } from "./zod-export";

describe("Custom Zod types with conversion", () => {
  describe("booleans", () => {
    const schema = z.object({
      foo: z.boolean(),
      bar: z.boolean(),
      baz: z.boolean().default(false),
    });

    test("mixed inputs", () => {
      expect(schema.safeParse({ foo: "true", bar: "false" })).toMatchObject({
        data: { foo: true, bar: false, baz: false },
      });
    });

    test("everything strings", () => {
      expect(
        schema.safeParse({ foo: "true", bar: "false", baz: "true" }),
      ).toMatchObject({
        data: { foo: true, bar: false, baz: true },
      });
    });

    test("invalid strings", () => {
      expect(
        schema.safeParse({ foo: "yes please", bar: "nope" }),
      ).toMatchObject({
        success: false,
      });
    });
  });

  describe("numbers", () => {
    const schema = z.object({
      foo: z.int(),
      bar: z.number().refine((x) => x >= 0 && x <= 1),
      baz: z.number().default(42),
    });

    test("actual numbers", () => {
      expect(schema.safeParse({ foo: 2, bar: 0.05 })).toMatchObject({
        data: { foo: 2, bar: 0.05, baz: 42 },
      });
    });

    test("valid strings", () => {
      expect(schema.safeParse({ foo: "2", bar: "0.05" })).toMatchObject({
        data: { foo: 2, bar: 0.05, baz: 42 },
      });
    });
    test("invalid strings", () => {
      expect(schema.safeParse({ foo: "two", bar: "foo" })).toMatchObject({
        success: false,
      });
    });
  });
});
