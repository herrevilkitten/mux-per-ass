
import {Handler, InputEvent} from "../mush-client";

export class DiceRoller implements Handler {
    static DICE_ROLLER_PATTERN = /^roll (.+$)/;
    handle(event: InputEvent) {
        var message = event.input.data.message.toLowerCase(),
            match = DiceRoller.DICE_ROLLER_PATTERN.exec(message);
        if (!match) {
            return;
        }

        var dice = match[1].replace(/\s+/, ''),
            subtractTerms = dice.split('+');

        var total = 0,
            first = true;

        subtractTerms.forEach((terms) => {
            let value = this.calculateTerms(terms);
            total += value;
        });

        event.input.data.respond('Result: ' + total);
    }

    static NUMBER_PATTERN = /^\d+$/;
    static BASIC_DICE_PATTERN = /^(\d+)d(\d+)$/;

    private roll(count: number, sides: number): number {
        var total = 0;
        if (count == 0) {
            return 0;
        }
        if (sides == 1) {
            return count;
        }

        for (var i = 0; i < count; ++i) {
            total += Math.floor(Math.random() * sides) + 1;
        }

        return total;
    }

    private calculateTerm(term: string): number {
        var total = 0,
            match;

        if (DiceRoller.NUMBER_PATTERN.test(term)) {
            total = Number(term);
        } else if ((match = DiceRoller.BASIC_DICE_PATTERN.exec(term))) {
            console.log("rolling " + match[1] + "d" + match[2]);
            total = this.roll(Number(match[1]), Number(match[2]));
        }

        return total;
    }

    private calculateTerms(termString: string): number {
        var terms = termString.split('-'),
            total = 0,
            first = true;
        terms.forEach((term) => {
            let value = this.calculateTerm(term);
            if (first) {
                total = value;
                first = false;
            } else {
                total -= value;
            }
        });
        return total;
    }
}
