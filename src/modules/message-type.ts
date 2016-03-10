import {Handler, ConnectEvent, Input, Pipe, PipeAction} from "../mush-client";

export interface SayPattern {
    pattern: RegExp;
    private: boolean;
    type: string;
}

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
                        break;
                    case 'SAY':
                    case 'POSE':
                        preamble = 'say ';
                        break;
                }
            }
            if (preamble) {
                input.client.sendln(preamble + message);
            }
        };
    }
}