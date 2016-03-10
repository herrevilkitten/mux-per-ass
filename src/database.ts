import {configuration} from "./config";

export interface Item {
    id: number;
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

export interface PersistedStorage {
    saveItem(item: Item): void;
    loadItem(id: number): Object;
    saveAll(items: Item[] | { [id: number]: Item }): void;
    loadAll(): Item[];
}

export class PersistedDatabase<T extends Item> extends Database<T> {
    constructor(storage: PersistedStorage) {
        super();
        this.storage = storage;
        var items = <T[]>storage.loadAll(),
            maxId = 0;
        items.forEach((item) => {
            super.add(item);
            if (item.id > maxId) {
                maxId = item.id;
            }
            this.id = maxId  +1;
        });
    }

    private storage: PersistedStorage;

    add(item: T) {
        super.add(item);
        var items: Item[];

        this.storage.saveAll(this.items);
    }
}

import * as fs from "fs";
export class FileStorage implements PersistedStorage {
    private storageFile: string;

    constructor(storageFile: string) {
        this.storageFile = storageFile;
    }

    saveItem(item: Item): void {

    }

    loadItem(id: number): Item {
        return null;
    }

    saveAll(items: { [id: number]: Item }): void {
        fs.writeFile(
            this.storageFile,
            JSON.stringify(Object.keys(items).map((key) => items[key])),
            (err) => {
                if (err) {
                    console.log('Error while saving all items', err);
                }
            }
        );
    }

    loadAll(): Item[] {
        if (!fs.existsSync(this.storageFile)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(this.storageFile).toString());
    }
}