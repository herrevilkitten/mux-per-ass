import { Handler, ConnectEvent, InputEvent, Input, Pipe, PipeAction } from "../mush-client";
import { Item, FileStorage, PersistedDatabase } from "../database";
import { SearchEvent } from "./searcher";

export class Player implements Item {
    constructor(id: number, name: string) {
        this.id = id;
        this.names = [name];
        this.lastName = name;
    }

    id: number;
    names: string[];
    lastName: string;
    lastSeen: Date;
    lastAction: string;
    connected: boolean;
}

const playerStorage = new FileStorage('players.json');
export var playerDatabase = new PersistedDatabase<Player>(playerStorage);

export class PlayersPlugin implements Handler, Pipe {
    static SPOOF_PATTERNS = [
        /^\[([^(]+)\(#([0-9]+)\)\]/,
        /^\[([^(]+)\(#([0-9]+)\),\w+\]/,
        /^\[.+\<\-\(#([0-9]+)\)\]/
    ];

    private handleConnect(event: ConnectEvent) {
        event.client.sendln("@set ME=NOSPOOF");
        event.client.sendln("think PLAYERS:[iter(lcon(HERE,PLAYER),##:[name(##)]:[conn(##)],,|)]");
    }

    private handleSearch(event: SearchEvent) {
        var search = event.search,
            player = event.input.data.player,
            isPrivate = event.input.data.private;

        if (event.source !== 'players') {
            return;
        }

        if (event.input.data.type !== 'DIRSAY' && event.input.data.type !== 'PAGE') {
            return;
        }

        playerDatabase.findAll().forEach(function (item: Player) {
            var match = false;
            if (item.id == Number(search)) {
                match = true;
            } else {
                match = item.names.some((name) => { return name.toLowerCase().indexOf(search) > -1; });
            }

            if (match) {
                event.input.data.respond(item.lastName + ' (#' + item.id + ')');
            }
        });
    }

    handleInput(event: InputEvent): void {
        if (event.input.original.indexOf('PLAYERS:') != 0) {
            return;
        }

        var players = event.input.original.slice(8).split('|');
        players.forEach((item) => {
            var [sid, name, connected] = item.split(':'),
                id = Number(sid.slice(1));
            var player = playerDatabase.find({ id: id });
            if (!player) {
                player = new Player(id, name);
                player.connected = connected != '-1';

                console.log('Adding new player: ' + name + ' (#' + id + ')');
                playerDatabase.add(player);
            }
        });
    }

    handle(event: ConnectEvent | InputEvent | SearchEvent): void {
        if (event instanceof ConnectEvent) {
            this.handleConnect(event);
        } else if (event instanceof SearchEvent) {
            this.handleSearch(event);
        } else if (event instanceof InputEvent) {
            this.handleInput(event);
        }
    }

    pipe(input: Input): PipeAction | void {
        var data = input.input,
            match,
            player: Player,
            playerName,
            playerId;

        for (var i = 0; i < PlayersPlugin.SPOOF_PATTERNS.length; ++i) {
            match = PlayersPlugin.SPOOF_PATTERNS[i].exec(data);
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
                player = playerDatabase.find({ id: playerId });
            } else {
                return PipeAction.STOP;
            }

            input.input = input.input.substr(match[0].length).trim();
            if (!player) {
                if (!playerName) {
                    var spoofInput = input.input;
                    input.client.sendln("think \\[[name(#" + playerId + ")(#" + playerId + ")]\\] " + input.input);
                    return PipeAction.ABORT;
                }
                player = new Player(playerId, playerName);

                playerDatabase.add(player);
            }

            if (playerName) {
                player.lastName = playerName;
            }

            player.lastSeen = new Date();
            input.data.player = player;
        }
    }
}
