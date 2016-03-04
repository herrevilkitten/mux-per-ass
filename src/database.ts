import {configuration} from "./config";

export class Player {
    id: number;
    names: string[];
    lastName: string;
    lastSeen: Date;
    lastAction: string;
    connected: boolean;
}

export class Url {
    id: number;
    url: string;
    player: number;
    timestamp: Date;
}

export class Database<T> {
    constructor() {
        this.items = {};
    }

    items: { [id: number]: T };
}

export var database = {
    players: new Database<Player>(),
    urls: new Database<Url>()
};