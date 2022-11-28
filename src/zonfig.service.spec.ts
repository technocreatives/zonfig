import { Test, TestingModule } from "@nestjs/testing";
import { kebabCase, snakeCase, toUpper } from "lodash";
import { ZonfigService, z } from "./";

describe("ZonfigService", () => {
  class Config extends ZonfigService(
    z.object({
      url: z.string().url(),
      apiToken: z.string().min(1),
      mock: z.boolean().default(false),
    }),
  ) {}

  describe("Valid Config", () => {
    let service: Config;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: Config,
            useValue: Config.from({
              url: "https://foo.bar/",
              apiToken: "lol",
              mock: "true",
            }),
          },
        ],
      }).compile();

      service = module.get<Config>(Config);
    });

    it("should return correct data", () => {
      expect(service.config.url).toEqual("https://foo.bar/");
      expect(service.config.mock).toBe(true);
    });
  });

  describe("Valid Config with prefix", () => {
    let service: Config;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: Config,
            useFactory: () =>
              Config.from(
                {
                  fooUrl: "https://foo.bar/",
                  fooApiToken: "lol",
                  fooMock: "true",
                },
                "foo",
              ),
          },
        ],
      }).compile();

      service = module.get<Config>(Config);
    });

    it("should return correct data", () => {
      expect(service.config.url).toEqual("https://foo.bar/");
      expect(service.config.mock).toBe(true);
    });
  });

  describe("Valid Config with prefix and env case", () => {
    let service: Config;
    const envCase = (x: string) => toUpper(snakeCase(x));

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: Config,
            useFactory: () =>
              Config.from(
                {
                  FOO_URL: "https://foo.bar/",
                  FOO_API_TOKEN: "lol",
                  FOO_MOCK: "true",
                },
                "FOO",
                envCase,
              ),
          },
        ],
      }).compile();

      service = module.get<Config>(Config);
    });

    it("should return correct data", () => {
      expect(service.config.url).toEqual("https://foo.bar/");
      expect(service.config.mock).toBe(true);
    });
  });

  describe("With custom case tranform", () => {
    let service: Config;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: Config,
            useFactory: () =>
              Config.from(
                {
                  "foo-url": "https://foo.bar/",
                  "foo-api-token": "lol",
                  "foo-mock": "true",
                },
                "foo",
                kebabCase,
              ),
          },
        ],
      }).compile();

      service = module.get<Config>(Config);
    });

    it("should return correct data", () => {
      expect(service.config.url).toEqual("https://foo.bar/");
      expect(service.config.mock).toBe(true);
    });
  });

  describe("Invalid Config", () => {
    it("should fail to instantiate", async () => {
      await expect(
        Test.createTestingModule({
          providers: [
            {
              provide: Config,
              useFactory: () => Config.from({}, "FOO"),
            },
          ],
        }).compile(),
      ).rejects.toThrow(
        "Could not read config (prefix 'FOO') -- url: Required, apiToken: Required",
      );
    });
  });
});
