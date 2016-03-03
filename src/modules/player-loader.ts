import {DataEvent, ConnectEvent, Handler} from "../mush-client";

export class PlayerMonitor implements Handler {
    static CONNECT_PATTERN = /^.+ has connected./;
    static DISCONNECT_PATTERN = /^.+ has disconnected./;
    
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