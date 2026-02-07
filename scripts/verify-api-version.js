const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IGNORE_DIRS = ["node_modules", ".git"];
const FILE_EXTS = [".js", ".jsx", ".ts", ".tsx", ".json", ".env"];

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (IGNORE_DIRS.includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, fileList);
    else if (FILE_EXTS.includes(path.extname(e.name))) fileList.push(full);
  }
  return fileList;
}

function findUrls(contents) {
  // crude URL matcher
  const urlRegex = /https?:\/\/[^"'\s)]+/g;
  return (contents.match(urlRegex) || []).map((u) => u.replace(/["'\)]$/, ""));
}

function report() {
  const files = walk(ROOT);
  const issues = [];
  for (const f of files) {
    const c = fs.readFileSync(f, "utf8");
    const urls = findUrls(c);
    for (const u of urls) {
      // skip common cdn/npm urls
      if (/npmjs|github|raw\.githubusercontent|cdn\.|jsdelivr|unpkg/.test(u))
        continue;
      const hasV0 = /\/v0(\/|$)/.test(u);
      const hasVersion = /\/v\d+(\/|$)/.test(u);
      if (!hasV0 && (hasVersion || /\/api\b|\/openai\b|api\./.test(u))) {
        issues.push({ file: f.replace(ROOT + "/", ""), url: u });
      }
    }
  }

  if (issues.length === 0) {
    console.log("No non-v0 API URLs found.");
    process.exit(0);
  }

  console.log("Potential non-v0 API URLs:");
  for (const it of issues) console.log(`- ${it.file}: ${it.url}`);
  process.exit(2);
}

report();
