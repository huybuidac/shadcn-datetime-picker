import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://shadcn-datetime-picker-pro.vercel.app";
const REPO = "https://github.com/huybuidac/shadcn-datetime-picker";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "storybook-static");

const noscript = `<noscript><div style="font-family:system-ui,sans-serif;max-width:680px;margin:48px auto;padding:24px;line-height:1.6;color:#0a0a0a"><h1 style="font-size:32px;margin:0 0 8px">Shadcn Datetime Picker</h1><p style="color:#525252;margin:0 0 16px">Timezone-aware, keyboard-first date and time pickers for shadcn/ui. Single-file components — copy, own, ship.</p><p>This documentation site requires JavaScript. Source code, install instructions, and component reference are available on <a href="${REPO}">GitHub</a>.</p><ul><li><a href="${REPO}#install">Install via shadcn CLI</a></li><li><a href="${REPO}#datetimepicker">DateTimePicker</a></li><li><a href="${REPO}#datetimeinput">DateTimeInput</a></li><li><a href="${REPO}#simpletimepicker">SimpleTimePicker</a></li></ul></div></noscript>`;

const indexPath = resolve(out, "index.html");
let index = readFileSync(indexPath, "utf8");
index = index.replace(/<title>@storybook\/core - Storybook<\/title>\s*/, "");
if (!index.includes("<noscript>")) {
  index = index.replace("<div id=\"root\"></div>", `<div id="root"></div>\n    ${noscript}`);
}
writeFileSync(indexPath, index);

const iframePath = resolve(out, "iframe.html");
let iframe = readFileSync(iframePath, "utf8");
iframe = iframe.replace(
  "<title>Webpack App</title>",
  "<title>Shadcn Datetime Picker — Story Preview</title><meta name=\"robots\" content=\"noindex,nofollow\">"
);
writeFileSync(iframePath, iframe);

writeFileSync(
  resolve(out, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /iframe.html\n\nSitemap: ${SITE}/sitemap.xml\n`
);

writeFileSync(
  resolve(out, "manifest.webmanifest"),
  JSON.stringify(
    {
      name: "Shadcn Datetime Picker",
      short_name: "Datetime Picker",
      description: "Timezone-aware, keyboard-first date and time pickers for shadcn/ui.",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#2563eb",
      icons: [
        { src: "/assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2
  ) + "\n"
);

writeFileSync(
  resolve(out, "humans.txt"),
  `/* TEAM */\nDeveloper: Huy Bui Dac\nGitHub: ${REPO}\n\n/* SITE */\nLast update: ${new Date().toISOString().slice(0, 10)}\nLanguage: English\nDoctype: HTML5\nIDE: Visual Studio Code\nStandards: HTML5, CSS3, TypeScript\nComponents: react, next.js, shadcn/ui, react-day-picker, tailwindcss\n`
);

mkdirSync(resolve(out, ".well-known"), { recursive: true });
const expires = new Date(Date.now() + 364 * 24 * 60 * 60 * 1000).toISOString();
writeFileSync(
  resolve(out, ".well-known", "security.txt"),
  `Contact: ${REPO}/security/advisories/new\nExpires: ${expires}\nPreferred-Languages: en, vi\nCanonical: ${SITE}/.well-known/security.txt\n`
);

const manifest = JSON.parse(readFileSync(resolve(out, "index.json"), "utf8"));
const docsIds = Object.values(manifest.entries)
  .filter((e) => e.type === "docs")
  .map((e) => e.id);
const now = new Date().toISOString();
const urls = [
  `<url><loc>${SITE}/</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  ...docsIds.map(
    (id) =>
      `<url><loc>${SITE}/?path=/docs/${id}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
  ),
].join("\n  ");
writeFileSync(
  resolve(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls}\n</urlset>\n`
);

console.log("[postbuild] SEO assets emitted: titles, noscript, robots.txt, sitemap.xml, manifest.webmanifest, humans.txt, security.txt");
