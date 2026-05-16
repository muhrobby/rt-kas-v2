import { z } from "zod";

// Schema env wajib — semua field ini harus ada di production maupun development
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Seed — hanya dibutuhkan saat menjalankan db:seed, opsional di runtime
  SEED_ADMIN_PASSWORD: z.string().min(1).optional(),

  // Redis/Upstash — opsional di development, tapi di production
  // rate limiter akan fallback ke memory store jika tidak diset (tidak efektif di serverless)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  REDIS_URL: z.string().url().optional(),

  // App version — opsional, hanya untuk display
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),
});

// Refinement: di production, wajib ada salah satu konfigurasi Redis
const envSchemaWithRefinement = envSchema.superRefine((data, ctx) => {
  if (data.NODE_ENV === "production") {
    const hasUpstash =
      data.UPSTASH_REDIS_REST_URL && data.UPSTASH_REDIS_REST_TOKEN;
    const hasRedis = data.REDIS_URL;

    if (!hasUpstash && !hasRedis) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Production requires Redis configuration. Set either UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (recommended for Vercel) or REDIS_URL. Without Redis, rate limiting is NOT effective on serverless multi-instance deployments.",
        path: ["UPSTASH_REDIS_REST_URL"],
      });
    }
  }
});

function parse(): z.infer<typeof envSchema> {
  const raw = {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    REDIS_URL: process.env.REDIS_URL,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  };

  const result = envSchemaWithRefinement.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Missing or invalid environment variables:\n${issues}`);
  }
  return result.data;
}

export const env = parse();
