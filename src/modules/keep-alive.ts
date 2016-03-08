import {Handler, TimerEvent, InputPipe, Input} from "../mush-client";

export class KeepAlive implements Handler, InputPipe {
    count: number = 0;
    
    pipe(input: Input): boolean {
        if ( input.input == 'NoIdle') {
            throw "Gag this";
        }
        return true;
    }
    
    handle(event: TimerEvent) {
        this.count = (this.count + 1) % 120;
        if ( this.count == 0) {
            event.client.sendln("@pemit me=NoIdle");
        }
    }
}