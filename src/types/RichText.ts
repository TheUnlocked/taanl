import { InlineMedia } from './Media';

export default interface RichText {
    rawText: string;
    simpleEffects?: ('bold' | 'italic' | 'underline' | {effect: 'color', data: string})[];
    inlineMedia?: (string | InlineMedia)[];
}