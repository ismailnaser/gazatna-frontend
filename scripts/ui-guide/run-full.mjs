import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backend = path.resolve(__dirname, "../../../gazatna-backend");
const frontend = path.resolve(__dirname, "../..");

function run(cmd, args, cwd) {
  console.log(`\n▶ ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("=== 1/2 ملء البيانات الوهمية ===");
run("python", ["manage.py", "seed_guide_demo", "--reset"], backend);

console.log("\n=== 2/2 توليد دليل PDF ===");
run("npm", ["run", "guide:pdf"], frontend);

console.log("\n✅ اكتمل: docs/ui-guide/دليل-واجهات-غزتنا.pdf");
