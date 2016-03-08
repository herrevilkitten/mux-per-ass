import {Event, DataEvent, Handler} from "../mush-client";
import {SearchEvent} from "./searcher";
import {Url, database} from "../database";

const inspect = require('unist-util-inspect');

export class UrlListener implements Handler {
    static URL_PATTERN: RegExp = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*(\/?)/gi;

    constructor() {
    }

    handle(event: DataEvent): void {
        if (!event.data.data.player) {
            return;
        }
        while (true) {
            var match = UrlListener.URL_PATTERN.exec(event.data.input);
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

            var player = event.data.data.player,
                data = event.data;

            console.log('Found URL', url);
            database.urls.add(new Url(url, player.id));
        }
    }
}

export class UrlSearcher implements Handler {
    handle(event: SearchEvent): void {
        var source = event.source,
            search = event.search,
            player = event.data.data.player,
            isPrivate = event.data.data.private,
            match;

        if (source !== 'urls') {
            return;
        }

        if (event.data.data.type !== 'DIRSAY' && event.data.data.type !== 'PAGE') {
            return;
        }

        database.urls.findAll().forEach(function(item: Url) {
            if (item.url.indexOf(search) > -1) {
                if (isPrivate) {
                    event.client.sendln("page #" + player.id + "=" + item.url);
                } else {
                    event.client.sendln("'#" + player.id + " " + item.url);
                }
            }
        });
    }
}
