# Zonfig

A simple library to define schemas for configs.

## Idea

The goal of this is to define a schema for configs instead of just fetching values out of thin air whenever we need them. This way we can define, per module, the config values we need, and don't have to keep track of random strings.

One limitation right now is that there is no built-in way to read from multiple `env` files like [Nest's ConfigModule](https://docs.nestjs.com/techniques/configuration) does.

The implementation is slightly tricky right now and still the API is not super neat yet. The main idea is that we get our config service class by calling the helper function with a [Zod](https://zod.dev/) type definition. This helper function actually returns a new class, which we can extend to name it.

Why Zod? It is to TypeScript what [Serde](https://serde.rs/) is to Rust; and Serde is fantastic. So, we based this lib on zod. The nice thing is that we don't have to type the schema definition (as a value) and the type: using `z.infer` we can get the type from the schema value!

So, instead of having `this.config.get("apiKey")` in your code you will have `this.config.apiKey`.

## Usage

Install the library using `npm`. It will install `zod` and `lodash` as they are zonfig's dependencies.

```bash
npm i @thetc/zonfig
```

Create a new schema for a configuration like:

```ts
import { z, ZonfigService } from '@thetc/zonfig';

const Config = z
  .object({
    nodeEnv: z
      .string()
      .default('development')
      .describe(
        "Set the environment.",
      ),
    port: z.int().default(3001).describe('The server listens on this port.'),
  })
  .describe(
    'General configuration with default values.',
  );

export class BackendConfig extends ZonfigService(Config) {}

export const backendConfig = BackendConfig.fromEnv();
```

The class `BackendConfig` above has default values for `nodeEnv` and `port`. If you have a `.env` file in your project, the values for `NODE_ENV` and `PORT` will overwrite those default values. You can use [dotenv](https://github.com/motdotla/dotenv) to load the `.env` files.

After define the schema and load the values, you are able to use the class in your code, like:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { backendConfig } from './app.config';

async function bootstrap() {
  const { config } = backendConfig;
  console.log(`Config environment: ${config.nodeEnv}`);
  console.log(`Config port: ${config.port}`);

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

### Generate documentation

There is other interesting feature in this library. You can generate documentation from your configuration schema. See the example below that uses `zodObjectToMarkdown` to generate the `CONFIG.md` file.

```ts
let docs = "";
docs += "<!-- This file is generated -->\n\n";
docs += `# Configuration values\n\n`;

const configs = sortBy(Array.from(CONFIG_REGISTRY.values()), "name");
for (const { name, prefix, schema } of configs) {
    docs += zodObjectToMarkdown(name, prefix, schema);
    docs += "\n\n";
}

const fileName = "CONFIG.md";
await writeFile(fileName, docs)
    .then(() => {
        console.log(`Wrote config definition to ${fileName}`);
    })
    .catch((e) => {
        console.log(`Could not write config definition to ${fileName}`, e,);
    });
```

Result (CONFIG.md):

```md
<!-- This file is generated -->

# Configuration values

## Backend

General configuration with default values.

| Name | Environment variable | Type | Default | Description |
| ---- | -------------------- | ---- | ------- | ----------- |
| nodeEnv | `NODE_ENV` | String? | `development` | Set the environment. |
| port | `PORT` | Number? | `3001` | The server listens on this port. |

```

## License

Licensed under:

* MIT license ([LICENSE](LICENSE) or http://opensource.org/licenses/MIT)

## Contribution

We happily accept contributions! We simply ask that you please make sure that any dependencies of your targets use a permissive license compatible with the MIT license.
