import { execSync } from 'child_process';

function ab(cmd) {
  try {
    const output = execSync(`agent-browser --session chaos_auditor ${cmd}`, { encoding: 'utf-8' });
    return output;
  } catch (err) {
    return err.stdout || err.message;
  }
}

console.log('Open:', ab('open http://localhost:3000/login'));
console.log('Eval:', ab('eval "document.title"'));
console.log('Session info:', ab('session info --json'));
