import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "images");

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r="1" fill="#e5e7eb"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <text x="80" y="225" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="72" font-weight="800" fill="#0a0a0a">Shadcn Datetime</text>
  <text x="80" y="310" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="72" font-weight="800" fill="#0a0a0a">Picker</text>
  <text x="80" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="28" font-weight="400" fill="#525252">Timezone-aware, keyboard-first date &amp; time</text>
  <text x="80" y="412" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="28" font-weight="400" fill="#525252">pickers for shadcn/ui</text>
  <rect x="80" y="450" width="245" height="46" rx="23" fill="none" stroke="#2563eb" stroke-width="2"/>
  <text x="202" y="481" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="20" font-weight="700" fill="#2563eb" text-anchor="middle">Copy. Own. Ship.</text>
  <g transform="translate(720, 115)">
    <rect width="400" height="400" rx="20" fill="#ffffff" stroke="#e5e7eb" stroke-width="2"/>
    <path d="M 20,0 H 380 a 20,20 0 0 1 20,20 V 60 H 0 V 20 a 20,20 0 0 1 20,-20 z" fill="#2563eb"/>
    <text x="200" y="40" font-family="-apple-system, sans-serif" font-size="22" font-weight="700" fill="#ffffff" text-anchor="middle">April 2026</text>
    <g font-family="-apple-system, sans-serif" font-size="14" fill="#737373" font-weight="600">
      <text x="40" y="100" text-anchor="middle">M</text>
      <text x="92" y="100" text-anchor="middle">T</text>
      <text x="144" y="100" text-anchor="middle">W</text>
      <text x="196" y="100" text-anchor="middle">T</text>
      <text x="248" y="100" text-anchor="middle">F</text>
      <text x="300" y="100" text-anchor="middle">S</text>
      <text x="352" y="100" text-anchor="middle">S</text>
    </g>
    <g font-family="-apple-system, sans-serif" font-size="16" fill="#0a0a0a" text-anchor="middle">
      <text x="40" y="140" fill="#a3a3a3">31</text><text x="92" y="140">1</text><text x="144" y="140">2</text><text x="196" y="140">3</text><text x="248" y="140">4</text><text x="300" y="140">5</text><text x="352" y="140">6</text>
      <text x="40" y="180">7</text><text x="92" y="180">8</text><text x="144" y="180">9</text><text x="196" y="180">10</text><text x="248" y="180">11</text><text x="300" y="180">12</text><text x="352" y="180">13</text>
      <text x="40" y="220">14</text><text x="92" y="220">15</text><text x="144" y="220">16</text>
      <circle cx="196" cy="215" r="18" fill="#2563eb"/>
      <text x="196" y="220" fill="#ffffff" font-weight="700">17</text>
      <text x="248" y="220">18</text><text x="300" y="220">19</text><text x="352" y="220">20</text>
      <text x="40" y="260">21</text><text x="92" y="260">22</text><text x="144" y="260">23</text><text x="196" y="260">24</text><text x="248" y="260">25</text><text x="300" y="260">26</text><text x="352" y="260">27</text>
      <text x="40" y="300">28</text><text x="92" y="300">29</text><text x="144" y="300">30</text>
    </g>
    <rect x="60" y="328" width="280" height="50" rx="8" fill="#f5f5f5" stroke="#e5e7eb"/>
    <text x="100" y="361" font-family="-apple-system, sans-serif" font-size="22" font-weight="600" fill="#0a0a0a" text-anchor="middle">14</text>
    <text x="135" y="361" font-family="-apple-system, sans-serif" font-size="22" font-weight="400" fill="#a3a3a3" text-anchor="middle">:</text>
    <text x="170" y="361" font-family="-apple-system, sans-serif" font-size="22" font-weight="700" fill="#2563eb" text-anchor="middle">30</text>
    <text x="205" y="361" font-family="-apple-system, sans-serif" font-size="22" font-weight="400" fill="#a3a3a3" text-anchor="middle">:</text>
    <text x="240" y="361" font-family="-apple-system, sans-serif" font-size="22" font-weight="600" fill="#0a0a0a" text-anchor="middle">00</text>
    <rect x="280" y="343" width="50" height="22" rx="11" fill="#2563eb"/>
    <text x="305" y="359" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">UTC</text>
  </g>
</svg>`;

const iconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="${size}" height="${size}">
  <rect width="180" height="180" fill="#2563eb"/>
  <rect x="35" y="50" width="100" height="92" rx="10" fill="#ffffff"/>
  <path d="M 35,60 a 10,10 0 0 1 10,-10 H 125 a 10,10 0 0 1 10,10 V 75 H 35 z" fill="#1d4ed8"/>
  <rect x="55" y="38" width="7" height="22" rx="3.5" fill="#1d4ed8"/>
  <rect x="108" y="38" width="7" height="22" rx="3.5" fill="#1d4ed8"/>
  <g fill="#cbd5e1">
    <circle cx="55" cy="92" r="4"/><circle cx="75" cy="92" r="4"/><circle cx="95" cy="92" r="4"/><circle cx="115" cy="92" r="4"/>
    <circle cx="55" cy="112" r="4"/>
  </g>
  <circle cx="75" cy="112" r="6" fill="#2563eb"/>
  <circle cx="125" cy="130" r="22" fill="#ffffff" stroke="#1d4ed8" stroke-width="2"/>
  <line x1="125" y1="130" x2="125" y2="118" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round"/>
  <line x1="125" y1="130" x2="135" y2="130" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round"/>
</svg>`;

await sharp(Buffer.from(ogSvg)).png({ compressionLevel: 9 }).toFile(resolve(out, "og-cover.png"));
await sharp(Buffer.from(iconSvg(180))).resize(180, 180).png({ compressionLevel: 9 }).toFile(resolve(out, "apple-touch-icon.png"));
await sharp(Buffer.from(iconSvg(512))).resize(512, 512).png({ compressionLevel: 9 }).toFile(resolve(out, "icon-512.png"));

console.log("[gen-assets] Wrote og-cover.png, apple-touch-icon.png, icon-512.png to images/");
