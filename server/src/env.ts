import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env files during the build time
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // URLs
    FRONTEND_URL: z.string().url(),
    FRONTEND_CORS_URLS: z.string().default(""),
    BACKEND_URL: z.string().url(),



      

  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "PUBLIC_",

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `PUBLIC_`.
   */
  client: {
    // PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnvStrict: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,

    // URL
    FRONTEND_URL: process.env.FRONTEND_URL,
    FRONTEND_CORS_URLS: process.env.FRONTEND_CORS_URLS,
    BACKEND_URL: process.env.BACKEND_URL,

  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
