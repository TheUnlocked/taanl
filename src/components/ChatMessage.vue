<template>
    <div class="message" :id="message.id" :class="noHeader ? 'no-header' : ''">
        <div class="avatar">
            <div v-if="message.sender.avatar" :style="`background-image:url(${message.sender.avatar})`" />
            <div v-else :style="`background-color:#222222`"/>
        </div>
        <div class="textbox">
            <RichContents class="name" :text="message.sender.displayName" />
            <RichContents class="contents" :text="message.contents" />
        </div>
        <!-- <template v-if="media">
            <component v-for="unit in media" :key="media.indexOf(unit)" :is="unit.type" v-bind="unit.attributes"></component>
        </template> -->
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Message from '../types/Message';
import RichContents from './RichContents.vue';

@Component({
    components: {
        RichContents
    }
})
export default class ChatMessage extends Vue {
    @Prop({required: true, default: {}, type: Object as () => Message})
    message!: Message;
    @Prop({required: true, default: false, type: Boolean})
    noHeader!: boolean;
}
</script>

<style lang="scss">
.message {
    display: flex;
    flex-direction: row;
    text-align: left;

    &.no-header {
        margin-top: 0;
        margin-bottom: 15px;
        .avatar { visibility: hidden; height: 0 }
        .name {display: none; }
    }

    margin: 10px 20px;

    .avatar {
        flex: 0 1 auto;
        margin-right: 15px;

        > div {
            border-radius: 50%;
            width: 45px;
            height: 45px;
            background-size: cover;
        }
    }

    .textbox {
        flex: 1 1 auto;

        .name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .contents {
            white-space: pre-line;
        }
    }
}
</style>