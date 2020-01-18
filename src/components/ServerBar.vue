<template>
    <div id="navigation-bar">
        <div id="server-bar">
            <template v-for="server in servers">
                <div :key="server.publicId" :class="`server-icon ${server.publicId === selectedServerId ? 'selected' : ''}`" @click="selectedServerId = server.publicId">
                    <div v-if="server.logo" class="server-icon-image" :style="`background-image:url(${server.logo})`" />
                    <div v-else class="server-icon-fallback"><span>{{server.name.slice(0,3)}}</span></div>
                </div>
            </template>
        </div>
        <div v-if="channels" id="channel-bar">
            <template v-for="channel in channels">
                <div :key="channel.id" :class="`channel-option ${channel.id === selectedChannelId ? 'selected' : ''}`" @click="selectedChannelId = channel.id">
                    {{channel.name}}
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import Message from '../types/Message';
import ChatMessage from './ChatMessage.vue';
import Server from '@/types/Server';
import AsyncComputed from 'vue-async-computed-decorator';

@Component({
    components: {
        ChatMessage
    }
})
export default class ServerBar extends Vue {
    @Prop()
    servers!: Server[];

    data: {
        selectedServerId?: string,
        selectedChannelId?: string
    } = {};
    
    get selectedServerId() {
        if (!this.data.selectedServerId) {
            this.$set(this.data, 'selectedServerId', this.servers[0].publicId);
        }
        return this.data.selectedServerId!;
    }

    set selectedServerId(val: string) {
        if (val !== this.data.selectedServerId) {
            this.$set(this.data, 'selectedServerId', val);
        }
    }
    
    @AsyncComputed()
    async channels() {
        const targetServer = this.servers.find(x => x.publicId === this.selectedServerId);
        if (targetServer) {
            return (await targetServer.getChannels()).sort((a, b) => a.position! - b.position!);
        }
        return undefined;
    }

    get selectedChannelId() {
        return this.data.selectedChannelId;
    }
    set selectedChannelId(val: string | undefined) {
        if (this.data.selectedChannelId !== val) {
            this.$set(this.data, 'selectedChannelId', val);
            if (val) {
                this.$emit('channelSelected', this.selectedServerId, this.selectedChannelId);
            }
        }
    }
}
</script>

<style lang="scss">
#server-bar {
    float: left;
    padding: 5px 5px 5px 2px;
    height: calc(100vh - 10px);
    background-color: #202020;

    overflow: auto;
    // Hide scrollbar
    scrollbar-width: none; // FF
    &::-webkit-scrollbar { width: 0; height: 0; } // Webkit

    .server-icon {
        margin: 5px;
        width: 50px;
        height: 50px;

        .server-icon-image {
            border-radius: 50%;
            width: 100%;
            height: 100%;
            background-size: cover;
            &.selected { border-radius: 25% }
        }

        .server-icon-fallback {
            display: flex;
            flex-direction: column;
            justify-content: center;
            background-color: #464646;
            border-radius: 50%;
            height: 100%;
            width: 100%;

            span {
                font-size: 15pt;
                margin: auto;
                font-weight: bolder;
                color: #dddddd;
                user-select: none;
            }
        }

        &.selected > div { 
            border-radius: 25%;
            box-shadow: 0px 0px 6px 0px white;
        }
    }
}
#channel-bar {
    float: left;
    width: 200px;
    padding: 5px;
    height: calc(100vh - 10px);
    background-color: #303030;
    text-align: left;

    overflow: auto;
    // Hide scrollbar
    scrollbar-width: none; // FF
    &::-webkit-scrollbar { width: 0; height: 0; } // Webkit

    .channel-option {
        margin: 2px 0;
        padding: 5px 7px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 20px;
        user-select: none;

        &:hover {
            background-color: #3f3f3f;
            border-radius: 5px;
        }

        &.selected {
            background-color: #4e4e4e;
            border-radius: 5px;
        }
    }
}
</style>