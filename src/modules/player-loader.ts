import {DataEvent, ConnectEvent, Handler} from "../mush-client";

export class PlayerMonitor implements Handler {
    constructor() {
        this.players = {};
    }

    players: {};

    handle(event: DataEvent): void {
        var data = event.data,
            match,
            playerName,
            playerId;
    }
}