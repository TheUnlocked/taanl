import Message from '@/types/Message';
import Channel from '@/types/Channel';
import Server from '@/types/Server';
import User from '@/types/User';
import TaanlPostHooks from './TaanlPostHooks';
import { ChatParseStrategy } from '@/lib/ChatParser';
import SendMessageContents from '@/types/SendMessageContents';

export default abstract class TaanlProvider {
    abstract name: string;

    abstract authorize(postHooks: TaanlPostHooks): Promise<void>;
    abstract close(): Promise<void>;
    abstract getServerIds(): Promise<string[]>;
    abstract getServer(id: string): Promise<Server>;
    abstract getChannelIds(server: Server): Promise<string[]>;
    abstract getChannel(server: Server, id: string): Promise<Channel>;
    abstract getUserIds(server: Server): Promise<string[]>;
    abstract getUser(server: Server, id: string): Promise<User>;
    abstract getMessage(channel: Channel, id: string): Promise<Message>;
    abstract getRecentMessages(channel: Channel): Promise<Message[]>;

    abstract sendMessage(channel: Channel, contents: SendMessageContents): void;

    abstract canSendMessage(channel: Channel): Promise<boolean>;
}