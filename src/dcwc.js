#! /usr/bin/env node

import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __dirname = dirname(fileURLToPath(import.meta.url));

const cwd = process.cwd();

const endPoint = fs.existsSync(path.join(__dirname, "../.prod"))
  ? "http://localhost:3000/"
  : "https://discord.cx/";

const configPath = path.join(cwd, "discord.config.json");

const args = process.argv.slice(2, process.argv.length);

if (args.length == 0) {
  console.log("Please specify a sub command.");
  process.exit(0);
}

if (args[0].toLowerCase() == "init") {
  if (args.length < 2) {
    console.log("Please specify your bot key.");
    process.exit(0);
  }

  if (fs.existsSync(configPath)) {
    console.log("discord.config.json already exists.");
    process.exit(0);
  }

  fs.writeFileSync(
    configPath,
    JSON.stringify(
      {
        key: args[1],
        structure: {
          general: {
            auth: "Token",
          },
        },
      },
      null,
      4
    )
  );

  console.log("discord.config.json created. Use npx dcwc push to update.");
} else if (args[0].toLowerCase() == "push") {
  if (!fs.existsSync(configPath)) {
    console.log("Project not found. Use npx dcwc init first.");
    process.exit(0);
  }

  const { key, structure } = JSON.parse(fs.readFileSync(configPath));

  const req = await fetch(`${endPoint}api/${key}/config.json`, {
    method: "POST",
    body: JSON.stringify(structure),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const res = await req.json();

  console.log(res);
}
