import http from 'http';

async function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) {}
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data, json });
      });
    });
    req.on('error', reject);
    if (body) {
      if (typeof body === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING FUZZ & BOUNDARY API TESTS ===\n');
  const results = [];

  // 1. /api/auth/signup fuzzing
  console.log('[1] Testing /api/auth/signup...');
  
  // 1.1 Empty fields
  const emptyRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signup',
    method: 'POST'
  }, {});
  console.log('  1.1 Empty fields -> Status:', emptyRes.statusCode, emptyRes.json);
  results.push({ test: 'auth_signup_empty', res: emptyRes });

  // 1.2 10,000 characters
  const longA = 'A'.repeat(10000);
  const longRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signup',
    method: 'POST'
  }, { email: `${longA}@example.com`, password: 'password123', displayName: longA });
  console.log('  1.2 10,000 chars -> Status:', longRes.statusCode, longRes.json);
  results.push({ test: 'auth_signup_10k_chars', res: longRes });

  // 1.3 Unicode / emojis
  const emojiRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signup',
    method: 'POST'
  }, { email: '🔥🚀💻\u0000@example.com', password: 'password123', displayName: '🔥🚀💻\u0000' });
  console.log('  1.3 Emojis/Unicode -> Status:', emojiRes.statusCode, emojiRes.json);
  results.push({ test: 'auth_signup_unicode', res: emojiRes });

  // 1.4 XSS Payloads
  const xssRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signup',
    method: 'POST'
  }, { email: '<script>alert(1)</script>@test.com', password: 'password123', displayName: '<script>alert("xss")</script>' });
  console.log('  1.4 XSS Payloads -> Status:', xssRes.statusCode, xssRes.json);
  results.push({ test: 'auth_signup_xss', res: xssRes });

  // 1.5 SQL Injection
  const sqliRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signup',
    method: 'POST'
  }, { email: "admin' OR 1=1 --@test.com", password: "' OR '1'='1", displayName: "admin' OR 1=1 --" });
  console.log('  1.5 SQL Injection -> Status:', sqliRes.statusCode, sqliRes.json);
  results.push({ test: 'auth_signup_sqli', res: sqliRes });

  // 2. /api/compiler/run fuzzing
  console.log('\n[2] Testing /api/compiler/run...');

  // 2.1 Invalid language
  const invalidLangRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/compiler/run',
    method: 'POST'
  }, { language: 'c++', code: 'int main(){return 0;}' });
  console.log('  2.1 Invalid Language (c++) -> Status:', invalidLangRes.statusCode, invalidLangRes.json);
  results.push({ test: 'compiler_invalid_lang', res: invalidLangRes });

  // 2.2 Empty code
  const emptyCodeRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/compiler/run',
    method: 'POST'
  }, { language: 'javascript', code: '' });
  console.log('  2.2 Empty Code -> Status:', emptyCodeRes.statusCode, emptyCodeRes.json);
  results.push({ test: 'compiler_empty_code', res: emptyCodeRes });

  // 2.3 Infinite loop code (while(true){})
  console.log('  2.3 Testing Infinite loop (timeout check)...');
  const startTime = Date.now();
  const loopRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/compiler/run',
    method: 'POST'
  }, { language: 'javascript', code: 'while(true){}' });
  const duration = (Date.now() - startTime) / 1000;
  console.log(`  2.3 Infinite Loop -> Duration: ${duration}s, Status:`, loopRes.statusCode, loopRes.json);
  results.push({ test: 'compiler_infinite_loop', duration, res: loopRes });

  // 2.4 Dangerous sys calls (child_process, process.exit, fs access)
  console.log('  2.4 Dangerous System Calls...');
  const dangerRes1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/compiler/run',
    method: 'POST'
  }, { language: 'javascript', code: 'const fs = require("fs"); console.log("ENV_EXISTS:", fs.existsSync(".env.local"));' });
  console.log('  2.4.1 Filesystem access (.env.local check) ->', dangerRes1.statusCode, dangerRes1.json);

  const dangerRes2 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/compiler/run',
    method: 'POST'
  }, { language: 'javascript', code: 'const cp = require("child_process"); console.log("WHOAMI:", cp.execSync("whoami").toString());' });
  console.log('  2.4.2 Child Process execution ->', dangerRes2.statusCode, dangerRes2.json);

  const dangerRes3 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/compiler/run',
    method: 'POST'
  }, { language: 'python', code: 'import os; print("ENV_VARS:", list(os.environ.keys())[:5])' });
  console.log('  2.4.3 Python environment inspection ->', dangerRes3.statusCode, dangerRes3.json);

  // 2.5 Code length boundary (>20,000 chars)
  const hugeCode = 'console.log("x");\n'.repeat(1500); // >20,000 chars
  const hugeCodeRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/compiler/run',
    method: 'POST'
  }, { language: 'javascript', code: hugeCode });
  console.log('  2.5 Code > 20k chars -> Status:', hugeCodeRes.statusCode, hugeCodeRes.json);

  // 3. /api/goals fuzzing
  console.log('\n[3] Testing /api/goals...');
  
  // 3.1 0 chars
  const goal0Res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/goals',
    method: 'POST'
  }, { domain: 'web-dev', trackPace: 'balanced', goalText: '' });
  console.log('  3.1 Goal 0 chars -> Status:', goal0Res.statusCode, goal0Res.json);

  // 3.2 2 chars (too short)
  const goal2Res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/goals',
    method: 'POST'
  }, { domain: 'web-dev', trackPace: 'balanced', goalText: 'hi' });
  console.log('  3.2 Goal 2 chars -> Status:', goal2Res.statusCode, goal2Res.json);

  // 3.3 10,000 chars
  const goal10kRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/goals',
    method: 'POST'
  }, { domain: 'web-dev', trackPace: 'balanced', goalText: 'A'.repeat(10000) });
  console.log('  3.3 Goal 10,000 chars -> Status:', goal10kRes.statusCode, goal10kRes.json);

  // 3.4 Invalid domain
  const goalBadDom = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/goals',
    method: 'POST'
  }, { domain: 'hacked-domain', trackPace: 'balanced', goalText: 'Learn hacking' });
  console.log('  3.4 Bad domain -> Status:', goalBadDom.statusCode, goalBadDom.json);

  // 4. /api/community/[domain] fuzzing
  console.log('\n[4] Testing /api/community/web-dev...');
  
  // 4.1 Empty post
  const commEmpty = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/community/web-dev',
    method: 'POST'
  }, { content: '' });
  console.log('  4.1 Empty post -> Status:', commEmpty.statusCode, commEmpty.json);

  // 4.2 5,000+ chars post (POST_MAX_LENGTH is 2000)
  const comm5k = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/community/web-dev',
    method: 'POST'
  }, { content: 'X'.repeat(5000) });
  console.log('  4.2 5000+ chars post -> Status:', comm5k.statusCode, comm5k.json);

  // 4.3 Script tag in post
  const commScript = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/community/web-dev',
    method: 'POST'
  }, { content: '<script>alert("xss")</script><img src=x onerror=alert(1)>' });
  console.log('  4.3 Script tag in post -> Status:', commScript.statusCode, commScript.json);

  console.log('\n=== API FUZZ TESTS FINISHED ===');
}

runTests().catch(console.error);
