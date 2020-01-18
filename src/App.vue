<template>
    <div id="app">
        <ServerBar :servers="servers" @channelSelected="onChannelSelect" />
        <ChatWindow :channel="data.channel" />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import ChatWindow from './components/ChatWindow.vue';
import ServerBar from './components/ServerBar.vue';
import Server from './types/Server';
import Channel from './types/Channel';

@Component({
    components: {
        ChatWindow,
        ServerBar
    },
})
export default class App extends Vue {
    @Prop()
    servers!: Server[];

    data: {
        channel?: Channel
    } = {};

    onChannelSelect(uniqueServerId: string, channelId: string) {
        (async () => this.$set(this.data, 'channel', await this.servers.find(x => x.publicId === uniqueServerId)!.getChannel(channelId)))();
    }
}
</script>

<style lang="scss">
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #e9e9e9;
    background-color: #3a3a3a;
    position: absolute;
    height: 100%;
    width: 100%;
}
body {
    margin: 0;
}
</style>
