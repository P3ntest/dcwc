#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const userSettings = require("user-settings");
const getEndpoint = require("../endpoint");
const settings = userSettings.file(".dcwc");
const chalk = require("chalk");

(async () => {
  const cwd = process.cwd();

  const endPoint = getEndpoint();

  const configPath = path.join(cwd, "discord.config.json");

  const args = process.argv.slice(2, process.argv.length);

  if (args.length == 0) {
    console.log(
      chalk.redBright("Please specify a sub command. ") +
        chalk.yellow("dcwc help")
    );
    process.exit(0);
  }

  if (args[0].toLowerCase() == "help") {
    console.log(chalk.green.bold("DCWC Help"));
    console.log(
      chalk.yellow("dcwc init <key> ") +
        chalk.redBright("- Init discord.config.js")
    );
    console.log(
      chalk.yellow("dcwc push ") +
        chalk.redBright("- Update current structure.")
    );
    console.log(
      chalk.yellow(
        "dcwc login <token> " + chalk.redBright("- Login to with token")
      )
    );
    console.log(
      chalk.yellow("dcwc logout " + chalk.redBright("- Forget token"))
    );
  } else if (args[0].toLowerCase() == "init") {
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

    console.log(
      chalk.green(
        "discord.config.json created. Use " +
          chalk.yellow.bold("npx dcwc push") +
          " to update."
      )
    );
  } else if (args[0].toLowerCase() == "push") {
    if (!settings.get("token")) {
      console.log(
        "Token not specified. Please use npx dcwc login <token> to login."
      );
      process.exit(0);
    }
    if (!fs.existsSync(configPath)) {
      console.log(chalk.red("Project not found. Use npx dcwc init first."));
      process.exit(0);
    }

    const { key, structure } = JSON.parse(fs.readFileSync(configPath));

    const req = await fetch(`${endPoint}api/${key}/config.json`, {
      method: "POST",
      body: JSON.stringify(structure),
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${settings.get("token")}`,
      },
    });

    const res = await req.json();

    if (req.status == 200) {
      console.log(chalk.green("Config structure updated successfully."));
    } else {
      console.log(
        "Error. Status: " + req.status + ". " + JSON.stringify(res, null, 4)
      );
    }
  } else if (args[0].toLowerCase() == "login") {
    if (args.length < 2) {
      console.log(chalk.red("Please specify your token."));
      process.exit(0);
    }

    const req = await fetch(`${endPoint}api/auth.json?token=${args[1]}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (req.status == 200) {
      settings.set("token", args[1]);
      console.log(chalk.green("You are logged in."));
    } else {
      console.log(chalk.red("Invalid token. Login failed."));
    }
  } else if (args[0].toLowerCase() == "logout") {
    settings.unset("token");
    console.log(chalk.green("You are logged out."));
  } else if (args[0].toLowerCase() == "version") {
    console.log(
      "DCWC v" +
        chalk.green(require("../../package.json").version) +
        " using " +
        getEndpoint()
    );
  } else {
    console.log(
      chalk.red("Unknown command. Use npx dcwc help to see all commands.")
    );
  }
})();
