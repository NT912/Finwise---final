// src/utils/loadEnv.ts
import { readFileSync } from "fs";
import { resolve } from "path";

export function loadEnv(filePath = ".env") {
  const envPath = resolve(process.cwd(), filePath);
  const content = readFileSync(envPath, { encoding: "utf-8" });

  content.split("\n").forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) return;

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts
      .join("=")
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  });
}
