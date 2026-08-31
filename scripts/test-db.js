require('dotenv').config({path: '.env.local'});
const postgres = require('postgres');

async function test() {
  const regions = [
    'aws-0-ap-south-1',
    'aws-0-ap-southeast-1',
    'aws-0-us-east-1',
    'aws-0-us-west-1',
    'aws-0-eu-central-1',
    'aws-0-ap-northeast-1'
  ];

  for (const reg of regions) {
    const conn = `postgresql://postgres.unsixpfernagklwgsonz:MrmoqfZiUyNID8LO@${reg}.pooler.supabase.com:6543/postgres`;
    console.log(`Testing region ${reg}...`);
    try {
      const sql = postgres(conn, { ssl: 'require', connect_timeout: 4, prepare: false });
      const res = await sql`SELECT 1 as connected`;
      console.log(`SUCCESS on ${reg}!`, res);
      await sql.end();
      return reg;
    } catch (e) {
      console.error(`FAILED ${reg}:`, e.message || e);
    }
  }
}

test();
