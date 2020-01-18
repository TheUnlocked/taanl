<template>
    <component :is="inline ? 'span' : 'div'" :class="simpleClasses" :style="simpleStyle">
        <span v-if="!text.inlineMedia">{{text.rawText}}</span>
        <template v-else v-for="media in text.inlineMedia">
            <span :key="text.inlineMedia.indexOf(media)" v-if="typeof media === 'string'" v-html="media"></span>
            <template v-else-if="!('component' in media) && 'text' in media">
                <span :key="text.inlineMedia.indexOf(media)" :style="media.style">{{media.text}}</span>
            </template>
            <component :key="text.inlineMedia.indexOf(media)" v-else-if="'tagName' in media.component" :is="media.component.tagName"
                        v-bind="Object.fromEntries(media.component.getAttributeNames().map(x => [x, media.component.getAttribute(x)]))"
                        v-html="media.component.innerHTML"></component>
            <component :key="text.inlineMedia.indexOf(media)" v-else :is="media.component.type" v-bind="media.component.attributes" />
        </template>
    </component>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Message from '../types/Message';
import RichText from '@/types/RichText';
import EmoteRender from './EmoteRender.vue';

@Component({
    components: {
        EmoteRender
    }
})
export default class RichContents extends Vue {
    @Prop({required: true, default: {}, type: Object as () => RichText})
    text!: RichText;

    @Prop({default: false, type: Boolean})
    inline?: boolean;

    get simpleClasses() {
        return !this.text.simpleEffects ? '' : this.text.simpleEffects
            .filter(x => typeof x === "string")
            .join(' ');
    }

    get simpleStyle() {
        if (!this.text.simpleEffects)
            return "";
        let styles = [];
        for (const effect of this.text.simpleEffects) {
            if (typeof effect !== 'string') {
                switch (effect.effect) {
                    case 'color':
                        styles.push(`color: ${effect.data}`);
                }
            }
        }
        return styles.join(';');
    }
}
</script>

<style lang="scss">
.bold { font-weight: bold }
.italic { font-style: italic }
.underline { text-decoration: underline }
.strikethrough { text-decoration: line-through }
.underline.strikethrough { text-decoration: underline line-through }
.spoiler { color: black; background-color: black }
a { color: #94baff }
</style>