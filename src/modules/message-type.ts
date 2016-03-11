import {Handler, ConnectEvent, Input, Pipe, PipeAction} from "../mush-client";

export interface SayPattern {
    pattern: RegExp;
    private: boolean;
    type: string;
}

const OOC_PATTERN = '<<OOC>> ';

export class MessageType implements Pipe {
    static PATTERNS: SayPattern[] = [
        {
            pattern: /^.+ pages: (.+)/,
            private: true,
            type: 'PAGE'
        },
        {
            pattern: /^.+ \[to MPass\]: (.+)/,
            private: false,
            type: 'DIRSAY'
        },
        {
            pattern: /^.+ says, "(.+)"$/,
            private: false,
            type: 'SAY'
        }
    ]

    pipe(input: Input): void {
        if (input.input.indexOf(OOC_PATTERN) === 0) {
            input.data.ooc = true;
            input.input = input.input.slice(OOC_PATTERN.length);
        } else {
            input.data.ooc = false;
        }

        for (var i = 0; i < MessageType.PATTERNS.length; ++i) {
            var match = MessageType.PATTERNS[i].pattern.exec(input.input);
            if (match) {
                input.data.private = MessageType.PATTERNS[i].private;
                input.data.message = match[1];
                input.data.type = MessageType.PATTERNS[i].type;
                break;
            }
        }

        if (!input.data.message) {
            input.data.message = input.input;
            input.data.private = false;
            input.data.type = 'POSE';
        }

        input.data.respond = function(message: string): void {
            var preamble: string;
            if (!input.data.player) {
                preamble = 'say ';
            } else {
                switch (input.data.type) {
                    case 'PAGE':
                    case 'WHISPER':
                        preamble = 'page #' + input.data.player.id + '=';
                        break;
                    case 'DIRSAY':
                        preamble = '\'#' + input.data.player.id + ' ';
                        if (input.data.ooc || input.client.scene) {
                            preamble = '>' + preamble;
                        }
                        break;
                    case 'SAY':
                    case 'POSE':
                        if (input.data.ooc || input.client.scene) {
                            preamble = '>';
                        } else {
                            preamble = 'say ';
                        }
                        break;
                }
            }
            if (preamble) {
                input.client.sendln(preamble + message);
            }
        };
    }
}