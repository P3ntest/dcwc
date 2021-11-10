const { RSA_NO_PADDING } = require("constants");
const fs = require("fs");
const path = require("path");
const getEndpoint = require("./endpoint");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const chalk = require("chalk");

async function getConfig(key) {
  return new Promise(async (resolve, reject) => {
    const rootDir = path.dirname(
      require.main.filename || process.mainModule.filename
    );

    const configPath = path.join(rootDir, "discord.config.json");

    if (!key) {
      if (fs.existsSync(configPath)) {
        key = require(configPath).key;
        if (!key) {
          reject("No bot key found in discord.config.json");
        }
      } else {
        reject("No bot key provided");
      }
    }

    const req = await fetch(`${getEndpoint()}api/${key}/values.json`);

    if (req.status !== 200) {
      if (req.status == 404) {
        console.error(chalk.red("Invalid bot key"));
        reject("Invalid key");
      } else {
        reject("Cannot fetch config: HTTP " + req.status);
      }
    }

    const res = await req.json();

    resolve(res);
  });
}

module.exports = {
  getConfig,
};
