const retext = require("retext"),
    retextPos = require("retext-pos"),
    retextStemmer = require("retext-porter-stemmer"),
    inspect = require('unist-util-inspect');

import {Handler, InputEvent} from "../mush-client";

export class Retext implements Handler {
    constructor() {
        this.processor = retext()
            .use(retextPos)
            .use(retextStemmer)
            .use(function() {
                return function(cst) {
                    console.log(inspect(cst));
                }
            });
    }

    processor: any;

    handle(event: InputEvent): void {
        if (!event.input.data.message || event.input.data.type === 'POSE') {
            return;
        }
        this.processor.process(event.input.data.message);
    }
}