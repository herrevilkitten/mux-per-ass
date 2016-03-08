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
import {configuration} from "./config";
import {NoSpoof, PlayerSearcher} from "./modules/nospoof";
import {MessageType} from "./modules/message-type";
import {Retext} from "./modules/retext";
import {KeepAlive} from "./modules/keep-alive";
import {Searcher, SEARCH} from "./modules/searcher";

const client = new Client({
    host: configuration.mux.host,
    port: configuration.mux.port,
    username: configuration.player.username,
    password: configuration.player.password
});

var nospoof = new NoSpoof();
var keepalive = new KeepAlive();

client.on(EventType.CONNECT, nospoof);
client.process(keepalive);
client.process(nospoof);
client.process(new MessageType());

client.on(EventType.TIMER, keepalive);
//client.on(EventType.DATA, new Retext());
client.on(EventType.DATA, new UrlListener())
client.on(SEARCH, new UrlSearcher());
client.on(SEARCH, new PlayerSearcher());
client.on(EventType.DATA, new Searcher());

client.connect();