import Vue from 'vue';
import App from './App.vue';
import DiscordProvider from './providers/discord/DiscordProvider';
import TaanlPostHooks from './providers/TaanlPostHooks';
import AsyncComputed from 'vue-async-computed';
import TaanlProviderWrapper from './providers/TaanlProviderWrapper';
import SlackProvider from './providers/slack/SlackProvider';
import { discordToken, slackTokens } from "./config";
import Message from './types/Message';
import 'highlight.js/styles/railscasts.css';

Vue.config.productionTip = false;

(async () => {

const discordProvider = new TaanlProviderWrapper(new DiscordProvider(discordToken));
const slackProviders = slackTokens.map(token => new TaanlProviderWrapper(new SlackProvider(token)));
const eventHooks = new class extends TaanlPostHooks{
    postMessage(message: Message): void {
        app.$root.$emit('new-message', message);
    }
};
await discordProvider.authorize(eventHooks);
await Promise.all(slackProviders.map(async x => await x.authorize(eventHooks)));

const servers = [
    ...(await Promise.all(slackProviders.map(async slackProvider => await Promise.all((await slackProvider.getServerIds()).map(x => slackProvider.getServer(x)))))).flat(1),
    ...await Promise.all((await discordProvider.getServerIds()).map(x => discordProvider.getServer(x)))
];

Vue.use(AsyncComputed);

const app = new Vue({
    render: h => h(App, {props: {
        servers: servers
    }}),
}).$mount('#app');

})();