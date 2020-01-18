import TaanlProvider from '../TaanlProvider';
import Server from '@/types/Server';
import Channel from '@/types/Channel';
import Message from '@/types/Message';
import User from '@/types/User';
import { Client, GuildMember, Guild, Role as DRole, TextChannel, Message as DMessage, User as DUser } from 'discord.js';
import TaanlPostHooks from '../TaanlPostHooks';
import { Role } from '@/types/Role';
import { discordParseStrategy } from './DiscordChatParser';
import { parseMedia } from '@/lib/ChatParser';
import SendMessageContents from '@/types/SendMessageContents';

type DiscordMessage = Message & {__core: DMessage};
type DiscordServer = Server & {__core: Guild};
type DiscordChannel = Channel & {__core: TextChannel};
type DiscordUser = User & {__core: GuildMember};

export default class DiscordProvider implements TaanlProvider {
    name: string = "Discord";
    client: Client;
    token: string;

    constructor(token: string) {
        this.client = new Client({
            sync: true
        });
        this.token = token;
    }

    async authorize(postHooks: TaanlPostHooks): Promise<void> {
        this.client.on('ready', () => {
            
        });
        this.client.on('message', async m => postHooks.postMessage(await this.convertMessage(m)));
        await this.client.login(this.token);
    }

    convertRole(r: DRole): Role {
        return {
            name: r.name,
            color: r.hexColor
        }
    }

    convertUser(u: GuildMember | DUser): User {
        const user = u instanceof GuildMember ? u.user : u;
        return {
            id: u.id,
            name: `${user.username}#${user.discriminator}`,
            displayName: {
                rawText: u instanceof GuildMember ? u.displayName : `${user.username}#${user.discriminator}`,
                simpleEffects: (['bold'] as any[]).concat(u instanceof GuildMember ? [{effect: 'color', data: u.displayHexColor}] : ['italic'])
            },
            bot: user.bot,
            inherentRoles: user.bot ? [{name: 'bot'}] : [],
            roles: u instanceof GuildMember ? u.roles.map(x => this.convertRole(x)) : [],
            avatar: user.displayAvatarURL,
            __core: u
        } as DiscordUser;
    }

    async convertMessage(m: DMessage): Promise<Message> {
        return {
            id: m.id,
            contents: await parseMedia(discordParseStrategy(this.client, m), m.content),
            sender: this.convertUser(m.member ? m.member : m.author),
            channel: this.convertChannel(this.convertServer(this.client.guilds.find(x => x.id === m.guild.id)), m.channel as TextChannel),
            media: [],
            date: new Date(m.createdTimestamp),
            __core: m
        } as DiscordMessage;
    }

    convertChannel(s: Server, c: TextChannel) {
        return new class extends Channel {
            id = c.id;
            name = c.name;
            server = s;
            position = c.calculatedPosition;
            logo = undefined;
            __core = c;
        } as DiscordChannel;
    }

    convertServer(g: Guild) {
        const self = this;
        return new class extends Server {
            id = g.id;
            name = g.name;
            provider = self;
            logo = g.iconURL ? g.iconURL.replace(/.jpg$/, '.webp') : undefined;
            __core = g;
        } as DiscordServer;
    }

    async close(): Promise<void> {
        this.client.destroy();
    }
    async getServerIds(): Promise<string[]> {
        return this.client.guilds.map(x => x.id);
    }
    async getServer(id: string): Promise<Server> {
        const guild = this.client.guilds.find(x => x.id === id);
        return this.convertServer(guild);
    }
    async getChannelIds(server: Server): Promise<string[]> {
        return (server as DiscordServer).__core.channels
            .filter(x => x.type === 'text' &&
                x.permissionsFor(this.client.user)!.has("READ_MESSAGES"))
            .map(x => x.id);
    }
    async getChannel(server: Server, id: string): Promise<Channel> {
        const channel = (server as DiscordServer).__core.channels.find(x => x.id === id) as TextChannel;
        return this.convertChannel(server, channel);
    }
    async getUserIds(server: Server): Promise<string[]> {
        return (server as DiscordServer).__core.members.map(x => x.id);
    }
    async getUser(server: Server, id: string): Promise<User> {
        return this.convertUser((server as DiscordServer).__core.members.find(x => x.id === id));
    }
    async getMessage(channel: Channel, id: string): Promise<Message> {
        return this.convertMessage(await (channel as DiscordChannel).__core.fetchMessage(id));
    }
    async getRecentMessages(channel: Channel): Promise<Message[]> {
        if ((channel as DiscordChannel).__core.permissionsFor(this.client.user)!.has("READ_MESSAGE_HISTORY")) {
            return Promise.all((await (channel as DiscordChannel).__core.fetchMessages({limit: 40})).map(async x => await this.convertMessage(x)));
        }
        else {
            return [];
        }
    }

    sendMessage(channel: Channel, message: SendMessageContents) {
        (channel as DiscordChannel).__core.send(message.text);
    }

    async canSendMessage(channel: Channel) {
        return (channel as DiscordChannel).__core.permissionsFor(this.client.user)!.has("SEND_MESSAGES");
    }
}