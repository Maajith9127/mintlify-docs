const fs = require('fs');
const path = require('path');

const docsDir = 'C:\\\\Docs\\\\mintlify-docs';
const pad = (n) => n.toString().padStart(2, '0');

// --- Build all journey page arrays ---
const dec2025Pages = [];
for (let i = 4; i <= 31; i++) dec2025Pages.push(`2025/december/day-${pad(i)}`);

const jan2026Pages = [];
for (let i = 1; i <= 31; i++) jan2026Pages.push(`2026/january/day-${pad(i)}`);

const feb2026Pages = [];
for (let i = 1; i <= 28; i++) feb2026Pages.push(`2026/february/day-${pad(i)}`);

const mar2026Pages = [];
for (let i = 1; i <= 31; i++) mar2026Pages.push(`2026/march/day-${pad(i)}`);

const apr2026Pages = [];
for (let i = 1; i <= 30; i++) {
  if (i === 16) continue;
  apr2026Pages.push(`2026/april/day-${pad(i)}`);
}

const may2026Pages = [];
for (let i = 1; i <= 15; i++) {
  if (i === 7) continue;
  may2026Pages.push(`2026/may/day-${pad(i)}`);
}

// --- Configure Navigation ---
const config = {
  "$schema": "https://mintlify.com/docs.json",
  "theme": "mint",
  "name": "CommitT",
  "colors": {
    "primary": "#C6613F",
    "light": "#E27E5A",
    "dark": "#080808"
  },
  "favicon": "/favicon.svg",
  "navbar": {
    "links": [
      { "label": "Changelog", "href": "https://github.com/Maajith9127/CommitT/commits/main" }
    ],
    "primary": {
      "type": "button",
      "label": "Star Us on GitHub",
      "href": "https://github.com/Maajith9127/CommitT"
    }
  },
  "navigation": {
    "tabs": [
      {
        "tab": "Home",
        "icon": "house",
        "groups": [
          {
            "group": "Get Started",
            "icon": "play",
            "pages": [
              "index",
              "quickstart",
              "setup-env",
              "start-developing"
            ]
          },
          {
            "group": "Setup & Permissions",
            "icon": "shield-halved",
            "pages": [
              "platform/permissions/audit",
              "platform/permissions/admin-lock",
              "platform/permissions/appear-on-top",
              "platform/permissions/battery-opt"
            ]
          },
          {
            "group": "Core Configuration",
            "icon": "calendar-days",
            "pages": [
              "platform/config/task-instances",
              "platform/config/time-slots",
              "platform/config/attachments",
              "platform/config/presets",
              "platform/config/day-planning"
            ]
          },
          {
            "group": "Verification & Enforcement",
            "icon": "mobile-screen",
            "pages": [
              "platform/enforcement/app-blocker",
              "platform/enforcement/web-filter",
              "platform/enforcement/ai-rules",
              "platform/enforcement/gps-geofencing",
              "platform/enforcement/just-show-up",
              "platform/enforcement/stay-throughout"
            ]
          },
          {
            "group": "Penalties & Waivers",
            "icon": "envelope",
            "pages": [
              "platform/penalties/durable-cloud",
              "platform/penalties/stake-money",
              "platform/penalties/social-accountability",
              "platform/penalties/captcha-defusal",
              "platform/penalties/text-transcription",
              "platform/penalties/intensity-redo"
            ]
          },
          {
            "group": "Security & Integrity",
            "icon": "lock",
            "pages": [
              "platform/security/strict-mode",
              "platform/security/device-marriage",
              "platform/security/nuke-pave"
            ]
          },
          {
            "group": "Architecture & Guides",
            "icon": "sitemap",
            "pages": [
              "architecture/overview",
              "architecture/sync-engine",
              "architecture/local-database",
              "architecture/write-gate",
              "architecture/state-management",
              "architecture/app-routes"
            ]
          },
          {
            "group": "Convex Backend",
            "icon": "server",
            "pages": [
              "backend/schema"
            ]
          },
          {
            "group": "Native Modules",
            "icon": "microchip",
            "pages": [
              "native-modules/overview"
            ]
          }
        ]
      },
      {
        "tab": "Journey",
        "icon": "route",
        "groups": [
          {
            "group": "2025 Logs",
            "icon": "calendar",
            "pages": [
              { "group": "December", "pages": dec2025Pages }
            ]
          },
          {
            "group": "2026 Logs",
            "icon": "calendar-days",
            "pages": [
              { "group": "January", "pages": jan2026Pages },
              { "group": "February", "pages": feb2026Pages },
              { "group": "March", "pages": mar2026Pages },
              { "group": "April", "pages": apr2026Pages },
              { "group": "May", "pages": may2026Pages }
            ]
          }
        ]
      }
    ]
  },
  "logo": {
    "light": "/logo/light.svg",
    "dark": "/logo/dark.svg"
  },
  "contextual": {
    "options": ["copy", "view", "chatgpt", "claude", "perplexity", "mcp", "cursor", "vscode"]
  },
  "footer": {
    "socials": {
      "x": "https://x.com/Maajith_cmt",
      "linkedin": "https://www.linkedin.com/in/abdul-maajith-99165026b",
      "github": "https://github.com/Maajith9127"
    }
  }
};

// --- Auto-generate stubs for defined pages ---
function ensurePageExists(pagePath) {
  const fullPath = path.join(docsDir, pagePath + '.mdx');
  if (!fs.existsSync(fullPath)) {
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Generate clean stub content based on path
    const pathParts = pagePath.split('/');
    const filename = pathParts[pathParts.length - 1];
    const category = pathParts[pathParts.length - 2] || '';
    
    const title = filename
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    const desc = `Detailed documentation for the ${title} capability under the ${category.toUpperCase()} category.`;
    
    const content = `---
title: "${title}"
description: "${desc}"
---

# ${title}

This section documents the configuration and execution parameters of the ${title} capability.

*Detailed documentation coming soon.*
`;
    fs.writeFileSync(fullPath, content);
    console.log(`Auto-generated stub: ${pagePath}.mdx`);
  }
}

// Traverse tabs to check page existence
config.navigation.tabs.forEach(tab => {
  tab.groups.forEach(group => {
    group.pages.forEach(page => {
      if (typeof page === 'string') {
        ensurePageExists(page);
      } else if (page.pages && Array.isArray(page.pages)) {
        // Nested groups (e.g., December journey logs)
        page.pages.forEach(nestedPage => {
          if (typeof nestedPage === 'string') {
            ensurePageExists(nestedPage);
          }
        });
      }
    });
  });
});

// Write docs.json
const docsJsonPath = path.join(docsDir, 'docs.json');
fs.writeFileSync(docsJsonPath, JSON.stringify(config, null, 2));

// Remove mint.json to avoid conflicts
const mintJsonPath = path.join(docsDir, 'mint.json');
if (fs.existsSync(mintJsonPath)) {
  fs.unlinkSync(mintJsonPath);
  console.log('Removed old mint.json');
}

console.log('Successfully generated docs.json and verified all page stubs!');
