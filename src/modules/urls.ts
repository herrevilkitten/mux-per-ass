import {Event, InputEvent, Handler} from "../mush-client";
import {SearchEvent} from "./searcher";
import {Item, PersistedDatabase, FileStorage} from "../database";


const inspect = require('unist-util-inspect'),
    cheerio = require('cheerio'),
    http = require('follow-redirects').http,
    https = require('follow-redirects').https;

export class Url implements Item {
    constructor(url: string, player: number) {
        this.url = url;
        this.player = player;
        this.timestamp = new Date();
        this.title = '';
        this.summary = '';
    }

    id: number;
    url: string;
    player: number;
    timestamp: Date;
    title: string;
    summary: string;
}


const urlStorage = new FileStorage("urls.json")
export var urlDatabase = new PersistedDatabase<Url>(urlStorage);

export class UrlListener implements Handler {
    static URL_PATTERN: RegExp = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})(\/\S*)?/gi;

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
            function responseHandler(res) {
                console.log('response', res);
                console.log('Status code:', res.statusCode);
                if (res.statusCode == 404) {
                    event.input.data.respond('"' + url +'" does not exist');
                    return;
                }
                console.log('url', res.fetchedUrls);
                let page = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    page += chunk.toString();
                });
                res.on('end', () => {
                    console.log('No more data in response.')
                    var url = new Url(res.fetchedUrls[0].toLowerCase(), player.id),
                        document = cheerio.load(page);
                    url.title = document('title').text() || '';
                    console.log('Title is', url.title);
                    urlDatabase.add(url);
                })
                res.on('error', (error) => {
                    console.error('Error occurred while retrieving', url);
                });
            }
            if (url.indexOf('http:') != -1) {
                http.get(url, responseHandler);
            } else if (url.indexOf('https:') != -1) {
                https.get(url, responseHandler);
            }
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
            if ((item.url || '').indexOf(search) > -1 || (item.title || '').toLowerCase().indexOf(search) > -1) {
                if (item.url) {
                    event.input.data.respond(item.url + ': ' + (item.title || ''));
                }
            }
        });
    }
}
