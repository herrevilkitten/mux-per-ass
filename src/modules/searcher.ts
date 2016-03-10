import {Handler, InputEvent, Event, Client, Input} from "../mush-client";

export var SEARCH = 1000;

export class SearchEvent extends InputEvent {
    constructor(client: Client, input: Input, public source: string, public search: string) {
        super(client, input);
        this.type = SEARCH;
    }
}

const SEARCH_PATTERN = /search (.+) for (.+)/i;

export class Searcher implements Handler {
    handle(event: InputEvent): void {
        var match = SEARCH_PATTERN.exec(event.input.data.message);
        if (match) {
            event.client.emit(new SearchEvent(event.client,
                event.input,
                match[1].toLowerCase(),
                match[2].toLowerCase()));
        }
    }
}