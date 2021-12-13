# Discord Web Config

Discord Web Config is a npm package to easily host you config online so you can aways edit your bots configuration in a nice and easy way.

## Getting started

To get started join the [discord server](https://discord.gg/SntqpmCygT) and apply for beta. After your application you will get your personal developer token. 

Use the `npx dcwc login <token>` to login via the command line.

Go back to the discord server and use the `/create` command to generate a new key for your application.

Use that key with `npx dcwc init <key>` in your project directory to create the config file.

## Config

Your config file is named discord.config.json. Enter your key into the config.

The structure object defines not only the way your config will be structured but also the structure of the webpanel.

First you have to define a subcategory which is an object with key value pairs, where the key is the fields name and the value is the type.

The available types are
 - token
 - string
 - snowflake
 - embed

### Example config
```json
{
    "key": "26782c25-c45e-6e1a-ae90-4b3f98a4c634",
    "structure": {
        "general": {
            "auth": "token",
            "guild": "snowflake"
        },
        "embeds": {
            "error": "embed",
            "join": "embed"
        },
        "channels": {
            "someVoice": "snowflake",
            "someText": "snowflake"
        },
        "roles": {
            "captain": "snowflake"
        },
        "otherStuff": {
            "array": ["string"]
        }
    }
}
```

After saving the file you can update the webpanel with `npx dcwc push`.

## Code implementation

```javascript
const dcwc = require("dcwc");

let config = await dcwc.getConfig();

config.general.token; // example for a value

```
