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

// --- Trimmed and Shortened Titles ---
const platformPages = {
  "Setup & Permissions": {
    groupIcon: "shield-halved",
    pages: [
      { path: "platform/permissions/audit", title: "OS Permissions", desc: "8-point Android permission prerequisite audit" },
      { path: "platform/permissions/admin-lock", title: "Admin Lock", desc: "Uninstall protection via Device Administrator" },
      { path: "platform/permissions/appear-on-top", title: "Appear On Top", desc: "Full-screen overlay rendering for app blocking" },
      { path: "platform/permissions/battery-opt", title: "Battery Bypass", desc: "Disable battery-saver restrictions for background persistence" }
    ]
  },
  "Core Configuration": {
    groupIcon: "calendar-days",
    pages: [
      { path: "platform/config/task-instances", title: "Task Instances", desc: "Immutable task instance generation" },
      { path: "platform/config/time-slots", title: "Time Slots", desc: "Multi-window daily scheduling with repeat toggles" },
      { path: "platform/config/attachments", title: "Attachments", desc: "Assign locations, blocklists, and rules per slot" },
      { path: "platform/config/presets", title: "Presets", desc: "Save and reuse locations, blocklists, and rules" },
      { path: "platform/config/day-planning", title: "Day Planning", desc: "Full-day routine configuration in a single view" }
    ]
  },
  "Verification & Enforcement": {
    groupIcon: "shield-check",
    pages: [
      { path: "platform/enforcement/app-blocker", title: "App Blocker", desc: "Block installed Android applications" },
      { path: "platform/enforcement/web-filter", title: "Web Filter", desc: "Restrict access to specific web domains" },
      { path: "platform/enforcement/ai-rules", title: "AI Rules", desc: "Natural-language block rule generation" },
      { path: "platform/enforcement/gps-geofencing", title: "GPS Geofencing", desc: "Real-time geofence checks via 1Hz GPS stream" },
      { path: "platform/enforcement/just-show-up", title: "Just Show Up", desc: "Single-check grace-window verification" },
      { path: "platform/enforcement/stay-throughout", title: "Stay Throughout", desc: "Randomized check-in alarms during session" }
    ]
  },
  "Penalties & Waivers": {
    groupIcon: "triangle-exclamation",
    pages: [
      { path: "platform/penalties/durable-cloud", title: "Durable Cloud", desc: "Serverless cloud penalty triggers" },
      { path: "platform/penalties/stake-money", title: "Stake Money", desc: "Financial stakes on commitments" },
      { path: "platform/penalties/social-accountability", title: "Social Proof", desc: "Email proof photos on failure" },
      { path: "platform/penalties/captcha-defusal", title: "CAPTCHA Defusal", desc: "Solve 1-400 CAPTCHAs to waive penalties" },
      { path: "platform/penalties/text-transcription", title: "Text Transcription", desc: "Transcribe long text to defuse penalties" },
      { path: "platform/penalties/intensity-redo", title: "Intensity Redo", desc: "Re-perform task at higher difficulty" }
    ]
  },
  "Security & Integrity": {
    groupIcon: "lock",
    pages: [
      { path: "platform/security/strict-mode", title: "Strict Mode", desc: "Immutable commitment locking at database layer" },
      { path: "platform/security/device-marriage", title: "Device Marriage", desc: "Bind sessions to physical device signatures" },
      { path: "platform/security/nuke-pave", title: "Nuke & Pave", desc: "Automatic SQLite wipe and cloud re-sync" }
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

// --- Generate stubs and overwrite titles ---
Object.values(platformPages).forEach(groupDef => {
  groupDef.pages.forEach(page => {
    const fullPath = path.join(docsDir, page.path + '.mdx');
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    // Write or rewrite frontmatter title
    fs.writeFileSync(fullPath, `---\ntitle: "${page.title}"\ndescription: "${page.desc}"\n---\n\n# ${page.title}\n\n${page.desc}.\n\n*Detailed documentation coming soon.*\n`);
    console.log(`Generated/Updated: ${page.path}.mdx (title: ${page.title})`);
  });
});

// --- Helper to update existing non-platform MDX titles ---
function updateMdxTitle(pagePath, newTitle) {
  const fp = path.join(docsDir, pagePath + '.mdx');
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    // Replace frontmatter title line
    const replaced = content.replace(/^title:\s*["']?.*?["']?$/m, `title: "${newTitle}"`);
    fs.writeFileSync(fp, replaced, 'utf8');
    console.log(`Updated title for ${pagePath}.mdx to "${newTitle}"`);
  } else {
    // Generate new stub if it doesn't exist
    const dir = path.dirname(fp);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fp, `---\ntitle: "${newTitle}"\ndescription: "Documentation for ${newTitle}."\n---\n\n# ${newTitle}\n\n*Detailed documentation coming soon.*\n`);
    console.log(`Generated missing stub: ${pagePath}.mdx`);
  }
}

// Update Get Started page titles
updateMdxTitle("quickstart", "Quick Start");
updateMdxTitle("setup-env", "Environment Setup");
updateMdxTitle("start-developing", "Developing");

// Update Guides page titles
updateMdxTitle("architecture/overview", "Overview");
updateMdxTitle("architecture/sync-engine", "Sync Engine");
updateMdxTitle("architecture/local-database", "Local Database");
updateMdxTitle("architecture/write-gate", "Write Gate");
updateMdxTitle("architecture/state-management", "State Management");
updateMdxTitle("architecture/app-routes", "App Routes");
updateMdxTitle("backend/schema", "Schema");
updateMdxTitle("native-modules/overview", "Overview");

fs.writeFileSync(path.join(docsDir, 'docs.json'), JSON.stringify(config, null, 2));
console.log('Done! Collapsible groups with trimmed page titles generated.');
