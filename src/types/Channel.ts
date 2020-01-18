import Server from './Server';
import SendMessageContents from './SendMessageContents';

export default abstract class Channel {
    abstract id: string;
    abstract server: Server;
    abstract name: string;
    abstract logo?: string;
    abstract position?: number;

    async getRecentMessages() {
        return await this.server.provider.getRecentMessages(this);
    }

    sendMessage(message: SendMessageContents) {
        this.server.provider.sendMessage(this, message);
    }

    async canSendMessage() {
        return this.server.provider.canSendMessage(this);
    }
}