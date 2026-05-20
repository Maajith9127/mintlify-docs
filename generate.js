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

// --- Build docs.json with 5 vertical tabs mapping directly to Expo style ---
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
          }
        ]
      },
      {
        "tab": "Guides",
        "icon": "book-open",
        "groups": [
          {
            "group": "Architecture",
            "icon": "sitemap",
            "pages": [
              "architecture/overview",
              "architecture/sync-engine",
              "architecture/local-database",
              "architecture/write-gate",
              "architecture/state-management",
              "architecture/app-routes"
            ]
          }
        ]
      },
      {
        "tab": "Convex",
        "icon": "server",
        "groups": [
          {
            "group": "Backend",
            "icon": "cloud",
            "pages": [
              "backend/schema"
            ]
          }
        ]
      },
      {
        "tab": "Reference",
        "icon": "cube",
        "groups": [
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

// Write docs.json
const docsJsonPath = path.join(docsDir, 'docs.json');
fs.writeFileSync(docsJsonPath, JSON.stringify(config, null, 2));

// Remove mint.json to avoid conflicts
const mintJsonPath = path.join(docsDir, 'mint.json');
if (fs.existsSync(mintJsonPath)) {
  fs.unlinkSync(mintJsonPath);
  console.log('Removed old mint.json');
}

console.log('Successfully generated docs.json with 5 vertical tabs!');
