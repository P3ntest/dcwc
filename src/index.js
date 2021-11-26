const { RSA_NO_PADDING } = require("constants");
const fs = require("fs");
const path = require("path");
const getEndpoint = require("./endpoint");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const chalk = require("chalk");
const { getConfigPath, getCachePath } = require("./integrationPaths");

async function getConfig(key) {
  return new Promise(async (resolve, reject) => {
    const configPath = getConfigPath();

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

    const endpoint = `${getEndpoint()}api/${key}/values.json`;

    let req;

    try {
      req = await fetch(endpoint);
    } catch (e) {
      req = {
        status: e,
      };
    }

    if (req.status !== 200) {
      if (req.status == 404) {
        console.error(chalk.red("Invalid bot key"));
        reject("Invalid key");
      } else {
        if (fs.existsSync(getCachePath())) {
          console.error(
            chalk.red(`Failed to fetch config, using cache. (${req.status})`)
          );

          const cache = JSON.parse(fs.readFileSync(getCachePath()));

          resolve(cache);
        } else {
          reject(
            "Fetch failed and no cache found. " +
              req.status +
              ": " +
              (await req.text())
          );
        }
      }
    } else {
      const res = await req.json();

      fs.writeFile(
        getCachePath(),
        JSON.stringify({
          ...res,
          _meta: {
            lastUpdated: new Date().toISOString(),
            botKey: key,
            timestamp: Date.now(),
            endpoint,
          },
        }),
        () => {}
      );

      resolve(res);
    }
  });
}

module.exports = {
  getConfig,
};
