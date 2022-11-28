export { ZonfigService } from "./zonfig.service";
export { z } from "./zod-export";
export { zodObjectToMarkdown } from "./zod-to-markdown";

export const CONFIG_REGISTRY: Map<
  string,
  {
    name: string;
    prefix: string;
    schema: any;
  }
> = new Map();
