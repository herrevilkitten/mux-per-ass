import {Handler, ConnectEvent, Input, InputPipe} from "../mush-client";
import {database} from "../database";

export class NoSpoof implements Handler, InputPipe {
    static SPOOF_PATTERNS = [
        /^\[([^(]+)\(#([0-9]+)\)\]/,
        /^\[([^(]+)\(#([0-9]+)\),\w+\]/,
        /^\[.+\<\-\(#([0-9]+)\)\]/
    ];

    handle(event: ConnectEvent): void {
        event.client.sendln("@set ME=NOSPOOF");
    }

    pipe(input: Input): boolean {
        var data = input.input,
            match,
            player,
            playerName,
            playerId;

        for (var i = 0; i < NoSpoof.SPOOF_PATTERNS.length; ++i) {
            match = NoSpoof.SPOOF_PATTERNS[i].exec(data);
            if (match) {
                break;
            }
        }

        if (match) {
            if (match.length === 3) {
                playerName = match[1];
                playerId = match[2];
            } else {
                playerId = match[1];
            }

            if (playerId) {
                player = database.players[playerId];
            } else {
                return true;
            }

            input.input = input.input.substr(match[0].length).trim();
            if (!player) {
                if (!playerName) {
                    var spoofInput = input.input;
                    input.client.sendln("think \\[[name(#" + playerId + ")(#" + playerId + ")]\\] " + input.input);
                    throw "Need mah spoofing";
                }
                player = {
                    id: playerId,
                    names: [playerName]
                };
                database.players[playerId] = player;
            }

            if (playerName) {
                player.lastName = playerName;
            }

            player.lastSeen = new Date();
            input.data.player = player;
        }

        return true;
    }
}