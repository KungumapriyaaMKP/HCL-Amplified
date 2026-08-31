require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function run() {
  console.log('Testing Supabase REST Client via HTTPS (Port 443)...');
  const { data, error } = await supabase.from('profiles').select('user_id').limit(1);
  if (error) {
    console.error('Supabase REST Error:', error);
  } else {
    console.log('SUCCESS! Profiles data fetched via HTTPS:', data);
  }
}

run();
