import {configuration} from "./config";

export interface Item {
    id: number;
}

export class Player implements Item {
    id: number;
    names: string[];
    lastName: string;
    lastSeen: Date;
    lastAction: string;
    connected: boolean;
}

export class Url implements Item {
    constructor(url: string, player: number) {
        this.url = url;
        this.player = player;
        this.timestamp = new Date();
    }

    id: number;
    url: string;
    player: number;
    timestamp: Date;
}

export class Database<T extends Item> {
    constructor() {
        this.items = {};
        this.id = 0;
    }

    id: number;
    nextId(): number {
        return ++this.id;
    }

    items: { [id: number]: T };

    add(item: T) {
        if (!item.id) {
            item.id = this.nextId();
        }

        if (this.items[item.id]) {
            throw "already exists " + item.id;
        }

        this.items[item.id] = item;
    }

    find(parameters: {}): T {
        Items: for (var id in this.items) {
            var item = this.items[id];
            for (var key in parameters) {
                if (!item.hasOwnProperty(key) || item[key] != parameters[key]) {
                    continue Items;
                }
            }
            return item;
        }
        return null;
    }

    findAll(parameters?: {}): T[] {
        var listing: T[] = [];
        Items: for (var id in this.items) {
            var item = this.items[id];
            if (parameters) {
                for (var key in parameters) {
                    if (!item.hasOwnProperty(key) || item[key] != parameters[key]) {
                        continue Items;
                    }
                }
            }
            listing.push(item);
        }
        return listing;
    }
}

export var database = {
    players: new Database<Player>(),
    urls: new Database<Url>()
};