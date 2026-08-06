import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const env = {
  ...process.env,
  PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "1"
};
const failedDataMigration = "20260806102000_new_sponsor_raffle_prizes";

function runPrisma(args) {
  const result = spawnSync(command, ["prisma", ...args], {
    env,
    encoding: "utf8",
    shell: false
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  return result;
}

let result = runPrisma(["migrate", "deploy"]);
const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

if (result.status !== 0 && output.includes(failedDataMigration)) {
  console.warn(`Retrying ${failedDataMigration} after marking the failed data migration as rolled back.`);
  const resolveResult = runPrisma(["migrate", "resolve", "--rolled-back", failedDataMigration]);

  if (resolveResult.status === 0) {
    result = runPrisma(["migrate", "deploy"]);
  } else {
    result = resolveResult;
  }
}

process.exit(result.status ?? 1);
