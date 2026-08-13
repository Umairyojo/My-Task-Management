import 'dotenv/config';

import { defineConfig, env } from 'prisma/config';

function buildFallbackShadowDatabaseUrl(databaseUrl: string): string {
  const shadowUrl = new URL(databaseUrl);
  shadowUrl.searchParams.set('schema', 'prisma_shadow');

  return shadowUrl.toString();
}

const databaseUrl = env('DATABASE_URL');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
    shadowDatabaseUrl:
      process.env.SHADOW_DATABASE_URL ??
      buildFallbackShadowDatabaseUrl(databaseUrl),
  },
});
