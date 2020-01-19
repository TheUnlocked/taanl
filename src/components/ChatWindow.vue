<template>
    <div v-if="channel" id="chat-window">
        <div id="chat-box">
            <ChatMessage v-for="item in preprocess(messages)" :key="item.message.id" :message="item.message" :noHeader="item.noHeader" />
        </div>
        <ChatInputBox v-if="canSendMessage" />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import Message from '../types/Message';
import ChatMessage from './ChatMessage.vue';
import Channel from '@/types/Channel';
import AsyncComputed from 'vue-async-computed-decorator';
import ChatInputBox from './ChatInputBox.vue';
import { parseMedia } from '../lib/ChatParser';
import RichText from '../types/RichText';

@Component({
    components: {
        ChatMessage,
        ChatInputBox
    }
})
export default class ChatWindow extends Vue {
    @Prop({default: undefined, type: Object as () => Channel})
    channel?: Channel;

    @Prop({default: () => [] as Message[]})
    messages!: Message[];

    @Watch('channel')
    onChannelChange() {
        if (!this.channel || (this.messages.length > 0 && this.channel.id === this.messages[0].channel.id)) {
            return;
        }
        this.messages.length = 0;
        this.channel.getRecentMessages().then(msgs => this.messages.push(...msgs.reverse()));
    }

    @AsyncComputed()
    async canSendMessage() {
        if (!this.channel) {
            return false;
        }
        return await this.channel.canSendMessage();
    }

    updated() {
        const chatBoxElt = document.getElementById('chat-box')!;
        chatBoxElt.scrollTop = chatBoxElt.scrollHeight;
    }

    preprocess() {
        return this.messages.map((x, i) => ({
            noHeader: i !== 0 && x.sender.id === this.messages[i-1].sender.id,
            message: x
        }));
    }

    mounted() {
        this.$root.$on('new-message', (m: Message) => this.onMessage(m));
        this.$root.$on('remove-message', (id: string) => this.removeMessage(id));
    }

    onMessage(message: Message) {
        if (this.channel && message.channel.server.publicId === this.channel.server.publicId && message.channel.id === this.channel.id) {
            this.messages.push(message);
        }
    }
    removeMessage(id: string) {
        this.messages = this.messages.filter(x => x.id !== id);
    }
}
</script>

<style lang="scss">
#chat-window {
    width: auto;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    #chat-box {
        overflow: auto;
        // Hide scrollbar
        scrollbar-width: none; // FF
        &::-webkit-scrollbar { width: 0; height: 0; } // Webkit
    }
}
</style>