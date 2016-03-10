import {Event, InputEvent, Handler} from "../mush-client";
import {SearchEvent} from "./searcher";
import {Item, PersistedDatabase, FileStorage} from "../database";

const inspect = require('unist-util-inspect');

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


const urlStorage = new FileStorage("urls.json")
export var urlDatabase = new PersistedDatabase<Url>(urlStorage);

export class UrlListener implements Handler {
    static URL_PATTERN: RegExp = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*(\/?)/gi;

    constructor() {
    }

    handle(event: InputEvent): void {
        if (!event.input.data.player) {
            return;
        }
        while (true) {
            var match = UrlListener.URL_PATTERN.exec(event.input.input);
            if (!match) {
                break;
            }

            var url = match[1] + match[2] + '.' + match[3];
            if (match[4]) {
                url = url + match[4];
            }
            if (match[5]) {
                url = url + match[5];
            }

            var player = event.input.data.player,
                data = event.input;

            console.log('Found URL', url);
            urlDatabase.add(new Url(url, player.id));
        }
    }
}

export class UrlSearcher implements Handler {
    handle(event: SearchEvent): void {
        var source = event.source,
            search = event.search,
            player = event.input.data.player,
            isPrivate = event.input.data.private,
            match;

        if (source !== 'urls') {
            return;
        }

        if (event.input.data.type !== 'DIRSAY' && event.input.data.type !== 'PAGE') {
            return;
        }

        urlDatabase.findAll().forEach(function(item: Url) {
            if (item.url.indexOf(search) > -1) {
                event.input.data.respond(item.url);
            }
        });
    }
}
