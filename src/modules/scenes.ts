import {Handler, InputEvent} from "../mush-client";

export class Scenes implements Handler {
    handle(event: InputEvent) {
        if (event.input.input === '<<Scene Start>>') {
            event.client.scene = true;
        } else if (event.input.input === '<<Scene Stop>>') {
            event.client.scene = false;
        } else if (event.input.input === '<< Scene in progress! Use > to speak OOC and >: to pose OOC. >>') {
            event.client.scene = true;
        }
    }
}
