import TaanlProvider from './TaanlProvider';
import TaanlPostHooks from './TaanlPostHooks';
import Server from '@/types/Server';
import Channel from '@/types/Channel';
import SendMessageContents from '@/types/SendMessageContents';

export default class TaanlProviderWrapper {
    provider: TaanlProvider;

    constructor(provider: TaanlProvider) {
        this.provider = provider;
    }

    get name() {
        return this.provider.name;
    }

    async authorize(postHooks: TaanlPostHooks) {
        return await this.provider.authorize(postHooks);
    }
    async close() {
        return await this.provider.close();
    }
    async getServerIds(): Promise<string[]> {
        return (await this.provider.getServerIds()).map(x => Server.getPublicId(this, x));
    }
    async getServer(publicId: string) {
        const server = await this.provider.getServer(Server.extractLocalId(publicId));
        server.provider = this;
        return server;
    }
    async getChannelIds(server: Server) {
        return await this.provider.getChannelIds(server);
    }
    async getChannel(server: Server, id: string) {
        return await this.provider.getChannel(server, id);
    }
    async getUserIds(server: Server) {
        return await this.provider.getUserIds(server);
    }
    async getUser(server: Server, id: string) {
        return await this.provider.getUser(server, id);
    }
    async getMessage(channel: Channel, id: string) {
        return await this.provider.getMessage(channel, id);
    }
    async getRecentMessages(channel: Channel) {
        return await this.provider.getRecentMessages(channel);
    }

    sendMessage(channel: Channel, contents: SendMessageContents) {
        this.provider.sendMessage(channel, contents);
    }

    async canSendMessage(channel: Channel) {
        return await this.provider.canSendMessage(channel);
    }
}