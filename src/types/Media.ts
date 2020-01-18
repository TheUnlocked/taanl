import { VNode } from 'vue/types/umd';

export default interface Media {
    name: string;
    component: {type: string; attributes: object };
}

export interface InlineMedia {
    style?: string;
    image?: string;
    text?: string;
    component?: {type: string; attributes: object } | HTMLElement;
}