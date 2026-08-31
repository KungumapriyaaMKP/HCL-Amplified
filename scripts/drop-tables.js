require('dotenv').config({path: '.env.local'});
const postgres = require('postgres');
const sql = postgres(process.env.DIRECT_DATABASE_URL);

async function run() {
  try {
    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
    for (let t of tables) {
      await sql.unsafe(`DROP TABLE IF EXISTS "${t.tablename}" CASCADE`);
    }
    console.log('Dropped all tables in public schema');
  } catch (e) {
    console.error(e);
  } finally {
    sql.end();
  }
}
run();
