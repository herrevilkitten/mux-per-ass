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
import {UrlListener, UrlSearcher} from "./modules/urls";
import {configuration} from "./config";
import {PlayersPlugin} from "./modules/players";
import {MessageType} from "./modules/message-type";
import {Retext} from "./modules/retext";
import {KeepAlive} from "./modules/keep-alive";
import {Searcher, SEARCH} from "./modules/searcher";
import {Scenes} from "./modules/scenes";
import {DiceRoller} from "./modules/dice-roller";

const client = new Client({
    host: configuration.mux.host,
    port: configuration.mux.port,
    username: configuration.player.username,
    password: configuration.player.password
});

var nospoof = new PlayersPlugin();
var keepalive = new KeepAlive();

client.on(EventType.CONNECT, nospoof);
client.process(keepalive);
client.process(nospoof);
client.process(new MessageType());

client.on(EventType.INPUT, nospoof);
client.on(EventType.TIMER, keepalive);
//client.on(EventType.DATA, new Retext());
client.on(EventType.INPUT, new UrlListener())
client.on(SEARCH, new UrlSearcher());
client.on(SEARCH, nospoof);
client.on(EventType.INPUT, new Searcher());
client.on(EventType.INPUT, new DiceRoller());
client.on(EventType.INPUT, new Scenes());

client.connect();