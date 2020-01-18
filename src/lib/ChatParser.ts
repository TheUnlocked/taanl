import { InlineMedia } from "@/types/Media";
import { Client } from 'discord.js';
import { VNode } from 'vue';
import RichText from '@/types/RichText';
import Message from '@/types/Message';

export type ChatParseStrategy = {
    regex: RegExp;
    conversion: (...matches: string[]) => InlineMedia | string | Promise<InlineMedia | string>;
}[];

/** https://stackoverflow.com/a/14130005/4937286 */
function htmlEntities(str: string) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function parseMedia(strategy: ChatParseStrategy, message: string): Promise<RichText> {
    let parsedMedia: (string | InlineMedia)[] = [htmlEntities(message)];

    for (const step of strategy) {
        const rebuild: (string | InlineMedia)[] = [];
        for (const media of parsedMedia) {
            if (typeof media === 'string') {
                let buffer = "";
                let finishedIndex = 0;
                for (const match of media.matchAll(step.regex)) {
                    buffer += media.slice(finishedIndex, match.index);
                    
                    const converted = await step.conversion(...match);
                    if (typeof converted === 'string') {
                        buffer += converted;
                    }
                    else {
                        if (buffer !== "") {
                            rebuild.push(buffer);
                            buffer = "";
                        }
                        rebuild.push(converted);
                    }

                    finishedIndex = match.index! + match[0].length;
                }
                buffer += media.slice(finishedIndex);
                if (buffer !== "") {
                    rebuild.push(buffer);
                }
            }
            else {
                rebuild.push(media);
            }
        }
        parsedMedia = rebuild;
    }

    return {
        rawText: message,
        inlineMedia: parsedMedia
    };
}