import { execSync } from "child_process";

async function testNavAbuse() {
  console.log("=== STARTING NAVIGATION ABUSE TESTS ===\n");

  // 1. Goal creation with immediate rapid back/forward
  console.log("[Nav 1] Rapid History Back/Forward during Goal Creation...");
  const cmd1 = `
    agent-browser --session chaos_auditor open "http://localhost:3000/login?next=/goals/new";
    agent-browser --session chaos_auditor wait 1000;
    agent-browser --session chaos_auditor eval "(() => {
      const em = document.querySelector('input[type=email]');
      const pw = document.querySelector('input[placeholder=Password]');
      if (em && pw) {
        em.value = 'chaos_tester_agent2@example.com';
        pw.value = 'Password123!';
        const btn = document.querySelector('button[type=submit]');
        if (btn) btn.click();
      }
    })()";
    agent-browser --session chaos_auditor wait 3000;
    agent-browser --session chaos_auditor open "http://localhost:3000/goals/new";
    agent-browser --session chaos_auditor wait 2000;
    agent-browser --session chaos_auditor eval "(() => {
      // Step 0 -> Step 1 -> Step 2
      document.querySelector('button.electric-glow-border').click();
      setTimeout(() => {
        const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Define Objective'));
        if (nextBtn) nextBtn.click();
        
        setTimeout(() => {
          const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Initiate Diagnostic Intake'));
          if (submitBtn) {
            submitBtn.click();
            // IMMEDIATE RAPID BACK AND FORWARD
            history.back();
            setTimeout(() => {
              history.forward();
              setTimeout(() => {
                history.back();
              }, 100);
            }, 100);
          }
        }, 500);
      }, 500);
    })()";
    agent-browser --session chaos_auditor wait 4000;
    agent-browser --session chaos_auditor eval "(() => {
      return {
        url: window.location.href,
        hasRoot: !!document.getElementById('__next') || !!document.querySelector('body'),
        bodyTextSnippet: document.body.innerText.slice(0, 150),
        isError: document.body.innerText.includes('Application error') || document.body.innerText.includes('Unhandled Runtime Error')
      };
    })()"
  `;

  try {
    const out1 = execSync(cmd1, { shell: "powershell", encoding: "utf-8" });
    const lines = out1.trim().split("\n");
    const jsonStr = lines[lines.length - 1];
    console.log("  Nav 1 Result:", jsonStr);
  } catch (e) {
    console.error("  Nav 1 Error:", e.message);
  }

  // 2. Rapid Back/Forward during Community post creation
  console.log("\n[Nav 2] Rapid History Back/Forward during Community Feed Operation...");
  const cmd2 = `
    agent-browser --session chaos_auditor open "http://localhost:3000/community/web-dev";
    agent-browser --session chaos_auditor wait 2000;
    agent-browser --session chaos_auditor eval "(() => {
      // Rapidly toggle back/forward 5 times
      for (let i = 0; i < 5; i++) {
        setTimeout(() => history.back(), i * 150);
        setTimeout(() => history.forward(), i * 150 + 75);
      }
    })()";
    agent-browser --session chaos_auditor wait 3000;
    agent-browser --session chaos_auditor eval "(() => {
      return {
        url: window.location.href,
        bodyTextSnippet: document.body.innerText.slice(0, 150),
        isError: document.body.innerText.includes('Application error') || document.body.innerText.includes('Unhandled Runtime Error')
      };
    })()"
  `;

  try {
    const out2 = execSync(cmd2, { shell: "powershell", encoding: "utf-8" });
    const lines = out2.trim().split("\n");
    const jsonStr = lines[lines.length - 1];
    console.log("  Nav 2 Result:", jsonStr);
  } catch (e) {
    console.error("  Nav 2 Error:", e.message);
  }

  console.log("\n=== NAVIGATION ABUSE TESTS COMPLETE ===");
}

testNavAbuse().catch(console.error);
