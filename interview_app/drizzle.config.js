/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./utils/schema.js",
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:CsP9Y8zvxuyH@ep-quiet-waterfall-a58rnc41.us-east-2.aws.neon.tech/AI_Interview?sslmode=require',
  }
};