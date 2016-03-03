const retext = require("retext"),
    retextPos = require("retext-pos"),
    retextStemmer = require("retext-porter-stemmer"),
    inspect = require('unist-util-inspect');

import {Handler, DataEvent} from "../mush-client";

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

    handle(event: DataEvent): void {
        this.processor.process(event.data.input);
    }
}