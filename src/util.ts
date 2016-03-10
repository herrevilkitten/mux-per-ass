export class MushUtil {
    static MUX_SPECIAL_CHARACTERS = /([%\(\)\[\]])/g;

    static decodeMush(input: string) {

    }

    static encodeMush(output: string): string {
        output = output
            .replace(MushUtil.MUX_SPECIAL_CHARACTERS, '%$1')
            .replace(/\n/g, '%r');
        return output;
    }
}