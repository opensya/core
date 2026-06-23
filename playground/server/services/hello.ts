import { defineService, tables, db } from 'opensya/server';

export default defineService(async () => {
  const [config] = await db.select().from(tables.config);
  return config;
});
