import {Handler, ConnectEvent, Input, InputPipe} from "../mush-client";
import {database, Player} from "../database";
import {SearchEvent} from "./searcher";

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
            player: Player,
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
                player = database.players.find({ id: playerId });
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
                player = new Player();
                player.id = playerId;
                player.names = [playerName];

                database.players.add(player);
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

export class PlayerSearcher implements Handler {
    handle(event: SearchEvent) {
        var search = event.search,
            player = event.data.data.player,
            isPrivate = event.data.data.private;

        if (event.source !== 'players') {
            return;
        }

        if (event.data.data.type !== 'DIRSAY' && event.data.data.type !== 'PAGE') {
            return;
        }

        database.players.findAll().forEach(function(item: Player) {
            var match = false;
            if (item.id == Number(search)) {
                match = true;
            } else {
                match = item.names.some((name) => { return name.toLowerCase().indexOf(search) > -1; });
            }

            if (match) {
                if (isPrivate) {
                    event.client.sendln("page #" + player.id + "= #" + item.id + " " + item.lastName);
                } else {
                    event.client.sendln("'#" + player.id + " #" + item.id + " " + item.lastName);
                }
            }
        });

    }
}