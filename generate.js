const fs = require('fs');
const path = require('path');

const docsDir = 'C:\\\\Docs\\\\mintlify-docs';
const pad = (n) => n.toString().padStart(2, '0');

const dec2025Pages = [];
for (let i = 4; i <= 31; i++) dec2025Pages.push(`2025/december/day-${pad(i)}`);
const jan2026Pages = [];
for (let i = 1; i <= 31; i++) jan2026Pages.push(`2026/january/day-${pad(i)}`);
const feb2026Pages = [];
for (let i = 1; i <= 28; i++) feb2026Pages.push(`2026/february/day-${pad(i)}`);
const mar2026Pages = [];
for (let i = 1; i <= 31; i++) mar2026Pages.push(`2026/march/day-${pad(i)}`);
const apr2026Pages = [];
for (let i = 1; i <= 30; i++) { if (i === 16) continue; apr2026Pages.push(`2026/april/day-${pad(i)}`); }
const may2026Pages = [];
for (let i = 1; i <= 15; i++) { if (i === 7) continue; may2026Pages.push(`2026/may/day-${pad(i)}`); }

// --- Page definitions (NO icon on individual pages) ---
const platformPages = {
  "Setup & Permissions": {
    groupIcon: "shield-halved",
    pages: [
      { path: "platform/permissions/audit", title: "OS Permissions Audit", desc: "8-point Android permission prerequisite audit" },
      { path: "platform/permissions/admin-lock", title: "Device Admin Lock", desc: "Uninstall protection via Device Administrator" },
      { path: "platform/permissions/appear-on-top", title: "Appear On Top", desc: "Full-screen overlay rendering for app blocking" },
      { path: "platform/permissions/battery-opt", title: "Battery Optimization Bypass", desc: "Disable battery-saver restrictions for background persistence" }
    ]
  },
  "Core Configuration": {
    groupIcon: "calendar-days",
    pages: [
      { path: "platform/config/task-instances", title: "Task & Instances", desc: "Immutable task instance generation" },
      { path: "platform/config/time-slots", title: "Flexible Time Slots", desc: "Multi-window daily scheduling with repeat toggles" },
      { path: "platform/config/attachments", title: "Per-Time-Slot Attachments", desc: "Assign locations, blocklists, and rules per slot" },
      { path: "platform/config/presets", title: "Configuration Presets", desc: "Save and reuse locations, blocklists, and rules" },
      { path: "platform/config/day-planning", title: "One-Screen Day Planning", desc: "Full-day routine configuration in a single view" }
    ]
  },
  "Verification & Enforcement": {
    groupIcon: "shield-check",
    pages: [
      { path: "platform/enforcement/app-blocker", title: "Digital App Blocker", desc: "Block installed Android applications" },
      { path: "platform/enforcement/web-filter", title: "Web Domain Filter", desc: "Restrict access to specific web domains" },
      { path: "platform/enforcement/ai-rules", title: "AI-Powered Rules", desc: "Natural-language block rule generation" },
      { path: "platform/enforcement/gps-geofencing", title: "1Hz GPS Geofencing", desc: "Real-time geofence checks via 1Hz GPS stream" },
      { path: "platform/enforcement/just-show-up", title: "Just Show Up Mode", desc: "Single-check grace-window verification" },
      { path: "platform/enforcement/stay-throughout", title: "Stay Throughout Mode", desc: "Randomized check-in alarms during session" }
    ]
  },
  "Penalties & Waivers": {
    groupIcon: "triangle-exclamation",
    pages: [
      { path: "platform/penalties/durable-cloud", title: "Durable Cloud Penalties", desc: "Serverless cloud penalty triggers" },
      { path: "platform/penalties/stake-money", title: "Stake Money", desc: "Financial stakes on commitments" },
      { path: "platform/penalties/social-accountability", title: "Social Accountability", desc: "Email proof photos on failure" },
      { path: "platform/penalties/captcha-defusal", title: "CAPTCHA Defusal", desc: "Solve 1-400 CAPTCHAs to waive penalties" },
      { path: "platform/penalties/text-transcription", title: "Text Transcription Waiver", desc: "Transcribe long text to defuse penalties" },
      { path: "platform/penalties/intensity-redo", title: "Intensity Redo", desc: "Re-perform task at higher difficulty" }
    ]
  },
  "Security & Integrity": {
    groupIcon: "lock",
    pages: [
      { path: "platform/security/strict-mode", title: "Strict Mode", desc: "Immutable commitment locking at database layer" },
      { path: "platform/security/device-marriage", title: "Device Marriage Protocol", desc: "Bind sessions to physical device signatures" },
      { path: "platform/security/nuke-pave", title: "Nuke & Pave Recovery", desc: "Automatic SQLite wipe and cloud re-sync" }
    ]
  }
};

const platformGroups = Object.entries(platformPages).map(([name, def]) => ({
  group: name, icon: def.groupIcon, pages: def.pages.map(p => p.path)
}));

const config = {
  "$schema": "https://mintlify.com/docs.json",
  "theme": "mint",
  "name": "CommitT",
  "colors": { "primary": "#C6613F", "light": "#E27E5A", "dark": "#080808" },
  "favicon": "/favicon.svg",
  "navbar": {
    "links": [{ "label": "Changelog", "href": "https://github.com/Maajith9127/CommitT/commits/main" }],
    "primary": { "type": "button", "label": "Star Us on GitHub", "href": "https://github.com/Maajith9127/CommitT" }
  },
  "navigation": {
    "tabs": [
      {
        "tab": "Home",
        "icon": "house",
        "groups": [
          {
            "group": "Get Started",
            "pages": [
              "index",
              { "group": "Quick Start", "icon": "rocket", "pages": ["quickstart", "setup-env", "start-developing"] }
            ]
          },
          {
            "group": "Platform",
            "pages": platformGroups
          },
          {
            "group": "Guides",
            "pages": [
              { "group": "Architecture", "icon": "sitemap", "pages": ["architecture/overview","architecture/sync-engine","architecture/local-database","architecture/write-gate","architecture/state-management","architecture/app-routes"] },
              { "group": "Convex Backend", "icon": "server", "pages": ["backend/schema"] },
              { "group": "Native Modules", "icon": "microchip", "pages": ["native-modules/overview"] }
            ]
          }
        ]
      },
      {
        "tab": "Journey",
        "icon": "route",
        "groups": [
          { "group": "2025 Logs", "icon": "calendar", "pages": [{ "group": "December", "pages": dec2025Pages }] },
          { "group": "2026 Logs", "icon": "calendar-days", "pages": [{ "group": "January", "pages": jan2026Pages },{ "group": "February", "pages": feb2026Pages },{ "group": "March", "pages": mar2026Pages },{ "group": "April", "pages": apr2026Pages },{ "group": "May", "pages": may2026Pages }] }
        ]
      }
    ]
  },
  "logo": { "light": "/logo/light.svg", "dark": "/logo/dark.svg" },
  "contextual": { "options": ["copy","view","chatgpt","claude","perplexity","mcp","cursor","vscode"] },
  "footer": { "socials": { "x": "https://x.com/Maajith_cmt", "linkedin": "https://www.linkedin.com/in/abdul-maajith-99165026b", "github": "https://github.com/Maajith9127" } }
};

// --- Generate stubs WITHOUT page-level icons ---
Object.values(platformPages).forEach(groupDef => {
  groupDef.pages.forEach(page => {
    const fullPath = path.join(docsDir, page.path + '.mdx');
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, `---\ntitle: "${page.title}"\ndescription: "${page.desc}"\n---\n\n# ${page.title}\n\n${page.desc}.\n\n*Detailed documentation coming soon.*\n`);
    console.log(`Generated: ${page.path}.mdx`);
  });
});

function ensurePageExists(p) {
  const fp = path.join(docsDir, p + '.mdx');
  if (!fs.existsSync(fp)) {
    const dir = path.dirname(fp); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const t = p.split('/').pop().split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    fs.writeFileSync(fp, `---\ntitle: "${t}"\ndescription: "Documentation for ${t}."\n---\n\n# ${t}\n\n*Detailed documentation coming soon.*\n`);
    console.log(`Auto-generated: ${p}.mdx`);
  }
}
["architecture/overview","architecture/sync-engine","architecture/local-database","architecture/write-gate","architecture/state-management","architecture/app-routes","backend/schema","native-modules/overview"].forEach(ensurePageExists);

fs.writeFileSync(path.join(docsDir, 'docs.json'), JSON.stringify(config, null, 2));
const mint = path.join(docsDir, 'mint.json'); if (fs.existsSync(mint)) { fs.unlinkSync(mint); console.log('Removed mint.json'); }
console.log('Done! Collapsible groups with section headers generated.');
