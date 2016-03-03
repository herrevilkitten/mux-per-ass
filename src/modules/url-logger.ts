import {Event, DataEvent, Handler} from "../mush-client";
const inspect = require('unist-util-inspect');
const database = require('../database');

class Url {
    source: string;
    url: string;
}

export class UrlListener implements Handler {
    static URL_PATTERN: RegExp = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*(\/?)/gi;

    constructor() {
        database.urls = [];
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
            database.urls.push({
                source: player.id,
                url: url
            });
        }
    }
}

export class UrlSearcher implements Handler {
    handle(event: DataEvent): void {
        var data = event.data.input,
            player = event.data.data.player,
            isPrivate = event.data.data.private,
            match;

        console.log(inspect(data));
        var pattern = /search urls for (.+)/i;
        match = pattern.exec(data);
        if (match) {
            console.log(inspect(event.data));
            var query = match[1];
            database.urls.forEach(function(item: Url) {
                if (item.url.indexOf(query) > -1) {
                    if (isPrivate) {
                        event.client.sendln("page #" + player.id + "=" + item.url);
                    } else {
                        event.client.sendln("'#" + player.id + " " + item.url);
                    }
                }
            });
        }
    }
}