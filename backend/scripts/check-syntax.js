const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const rootDir = path.join(__dirname, "..");
const ignoredDirs = new Set(["node_modules", "coverage", "dist"]);

const collectJavaScriptFiles = (directory) => {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) {
        return [];
      }

      return collectJavaScriptFiles(absolutePath);
    }

    if (entry.isFile() && absolutePath.endsWith(".js")) {
      return [absolutePath];
    }

    return [];
  });
};

const files = collectJavaScriptFiles(rootDir);

files.forEach((filePath) => {
  execFileSync(process.execPath, ["--check", filePath], {
    stdio: "inherit",
  });
});

console.log(`Syntax check passed for ${files.length} file(s).`);
