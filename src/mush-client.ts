import * as net from "net";
import * as tls from "tls";
import * as http from "http";
import * as https from "https";

const async = require("async");

export interface Handler {
    handle(event: Event): void;
};

export enum EventType {
    CONNECT,
    DISCONNECT,
    DATA
};

export class Input {
    constructor(client: Client, input:string) {
        this.client = client;
        this.original = input;
        this.input = input;
        this.data = {};
    }

    client: Client;
    original: string;
    input: string;
    data: any;
}

export interface InputPipe {
    pipe(input: Input): boolean;
}

export class Event {
    constructor(client: Client) {
        this.client = client;
        this.timestamp = new Date();
    }

    timestamp: Date;
    type: EventType;
    client: Client;
};

export class ConnectEvent extends Event {
    constructor(client: Client) {
        super(client);
        this.type = EventType.CONNECT;
    }
}

export class DisconnectEvent extends Event {
    constructor(client: Client) {
        super(client);
        this.type = EventType.DISCONNECT;
    }
}

export class DataEvent extends Event {
    constructor(client: Client, data: Input) {
        super(client);
        this.type = EventType.DATA;
        this.data = data;
    }
    data: Input;
}

export interface ClientOptions {
    host: string,
    port: number,
    username: string,
    password: string
}

export class Client {
    constructor(public options: ClientOptions) {
        this.handlers = {
            connect: [],
            disconnect: [],
            data: []        }

        this.pipes = [];
    }

    socket: tls.ClearTextStream;
    connected: boolean;
    initialized: boolean;
    handlers: {
        connect: Handler[],
        disconnect: Handler[],
        data: Handler[]
    };

    pipes: InputPipe[];

    send(data: string): void {
        if (!this.socket) {
            return;
        }

        if (data.trim() != '') {
            console.log("Sending", data.trim());
        }
        
        this.socket.write(data);
    }

    sendln(data: string): void {
        this.send(data);
        this.send('\r\n');
    }

    private chooseHandler(event: Event | EventType): Handler[] {
        let handlers: Handler[],
            eventType;

        if (event instanceof Event) {
            eventType = event.type;
        } else {
            eventType = event;
        }

        switch (eventType) {
            case EventType.CONNECT:
                handlers = this.handlers.connect;
                break;
            case EventType.DISCONNECT:
                handlers = this.handlers.disconnect;
                break;
            case EventType.DATA:
                handlers = this.handlers.data;
                break;
        }

        return handlers;
    }

    on(event: EventType, handler: Handler): void {
        let handlers = this.chooseHandler(event);
        handlers.push(handler);
    }

    emit(event: Event): void {
        let handlers = this.chooseHandler(event);
        handlers.forEach(function(handler) {
            handler.handle(event);
        });
    }

    process(pipe: InputPipe) {
        this.pipes.push(pipe);
    }

    connect(): void {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        this.socket = tls.connect({
            host: this.options.host,
            port: this.options.port,
            rejectUnauthorized: false
        }, () => {
            console.log('Connected to ' + this.options.host + ':' + this.options.port);

        });

        this.socket.on('data', (data) => {
            var inputString = data.toString().trim();

            if (!this.connected) {
                console.log('Connecting as ' + this.options.username);
                this.sendln('co ' + this.options.username + ' ' + this.options.password);
                this.connected = true;
                this.emit(new ConnectEvent(this));
                return;
            }

            let input = new Input(this, inputString);

            try {
                for (var i = 0; i < this.pipes.length; ++i) {
                    let result = this.pipes[i].pipe(input);
                    if (result === false) {
                        break;
                    }
                }
            } catch (e) {
                console.error(e);
                return;
            }

            this.emit(new DataEvent(this, input));

        });

        this.socket.on('end', () => {
            this.emit(new DisconnectEvent(this));
            console.log('Disconnected from server');
        });
    }

    disconnect(): void {
        this.sendln('QUIT');
    }
};

