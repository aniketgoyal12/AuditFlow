const path = require("node:path");
const { spawn } = require("node:child_process");

const mode = process.argv[2] === "start" ? "start" : "dev";
const isWindows = process.platform === "win32";

const createNpmProcess = (cwd, script) => {
  if (isWindows) {
    return spawn("cmd.exe", ["/d", "/s", "/c", `npm run ${script}`], {
      cwd,
      env: process.env,
      stdio: "inherit",
    });
  }

  return spawn("npm", ["run", script], {
    cwd,
    env: process.env,
    stdio: "inherit",
  });
};

const services = [
  {
    name: "backend",
    cwd: path.resolve(__dirname, "..", "backend"),
    script: mode === "start" ? "start" : "dev",
  },
  {
    name: "frontend",
    cwd: path.resolve(__dirname, "..", "auditflow-frontend"),
    script: "dev",
  },
];

const children = new Set();
let exitCode = 0;

const stopChildren = (signal = "SIGINT") => {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
};

const maybeExit = () => {
  if (children.size === 0) {
    process.exit(exitCode);
  }
};

for (const service of services) {
  console.log(`[local] starting ${service.name} with "npm run ${service.script}"`);

  const child = createNpmProcess(service.cwd, service.script);

  children.add(child);

  child.on("error", (error) => {
    console.error(`[local] failed to start ${service.name}: ${error.message}`);
    exitCode = 1;
    children.delete(child);
    stopChildren();
    maybeExit();
  });

  child.on("exit", (code, signal) => {
    children.delete(child);

    if (signal) {
      console.log(`[local] ${service.name} stopped with signal ${signal}`);
    } else if (code !== 0) {
      console.error(`[local] ${service.name} exited with code ${code}`);
      exitCode = code || 1;
      stopChildren();
    }

    maybeExit();
  });
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    stopChildren(signal);
  });
});
