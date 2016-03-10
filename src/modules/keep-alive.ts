import {Handler, TimerEvent, Pipe, PipeAction, Input} from "../mush-client";

export class KeepAlive implements Handler, Pipe {
    count: number = 0;

    pipe(input: Input): PipeAction {
        if (input.input == 'NoIdle') {
            return PipeAction.ABORT;
        }
    }

    handle(event: TimerEvent) {
        this.count = (this.count + 1) % 120;
        if (this.count == 0) {
            event.client.sendln("@pemit me=NoIdle");
        }
    }
}