const fs = require('fs');
const path = require('path');

const docsDir = 'C:\\\\Docs\\\\mintlify-docs';
const pad = (n) => n.toString().padStart(2, '0');

// --- Journey Tab Pages ---
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

// ============================================================
//  PLATFORM GROUPS — Maps to 28 features across 8 sections
// ============================================================

const platformSections = {
  // ── Section A: Setup & Permissions (Feature #1) ──
  "Setup & Permissions": {
    icon: "shield-halved",
    pages: [
      { path: "platform/permissions/audit",         title: "OS Permissions",     desc: "Overview of the 8-point system configuration audit" },
      { path: "platform/permissions/accessibility",  title: "Accessibility",      desc: "Accessibility Service for app blocking & strict mode" },
      { path: "platform/permissions/admin-lock",     title: "Admin Lock",         desc: "Uninstall protection via Device Administrator" },
      { path: "platform/permissions/appear-on-top",  title: "Appear On Top",      desc: "Full-screen overlay rendering for anti-skip overlays" },
      { path: "platform/permissions/battery-opt",    title: "Battery Bypass",     desc: "Bypass battery-saver restrictions for background running" },
      { path: "platform/permissions/camera",         title: "Camera",             desc: "Required for live photo & video verification" },
      { path: "platform/permissions/location",       title: "Location",           desc: "Needed for geofencing and location-based tasks" },
      { path: "platform/permissions/notifications",  title: "Notifications",      desc: "For reminders and randomized checks" },
      { path: "platform/permissions/alarms",         title: "Alarms",             desc: "Needed for wake-up commitments & schedules" },
    ]
  },

  // ── Section B: Commitment Wizard (Features #2–10) ──
  "Commitment Wizard": {
    icon: "wand-magic-sparkles",
    pages: [
      { path: "platform/wizard/naming-conditions",  title: "Naming & Conditions",   desc: "Enter a name and attach conditions: Time, Location, Partner" },
      { path: "platform/wizard/time-slots",         title: "Time Slots",            desc: "Pick days, toggle repeat, add multiple time windows per day" },
      { path: "platform/wizard/attachments",        title: "Slot Attachments",      desc: "Attach location, app blocks, and rules to each time slot independently" },
      { path: "platform/wizard/app-web-blocking",   title: "App & Web Blocking",    desc: "Block apps, websites, or use AI to generate block rules" },
      { path: "platform/wizard/penalties",          title: "Penalties",             desc: "Stake money, embarrassing photo, or block favourite apps" },
      { path: "platform/wizard/waivers",            title: "Penalty Waivers",       desc: "CAPTCHAs, text transcription, or redo with more intensity" },
      { path: "platform/wizard/verification-modes", title: "Verification Modes",    desc: "Just Show Up vs Stay Throughout — two enforcement paradigms" },
      { path: "platform/wizard/alarm-config",       title: "Alarm Config",          desc: "When to start, frequency, and persistence across reboots" },
      { path: "platform/wizard/commit-action",      title: "The Commit Action",     desc: "Three-step atomic write: Convex → SQLite → AlarmManager" },
    ]
  },

  // ── Section C: Dashboard (Features #11–13) ──
  "Dashboard": {
    icon: "gauge-high",
    pages: [
      { path: "platform/dashboard/active-commits",      title: "Active CommitTs",      desc: "Shows all commitments with status icons" },
      { path: "platform/dashboard/upcoming-card",        title: "Upcoming Card",        desc: "Top card showing next commitment with countdown timer" },
      { path: "platform/dashboard/verification-modal",   title: "Verification Modal",   desc: "Popup with task details, map embed, penalty, and waiver info" },
    ]
  },

  // ── Section D: Calendar (Features #14–17) ──
  "Calendar": {
    icon: "calendar-check",
    pages: [
      { path: "platform/calendar/calendar-view",      title: "Calendar View",      desc: "Shows all task instances as events on a calendar grid" },
      { path: "platform/calendar/event-interaction",   title: "Event Interaction",  desc: "Tap an event to open verification modal with instance details" },
      { path: "platform/calendar/drag-drop",           title: "Drag & Drop",        desc: "Directly manipulate, resize, and delete events on the calendar" },
      { path: "platform/calendar/strict-mode",         title: "Strict Mode",        desc: "Make tasks un-deletable and un-editable until completion" },
    ]
  },

  // ── Section E: Presets & Planning (Features #18–21) ──
  "Presets & Planning": {
    icon: "bookmark",
    pages: [
      { path: "platform/presets/location-presets",   title: "Location Presets",   desc: "Save frequently used places: Gym, Library, Office, etc." },
      { path: "platform/presets/blocklist-presets",   title: "Blocklist Presets",  desc: "Save groups of apps you always block together" },
      { path: "platform/presets/rule-presets",        title: "Rule Presets",       desc: "Save complete verification configurations for reuse" },
      { path: "platform/presets/day-planning",        title: "Day Planning",       desc: "Configure your entire day in one screen using presets" },
    ]
  },

  // ── Section F: Alerts (Feature #22) ──
  "Alerts": {
    icon: "bell",
    pages: [
      { path: "platform/alerts/upcoming",   title: "Upcoming",   desc: "Shows next pending tasks with location and end time" },
      { path: "platform/alerts/waivers",    title: "Waivers",    desc: "Active waiver sessions if any penalty waivers are in progress" },
      { path: "platform/alerts/verified",   title: "Verified",   desc: "History of completed verifications with proof" },
    ]
  },

  // ── Section G: Profile & Account (Features #23–27) ──
  "Profile & Account": {
    icon: "user-gear",
    pages: [
      { path: "platform/profile/block-screen",     title: "Block Screen",      desc: "Configure the blocking overlay appearance" },
      { path: "platform/profile/notifications",    title: "Notifications",     desc: "Notification preferences and channel configuration" },
      { path: "platform/profile/resync",           title: "Full Resync",       desc: "Wipe local data, fetch fresh from Convex, rebuild SQLite" },
      { path: "platform/profile/accounts",         title: "Accounts",          desc: "Switch accounts, log out, or delete your account" },
      { path: "platform/profile/device-marriage",  title: "Device Marriage",   desc: "One account = one device while commitments are active" },
    ]
  },

  // ── Section H: Advanced (Feature #28) ──
  "Advanced": {
    icon: "puzzle-piece",
    pages: [
      { path: "platform/advanced/combo-conditions", title: "Combo Conditions", desc: "Mix and match Time + Location + App Block conditions" },
    ]
  },
};

// --- Build navigation structure ---
const platformGroups = Object.entries(platformSections).map(([name, def]) => ({
  group: name, icon: def.icon, pages: def.pages.map(p => p.path)
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
              { "group": "Client Side", "icon": "display", "pages": [
                "client-side/overview",
                "client-side/folder-structure",
                { "group": "Routing and Screens", "pages": [
                  "client-side/routing/root-layout",
                  "client-side/routing/auth-flow",
                  "client-side/routing/dashboard",
                  "client-side/routing/commitment-wizard",
                  "client-side/routing/time-location",
                  "client-side/routing/app-blocker",
                  "client-side/routing/calendar-schedules",
                  "client-side/routing/penalties-flow",
                  "client-side/routing/waivers-flow",
                  "client-side/routing/settings-permissions",
                  "client-side/routing/strict-mode",
                  "client-side/routing/preset-editing",
                  "client-side/routing/verification-flow"
                ]},
                { "group": "State Management", "pages": [
                  "client-side/state/task-draft-store",
                  "client-side/state/calendar-store",
                  "client-side/state/preset-store",
                  "client-side/state/commit-store",
                  "client-side/state/verification-store",
                  "client-side/state/heal-store",
                  "client-side/state/preset-edit-store",
                  "client-side/state/app-store",
                  "client-side/state/task-store",
                  "client-side/state/chaos-store"
                ]},
                { "group": "Core Infrastructure", "pages": [
                  "client-side/infrastructure/triple-write",
                  "client-side/infrastructure/sync-engine",
                  "client-side/infrastructure/sync-lock",
                  "client-side/infrastructure/local-database",
                  "client-side/infrastructure/local-db-commits",
                  "client-side/infrastructure/local-db-instances",
                  "client-side/infrastructure/logger",
                  "client-side/infrastructure/scheduler-bridge",
                  "client-side/infrastructure/auth-client",
                  "client-side/infrastructure/time-utilities",
                  "client-side/infrastructure/validation"
                ]},
                { "group": "Hooks", "pages": [
                  "client-side/hooks/hydration-sync",
                  "client-side/hooks/preset-hydration",
                  "client-side/hooks/commit-task",
                  "client-side/hooks/task-actions",
                  "client-side/hooks/tasks",
                  "client-side/hooks/verification-engine",
                  "client-side/hooks/upcoming-verification",
                  "client-side/hooks/location",
                  "client-side/hooks/permissions",
                  "client-side/hooks/calendar-events",
                  "client-side/hooks/calendar-range",
                  "client-side/hooks/event-detail",
                  "client-side/hooks/penalty-sync",
                  "client-side/hooks/waiver-sync",
                  "client-side/hooks/task-selection",
                  "client-side/hooks/app-discovery",
                  "client-side/hooks/accountability-prefill",
                  "client-side/hooks/fresh-photo-url"
                ]},
                { "group": "Components", "pages": [
                  "client-side/components/hydration-engine",
                  "client-side/components/security-shield",
                  "client-side/components/connection-watchdog",
                  "client-side/components/heal-overlay",
                  "client-side/components/ui-components",
                  "client-side/components/dev-tools"
                ]},
                { "group": "Providers and Contexts", "pages": [
                  "client-side/providers/resurrection",
                  "client-side/providers/convex-wrapper",
                  "client-side/providers/app-theme",
                  "client-side/providers/tab-context"
                ]}
              ]},
              { "group": "Convex Backend & Packages", "icon": "server", "pages": [
                "backend/overview",
                "backend/schema",
                { "group": "Convex Endpoints", "pages": ["backend/api/overview"] },
                { "group": "Convex Core Logic", "pages": ["backend/core/overview"] },
                { "group": "Convex Database", "pages": ["backend/db/overview"] },
                { "group": "Convex Execution", "pages": ["backend/execution/overview"] },
                { "group": "Convex AI", "pages": ["backend/ai/overview"] },
                { "group": "Convex Middleware", "pages": ["backend/middleware/overview"] },
                { "group": "Convex Lib", "pages": ["backend/lib/overview"] },
                { "group": "Shared Packages", "pages": [
                  "backend/packages/config",
                  "backend/packages/env",
                  "backend/packages/telemetry",
                  "backend/packages/extension",
                  "backend/packages/mobile"
                ]}
              ]},
              { "group": "Native Modules", "icon": "microchip", "pages": [
                "native-modules/overview",
                "native-modules/alarm-module",
                "native-modules/app-lister-module",
                "native-modules/blocker-module",
                "native-modules/enforcement-module",
                "native-modules/logcat-module",
                "native-modules/recovery-module",
                "native-modules/scheduler-module"
              ]}
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

// --- Generate stubs (ONLY if file doesn't exist) ---
Object.values(platformSections).forEach(groupDef => {
  groupDef.pages.forEach(page => {
    const fullPath = path.join(docsDir, page.path + '.mdx');
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, `---\ntitle: "${page.title}"\ndescription: "${page.desc}"\n---\n\n# ${page.title}\n\n${page.desc}.\n\n*Detailed documentation coming soon.*\n`);
      console.log(`Created stub: ${page.path}.mdx`);
    } else {
      // Only update frontmatter title — preserve custom content
      let content = fs.readFileSync(fullPath, 'utf8');
      const replaced = content.replace(/^title:\s*["']?.*?["']?$/m, `title: "${page.title}"`);
      fs.writeFileSync(fullPath, replaced, 'utf8');
      console.log(`Title updated: ${page.path}.mdx`);
    }
  });
});

// --- Helper to update existing non-platform MDX titles ---
function updateMdxTitle(pagePath, newTitle) {
  const fp = path.join(docsDir, pagePath + '.mdx');
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    const replaced = content.replace(/^title:\s*["']?.*?["']?$/m, `title: "${newTitle}"`);
    fs.writeFileSync(fp, replaced, 'utf8');
  } else {
    const dir = path.dirname(fp);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fp, `---\ntitle: "${newTitle}"\ndescription: "Documentation for ${newTitle}."\n---\n\n# ${newTitle}\n\n*Detailed documentation coming soon.*\n`);
  }
}

updateMdxTitle("quickstart", "Quick Start");
updateMdxTitle("setup-env", "Environment Setup");
updateMdxTitle("start-developing", "Developing");
updateMdxTitle("architecture/overview", "Overview");
updateMdxTitle("architecture/sync-engine", "Sync Engine");
updateMdxTitle("architecture/local-database", "Local Database");
updateMdxTitle("architecture/write-gate", "Write Gate");
updateMdxTitle("architecture/state-management", "State Management");
updateMdxTitle("architecture/app-routes", "App Routes");
updateMdxTitle("backend/schema", "Schema");
updateMdxTitle("native-modules/overview", "Overview");

fs.writeFileSync(path.join(docsDir, 'docs.json'), JSON.stringify(config, null, 2));
console.log('\n✅ Done! Full 28-feature sidebar skeleton generated.');
console.log(`Total platform groups: ${Object.keys(platformSections).length}`);
console.log(`Total platform pages: ${Object.values(platformSections).reduce((sum, g) => sum + g.pages.length, 0)}`);
