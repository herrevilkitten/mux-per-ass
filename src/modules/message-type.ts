import {Handler, ConnectEvent, Input, InputPipe} from "../mush-client";

export class MessageType implements InputPipe {
    static PAGE_PATTERN = /.+ pages: (.+)/;
    static SAY_PATTERN = /.+\] .+ \[to MPass\]: (.+)/;

    pipe(input: Input): boolean {
        var match = MessageType.PAGE_PATTERN.exec(input.input);
        if (match) {
            input.data.private = true;
        } else {
            match = MessageType.SAY_PATTERN.exec(input.input)
            if (match) {
                input.data.private = false;
            }
        }
        return true;
    }
}