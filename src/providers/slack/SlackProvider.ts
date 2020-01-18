import TaanlProvider from '../TaanlProvider';
import Server from '@/types/Server';
import Channel from '@/types/Channel';
import Message from '@/types/Message';
import User from '@/types/User';
import { WebClient } from '@slack/web-api';
import { RTMClient } from '@slack/rtm-api';
import TaanlPostHooks from '../TaanlPostHooks';
import { InherentRole } from '@/types/Role';
import SendMessageContents from '@/types/SendMessageContents';
import { slackParseStrategy } from './SlackChatParser';
import { parseMedia } from '@/lib/ChatParser';

process.version = "";

export default class DiscordProvider implements TaanlProvider {
    name: string = "Slack";
    token: string;
    web!: WebClient;
    rtm!: RTMClient;
    
    private _cachedMessages: Message[] = [];

    constructor(token: string) {
        this.token = token;
    }

    async authorize(postHooks: TaanlPostHooks): Promise<void> {
        this.web = new WebClient(this.token);
        this.rtm = new RTMClient(this.token);
        
        this.rtm.activeTeamId

        this.rtm.on('message', async (message) => {
            const server = await this.getServer(this.rtm.activeTeamId!);
            const convertedMessage: Message = {
                channel: await this.getChannel(server, message.channel),
                contents: await parseMedia(slackParseStrategy(this.web), message.text),
                id: message.ts,
                media: [],
                sender: (await this.getUser(server, message.user))
            };
            this._cachedMessages.push(convertedMessage);
            postHooks.postMessage(convertedMessage);
        });
        await this.rtm.start();
    }

    async close(): Promise<void> {
        await this.rtm.disconnect();
    }
    async getServerIds(): Promise<string[]> {
        return this.rtm.activeTeamId ? [this.rtm.activeTeamId] : [];
    }
    async getServer(id: string): Promise<Server> {
        const teamInfo = (await this.web.team.info() as any).team;
        const self = this;
        return new class extends Server {
            id = teamInfo.id;
            name = teamInfo.name;
            provider = self;
            logo = teamInfo.icon.image_132;
        };
    }
    async getChannelIds(server: Server): Promise<string[]> {
        return (await this.web.conversations.list() as any).channels.map((x: any) => x.id);
    }
    async getChannel(server: Server, id: string): Promise<Channel> {
        const channelInfo = (await this.web.conversations.info({channel: id}) as any).channel;
        return new class extends Channel {
            logo?: string | undefined;
            position?: number | undefined;
            id = id;
            name = channelInfo.name;
            server = server;
        };
    }
    async getUserIds(server: Server): Promise<string[]> {
        return (await this.web.users.list() as any).users.map((x: any) => x.id);
    }
    async getUser(server: Server, id: string): Promise<User> {
        const userInfo = (await this.web.users.info({user: id}) as any).user;
        return {
            bot: userInfo.is_bot,
            displayName: { rawText: userInfo.profile.display_name || userInfo.profile.real_name, simpleEffects: ["bold", {effect: 'color', data: userInfo.color}] },
            id: id,
            inherentRoles: [userInfo.is_bot ? {name: 'bot'} : null, userInfo.is_admin ? {name: 'admin'} : null, userInfo.is_owner ? {name: 'owner'} : null].filter(x => x != null) as InherentRole[],
            name: userInfo.name,
            roles: [],
            avatar: userInfo.profile.image_original,
            tagline: userInfo.profile.status_text
        }
    }
    async getMessage(channel: Channel, id: string): Promise<Message> {
        return this._cachedMessages.find(x => x.id === id)!;
    }
    async getRecentMessages(channel: Channel): Promise<Message[]> {
        const messages = (await this.web.conversations.history({channel: channel.id }) as any).messages as any[];
        // @ts-ignore
        const convertedMessages = await Promise.all(messages.map(async (x: any) => ({
            channel: channel,
            contents: await parseMedia(slackParseStrategy(this.web), x.text),
            id: x.ts,
            media: [],
            sender: await this.getUser(channel.server, x.user)
        } as Message)));
        this._cachedMessages.push(...convertedMessages);
        return convertedMessages;
    }

    sendMessage(channel: Channel, message: SendMessageContents) {
        this.web.chat.postMessage({channel: channel.id, text: message.text});
    }

    async canSendMessage(channel: Channel) {
        return true;
    }
}