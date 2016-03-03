class User {
    location: string;
    timeZone: string;
    name: string;
    id: number;
    connected: boolean;
};

import * as net from "net";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";

import {EventType, Client} from "./mush-client";
import {UrlListener, UrlSearcher} from "./modules/url-logger";
import {PlayerMonitor} from "./modules/player-loader";
import {configuration} from "./config";
import {NoSpoof} from "./modules/nospoof";
import {MessageType} from "./modules/message-type";
import {Retext} from "./modules/retext";

const client = new Client({
    host: configuration.mux.host,
    port: configuration.mux.port,
    username: configuration.player.username,
    password: configuration.player.password
});

var nospoof = new NoSpoof();

client.on(EventType.CONNECT, nospoof);
client.process(nospoof);
client.process(new MessageType());

//client.on(EventType.DATA, new Retext());
client.on(EventType.DATA, new UrlListener())
client.on(EventType.DATA, new PlayerMonitor())
client.on(EventType.DATA, new UrlSearcher());

client.connect();