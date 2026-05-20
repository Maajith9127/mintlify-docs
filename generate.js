const fs = require('fs');
const path = require('path');

const docsDir = 'C:\\\\Docs\\\\mintlify-docs';
const docsJsonPath = path.join(docsDir, 'docs.json');

// Helper to pad numbers
const pad = (n) => n.toString().padStart(2, '0');

// Generate the 2025 structure (December only based on previous logs)
const dec2025Pages = [];
for (let i = 4; i <= 31; i++) {
  dec2025Pages.push(`2025/december/day-${pad(i)}`);
}

// Generate the 2026 structure
const jan2026Pages = [];
for (let i = 1; i <= 31; i++) { jan2026Pages.push(`2026/january/day-${pad(i)}`); }

const feb2026Pages = [];
for (let i = 1; i <= 28; i++) { feb2026Pages.push(`2026/february/day-${pad(i)}`); }

const mar2026Pages = [];
for (let i = 1; i <= 31; i++) { mar2026Pages.push(`2026/march/day-${pad(i)}`); }

const apr2026Pages = [];
for (let i = 1; i <= 30; i++) {
  // Skipping 16 based on previous output
  if (i === 16) continue;
  apr2026Pages.push(`2026/april/day-${pad(i)}`);
}

const may2026Pages = [];
for (let i = 1; i <= 15; i++) {
  // Skipping 7 based on previous output
  if (i === 7) continue;
  may2026Pages.push(`2026/may/day-${pad(i)}`);
}

const newDocsJson = {
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
    "primary": {
      "type": "button",
      "label": "Star Us on GitHub",
      "href": "https://github.com/Maajith9127/CommitT"
    }
  },
  "anchors": [
    {
      "name": "Documentation",
      "icon": "book-open",
      "url": "/index"
    },
    {
      "name": "Journey",
      "icon": "route",
      "url": "/2026/may/day-15"
    }
  ],
  "navigation": {
    "tabs": [
      {
        "tab": "Main",
        "groups": [
          {
            "group": "Get started",
            "pages": ["index", "quickstart"]
          },
          {
            "group": "Develop",
            "pages": ["development"]
          },
          {
            "group": "Core Framework",
            "pages": ["essentials/markdown", "essentials/code"]
          },
          {
            "group": "User Interface",
            "pages": ["essentials/images"]
          },
          {
            "group": "API Reference",
            "pages": ["api-reference/introduction"]
          },
          {
            "group": "Journey (Developer Logs)",
            "pages": [
              {
                "group": "2025",
                "pages": [
                  {
                    "group": "December",
                    "pages": dec2025Pages
                  }
                ]
              },
              {
                "group": "2026",
                "pages": [
                  {
                    "group": "January",
                    "pages": jan2026Pages
                  },
                  {
                    "group": "February",
                    "pages": feb2026Pages
                  },
                  {
                    "group": "March",
                    "pages": mar2026Pages
                  },
                  {
                    "group": "April",
                    "pages": apr2026Pages
                  },
                  {
                    "group": "May",
                    "pages": may2026Pages
                  }
                ]
              }
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

fs.writeFileSync(docsJsonPath, JSON.stringify(newDocsJson, null, 2));
console.log('Successfully updated docs.json with Expo-style Anchor layout!');
