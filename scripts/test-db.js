require('dotenv').config({path: '.env.local'});
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres.unsixpfernagklwgsonz:MrmoqfZiUyNID8LO@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres');
sql`SELECT 1`.then(() => console.log('Connected!')).catch(e => console.error('Error:', e)).finally(() => sql.end());
