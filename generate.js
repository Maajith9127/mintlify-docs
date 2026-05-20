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

// --- Build the modern mint.json ---
const config = {
  "$schema": "https://mintlify.com/mint.json",
  "name": "CommitT",
  "colors": {
    "primary": "#C6613F",
    "light": "#E27E5A",
    "dark": "#080808"
  },
  "favicon": "/favicon.svg",
  "topbarLinks": [
    { "name": "Changelog", "url": "https://github.com/Maajith9127/CommitT/commits/main" }
  ],
  "topbarCtaButton": {
    "name": "Star Us on GitHub",
    "url": "https://github.com/Maajith9127/CommitT"
  },
  "anchors": [
    {
      "name": "Home",
      "icon": "house",
      "url": "/"
    },
    {
      "name": "Guides",
      "icon": "book-open",
      "url": "/architecture/overview"
    },
    {
      "name": "Convex",
      "icon": "server",
      "url": "/backend/schema"
    },
    {
      "name": "Reference",
      "icon": "cube",
      "url": "/architecture/local-database"
    },
    {
      "name": "Journey",
      "icon": "route",
      "url": "/2026/may/day-15"
    }
  ],
  "navigation": [
    {
      "group": "Get started",
      "icon": "hand-wave",
      "pages": ["index"]
    },
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
    },
    {
      "group": "Native Modules",
      "icon": "microchip",
      "pages": ["native-modules/overview"]
    },
    {
      "group": "Backend",
      "icon": "cloud",
      "pages": ["backend/schema"]
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
    },
    {
      "group": "2025 Logs",
      "icon": "calendar",
      "pages": [
        { "group": "December", "pages": dec2025Pages }
      ]
    }
  ],
  "logo": {
    "light": "/logo/light.svg",
    "dark": "/logo/dark.svg"
  },
  "footerSocials": {
    "x": "https://x.com/Maajith_cmt",
    "linkedin": "https://www.linkedin.com/in/abdul-maajith-99165026b",
    "github": "https://github.com/Maajith9127"
  }
};

// Write mint.json
const mintJsonPath = path.join(docsDir, 'mint.json');
fs.writeFileSync(mintJsonPath, JSON.stringify(config, null, 2));

// Remove docs.json if it exists (forcing modern schema)
const docsJsonPath = path.join(docsDir, 'docs.json');
if (fs.existsSync(docsJsonPath)) {
  fs.unlinkSync(docsJsonPath);
  console.log('Removed old docs.json');
}

console.log('Successfully generated mint.json with Expo-style Icons and Anchors!');
