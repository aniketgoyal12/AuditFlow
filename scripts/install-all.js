const path = require("node:path");
const { spawn } = require("node:child_process");

const isWindows = process.platform === "win32";
const projects = [
  {
    name: "backend",
    cwd: path.resolve(__dirname, "..", "backend"),
  },
  {
    name: "auditflow-frontend",
    cwd: path.resolve(__dirname, "..", "auditflow-frontend"),
  },
];

const runInstall = ({ name, cwd }) =>
  new Promise((resolve, reject) => {
    console.log(`[setup] installing dependencies for ${name}`);

    const child = isWindows
      ? spawn("cmd.exe", ["/d", "/s", "/c", "npm install --no-fund --no-audit"], {
          cwd,
          env: process.env,
          stdio: "inherit",
        })
      : spawn("npm", ["install", "--no-fund", "--no-audit"], {
          cwd,
          env: process.env,
          stdio: "inherit",
        });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${name} install failed with code ${code}`));
    });
  });

const main = async () => {
  for (const project of projects) {
    await runInstall(project);
  }
};

main().catch((error) => {
  console.error(`[setup] ${error.message}`);
  process.exit(1);
});
