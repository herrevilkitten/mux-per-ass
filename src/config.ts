import * as fs from "fs";

const DEFAULT_CONFIGURATION_FILE = '../mpass.json';

export class Configuration {
    mux: {
        host: string,
        port: number,
        ssl: boolean
    };

    player: {
        username: string,
        password: string
    }

    database: {
        host: string,
        port: number,
        schema: string,
        username: string,
        password: string
    }

    get databaseUrl(): string {
        return "mongodb://" + this.database.username + ":" + this.database.password + "@" + this.database.host + ":" + this.database.port + "/" + this.database.schema;
    }
}

export var configuration: Configuration = new Configuration();

var configurationFile = DEFAULT_CONFIGURATION_FILE;
var configurationJson: {} = require(configurationFile);

for (var key in configurationJson) {
    if (!configurationJson.hasOwnProperty(key)) {
        continue;
    }

    configuration[key] = configurationJson[key];
}