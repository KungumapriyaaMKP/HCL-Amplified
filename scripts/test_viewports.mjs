import { execSync } from "child_process";
import fs from "fs";

const viewports = [
  { name: "Mobile", width: 375, height: 667 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Ultrawide", width: 2560, height: 1440 }
];

const routes = [
  "/dashboard",
  "/goals/new",
  "/login",
  "/community/web-dev",
  "/leaderboard",
  "/profile"
];

const results = [];

async function auditRoute(vp, route) {
  console.log(`Auditing ${route} on ${vp.name} (${vp.width}x${vp.height})...`);
  
  // Login first to ensure access, then set viewport and navigate
  const loginAndNav = `
    agent-browser --session chaos_auditor open "http://localhost:3000/login?next=${encodeURIComponent(route)}";
    agent-browser --session chaos_auditor wait 1000;
    agent-browser --session chaos_auditor set viewport ${vp.width} ${vp.height};
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
    agent-browser --session chaos_auditor open "http://localhost:3000${route}";
    agent-browser --session chaos_auditor wait 2000;
    agent-browser --session chaos_auditor eval "(() => {
      const scrollW = document.documentElement.scrollWidth;
      const innerW = window.innerWidth;
      const hasHorizontalOverflow = scrollW > innerW;
      
      // Find all buttons, links, and inputs that are smaller than 48x48
      const elements = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
      const smallTargets = elements.map(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === 'none') return null;
        if (rect.width < 44 || rect.height < 44) {
          return {
            tag: el.tagName.toLowerCase(),
            text: (el.innerText || el.getAttribute('aria-label') || el.placeholder || el.value || '').slice(0, 30).trim(),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            class: el.className ? el.className.slice(0, 40) : ''
          };
        }
        return null;
      }).filter(Boolean);

      // Check sidebar / mobile navigation
      const sidebar = document.querySelector('aside') || document.querySelector('nav');
      const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;

      // Check overlapping headings or clipped text
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => {
        const r = h.getBoundingClientRect();
        return {
          text: h.innerText.slice(0, 30),
          width: Math.round(r.width),
          height: Math.round(r.height),
          clipped: r.right > innerW
        };
      });

      return {
        url: window.location.href,
        viewport: '${vp.name}',
        innerW,
        scrollW,
        hasHorizontalOverflow,
        overflowDelta: scrollW - innerW,
        smallTargetsCount: smallTargets.length,
        smallTargetsSample: smallTargets.slice(0, 10),
        clippedHeadings: headings.filter(h => h.clipped)
      };
    })()"
  `;

  try {
    const rawOutput = execSync(loginAndNav, { shell: "powershell", encoding: "utf-8" });
    // Parse last line of output containing JSON
    const lines = rawOutput.trim().split("\n");
    let jsonStr = lines[lines.length - 1];
    let data = null;
    try {
      data = JSON.parse(jsonStr);
    } catch(e) {
      data = { raw: rawOutput };
    }
    console.log(`  -> Overflow: ${data.hasHorizontalOverflow ? `YES (+${data.overflowDelta}px)` : 'No'}, Small Targets (<44px): ${data.smallTargetsCount}`);
    results.push({ route, viewport: vp.name, data });
  } catch (err) {
    console.error(`  -> Error testing ${route}:`, err.message);
    results.push({ route, viewport: vp.name, error: err.message });
  }
}

async function run() {
  for (const vp of viewports) {
    console.log(`\n================ VIEWPORT: ${vp.name} (${vp.width}x${vp.height}) ================`);
    for (const r of routes) {
      await auditRoute(vp, r);
    }
  }

  fs.writeFileSync("scripts/viewport_audit_results.json", JSON.stringify(results, null, 2));
  console.log("\n=== VIEWPORT AUDIT COMPLETE (Results saved to scripts/viewport_audit_results.json) ===");
}

run().catch(console.error);
