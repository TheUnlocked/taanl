<template>
    <div id="chat-input">
        <textarea id="chat-textarea" @keypress="onKeypress" />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Channel from '../types/Channel';

@Component({
    components: {
    }
})
export default class ChatInputBox extends Vue {
    onKeypress(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            const channel = this.$parent.$props['channel'] as Channel;
            const textarea = document.querySelector('textarea#chat-textarea') as HTMLTextAreaElement;
            if (textarea.value.trim() !== "") {
                channel.sendMessage({
                    text: textarea.value.trim()
                });
            }
            textarea.value = "";
            e.preventDefault();
        }
    }
}
</script>

<style lang="scss">
#chat-input {
    margin-top: auto;
    align-self: flex-end;
    width: 100%;

    textarea {
        margin: 10px;
        border-radius: 15px;
        padding: 5px 10px;
        min-height: 50px;
        width: stretch;
        height: auto;
        resize: none;
        &:focus {
            outline:0;
        }
        font-size: 12pt;
        font-family: system-ui, sans-serif;
        background-color: #777777;
        color: #f8f8f8;

        overflow: auto;
        // Hide scrollbar
        scrollbar-width: none; // FF
        &::-webkit-scrollbar { width: 0; height: 0; } // Webkit
    }
}
</style>